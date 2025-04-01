// Quản trị bộ đề thi
export const GET_SETEXAM = "GET_SETEXAM";
export const GET_SETEXAM_SUCCESS = "GET_SETEXAM_SUCCESS";
export const GET_SETEXAM_FAILED = "GET_SETEXAM_FAILED";

export const GET_USER_SETEXAM = "GET_USER_SETEXAM";
export const GET_USER_SETEXAM_SUCCESS = "GET_USER_SETEXAM_SUCCESS";
export const GET_USER_SETEXAM_FAILED = "GET_USER_SETEXAM_FAILED";

export const UPLOAD_SETEXAM = "UPLOAD_SETEXAM";
export const UPLOAD_SETEXAM_SUCCESS = "UPLOAD_SETEXAM_SUCCESS";
export const UPLOAD_SETEXAM_FAILED = "UPLOAD_SETEXAM_FAILED";

export const ADD_USER_TO_SETEXAM = "ADD_USER_TO_SETEXAM";
export const ADD_USER_TO_SETEXAM_SUCCESS = "ADD_USER_TO_SETEXAM_SUCCESS";
export const ADD_USER_TO_SETEXAM_FAILED = "ADD_USER_TO_SETEXAM_FAILED";

export const DELETE_SETEXAM = "DELETE_SETEXAM";
export const DELETE_SETEXAM_SUCCESS = "DELETE_SETEXAM_SUCCESS";
export const DELETE_SETEXAM_FAILED = "DELETE_SETEXAM_FAILED";

export const DELETE_FILE_SETEXAM = "DELETE_FILE_SETEXAM";
export const DELETE_FILE_SETEXAM_SUCCESS = "DELETE_FILE_SETEXAM_SUCCESS";
export const DELETE_FILE_SETEXAM_FAILED = "DELETE_FILE_SETEXAM_FAILED";

export function getSetExam(params, callback) {
    return {
        type: GET_SETEXAM,
        params,
        callback,
    };
}

export function getUserSetExam(params, callback) {
    return {
        type: GET_USER_SETEXAM,
        params,
        callback,
    };
}

export function AddUserToSetExam(params, callback) {
    return {
        type: ADD_USER_TO_SETEXAM,
        params,
        callback,
    };
}

export function UploadSetExam(params, callback) {
    return {
        type: UPLOAD_SETEXAM,
        params,
        callback,
    };
}

export function DeleteSetExam(params, callback) {
    return {
        type: DELETE_SETEXAM,
        params,
        callback,
    };
}

export function DeleteFileSetExam(params, callback) {
    return {
        type: DELETE_FILE_SETEXAM,
        params,
        callback,
    };
}

