import React from "react"
import ReactDOM from "react-dom"
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import * as reducers from "./reducers"
import { Application } from "./components/application";
import { Home } from "./components/home";

const store = createStore(combineReducers(reducers))

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
            )
        )
    ),
    document.getElementById("render")
)
