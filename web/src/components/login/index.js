import * as forms from "../forms";
import React from "react";
import { browserHistory } from "react-router";

import * as UserActions from "../../actions/user";
import { connect } from "react-redux";
import { facebookLogin } from "../facebook";

var d = React.DOM;

@connect(state => state)
export class LoginForm extends forms.ValidatedForm {
    validate() {
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
            browserHistory.push("/");
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

    render() {
        return d.div(
            {id: "login", className: "page"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Login"
                ),
            ),

            d.div(
                {className: "wrapper"},

                facebookLogin({
                    onClick: () => { this.setState({submitting: true}); },
                    onLogin: () => { browserHistory.push("/"); }
                }),

                d.h2({}, "or"),

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
            )
        );
    }
}
