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
            this.props.history.pushState({}, "/");
        });
    }

    render() {
        const { users } = this.props;
        const { pathname } = this.props.location;

        if (users.hasIn(["current", "name"])) {
            return d.header(
                {id: "site-header", className: pathname == "/" ? "home-header" : ""},
                d.div(
                    {},
                    d.span(
                        {id: "logo"},
                        React.createElement(
                            Link, {to: "/"},
                            "home"
                            // d.img({src: "/img/logo-small.png", alt: "surf"})
                        )
                    ),
                    d.span(
                        {id: "account-actions"},
                        d.span(
                            {className: "logged-in-user"},
                            d.img({id: "profile-image", src: `//res.cloudinary.com/adventure/image/facebook/w_100,h_100,c_fill,r_max,g_face,bo_2px_solid_white/${users.getIn(["current", "uid"])}.png`}),
                            users.getIn(["current", "name"])
                        ),
                        " ",
                        d.span(
                            {id: "logout"},
                            d.a({onClick: this.logout.bind(this), href: "/logout"}, "logout")
                        )
                    )
                )
            );
        } else {
            return d.header(
                {id: "site-header", className: pathname == "/" ? "home-header" : ""},
                d.div(
                    {},
                    d.span(
                        {id: "logo"},
                        React.createElement(
                            Link, {to: "/"},
                            "home"
                            // d.img({src: "/img/logo-small.png", alt: "surf"})
                        )
                    ),
                    d.span(
                        {id: "account-actions"},
                        React.createElement(Link, {href: "/login", to: "/login", className: "login"}, "login"),
                        ' | ',
                        React.createElement(Link, {href: "/sign-up", to: "/sign-up", className: "login"}, "sign up"),
                    )
                )
            );
        }
    }
}
