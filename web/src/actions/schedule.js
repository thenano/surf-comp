export function getSchedule(event_id) {
    return {
        type: "GET_SCHEDULE",
        promise: api => api.get(`events/${event_id}/schedule`)
    };
}

export function save(event_id, schedule) {
    let data = {
        event: {schedule: schedule.toJSON()}
    };
    return {
        type: "SAVE_SCHEDULE",
        promise: api => api.patch(`events/${event_id}`, data)
    };
}
