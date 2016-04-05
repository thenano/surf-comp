import React from "react";

var d = React.DOM;

export class Spinner extends React.Component {
    render() {
        return d.div(
            Object.assign({className: "spinner"}, this.props),
            d.div({className: "one"}),
            d.div({className: "two"}),
            d.div({className: "three"}),
            d.div({className: "four"})
        );
    }
}
