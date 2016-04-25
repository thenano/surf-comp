import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state = defaultState, action) {
    switch (action.type) {
        case "SAVE_SCHEDULE":
        case "GET_SCHEDULE":
            return state
                .setIn(["ids", action.res.data.id], Immutable.fromJS(action.res.data))
                .setIn(["meta", `@@loaded/ids/${action.res.data.id}`], true);
        default:
            return state;
    }
}
