import React from "react";
import Immutable from "immutable";

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
                // todo - add jersey colour all up in here
                // todo - show pictures when we hook up FB login
                // d.img({className: "avatar", src: `//res.cloudinary.com/adventure/image/facebook/w_70,h_70,c_fill,r_max,g_face,bo_2px_solid_white/${athlete.get("uid")}.jpg`}),
                d.div({}, athlete.get("name"))
            ),

            d.div(
                {className: "overall"},
                d.header({}, "Overall"),

                total > 0 ?
                    d.div({}, Number(total).toFixed(2)) :
                    d.div({}, "-")
            ),

            d.div(
                {className: "first-wave"},
                d.header({}, "Wave 1"),

                best.size > 1 ?
                    d.div({}, Number(best.get(1)[0]).toFixed(2)) :
                    d.div({}, "-")
            ),

            d.div(
                {className: "second-wave"},
                d.header({}, "Wave 2"),

                best.size > 0 ?
                    d.div({}, Number(best.first()[0]).toFixed(2)) :
                    d.div({}, "-")
            ),

            d.ol(
                {className: "all-wave-scores"},

                scores.map((s, i) => {
                    return d.li(
                        {key: i, className: `wave ${topTwo.contains(i) ? "top" : ""}`},
                        d.sup({}, i+1),

                        s > 0 ?
                            Number(s).toFixed(2) :
                            "-"
                    );
                })
            )
        );
    }
}

export class HeatResults extends React.Component {
    render() {
        let { heat } = this.props;

        return d.div(
            {className: `heat-results ${this.props.places ? "" : "no-places"}`},

            d.ol(
                {},

                heat.get("result", Immutable.List()).map((result, i) => {
                    let athlete = heat.getIn(["athletes", "" + result.get("athlete_id")]);

                    return React.createElement(AthleteHeatResult, {
                        key: i,
                        athlete,
                        scores: result.get("waves", Immutable.List()),
                        total: result.get("total", 0),
                        place: i+1
                    });
                })
            )
        );
    }
}

class TinyAthleteHeatResult extends React.Component {
    render() {
        let { athlete, scores, total } = this.props;

        let best = scores
            .map((s, i) => [s, i])
            .sortBy(s => s[0])
            .slice(-2);

        let topTwo = best.map(s => s[1]);

        return d.li(
            {className: "tiny-athlete-heat-result"},

            d.div(
                {className: "name"},
                d.section({className: "place"}, PLACES[this.props.place-1]),
                // todo - add jersey colour all up in here
                // todo - show pictures when we hook up FB login
                // d.img({className: "avatar", src: `//res.cloudinary.com/adventure/image/facebook/w_70,h_70,c_fill,r_max,g_face,bo_2px_solid_white/${athlete.get("uid")}.jpg`}),
                d.span({}, athlete.get("name")),
                d.span(
                    {className: "overall"},
                    total > 0 ?
                        d.span({className: "result-num"}, Number(total).toFixed(2)) :
                        d.span({className: "result-num"}, "-")
                )
            ),

        );
    }
}

export class TinyHeatResults extends React.Component {
    render() {
        let { heat } = this.props;

        return d.div(
            {className: "heat-results tiny-heat-results"},

            // d.header(
            //     {className: `title ${division.toLowerCase()}`},
            //     `${division} : ${round} : Heat ${number}`
            // ),
            //
            d.ol(
                {className: "athletes"},

                d.header(
                    {className: `heat-header ${heat.get("division").toLowerCase()}`},
                    `${heat.get("division")} : ${heat.get("round")} : Heat ${heat.get("number")}`
                ),

                heat.get("result", Immutable.List()).map((result, i) => {
                    let athlete = heat.getIn(["athletes", "" + result.get("athlete_id")]);

                    return React.createElement(TinyAthleteHeatResult, {
                        key: i,
                        athlete,
                        scores: result.get("waves", Immutable.List()),
                        total: result.get("total", 0),
                        place: i+1
                    });
                })
            )
        );
    }
}

