import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../../actions/event";
import { fetch } from "../../../decorators";
import { connect } from "react-redux";

var d = React.DOM;

const PLACES = [
    d.div({}, "1", d.sup({}, "st")),
    d.div({}, "2", d.sup({}, "nd")),
    d.div({}, "3", d.sup({}, "rd")),
    d.div({}, "4", d.sup({}, "th")),
    d.div({}, "5", d.sup({}, "th")),
    d.div({}, "6", d.sup({}, "th"))
];

class AthleteHeatResult extends React.Component {
    render() {
        let { athlete, scores, total } = this.props;

        let best = scores
            .map((s, i) => [s, i])
            .sortBy(s => s[0])
            .slice(-2);

        let topTwo = best.map(s => s[1]);

        return d.li(
            {className: "athlete-heat-result"},

            d.div(
                {className: "name"},
                d.section({className: "place"}, PLACES[this.props.place-1]),
                d.img({className: "avatar", src: `//res.cloudinary.com/adventure/image/facebook/w_70,h_70,c_fill,r_max,g_face,bo_2px_solid_white/${athlete.get("uid")}.jpg`}),
                d.div({}, athlete.get("name"))
            ),

            d.div(
                {className: "overall"},
                d.header({}, "Overall"),
                d.div(
                    {},
                    Number(total).toFixed(2)
                )
            ),

            d.div(
                {className: "first-wave"},
                d.header({}, "Wave 1"),
                d.div(
                    {},
                    Number(best.get(1)[0]).toFixed(2)
                )
            ),

            d.div(
                {className: "second-wave"},
                d.header({}, "Wave 2"),
                d.div(
                    {},
                    Number(best.first()[0]).toFixed(2)
                )
            ),

            d.ol(
                {className: "all-wave-scores"},

                scores.map((s, i) => {
                    return d.li(
                        {key: i, className: `wave ${topTwo.contains(i) ? "top" : ""}`},
                        d.sup({}, i+1),
                        Number(s).toFixed(2)
                    );
                })
            )
        );
    }
}

class HeatResults extends React.Component {
    render() {
        return d.div(
            {className: "heat-results"},

            d.header(
                {className: "heat-header"},
                d.div({className: "heat-name"}, "Heat 1",),
                d.div(
                    {className: "average-score"},
                    d.span({className: "score"}, "5.22"),
                    " Avg / Wave"
                ),
            ),

            d.ol(
                {},

                React.createElement(AthleteHeatResult, {
                    athlete: Immutable.fromJS({name: "Sam Gibson", uid: "10102339466916613"}),
                    scores: Immutable.List([
                        1, 2.2, 9.23, 7, 5.2, 3, 4
                    ]),
                    total: 8.85,
                    place: 1
                }),
                React.createElement(AthleteHeatResult, {
                    athlete: Immutable.fromJS({name: "Fernando Freire", uid: "10102339466916613"}),
                    scores: Immutable.List([
                        5, 7.2, 8.23, 7, 5.2, 9, 4, 4.3, 2.2, 1, 1, 1
                    ]),
                    total: 6.5,
                    place: 2
                })
            )
        );
    }
}

@fetch((store, r) => {
    if (!store.loaded(`events.${r.params.id}`)) {
        return store
            .dispatch(EventActions.get(r.params.id));
    }
})
@connect(state => ({events: state.events}))
export class Results extends React.Component {
    render() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));

        return d.div(
            {id: "results"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    `Results: ${event.get("name")}`
                ),
            ),


            d.div(
                {className: "wrapper round-results"},

                d.h2({}, "Round 1"),

                React.createElement(HeatResults, {})
            )
        );
    }
}
