import { combineReducers } from 'redux';

import messagePopup from './messagePopup';
import alert from './alert';
import actionSheet from './actionSheet';
import notification from './notification';
import homeState from './homeScreen';
import leadState from './lead';
import contactState from './contact'

export default combineReducers({
	messagePopup,
	alert,
	actionSheet,
	notification,
	homeState,
	leadState,
	contactState
})