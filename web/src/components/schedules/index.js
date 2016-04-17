import React from "react";
import Immutable from "immutable";
import HTML5Backend from 'react-dnd-html5-backend';
import faker from "faker";
import update from 'react/lib/update';
import { connect } from "react-redux";
import { ShowEmptyHeat, ShowHeat } from "./heats/show";
import { DragDropContext } from 'react-dnd';

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

@DragDropContext(HTML5Backend)
export class EditSchedule extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            schedule: [
                [3, 4],
                [5, null]
            ],
            divisions: {
                1: {name: "groms"},
                2: {name: "opens"}
            },
            heats: {
                1: { athletes: randomAthletes(), division: 1},
                2: { athletes: randomAthletes(), division: 2},
                3: { athletes: randomAthletes(), division: 2},
                4: { athletes: randomAthletes(), division: 1},
                5: { athletes: randomAthletes(), division: 2},
            }
        };
    }

    moveHeat(dragPosition, hoverPosition) {
        const { schedule } = this.state;

        let left = schedule[0].slice(),
            right = schedule[1].slice(),
            copy = [left, right];

        let from = schedule[dragPosition[0]][dragPosition[1]],
            to = schedule[hoverPosition[0]][hoverPosition[1]];

        if (dragPosition[0] == hoverPosition[0]) {
            let column = copy[dragPosition[0]];
            column.splice(dragPosition[1], 1);

            if (dragPosition[1] < hoverPosition[1]) {
                column = column.slice(0, hoverPosition[1]).concat(from, column.slice(hoverPosition[1]));
            } else {
                column = column.slice(0, hoverPosition[1]).concat(from, column.slice(hoverPosition[1]));
            }

            copy[dragPosition[0]] = column
        } else {
            let column = copy[hoverPosition[0]];
            copy[dragPosition[0]].splice(dragPosition[1], 1);

            column = column.slice(0, hoverPosition[1]).concat(from, column.slice(hoverPosition[1]));

            copy[hoverPosition[0]] = column;
        }

        this.setState({
            schedule: copy
        });
    }

    renderLanes() {
        let { schedule } = this.state;
        let slots = [];
        let rowKey = 0;

        for (var i=0; i < Math.max(schedule[0].length, schedule[1].length); i++) {
            let left = i < schedule[0].length ? schedule[0][i] : null,
                right = i < schedule[1].length ? schedule[1][i] : null;

            let leftHeat, rightHeat;

            if (left) {
                leftHeat = React.createElement(
                    ShowHeat,
                    {
                        key: left,
                        id: left,
                        position: [0, i],
                        move: this.moveHeat.bind(this),
                        division: "groms",
                        athletes: this.state.heats[left].athletes
                    }
                );
            } else {
                leftHeat = React.createElement(
                    ShowEmptyHeat,
                    {
                        key: `empty-${++rowKey}`,
                        position: [0, i],
                        move: this.moveHeat.bind(this),
                    }
                )
            }

            if (right) {
                rightHeat = React.createElement(
                    ShowHeat,
                    {
                        key: right,
                        id: right,
                        position: [1, i],
                        move: this.moveHeat.bind(this),
                        division: "groms",
                        athletes: this.state.heats[right].athletes
                    }
                );
            } else {
                rightHeat = React.createElement(
                    ShowEmptyHeat,
                    {
                        key: `empty-${++rowKey}`,
                        position: [1, i],
                        move: this.moveHeat.bind(this),
                    }
                )
            }

            slots.push(leftHeat);
            slots.push(rightHeat);
            slots.push(d.div({key: `clear-${++rowKey}`, className: "clear"}));
        }

        return slots
    }

    render() {
        return d.div(
            {id: "schedule-edit"},

            d.h2({}, "Heat Schedule"),

            d.div(
                {id: "lanes"},

                this.renderLanes()
            )
        );
    }
}
