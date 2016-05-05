export function list() {
    return {
        type: "GET_EVENTS",
        promise: api => api.get("events")
    };
}

export function getSchedule(event_id) {
    return {
        type: "GET_EVENT_SCHEDULE",
        promise: api => api.get(`events/${event_id}/schedule`)
    };
}

export function get(event_id) {
    return {
        type: "GET_EVENT",
        promise: api => api.get(`events/${event_id}`)
    };
}

export function save(event_id, schedule) {
    return {
        type: "SAVE_EVENT_SCHEDULE",
        promise: api => api.patch(`events/${event_id}`, {
            event: {
                schedule: schedule.map(bank => bank.reverse().skipWhile(i => i === 0).reverse()).toJSON()
            }
        })
    };
}
