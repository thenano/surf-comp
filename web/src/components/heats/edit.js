import React from "react";
import Immutable from "immutable";
import * as EventActions from "../../actions/event";
import * as SnackbarActions from "../../actions/snackbar";
import { DropTarget, DragSource, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { fetch } from "../../decorators";
import { connect } from "react-redux";

var d = React.DOM;

const heatAthleteSource = {
    beginDrag(props) {
        return {
            heat: props.heat,
            position: props.position
        };
    }
};

const heatAthleteTarget = {
    drop(props, monitor) {
        const hoverPos = props.position,
              hoverHeat = props.heat,
              dragPos = monitor.getItem().position,
              dragHeat = monitor.getItem().heat;

        props.hover(null, null);
        props.swap(dragHeat, dragPos, hoverHeat, hoverPos);
    },

    hover(props, monitor) {
        const hoverPos = props.position,
              hoverHeat = props.heat,
              dragPos = monitor.getItem().position,
              dragHeat = monitor.getItem().heat,
              alreadyHoveringOver = props.hovering;

        if (alreadyHoveringOver) {
            return;
        }

        props.hover(hoverHeat, hoverPos);
    }
};

const JERSEYS = [
    "blue", "yellow", "red", "white", "green", "pink"
];

@DropTarget("athlete-slot", heatAthleteTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
@DragSource("athlete-slot", heatAthleteSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
@connect()
class AthleteSlot extends React.Component {
    remove() {
        let { event_id, division_id, athlete, heat_id, dispatch } = this.props;

        this.setState({ submitting: true });

        return dispatch(EventActions.removeAthlete(event_id, division_id, heat_id, athlete.get('id')))
            .catch(e => {
                this.setState({
                    submitting: false,
                    error: `The was an unexpected problem: ${e.data}`
                });
            })
            .then((result) => {
                let message = "Athlete removed successfully.";
                if (result.heat_offset !== 0) {
                    message += ` ${-1 * result.heat_offset} heat were removed, please check the schedule for changes.`
                }

                dispatch(SnackbarActions.message(message));
                this.setState({ submitting: false });
            });

    }

    render() {
        let { athlete, position, hovering, connectDragSource, connectDropTarget } = this.props;
        let jersey = JERSEYS[position];

        return connectDragSource(connectDropTarget(
            d.li(
                {className: `athlete ${jersey} ${hovering ? "hovering" : ""}`},
                athlete.get('name'),
                d.button(
                    {
                        onClick: ::this.remove,
                        className: "button danger submit " + (this.props.isSubmitting ? "disabled" : "")
                    },

                    d.i({className: 'fa fa-trash'}),

                    // spinner({
                    //     style: {
                    //         display: this.props.isSubmitting ? "inline-block" : "none"
                    //     }
                    // })
                ))
        ));
    }
}

function athleteSlot(event_id, division_id, heat_id, position, athlete, hover, swap, hovering) {
    return React.createElement(AthleteSlot, {key: position, event_id, division_id, hover, swap, hovering, heat_id, position, athlete});
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
        let { event_id, division_id, heat, hover, swap, over } = this.props;

        let athletes = [];

        for (var i=0; i < 6; i++) {
            let a = heat.getIn(["athletes", i]),
                hovering = over == i;

            if (a) {
                athletes.push(athleteSlot(event_id, division_id, heat.get("id"), i, a, hover, swap, hovering));
            } else {
                athletes.push(emptySlot(heat.get("id"), i, hover, swap, hovering));
            }
        }

        let division = heat.get("division"),
            round = heat.get("round"),
            number = heat.get("number");

        return d.div(
            {className: "heat"},

            d.header({className: `title ${division.toLowerCase()}`}, `${division} - ${round} - Heat ${number}`),

            d.ol(
                {className: "athletes"},
                athletes
            )
        )
    }
}

function heat(event_id, division_id, heat, hover, swap, over) {
    return d.li(
        {className: "heat-list-item", key: heat.get("id")},
        React.createElement(Heat, {event_id, division_id, heat, hover, swap, over})
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
        .filter(heat => heat.get('division_id') === parseInt(props.params.division_id))
        .sortBy(heat => (100 * heat.get('round_position')) + heat.get('number'))
}))
export class EditHeats extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            hover: Immutable.Map()
        };
    }

    swap(heat1, pos1, heat2, pos2) {
        let { heats } = this.props;

        heat1 = "" + heat1;
        heat2 = "" + heat2;
        pos1 = "" + pos1;
        pos2 = "" + pos2;

        let athlete1 = heats.getIn([heat1, "athletes", pos1]),
            athlete2 = heats.getIn([heat2, "athletes", pos2]);

        let updates = heats.setIn([heat1, "athletes", pos1], athlete2)
                            .setIn([heat2, "athletes", pos2], athlete1);
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

    render() {
        const { id, division_id } = this.props.params;

        let heats = this.props.heats.map((h, heat_id) => {
            if (this.state.hover.get("heat") == heat_id) {
                return heat(id, division_id, h, ::this.hover, ::this.swap, this.state.hover.get("position"));
            } else {
                return heat(id, division_id, h, ::this.hover, ::this.swap);
            }
        }).valueSeq();

        return d.div(
            {id: "index-heats", className: "heat-wrapper"},

            d.div(
                {},
                d.h1({className: "wrapper"}, "Arrange Surfers"),
            ),

            d.div(
                {className: "wrapper"},
                d.ul({className: "heats"}, heats)
            )
        );
    }
}
