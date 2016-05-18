import React from "react";
import * as EventActions from "../../../actions/event";
import { fetch } from "../../../decorators";
import { connect } from "react-redux";
import { JERSEYS } from "../../surfing";

var d = React.DOM;

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

class EmptySlot extends React.Component {
    render() {
        let { position } = this.props;
        let jersey = JERSEYS[position];

        return d.li({className: `empty athlete ${jersey}`}, "waiting for athlete");
    }
}

function emptySlot(heat, position) {
    return React.createElement(EmptySlot, {key: position});
}

class AthleteSlot extends React.Component {
    render() {
        let { name, position } = this.props;
        let jersey = JERSEYS[position];

        return d.li(
            {className: `athlete ${jersey}`},
            name,
        );
    }
}

function athleteSlot(heat, position, name) {
    return React.createElement(AthleteSlot, {key: position, heat, position, name});
}

class Heat extends React.Component {
    render() {
        let { heat } = this.props;

        let athletes = [];
        for (var i=0; i < 6; i++) {
            let a = heat.getIn(["athletes", i]);

            if (a) {
                athletes.push(athleteSlot(heat.get("id"), i, a.get("name")));
            } else {
                athletes.push(emptySlot(heat.get("id"), i));
            }
        }

        let division = heat.get("division"),
            round = heat.get("round"),
            number = heat.get("number"),
            startTime = null;
            // startTime = heat.get("start_time") ? new Date(heat.get("start_time")) : undefined;

        let displayTime;
        if (startTime) {
            displayTime = `${zeroPad(startTime.getHours(), 2)}:${zeroPad(startTime.getMinutes(), 2)}`;
        }

        return d.div(
            {className: "heat"},

            d.header(
                {className: `title ${division.toLowerCase()}`},
                `${division} - ${round} - Heat ${number} ${displayTime ? "(" + displayTime + ")" : ""}`
            ),

            d.ol(
                {className: "athletes"},
                athletes
            )
        );
    }
}

function heat(heat) {
    return d.div(
        {className: "heat-list-item"},
        React.createElement(Heat, {heat})
    );
}

@fetch((store, r) => {
    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        return store.dispatch(EventActions.getSchedule(r.params.id));
    }
})
@connect(state => ({ events: state.events }))
export class ShowSchedule extends React.Component {
    renderTime(key, north, south, time) {
        if (north || south) {
            return d.div(
                {key, className: "time-row"},

                d.h3({}, `Scheduled at ${time}`),
                north ? heat(north) : null,
                south ? heat(south) : null,
            );
        } else {
            return d.div(
                {key, className: "time-row"},

                d.h3({}, `Scheduled at ${time}`),
                d.div({className: "break"}, "break")
            );
        }
    }

    render() {
        const { events } = this.props;
        let schedule = events.getIn(["schedules", Number.parseInt(this.props.params.id)]);
        console.log(schedule.toJS());

        let scheduleSize = Math.max(
            schedule.getIn(["schedule","0"]).size,
            schedule.getIn(["schedule","1"]).size
        );

        let timeRows = [];
        let startTime = new Date();
        startTime.setHours(7);
        startTime.setMinutes(0);

        for (var i=0; i < scheduleSize; i++) {
            let north = schedule.getIn(["schedule", "0", "" + i], null),
                south = schedule.getIn(["schedule", "1", "" + i], null);

            let time = `${zeroPad(startTime.getHours(), 2)}:${zeroPad(startTime.getMinutes(), 2)}`;

            startTime.setMinutes(startTime.getMinutes() + 16);

            timeRows.push(
                this.renderTime(
                    i,
                    north ? schedule.getIn(["heats", "" + north]) : null,
                    south ? schedule.getIn(["heats", "" + south]) : null,
                    time
                )
            );
        }

        return d.div(
            {id: "show-event-schedule"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Schedule"
                ),
            ),

            d.div(
                {className: "wrapper heat-wrapper"},
                timeRows
            )
        );
    }
}
