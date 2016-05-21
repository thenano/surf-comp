/* global Pusher */

import React from "react";
import Immutable from "immutable";

export function decorator() {
    return DecoratedComponent => class D extends React.Component {
        constructor(props, context) {
            super(props, context);

            let pusher = new Pusher("9228f4893a65786c6b33", {
                encrypted: true,
                authEndpoint: "/api/pubsubauth"
            });

            let scoresChannel = pusher.subscribe(
                `scores-${this.props.params.id}`
            );

            scoresChannel.bind(
                "score-changed",
                this.scoreReceived.bind(this)
            );

            this.state = {
                pusher,
                scores: scoresChannel,
                liveScores: Immutable.Map()
            };
        }

        componentWillUnmount() {
            this.state.pusher.disconnect();
        }

        scoreReceived(m) {
            let heat = Immutable.fromJS(m.message);
            this.setState({
                liveScores: this.state.liveScores.set(
                    heat.get("id"),
                    heat.get("result")
                )
            });
        }

        render() {
            return React.createElement(
                DecoratedComponent,
                Object.assign({}, {...this.props}, this.state)
            );
        }
    };
}
