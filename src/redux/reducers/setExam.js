import * as setExamActions from '../actions/setExam';

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
    user: {
        loading: false,
        result: {},
        error: null,
    }
}

export default function setExamReducer(state = initState, action) {
    switch(action.type) {
        // get a set Exam
        case setExamActions.GET_SETEXAM:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case setExamActions.GET_SETEXAM_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case setExamActions.GET_SETEXAM_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // delete a set Exam
        case setExamActions.DELETE_SETEXAM:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case setExamActions.DELETE_SETEXAM_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case setExamActions.DELETE_SETEXAM_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // delete a file of set Exam
        case setExamActions.DELETE_FILE_SETEXAM:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case setExamActions.DELETE_FILE_SETEXAM_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case setExamActions.DELETE_FILE_SETEXAM_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // upload set Exam
        case setExamActions.UPLOAD_SETEXAM:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case setExamActions.UPLOAD_SETEXAM_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case setExamActions.UPLOAD_SETEXAM_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // add user to set Exam
        case setExamActions.ADD_USER_TO_SETEXAM:
            return {
                ...state,
                user: { ...state.user, loading: true },
            };
        case setExamActions.ADD_USER_TO_SETEXAM_SUCCESS:
            return {
                ...state,
                user: { ...state.user, loading: false, result: action.result },
            };
        case setExamActions.ADD_USER_TO_SETEXAM_FAILED:
            return {
                ...state,
                user: { ...state.user, loading: false, error: action.error },
            };
        // get user's set Exam
        case setExamActions.GET_USER_SETEXAM:
            return {
                ...state,
                user: { ...state.user, loading: true },
            };
        case setExamActions.GET_USER_SETEXAM_SUCCESS:
            return {
                ...state,
                user: { ...state.user, loading: false, result: action.result },
            };
        case setExamActions.GET_USER_SETEXAM_FAILED:
            return {
                ...state,
                user: { ...state.user, loading: false, error: action.error },
            };
        default:
            return state;
    }
}