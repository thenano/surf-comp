export function getSchedule(event_id) {
    return {
        type: "GET_SCHEDULE",
        promise: api => api.get(`events/${event_id}/schedule`)
    };
}
