import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import * as SnackbarActions from "../../actions/snackbar";
import * as forms from "../forms";
import { DropTarget, DragSource, DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { fetch } from "../../decorators";
import { connect } from "react-redux";
import { JERSEYS } from "../surfing";

var d = React.DOM;

const heatAthleteSource = {
    beginDrag(props) {
        return {
            heat: props.heat,
            position: props.position
        };
    }
};

// TODO repeated
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

const heatAthleteTarget = {
    drop(props, monitor) {
        const hoverPos = props.position,
            hoverHeat = props.heat,
            dragPos = monitor.getItem().position,
            dragHeat = monitor.getItem().heat;

        props.hover(null, null);
        props.swap(dragHeat, dragPos, hoverHeat, hoverPos);
    },

    hover(props) {
        const hoverPos = props.position,
            hoverHeat = props.heat,
            alreadyHoveringOver = props.hovering;

        if (alreadyHoveringOver) {
            return;
        }

        props.hover(hoverHeat, hoverPos);
    }
};

@DropTarget("athlete-slot", heatAthleteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
@DragSource("athlete-slot", heatAthleteSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class AthleteSlot extends React.Component {
    render() {
        let { name, position, hovering, connectDragSource, connectDropTarget, remove } = this.props;
        let jersey = JERSEYS[position];

        let removeLink = remove ? d.a(
            {
                onClick: remove,
                className: "danger submit " + (this.props.isSubmitting ? "disabled" : "")
            },

            d.i({className: "fa fa-trash"}),
        ) : null;

        return connectDragSource(connectDropTarget(
            d.li(
                {className: `athlete ${jersey} ${hovering ? "hovering" : ""}`},
                removeLink,
                name
            )
        ));
    }
}

function athleteSlot(heat, position, name, hover, swap, hovering, remove) {
    return React.createElement(AthleteSlot, {key: position, heat, position, name, hover, swap, hovering, remove});
}

@DropTarget("athlete-slot", heatAthleteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
class EmptySlot extends React.Component {
    render() {
        let { position, connectDropTarget, hovering } = this.props;
        let jersey = JERSEYS[position];

        return connectDropTarget(d.li({className: `empty athlete ${jersey} ${hovering ? "hovering" : ""}`}, "empty"));
    }
}

function emptySlot(heat, position, hover, swap, hovering) {
    return React.createElement(EmptySlot, {key: position, hover, swap, hovering, heat, position});
}

class Heat extends React.Component {
    render() {
        let { heat, hover, swap, over, remove } = this.props;

        let athletes = [];

        for (var i=0; i < 6; i++) {
            let a = heat.getIn(["athletes", i]),
                hovering = over == i;

            if (a) {
                athletes.push(athleteSlot(heat.get("id"), i, a.get("name"), hover, swap, hovering, remove ? remove.bind(this, a) : undefined));
            } else {
                athletes.push(emptySlot(heat.get("id"), i, hover, swap, hovering));
            }
        }

        let division = heat.get("division"),
            round = heat.get("round"),
            number = heat.get("number"),
            startTime = heat.get("start_time") ? new Date(heat.get("start_time")) : undefined;

        let displayTime;
        if (startTime) {
            displayTime = `${zeroPad(startTime.getHours(), 2)}:${zeroPad(startTime.getMinutes(), 2)}`;
        }

        return d.div(
            {className: "heat"},

            d.header(
                {className: `title ${division.toLowerCase()}`},
                `${division} - ${round} - Heat ${number} ${displayTime ? "(" + displayTime + ")" : ""}`
            ),

            d.ol(
                {className: "athletes"},
                athletes
            )
        );
    }
}

function heat(heat, hover, swap, remove, over) {
    return d.li(
        {className: "interactive heat-list-item", key: heat.get("id")},
        React.createElement(Heat, {heat, hover, swap, over, remove})
    );
}

@fetch((store, r) => {
    if (!store.loaded(`events.schedules.${r.params.id}`)) {
        return store.dispatch(EventActions.getSchedule(r.params.id));
    }
})
@DragDropContext(HTML5Backend)
@connect((state, props) => ({
    heats: state.events.getIn(["schedules", parseInt(props.params.id), "heats"])
        .filter(heat => heat.get("division_id") === parseInt(props.params.division_id))
        .sortBy(heat => (100 * heat.get("round_position")) + heat.get("number"))
}))
export class EditHeats extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            hover: Immutable.Map()
        };
    }

    swap(heat1, pos1, heat2, pos2) {
        const { id } = this.props.params;
        const { dispatch } = this.props;

        this.setState({ submitting: true });

        return dispatch(EventActions.swapAthletes(id, heat1, pos1, heat2, pos2))
            .catch(e => {
                this.setState({
                    submitting: false,
                    error: `The was an unexpected problem: ${e.data}`
                });
            })
            .then((result) => {
                if (result.heat_offset !== 0) {
                    let message = ` ${-1 * result.heat_offset} heats were removed, please check the schedule for changes.`;

                    dispatch(SnackbarActions.message(message));
                }
                this.setState({ submitting: false });
            });
    }

    hover(heat, position) {
        if (this.state.hover.get("heat") == heat &&
            this.state.hover.get("position") == position) {
            return;
        }

        this.setState({
            hover: Immutable.fromJS({heat, position})
        });
    }

    remove(heat, athlete) {
        const { id, division_id } = this.props.params;
        const { dispatch } = this.props;

        this.setState({ submitting: true });

        return dispatch(EventActions.removeAthlete(id, division_id, heat.get("id"), athlete.get("id")))
            .catch(e => {
                this.setState({
                    submitting: false,
                    error: `The was an unexpected problem: ${e.data}`
                });
            })
            .then((result) => {
                let message = "Athlete removed successfully.";
                if (result.heat_offset !== 0) {
                    message += ` ${-1 * result.heat_offset} heats were removed, please check the schedule for changes.`;
                }

                dispatch(SnackbarActions.message(message));
                this.setState({ submitting: false });
            });

    }

    addAthlete(model) {
        const { id, division_id } = this.props.params;
        const { dispatch } = this.props;

        return dispatch(EventActions.addAthlete(id, division_id, model.get("name"))).then((result) => {
            let message = "Athlete added successfully.";
            if (result.heat_offset !== 0) {
                message += ` ${result.heat_offset} heats were added, please check the schedule for changes.`;
            }

            dispatch(SnackbarActions.message(message));
        });
    }

    render() {
        let heats = this.props.heats.map((h, heat_id) => {
            let remove = (h.get("round_position") === 0 && !h.get("start_time")) ? this.remove.bind(this, h) : undefined;
            if (this.state.hover.get("heat") == heat_id) {
                return heat(h, ::this.hover, ::this.swap, remove, this.state.hover.get("position"));
            } else {
                return heat(h, ::this.hover, ::this.swap, remove);
            }
        }).valueSeq();

        return d.div(
            {id: "index-heats", className: "heat-wrapper"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Heat Draw"
                ),
            ),

            React.createElement(AddAthleteForm, {send: ::this.addAthlete}),

            d.div(
                {className: "wrapper"},
                d.ul({className: "heats"}, heats)
            )
        );
    }
}

export class AddAthleteForm extends forms.ValidatedForm {
    validate(model) {
        if (model.name.match(/^\s*$/)) {
            return {name: "Please enter a valid name"};
        }
        return {};
    }

    send(model) {
        this.setState({ submitting: true });

        return this.props.send(model).catch(e => {
            this.setState({
                submitting: false,
                error: `Error: ${e.data.error}`
            });
        }).then(() => {
            this.setState({ submitting: false });
        });
    }

    render() {
        return d.div(
            {},

            d.h2({className: "wrapper"}, "Add athlete"),

            d.div(
                {className: "wrapper"},

                d.form(
                    {},

                    d.div(
                        {
                            className: "notification error plain",
                            style: {
                                display: this.state.error ? "block" : "none"
                            }
                        },
                        this.state.error
                    ),

                    forms.text(
                        "Name",
                        "name",
                        {
                            errors: this.errors("name"),
                            onChange: this.set("name"),
                            disabled: this.state.submitting
                        }
                    ),

                    forms.submit("Add", this.submit.bind(this), this.state.submitting)
                )
            )
        );
    }
}
