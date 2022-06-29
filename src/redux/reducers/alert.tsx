
import type { Action } from '../actions/types';

import { DISPLAY_ALERT, HIDDEN_ALERT } from '../actions/alert';
import { AlertState, ACTION_ALERT } from '../../utils/Models/models';

const buttonCancel: ACTION_ALERT = {
    label: 'Cancel',
    isCancel: true,
    isHighLight: false,
    textStyle: {
        color: '#000'
    },
    onPress: null
    
}

const buttonConfirm: ACTION_ALERT = {
    label: 'Delete',
    isCancel: false,
    isHighLight: true,
    textStyle: null,
    onPress: null
}

const initialState: AlertState = {
    isShow: false,
    title: '', 
    message: '',
    actions: [buttonCancel, buttonConfirm]
};

export default function (state: AlertState = initialState, action: Action): AlertState {

    if (action.type === DISPLAY_ALERT) {
        return {
            ...state,
            isShow: true,
            title: action.title,
            message: action.message,
            actions: action.actions,
        };
    }

    if (action.type === HIDDEN_ALERT) {
        return {
            ...state,
            isShow: false,
            title: '',
            message: '',
            actions: [buttonCancel,buttonConfirm]
        };
    }

    return state;
}
