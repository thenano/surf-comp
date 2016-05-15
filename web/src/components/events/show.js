import React from "react";
import Immutable from "immutable";
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
    if (!store.loaded(`events.${r.params.id}`)) {
        return store
            .dispatch(EventActions.get(r.params.id));
    }
})
@connect(state => ({events: state.events}))
export class ShowEvent extends React.Component {
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
        let { active } = this.props;
        let heat = Immutable.fromJS({
            started_at: new Date(),
            athletes: [
                {name: "Sam Gibson", uid: "10102339466916613"},
                {name: "Fernando Friere", uid: "10102339466916613"},
                {name: "Chris Friend", uid: "10102339466916613"}
            ],
            division: "Groms",
            round: "Round 1",
            number: "3"
        });

        let renderedScores;
        if (active) {
            renderedScores = d.div(
                {className: "event-active-heat"},

                d.h2(
                    {},
                    d.i({className: "fa fa-fire"}),
                )
            );
        } else {
            renderedScores = d.div(
                {className: "scores"},
                React.createElement(
                    HeatResults,
                    {heat, places: false}
                )
            );
        }

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
                d.span({className: "time"}, d.i({className: "fa fa-group"}), "0")
            ),

            renderedScores,

            active ?
                null :
                d.button(
                    {className: "start button"},
                    "Start Heat"
                ),

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
