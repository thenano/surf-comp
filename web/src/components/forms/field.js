import React from "react";

export class Field extends React.Component {
    errorClass() {
        return this.hasErrors() ? "error" : "";
    }

    hasErrors() {
        return !this.props.errors.isEmpty();
    }

    errorMessages() {
        return this.props.errors.join(", ");
    }
}

