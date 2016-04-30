export function clearLast() {
    return {
        type: "SNACKBAR_CLEAR_MESSAGE",
    };
}

export function message(m) {
    return {
        type: "SNACKBAR_ADD_MESSAGE",
        message: m
    };
}
