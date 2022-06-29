/**
 * @file    : rn-cli.config.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Config to project can use TypeScrip
 * @member  : Khiem Ha, Manh Le
*/

import App from './App';
import { name as appName } from './app.json';
import { AppRegistry, NativeModules } from 'react-native';

/** Added by 
 * @generator	: Manh Le
 * @date		: 2022-05-05
 * @description	: handle receiving call information from firebase and handling incoming call pop-ups
 *  */
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import RNCallKeep from 'react-native-callkeep';
import Orientation from 'react-native-orientation';
import Global from './src/Global';
import BackgroundHandleSoftPhone from './src/softphone/BackgroundHandleSoftPhone';
import IncomingCallAndroid from './src/softphone/IncomingCallAndroid';
import SoftPhoneEvents from './src/softphone/SoftPhoneEvents';

const options = {
	ios: {
		appName: appName,
		includesCallsInRecents: false,
		maximumCallGroups: 1,
		maximumCallsPerCallGroup: 1
	},
};

/**
 * @event		: setBackgroundMessageHandler
 * @description	: handle events receiving call information from firebase when the application is in a background state and handling incoming call pop-ups.
 * */
messaging().setBackgroundMessageHandler(async remoteMessage => {
	console.error('remoteMessage: ', remoteMessage);

	const data = JSON.parse(remoteMessage.data.data);
	const callStatus = data.callStatus;
	const incomingData = data

	switch (callStatus) {
		case 'started':
			const appStatus = await NativeModules.StringeeModules?.appRunning?.();
			console.error('>>>>> appStatus: ', appStatus);
			if (appStatus == 'NOT_RUNNING' && !Global.hasApplyOtherStringeeCall) {
				AsyncStorage.getItem(SoftPhoneEvents.EVENT_INITIAL_STRINGEE_SOFT_PHONE, (error, data) => {
					console.error('EVENT_INITIAL_STRINGEE_SOFT_PHONE FROM BACKGROUND', data);
					const softPhoneToken = JSON.parse(data || '{}');
					if (data && Object.keys(softPhoneToken).length > 0) {
						Global.softPhoneToken = softPhoneToken;
						var backgroundHandleShowSoftPhone = new BackgroundHandleSoftPhone(incomingData);
						backgroundHandleShowSoftPhone.connect(softPhoneToken?.token);
						Global.backgroundHandleShowSoftPhone = backgroundHandleShowSoftPhone;
					}
				});
			}

			break;
		case 'ended':
			IncomingCallAndroid.backToMyApp()
			break;
	}

});

/**
 * @event		: onBackgroundEvent
 * @description	: handle events when the application is in a background state.
 * */
notifee.onBackgroundEvent(async ({ type, detail }) => {
	const { notification, pressAction } = detail;

	// Check if the user pressed the "Mark as read" action
	if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {

		// Remove the notification
		await notifee.cancelNotification(notification.id);
	}
});

// End Manh Le at 2022-05-05

/** Added by 
 * @generator	: Manh Le
 * @date		: 2021-10-07
 * @description	: set Portrait as default for the app
 *  */
Orientation.lockToPortrait();
// End Manh Le at 2021-10-07

AppRegistry.registerComponent(appName, () => App);

/** Added by 
 * @generator	: Manh Le
 * @date		: 2022-05-05
 * @description	: handle register Headless Task 
 *  */
AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => ({ name, callUUID, handle }) => {
	// Make your call here
	RNCallKeep.setup(options);
	RNCallKeep.setAvailable(true);
});
// End Manh Le at 2022-05-05
