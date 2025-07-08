import { notification } from 'antd';
import { call, put, takeEvery } from 'redux-saga/effects';
import config from '../../configs/index';
import { postApiAuth, deleteApiAuth, getApiAuth } from '../services/api';
import * as actions from '../actions';
import { get } from 'lodash';


function* fetchSetExam(payload) {
    try {
        let endpoint = `${config.API_URL}/course/${payload.params.id}/exam-set`;
        if (payload.params.user) {
            endpoint = `${config.API_URL}/course/u/${payload.params.id}/exam-set`;
        }
        if (payload.params.v2) {
            endpoint = `${config.API_URL}/course/${payload.params.id}/exam-set/v2`;
        }
        const response = yield call(getApiAuth, endpoint);
        const result = yield response.data;
        yield put({ type: actions.setExam.GET_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.GET_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Tải dữ liệu bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* fetchUserSetExam(payload) {
    try {
        let endpoint = `${config.API_URL}/examset-student/u`;
        const response = yield call(getApiAuth, endpoint);
        const result = yield response.data;
        yield put({ type: actions.setExam.GET_USER_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.GET_USER_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Tải dữ liệu bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* uploadSetExam(payload) {
    try {
        let endpoint = config.API_URL + `/course/${payload.params.id}/upload-file-exam`;
        const response = yield call(postApiAuth, endpoint, payload.params.formData); 
        const result = yield response;
        yield put({ type: actions.setExam.UPLOAD_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.UPLOAD_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Thêm bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* addUserToSetExam(payload) {
    try {
        let endpoint = config.API_URL + `/examset-student`;
        const response = yield call(postApiAuth, endpoint, payload.params.formData); 
        const result = yield response;
        yield put({ type: actions.setExam.ADD_USER_TO_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.ADD_USER_TO_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Thêm bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* deleteSetExam(payload) {
    try {
        let endpoint = config.API_URL + `/course/${payload.params.id}/exam-set`;
        const response = yield call(deleteApiAuth, endpoint); 
        const result = yield response;
        yield put({ type: actions.setExam.DELETE_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.DELETE_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* deleteFileSetExam(payload) {
    try {
        let endpoint = config.API_URL + `/course/file-exam/${payload.params.id}`;
        const response = yield call(deleteApiAuth, endpoint); 
        const result = yield response;
        yield put({ type: actions.setExam.DELETE_FILE_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.DELETE_FILE_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* fetchUsersOfSetExam(payload) {
    try {
        let endpoint = `${config.API_URL}/course/exam-set/${payload.params.id}/student/list?pageSize=${payload.params.pageSize}&pageIndex=1&search=${payload.params.search}`;
        const response = yield call(getApiAuth, endpoint);
        const result = yield response.data;
        yield put({ type: actions.setExam.USERS_SETEXAM_SUCCESS, result: result});
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.USERS_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Tải dữ liệu học viên trong bộ đề thi thất bại' + messageError),
            });
        } 
    }
}

function* deleteUserSetExam(payload) {
    try {
        let endpoint = `${config.API_URL}/course/exam-set/${payload.params.id}/student/${payload.params.userId}`;
        const response = yield call(deleteApiAuth, endpoint);
        const result = yield response.data;
        yield put({ type: actions.setExam.DELETE_USER_SETEXAM_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.setExam.DELETE_USER_SETEXAM_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa học viên trong bộ đề thi thất bại' + messageError),
            });
        }
    }
}

export function* loadSetExam() {
    yield takeEvery(actions.setExam.GET_SETEXAM, fetchSetExam);
}

export function* loadUploadSetExam() {
    yield takeEvery(actions.setExam.UPLOAD_SETEXAM, uploadSetExam);
}

export function* loadAddUserToSetExam() {
    yield takeEvery(actions.setExam.ADD_USER_TO_SETEXAM, addUserToSetExam);
}

export function* loadUserSetExam() {
    yield takeEvery(actions.setExam.GET_USER_SETEXAM, fetchUserSetExam);
}

export function* loadDeleteSetExam() {
    yield takeEvery(actions.setExam.DELETE_SETEXAM, deleteSetExam);
}

export function* loadDeleteFileSetExam() {
    yield takeEvery(actions.setExam.DELETE_FILE_SETEXAM, deleteFileSetExam);
}

export function* loadUsersOfSetExam() {
    yield takeEvery(actions.setExam.USERS_SETEXAM, fetchUsersOfSetExam);
}

export function* loadDeleteUserSetExam() {
    yield takeEvery(actions.setExam.DELETE_USER_SETEXAM, deleteUserSetExam);
}