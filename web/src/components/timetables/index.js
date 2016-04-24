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
        let { heat } = this.props;

        return connectDragSource(
            d.div(
                {className: `heat ${heat.get("division")}`},
                d.header({}, heat.get("division")),
                d.div({}, `heat ${heat.get("number")}, round ${heat.get("round")}`)
            )
        );
    }
}

function heat(row, col, move, heat) {
    return React.createElement(Heat, {
        heat, move, position: [col, row]
    });
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

        let hours = Math.floor(props.row * 16 / 60) + 7;
        let mins = (props.row * 16) % 60;
        this.state = {
            time: `${zeroPad(hours, 2)}:${zeroPad(mins, 2)}`
        };
    }

    render() {
        let { row, left, right, move } = this.props;
        let heatL, heatR;


        return d.div(
            {className: "time-row"},

            d.div(
                {className: "time"},
                this.state.time
            ),

            d.div(
                {className: "time-cell left"},
                left ?
                    heat(row, 0, move, left) :
                    empty(row, 0, move)
            ),

            d.div(
                {className: "time-cell right"},
                right ?
                    heat(row, 1, move, right) :
                    empty(row, 1, move)
            ),

            d.div({className:"clear"})
        );
    }
}

function timeRow(row, left, right, move) {
    return React.createElement(
        TimeRow,
        {row, left, right, move}
    );
}

@DragDropContext(HTML5Backend)
export class EditTimetable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            schedule: Immutable.fromJS([
                [1, 2, 3, 4, 5],
                [null, 6, null, null, null]
            ]),
            heats: Immutable.fromJS({
                1: {
                    id: 1,
                    division: "groms",
                    round: 1,
                    number: 1,
                },
                2: {
                    id: 2,
                    division: "opens",
                    round: 1,
                    number: 1,
                },
                3: {
                    id: 3,
                    division: "opens",
                    round: 1,
                    number: 2,
                },
                4: {
                    id: 4,
                    division: "masters",
                    round: 1,
                    number: 1,
                },
                5: {
                    id: 5,
                    division: "groms",
                    round: 1,
                    number: 2,
                },
                6: {
                    id: 6,
                    division: "groms",
                    round: 1,
                    number: 3,
                }
            })
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

    renderTime(row, left, right) {
        return d.div(
            {className: "time-slot", key: row},

            timeRow(row, left, right, this.move)
        );
    }

    renderTimes(from, to) {
        let times = [];

        for (var i=0; i < 20; i++) {
            let left = "" + this.state.schedule.getIn([0, i]),
                right = "" + this.state.schedule.getIn([1, i]);
            times.push(this.renderTime(i, this.state.heats.get(left), this.state.heats.get(right)));
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
