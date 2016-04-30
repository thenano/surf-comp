import React from "react";
import { Spinner } from "../spinner";

var d = React.DOM;

function spinner(props) {
    return React.createElement(Spinner, props);
}

export class FloatingActionButton extends React.Component {
    render() {
        return d.button(
            {
                onClick: this.props.onClick,
                className: "floating button secondary submit " + (this.props.isSubmitting ? "disabled" : "")
            },

            d.i({className: `fa fa-${this.props.icon}`}),

            spinner({
                style: {
                    display: this.props.isSubmitting ? "inline-block" : "none"
                }
            })
        );
    }
}
