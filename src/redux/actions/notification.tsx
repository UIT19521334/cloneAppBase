
import { Action } from './types';
import { PARAMS_MESSAGE } from '../../utils/Models/models';

export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
export const HIDDEN_NOTIFICATION = 'HIDDEN_NOTIFICATION';
export const MARK_UNREAD_NOTIFICATION = 'MARK_UNREAD_NOTIFICATION';
export const MARK_READ_NOTIFICATION = 'MARK_READ_NOTIFICATION';


export function showNotification(params: PARAMS_MESSAGE): Action {
    return {
        type: 'SHOW_NOTIFICATION',
        title: params.title,
        message: params.message
    };
}

export function hideNotification(params: PARAMS_MESSAGE): Action {
    return {
        type: 'HIDDEN_NOTIFICATION',
    };
}

export function markUnreadNotification(params: PARAMS_MESSAGE): Action {
    return {
        type: 'MARK_UNREAD_NOTIFICATION',
    };
}

export function markReadNotification(): Action {
    return {
        type: 'MARK_READ_NOTIFICATION',
    };
}

