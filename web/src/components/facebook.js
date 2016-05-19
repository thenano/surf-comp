import React from "react";
import * as UserActions from "../actions/user";
import { connect } from "react-redux";

var d = React.DOM;

@connect(state => state)
export class FacebookLogin extends React.Component {
    signUpWithFacebook() {
        let { dispatch } = this.props;

        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-undef
            FB.login(function(response) {
                if (response.authResponse) {
                    resolve(dispatch(UserActions.registerFacebook(response)));
                } else {
                    reject(response);
                }
            }, {scope: "public_profile,email"});
        })
        .then(() => {
            this.props.onLogin ?
                this.props.onLogin() : null;
        });
    }

    render() {
        let { onClick } = this.props;

        let wrappedOnClick = (e) => {
            onClick(e);
            this.signUpWithFacebook();
        };

        return d.button(
            {className: "fb-login", onClick: wrappedOnClick},
            d.i({className: "fa fa-facebook-square"}),
            d.span({}, "Login With Facebook")
        );
    }
}

export function facebookLogin(props) {
    return React.createElement(
        FacebookLogin,
        props
    );
}
