import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import * as EventActions from "../../actions/event";
import * as SnackbarActions from "../../actions/snackbar";
import * as forms from "../forms";
import { DragDropContext } from "react-dnd";
import { DropTarget, DragSource } from "react-dnd";
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
    hover(props, monitor) {
        const dragPos = monitor.getItem().position;
        const hoverPos = props.position;

        // Don't replace items with themselves
        if (dragPos === hoverPos) {
            return;
        }

        props.move(dragPos, hoverPos);

        monitor.getItem().position = hoverPos;
    }
};

@DragSource("heat-card", heatCardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class Heat extends React.Component {
    render() {
        const { connectDragSource } = this.props;
        let { heat } = this.props;

        return connectDragSource(
            d.div(
                {className: `heat ${heat.get("division").toLowerCase()}`},

                d.div({},
                    d.header({}, heat.get("division")),
                    d.div({}, `heat ${heat.get("number")}, ${heat.get("round")}`),
                    d.div(
                        {className: "heat-time"},
                        d.i({className: "fa fa-clock-o"}),
                        this.props.time
                    )
                )
            )
        );
    }
}

function heat(row, col, move, heat, time) {
    return React.createElement(Heat, {
        heat, move, position: [col, row], time
    });
}

@DropTarget("heat-card", heatCardTarget, connect => ({
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
        let { row, left, right, move, time } = this.props;

        return d.div(
            {className: "time-row"},

            d.div(
                {className: "time-cell left"},
                left ?
                    heat(row, 0, move, left, time) :
                    empty(row, 0, move)
            ),

            d.div(
                {className: "time-cell right"},
                right ?
                    heat(row, 1, move, right, time) :
                    empty(row, 1, move)
            ),

            d.div({className:"clear"})
        );
    }
}

function timeRow(row, left, right, move, time) {
    let key = row;
    return React.createElement(
        TimeRow,
        {key, row, left, right, move, time}
    );
}

@fetch((store, r) => {
    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        return store.dispatch(EventActions.getSchedule(r.params.id));
    }
})
@DragDropContext(HTML5Backend)
@connect(state => ({ events: state.events }))
export class EditTimetable extends React.Component {
    constructor(props, context) {
        super(props, context);

        const { events } = this.props;
        let schedule = events.getIn(["schedules", Number.parseInt(this.props.params.id)]);

        this.state = {
            date: schedule.get("date"),
            schedule: schedule.get("schedule"),
            heats: schedule.get("heats")
        };

        this.move = this.move.bind(this);
    }

    move(from, to) {
        const { schedule } = this.state;

        if (schedule.getIn(to)) {
            // There's something already in the slot, don't
            // allow moving it.
            return;
        }

        let heat = schedule.getIn(from);

        this.setState({
            submitting: false,
            schedule: schedule.setIn(from, 0).setIn(to, heat)
        });
    }

    renderTime(row, left, right, time) {
        return timeRow(row, left, right, this.move, time);
    }

    renderTimes() {
        let times = [];

        let startTime = new Date(this.state.date);
        startTime.setHours(7);

        for (var i=0; i < 45; i++) {
            let left = "" + this.state.schedule.getIn([0, i]),
                right = "" + this.state.schedule.getIn([1, i]);

            let heatStartTime = this.state.heats.getIn([left, 'start_time']) ||
                            this.state.heats.getIn([right, 'start_time']);

            startTime = heatStartTime ? new Date(heatStartTime) : startTime;

            let time = `${zeroPad(startTime.getHours(), 2)}:${zeroPad(startTime.getMinutes(), 2)}`;

            times.push(this.renderTime(i, this.state.heats.get(left), this.state.heats.get(right), time));

            startTime.setMinutes(startTime.getMinutes() + 16);
        }

        return d.div(
            {className: "times"},
            times
        );
    }

    send() {
        let { dispatch } = this.props;
        let eventId = this.props.params.id;

        this.setState({ submitting: true });

        return dispatch(EventActions.save(eventId, this.state.schedule))
            .catch(e => {
                this.setState({
                    submitting: false,
                    error: `The was an unexpected problem: ${e.data}`
                });
            })
            .then(() => {
                dispatch(SnackbarActions.message("Saved."));
                this.setState({ submitting: false });
            });

    }

    render() {
        return d.div(
            {id: "edit-schedule"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Edit Schedule"
                ),
            ),

            d.div(
                {className: "wrapper"},

                d.header(
                    {className: "timeline-header"},

                    d.div({className: "bank"}, "north bank"),
                    d.div({className: "bank"}, "south bank"),
                ),

                d.div(
                    {className: `timeline ${this.state.submitting ? "submitting" : ""}`},

                    this.renderTimes()
                ),
            ),

            forms.floatingActionButton("save", ::this.send, this.state.submitting),
        );
    }
}
