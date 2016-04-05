import request from "axios";

var base = "http://localhost:3000";

const CONFIG = {
    withCredentials: true
};

const urlTo = (resource) => {
    return `${base}/${resource}`;
};

export function api(cookie) {
    let headers = {};

    if (cookie) {
        headers.cookie = cookie;
    }

    let opts = Object.assign({}, CONFIG, { headers: headers });

    return {
        get: (resource) => {
            return request.get(
                urlTo(resource),
                opts
            );
        },

        post: (resource, data) => {
            return request.post(
                urlTo(resource),
                data,
                opts
            );
        }
    };
}
