import request from "axios";
import { browserHistory } from "react-router";

var base = "/api";

const CONFIG = {
    withCredentials: true
};

const urlTo = (resource) => {
    return `${base}/${resource}`;
};

function handleCall(apiCall) {
    return apiCall.catch(e => {
        if (e.status !== 401) {
            return Promise.reject(e);
        } else {
            browserHistory.push('/login');
        }
    });
}

export function api(cookie) {
    let headers = {};

    if (cookie) {
        headers.cookie = cookie;
    }

    let opts = Object.assign({}, CONFIG, { headers: headers });

    return {
        delete: (resource) => {
            return handleCall(request.delete(
                urlTo(resource),
                opts
            ));
        },

        get: (resource) => {
            return handleCall(request.get(
                urlTo(resource),
                opts
            ))
        },

        post: (resource, data) => {
            return handleCall(request.post(
                urlTo(resource),
                data,
                opts
            ));
        },

        put: (resource, data) => {
            return handleCall(request.put(
                urlTo(resource),
                data,
                opts
            ));
        },

        patch: (resource, data) => {
            return handleCall(request.patch(
                urlTo(resource),
                data,
                opts
            ));
        }
    };
}
