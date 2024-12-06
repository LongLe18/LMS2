import { notification } from 'antd';
import { call, put, takeEvery } from 'redux-saga/effects';
import config from '../../configs/index';
import { getApi, postApiAuth, putApiAuth, deleteApiAuth } from '../services/api';
import * as actions from '../actions';
import { get } from 'lodash';

// /:id/... ID câu hỏi
function* fetchOptionQuestion(payload) {
    try {
        let endpoint = `${config.API_URL}/question/${payload.params.id}/get-option`;
        const response = yield call(getApi, endpoint);
        const result = yield response.data;
        yield put({ type: actions.optionQuestion.GET_OPTIONQUESTON_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.optionQuestion.GET_OPTIONQUESTON_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        notification.error({
            message: get(error, 'response.data.error', 'Tải dữ liệu Lựa chọn câu hỏi đã thất bại ' + messageError),
        });
    }
}

function* createOptionQuestion(payload) {
    try {
        let endpoint = config.API_URL + `/question/${payload.params.id}/add-option`;
        const response = yield call(postApiAuth, endpoint, payload.params.formData); 
        const result = yield response;
        yield put({ type: actions.optionQuestion.CREATE_OPTIONQUESTON_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.optionQuestion.CREATE_OPTIONQUESTON_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        notification.error({
            message: get(error, 'response.data.error', 'Thêm Lựa chọn câu hỏi mới thất bại ' + messageError),
        });
    }
}

function* editOptionQuestion(payload) {
    try {
        let endpoint = config.API_URL + `/question/update-option/${payload.params.optionId}`;
        const response = yield call(putApiAuth, endpoint, payload.params.formData); 
        const result = yield response;
        yield put({ type: actions.optionQuestion.EDIT_OPTIONQUESTON_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.optionQuestion.EDIT_OPTIONQUESTON_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        notification.error({
            message: get(error, 'response.data.error', 'Cập nhật thông tin Lựa chọn câu hỏi thất bại ' + messageError),
        });
    }
}

function* deleteOptionQuestion(payload) {
    try {
        let endpoint = config.API_URL + `/question/remove-option/${payload.params.optionId}`;
        const response = yield call(deleteApiAuth, endpoint); 
        const result = yield response;
        yield put({ type: actions.optionQuestion.DELETE_OPTIONQUESTON_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.optionQuestion.DELETE_OPTIONQUESTON_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        notification.error({
            message: get(error, 'response.data.error', 'Xóa Lựa chọn câu hỏi thất bại ' + messageError),
        });
    }
}

export function* loadOptionQuestion() {
    yield takeEvery(actions.optionQuestion.GET_OPTIONQUESTON, fetchOptionQuestion);
}

export function* loadAddOptionQuestion() {
    yield takeEvery(actions.optionQuestion.CREATE_OPTIONQUESTON, createOptionQuestion);
}

export function* loadEditOptionQuestion() {
    yield takeEvery(actions.optionQuestion.EDIT_OPTIONQUESTON, editOptionQuestion);
}

export function* loadDeleteOptionQuestion() {
    yield takeEvery(actions.optionQuestion.DELETE_OPTIONQUESTON, deleteOptionQuestion);
}