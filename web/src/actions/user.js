export function getCurrentUser() {
    return {
        type: "GET_CURRENT_USER",
        promise: api => api.get("users/current")
    };
}

export function login(email, pass) {
    return {
        type: "LOGIN_USER",
        promise: api => api.post("users/sign_in", {
            email: email,
            password: pass
        })
    };
}

export function logout() {
    return {
        type: "LOGOUT_USER",
        promise: api => api.delete("users/sign_out")
    };
}

export function registerFacebook(response) {
    var cookie_name = "fbsr_1569714466676200";
    document.cookie = `${cookie_name}=${response.authResponse.signedRequest}`;
    return {
        type: "REGISTER_FB_USER",
        promise: api => api.post("users/auth/facebook/callback",
                                 {})
    };
}

export function register(email, name, pass) {
    return {
        type: "REGISTER_USER",
        promise: api => api.post("users", {
            email: email,
            name: name,
            password: pass
        })
    };
}
