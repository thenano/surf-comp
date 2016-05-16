import React from "react";
import Immutable from "immutable";
import * as HeatActions from "../../actions/heat";
import * as EventActions from "../../actions/event";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import { link } from "../navigation";
import { HeatResults } from "./results/card";

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

    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.getSchedule(r.params.id))
        );
    }

    return Promise.all(resources);
})
@connect(state => ({
    events: state.events,
    heats: state.heats
}))
export class ShowEvent extends React.Component {
    constructor(props, context) {
        super(props, context);

        // todo change to current
        let { events, dispatch } = this.props;
        let heat = events.getIn(["schedules", parseInt(this.props.params.id), "heats"]).first();

        dispatch(HeatActions.getResult(heat.get("id")));

        let pusher = new Pusher("9228f4893a65786c6b33", {
            encrypted: true,
            authEndpoint: "/api/pubsubauth"
        });

        let channel = pusher.subscribe(`presence-${this.props.params.id}`);
        channel.bind("pusher:subscription_succeeded", this.connected.bind(this));
        channel.bind("pusher:subscription_error", this.disconnected.bind(this));
        channel.bind("pusher:member_added", this.judgeConnected.bind(this));
        channel.bind("pusher:member_removed", this.judgeDisconnected.bind(this));

        this.state = {
            channel: channel,
            connected: false
        };
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
            judges: Object.keys(judges.members).length-1,
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
                link("edit", {to: `/events/${event.get("id")}/schedule/edit`})
            )
        );
    }

    renderActiveHeat() {
        let { heats, events } = this.props;
        let heatID = events.getIn(["schedules", parseInt(this.props.params.id), "heats"]).first().get("id");
        let heat = heats.get(heatID);
        if (!heat) {
            return null;
        }

        let renderedScores = d.div(
            {className: "scores"},
            React.createElement(
                HeatResults,
                {heat}
            )
        );

        return d.div(
            {className: "event-next-heat"},

            d.h2(
                {className: "next-heat"},
                d.i({className: "fa fa-fire"}),
                "Next Heat",
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

            renderedScores,

            // active ?
            //     null :
            //     d.button(
            //         {className: "start button"},
            //         "Start Heat"
            //     ),

            d.div({className: "clear"})
        );
    }

    render() {
        const { events } = this.props;
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
                this.renderActiveHeat(),
            )
        );
    }
}
