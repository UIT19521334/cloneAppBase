
import { Action } from '../actions/types';
import { DISPLAY_MESSAGE_ERROR, DISPLAY_MESSAGE_SUCCESS, DISPLAY_MESSAGE_WARNING, HIDDEN_MESSAGE } from '../actions/messagePopup';
import { PopupMessageState } from '../../utils/Models/models';
import { Colors } from '../../themes/colors/Colors';

export const PopupIcon = { ERROR: 'times-circle', SUCCESS: 'check-circle', WARING: 'info-circle', EMPTY: '' };
export const PopupColor = { ERROR: Colors.functional.dangerous, SUCCESS: Colors.functional.successful, WARING: Colors.functional.warning, EMPTY: '#fff' };


const initialState: PopupMessageState = {
    isShow: true,
    type: 'NONE',
    title: '',
    message: '',
    color: '',
    icon: ''
};

export default function (state: PopupMessageState = initialState, action: Action): PopupMessageState {

    if (action.type === DISPLAY_MESSAGE_ERROR) {
        return {
            ...state,
            type: 'ERROR',
            title: action.title,
            message: action.message,
            icon: PopupIcon.ERROR,
            color: PopupColor.ERROR,
        };
    }

    if (action.type === DISPLAY_MESSAGE_SUCCESS) {
        return {
            ...state,
            type: 'SUCCESS',
            title: action.title,
            message: action.message,
            icon: PopupIcon.SUCCESS,
            color: PopupColor.SUCCESS,
        };
    }

    if (action.type === DISPLAY_MESSAGE_WARNING) {
        return {
            ...state,
            type: 'WARING',
            title: action.title,
            message: action.message,
            icon: PopupIcon.WARING,
            color: PopupColor.WARING,
        };
    }

    if (action.type === HIDDEN_MESSAGE) {
        return {
            ...state,
            type: 'NONE',
            title: '',
            message: '',
            icon: PopupIcon.EMPTY,
            color: PopupColor.EMPTY,

        };
    }

    return state;
}
