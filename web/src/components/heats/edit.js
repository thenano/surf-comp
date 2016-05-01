import React from "react";
import faker from "faker";
import Immutable from "immutable";
import { DropTarget, DragSource, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

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

    return Immutable.fromJS(athletes);
}

const heatAthleteSource = {
    beginDrag(props) {
        return {
            heat: props.heat,
            position: props.position,
        };
    }
};

const heatAthleteTarget = {
    drop(props, monitor, component) {
        const hoverPos = props.position,
              hoverHeat = props.heat,
              dragPos = monitor.getItem().position,
              dragHeat = monitor.getItem().heat;

        props.hover(null, null);
        props.swap(dragHeat, dragPos, hoverHeat, hoverPos);
    },

    hover(props, monitor, component) {
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
}

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
class AthleteSlot extends React.Component {
    render() {
        let { name, position, hovering, connectDragSource, connectDropTarget } = this.props;
        let jersey = JERSEYS[position];

        return connectDragSource(connectDropTarget(
            d.li({className: `athlete ${jersey} ${hovering ? "hovering" : ""}`}, name)
        ));
    }
}

function athleteSlot(heat, position, name, hover, swap, hovering) {
    return React.createElement(AthleteSlot, {key: position, hover, swap, hovering, heat, position, name});
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
        let { heat, hover, swap, over } = this.props;

        let athletes = [];

        for (var i=0; i < 6; i++) {
            let a = heat.getIn(["athletes", i]),
                hovering = over == i;

            if (a) {
                athletes.push(athleteSlot(heat.get("id"), i, a.get("name"), hover, swap, hovering));
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

function heat(h, hover, swap, over) {
    return d.li(
        {className: "heat-list-item", key: h.get("id")},
        React.createElement(Heat, {heat: h, hover, swap, over})
    );
}

@DragDropContext(HTML5Backend)
export class EditHeats extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            heats: Immutable.fromJS({
                1: {
                    id: 1,
                    division: "Groms",
                    number: 1,
                    round: "Quarterfinals",
                    athletes: randomAthletes(),
                },
                2: {
                    id: 2,
                    division: "Groms",
                    number: 2,
                    round: "Quarterfinals",
                    athletes: randomAthletes(),
                },
                3: {
                    id: 3,
                    division: "Groms",
                    number: 3,
                    round: "Quarterfinals",
                    athletes: randomAthletes(),
                },
            }),
            hover: Immutable.Map()
        };
    }

    swap(heat1, pos1, heat2, pos2) {
        let { heats } = this.state;

        heat1 = "" + heat1;
        heat2 = "" + heat2;
        pos1 = "" + pos1;
        pos2 = "" + pos2;

        let athlete1 = heats.getIn([heat1, "athletes", pos1]),
            athlete2 = heats.getIn([heat2, "athletes", pos2]);

        let updates = heats.setIn([heat1, "athletes", pos1], athlete2)
                            .setIn([heat2, "athletes", pos2], athlete1);

        this.setState({ heats: updates });
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
        let heats = this.state.heats.map((h, id) => {
            if (this.state.hover.get("heat") == id) {
                return heat(h, this.hover.bind(this), this.swap.bind(this), this.state.hover.get("position"));
            } else {
                return heat(h, this.hover.bind(this), this.swap.bind(this));
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
