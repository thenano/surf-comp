import React from "react";
import Immutable from "immutable";
import { connect } from "react-redux";

import * as EventActions from "../../actions/event";
import * as HeatActions from "../../actions/heat";
import * as SnackbarActions from "../../actions/snackbar";
import { fetch } from "../../decorators";
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
                onMouseOver: () => this.props.onMouseOver(this.props.number),
                onMouseOut: () => this.props.onMouseOut(this.props.number)
            },

            forms.number("", `w8`, {
                disabled: this.props.disabled,
                value: this.props.value || '',
                onChange: (e) => this.props.onChange(e.target.value),
                onBlur: (e) => this.props.onBlur(e.target.value)
            })
        );
    }
}

function waveScore(key, options) {
    let props = Object.assign({}, options, {
        key,
        number: key
    });

    return React.createElement(WaveScore, props);
}

class AthleteScoreRow extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            scores: this.props.scores
        };
    }

    updateScore(waveNumber, value) {
        this.setState({
            scores: this.state.scores.set(waveNumber, value)
        });
    }

    render() {
        let { athlete } = this.props;

        let waves = [];
        for (let i=0; i < 10; i++) {
            waves.push(waveScore(i, {
                value: this.state.scores.get(i),
                onChange: (v) => this.updateScore(i, v.trim()),
                onBlur: (v) => this.props.onBlur(athlete.get("id"), i, v.trim()),
                onMouseOver: this.props.onMouseOver,
                onMouseOut: this.props.onMouseOut
            }));
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
        let waves = [];
        for (var i=0; i < 10; i++) {
            waves.push(waveScore(i, {
                value: "",
                onChange: () => {},
                onBlur: () => {},
                onMouseOver: this.props.onMouseOver,
                onMouseOut: this.props.onMouseOut,
                disabled: true
            }));
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

function athleteScore(athlete, key, options) {
    let props = Object.assign({}, options, {
        key,
        number: key+1,
        position: key,
        athlete
    });

    if (!athlete) {
        return React.createElement(DisabledScoreRow, props);
    } else {
        return React.createElement(AthleteScoreRow, props);
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

        let hoverWave;
        if (this.state.hovered != null) {
            hoverWave = `hover-wave-${this.state.hovered}`
        }

        let waveTitles = [];
        for (let i=0; i < 10; i++) {
            waveTitles.push(
                d.div(
                    {key: i, className: `wave title number-${i}`},
                    `W${i+1}`
                )
            );
        }

        let scoreRows = [];
        for (let i=0; i < 6; i++) {
            let athlete = heat
                .get("athletes", Immutable.List())
                .get(i, null);

            let scores = Immutable.List();
            if (athlete) {
                scores = heat.getIn(["scores", athlete.get("id").toString()], Immutable.List());
            }

            scoreRows.push(athleteScore(
                athlete, i,
                {
                    scores,
                    onMouseOver: this.onMouseOver.bind(this),
                    onMouseOut: this.onMouseOut.bind(this),
                    onBlur: this.props.onBlur.bind(this, heat.get("id"))
                }
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
                        "Rashie"
                    ),
                    waveTitles
                ),

                scoreRows,
            ),

            heat.get("time") ?
                d.i({className: "done fa fa-check"}) :
                d.button(
                    {className: "button flat", onClick: this.props.onClick.bind(this, heat.get("id"))},
                    "Finalise Heat",
                ),

            d.div({className: "clear"})
        );
    }
}

function scoreCard(heat, onBlur, onClick) {
    return React.createElement(ScoreCard, {key: heat.get("id"), heat, onBlur, onClick});
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

        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));

        this.state = {
            event
        };
    }

    saveScore(heat_id, athlete_id, wave, score) {
        this.props.dispatch(HeatActions.addScore(heat_id, athlete_id, wave, parseFloat(score)));
    }

    endHeat(heat_id) {
        let { dispatch } = this.props;
        dispatch(EventActions.endHeat(this.state.event.get("id"), heat_id))
            .then(() => {
                let message = "Heat finished, please check the heat draw to see who has progressed.";
                dispatch(SnackbarActions.message(message));
            });
    }

    render() {
        let allHeats = this.props.heats;
        let northBank = this.state.event.getIn(["schedule", 0]).map((v, i) => v ? [i, allHeats.get(v.toString()).set("bank", "North")] : null),
            southBank = this.state.event.getIn(["schedule", 1]).map((v, i) => v ? [i, allHeats.get(v.toString()).set("bank", "South")] : null);
        // this sort is bad, as ids are not guarantee of the order of the heats
        // specially after schedule manipulation
        let heats = northBank.concat(southBank).sortBy(h => h[0]).map(h => h[1]);

        return d.div(
            {
                id: "scoring"
            },

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    `Scoring: ${this.state.event.get("name")}`
                ),
            ),

            d.div(
                {className: "wrapper"},
                heats.map((heat, k) => {
                    return scoreCard(heat, this.saveScore.bind(this), this.endHeat.bind(this));
                }).valueSeq()
            ),
        );
    }
}
