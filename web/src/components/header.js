import * as UserActions from "../actions/user";
import React from "react";
import { Link } from "react-router";
import { connect } from "react-redux";

var d = React.DOM;

@connect(state => state)
export class Header extends React.Component {
    logout(e) {
        const { dispatch } = this.props;

        e.preventDefault();
        e.stopPropagation();

        dispatch(UserActions.logout()).then(() => {
            this.props.history.pushState({}, `/`);
        });
    }

    render() {
        const { users } = this.props;

        if (users.hasIn(["current", "name"])) {
            return d.header(
                {id: "site-header"},
                d.div(
                    {},
                    d.span(
                        {id: "logo"},
                        React.createElement(
                            Link, {to: "/"},
                            d.img({src: "/img/logo-small.png", alt: "surf"})
                        )
                    ),
                    d.span(
                        {id: "account-actions"},
                        d.span(
                            {className: "logged-in-user"},
                            users.getIn(["current", "name"])
                        ),
                        " | ",
                        d.span(
                            {id: "logout"},
                            d.a({onClick: this.logout.bind(this), href: "/logout"}, "logout")
                        )
                    )
                )
            );
        } else {
            return d.header(
                {id: "site-header"},
                d.div(
                    {},
                    d.span(
                        {id: "logo"},
                        React.createElement(
                            Link, {to: "/"},
                            "site-name"
                            // d.img({src: "/img/logo-small.png", alt: "surf"})
                        )
                    ),
                    d.span(
                        {id: "account-actions"},
                        React.createElement(Link, {href: "/login", to: "/login", className: "login"}, "login")
                    )
                )
            );
        }
    }
}
