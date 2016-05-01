import React from "react";
import { Link } from "react-router";

var d = React.DOM;

function link(props, ...children) {
    return React.createElement(
        Link, props, ...children
    );
}

export class Beard extends React.Component {
    render() {
        return d.div(
            {id: "beard"},

            d.div(
                {id: "beard-lists"},

                d.ul(
                    {id: "about"},
                    d.h3({}, "About"),
                    d.li(
                        {},
                        link({to: "/contact"}, "Contact Us")
                    ),
                    d.li(
                        {},
                        d.a({href: "#"}, "Source Code")
                    )
                )
            ),

            d.h3(
                {id: "made-with-love"},
                "Made with ",
                d.i({className: "love fa fa-heart"}),
                " in Bondi Beach"
            )
        );
    }
}
