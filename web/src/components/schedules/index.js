import React from "react";
import Immutable from "immutable";
import { connect } from "react-redux";
import { ShowHeat } from "./heats/show";

import faker from "faker";

var d = React.DOM;

function athlete() {
    return {
        name: faker.name.findName()
    }
}

function randomAthletes() {
    let athletes = [];
    for (var i=0; i < (Math.random() * 100) % 6; i++) {
        athletes.push(athlete());
    }

    return athletes;
}

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
                        { id: 1, athletes: randomAthletes() },
                        { id: 3, athletes: randomAthletes() },
                        { id: 2, athletes: randomAthletes() }
                    ]
                },
                {
                    name: "open",
                    heats: [
                        { id: 5, athletes: randomAthletes() },
                        { id: 4, athletes: randomAthletes() },
                        { id: 6, athletes: randomAthletes() },
                        { id: 7, athletes: randomAthletes() },
                        { id: 8, athletes: randomAthletes() },
                        { id: 9, athletes: randomAthletes() },
                    ]
                }
            ]
        };
    }

    athletesForHeatID(id) {
        let divisions = Immutable.fromJS(this.state.divisions);

        let heats = divisions.reduce((m, d) => {
            return m.concat(d.get("heats"));
        }, Immutable.List())

        let heat = heats.find(h => h.get("id") == id);

        return heat.get("athletes").toJS();
    }

    divisionForHeatID(id) {
        let divisions = Immutable.fromJS(this.state.divisions);

        return divisions.filter(d => {
            return d.get("heats").filter(h => h.get("id") == id).size > 0;
        }).first().get("name");
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
                    {
                        key: left,
                        id: left,
                        division: this.divisionForHeatID(left),
                        athletes: this.athletesForHeatID(left)
                    }
                );
            }

            if (right) {
                rightHeat = React.createElement(
                    ShowHeat,
                    {
                        key: right,
                        id: right,
                        division: this.divisionForHeatID(right),
                        athletes: this.athletesForHeatID(right)
                    }
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

            d.h2({}, "Heat Schedule"),

            d.div(
                {id: "lanes"},

                this.renderLanes(zipped)
            )
        );
    }
}
