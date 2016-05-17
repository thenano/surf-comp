/* global Pusher */

import React from "react";
import * as EventActions from "../../../actions/event";
import { connect } from "react-redux";
import { fetch } from "../../../decorators";
import { ScoreCard } from "../../scoring";
import { Spinner } from "../../spinner";

var d = React.DOM;

class ConnectionIndicator extends React.Component {
    render() {
        return d.div(
            {className: `connection-indicator ${this.props.connected ? "connected" : "disconnected"}`},

            d.i({className: "fa fa-circle"})
        );
    }
}

class LoadingOverlay extends React.Component {
    render() {
        return d.div(
            {className: "loading"},

            d.div(
                {className: "content"},
                d.div({className: "message"}, this.props.message),
                React.createElement(Spinner, {})
            )
        );
    }
}

@fetch((store, r) => {
    store.dispatch(EventActions.getCurrentHeats(r.params.id));
})
@connect((state, props) => ({
    heats: state.events.getIn(["current_heats", parseInt(props.params.id)])
}))
export class LiveJudging extends React.Component {
    constructor(props, context) {
        super(props, context);

        let pusher = new Pusher("9228f4893a65786c6b33", {
            encrypted: true,
            authEndpoint: "/api/pubsubauth"
        });

        let channel = pusher.subscribe(`presence-${this.props.params.id}`);
        channel.bind("pusher:subscription_succeeded", this.connected.bind(this));
        channel.bind("pusher:subscription_error", this.disconnected.bind(this));

        let scoresChannel = pusher.subscribe(`scores-${this.props.params.id}`);
        scoresChannel.bind("pusher:subscription_succeeded", this.connected.bind(this));
        scoresChannel.bind("pusher:subscription_error", this.disconnected.bind(this));
        scoresChannel.bind("heat-started", this.heatStarted.bind(this));

        this.state = {
            channel: channel,
            scores: scoresChannel,
            connected: false
        };
    }

    heatStarted() {
        let { dispatch } = this.props;
        let event_id = this.props.params.id;

        dispatch(EventActions.getCurrentHeats(event_id));
    }

    disconnected() {
        this.setState({
            connected: false
        });
    }

    connected() {
        this.setState({
            connected: true
        });
    }

    renderConnected() {
        let heat = this.props.heats.get(0);
        return heat.get("start_time") ?
            React.createElement(
                ScoreCard,
                {heat, onBlur: () => {}, onClick: () => {}}
            ) :
            React.createElement(
                LoadingOverlay,
                {message: "Waiting for organiser to start heat..."}
            );
    }

    renderDisconnected() {
        return React.createElement(
            LoadingOverlay,
            {message: "Connecting..."}
        );
    }

    render() {
        return d.div(
            {id: "live-judging"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Live Scorecard"
                ),
            ),

            d.div(
                {className: "wrapper"},

                React.createElement(
                    ConnectionIndicator,
                    {connected: this.state.connected}
                ),

                this.state.connected ? 
                    this.renderConnected() :
                    this.renderDisconnected()
            )
        );
    }
}
