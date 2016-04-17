import React from "react";
import { findDOMNode } from 'react-dom';
import { DropTarget, DragSource } from 'react-dnd';

var d = React.DOM;

class ShowHeatAthlete extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let { athlete } = this.props;

        return d.li(
            {className: "athlete"},
            athlete.name
        );
    }
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

        monitor.getItem().position = hoverPos;
    }
};

@DropTarget("show-heat", heatCardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
export class ShowEmptyHeat extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const { connectDropTarget } = this.props;

        return connectDropTarget(
            d.div({className: "heat"}, "empty")
        );
    }
}

@DropTarget("show-heat", heatCardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
@DragSource("show-heat", heatCardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
export class ShowHeat extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const { connectDragSource, connectDropTarget, isDragging } = this.props;

        return connectDragSource(connectDropTarget(
            d.div(
                {className: `heat ${isDragging ? 'dragging' : ''}`},

                d.header(
                    {className: "title"},
                    `Heat ${this.props.id}`,
                    d.sup({}, this.props.division)
                ),

                d.ol(
                    { className: "athletes" },

                    this.props.athletes.map((a, i) => {
                        return React.createElement(
                            ShowHeatAthlete,
                            {key: i, athlete: a}
                        );
                    })
                )
            )
        ));
    }
}
