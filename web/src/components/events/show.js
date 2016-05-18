/* global Pusher */

import React from "react";
import Immutable from "immutable";
import * as HeatActions from "../../actions/heat";
import * as EventActions from "../../actions/event";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import { link } from "../navigation";
import { HeatResults } from "./results/card";
import { Spinner } from "../spinner";

var d = React.DOM;

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

@fetch((store, r) => {
    let resources = [];

    if (!store.loaded(`events.${r.params.id}`)) {
        resources.push(
            store
                .dispatch(EventActions.get(r.params.id))
        );
    }

    if (!store.loaded(`events.current_heats.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.getCurrentHeats(r.params.id))
        );
    }

    return Promise.all(resources);
})
@connect((state, props) => ({
    events: state.events,
    heats: state.events.getIn(["current_heats", parseInt(props.params.id)])
}))
export class ShowEvent extends React.Component {
    constructor(props, context) {
        super(props, context);

        let pusher = new Pusher("9228f4893a65786c6b33", {
            encrypted: true,
            authEndpoint: "/api/pubsubauth"
        });

        let channel = pusher.subscribe(`presence-${this.props.params.id}`);
        channel.bind("pusher:subscription_succeeded", this.connected.bind(this));
        channel.bind("pusher:subscription_error", this.disconnected.bind(this));
        channel.bind("pusher:member_added", this.judgeConnected.bind(this));
        channel.bind("pusher:member_removed", this.judgeDisconnected.bind(this));

        let scoresChannel = pusher.subscribe(`scores-${this.props.params.id}`);
        // scoresChannel.bind("pusher:subscription_succeeded", this.connected.bind(this));
        // scoresChannel.bind("pusher:subscription_error", this.disconnected.bind(this));
        scoresChannel.bind("score-changed", this.scoreReceived.bind(this));

        this.state = {
            pusher, channel,
            scores: scoresChannel,
            liveScores: Immutable.Map(),
            connected: false
        };
    }

    componentWillUnmount() {
        this.state.pusher.disconnect();
    }

    judgeConnected() {
        this.setState({
            judges: this.state.judges + 1
        });
    }

    judgeDisconnected() {
        this.setState({
            judges: this.state.judges - 1
        });
    }

    disconnected() {
        this.setState({
            judges: 0,
            connected: false
        });
    }

    connected(judges) {
        this.setState({
            judges: Object.keys(judges.members || {}).length-1,
            connected: true
        });
    }

    renderDivision(division) {
        let event_id = Number.parseInt(this.props.params.id);

        return d.div(
            {key: division.get("name"), className: `division division-${division.get("name").toLowerCase()}`},

            link(d.span({className: "division-count"}, `${division.get("athletes")} ${division.get("name")}`), {to: `/events/${event_id}/division/${division.get("id")}/edit`}),
            link(d.i({className: "fa fa-pencil"}), {to: `/events/${event_id}/division/${division.get("id")}/edit`})
        );
    }

    renderParticipants() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id)),
            divisions = event.get("divisions"),
            total = divisions.reduce((r, division) => r + division.get("athletes"), 0);

        return d.div(
            {className: "event-participants"},

            d.h2({}, d.i({className: "fa fa-group"}), `${total} Surfers`),

            divisions.map(this.renderDivision.bind(this)).valueSeq()
        );
    }

    renderSchedule() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id)),
            schedule = event.get("schedule"),
            heats = Math.max(schedule.get(0).size, schedule.get(1).size),
            hours = Math.floor(heats * 16 / 60) + 7,
            mins = (heats * 16) % 60;

        const months = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun",
            "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"
        ];

        let date = new Date(event.get("date"));

        return d.div(
            {className: "event-schedule"},

            d.h2({}, d.i({className: "fa fa-calendar"}), "Schedule"),

            d.div(
                {},
                d.span({className: "time"}, "Start"),
                d.span({className: "time"}, d.i({className: "fa fa-clock-o"}), "07:00")
            ),

            d.div(
                {},
                d.span({className: "time"}, "End"),
                d.span({className: "time"}, d.i({className: "fa fa-clock-o"}), `${zeroPad(hours, 2)}:${zeroPad(mins, 2)} (estimated)`)
            ),

            d.div(
                {},
                d.span({className: "time"}, "Date"),
                d.span({className: "time"}, d.i({className: "fa fa-calendar"}), `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`)
            ),

            d.div(
                {className: "edit schedule"},
                link("edit", {to: `/events/${event.get("id")}/schedule/edit`}),
                " - ",
                link("view", {to: `/events/${event.get("id")}/schedule`})
            )
        );
    }

    startHeats() {
        let { dispatch, params } = this.props;

        this.setState({
            starting: true
        });
        dispatch(EventActions.startHeats(params.id)).then(() => {
            this.setState({
                starting: false
            });
        });
    }

    endHeats() {
        let {dispatch, params} = this.props;

        this.setState({
            ending: true
        });
        dispatch(EventActions.endHeats(params.id)).then(() => {
            this.setState({
                ending: false
            });
        });
    }

    scoreReceived(m) {
        let heat = Immutable.fromJS(m.message);
        this.setState({
            liveScores: this.state.liveScores.set(heat.get("id"), heat.get("result"))
        });
    }

    renderLiveHeats(message, heats) {
        return d.div(
            {className: "event-next-heat"},

            d.h2(
                {className: "next-heat"},
                d.i({className: "fa fa-fire"}),
                message
            ),

            d.div(
                {},
                d.span({className: "time"}, "Scheduled Start"),
                // todo - replace with a real time
                d.span({className: "time"}, d.i({className: "fa fa-clock-o"}), "07:00")
            ),

            d.div(
                {},
                d.span({className: "time"}, "Connected Judges"),
                d.span({className: "time"}, d.i({className: "fa fa-group"}), this.state.judges)
            ),

            heats
        )
    }

    renderActiveHeats() {
        let { heats } = this.props;

        let renderedScores = heats.map((heat, i) => {
            if (heat == null) {
                return null;
            }

            let liveScores = this.state.liveScores.get(heat.get("id"), heat.get("result"));

            return d.div(
                {key: i, className: "scores"},

                d.header(
                    {className: `heat-header ${heat.get("division").toLowerCase()}`},
                    `${heat.get("division")} : ${heat.get("round")} : Heat ${heat.get("number")} (${i == 0 ? "North" : "South"} Bank)`
                ),

                React.createElement(
                    HeatResults,
                    {heat: heat.set("result", liveScores)}
                )
            );
        }).filter(h => h != null);

        let heatStarted = () => (heats.getIn([0, 'start_time']) || heats.getIn([1, 'start_time']));

        return this.renderLiveHeats(heatStarted() ? "Live Heat" : "Next Heat", d.div({},

            renderedScores,

            d.div({className: 'start-action'},
                d.button(
                    {
                        className: `button secondary submit ${(this.state.starting || heatStarted()) ? 'disabled':''}`,
                        onClick: this.startHeats.bind(this),
                        disabled: (this.state.starting || heatStarted())
                    },
                    "Start Heat"
                ),

                React.createElement(Spinner, {
                    style: {
                        display: this.state.starting ? "inline-block" : "none"
                    }
                }),
            ),

            heatStarted() ?
                d.div({className: 'end-action'},
                    React.createElement(Spinner, {
                        style: {
                            display: this.state.ending ? "inline-block" : "none"
                        }
                    }),
                    d.button(
                        {
                            className: `button submit ${this.state.ending ? 'disabled':''}`,
                            onClick: this.endHeats.bind(this),
                            disabled: this.state.ending
                        },
                        "End Heat"
                    ),
                ) : null,

            d.div({className: "clear"})
        ));
    }

    render() {
        const { events } = this.props;
        const { heats } = this.props;

        let event = events.get(Number.parseInt(this.props.params.id));

        return d.div(
            {id: "show-event"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    event.get("name")
                ),
            ),


            d.div(
                {className: "wrapper"},
                this.renderParticipants(),
                d.hr({}),
                this.renderSchedule(),
                d.hr({}),
                (heats.first() || heats.last()) ?
                    this.renderActiveHeats() : this.renderLiveHeats("Event Finished")
            )
        );
    }
}
