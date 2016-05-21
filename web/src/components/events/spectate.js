/* global Pusher */

import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import { fetch, liveScores } from "../../decorators";
import { connect } from "react-redux";
import { HeatResults, TinyHeatResults } from "./results/card";
import { JERSEYS } from "../surfing";
import { Spinner } from "../spinner"

class LoadingOverlay extends React.Component {
    render() {
        return d.div(
            {className: "loading"},

            d.div(
                {className: "content"},
                d.div({className: "message"}, this.props.message),
                React.createElement(Spinner, {})
            )
        );
    }
}

const Easing = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

var d = React.DOM;

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
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
            startTime = new Date(heat.get("start_time"));

        let displayTime;
        if (startTime) {
            displayTime = `${zeroPad(startTime.getHours(), 2)}:${zeroPad(startTime.getMinutes(), 2)}`;
        }

        return d.div(
            {className: "heat"},

            d.header(
                {className: `title ${division.toLowerCase()}`},
                d.div({}, `${division} : ${round} : Heat ${number}`),
                d.div(
                    {className: "heat-time"},
                    d.i({className: "fa fa-clock-o"}),
                    displayTime
                )
            ),

            d.ol(
                {className: "athletes"},
                heat.get("athletes", Immutable.Map()).valueSeq().map((a, i) => {
                    return athleteSlot(heat.get("id"), a.get("position"), a.get("name"));
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

class ResultsMarquee extends React.Component {
    renderLastHeatsScores() {
        let { previousHeats } = this.props;

        return d.div(
            {className: "last-heat-score"},

            d.div(
                {className: "last-heat-results"},

                previousHeats.map(bank => {
                    return bank.map((h, i) => {
                        return d.div(
                            {className: "heat-scroll-point"},
                            React.createElement(
                                TinyHeatResults,
                                {key: i, heat: h}
                            )
                        );
                    });
                })
            )
        );
    }

    componentDidUpdate() {
        let start = this.refs.marquee.scrollTop;
        let points = this.refs.marquee.querySelectorAll(".heat-scroll-point");
        let next = points[this.props.active];

        if (!next) {
            return;
        }

        let top = next.offsetTop;
        let distance = Math.abs(top - start);
        let i = 0;
        let duration = 1000;
        let t = setInterval(() => {
            if (start > top) {
                let d = Easing.easeOutCubic(i / duration);
                this.refs.marquee.scrollTop = start - distance * d
            } else {
                let d = Easing.easeOutCubic(i / duration);
                this.refs.marquee.scrollTop = start + distance * d
            }

            i += 10;
            if (i > duration) {
                this.refs.marquee.scrollTop = top;
                clearInterval(t);
            }
        }, 10);
    }

    render() {
        return d.div(
            {ref: "marquee", className: "previous-heats marquee"},
            this.renderLastHeatsScores(),
        );
    }
}

class HeatMarquee extends React.Component {
    renderNextHeats() {
        let { upcomingHeats } = this.props;
        let bank1 = upcomingHeats.first(),
            bank2 = upcomingHeats.last();

        let heats = [];
        let key = 0;
        for (var i=0; i < Math.max(bank1.size, bank2.size); i++) {
            if (bank1.get(i)) {
                heats.push(
                    d.div({className: "heat-scroll-point", key: key++}, heat(bank1.get(i)))
                );
            }

            if (bank2.get(i)) {
                heats.push(
                    d.div({className: "heat-scroll-point", key: key++}, heat(bank2.get(i)))
                );
            }
        }

        return heats;
    }

    componentDidUpdate() {
        let start = this.refs.marquee.scrollTop;
        let points = this.refs.marquee.querySelectorAll(".heat-scroll-point");
        let next = points[this.props.active];

        if (!next) {
            return;
        }

        let top = next.offsetTop;
        let distance = Math.abs(top - start);
        let i = 0;
        let duration = 1000;
        let t = setInterval(() => {
            if (start > top) {
                let d = Easing.easeOutCubic(i / duration);
                this.refs.marquee.scrollTop = start - distance * d
            } else {
                let d = Easing.easeOutCubic(i / duration);
                this.refs.marquee.scrollTop = start + distance * d
            }

            i += 10;
            if (i > duration) {
                this.refs.marquee.scrollTop = top;
                clearInterval(t);
            }
        }, 10);
    }

    render() {
        return d.div(
            {ref: "marquee", className: "upcoming-heats marquee"},
            this.renderNextHeats(),
        );
    }
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

    if (!store.loaded(`events.previous_heats.${r.params.id}`)) {
        resources.push(
            store.dispatch(EventActions.getPreviousHeats(r.params.id))
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
    previousHeats: state.events.getIn(["previous_heats", parseInt(props.params.id)]),
    heats: state.events.getIn(["current_heats", parseInt(props.params.id)])
}))
export class Spectate extends React.Component {
    constructor(props, context) {
        super(props, context);

        let heatCount = props.upcomingHeats.get(0).size + props.upcomingHeats.get(1).size,
            resultCount = props.previousHeats.get(0).size + props.previousHeats.get(1).size;

        this.state = { top: 0, resultTop: 0 };
        setInterval(() => {
            this.setState({
                top: (this.state.top + 1) % heatCount,
                resultTop: (this.state.resultTop + 1) % resultCount
            });
        }, 5000);

        this.props.scores.bind("heats-started", this.heatsStarted.bind(this));
        this.props.scores.bind("heats-finished", this.heatsFinished.bind(this));
    }

    heatsStarted() {
        let { dispatch } = this.props;
        let event_id = this.props.params.id;

        dispatch(EventActions.getCurrentHeats(event_id));
        dispatch(EventActions.getUpcomingHeats(event_id));
    }

    heatsFinished() {
        let { dispatch } = this.props;
        let event_id = this.props.params.id;

        dispatch(EventActions.getCurrentHeats(event_id));
    }

    renderActiveHeats() {
        let { heats } = this.props;

        if (heats.get(0) && heats.get(0).get("start_time")) {
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
                        {heat: heat.set("result", liveScores), places: true}
                    )
                );
            }).filter(h => h != null);

            let heatStarted = () => (heats.getIn([0, 'start_time']) || heats.getIn([1, 'start_time']));

            return d.div(
                {className: "live-heat"},
                renderedScores
            );
        } else {
            return React.createElement(
                LoadingOverlay,
                {key: "connecting", message: "Waiting for heat to start..."}
            );
        }
    }

    render() {
        const { events } = this.props;
        const { heats } = this.props;

        let event = events.get(Number.parseInt(this.props.params.id));

        return d.div(
            {id: "spectate", className: "heat-wrapper"},

            d.div(
                {className: "display header"},
                d.h2({className: "active-heats"}, "Live"),
                d.h2({className: "previous-heats"}, "Results"),
                d.h2({className: "upcoming-heats"}, "Upcoming")
            ),

            d.div(
                {className: "display main"},
                d.div(
                    {className: "active-heats"},
                    this.renderActiveHeats(),
                ),
                d.div(
                    {className: "previous-heats"},
                    React.createElement(
                        ResultsMarquee,
                        {
                            active: this.state.resultTop,
                            previousHeats: this.props.previousHeats
                        }
                    )
                ),
                React.createElement(
                    HeatMarquee,
                    {
                        active: this.state.top,
                        upcomingHeats: this.props.upcomingHeats
                    }
                )
            )
        );
    }
}
