import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { Router, Route, IndexRoute, browserHistory } from "react-router";

import * as reducers from "./reducers";
import { api } from "./actions/api";
import { promises } from "./reducers/middleware";
import { addLoaded } from "./enhancers";

import { Application } from "./components/application";
import { Home } from "./components/home";
import { NotFound } from "./components/navigation";
import { LoginForm } from "./components/login";
import { EditSchedule } from "./components/events/schedules/edit";
import { SignUp } from "./components/sign-up";
import { EditHeats } from "./components/heats/edit";
import { ShowEvent } from "./components/events/show";
import { ShowSchedule } from "./components/events/schedules/show";
import { LiveJudging } from "./components/events/judging";
import { Scoring } from "./components/scoring";
import { Results } from "./components/events/results";

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
};

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
                r("/events/:id", ShowEvent),
                r("/events/:id/schedule", ShowSchedule),
                r("/events/:id/schedule/edit", EditSchedule),
                r("/events/:id/division/:division_id/edit", EditHeats),
                r("/events/:id/scoring", LiveJudging),
                r("/events/:id/backup-scoring", Scoring),
                // r("/events/:id/results", Results),
                r("*", NotFound)
            )
        )
    ),
    document.getElementById("render")
);
