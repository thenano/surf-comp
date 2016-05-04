import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state = defaultState, action) {
    switch (action.type) {
        case "SAVE_EVENT_SCHEDULE":
        case "GET_EVENT_SCHEDULE":
            return state
                .setIn(["schedules", action.res.data.id], Immutable.fromJS(action.res.data))
                .setIn(["meta", `@@loaded/schedules/${action.res.data.id}`], true);
        case "GET_EVENTS":
            return state
                .set("list", Immutable.fromJS(action.res.data))
                .setIn(["meta", "@@loaded/list"], true);
        case "GET_EVENT":
            return state
                .set(action.res.data.id, Immutable.fromJS(action.res.data))
                .setIn(["meta", `@@loaded/${action.res.data.id}`], true);
        default:
            return state;
    }
}
