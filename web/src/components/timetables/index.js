import React from "react";
import Immutable from "immutable";
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import { ShowHeat } from "../schedules/heats/show";

var d = React.DOM;

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

class TimeRow extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let { left, right } = this.props;
        let heatL, heatR;

        if (left) {
            heatL = React.createElement(
                ShowHeat,
                {
                    id: 1,
                    division: "groms",
                    athletes: []
                }
            )
        }

        if (right) {
            heatR = React.createElement(
                ShowHeat,
                {
                    id: 1,
                    division: "groms",
                    athletes: []
                }
            )
        }

        return d.div(
            {className: "time-row"},

            d.div(
                {className: "time-cell"},
                left || d.div({className: "empty"})
            ),
            d.div(
                {className: "time-point"},
                d.div(
                    {className: "time-mark"},
                    this.props.time
                )
            ),
            d.div(
                {className: "time-cell"},
                right || d.div({className: "empty"})
            ),
        );
    }
}

@DragDropContext(HTML5Backend)
export class EditTimetable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            times: Immutable.Map(),
            start: "08:00",
            end: "15:00"
        };
    }

    renderTime(hours, mins) {
        return d.div(
            {className: "time-slot", key: (hours * 60 + mins)},

            React.createElement(
                TimeRow,
                {time: `${zeroPad(hours, 2)}:${zeroPad(mins, 2)}`}
            )
        );
    }

    renderTimes(from, to) {
        let times = [];

        for (var hours=from; hours < to; hours++) {
            for (var mins=0; mins < 60; mins+=15) {
                times.push(this.renderTime(hours, mins))
            }
        }

        return times;
    }

    render() {
        return d.div(
            {className: "timeline-wrapper"},
            d.div(
                {className: "timeline"},

                this.renderTimes(8, 12)
            ),
            d.div({className: "timeline-line"})
        );
    }
}
