import * as EventActions from "../actions/event";
import React from "react"
import { link } from "./navigation"
import { fetch } from "../decorators";
import { connect } from "react-redux";

var d = React.DOM;

@fetch((store) => {
    console.log('fetching');
    if (!store.loaded("events.all")) {
        return store.dispatch(EventActions.list());
    }
})
@connect(state => ({events: state.events}))
export class Events extends React.Component {
    render() {
        const { events } = this.props;
        let eventList = events.get("all");
        
        return d.div(
            {},

            d.h1({}, "All events"),

            eventList.map((event) => {
                return d.div(
                    {},
                    link(`${event.get("name")}: ${event.get("date")}`, {to: `/events/${event.get("id")}/schedule/edit`})
                )
            })
        );
    }
}
