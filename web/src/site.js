import React from "react"
import ReactDOM from "react-dom"
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import * as reducers from "./reducers"
import { Application } from "./components/application"
import { Home } from "./components/home"
import { NotFound } from "./components/navigation"
import { LoginForm } from "./components/login"
import { EditTimetable } from "./components/timetables"
import { SignUp } from "./components/sign-up"
import { api } from "./actions/api"
import { promises } from "./reducers/middleware"
import { addLoaded } from "./enhancers";

const reducer = combineReducers(reducers);
const store = compose(
    addLoaded,
    applyMiddleware(promises(api()))
)(createStore)(reducer, {});

function r(path, component) {
    let { onEnter } = component;

    let props = { path, component };
    if (onEnter) {
        props.onEnter = onEnter(store);
    }

    return React.createElement(Route, props);
}

const home = () => {
    return React.createElement(IndexRoute, {
        component: Home
    });
}

ReactDOM.render(
    React.createElement(
        Provider,
        {store},

        React.createElement(
            Router,
            {history: browserHistory},

            React.createElement(
                Route,
                {path: "/", component: Application, onEnter: Application.onEnter(store)},

                home(),
                r("/login", LoginForm),
                r("/sign-up", SignUp),
                r("/timetables", EditTimetable),
                r("*", NotFound)
            )
        )
    ),
    document.getElementById("render")
)
