import * as EventActions from "../actions/event";
import React from "react";
import Immutable from "immutable";
import { Beard } from "./beard";
import { link } from "./navigation";
import { connect } from "react-redux";
import { fetch } from "../decorators";

import heroVideo from "../assets/v/perth.compressed.mp4";

var d = React.DOM;

@fetch((store) => {
    if (!store.loaded("events.list")) {
        return store.dispatch(EventActions.list());
    }
})
@connect(state => ({events: state.events}))
export class Home extends React.Component {
    render() {
        const { events } = this.props;

        return d.div(
            {},

            d.header(
                {id: "hero"},

                d.div(
                    {id: "hero-video"},
                    d.video(
                        {
                            loop: "loop",
                            autoPlay: "autoplay",
                            preload: "auto",
                            src: heroVideo
                        },
                    )
                ),

                d.div(
                    {id: "hero-content"},

                    d.h1({}, "Bondi Boardriders")
                ),

            ),

            d.div(
                {className: "wrapper"},

                d.h2({}, "Upcoming Events"),

                d.ul(
                    {className: "event-list"},

                    events.get("list", new Immutable.List()).map(event => {
                        return d.ul(
                            {key: event.get("id"), className: "event"},
                            link(event.get("name"), {to: `/events/${event.get("id")}`})
                        );
                    })
                )
            ),


            React.createElement(Beard, {})
        );
    }
}
