import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state=defaultState, action) {
    switch (action.type) {
    case "GET_SCHEDULE":
        return state
            .set("current", Immutable.fromJS(action.res.data))
            .setIn(["meta", "@@loaded/current"], true);
    default:
        return state;
    }
}
