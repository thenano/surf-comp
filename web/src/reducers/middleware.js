export function promises(api) {
    return () => next => action => {
        const { promise, type, ...rest } = action;

        if (!promise) { return next(action); }

        const SUCCESS = type;
        const REQUEST = type + "_REQUEST";
        const FAILURE = type + "_FAILURE";

        next({ ...rest, type: REQUEST });

        return promise(api).then(res => {
            next({ ...rest, res, type: SUCCESS });
            return res.data;
        })
        .catch(error => {
            next({ ...rest, error, type: FAILURE });
            return Promise.reject(error);
        });
    };
}
