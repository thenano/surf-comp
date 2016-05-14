import Immutable from "immutable";
import React from "react";
import ReactDOM from "react-dom";
import { Field } from "./field";
import { Spinner } from "../spinner";
import { FloatingActionButton } from "./buttons";

var d = React.DOM;

export function floatingActionButton(icon, submit, isSubmitting) {
    return React.createElement(FloatingActionButton, {icon, onClick: submit, isSubmitting});
}

function spinner(props) {
    return React.createElement(Spinner, props);
}

class Submit extends React.Component {
    render() {
        return d.div(
            {className: "submission"},

            d.button({
                className: "submit " + (this.props.isSubmitting ? "disabled" : ""),
                onClick: this.props.submit,
                disabled: this.props.isSubmitting
            }, this.props.label),

            spinner({
                style: {
                    display: this.props.isSubmitting ? "inline-block" : "none"
                }
            })
        );
    }
}

export const submit = function(label, submit, isSubmitting) {
    return React.createElement(Submit, {label, submit, isSubmitting});
};

class Text extends Field {
    constructor(props, context) {
        super(props, context);
        this.state = {focus: false};
    }

    render() {
        let onBlur = (e) => {
            this.setState({focus: false});
            if (typeof this.props.onBlur == "function") {
                this.props.onBlur(e);
            }
        };

        return d.div(
            {className: [this.props.name, "field", this.state.focus ? "focus" : "", this.errorClass()].join(" ") },
            d.label({htmlFor: this.props.name}, this.props.label),
            d.input(Object.assign({
                onFocus: () => this.setState({focus: true})
            }, this.props, {onBlur})),
            this.hasErrors() ? d.div({className: `error-message ${this.props.name}-error`}, this.errorMessages()) : null
        );
    }
}

export const text = function(label, name, options) {
    let props = Object.assign({}, options, {label: label, name: name, type: "text"});
    return React.createElement(Text, props);
};

export const password = function(label, name, options) {
    let props = Object.assign({}, options, {label: label, name: name, type: "password"});
    return React.createElement(Text, props);
};

export const number = function(label, name, options) {
    let props = Object.assign({}, options, {errors: Immutable.Seq(), label: label, name: name, type: "text", pattern: "[0-9]*", inputmode: "numeric"});
    return React.createElement(Text, props);
};

class TextAreaAutoresize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {height: "0px"};
    }

    real() {
        return ReactDOM.findDOMNode(this).getElementsByClassName("real")[0];
    }

    heightProxy() {
        return ReactDOM.findDOMNode(this).getElementsByClassName("heightProxy")[0];
    }

    resizeToHeightProxy() {
        var heightProxy = this.heightProxy();

        heightProxy.style.height = "0px";
        var scrollHeight = heightProxy.scrollHeight;
        this.setState({height: scrollHeight + "px"});
    }

    resizeToValue() {
        var real = this.real(),
            heightProxy = this.heightProxy();

        heightProxy.value = real.value;
        this.resizeToHeightProxy();
    }

    resizeToPlaceholder() {
        var real = this.real(),
            heightProxy = this.heightProxy();

        if (real.attributes.placeholder) {
            heightProxy.value = real.attributes.placeholder.value;
            this.resizeToHeightProxy();
        }
    }

    resize() {
        if (ReactDOM.findDOMNode(this).getElementsByClassName("real")[0].value) {
            this.resizeToValue();
        } else {
            this.resizeToPlaceholder();
        }
    }

    changed(e) {
        this.resize();
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    componentDidMount() {
        this.resize();
    }

    render() {
        let textareaProps = Object.assign(
            {},
            this.props,
            {
                maxLength: null,
                className: "real " + this.props.className,
                onChange: this.changed.bind(this),
                style: {
                    overflow: "hidden",
                    height: this.state.height
                }
            }
        );

        return d.div({style: {position: "relative"}},
            d.textarea({
                className: "heightProxy",
                style: {
                    overflow: "hidden",
                    visibility: "hidden",
                    position: "absolute"
                }
            }),

            d.textarea(textareaProps)
        );
    }
}

class TextArea extends Field {
    constructor(props, context) {
        super(props, context);
        this.state = {value: "", focus: false};
    }

    hasInfo() {
        return typeof this.props.maxLength !== "undefined";
    }

    infoMessages() {
        if (this.hasInfo()) {
            return `${this.state.value.length} / ${this.props.maxLength}`;
        } else {
            return "";
        }
    }

    proxyOnChange(e) {
        this.setState({value: e.target.value});

        if (typeof this.props.onChange === "function") {
            this.props.onChange(e);
        }
    }

    render() {
        return d.div(
            {className: ["field", this.state.focus ? "focus" : "", this.errorClass()].join(" ") },
            d.label({htmlFor: this.props.name}, this.props.label),
            React.createElement(TextAreaAutoresize, Object.assign({}, {
                onFocus: () => this.setState({focus: true}),
                onBlur: () => this.setState({focus: false})
            }, this.props, {
                onChange: this.proxyOnChange.bind(this)
            })),
            this.hasErrors() ? d.div({className: `error-message ${this.props.name}-error`}, this.errorMessages()) : null,
            this.hasInfo() ? d.div({className: `info-message ${this.props.name}-info`}, this.infoMessages()) : null
        );
    }
}

export const textarea = function(label, name, options) {
    let props = Object.assign({}, options, {label: label, name: name});
    return React.createElement(TextArea, props);
};

export class ValidatedForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = { model: new Immutable.Map() };
    }

    set(field) {
        let setter = (e) => {
            let updated = this.state.model.set(field, e.target.value);
            let errors = Immutable.fromJS(this.validate(updated.toJS()));

            let fieldErrors = errors.get(field, Immutable.Set(errors[field]));
            updated = updated.setIn(["errors", field], fieldErrors);

            this.setState({
                model: updated
            });
        };

        return setter.bind(this);
    }

    submit(e) {
        e.preventDefault();
        e.stopPropagation();

        let errors = Immutable.fromJS(this.validate(this.state.model.toJS()));

        if (errors.isEmpty()) {
            this.setState({submitting: true});

            this.send(this.state.model)
                .catch(e => {
                    this.setState({
                        error: e,
                        submitting: false
                    });
                });
        } else {
            let updated = errors.reduce((c, msgs, field) => {
                return c.setIn(["errors", field], msgs);
            }, this.state.model);

            this.setState({
                model: updated
            });
        }
    }

    errors(field) {
        return this.state.model.getIn(["errors", field], Immutable.Set());
    }
}

export { date } from "./date";
