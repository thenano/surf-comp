import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state=defaultState, action) {
    switch (action.type) {
    case "REGISTER_FB_USER":
    case "REGISTER_USER":
    case "GET_CURRENT_USER":
        return state
            .set("current", Immutable.fromJS(action.res.data.user))
            .setIn(["meta", "@@loaded/current"], true);
    case "LOGIN_USER":
        return state
            .set("current", Immutable.fromJS(action.res.data))
            .setIn(["meta", "@@loaded/current"], true);
    case "LOGOUT_USER":
        return state.set("current", null);
    default:
        return state;
    }
}
