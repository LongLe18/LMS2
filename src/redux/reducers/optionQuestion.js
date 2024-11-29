import * as optionQuestionActions from '../actions/optionQuestion';

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
    }
}

export default function optionQuestionReducer(state = initState, action) {
    switch(action.type) {
        // get a OPTIONQUESTON
        case optionQuestionActions.GET_OPTIONQUESTON:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case optionQuestionActions.GET_OPTIONQUESTON_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case optionQuestionActions.GET_OPTIONQUESTON_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // get a list of OPTIONQUESTONs
        case optionQuestionActions.GET_OPTIONQUESTONS:
            return {
                ...state,
                list: { ...state.list, loading: true },
            };
        case optionQuestionActions.GET_OPTIONQUESTONS_SUCCESS:
            return {
                ...state,
                list: { ...state.list, loading: false, result: action.result },
            };
        case optionQuestionActions.GET_OPTIONQUESTONS_FAILED:
            return {
                ...state,
                list: { ...state.list, loading: false, error: action.error },
            };
        // delete a OPTIONQUESTON
        case optionQuestionActions.DELETE_OPTIONQUESTON:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case optionQuestionActions.DELETE_OPTIONQUESTON_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case optionQuestionActions.DELETE_OPTIONQUESTON_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        // edit a OPTIONQUESTON
        case optionQuestionActions.EDIT_OPTIONQUESTON:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case optionQuestionActions.EDIT_OPTIONQUESTON_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case optionQuestionActions.EDIT_OPTIONQUESTON_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error }
            }
        // create a OPTIONQUESTON
        case optionQuestionActions.CREATE_OPTIONQUESTON:
            return {
                ...state,
                item: { ...state.item, loading: true },
            };
        case optionQuestionActions.CREATE_OPTIONQUESTON_SUCCESS:
            return {
                ...state,
                item: { ...state.item, loading: false, result: action.result },
            };
        case optionQuestionActions.CREATE_OPTIONQUESTON_FAILED:
            return {
                ...state,
                item: { ...state.item, loading: false, error: action.error },
            };
        default:
            return state;
    }
}