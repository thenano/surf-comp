import React from "react";

var d = React.DOM;

export class TestCable extends React.Component {
    constructor(props, context) {
        super(props, context);
        let pusher = new Pusher('9228f4893a65786c6b33', {
            encrypted: true
        });

        let channel = pusher.subscribe('scores_channel');
        channel.bind('score_added', function(data) {
            console.log(data.message);
            // this.setState({
            //     data: data
            // });
        }.bind(this));

        this.state = {
            data: ''
        }
    }
    render() {
        return d.div({}, this.state.data);
    }
}
