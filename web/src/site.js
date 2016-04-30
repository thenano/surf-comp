import React from "react"
import ReactDOM from "react-dom"
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import * as reducers from "./reducers"
import { api } from "./actions/api"
import { promises } from "./reducers/middleware"
import { addLoaded } from "./enhancers";

import { Application } from "./components/application"
import { Home } from "./components/home"
import { NotFound } from "./components/navigation"
import { LoginForm } from "./components/login"
import { EditTimetable } from "./components/timetables"
import { SignUp } from "./components/sign-up"
import { EditHeats } from "./components/heats/edit"
import { Events } from "./components/events"

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

const home = (store) => {
    return React.createElement(IndexRoute, {
        component: Home,
        onEnter: Home.onEnter(store)
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

                home(store),
                r("/login", LoginForm),
                r("/sign-up", SignUp),
                r("/events", Events),
                r("/events/:id/schedule/edit", EditTimetable),
                r("/events/:id/heats/edit", EditHeats),
                r("*", NotFound)
            )
        )
    ),
    document.getElementById("render")
)
