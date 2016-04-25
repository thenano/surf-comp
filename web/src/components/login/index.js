import * as forms from "../forms";
import React from "react";
import * as UserActions from "../../actions/user";
import { connect } from "react-redux";

var d = React.DOM;

@connect(state => state)
export class LoginForm extends forms.ValidatedForm {
    validate(model) {
        return {};
    }

    send(model) {
        this.setState({ submitting: true });

        let { dispatch } = this.props;

        return dispatch(
            UserActions.login(
                model.get("email"),
                model.get("password")
            )
        ).then(() => {
            // todo - redirect back to where they were going?
            this.props.history.pushState({}, "/");
        })
        .catch(e => {
            this.setState({ submitting: false });

            if (e.status == 401) {
                this.setState({
                    error: "Incorrect email or password"
                });
            } else {
                this.setState({
                    error: `The was an unexpected problem: ${e.data}`
                });
            }
        });
    }

    loginWithFacebook() {
        this.setState({ submitting: true });
        let { dispatch } = this.props;

        return new Promise((resolve, reject) => {
            FB.login(function(response) {
                if (response.authResponse) {
                    resolve(dispatch(UserActions.registerFacebook(response)));
                } else {
                    reject(response);
                }
            }, {scope: "public_profile,email"})
        })
        .then(() => {
            this.props.history.pushState({}, `/`);
        });
    }

    render() {
        return d.div(
            {id: "login", className: "page"},

            d.h2({}, "Login"),

            d.button({onClick: this.loginWithFacebook.bind(this)}, "Facebook"),

            d.form(
                {},

                d.div(
                    {
                        className: "notification error plain",
                        style: {
                            display: this.state.error ? "block" : "none"
                        }
                    },
                    this.state.error
                ),

                forms.text(
                    "Email",
                    "email",
                    {
                        errors: this.errors("email"),
                        placeholder: "email@example.com",
                        onChange: this.set("email"),
                        disabled: this.state.submitting
                    }
                ),

                forms.password(
                    "Password",
                    "password",
                    {
                        errors: this.errors("password"),
                        placeholder: "super secret",
                        onChange: this.set("password"),
                        type: "password",
                        disabled: this.state.submitting
                    }
                ),

                forms.submit("Login", this.submit.bind(this), this.state.submitting)
            )
        );
    }
}
