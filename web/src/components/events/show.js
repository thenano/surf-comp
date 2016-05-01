import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import { link } from "../navigation"

var d = React.DOM;

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

@fetch((store, r) => {
    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        return store
            .dispatch(EventActions.getSchedule(r.params.id));
    }
})
@connect(state => ({
    events: state.events
}))
export class ShowEvent extends React.Component {
    renderDivision(count, name) {
        const { events } = this.props;
        let event = events.getIn(["schedules", Number.parseInt(this.props.params.id)]);

        return d.div(
            {key: name, className: `division division-${name.toLowerCase()}`},

            link(d.span({className: "division-count"}, `${count} ${name}`), {to: `/events/${event.get("id")}/divisions/${name.toLowerCase()}/edit`}),
            link(d.i({className: "fa fa-pencil"}), {to: `/events/${event.get("id")}/divisions/${name.toLowerCase()}/edit`})
        );
    }

    renderParticipants() {
        const { events } = this.props;
        let event = events.getIn(["schedules", Number.parseInt(this.props.params.id)]),
            heats = event.get("heats"),
            divisions = heats.reduce((m, v) => {
                let div = v.get("division");
                return m.set(div, m.get(div, 0) + v.get("users").size);
            }, new Immutable.Map()),
            total = divisions.reduce((m, v) => {
                return v + m;
            }, 0);


        return d.div(
            {className: "event-participants"},

            d.h2({}, d.i({className: "fa fa-group"}), `${total} Surfers`),

            divisions.map(this.renderDivision.bind(this)).valueSeq()
        );
    }

    renderSchedule() {
        const { events } = this.props;
        let event = events.getIn(["schedules", Number.parseInt(this.props.params.id)]),
            schedule = event.get("schedule"),
            heats = Math.max(schedule.get(0).size, schedule.get(1).size),
            hours = Math.floor(heats * 16 / 60) + 7,
            mins = (heats * 16) % 60;

        return d.div(
            {className: "event-schedule"},

            d.h2({}, d.i({className: "fa fa-calendar"}), "Schedule"),

            d.div(
                {},
                d.span({className: "time"}, "Start"),
                d.span({className: "time"}, "07:00")
            ),

            d.div(
                {},
                d.span({className: "time"}, "End"),
                d.span({className: "time"}, `${zeroPad(hours, 2)}:${zeroPad(mins, 2)}`)
            ),

            d.div(
                {},
                d.span({className: "time"}, "Date"),
                d.span({className: "time"}, `${event.get("date")}`)
            ),

            d.div(
                {className: "edit schedule"},
                link("edit", {to: `/events/${event.get("id")}/schedule/edit`})
            )
        );
    }

    renderScoring() {
        return d.div(
            {className: "event-scoring"},

            d.h2({}, d.i({className: "fa fa-tachometer"}), "Scoring"),
        );
    }

    render() {
        const { events } = this.props;
        let event = events.getIn(["schedules", Number.parseInt(this.props.params.id)]);

        return d.div(
            {id: "show-event", className: "wrapper"},

            d.h1({}, event.get("name")),

            this.renderParticipants(),

            d.hr({}),

            this.renderSchedule(),

            d.hr({}),

            this.renderScoring(),
        );
    }
}
