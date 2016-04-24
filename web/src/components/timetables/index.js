import React from "react";
import Immutable from "immutable";
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import { ShowHeat } from "../schedules/heats/show";
import { DropTarget, DragSource } from 'react-dnd';
import * as ScheduleActions from "../../actions/schedule";
import { fetch } from "../../decorators";
import { connect } from "react-redux";

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

                d.div({},
                    d.header({}, heat.get("division")),
                    d.div({}, `heat ${heat.get("number")}, round ${heat.get("round")}`)
                )
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
    render() {
        let { row, left, right, move } = this.props;
        let heatL, heatR;


        return d.div(
            {className: "time-row"},

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
    let key = row;
    return React.createElement(
        TimeRow,
        {key, row, left, right, move}
    );
}

@fetch((store) => {
    return store.dispatch(ScheduleActions.getSchedule(8))
})
@DragDropContext(HTML5Backend)
@connect(state => state)
export class EditTimetable extends React.Component {
    constructor(props, context) {
        super(props, context);

        const { schedule } = this.props;

        this.state = {
            schedule: schedule.getIn(["current", "schedule"]),
            heats: schedule.getIn(["current", "heats"])
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
        return timeRow(row, left, right, this.move);
    }

    renderTimes() {
        let times = [];

        for (var i=0; i < 12 * 60 / 16; i++) {
            let left = "" + this.state.schedule.getIn([0, i]),
                right = "" + this.state.schedule.getIn([1, i]);
            times.push(this.renderTime(i, this.state.heats.get(left), this.state.heats.get(right)));
        }

        return d.div(
            {className: "times"},
            times
        );
    }

    renderTicks() {
        let ticks = [];

        for (var i=0; i < 12 * 4; i++) {
            let hours = Math.floor(i * 15 / 60) + 7,
                mins = (i * 15) % 60;

            ticks.push(d.div(
                {key: i, className: "tick"},
                i % 4 == 0 ?
                    d.div({className: "big-tick"}, `${zeroPad(hours, 2)}:${zeroPad(mins, 2)}`) :
                    d.div({className: "small-tick"})
            ));
        }

        return ticks;
    }

    renderTickColumn() {
        return d.div(
            {className: "ticks"},
            this.renderTicks()
        )
    }

    render() {
        return d.div(
            {className: "timeline"},

            this.renderTickColumn(),
            this.renderTimes()
        );
    }
}
