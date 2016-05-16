export function start(heat_id) {
    return {
        type: "START_HEAT",
        promise: api => api.patch(`heats/${heat_id}/start`)
    };
}

export function getResult(heat_id) {
    return {
        type: "GET_HEAT_RESULT",
        promise: api => api.get(`heats/${heat_id}`)
    };
}

export function addScore(heat_id, athlete_id, wave, score) {
    return {
        type: "ADD_HEAT_SCORE",
        promise: api => api.put(`heats/${heat_id}/add_score`, {
            score: {athlete_id, wave, score}
        })
    };
}
