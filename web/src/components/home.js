import * as UserActions from "../actions/user";
import React from "react"
import { link } from "./navigation"
import { Header } from "./header"
import { fetch } from "../decorators";
import { connect } from "react-redux";

var d = React.DOM;

@fetch((store) => {
    if (!store.loaded("users.current")) {
        // return store.dispatch(UserActions.getCurrentUser());
    }
})
@connect(state => ({users: state.users}))
export class Home extends React.Component {
    render() {
        return d.div(
            {},

            React.createElement(Header, this.props),
            d.h1({}, "surf competitions"),
            link("login", {to: "/login"})
        );
    }
}
