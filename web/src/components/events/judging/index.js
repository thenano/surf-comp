import React from "react";
import Immutable from "immutable";
import * as HeatActions from "../../../actions/heat";
import { connect } from "react-redux";
import { ScoreCard } from "../../scoring";

var d = React.DOM;

@connect(state => state)
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

    heatStarted(message) {
        console.log(message);
        let { heat_id } = message;
        let { dispatch } = this.props;

        dispatch(
            HeatActions.getScoringDetails(heat_id)
        ).then(heat => {
            console.log(heat);
            this.setState({ heat });
        });
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
        return d.div(
            {},

            this.state.heat ?
                null :
                "Waiting for heat to start..."
        );
    }

    renderDisconnected() {
        return d.div(
            {},
            "Connecting to Event"
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

            this.state.connected ? 
                this.renderConnected() :
                this.renderDisconnected()
        )
    }
}
