export const GET_OPTIONQUESTON = "GET_OPTIONQUESTON";
export const GET_OPTIONQUESTON_SUCCESS = "GET_OPTIONQUESTON_SUCCESS";
export const GET_OPTIONQUESTON_FAILED = "GET_OPTIONQUESTON_FAILED";

export const GET_OPTIONQUESTONS = "GET_OPTIONQUESTONS";
export const GET_OPTIONQUESTONS_SUCCESS = "GET_OPTIONQUESTONS_SUCCESS";
export const GET_OPTIONQUESTONS_FAILED = "GET_OPTIONQUESTONS_FAILED";

export const DELETE_OPTIONQUESTON = "DELETE_OPTIONQUESTON";
export const DELETE_OPTIONQUESTON_SUCCESS = "DELETE_OPTIONQUESTON_SUCCESS";
export const DELETE_OPTIONQUESTON_FAILED = "DELETE_OPTIONQUESTON_FAILED";

export const EDIT_OPTIONQUESTON = "EDIT_OPTIONQUESTON";
export const EDIT_OPTIONQUESTON_SUCCESS = "EDIT_OPTIONQUESTON_SUCCESS";
export const EDIT_OPTIONQUESTON_FAILED = "EDIT_OPTIONQUESTON_FAILED";

export const CREATE_OPTIONQUESTON = "CREATE_OPTIONQUESTON";
export const CREATE_OPTIONQUESTON_SUCCESS = "CREATE_OPTIONQUESTON_SUCCESS";
export const CREATE_OPTIONQUESTON_FAILED = "CREATE_OPTIONQUESTON_FAILED";

export function getOPTIONQUESTON(params, callback) {
    return {
        type: GET_OPTIONQUESTON,
        params,
        callback,
    };
}

export function getOPTIONQUESTONs(params, callback) {
    return {
        type: GET_OPTIONQUESTONS,
        params,
        callback,
    };
}

export function DeleteOPTIONQUESTON(params, callback) {
    return {
        type: DELETE_OPTIONQUESTON,
        params,
        callback,
    };
}

export function EditOPTIONQUESTON(params, callback) {
    return {
        type: EDIT_OPTIONQUESTON,
        params,
        callback,
    };
}

export function CreateOPTIONQUESTON(params, callback) {
    return {
        type: CREATE_OPTIONQUESTON,
        params,
        callback,
    };
}