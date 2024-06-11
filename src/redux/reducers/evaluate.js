import * as evaluateActions from '../actions/evaluate';

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
}

export default function evaluateReducer(state = initState, action) {
    switch(action.type) {
        // get a course
        case evaluateActions.GET_EVALUATE:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case evaluateActions.GET_EVALUATE_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case evaluateActions.GET_EVALUATE_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // get a list of courses
        case evaluateActions.GET_EVALUATES:
            return {
                ...state,
                list: { ...state.list, loading: true },
            };
        case evaluateActions.GET_EVALUATES_SUCCESS:
            return {
                ...state,
                list: { ...state.list, loading: false, result: action.result },
            };
        case evaluateActions.GET_EVALUATES_FAILED:
            return {
                ...state,
                list: { ...state.list, loading: false, error: action.error },
            };
        // delete a course
        case evaluateActions.DELETE_EVALUATE:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case evaluateActions.DELETE_EVALUATE_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case evaluateActions.DELETE_EVALUATE_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // edit a course
        case evaluateActions.EDIT_EVALUATE:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case evaluateActions.EDIT_EVALUATE_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case evaluateActions.EDIT_EVALUATE_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error }
            }
        // create a course
        case evaluateActions.CREATE_EVALUATE:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case evaluateActions.CREATE_EVALUATE_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case evaluateActions.CREATE_EVALUATE_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        default:
            return state;
    }
}