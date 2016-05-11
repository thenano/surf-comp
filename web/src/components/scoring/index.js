import React from "react";
import * as EventActions from "../../actions/event";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import { number } from "../forms";

var d = React.DOM;

const JERSEYS = [
    "red", "white", "yellow", "blue", "green", "pink"
];

class WaveScore extends React.Component {
    render() {
        return d.div(
            {className: `wave ${this.props.odd ? "odd" : "even"}`},

            number("", `w8`, {})
        );
    }
}

function waveScore(key) {
    return React.createElement(WaveScore, {key, odd: key%2==0});
}

class AthleteScoreRow extends React.Component {
    render() {
        let { athlete } = this.props;

        let waves = []
        for (var i=0; i < 10; i++) {
            waves.push(waveScore(i));
        }

        let jersey = JERSEYS[this.props.position];

        return d.div(
            {className: "score-row"},
            d.div(
                {className: `jersey ${jersey}`},
            ),

            waves,
        )
    }
}

function athleteScore(athlete, position) {
    return React.createElement(AthleteScoreRow, {key: athlete.get("name"), athlete, position})
}

class ScoreCard extends React.Component {
    render() {
        let { heat } = this.props;

        let waveTitles = []
        for (var i=0; i < 10; i++) {
            waveTitles.push(
                d.div(
                    {key: i, className: "wave title"},
                    `W${i+1}`
                )
            );
        }

        return d.div(
            {className: "card"},

            d.header(
                {className: `${heat.get("division").toLowerCase()}`},
                // TODO - don't hardcode the bank
                `${heat.get("division")} : Heat ${heat.get("number")} : ${heat.get("round")} (South Bank)`
            ),

            d.section(
                {className: "score-table"},

                d.div(
                    {className: "title score-row"},
                    d.div(
                        {className: "jersey"},
                        "Jersey"
                    ),
                    waveTitles
                ),

                heat.get("athletes").map((a, i) => athleteScore(a, i))
            ),
        );
    }
}

function scoreCard(heat) {
    return React.createElement(ScoreCard, {heat});
}

@fetch((store, r) => {
    let resources = [];

    if (!store.loaded(`events.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.get(r.params.id))
        );
    }

    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.getSchedule(r.params.id))
        );
    }

    if (resources.length > 0) {
        return Promise.all(resources);
    }
})
@connect((state, props) => ({
    events: state.events,
    heats: state.events.getIn(["schedules", parseInt(props.params.id), "heats"])
}))
export class Scoring extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
    }

    render() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));
        let heats = events.getIn(["schedules", parseInt(this.props.params.id), "heats"]);

        return d.div(
            {id: "scoring"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    `Scoring: ${event.get("name")}`
                ),
            ),

            d.div(
                {className: "wrapper"},
                scoreCard(heats.get("3"))
            )
        );
    }
}
