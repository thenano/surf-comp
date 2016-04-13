import React from "react";

export function decorator(fn) {
    return DecoratedComponent => class D extends React.Component {
        static onEnter = store => {
            return (state, _, callback) => {
                let load = fn(store, state);

                if (typeof load !== "undefined") {
                    load.then(() => callback()).catch(err => callback(err));
                } else {
                    callback();
                }
            };
        };

        render() {
            return React.createElement(
                DecoratedComponent, {...this.props}
            );
        }
    };
}
