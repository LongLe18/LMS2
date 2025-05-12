export const GET_PERMISSIONS = "GET_PERMISSIONS";
export const GET_PERMISSIONS_SUCCESS = "GET_PERMISSIONS_SUCCESS";
export const GET_PERMISSIONS_FAILED = "GET_PERMISSIONS_FAILED";

export const GET_POSITION = "GET_POSITION";
export const GET_POSITION_SUCCESS = "GET_POSITION_SUCCESS";
export const GET_POSITION_FAILED = "GET_POSITION_FAILED";

export const GET_POSITIONS = "GET_POSITIONS";
export const GET_POSITIONS_SUCCESS = "GET_POSITIONS_SUCCESS";
export const GET_POSITIONS_FAILED = "GET_POSITIONS_FAILED";

export const CREATE_POSITION = "CREATE_POSITION";
export const CREATE_POSITION_SUCCESS = "CREATE_POSITION_SUCCESS";
export const CREATE_POSITION_FAILED = "CREATE_POSITION_FAILED";

export const EDIT_POSITION = "EDIT_POSITION";
export const EDIT_POSITION_SUCCESS = "EDIT_POSITION_SUCCESS";
export const EDIT_POSITION_FAILED = "EDIT_POSITION_FAILED";

export const DELETE_POSITION = "DELETE_POSITION";
export const DELETE_POSITION_SUCCESS = "DELETE_POSITION_SUCCESS";
export const DELETE_POSITION_FAILED = "DELETE_POSITION_FAILED";

export function getPermissions(params, callback) {
    return {
        type: GET_PERMISSIONS,
        params,
        callback,
    };
}

export function getPosition(params, callback) {
    return {
        type: GET_POSITION,
        params,
        callback,
    };
}

export function getPositions(params, callback) {
    return {
        type: GET_POSITIONS,
        params,
        callback,
    };
}

export function createPosition(params, callback) {
    return {
        type: CREATE_POSITION,
        params,
        callback,
    };
}

export function editPosition(params, callback) {
    return {
        type: EDIT_POSITION,
        params,
        callback,
    };
}

export function deletePosition(params, callback) {
    return {
        type: DELETE_POSITION,
        params,
        callback,
    };
}