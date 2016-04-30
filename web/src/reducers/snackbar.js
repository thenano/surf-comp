import Immutable from "immutable";

const defaultState = new Immutable.List();

export function reducer(state=defaultState, action) {
    switch (action.type) {
    case "SNACKBAR_ADD_MESSAGE":
        return state.push(action.message);
    case "SNACKBAR_CLEAR_MESSAGE":
        return state.slice(1);
    default:
        return state;
    }
}
