import "./application.less";

import * as UserActions from "../actions/user";
import * as SnackbarActions from "../actions/snackbar";
import React from "react";
import { fetch } from "../decorators";
import { connect } from "react-redux";
import { Header } from "./header";
import { Snackbar } from "./snackbar";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

var d = React.DOM;

@fetch((store) => {
    if (!store.loaded("users.current")) {
        return store.dispatch(UserActions.getCurrentUser())
    }
})
@connect(state => ({
    users: state.users,
    snackbar: state.snackbar
}))
export class Application extends React.Component {
    constructor(props, context) {
        super(props, context);

        const { snackbar } = props;

        this.state = {
            snacks: snackbar.slice(1),
            snackbar: snackbar.first()
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.state = {
            snacks: nextProps.snackbar.slice(1),
            snackbar: nextProps.snackbar.first()
        };
    }

    setTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(function() {
            this.setState({ snackbar: null });
            setTimeout(this.nextSnack.bind(this), 500);
            this.timer = null;
        }.bind(this), 3500);
    }

    nextSnack() {
        let { dispatch } = this.props;

        dispatch(SnackbarActions.clearLast());
    }

    render() {
        let { snackbar } = this.state;
        const { pathname } = this.props.location;

        if (snackbar) {
            this.setTimer();
        }

        return d.div(
            {id: pathname == "/" ? "home-container" : "page-container"},

            pathname.indexOf("spectate") == -1 ?
                React.createElement(Header, this.props) :
                null,

            this.props.children,

            React.createElement(
                ReactCSSTransitionGroup,
                {
                    transitionAppear: true,
                    transitionName: "snackbar",
                    transitionEnterTimeout: 500,
                    transitionAppearTimeout: 500,
                    transitionLeaveTimeout: 500
                },

                snackbar ?
                    React.createElement(Snackbar, {message: snackbar}) :
                    null
            )
        );
    }
}
