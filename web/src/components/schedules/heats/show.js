import React from "react";

var d = React.DOM;

class ShowHeatAthlete extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let { athlete } = this.props;

        return d.li(
            {className: "athlete"},
            athlete.name
        );
    }
}

export class ShowHeat extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return d.div(
            {key: this.props.key, className: "heat"},

            d.header(
                {className: "title"},
                `Heat ${this.props.id}`,
                d.sup({}, this.props.division)
            ),

            d.ol(
                {className: "athletes"},

                this.props.athletes.map((a, i) => {
                    return React.createElement(
                        ShowHeatAthlete,
                        {key: i, athlete: a}
                    );
                })
            )
        );
    }
}
