/* global Pusher */

import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import { fetch, liveScores } from "../../decorators";
import { connect } from "react-redux";
import { HeatResults } from "./results/card";
import { JERSEYS } from "../surfing";

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

class TinyHeat extends React.Component {
    render() {
        let { heat } = this.props;

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
                heat.get("athletes", Immutable.Map()).valueSeq().map((a, i) => {
                    return athleteSlot(heat.get("id"), i, a.get("name"));
                })
            )
        );
    }
}

function heat(heat) {
    return d.div(
        {className: "heat-list-item"},
        React.createElement(TinyHeat, {heat})
    );
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

    if (!store.loaded(`events.upcoming_heats.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.getUpcomingHeats(r.params.id))
        );
    }

    return Promise.all(resources);
})
@liveScores()
@connect((state, props) => ({
    events: state.events,
    upcomingHeats: state.events.getIn(["upcoming_heats", parseInt(props.params.id)]),
    heats: state.events.getIn(["current_heats", parseInt(props.params.id)])
}))
export class Spectate extends React.Component {
    renderNextHeats() {
        let { upcomingHeats } = this.props;
        let bank1 = upcomingHeats.first(),
            bank2 = upcomingHeats.last();

        let heats = [];
        let key = 0;
        for (var i=0; i < Math.max(bank1.size, bank2.size); i++) {
            if (bank1.get(i)) {
                heats.push(
                    d.div({key: key++}, heat(bank1.get(i)))
                );
            }

            if (bank2.get(i)) {
                heats.push(
                    d.div({key: key++}, heat(bank2.get(i)))
                );
            }
        }

        return heats;
        // let { heats } = this.props;
        // heats = heats.shift();

        // return heats.map((h, i) => {
        //     console.log(h);
        //     return null;
        //     // return d.div({key: i}, heat(h))
        // })
    }

    renderActiveHeats() {
        let { heats } = this.props;

        let renderedScores = heats.map((heat, i) => {
            if (heat == null) {
                return null;
            }

            let liveScores = this.props.liveScores.get(heat.get("id"), heat.get("result"));

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

        return d.div(
            {className: "live-heat"},
            renderedScores
        );
    }


    render() {
        const { events } = this.props;
        const { heats } = this.props;

        let event = events.get(Number.parseInt(this.props.params.id));

        return d.div(
            {id: "spectate", className: "heat-wrapper"},

            d.div(
                {className: "display"},
                d.div(
                    {className: "active-heats"},
                    d.h2({}, "Live"),
                    this.renderActiveHeats()
                ),
                d.div(
                    {className: "upcoming-heats"},
                    d.h2({}, "Upcoming"),
                    this.renderNextHeats(),
                )
            )
        );
    }
}
