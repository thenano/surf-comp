import request from "axios";

var base = "/api";

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
        delete: (resource) => {
            return request.delete(
                urlTo(resource),
                opts
            );
        },

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
        },

        put: (resource, data) => {
            return request.put(
                urlTo(resource),
                data,
                opts
            );
        },

        patch: (resource, data) => {
            return request.patch(
                urlTo(resource),
                data,
                opts
            );
        }
    };
}
