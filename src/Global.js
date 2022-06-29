// Import libraries
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from "@react-native-community/netinfo";
import messaging from '@react-native-firebase/messaging';
import firebaseApp from '@react-native-firebase/app';
import moment from 'moment-timezone';
import { AppState, DeviceEventEmitter, Linking, NativeModules, PixelRatio, Platform } from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import BadgeAndroid from 'react-native-android-badge';
import BackgroundTimer from 'react-native-background-timer';
import Communications from 'react-native-communications';
// Import components
import { replaceMentionValues } from 'react-native-controlled-mentions';
import DeviceInfo from 'react-native-device-info';
import RNFetchBlob from 'react-native-fetch-blob';
import fetch from 'react-native-fetch-polyfill';
import Permissions, { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import PushNotification from "react-native-push-notification";
import Toast from 'react-native-root-toast';
import Sound from 'react-native-sound';
import Config from './Config.json';
import { showAlert } from './redux/actions/alert';
import SoftPhoneEvents from './softphone/SoftPhoneEvents';
import { Colors } from './themes/colors/Colors';
import { FeatureName, getFieldList, getLabel, heightDevice, ModuleName, widthDevice } from './utils/commons/commons';
import I18n from './utils/i18n';
import { PARAMS_ALERT } from './utils/Models/models';
import RNCommunications from './components/RNCommunications';

require('moment/locale/vi');
require('moment/locale/en-au');

// Check if a string contains any unicode chacracters
String.prototype.isUnicode = function () {
	for (var i = 0; i < this.length; i++) {
		if (this.charCodeAt(i) >= 192) {
			return true;
		}
	}

	return false;
}

// parse unicode string to un-unicode string
String.prototype.unUnicode = function () {
	var result = this.toLowerCase();
	result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
	result = result.replace(/ì|í|ị|ỉ|ĩ/g, "i");
	result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
	result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
	result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	result = result.replace(/đ/g, "d");
	return result;
}

// match un-unicode lookup string in unicode full string
String.prototype.unUnicodeMatch = function (lookupString) {
	var fullString = this.unUnicode();
	lookupString = lookupString.unUnicode();
	return fullString.indexOf(lookupString) >= 0;
}

String.prototype.splice = function (startIndex, delCount, newSubStr) {
	return this.slice(0, startIndex) + newSubStr + this.slice(startIndex + Math.abs(delCount));
}

var Global = {
	navigationRef: null,
	appName: Config.appName,
	appVersion: Platform.OS == 'ios' ? Config.appVersion.ios : Config.appVersion.android,
	appVersionCode: Platform.OS == 'ios' ? Config.appVersionCode.ios : Config.appVersionCode.android,
	apiKey: Config.apiKey,
	locale: 'vn_vn',
	deviceId: '',
	serverUrl: '',
	token: '',
	user: {},
	sidebar: '',
	userSettings: {},
	counters: {},
	gpsLocation: {},
	configsApp: {
		fontSize: {
			largeTitle: 22,
			title: 18,
			headline: 16,
			body: 14,
			callout: 14,
			caption: 14,
			footnote: 12,
			helpText: 11,
			default: 14
		}
	},
	footer: '',
	backgroundTasks: [],
	eventListener: [],
	loadingDelay: 1000,
	typepingTimeout: 50,
	maxFileSize: 10 * 1024 * 1024,  // Max file size for uploading
	calendarDate: null,
	newFeature: {},
	versionCRM: '',
	isVersionCRMNew: false,
	homeSettings: {},
	checkedSSL: false,
	hasSelfSignedSSL: false,
	// For offline mode
	userList: {},
	mentions: [],
	groupList: {},
	enumList: {},
	customerList: {},
	productList: {},
	priceConfigs: {},
	priceList: {},
	cnList: {},
	userAgent: '',
	uniqueId: DeviceInfo.getUniqueId().toUpperCase().trim(),
	isOnline: true,
	debug: false,
	messageId: '',
	isOpenComingActivity: false,
	isProcessingGetAddressCheckIn: false,
	dataCheckIn: {},
	google: {
		checkInApiKey: Config.apiKeyGoogleMap,
		autocompleteAPIKey: Platform.OS == 'ios' ? Config.apiKeyGoogleMapIOS : Config.apiKeyGoogleMapAndroid,
	},
	checkedUpdates: true,
	callFromActivity: false,
	callFromActivityData: null,
	hasCreateEventCall: false,
	subscriptions: [],
	modulesPermissions: {},
	launchApp: function () {
		this.initNotifications();
		this.runBackgroundTasks();
	},
	init: function (callback) {
		// Genral userAgent from device
		this.userAgent = `Manufacture: ${DeviceInfo.getManufacturerSync()} \nModel: ${DeviceInfo.getModel()} \nDevice name: ${DeviceInfo.getDeviceNameSync()} \nOS version: ${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()} \nDisplay Metrics: ${PixelRatio.get()} \nResolution: ${PixelRatio.getPixelSizeForLayoutSize(widthDevice)}x${PixelRatio.getPixelSizeForLayoutSize(heightDevice)} \nFontScale: ${PixelRatio.getFontScale()}  \nApp version: ${Config.appName} ${Platform.OS == 'ios' ? Config.appVersion.ios : Config.appVersion.android}`;

		// Init network info
		NetInfo.addEventListener((state) => {
			this.connectionType = state.type;
			console.log('Netword State: ', state);
			if (this.connectionType == undefined || this.connectionType.toUpperCase() == 'NONE') {
				Global.updateNetworkStatus(false);
			}
		});

		// Retrieve local config if any
		AsyncStorage.getItem('serverUrl', (err, result) => {
			if (err) {
				return;
			}

			var url = result;

			if (url) {
				this.serverUrl = url;
				Global.checkVersionCRM(url);
			}

			callback();
		});

		this.setDebugMode(this.debug);
	},
	requestUserPermission: async function () {
		const authorizationStatus = await messaging().requestPermission({
			announcement: true,
			alert: true,
			badge: true,
			sound: true
		});

		if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
			console.log('Push local notification are ready!');
		}
		else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
		}
		else {
		}
	},
	initNotifications: function () {
		this.requestUserPermission();

		messaging().getToken().then((token) => {
			console.log('>>>>>>>> Device token: ', token);
			Global.saveDeviceId(token);
		});

		messaging().onNotificationOpenedApp(remoteMessage => {
			Global.handleNotification(remoteMessage, 0, undefined);
		});

		// Check whether an initial notification is available
		messaging()
			.getInitialNotification()
			.then(remoteMessage => {
				if (remoteMessage) {
					Global.handleNotification(remoteMessage, 0, undefined);
				}
			});
	},
	setDebugMode: function (debug) {
		// Control log debug on app
		if (!debug) {

			['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group',
				'groupCollapsed', 'groupEnd', 'info', 'log', 'profile', 'profileEnd', 'table', 'time',
				'timeEnd', 'timeStamp', 'trace', 'warn']
				.forEach(methodName => {
					console[methodName] = () => { };
				});
		}
	},
	// Util function to get service url based on the given key
	getServiceUrl: function (key) {
		// If server url is set by local admin, use this url
		if (key == 'serverUrl' && this.serverUrl) {
			return this.serverUrl;
		}

		// Other wise, use global config
		var appMode = Config.appMode;

		if (Config[appMode] == null) {
			return '';
		}

		var serviceUrl = Config[appMode][key];

		if (serviceUrl == null) {
			serviceUrl = '';
		}

		if (key == 'serverUrl') {
			return serviceUrl;
		}

		return serviceUrl;
	},

	callAPI: function (context, params, successCallback, errorCallback) {
		if (this.checkedSSL) {
			if ((typeof this.hasSelfSignedSSL == 'string' && this.hasSelfSignedSSL == 'true') || (typeof this.hasSelfSignedSSL == 'boolean' && this.hasSelfSignedSSL)) {
				this.callAPISelfSignedSSL(context, params, successCallback, errorCallback);
			}
			else {
				this.callAPINotSelfSignedSSL(context, params, successCallback, errorCallback);
			}
		}
		else {
			var serviceUrl = this.getServiceUrl('serverUrl');

			RNFetchBlob.config({
				trusty: true
			})
				.fetch('GET', serviceUrl + '/vtigerversion.php')
				.then((resp) => {
					Global.checkedSSL = true;

					const header = resp?.respInfo?.headers || {};

					Global.hasSelfSignedSSL = header?.['self-signed-ssl'];

					if (!header?.['self-signed-ssl']) {
						this.callAPINotSelfSignedSSL(context, params, successCallback, errorCallback);
					}
					else {
						this.callAPISelfSignedSSL(context, params, successCallback, errorCallback);
					}
				})
				.catch((error) => {
					console.log('Get information crm version error: ', error);
					this.callAPINotSelfSignedSSL(context, params, successCallback, errorCallback);
				});
		}
	},
	callAPINotSelfSignedSSL: function (context, params, successCallback, errorCallback) {
		var serviceUrl = this.getServiceUrl('serverUrl') + Config.apiUrl;

		var headers = {
			'Token': this.token,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		};

		var body = JSON.stringify(params);

		// Use multipart/form-data to upload file
		if (params['IsMultiPartData'] == 1) {
			headers['Content-Type'] = 'multipart/form-data';

			let formData = new FormData();

			for (var field in params) {
				var value = params[field];

				if (typeof value == 'object') {
					// File type
					if (value['uri'] != null) {
						formData.append(field, value);
					}
					// Json type
					else {
						formData.append(field, JSON.stringify(value));
					}
				}
				// Text type
				else {
					formData.append(field, value);
				}
			}

			body = formData;
		}

		fetch(serviceUrl, {
			method: 'POST',
			headers: headers,
			body: body,
			timeout: 40 * 1000
		})
			.then((response) => {
				if (context != null) {
					context?.setState({
						loading: false
					});
					context?.setState({
						refreshing: false
					});

					// Redirect user to the login page if session is timed out
					if (response.status == 401 && params.RequestAction != 'Login') {
						this.exitApp();
					}
				}
				else {
					if (response.status == 401 && params.RequestAction != 'Login') {
						this.exitApp();
					}
				}

				return response;
			})
			.then((response) => {
				return response.json()
			})
			.then((data) => successCallback(data))
			.catch(function (error) {
				if (context != null) {
					context.setState({
						loading: false
					});
					context.setState({
						refreshing: false
					});
				}

				errorCallback(error);
			});
	},
	callAPISelfSignedSSL: function (context, params, successCallback, errorCallback) {
		var serviceUrl = this.getServiceUrl('serverUrl') + Config.apiUrl;
		console.log('Server URLs1: ', serviceUrl);

		var headers = {
			'Token': this.token,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		};

		var body = JSON.stringify(params);

		// Use multipart/form-data to upload file
		if (params['IsMultiPartData'] == 1) {
			headers['Content-Type'] = 'multipart/form-data';

			let formData = new FormData();

			for (var field in params) {
				var value = params[field];

				if (typeof value == 'object') {
					// File type
					if (value['uri'] != null) {
						formData.append(field, value);
					}
					// Json type
					else {
						formData.append(field, JSON.stringify(value));
					}
				}
				// Text type
				else {
					formData.append(field, value);
				}
			}

			body = formData;
		}

		RNFetchBlob.config({
			trusty: true,
			timeout: 40 * 1000
		})
			.fetch(
				'POST',
				serviceUrl,
				{
					...headers
				},
				body
			)
			.then((response) => {

				if (context != null) {
					context?.setState({
						loading: false
					});

					context?.setState({
						refreshing: false
					});

					// Redirect user to the login page if session is timed out
					if (response?.respInfo?.status == 401 && params.RequestAction != 'Login') {
						this.exitApp();
					}
				}
				else {
					if (response?.respInfo?.status == 401 && params.RequestAction != 'Login') {
						this.exitApp();
					}
				}

				const res = JSON.parse(response?.data || '{}');
				successCallback(res);

			})
			.catch((error) => {
				console.log(' ============Get information error params.RequestAction ============: ', error);
				if (context != null) {
					context.setState({
						loading: false
					});

					context.setState({
						refreshing: false
					});
				}

				errorCallback(error);
			});
	},
	// Check device exists
	saveDeviceId: function (token) {
		// Store device id on Global
		this.deviceId = token;

		var params = {
			RequestAction: 'SavePushClientToken',
			Params: {
				token: token
			}
		};

		// Call api
		this.callAPI(null, params, data => {
			if (data.error == 1) {
				console.log('Save token device error!', data);
				return;
			}

			console.log('Saved token device!');

		}, error => {
			console.log('Save token device error: ', error);
		});
	},
	parseHtmlToString: function (html, str) {
		return html.replace(/<[^>]*>?/gm, str || '');
	},
	formatNumber: function (number) {
		if (number == null) {
			return 0;
		}
		else {
			number = parseFloat(number).toFixed(Global.user?.no_of_currency_decimals)
		}

		return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	},
	formatNumberForm: function (number) {
		if (number == null) {
			return 0;
		}
		else {
			number = parseFloat(number).toFixed(0)
		}

		return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	},
	formatIntegerNumber: function (number) {
		if (number == null) {
			return 0;
		}
		else {
			number = parseInt(number);
		}

		return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	},
	formatCurrency: function (number) {
		let currencyValue = this.formatCurrencyNotCurrencySymbol(number);

		if (Global.user?.currency_symbol_placement == '1.0$') {
			return currencyValue + Global.user?.currency_symbol;
		}
		else {
			return Global.user?.currency_symbol + currencyValue;
		}
	},
	formatCurrencyNotCurrencySymbol: function (number) {
		let currency = parseFloat(number).toFixed(Global.user?.no_of_currency_decimals);
		let decimalPart = parseFloat(currency % 1).toFixed(Global.user?.no_of_currency_decimals);
		let integerPart = parseInt(currency - decimalPart);
		let decimalPartFormatted = decimalPart.split('.')[1];
		let integerPartFormatted = integerPart;
		let groupingSeparator = Global.user?.currency_grouping_separator || ',';

		switch (Global.user?.currency_grouping_pattern) {
			case '123,456,789':
				integerPartFormatted = integerPartFormatted.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${groupingSeparator}`);
				break;

			case '123456789':
				integerPartFormatted = integerPartFormatted;
				break;

			case '123456,789':
				if (integerPartFormatted.toString()?.length > 3) {
					var integerFirstPartFormatted = integerPartFormatted.toString().substr(0, (integerPartFormatted.toString()?.length - 3));
				}

				var integerLastPartFormatted = integerPartFormatted.toString().substr(integerPartFormatted.toString()?.length - 3);

				if (integerFirstPartFormatted) {
					integerPartFormatted = integerFirstPartFormatted + groupingSeparator + integerLastPartFormatted;
				}

				break;

			case '12,34,56,789':
				if (integerPartFormatted.toString()?.length > 3) {
					var integerFirstPartFormatted = integerPartFormatted.toString().substr(0, (integerPartFormatted.toString()?.length - 3));
				}

				var integerLastPartFormatted = integerPartFormatted.toString().substr(integerPartFormatted.toString()?.length - 3); // '789'

				if (integerFirstPartFormatted) {
					integerFirstPartFormatted = integerFirstPartFormatted.toString().replace(/(\d)(?=(\d{2})+(?!\d))/g, `$1${groupingSeparator}`); // '12,34,56'
					integerPartFormatted = integerFirstPartFormatted + groupingSeparator + integerLastPartFormatted;
				}

				break;

			default:
				break;
		}

		if (Global.user?.no_of_currency_decimals == 0) {
			return integerPartFormatted;
		}
		else {
			return integerPartFormatted + Global.user?.currency_decimal_separator + decimalPartFormatted;
		}
	},
	unFormatCurrency: function (currency) {
		let decimalSeparator = Global.user?.currency_decimal_separator || '.';
		let groupingSeparator = Global.user?.currency_grouping_separator || ',';
		let integerPartFormatted = '';
		let decimalPartFormatted = '';

		if (currency.search(decimalSeparator) != -1) {
			integerPartFormatted = currency.split(decimalSeparator)[0];
			decimalPartFormatted = currency.split(decimalSeparator)[1] || '';
		}
		else {
			integerPartFormatted = currency;
		}

		let regex = new RegExp('\\' + groupingSeparator, 'g');

		integerPartFormatted = integerPartFormatted.replace(regex, '');

		return integerPartFormatted + '.' + decimalPartFormatted;
	},
	formatAssignedOwnersString: function (assignedOwners) {
		let result = '';

		if (assignedOwners && assignedOwners.length > 0) {
			assignedOwners.map((item, index) => {
				result = result + item?.id + (index < (assignedOwners.length - 1) ? ',' : '');
			});
		}

		return result;
	},
	formatAssignedOwnersStringById: function (assignedOwnersId) {
		let result = '';

		if (assignedOwnersId) {
			result = result + assignedOwnersId;
		}

		return result;
	},
	checkUserAgent() {
		if (this.userAgent.indexOf('SM-A720F') > 0 || this.userAgent.indexOf('SM-N920C') > 0) {
			return true;
		}

		return false;
	},
	validateEmail: function (email) {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
			return true;
		}

		return false;
	},
	validateUrl: function (url) {
		if (/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(url)) {
			return true;
		}

		return false;
	},
	validateNumber(number) {
		if (!isNaN(number) && parseFloat(number) >= 0) {
			return true;
		}

		return false;
	},
	validateOnlyNumber(number) {
		var letters = /^[0-9]+$/;

		if (number.match(letters)) {
			return true;
		}

		return false;
	},
	setUser(user) {
		user['name'] = ((user.last_name || '') + ' ' + (user.first_name || '')).trim();

		if (user?.avatar?.search('http') == -1) {
			user.avatar = this.getImageUrl(user.avatar);
		}

		this.user = user;
		this.callDuration = parseInt(user.callduration || 0) * 60 * 1000 || 5 * 60 * 1000;
		this.otherEventDuration = parseInt(user.othereventduration || 0) * 60 * 1000 || 5 * 60 * 1000;
		this.locale = user.language || "vn_vn";
		moment.locale((user.language || "vn_vn") == 'vn_vn' ? 'vi' : 'en-au'); // Update langue for moment

		if (this.sidebar && this.sidebar.mounted) {
			this.sidebar.setState({
				user: user
			});
		}
	},
	// Util functions
	getImageUrl: function (imageUrl) {
		if (imageUrl == '' || !imageUrl) {
			imageUrl = 'resources/images/no_ava.png';
		}

		return this.getServiceUrl('serverUrl') + '/' + imageUrl;
	},
	setCounters: function (counters) {
		this.counters = counters;

		if (this.sidebar && this.sidebar.mounted) {
			this.sidebar.setState({ counters: counters });
		}

		if (this.footer && this.footer.mounted) {
			this.footer.setState({ counters: counters });
		}

		if (this.home && this.home.mounted) {
			this.home.setState({ counters: counters });
		}

		if (Platform.OS == 'ios') {
			PushNotification.setApplicationIconBadgeNumber(parseInt(counters?.notifications_count?.total || 0));
		}
		else {
			BadgeAndroid.setBadge(parseInt(counters?.notifications_count?.total || 0));
		}

		if (parseInt(counters?.notifications_count?.total || 0) > 0) {
			DeviceEventEmitter.emit('Application.markUnreadNotification');
		}
		else {
			DeviceEventEmitter.emit('Application.markReadNotification');
		}
	},
	setGroupList(groupList) {
		for (let id in groupList) {
			groupList[id]['avatar'] = '/resources/images/default-group-avatar.png';
			groupList[id]['email'] = '';
		}

		this.groupList = groupList;
	},
	saveCacheUserList: function () {
		var userList = this.userList;

		AsyncStorage.setItem('cache_user_list', JSON.stringify(userList), () => { });
	},
	saveCacheGroupList: function () {
		var groupList = this.groupList;

		AsyncStorage.setItem('cache_group_list', JSON.stringify(groupList), () => { });
	},

	saveCacheEnumList: function () {
		var enumList = this.enumList;

		AsyncStorage.setItem('cache_enum_list', JSON.stringify(enumList), () => { });
	},

	saveCacheUserInfo: function () {
		var userInfo = {
			user: Global.user,
			counters: Global.counters,
			modules_permissions: Global.modulesPermissions || { isShowAll: '1' },
			userList: Global.userList,
			group_list: Global.groupList,
			enumList: Global.enumList,
			packageFeatures: Global.packageFeatures,
			validationConfig: Global.validationConfig,
			mentions: Global.mentions,
			dependenceList: Global.dependenceList,
			crmVersionCode: Global.versionCRM,
			homeSettings: Global.homeSettings,
			isCacheMetaData: true
		};

		let value = JSON.stringify(userInfo);

		AsyncStorage.setItem('cache_user_info', value, () => { });
	},
	updateServerUrl(url) {
		this.serverUrl = url;
		// Store it locally
		AsyncStorage.setItem('serverUrl', url, () => {
			console.log(I18n.t('common.msg_save_server_url_success', { locale: Global.locale }));
		});
	},
	exitApp: function () {
		AsyncStorage.removeItem('token', (err) => { });

		Global.deviceId = null;
		Global.cacheNotifications = null;
		Global.countNotification = null;
		Global.checkedUpdates = true;

		AsyncStorage.removeItem('cache_user_info', () => { });
		AsyncStorage.removeItem('cache_notifications', () => { });
		AsyncStorage.removeItem('cache_count_notifications', () => { });
		AsyncStorage.removeItem('certificate', () => { });
		AsyncStorage.removeItem('token', () => { });

		AsyncStorage.removeItem(SoftPhoneEvents.EVENT_INITIAL_STRINGEE_SOFT_PHONE, () => { });
		AsyncStorage.removeItem(SoftPhoneEvents.EVENT_UNREGISTER_STRINGEE_PUSH, () => { });
		AsyncStorage.removeItem(SoftPhoneEvents.EVENT_INITIAL_SOFT_PHONE, () => { });
		AsyncStorage.removeItem(SoftPhoneEvents.EVENT_MAKE_CALL_FROM_STRINGEE, () => { });

		// Stop background tasks
		this.stopBackgroundTasks();

		// broadcast event logout
		DeviceEventEmitter.emit('Authenticate.SignOut');

		// clear all event Listener
		Global.clearEventListener();

		// reverse default config
		Global.isVersionCRMNew = false;
		Global.versionCRM = '';
		Global.homeSettings = {};

		// clear cache credentials
		if ((Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) || (Platform.OS == 'android')) {
			try {
				NativeModules?.WidgetsHelper?.setCredentials("");
			} catch (error) {
				console.log('setCredentials Error: ', error);
			}
		}

		// Reset device id is null
		this.deviceId = '';

		// Reset badge icon
		if (Platform.OS == 'ios') {
			PushNotification.setApplicationIconBadgeNumber(0);
		}
		else {
			BadgeAndroid.setBadge(0);
		}
	},
	checkNetworkStatus: function () {
		// Fetch ping url to check correct network status
		RNFetchBlob.config({
			trusty: true,
			timeout: 5000
		})
			.fetch(
				'GET',
				this.getServiceUrl('serverUrl') + Config.pingUrl
			)
			.then((response) => {
				if (response?.respInfo.status === 200) {
					this.updateNetworkStatus(true);
				}
				else {
					this.updateNetworkStatus(false);
				}
			})
			.catch((error) => {
				this.updateNetworkStatus(false);
			});
	},
	checkNetworkStatusAsync: function (callback) {
		// Fetch ping url to check correct network status
		RNFetchBlob.config({
			trusty: true,
			timeout: 20000
		})
			.fetch('GET', this.getServiceUrl('serverUrl') + Config.pingUrl)
			.then((response) => {
				if (response?.respInfo?.status === 200) {
					this.updateNetworkStatus(true);
					callback(true);
				}
				else {
					this.updateNetworkStatus(false);
					callback(false);
				}
			})
			.catch((error) => {
				this.updateNetworkStatus(false);
				callback(false);
			});
	},
	checkSelfSignedSSL: function (url, callbackSuccess, callbackError) {
		RNFetchBlob.config({
			trusty: true
		})
			.fetch('GET', url + '/vtigerversion.php')
			.then((resp) => {
				const header = resp?.respInfo?.headers || {};

				if (header?.['self-signed-ssl']) {
					callbackSuccess();
				}
				else {
					callbackError();
				}
			})
			.catch((error) => {
				console.log('Get information crm version error: ', error);
				callbackError()
			});
	},
	checkServerUrl: function (url, successCallback, errorCallback) {
		// Fetch ping url to check correct network status
		console.log('Server URL =========================: ', url + Config.pingUrl, Platform.Version.toString());
		RNFetchBlob.config({
			trusty: true,
			timeout: 20000
		})
			.fetch('GET', url + Config.pingUrl)
			.then((response) => {
				console.log('response ping =============: ', response);
				if (response?.respInfo?.status === 200) {
					this.updateNetworkStatus(true);

					successCallback();
				}
				else {
					errorCallback();

					this.updateNetworkStatus(false);
				}
			})
			.catch((error) => {
				console.log('Error: ', error);

				errorCallback();

				this.updateNetworkStatus(false);
			});
	},
	updateNetworkStatus(isOnline) {
		var oldStatus = this.isOnline;
		var newStatus = isOnline;

		if (oldStatus != newStatus) {
			// Emit signal when the status is changed
			DeviceEventEmitter.emit('NetworkStatusChanged', { isOnline: newStatus });

			// Update new status into Global
			this.isOnline = newStatus;
		}
	},
	updateCounters: function () {
		var params = {
			RequestAction: 'GetCounters',
		};

		this.callAPI(null, params, data => {
			if (parseInt(data.success) != 1) {
				return;
			}

			this.setCounters(data.counters);
		}, error => {
			console.log('Fetch counter error: ', error);
		});
	},
	logLocation: function () {
		var params = {
			RequestAction: 'LogLocation',
			Latitude: this.gpsLocation.latitude,
			Longitude: this.gpsLocation.longitude
		};

		this.callAPI(null, params, data => {
			if (data.success != 1) {
				return;
			}

		}, error => {
			console.log('Saved log location error: ', error);
		});
	},
	runBackgroundTasks: function () {

		// save cache credentials to Widgets
		const credential = {
			url: (this.serverUrl || this.getServiceUrl('serverUrl')) + Config.apiUrl,
			token: this.token || '',
		}

		if ((Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) || (Platform.OS == 'android')) {
			console.log('======================= WidgetsHelper =======================');
			try {
				NativeModules.WidgetsHelper?.setCredentials?.(JSON.stringify(credential));
			}
			catch (error) {
				console.log('setCredentials Error: ', error);
			}
		}

		const checkNetworkTask = BackgroundTimer.setInterval(() => {
			// Run background task only if user is logged in and network is connected
			if (this.user.id && AppState.currentState != 'background') {
				this.checkNetworkStatus();
			}
		}, 15000);

		this.backgroundTasks.push(checkNetworkTask);

		const updateCountersTask = BackgroundTimer.setInterval(() => {
			// Run background task only if user is logged in and network is connected
			if (this.user.id && AppState.currentState != 'background' && this.isOnline) {
				this.updateCounters();
			}
		}, 30 * 60000);

		this.backgroundTasks.push(updateCountersTask);

		// const logLocationTask = BackgroundTimer.setInterval(() => {
		//     // Run background task only if user is logged in and network is connected
		//     if (this.user.id && this.isOnline) {

		//         this.logLocation();
		//     }
		// }, 15 * 60000);
		// this.backgroundTasks.push(logLocationTask);

		const logoutEvent = DeviceEventEmitter.addListener('Application.Logout', () => {
			Global.hasActionLogout = true;
		});

		this.backgroundTasks.push(logoutEvent);

		this.checkVersionCRM(null);
	},
	checkVersionCRMExist: function (version) {

		if (Global.getServiceUrl('serverUrl')?.includes('https://dev.cloudpro.vn')) {
			return true;
		}

		const verCRM = Global.versionCRM.split('.'); // version from file vtigerversion.php
		const verCurr = version.split('.'); // version need check
		let isCurrentNew = false;

		const lastIndex = verCRM.length - 1
		const nextLastIndex = verCRM.length - 2

		if (parseInt(verCRM[nextLastIndex]) > parseInt(verCurr[nextLastIndex])) {
			isCurrentNew = true;
		}
		else if ((parseInt(verCRM[nextLastIndex]) == parseInt(verCurr[nextLastIndex])) && (parseInt(verCRM[lastIndex]) >= parseInt(verCurr[lastIndex]))) {
			isCurrentNew = true;
		}
		else {
			isCurrentNew = false;
		}

		return isCurrentNew;
	},
	checkVersionCRM: function (url) {
		Global.getVersionCRM(url)
			.then((value) => {
				if (value) {
					Global.versionCRM = value;

					const verCRM = value.split('.');
					const verCurr = Config.crmVersionCode.split('.');
					let isCurrentNew = true;
					const lastIndex = verCRM.length - 1
					const nextLastIndex = verCRM.length - 2

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
					Global.saveCacheUserInfo();
				}
			})
			.catch((err) => {
				console.log(' GET CRM version Err: ', err);
			})
	},
	getVersionCRM: async (url) => {
		let response = await RNFetchBlob.config({ trusty: true }).fetch('GET', (url ? url : Global.getServiceUrl('serverUrl')) + '/vtigerversion.php');

		return response?.data;
	},
	stopBackgroundTasks: function () {
		for (task of this.backgroundTasks) {
			BackgroundTimer.clearInterval(task);
		}

		this.backgroundTasks = [];
	},
	getUser: function (id) {
		if (id) {
			if (this.userList[id] != undefined) {
				return this.userList[id];
			}

			if (this.groupList[id] != undefined) {
				return this.groupList[id];
			}
		}

		return {};
	},
	getEnum(module, enumKey) {
		let result = [{
			key: '',
			label: getLabel('common.label_select')
		}];

		if (enumKey && module && this.enumList[module]) {
			if (this.enumList?.[module]?.[enumKey]) {
				return result.concat(this.enumList[module][enumKey]);
			}
		}
		return [];
	},
	getEnumLabel(module, enumKey, key) {
		if (enumKey && module) {
			var label = '';
			if (this.enumList?.[module]?.[enumKey]) {
				this.enumList[module][enumKey].map((item) => {
					if (item.key == key) {
						label = item.label;
					}
				})

				return label;
			}
		}

		return '';
	},
	getEnumObject(module, enumKey, key) {
		var res = {
			key: '',
			label: getLabel('common.label_select')
		};

		if (enumKey && module) {
			if (this.enumList?.[module]?.[enumKey]) {
				this.enumList[module][enumKey].map((item) => {
					if (item.key == key) {
						res = item;
					}
				})

				return res;
			}
		}

		return res;
	},
	getEnumColor(module, enumKey, key) {
		if (enumKey && module) {
			var color = '';
			if (this.enumList[module][enumKey]) {
				this.enumList[module][enumKey].map((item) => {
					if (item.key == key) {
						if (item.color == '' || item.color == undefined || item.color == null) {
							color = '#333';
						}
						else {
							color = (item.color == '#fff' || item.color == '#ffffff') ? Colors.black.black1 : item.color;
						}
					}
				});

				return color;
			}
		}

		return '';
	},
	getColorContrast: function (hexcolor) {
		hexcolor = hexcolor.slice(1);

		var r = parseInt(hexcolor.substr(0, 2), 16);
		var g = parseInt(hexcolor.substr(2, 2), 16);
		var b = parseInt(hexcolor.substr(4, 2), 16);
		var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

		return (yiq >= 128) ? 'light' : 'dark';
	},
	getTextStatusColor: function (module, enumKey, key) {
		let backgroundColor = this.getEnumColor(module, enumKey, key);
		var contrast = this.getColorContrast(backgroundColor);

		return (contrast == 'dark') ? 'white' : 'black';
	},
	formatAssignedOwnersString: function (assignedOwners) {
		let result = '';

		assignedOwners?.map((item, index) => {
			result = result + item?.id + (index < (assignedOwners.length - 1) ? ',' : '');
		});

		return result;
	},

	getAssignedOwnersName: function (assignedOwners) {
		let assignedOwnersName = '';

		assignedOwners?.map((item, index) => {
			assignedOwnersName = assignedOwnersName + ((index > 0) ? ', ' : '') + item.name
		});

		return assignedOwnersName;
	},
	// Remove device
	removeDeviceId: function (callback) {
		var params = {
			RequestAction: 'RemovePushClientToken',
			Params: {
				token: this.deviceId
			}
		};

		// Call api
		this.callAPI(null, params, data => {
			if (data.error == 1) {
				return;
			}

			callback();
		}, error => {
			console.log('fetch remove token device on server error: ', error);
		});
	},
	// Delete record
	deleteRecord: function (module, idRecord, successCallback, errorCallback) {
		var params = {
			RequestAction: 'DeleteRecord',
			Params: {
				module: module,
				id: idRecord
			}
		};

		Global.callAPI(null, params, data => {
			if (parseInt(data.success) != 1) {
				errorCallback();
				return;
			}
			else {
				successCallback(data);
			}

		}, error => {
			errorCallback(error);
		});
	},
	// Get meta data 
	getModuleMetaData: function (module, successCallback, errorCallback) {
		var params = {
			RequestAction: 'GetModuleMetadata',
			Params: {
				module: module
			}
		};

		// Call api
		this.callAPI(null, params,
			data => {
				if (parseInt(data.success) === 1) {
					successCallback(data.metadata);
				}
				else {
					errorCallback();
				}
			},
			error => {
				errorCallback(error);
			}
		);
	},
	// Validate field require before save
	validateFieldsRequire: function (fieldList, data, fieldsRejectCheckRequired, module) {
		let result = '';
		let fieldsMobile = getFieldList(module);

		fieldsMobile?.length > 0 && fieldsMobile.map((field, index) => {
			if (fieldList?.[field]?.required == 1 && !data?.[field]) {
				if (fieldsRejectCheckRequired?.length > 0 && fieldsRejectCheckRequired.includes(field)) {
					return;
				}

				if (result) {
					result = result + ', ' + fieldList[field]?.label;
				}
				else {
					result = fieldList[field]?.label;
				}
			}
		})
		// fieldList && Object.keys(fieldList)?.length > 0 && Object.keys(fieldList).map((field, index) => {
		//     if (field != 'assigned_user_id' && fieldList[field]?.required == 1 && !data[field]) {
		//         if (fieldsRejectCheckRequired?.length > 0 && fieldsRejectCheckRequired.includes(field)) {
		//             return;
		//         }

		//         if (result) {
		//             result = result + ', ' + fieldList[field]?.label;
		//         }
		//         else {
		//             result = fieldList[field]?.label;
		//         }
		//     }
		// });

		return result;
	},
	// Sort and format list assigned user
	sortAssignedUserList: function (list, order) {
		let resultList = [];

		if (order.length > 0) {
			order.map((item, index) => {
				resultList.push(list[item]);
			});

			//Convert result list to object to save
			let assignedOwners = this.formatAssignedOwnersString(resultList);

			return assignedOwners;
		}
		else {
			return '';
		}
	},
	// Format assigned owner array from assigned_owners_id and main_owner_id when edit record
	formatAssignedOwnersArray: function (assignedOwners, idMainOwner) {
		let result = [];

		if (idMainOwner == -1) {
			result = assignedOwners;
			//Format assigned owner list
			result.map((item) => {
				item['email'] = this.getUser(item?.id?.split(':')[1]).email1;
				item['type'] = (item?.id?.split(':')[0] == 'Users') ? 'user' : 'group';
			});
		}
		else if (!idMainOwner) {
			return [];
		}
		else if (assignedOwners?.length > 0) {
			let indexMainOwner = assignedOwners.findIndex((item) => item?.id?.split(':')[1] == idMainOwner);

			result.push(assignedOwners[indexMainOwner]); //Add main owner to top result list

			assignedOwners.map((item, index) => {
				if (index != indexMainOwner) {
					result.push(item);
				}
			});

			//Format assigned owner list
			result.map((item) => {
				item['email'] = this.getUser(item?.id?.split(':')[1])?.email1;
				item['type'] = (item?.id?.split(':')[0] == 'Users') ? 'user' : 'group';
			});
		}

		return result;
	},
	// Format date allow user format
	formatDate: function (date) {
		if (date) {
			return moment(date).format(Global.user?.date_format?.toUpperCase());
		}
		else {
			return '';
		}
	},
	// Format date time allow user format
	formatDateTime: function (date) {
		if (date) {
			return moment(date).format(`${Global.user?.date_format?.toUpperCase()} HH:mm:ss`);
		}
		else {
			return '';
		}
	},
	// Format time allow user format
	formatTime: function (date) {
		if (date) {
			return moment(date).format(`HH:mm`);
		}
		else {
			return '';
		}
	},
	formatContactInviteesString: function (contactInviteList) {
		let contactInvitees = '';
		contactInviteList && contactInviteList.length > 0 && contactInviteList.map((contact, index) => {
			contactInvitees = contactInvitees + (contact.id ? contact.id : contact.contactid) + ((index < (contactInviteList.length - 1)) ? ', ' : '');
		});

		return contactInvitees;
	},
	formatUserInviteesString: function (userInviteList) {
		let userInvitees = '';
		userInviteList && userInviteList.length > 0 && userInviteList.map((user, index) => {
			userInvitees = userInvitees + user.id + ((index < (userInviteList.length - 1)) ? ', ' : '');
		});

		return userInvitees;
	},
	formatTime12H: function (time) {
		if (!time) {
			return '12:00 AM'
		}

		let hours = time.split(':')?.[0];
		let min = time.split(':')?.[1];
		let suf = 'AM';

		if (parseInt(hours) == 12) {
			suf = 'PM';
		}
		else if (parseInt(hours) > 12) {
			hours = parseInt(hours) - 12;
			suf = 'PM'
		}

		// Added by Khiem Ha 2021.01.22
		if (hours == '00') { // Change display 00:00 AM / 00:30 AM to 12:00 AM / 12:30 AM
			hours = '12';
		}
		// Ended by Khiem Ha

		return hours + ':' + min + ' ' + suf;
	},

	generateTime: function (time) {
		if (!time) {
			return '00:00'
		}

		let hours = time?.split(':')?.[0];
		let min = time?.split(':')?.[1];

		if (parseInt(min) < 30) {
			min = '30';
		}
		else {
			min = '00';
			// Added by Khiem Ha 2021.01.22
			if (hours == 23) { // Change 24:00 to 00:00
				hours = '00';
			}
			else {
				hours = parseInt(hours) + 1;
			}
			// Ended by Khiem Ha 2021.01.22
		}

		return hours + ':' + min;
	},
	initSoundNotification: function () {
        console.log('Access initSoundNotification');
		Sound.setCategory('Ambient');

		let path = 'notification.mp3';
		let basePath = Sound.MAIN_BUNDLE;

		if (Platform.OS == 'ios') {
			path = require('./assets/raw/notification.mp3');
			basePath = null;
		}

        try {
            this.soundNotification = new Sound(path, basePath, (error) => {
                if (error) {
                    console.log('Error init sound: ', error);
                    return;
                }
    
                console.log("this.soundNotificationthis.soundNotification: ", this.soundNotification);
                // Play the sound with an onEnd callback
                this.soundNotification.setVolume(1);
                Global.playSoundNotification();
            });
        } catch (error) {
            console.log("error: ", error);
        }
		
	},
	playSoundNotification: function () {
		if (this.soundNotification) {
			this.soundNotification.play((success) => {
				if (success) {
					console.log('Playing sound!');
				}
				 else {
					console.log('Playing sound failure!');
				}
			});
		}
		else {
			this.initSoundNotification()
		}
	},
	handleNotification: function (notification, isRead, callback) {
		var notify = notification;

		if (notify?.data?.id) {
			var data = {
				id: notify.data.related_record_id
			};

			switch (notify?.data?.related_module_name) {
				case 'HelpDesk':
					Global.getPermissionModule('HelpDesk', null) && Global.navigationRef?.navigate(Global.getTicketViewLabel(), { ticket: data, prevScene: 'Notifications' });
					break;

				case 'Contacts':
					Global.getPermissionModule('Contacts', null) && Global.navigationRef?.navigate('ContactView', { contact: data, prevScene: 'Notifications' });
					break;

				case 'Calendar':
					Global.getPermissionModule('Calendar', null) && Global.navigationRef?.navigate('ActivityView', { activity: data, prevScene: 'Notifications' });
					break;

				case 'Accounts':
					Global.getPermissionModule('Accounts', null) && Global.navigationRef?.navigate('OrganizationView', { account: data, prevScene: 'Notifications' });
					break;

				case 'Leads':
					Global.getPermissionModule('Leads', null) && Global.navigationRef?.navigate('LeadView', { lead: data, prevScene: 'Notifications' });
					break;

				case 'Potentials':
					Global.getPermissionModule('Potentials', null) && Global.navigationRef?.navigate('OpportunityView', { opportunity: data, prevScene: 'Notifications' });
					break;

				default:
                    Global.navigationRef?.navigate('Notifications');
					break;
			}

			// Set is read for notification clicked
			if (isRead == 0) {
				var params = {
					RequestAction: 'MarkNotificationsAsRead',
					Params: {
						target: notify.data.id
					}
				};

				// Call api
				this.callAPI(null, params, data => {
					if (parseInt(data.success) === 1) {
						// Update counter notifications
						this.updateCounters();

						//Reset badge counter
						BackgroundTimer.setTimeout(() => {
							if (Platform.OS == 'ios') {
								PushNotification.setApplicationIconBadgeNumber(parseFloat(this.counters.notifications_count.total));
							}
							else {
								BadgeAndroid.setBadge(parseFloat(this.counters.notifications_count.total));
							}
						}, 2000);

						callback?.(true);
					}
					else {
						callback?.(false);
					}
				},
					error => {
						callback?.(false);
					});
			}
            
		}
		else {
			Global.navigationRef?.navigate('Notifications');
		}
	},

	// SoftPhone
	options: {
		ios: {
			appName: Config.appName,
			includesCallsInRecents: false,
			maximumCallGroups: 1,
			maximumCallsPerCallGroup: 1
		},

	},
	softPhoneToken: null,
	packageFeatures: null,
	validationConfig: null,
	dependenceList: null,
	stringeeClient: null,
	stringeeCall: null,
	startCallTime: '',
	endCallTime: '',
	ringStone: null,
	//ring stone has incoming
	initRingStone: function () {
		if (!this.ringStone) {
			Sound.setCategory('Ambient');

			let path = '';
			let baseBase = Sound.MAIN_BUNDLE;

			if (this.softPhoneToken?.custom_ringtone) {
				path = this.softPhoneToken?.custom_ringtone;
				baseBase = null;
			}
			else {
				if (Platform.OS == 'ios') {
					path = require('./assets/raw/ringtone.mp3');
					baseBase = null;
				}
				else {
					path = 'ringtone.mp3';
					baseBase = Sound.MAIN_BUNDLE;
				}

			}

			this.ringStone = new Sound(path, baseBase, (error) => {
				if (error) {
					return null;
				}
			})

			if (this.ringStone) {
				// Reduce the volume by half
				this.ringStone.setVolume(1);

				// Position the sound to the full right in a stereo field
				this.ringStone.setPan(1);

				// Loop indefinitely until stop() is called
				this.ringStone.setNumberOfLoops(-1);
			}
		}
	},
	setSilent: function (volume: number) {
		if (this.ringStone) {
			this.ringStone.setVolume(volume);
		}
	},
	playRingStone: function () {
		if (this.ringStone) {
			this.setSilent(1);

			this.ringStone.play((success) => {
				if (success) {
					this.playRingStone();
				} 
				else {
				}
			});
		} 
		else {
			this.initRingStone();
		}
	},
	stopRingStone: function () {
		if (this.ringStone) {
			this.ringStone.stop(() => {
				this.setSilent(0);
			});
		}
	},
	requestCameraPermission: async function () {
		Permissions.checkMultiple([
			'android.permission.CAMERA',
			'android.permission.RECORD_AUDIO'
		]).then((response) => {
			if (response['android.permission.CAMERA'] == 'denied' && response['android.permission.RECORD_AUDIO'] == 'denied') {
				Permissions.requestMultiple(
					[
						'android.permission.CAMERA',
						'android.permission.RECORD_AUDIO'
					]
				)
					.then((res) => {
						if (res['android.permission.CAMERA'] === 'granted') {
						}

						if (res['android.permission.RECORD_AUDIO'] === 'granted') {
						}
					})
					.catch((err) => {
					});
			}
			else if (response['android.permission.CAMERA'] == 'denied') {
				Permissions.request('android.permission.CAMERA')
					.then((res) => {
						if (res === 'granted') {
						} else {
						}
					})
					.catch((err) => {
					});
			}
			else if (response['android.permission.RECORD_AUDIO'] == 'denied') {
				Permissions.request('android.permission.RECORD_AUDIO')
					.then((res) => {
						if (res === 'granted') {
						} else { }
					})
					.catch((err) => {
						console.log('Request permission the record audio error: ', err);
					});
			}
			else {
			}
		})
			.catch((err) => {
				console.log(err);
			});
	},
	checkPhoneHasCode: function (phone: String) {
		if (phone?.startsWith('84')) {
			return '+' + phone;
		}

		return phone;
	},
	getSoftPhoneToken(callback) {
		var params = {
			RequestAction: 'GetSoftPhoneToken'
		}

		// Call api
		Global.callAPI(null, params, data => {
			if (parseInt(data.success) === 1) {
				Global.softPhoneToken = data.token;

				callback(data.token);

				AsyncStorage.setItem(SoftPhoneEvents.EVENT_INITIAL_STRINGEE_SOFT_PHONE, JSON.stringify({ ...(data.token || {}) }), (error) => {
					console.log('Error EVENT_INITIAL_STRINGEE_SOFT_PHONE: ', error);
				});
			}
			else {
				Toast.show(I18n.t('common.msg_no_results_found', { locale: Global.locale || "vn_vn" }));
				
				callback(null);
			}
		},
			error => {
				console.log('>>>>> GetSoftPhoneToken Error: ', error);
				
				Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
				
				callback(null);
			});
	},
	getDataCaller: function (from, callbackSuccess, callbackFailed) {
		var params = {
			RequestAction: 'GetDataForCallLog',
			Data: {
				customer_id: '',
				customer_number: from,
				direction: 'Inbound'
			}
		}

		console.log('Params request :', params);

		Global.callAPISelfSignedSSL(null, params, (data) => {
			// console.log('GetDataForCallLog: ', data);
			if (parseInt(data.success) === 1) {
				callbackSuccess(data || {})
			}
			else {
				callbackFailed()
			}
		},
			error => {
				console.log('GetDataForCallLog error: ', error);

				callbackFailed()
			});
	},
	setSoftPhoneToken: function (softPhoneToken, callback) {

		if (this.packageFeatures?.CallCenterIntegration === '1' && softPhoneToken) {
			this.softPhoneToken = softPhoneToken;

			callback();

			
			AsyncStorage.setItem(SoftPhoneEvents.EVENT_INITIAL_STRINGEE_SOFT_PHONE, JSON.stringify({ ...(softPhoneToken || {}) }), (error) => {
				console.log('Error EVENT_INITIAL_STRINGEE_SOFT_PHONE: ', error);
			});

			DeviceEventEmitter.emit(SoftPhoneEvents.EVENT_INITIAL_SOFT_PHONE, { ...(softPhoneToken || {}) })
		}
		else {
			callback()
		}
	},
	checkHasShowSoftPhoneSetting: function () {
		if (Global.packageFeatures?.CallCenterIntegration == '1' && Global.softPhoneToken && Global.softPhoneToken?.gateway) {
			return true;
		}

		return false;
	},
	clearEventListener: function () {
		if (this.eventListener) {
			this.eventListener.forEach((event) => {
				event.remove();
			});
		}
	},
	makeCallSoftPhone: function (phoneNumber, customerId, dispatch) {
        console.log('Has trigger call phone: ', phoneNumber, customerId, (this.packageFeatures.CallCenterIntegration));

		if (this.packageFeatures.CallCenterIntegration === '1' && this.softPhoneToken) {
			if (this.softPhoneToken.gateway === 'Stringee') {
				ActionSheet.showActionSheetWithOptions({
					title: I18n.t('common.options_call_title', { locale: Global.locale || "vn_vn" }),
					options: [
						I18n.t('common.call_with_softphone_title', { locale: Global.locale || "vn_vn" }),
						I18n.t('common.call_width_device_title', { locale: Global.locale || "vn_vn" }),
						I18n.t('common.btn_close', { locale: Global.locale || "vn_vn" })
					],
					cancelButtonIndex: 2,
					destructiveButtonIndex: 0,
				},
					(buttonIndex) => {
						if (buttonIndex === 0) {
							DeviceEventEmitter.emit(SoftPhoneEvents.EVENT_MAKE_CALL_FROM_STRINGEE, { phoneNumber, customerId, dispatch })
						}

						if (buttonIndex === 1) {
							RNCommunications.phoneCall(phoneNumber, true);
						}
					})
			}
            else {
                RNCommunications.phoneCall(phoneNumber, true);
            }
		}
		else {
            console.log('Has trigger call phone');
			RNCommunications.phoneCall(phoneNumber, true);
		}
	},
	// Sort and format comment list
	sortCommentList: function (comments) {
		let tmpCommentList = comments;
		let commentList = [];

		// Function find index of comment root of child comment
		function findIndexCommentRoot(comment) {
			let indexCommentParent = tmpCommentList.findIndex((item) => item.modcommentsid == comment.parent_comments);
			
			if (tmpCommentList[indexCommentParent]?.parent_comments == 0) {
				let indexCommentRoot = commentList.findIndex((item) => item.modcommentsid == tmpCommentList[indexCommentParent]?.modcommentsid);
				
				return indexCommentRoot;
			}
			else {
				return findIndexCommentRoot(tmpCommentList[indexCommentParent]);
			}
		}

		if (tmpCommentList.length > 0) {
			tmpCommentList.map((comment, index) => {
				if (comment.parent_comments == 0 || comment.parent_comments == '') { // Add comment parent to comment list
					commentList.push(comment)
				}
				else { // Add comment child to comment list
					let indexCommentRoot = findIndexCommentRoot(comment); // Find comment parent (root)
					
					if (commentList[indexCommentRoot]?.child_comments && commentList[indexCommentRoot]?.child_comments.length > 0) {
						commentList[indexCommentRoot]?.child_comments?.push(comment);
					}
					else {
						commentList[indexCommentRoot].child_comments = [comment]
					}
				}
			})
		}

		return commentList;
	},
	//Add comment to record
	saveComment: function (context, relatedRecord, comment, type, successCallback, errorCallback) {
		if (comment.commentcontent == '' || !comment.commentcontent) {
			Toast.show(getLabel('common.msg_comment_is_empty'));
			return;
		}

		context?.setState({ loading: true });

		var params = {
			RequestAction: 'SaveComment',
			Data: {
				commentcontent: replaceMentionValues(comment.commentcontent, ({ id, name }) => `@[${name}](Users:${id})`),
				related_to: relatedRecord
			}
		};

		if (comment?.filename?.length > 0) {
			params.Filename = comment.filename[0];
			params.IsMultiPartData = 1;
		}

		if (type == 'reply') {
			params.Data.parent_comments = comment.parent_comments;
		}
		else if (type == 'edit') {
			params.Data.id = comment.commentId;
		}

		// Call api
		Global.callAPI(context, params, data => {
			if (parseInt(data.success) === 1) {
				successCallback();
			}
			else {
				errorCallback();
			}
		}, error => {
			errorCallback();
		});
	},
	//Get comments of record
	getComments: function (context, relatedRecord, successCallback, errorCallback) {
		context?.setState({ loading: true });

		var params = {
			RequestAction: 'GetCommentList',
			Params: {
				record_related_id: relatedRecord
			}
		};

		// Call api
		Global.callAPI(context, params, data => {
			if (parseInt(data.success) === 1) {
				successCallback(data.entry_list);
			}
			else {
				errorCallback();
			}
		}, error => {
			errorCallback();
		});
	},
	convertUserListToMentionList: function (data) {
		const userList = (data || {});

		const mentions = Object.keys(userList).map((key) => {
			const user = userList[key];

			return {
				id: user.id,
				name: (user.last_name ? (user.last_name?.trim() + ' ') : '') + user.first_name?.trim(),
				avatar: this.getImageUrl(user.avatar)
			}
		})

		return mentions || [];
	},
	searchRelatedList: function (module, list, keyword, callback) {
		let regex = keyword.unUnicode().trim();
		let result = [];

		if (!list || list.length <= 0) {
			callback([]);
		}

		switch (module) {
			case 'Contacts':
				result = list.filter((item) =>
					item?.firstname?.unUnicodeMatch(regex)
					|| item?.lastname?.unUnicodeMatch(regex)
					|| item?.accountname?.unUnicodeMatch(regex)
					|| item?.mobile?.unUnicodeMatch(regex)
					|| item?.phone?.unUnicodeMatch(regex)
					|| item?.email?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			case 'Leads':
				result = list.filter((item) =>
					item?.firstname?.unUnicodeMatch(regex)
					|| item?.lastname?.unUnicodeMatch(regex)
					|| item?.company?.unUnicodeMatch(regex)
					|| item?.mobile?.unUnicodeMatch(regex)
					|| item?.phone?.unUnicodeMatch(regex)
					|| item?.email?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			case 'Accounts':
				result = list.filter((item) =>
					item?.accountname?.unUnicodeMatch(regex)
					|| item?.phone?.unUnicodeMatch(regex)
					|| item?.email1?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			case 'Calendar':
				result = list.filter((item) =>
					item?.subject?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			case 'Potentials':
				result = list.filter((item) =>
					item?.potentialname?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			case 'HelpDesk':
				result = list.filter((item) =>
					item?.title?.unUnicodeMatch(regex)
				);

				callback(result);
				break;

			default:
				callback(result);
				break;
		}
	},
	getFullName: function (firstName, lastName) {
		if (lastName && firstName) {
			return lastName + ' ' + firstName;
		}
		else if (!lastName && firstName) {
			return firstName;
		}
		else if (!firstName && lastName) {
			return lastName;
		}
		else {
			return '';
		}
	},
	// Get value probability of opp from sales stage
	getProbabilityFromSalesStage: function (salesStage) {
		let probabilityValue = '0';

		if (Global.dependenceList?.Potentials?.sales_stage?.[salesStage]?.probability?.[0]) {
			probabilityValue = Global.dependenceList?.Potentials?.sales_stage?.[salesStage]?.probability?.[0]
		}
		else {
			switch (salesStage) {
				case 'Prospecting':
					probabilityValue = '10';
					break;

				case 'Qualification':
					probabilityValue = '20';
					break;

				case 'Needs Analysis':
					probabilityValue = '30';
					break;

				case 'Proposal':
					probabilityValue = '40';
					break;
					
				case 'Quotation':
					probabilityValue = '60';
					break;

				case 'Negotiation or Review':
					probabilityValue = '80';
					break;

				case 'Closed Won':
					probabilityValue = '100';
					break;

				case 'Closed Lost':
					probabilityValue = '0';
					break;
			}
		}

		return probabilityValue;
	},
	// Check version app and update
	checkUpdate: function (userAction = false, dispatch) {
		var url = `https://crm.cloudpro.vn/app_version.json?v=${Math.random()}`;

		RNFetchBlob.config({
			trusty: true,
			timeout: 10 * 1000
		})
			.fetch('GET', url)
			.then((response) => {

				if (response?.respInfo?.status != 200 && userAction == true) {
					return;
				}

				const versionData = JSON.parse(response?.data || '{}');

				console.log('Version data: ', versionData);

				if ((versionData.CloudPro.ios && parseInt(this.appVersionCode) < parseInt(versionData.CloudPro.ios.replace('v', '').replace('.', '').replace('.', '') || 0) && Platform.OS == 'ios')
					|| (versionData.CloudPro.android && parseInt(this.appVersionCode) < parseInt(versionData.CloudPro.android.replace('v', '').replace('.', '').replace('.', '') || 0) && Platform.OS == 'android')) {
					const params: PARAMS_ALERT = {
						title: getLabel('common.title_update_new_version'),
						message: getLabel('common.msg_update_new_version'),
						actions: [
							{
								isCancel: true,
								label: getLabel('common.btn_update_later')
							},
							{
								isCancel: false,
								label: getLabel('common.btn_ok'),
								isHighLight: true,
								onPress: () => {
									let url = Platform.OS == 'ios' ? 'https://itunes.apple.com/vn/app/cloudpro-crm/id1450222444?mt=8' : 'https://play.google.com/store/apps/details?id=vn.cloudpro.salesapp';
									Linking.openURL(url)
										.catch(err => {
											// console.error('An error occurred', err)
										});
								}
							}
						]
					}

					dispatch(showAlert?.(params));
					return;
				}

				if (userAction == true) {
				}
			})
			.catch((error) => {
				console.log('Fetch error: ', error);

				if (userAction == true) {
				}
			});
	},
	checkPermissionLocation: function (callback) {
		check(
			Platform.select({
				android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
				ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
			})
		).then(response => {
			if (response == RESULTS.BLOCKED) {
				Global.isProcessingGetAddressCheckIn = false;
				
				DeviceEventEmitter.emit('Application.ShowPermissionSettings', { title: getLabel('checkIn.alert_request_permission_location_msg') });
			}

			if (response != RESULTS.GRANTED) {
				request(Platform.select({
					android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
					ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
				}))
					.then(response => {
						if (response == RESULTS.GRANTED) {
							if (callback) {
								callback?.()
							}
							else {
								Global.getGPSLocation();
							}
						}
						else {
							// if (callback) {
							//     callback?.()
							// }
						}
					})
					.catch((err) => {
						// if (callback) {
						//     callback?.()
						// }
					});
			}
			else {
				if (callback) {
					callback?.()
				}
				else {
					Global.getGPSLocation();
				}
			}

		})
			.catch((err) => {
			});
	},
	getGPSLocation: function () {
		const watchId = Geolocation.watchPosition(
			(position) => {

				var gpsLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };

				Global.gpsLocation = gpsLocation;

				// Clear watch
				Geolocation.clearWatch(watchId);

				setTimeout(() => {
					Global.getInformationLocationCheckIn(gpsLocation);
				}, 1000);
			},
			(error) => {
				Geolocation.getCurrentPosition(
					(position) => {
						var gpsLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
						
						Global.gpsLocation = gpsLocation;
						Global.getInformationLocationCheckIn(gpsLocation);
						Geolocation.clearWatch(watchId);
					},
					(error) => {
						Global.isProcessingGetAddressCheckIn = false;
						Geolocation.clearWatch(watchId);
					}
				);
			}
		);
	},
	getInformationLocationCheckIn: function (geoLocation) {
		Global.isProcessingGetAddressCheckIn = true;
		Global.dataCheckIn = {};
		var dataCheckIn = {};

		if (geoLocation && geoLocation.latitude != undefined) {
			console.log('location: ', geoLocation);

			fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + geoLocation.latitude + ',' + geoLocation.longitude + '&key=' + Global.google.checkInApiKey, { timeout: 20000 })
				.then((response) => response.json())
				.then((dataJSON) => {
					var status = dataJSON.status;
					var results = dataJSON.results;

					if (status == 'OK') {
						// Set address for Checkin
						dataCheckIn['checkin_address'] = results[0].formatted_address;
						dataCheckIn['checkin_longitude'] = results[0]?.geometry?.location?.lng;
						dataCheckIn['checkin_latitude'] = results[0]?.geometry?.location?.lat;

						Global.dataCheckIn = dataCheckIn;
						Global.isProcessingGetAddressCheckIn = false;
						DeviceEventEmitter.emit('Feature.CheckIn');
					}
					else {
						Global.isProcessingGetAddressCheckIn = false;
					}
				})
				.catch((err) => {
					Global.isProcessingGetAddressCheckIn = false;
				})
		}
		else {
			Global.checkPermissionLocation();
		}
	},
	/** Add by Manh le at 2022-01-22
	 * @function getPermissionModule: kiểm tra permission của một module bất kỳ
	 * có 2 @argument {module: ModuleName, feature: FeatureName}
	 * với FeatureName gồm: 'EditView' | 'Delete' | 'DetailView' | 'CreateView'
	 * */
	getPermissionModule: function (module: ModuleName, feature: FeatureName) {

		// Nếu tính năng của module được tắt thì return false
		if (Global.packageFeatures?.[`Module${module}`] == '0') {
			return false;
		}

		const modulesPermission = this.modulesPermissions;

		// Nếu danh sách thông tin permission của module có giá trị isShowAll bằng 1
		// ==> Trả ra là true
		// Trường hợp server CRM chưa có apple code API mới nếu không có trả ra
		// thông tin permission nên sẽ được set mặc định là show all module
		if (modulesPermission?.isShowAll == '1') {
			return true;
		}
		// Nếu module cần kiểm tra không có trong danh sách modules permission từ server trả xuống
		// ==> Trả ra là true
		else if (typeof modulesPermission?.[module] == 'undefined') {
			return true;
		}
		// Nếu có truyền thông tin Feature name
		else if (feature) {
			// Trường hợp 1: có thông tin module và data đó có kiểu dữ liệu là "object"
			// ==> Kiểm tra tính năng trong module đó có bằng 1 hay không nếu có trả "TRUE" và ngược lại
			if (modulesPermission?.[module] && (typeof modulesPermission?.[module] == 'object')) {
				return modulesPermission?.[module]?.[feature] == '1';
			}
			// Trường hợp 1: có thông tin module và data đó có kiểu dữ liệu là "string"
			// ==> Kiểm tra data đó có bằng 1 hay nếu có trả ra "TRUE" và ngược lại
			else if (modulesPermission?.[module]
				&& (typeof modulesPermission?.[module] == 'string')
				&& (modulesPermission?.[module] == '1')
			) {
				return true;
			}
			// Trường hợp 3: không thuộc các trường hợp nào bên trên trả ra "FALSE"
			else {
				return false;
			}
		}
		// Nếu không có truyền thông tin Feature name
		else if (module) {
			// Trường hợp 1: có thông tin module và data đó có kiểu dữ liệu là "object"
			// ==> Kiểm tra tính năng "DetailView" có bằng 1 hay không nếu có trả "TRUE" và ngược lại
			if (modulesPermission?.[module]
				&& (typeof modulesPermission?.[module] == 'object')
				&& (modulesPermission?.[module]?.DetailView == "1")
			) {
				return true;
			}
			// Trường hợp 1: có thông tin module và data đó có kiểu dữ liệu là "string"
			// ==> Kiểm tra data đó có bằng 1 hay nếu có trả ra "TRUE" và ngược lại
			else if (modulesPermission?.[module]
				&& (typeof modulesPermission?.[module] == 'string')
				&& (modulesPermission?.[module] == '1')
			) {
				return true;
			}
			// Trường hợp 3: không thuộc các trường hợp nào bên trên trả ra "FALSE"
			else {
				return false;
			}
		}
		// Nếu không thuộc các trường hợp nào bên trên thì mặc định tra ra true
		else {
			return true;
		}
	},
	isOwnerRecord: function (owner) {
		if (owner && owner.length > 0) {
			const id = owner[0].id?.split(':')?.[1];

			return this.user?.id == id
		}
		else {
			return false;
		}
	},
	isActiveFeature: function (moduleName) {
		const newFeature = this.newFeature;

		if (moduleName && newFeature) {
			if (newFeature[moduleName]) {
				const indexLink = newFeature[moduleName].findIndex(e => e == Global.getServiceUrl('serverUrl') || e == 'all');
				
				if (indexLink != -1) {
					return true;
				}
				else {
					return false
				}
			}
			else {
				return true;
			}
		}
		else {
			return true;
		}
	},
	getHomeSetting: function () {
		return { ...this.homeSettings }
	},
	saveHomeSetting: function (config) {
		if (!config) {
			Global.homeSettings = {
				performance: {
					new_lead: '1',
					sales: '1',
					deal_won: '1',
					deal_size: '1',
					conversion_rate: '1',
					filter_by: 'mine' //filter with ALL/PERSONAL
				},
				incoming_activity: '1',
				ticket_open: {
					is_show: '1', //hiện block ticket chờ xử lý.
					priority: 'DESC', //tăng dần hay giảm dần.
					create_time: 'DESC', // tăng dần hay giảm dần
					filter_by: 'mine', //lọc dữ liệu theo các cty(all) hay cá nhân (mine).
				}
			}
		} else {
			Global.homeSettings = config;
		}
		AsyncStorage.setItem('homeSettings', JSON.stringify(Global.homeSettings), () => { })
	},
	getTicketFormLabel: function () {
		let screenName = 'TicketForm';

		if (Global.getServiceUrl('serverUrl').includes('pms.onlinecrm.vn')) {
			screenName = 'TicketFormForPMS';
		}
		else if (Global.checkVersionCRMExist('7.1.0.20220415.1200')) {
			screenName = 'TicketFormNewVersion';
		}
		else {
			screenName = 'TicketForm';
		}

		return screenName;
	},
	getTicketViewLabel: function () {
		let screenName = 'TicketView';

		if (Global.getServiceUrl('serverUrl').includes('pms.onlinecrm.vn')) {
			screenName = 'TicketViewForPMS';
		}
		else if (Global.checkVersionCRMExist('7.1.0.20220415.1200')) {
			screenName = 'TicketViewNewVersion';
		}
		else {
			screenName = 'TicketView';
		}

		return screenName;
	},
	saveMetaDataTicket: function () {
		let enumList = {
			ticketcategories: Global.getEnum('HelpDesk', 'ticketcategories'),
			ticketpriorities: Global.getEnum('HelpDesk', 'ticketpriorities')
		}

		if (Platform.OS == 'android' || (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14))
			NativeModules.WidgetsHelper?.setMetaDataTicket?.(JSON.stringify(enumList));
	},
	initialsNewFirebaseApp: function (appId, apiKey, projectId, messagingSenderId) {

		// NativeModules.FirebaseAppHelper?.deleteAll(() => {
		// 	console.log('Delete all firebase app success');
		// 	firebaseApp.initializeApp({
		// 		appId: appId,
		// 		apiKey: apiKey,
		// 		projectId: projectId,
		// 		messagingSenderId: messagingSenderId
		// 	});
		// });
	},
	removeAllFirebaseApp: function () {
		// if (firebaseApp.apps.length > 0) {
		// 	console.log('firebase content: ', firebaseApp.apps.length);
		// 	firebaseApp.apps.forEach(fbApp => {
		// 		fbApp.delete()
		// 			.then(() => {
		// 				console.log('Delete firebase app with instance: ' + fbApp.name);
		// 			})
		// 			.catch((error) => {
		// 				console.log('Delete firebase app with instance: ' + fbApp.name + " is error: " + error);
		// 			});
		// 	});
		// }
	},
	removeFirebaseAppWithInstanceName: function (instanceName) {
		// if (instanceName) {
		// 	const fbApp = firebaseApp.app(instanceName)
		// 	fbApp?.delete()
		// 		.then(() => {
		// 			console.log('Delete firebase app with instance: ' + fbApp.name);
		// 		})
		// 		.catch((error) => {
		// 			console.log('Delete firebase app with instance: ' + fbApp.name + " is error: " + error);
		// 		});
		// }

	},
	// End by Manh Le
	
	/** Added by
	 * @generator   :   Manh Le
	 * @date        :   2022-05-27 
	 * @description :   Process to remove duplicate values
	*/
	concatArray: function (arr1: Array<any>, arr2: Array<any>, compareKey: string) {
		arr2.map((itemArr2) => {
			const hasDuplicate = arr1.findIndex((itemArr1) => itemArr1[compareKey] == itemArr2[compareKey]) != -1;
			if (!hasDuplicate) {
				arr1.push(itemArr2);
			}
		});

		return arr1;
	},
	formatBytes: function (bytes, decimals = 2) {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}
	//End by Manh Le at 2022-05-27
}

export default Global;
