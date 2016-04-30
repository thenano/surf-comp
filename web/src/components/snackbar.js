import React from "react";
import ReactDOM from "react-dom";

var d = React.DOM;

export class Snackbar extends React.Component {
    render() {
        return d.div(
            {className: "snackbar"},

            this.props.message
        )
    }
}
