import React from "react";
import Immutable from "immutable";
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import { ShowHeat } from "../schedules/heats/show";
import { DropTarget, DragSource } from 'react-dnd';

var d = React.DOM;

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

const heatCardSource = {
    beginDrag(props) {
        return {
            position: props.position
        };
    }
};

const heatCardTarget = {
    hover(props, monitor, component) {
        const dragPos = monitor.getItem().position;
        const hoverPos = props.position;

        // Don't replace items with themselves
        if (dragPos === hoverPos) {
            return;
        }

        props.move(dragPos, hoverPos);

        if (monitor.getItem()) {
            monitor.getItem().position = hoverPos;
        }
    }
};

@DragSource("show-heat", heatCardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class Heat extends React.Component {
    render() {
        const { connectDragSource, connectDropTarget, isDragging } = this.props;
        let { division, heat, round } = this.props;

        return connectDragSource(
            d.div(
                {className: "heat"},
                d.header({}, division),
                d.div({}, `heat ${heat}, round ${round}`)
            )
        );
    }
}

@DropTarget("show-heat", heatCardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
class Empty extends React.Component {
    render() {
        const { connectDropTarget } = this.props;

        return connectDropTarget(d.div({className: "empty"}));
    }
}

function empty(row, col, move) {
    return React.createElement(Empty, {
        position: [col, row],
        move: move
    });
}

class TimeRow extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let { row, left, right, move } = this.props;
        let heatL, heatR;


        if (left) {
            heatL = React.createElement(
                Heat,
                {
                    heat: 1,
                    division: "groms",
                    round: 1,
                    move: move,
                    position: [0, row]
                }
            )
        }

        if (right) {
            heatR = React.createElement(
                Heat,
                {
                    heat: 1,
                    division: "groms",
                    round: 1,
                    move: move,
                    position: [1, row]
                }
            )
        }

        return d.div(
            {className: "time-row"},

            d.div(
                {className: "time"},
                this.props.time
            ),

            d.div(
                {className: "time-cell left"},
                heatL || empty(row, 0, move)
            ),

            d.div(
                {className: "time-cell right"},
                heatR || empty(row, 1, move)
            ),

            d.div({className:"clear"})
        );
    }
}

@DragDropContext(HTML5Backend)
export class EditTimetable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            schedule: Immutable.fromJS([
                [1, 2, 3, 4, 5],
                [null, 3, null, null, null]
            ])
        };

        this.move = this.move.bind(this);
    }

    move(from, to) {
        const { schedule } = this.state;

        if (schedule.getIn(to)) {
            // There's something already in the slot, don't allow moving it.
            return;
        }

        let heat = schedule.getIn(from);

        this.setState({
            schedule: schedule.setIn(from, null).setIn(to, heat)
        });
    }

    renderTime(row, hours, mins, left, right) {
        return d.div(
            {className: "time-slot", key: (hours * 60 + mins)},

            React.createElement(
                TimeRow,
                {row, left, right, move: this.move, time: `${zeroPad(hours, 2)}:${zeroPad(mins, 2)}`}
            )
        );
    }

    renderTimes(from, to) {
        let times = [];

        for (var i=0; i < 20; i++) {
            let hours = Math.floor(i * 16 / 60) + 7;
            let mins = (i * 16) % 60;
            let left = this.state.schedule.getIn([0, i]),
                right = this.state.schedule.getIn([1, i]);
            times.push(this.renderTime(i, hours, mins, left, right));
        }

        return times;
    }

    render() {
        return d.div(
            {className: "timeline-wrapper"},
            d.div(
                {className: "timeline"},

                this.renderTimes(7, 17)
            )
        );
    }
}
