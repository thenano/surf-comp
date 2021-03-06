import * as UserActions from "../../actions/user";
import * as forms from "../forms";
import React from "react";
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import { facebookLogin } from "../facebook";

var d = React.DOM;

@connect(state => state)
export class SignUp extends forms.ValidatedForm {
    // eslint-disable-next-line no-unused-vars
    validate(model) {
        return {};
    }

    send(model) {
        this.setState({ submitting: true });
        let { dispatch } = this.props;

        return dispatch(
            UserActions.register(
                model.get("email"),
                model.get("name"),
                model.get("password")
            )
        )
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
        })
        .then(() => {
            browserHistory.push("/");
        });
    }

    render() {
        return d.div(
            {id: "sign-up", className: "page"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Sign up"
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
                    {action: "/sign-up", method: "POST"},

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

                    forms.text(
                        "Full Name",
                        "name",
                        {
                            errors: this.errors("name"),
                            onChange: this.set("name"),
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

                    forms.submit("Create Account", this.submit.bind(this), this.state.submitting)
                )
            )
        );
    }
}
