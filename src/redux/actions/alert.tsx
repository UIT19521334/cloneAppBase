
import { Action } from './types';
import { PARAMS_ALERT } from '../../utils/Models/models';

export const DISPLAY_ALERT = 'DISPLAY_ALERT';
export const HIDDEN_ALERT = 'HIDDEN_ALERT';


export function showAlert(params: PARAMS_ALERT): Action {
    return {
        type: 'DISPLAY_ALERT',
        title: params.title,
        message: params.message,
        actions: params.actions
    };
}

export function hideAlert(): Action {
    return {
        type: 'HIDDEN_ALERT',
        title: '',
        message: '',
        actions: []
    };
}

