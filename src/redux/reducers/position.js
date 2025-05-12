import * as positionActions from '../actions/position';

const initState = {
    item: {
        loading: false,
        result: {},
        error: null,
    },
    list: {
        loading: false,
        result: {},
        error: null,
    },
    permissions: {
        loading: false,
        result: {},
        error: null,
    }
}

export default function positionReducer(state = initState, action) {
    switch(action.type) {
        // get permissions
        case positionActions.GET_PERMISSIONS:
            return {
                ...state,
                permissions: { ...state.permissions, loading: true },
            };
        case positionActions.GET_PERMISSIONS_SUCCESS:
            return {
                ...state,
                permissions: { ...state.permissions, loading: false, result: action.result },
            };
        case positionActions.GET_PERMISSIONS_FAILED:
            return {
                ...state,
                permissions: { ...state.permissions, loading: false, error: action.error },
            };
        // get a course
        case positionActions.GET_POSITION:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case positionActions.GET_POSITION_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case positionActions.GET_POSITION_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // get a list of courses
        case positionActions.GET_POSITIONS:
            return {
                ...state,
                list: { ...state.list, loading: true },
            };
        case positionActions.GET_POSITIONS_SUCCESS:
            return {
                ...state,
                list: { ...state.list, loading: false, result: action.result },
            };
        case positionActions.GET_POSITIONS_FAILED:
            return {
                ...state,
                list: { ...state.list, loading: false, error: action.error },
            };
        // delete a course
        case positionActions.DELETE_POSITION:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case positionActions.DELETE_POSITION_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case positionActions.DELETE_POSITION_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // edit a course
        case positionActions.EDIT_POSITION:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case positionActions.EDIT_POSITION_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case positionActions.EDIT_POSITION_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error }
            }
        // create a course
        case positionActions.CREATE_POSITION:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case positionActions.CREATE_POSITION_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case positionActions.CREATE_POSITION_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        default:
            return state;
    }
}