import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state = defaultState, action) {
    switch (action.type) {
        case "SAVE_SCHEDULE":
        case "GET_SCHEDULE":
            return state
                .setIn(["schedules", action.res.data.id], Immutable.fromJS(action.res.data))
                .setIn(["meta", `@@loaded/schedules/${action.res.data.id}`], true);
        case "LIST_ALL":
            return state
                .set("all", Immutable.fromJS(action.res.data))
                .setIn(["meta", "@@loaded/all"], true);
        default:
            return state;
    }
}
