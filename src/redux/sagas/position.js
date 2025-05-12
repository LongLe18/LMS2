import { notification } from 'antd';
import { call, put, takeEvery } from 'redux-saga/effects';
import config from '../../configs/index';
import { getApi, postApiAuth, putApiAuth, deleteApiAuth } from '../services/api';
import * as actions from '../actions';
import { get } from 'lodash';

function* fetchPermissions(payload) {
    try {
        let endpoint = `${config.API_URL}/permission?pageIndex=${payload.params.pageIndex}&pageSize=${payload.params.pageSize}&search=${payload.params.search}`;
        const response = yield call(getApi, endpoint);
        const result = yield response.data;
        yield put({ type: actions.position.GET_PERMISSIONS_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.GET_PERMISSIONS_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

function* fetchPositions(payload) {
    try {
        let endpoint = `${config.API_URL}/position?pageIndex=${payload.params.pageIndex}&pageSize=${payload.params.pageSize}&search=${payload.params.search}`;
        const response = yield call(getApi, endpoint);
        const result = yield response.data;
        yield put({ type: actions.position.GET_POSITIONS_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.GET_POSITIONS_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

function* fetchPosition(payload) {
    try {
        let endpoint = `${config.API_URL}/position/${payload.params.id}`;
        const response = yield call(getApi, endpoint);
        const result = yield response.data;
        yield put({ type: actions.position.GET_POSITION_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.GET_POSITION_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

function* createPosition(payload) {
    try {
        let endpoint = config.API_URL + '/position/create';
        const response = yield call(postApiAuth, endpoint, payload.params); 
        const result = yield response;
        yield put({ type: actions.position.CREATE_POSITION_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.CREATE_POSITION_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

function* editPosition(payload) {
    try {
        let endpoint = config.API_URL + `/position/${payload.params.id}`;
        const response = yield call(putApiAuth, endpoint, payload.params.formData); 
        const result = yield response;
        yield put({ type: actions.position.EDIT_POSITION_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.EDIT_POSITION_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

function* deletePosition(payload) {
    try {
        let endpoint = config.API_URL + `/position/${payload.params.id}`;
        const response = yield call(deleteApiAuth, endpoint); 
        const result = yield response;
        yield put({ type: actions.position.DELETE_POSITION_SUCCESS, result: result });
        if (payload.callback) {
            payload.callback(result);
        }
    } catch (error) {
        yield put({ type: actions.position.DELETE_POSITION_FAILED, error: error });
        let messageError = error.response.status === 403 ? error.response.data : '';
        if (error.response.data.message === 'Forbidden: insufficient permissions') {
            notification.error({
                message: "Bạn không có quyền thực hiện chức năng này",
            });
        }
        else {
            notification.error({
                message: get(error, 'response.data.error', 'Xóa chức vụ thất bại ' + messageError),
            });
        }    
    }
}

export function* loadPermissions() {
    yield takeEvery(actions.position.GET_PERMISSIONS, fetchPermissions);
}

export function* loadPositions() {
    yield takeEvery(actions.position.GET_POSITIONS, fetchPositions);
}

export function* loadPosition() {
    yield takeEvery(actions.position.GET_POSITION, fetchPosition);
}

export function* loadAddPosition() {
    yield takeEvery(actions.position.CREATE_POSITION, createPosition);
}

export function* loadEditPosition() {
    yield takeEvery(actions.position.EDIT_POSITION, editPosition);
}

export function* loadDeletePosition() {
    yield takeEvery(actions.position.DELETE_POSITION, deletePosition);
}