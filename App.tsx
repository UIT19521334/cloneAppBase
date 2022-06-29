/**
 * @file    : App.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : file created when init project React Native
 * @member  : Khiem Ha, Manh Le
*/

import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import Orientation from 'react-native-orientation';
import { enableScreens } from 'react-native-screens';
import Config from './src/Config.json';
import Global from './src/Global';
import Setup from './src/setup';
import { isIphoneX } from './src/utils/commons/commons';

/** Added by 
 * @generator	: Manh Le
 * @date		: 2022-05-05
 * @description	: Apply code push
 *  */
import CodePush from 'react-native-code-push';
// End by Manh Le at 2022-05-27


// handle not show yellow box
LogBox.ignoreLogs([
	'Sending \`onAnimatedValueUpdate\` with no listeners registered.',
]);

// check if the original screen is used when navigating between screens
enableScreens(false);

function App() {

	/** Added by 
	 * @generator	: Manh Le
	 * @date		: 2022-05-05
	 * @description	: handle loading user info from Local Storage in the first time open app
	 *  */

	const [readyRender, setReadyRender] = React.useState(false);

	useEffect(() => {

		CodePush.disallowRestart();

		AsyncStorage.getItem('cache_user_info', (err, res) => {
			if (err) {
				setReadyRender(true);
				return;
			}

			var userInfo = JSON.parse(res || "{}");

			if (userInfo && Object.keys(userInfo).length > 0) {
				setReadyRender(true);

				Global.modulesPermissions = userInfo?.modules_permissions || { isShowAll: '1' };
				Global.setUser(userInfo?.user);
				Global.setCounters(userInfo?.counters);
				Global.countNotification = userInfo?.counters?.notifications_count?.total;
				Global.saveHomeSetting(userInfo?.homeSettings);

				if (userInfo?.isCacheMetaData) {
					Global.userList = userInfo?.userList;
					Global.groupList = userInfo?.group_list;
					Global.enumList = userInfo?.enumList;
					Global.packageFeatures = userInfo?.packageFeatures;
					Global.validationConfig = userInfo?.validationConfig;
					Global.mentions = userInfo?.mentions;
					Global.dependenceList = userInfo?.dependenceList;
					Global.modulesPermissions = userInfo?.modules_permissions || { isShowAll: '1' };
					Global.versionCRM = userInfo?.crmVersionCode;

					// handle checking if the CRM version is the latest or not.
					if (userInfo?.crmVersionCode) {
						// Example: 7.1.0.20210928.1800
						const verCRM = userInfo?.crmVersionCode.split('.'); // parsing version string from cache to array
						const verCurr = Config.crmVersionCode.split('.'); // parsing version string from config file to array
						let isCurrentNew = true;
						const lastIndex = verCRM.length - 1 // get last position
						const nextLastIndex = verCRM.length - 2 // get last next position

						if (parseInt(verCRM[nextLastIndex]) < parseInt(verCurr[nextLastIndex])) {
							isCurrentNew = false;
						}
						else if ((parseInt(verCRM[nextLastIndex]) == parseInt(verCurr[nextLastIndex])) && (parseInt(verCRM[lastIndex]) < parseInt(verCurr[lastIndex]))) {
							isCurrentNew = false;
						}
						else {
							isCurrentNew = true;
						}

						Global.isVersionCRMNew = isCurrentNew;
					}
				}
			}
			else {
				setReadyRender(true);
			}


		});

		return () => { }

	}, []);
	// End Manh Le at 2022-05-05

	return (
		<>
			<StatusBar
				animated={true}
				backgroundColor="#fff"
				barStyle={'dark-content'}
				hidden={!isIphoneX} />

			{
				!readyRender ? null : <Setup />
			}

		</>
	);
}

/** Added by 
 * @generator	: Manh Le
 * @date		: 2022-05-05
 * @description	: Apply code push
 *  */
let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };
export default CodePush(codePushOptions)(App);
// End by Manh Le at 2022-05-27
