import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import * as forms from "../forms";

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

            forms.number("", `w8`, {disabled: this.props.disabled})
        );
    }
}

function waveScore(key, mouseOver, mouseOut, disabled) {
    return React.createElement(WaveScore, {key, number: key+1, mouseOver, mouseOut, disabled});
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

class DisabledScoreRow extends React.Component {
    render() {
        let waves = []
        for (var i=0; i < 10; i++) {
            waves.push(waveScore(i, this.props.mouseOverWave, this.props.mouseOutWave, true));
        }

        let jersey = JERSEYS[this.props.position];

        return d.div(
            {className: `disabled score-row ${jersey}`},
            d.div(
                {className: `jersey ${jersey}`},
            ),

            waves,
        )
    }
}

function athleteScore(athlete, position, mouseOverWave, mouseOutWave) {
    if (!athlete) {
        return React.createElement(DisabledScoreRow, {key: position, position, mouseOverWave, mouseOutWave}, mouseOverWave, mouseOutWave);
    } else {
        return React.createElement(AthleteScoreRow, {key: position, athlete, position, mouseOverWave, mouseOutWave,})
    }
}

class ScoreCard extends React.Component {
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
        let { heat } = this.props;

        let hoverWave
        if (this.state.hovered != null) {
            hoverWave = `hover-wave-${this.state.hovered}`
        }

        let waveTitles = []
        for (var i=0; i < 10; i++) {
            waveTitles.push(
                d.div(
                    {key: i, className: `wave title number-${i+1}`},
                    `W${i+1}`
                )
            );
        }

        let scoreRows = [];
        for (var i=0; i < 6; i++) {
            let athlete = heat
                .get("athletes", Immutable.List())
                .get(i, null);

            scoreRows.push(athleteScore(
                athlete,
                i,
                this.onMouseOver.bind(this),
                this.onMouseOut.bind(this)
            ));
        }

        return d.div(
            {className: `card ${hoverWave ? hoverWave : ""}`},

            d.header(
                {className: `${heat.get("division").toLowerCase()}`},
                `${heat.get("division")} : ${heat.get("round")} : Heat ${heat.get("number")} (${heat.get("bank")} Bank)`
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

                scoreRows,
            ),

            d.button(
                {className: "button flat"},
                "Finalise Heat",
            ),

            d.div({className: "clear"})
        );
    }
}

function scoreCard(heat) {
    return React.createElement(ScoreCard, {key: heat.get("id"), heat});
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
    render() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));
        let allHeats = this.props.heats;
        let northBank = event.getIn(["schedule", 0]).map((v, i) => [i, allHeats.get(v.toString()).set("bank", "North")]),
            southBank = event.getIn(["schedule", 1]).map((v, i) => [i, allHeats.get(v.toString()).set("bank", "South")]);
        let heats = northBank.concat(southBank).sortBy(h => h[0]).map(h => h[1]);

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
                {className: "wrapper"},
                heats.map((heat, k) => {
                    return scoreCard(heat)
                }).valueSeq()
            ),
        );
    }
}
