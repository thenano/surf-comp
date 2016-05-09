import React from "react";

var d = React.DOM;

export class Snackbar extends React.Component {
    render() {
        return d.div(
            {className: "snackbar"},

            this.props.message
        );
    }
}
