import React from "react";

var d = React.DOM;

export class ShowHeat extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return d.div(
            {key: this.props.key, className: "heat"},

            d.header(
                {className: "title"},
                `Heat ${this.props.id} | Division ${this.props.division}`
            ),

            d.div({}, "athletes go here")
        );
    }
}
