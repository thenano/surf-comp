import React from "react";
import { Field } from "../field";

var d = React.DOM;

class DatePicker extends Field {
    constructor(props, context) {
        super(props, context);
        this.state = {focus: false};
    }

    render() {
        return d.div(
            {className: [this.props.name, "field", this.state.focus ? "focus" : "", this.errorClass()].join(" ") },
            d.label({htmlFor: this.props.name}, this.props.label),
            d.input(Object.assign({
                onFocus: () => this.setState({focus: true}),
                onBlur: () => this.setState({focus: false})
            }, this.props)),
            this.hasErrors() ? d.div({className: `error-message ${this.props.name}-error`}, this.errorMessages()) : null
        );
    }
}

export function date(label, name, options) {
    let props = Object.assign({}, options, {label: label, name: name, type: "date"});
    return React.createElement(DatePicker, props);
}
