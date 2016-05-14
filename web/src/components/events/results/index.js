import React from "react";
import * as EventActions from "../../../actions/event";
import { fetch } from "../../../decorators";
import { connect } from "react-redux";

var d = React.DOM;

@fetch((store, r) => {
    if (!store.loaded(`events.${r.params.id}`)) {
        return store
            .dispatch(EventActions.get(r.params.id));
    }
})
@connect(state => ({events: state.events}))
export class Results extends React.Component {
    render() {
        const { events } = this.props;
        let event = events.get(Number.parseInt(this.props.params.id));

        return d.div(
            {id: "results"},

            d.h1(
                {},
                d.div(
                    {className: "wrapper"},
                    `Results: ${event.get("name")}`
                ),
            ),

            d.div(
                {className: "wrapper round-results"},

                d.h2({}, "Round 1"),
            )
        );
    }
}
