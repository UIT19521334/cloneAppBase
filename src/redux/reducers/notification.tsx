
import { Action } from '../actions/types';
import { SHOW_NOTIFICATION, HIDDEN_NOTIFICATION, MARK_READ_NOTIFICATION, MARK_UNREAD_NOTIFICATION } from '../actions/notification';
import { NotificationState } from '../../utils/Models/models';

const initialState: NotificationState = {
    isShow: false,
    title: '',
    message: '',
    icon: '',
    unRead: false
};

export default function (state: NotificationState = initialState, action: Action): NotificationState {

    if (action.type === SHOW_NOTIFICATION) {
        return {
            ...state,
            isShow: true,
            title: action.title,
            message: action.message,
            unRead: true,
        };
    }

    if (action.type === HIDDEN_NOTIFICATION) {
        return {
            ...state,
            isShow: false,
            title: '',
            message: ''
        };
    }

    if (action.type === MARK_READ_NOTIFICATION) {
        return {
            ...state,
            unRead: false
        };
    }

    if (action.type === MARK_UNREAD_NOTIFICATION) {
        
        return {
            ...state,
            unRead: true
        };
    }

    return state;
}
