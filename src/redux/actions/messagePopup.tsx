
import { Action } from './types';
import { PARAMS_MESSAGE } from '../../utils/Models/models';
import { getLabel } from '../../utils/commons/commons';

export const DISPLAY_MESSAGE_ERROR = 'DISPLAY_MESSAGE_ERROR';
export const DISPLAY_MESSAGE_SUCCESS = 'DISPLAY_MESSAGE_SUCCESS';
export const DISPLAY_MESSAGE_WARNING = 'DISPLAY_MESSAGE_WARNING';
export const HIDDEN_MESSAGE = 'HIDDEN_MESSAGE';


export function displayMessageSuccess(params: PARAMS_MESSAGE): Action {
    return {
        type: 'DISPLAY_MESSAGE_SUCCESS',
        title: params.title,
        message: params.message
    };
}

export function displayMessageError(params: PARAMS_MESSAGE): Action {
    return {
        type: 'DISPLAY_MESSAGE_ERROR',
        title: params.title,
        message: params.message
    };
}

export function displayMessageWarning(params: PARAMS_MESSAGE): Action {
    return {
        type: 'DISPLAY_MESSAGE_WARNING',
        title: params.title,
        message: params.message
    };
}

export function hiddenMessage(): Action {
    return {
        type: 'HIDDEN_MESSAGE',
        title: '',
        message: ''
    };
}

