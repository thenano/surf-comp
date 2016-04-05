import React from "react"
import { Link } from 'react-router'

var d = React.DOM;

export class NotFound extends React.Component {
    render() {
        return d.div(
            {},
            "not found"
        );
    }
}

export function link(children, props) {
    return React.createElement(Link, props, children);
}
