import Immutable from "immutable";

const defaultState = new Immutable.Map();

export function reducer(state=defaultState, action) {
    switch (action.type) {
    case "ADD_HEAT_SCORE":
    case "GET_HEAT_RESULT":
        return state
            .set(action.res.data.id, Immutable.fromJS(action.res.data))
            .setIn(["meta", `@@loaded/${action.res.data.id}`], true);
    default:
        return state;
    }
}
