export const addLoaded = (next) => (reducer, initialState) => {
    let store = next(reducer, initialState);

    return {
        ...store,
        loaded: (path) => {
            var [top, ...rest] = path.split(".");

            if (store.getState()[top]) {
                return store.getState()[top].getIn(["meta", `@@loaded/${rest.join("/")}`]);
            } else {
                return false;
            }
        }
    };
};
