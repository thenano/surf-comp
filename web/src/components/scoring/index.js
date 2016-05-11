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
            {
                className: `wave number-${this.props.number}`,
                onMouseOver: () => this.props.mouseOver(this.props.number),
                onMouseOut: () => this.props.mouseOut(this.props.number),
            },

            number("", `w8`, {})
        );
    }
}

function waveScore(key, mouseOver, mouseOut) {
    return React.createElement(WaveScore, {key, number: key+1, mouseOver, mouseOut});
}

class AthleteScoreRow extends React.Component {
    render() {
        let { athlete } = this.props;

        let waves = []
        for (var i=0; i < 10; i++) {
            waves.push(waveScore(i, this.props.mouseOverWave, this.props.mouseOutWave));
        }

        let jersey = JERSEYS[this.props.position];

        return d.div(
            {className: `score-row ${jersey}`},
            d.div(
                {className: `jersey ${jersey}`},
            ),

            waves,
        )
    }
}

function athleteScore(athlete, position, mouseOverWave, mouseOutWave) {
    return React.createElement(AthleteScoreRow, {key: athlete.get("name"), athlete, position, mouseOverWave, mouseOutWave,})
}

class ScoreCard extends React.Component {
    render() {
        let { heat } = this.props;

        let waveTitles = []
        for (var i=0; i < 10; i++) {
            waveTitles.push(
                d.div(
                    {key: i, className: `wave title number-${i+1}`},
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
                    {className: "title-row"},
                    d.div(
                        {className: "jersey"},
                        "Jersey"
                    ),
                    waveTitles
                ),

                heat.get("athletes").map((a, i) => athleteScore(a, i, this.props.mouseOverWave, this.props.mouseOutWave))
            ),
        );
    }
}

function scoreCard(heat, mouseOverWave, mouseOutWave) {
    return React.createElement(ScoreCard, {heat, mouseOverWave, mouseOutWave});
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

    onMouseOver(wave) {
        this.setState({
            hovered: wave
        });
    }

    onMouseOut() {
        this.setState({
            hovered: null
        });
    }

    render() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));
        let heats = events.getIn(["schedules", parseInt(this.props.params.id), "heats"]);

        let hoverWave
        if (this.state.hovered != null) {
            hoverWave = `hover-wave-${this.state.hovered}`
        }

        return d.div(
            {
                id: "scoring",
            },

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    `Scoring: ${event.get("name")}`
                ),
            ),

            d.div(
                {className: `wrapper ${hoverWave ? hoverWave : ""}`},
                scoreCard(heats.get("3"), this.onMouseOver.bind(this), this.onMouseOut.bind(this))
            )
        );
    }
}
