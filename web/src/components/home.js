import React from "react"
import { link } from "./navigation"

var d = React.DOM;

export class Home extends React.Component {
    render() {
        return d.div(
            {},

            d.h1({}, "surf competitions"),

            link("login", {to: "/login"})
        );
    }
}
