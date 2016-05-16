import React from "react";
import Immutable from "immutable";
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

        this.state = {
            channel: channel,
            connected: false
        };
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

    render() {
        return d.div(
            {id: "live-judging"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    "Live Scorecard"
                ),

                null

                // React.createElement(
                //     ScoreCard,
                //     {
                //         heat: Immutable.fromJS({
                //             division: "groms"
                //         }),
                //         onBlur: () => {},
                //         onClick: () => {}
                //     }
                // )
            ),
        )
    }
}
