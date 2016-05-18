import React from "react";

var d = React.DOM;

export class ConnectionIndicator extends React.Component {
    render() {
        return d.div(
            {className: `connection-indicator ${this.props.connected ? "connected" : "disconnected"}`},

            d.i({className: "fa fa-circle"}),

            d.span(
                {className: "text"},
                !this.props.connected ? " Not" : "",
                " Connected"
            )
        );
    }
}

