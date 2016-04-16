import React from "react";
import Immutable from "immutable";
import { connect } from "react-redux";
import { ShowHeat } from "./heats/show";

var d = React.DOM;

@connect(state => state)
export class EditSchedule extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            schedule: [
                [1, 2, 4],
                [3, 5, 6, 7, 8, 9]
            ],
            divisions: [
                {
                    name: "groms",
                    heats: [
                        { id: 1, athletes: [] },
                        { id: 3, athletes: [] },
                        { id: 2, athletes: [] }
                    ]
                },
                {
                    name: "open",
                    heats: [
                        { id: 5, athletes: [] },
                        { id: 4, athletes: [] },
                        { id: 6, athletes: [] },
                        { id: 7, athletes: [] },
                        { id: 8, athletes: [] },
                        { id: 9, athletes: [] },
                    ]
                }
            ]
        };
    }

    renderLanes(zipped) {
        return zipped.map((heats) => {
            let left = heats[0],
                right = heats[1];

            let leftHeat,
                rightHeat;

            if (left) {
                leftHeat = React.createElement(
                    ShowHeat,
                    {key: left, id: left, division: "todo"}
                );
            }

            if (right) {
                rightHeat = React.createElement(
                    ShowHeat,
                    {key: right, id: right, division: "todo"}
                );
            }

            return d.div(
                {className: "time-slot", key: `${left}:${right}`},
                leftHeat, rightHeat,
                d.div({className: "clear"})
            );
        });
    }

    zip(left, right) {
        let len = Math.max(left.size, right.size);

        let le = left,
            re = right;

        if (left.get(len-1, undefined) == undefined) {
            le = left.set(len-1, undefined);
        }

        if (right.get(len-1, undefined) == undefined) {
            re = right.set(len-1, undefined);
        }

        return le.zip(re);
    }

    render() {
        let south = Immutable.fromJS(this.state.schedule[0]),
            north = Immutable.fromJS(this.state.schedule[1]),
            zipped = this.zip(north, south);

        return d.div(
            {id: "schedule-edit"},

            d.h1({}, "edit yourself some heats"),

            d.div(
                {id: "lanes"},

                this.renderLanes(zipped)
                // this.renderLane(this.state.schedule[0]),
                // this.renderLane(this.state.schedule[1])
            )
        );
    }
}
