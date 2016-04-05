import React from "react"

var d = React.DOM;

export class Application extends React.Component {
    render() {
        return d.div(
            { className: "wrapper" },
            this.props.children
        );
    }
}
