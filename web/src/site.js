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
import { api } from "./actions/api"
import { promises } from "./reducers/middleware"

const reducer = combineReducers(reducers);
const store = compose(
    applyMiddleware(promises(api()))
)(createStore)(reducer, {});

function r(path, component) {
    let props = { path, component };
    return React.createElement(Route, props);
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
                {path: "/", component: Home}
            ),

            r("/login", LoginForm),

            r("*", NotFound)
        )
    ),
    document.getElementById("render")
)
