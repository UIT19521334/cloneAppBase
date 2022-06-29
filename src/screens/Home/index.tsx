import AsyncStorage from '@react-native-community/async-storage';
import remoteConfig from '@react-native-firebase/remote-config';
import { Content, ScrollableTab, Tab, Tabs } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator, BackHandler, DeviceEventEmitter, FlatList,
	NativeModules, Platform, RefreshControl, ScrollView, StyleSheet,
	TouchableHighlight, TouchableOpacity, View
} from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import QuickActions from "react-native-quick-actions";
import Toast from 'react-native-root-toast';
import { closeTip, showTipTour, Tip } from 'react-native-tip';
import { useDispatch } from 'react-redux';
//Component
import {
	Body, Divider, Header, IconRight, Left, ListItem, Right,
	SectionView, SpaceHM, SpaceHS, SpaceL, SpaceM, SpaceS
} from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import MenuQuickCreate from '../../components/MenuQuickCreate';
import Global from '../../Global';
import usePlaceID from '../../hooks/usePlaceID';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box, Text } from '../../themes/themes';
import {
	getIcon, getIconModule, getLabel, heightDevice, logScreenView,
	OptionsPeriod, QuickActionsApp, widthDevice
} from '../../utils/commons/commons';
import EVENTS from '../../utils/events/Events';
import I18n from '../../utils/i18n';
import { WidgetParams } from '../../utils/Models/models';
import styles from './styles';

// --------------------------- Performance Tabs Component -----------------------
const PerformanceTab = ({ actual, previous, direction = '0', change = 0, loading = true, type, period, onRefresh = undefined, refreshing = false }) => {
	const [data, setData] = useState({ actual, previous, direction, change, type, period });

	useEffect(() => {
		setData({ actual, previous, direction, change, type, period });

		return () => { };
	}, [actual, previous, direction, change, type, period]);

	if (loading) {
		return (
			<Box
				minHeight={heightDevice * .15}
				justifyContent='center'
				alignItems='center'
			>
				<ActivityIndicator
					color={Colors.functional.primary}
					style={{
						transform:
							[{ scale: 1.4 }],
						paddingVertical: 4
					}}
				/>
			</Box>
		)
	}
	else {
		return (
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							onRefresh?.();
						}}
						tintColor='#309ed8'
						colors={['#309ed8', '#25add0', '#15c2c5']}
						progressBackgroundColor='#fff'
					/>
				}
				nestedScrollEnabled={true}
			>
				<Box
					alignItems='center'
					justifyContent='center'
				>
					<SpaceM />

					<Box
						alignItems='center'
						justifyContent='center'
						paddingVertical='xl'
						style={{
							borderColor: '#E6F4FA'
						}}
					>
						<Text
							allowFontScaling={true}
							color='primary'
							fontSize={18}
							fontWeight='bold'
						>
							{data.type == 'currency' ? Global.formatCurrency(data.actual || 0) : (data.type == 'percent' ? `${data.actual}%` : Global.formatIntegerNumber(data.actual || 0))}
						</Text>

						<SpaceL />

						{
							data.previous ? (
								(data.direction == '+') ?
									(
										<Box
											alignSelf='center'
											flexDirection='row'
										>
											<Box
												width={20}
												height={20}
												alignItems='center'
												justifyContent='center'
												borderRadius={10}
												marginRight='m'
												style={{
													backgroundColor: '#d3f2e8'
												}}
											>
												<Icon
													name='long-arrow-up'
													color={Colors.functional.successful}
												/>
											</Box>

											<Text
												allowFontScaling={true}
												fontWeight='600'
												color='successful'
											>
												{data.change}<Text allowFontScaling={true} fontSize={11}>%</Text>
											</Text>
										</Box>
									)
									: (
										(data.direction == 0) ? (
											<Box
												alignSelf='center'
												width={20}
												height={20}
												alignItems='center'
												justifyContent='center'
												borderRadius={10}
												style={{
													backgroundColor: '#d0e8f5'
												}}
											>
												<Icon
													name='minus'
													color={Colors.functional.primary}
												/>
											</Box>
										) : (
											<Box
												alignSelf='center'
												flexDirection='row'
											>
												<Box
													width={20}
													height={20}
													alignItems='center'
													justifyContent='center'
													borderRadius={10}
													marginRight='m'
													style={{
														backgroundColor: '#fadbdf'
													}}
												>
													<Icon
														name='long-arrow-down'
														color={Colors.functional.dangerous}
													/>
												</Box>

												<Text
													allowFontScaling={true}
													color='dangerous'
													fontWeight='600'
												>
													{data.change}<Text allowFontScaling={true} fontSize={11}>%</Text>
												</Text>
											</Box>
										)
									)
							) : null
						}
					</Box>

					<Box
						alignItems='center'
						justifyContent='center'
						paddingBottom='l'
						flexDirection='row'
					>

						<Text
							allowFontScaling={true}
							color='black3'
						>
							{data.period?.label_previous}
						</Text>

						<SpaceHS />

						<Box
							alignItems='center'
							justifyContent='center'
							flexDirection='row'
							paddingVertical='m'
						>
							<Text
								allowFontScaling={true}
								color='black1'
								fontWeight='500'
								fontSize={16}
							>
								{data.previous == '' || data.previous == 'N/A' ? 'N/A' : (data.type == 'currency' ? (Global.formatCurrency(data.previous || 0)) : (data.type == 'percent' ? `${data.previous}%` : Global.formatIntegerNumber(data.previous || 0)))}
							</Text>
						</Box>
					</Box>
				</Box>
			</ScrollView>
		)
	}
}

// --------------------------- Home Screen -----------------------

const HomeScreen = ({ navigation }) => {
	// define state
	const [loadingPopup, setLoadingPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadIncomingActivities, setLoadIncomingActivities] = useState(false);
	const [loadTicket, setLoadTicket] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [refreshingIncomingActivity, setRefreshingIncomingActivity] = useState(false);
	const [refreshingTicket, setRefreshingTicket] = useState(false);
	const [onScrolled, setOnScrolled] = useState(false);
	const [filterPerformance, setFilterPerformance] = useState(OptionsPeriod()[2]);
	const [dataPerformance, setDataPerformance] = useState({});
	const [incomingActivityList, setIncomingActivityList] = useState([]);
	const [ticketList, setTicketList] = useState([]);
	const [paging, setPaging] = useState({});
	const [config, setConfig] = React.useState({ ...Global.homeSettings });
	const [refreshingScreen, setRefreshingScreen] = useState(false);
	const [_showTip, setShowTip] = React.useState(true);
	const [_showTipMenu, setShowTipMenu] = React.useState(true);

	// define refs
	const contentRef = React.useRef(null);
	const menuActivity = React.useRef(null);
	const menuPerformance = React.useRef(null);

	// define hooks
	const { initPlaceID } = usePlaceID();
	const dispatch = useDispatch();

	// trigger change home settings
	useEffect(() => {
		setConfig(Global.homeSettings);

		return () => { }
	}, [Global.homeSettings]);

	// componentDidMount
	useEffect(() => {

		// init SDK PlaceID
		initPlaceID(Global.google.autocompleteAPIKey, //android
			(dataSuccess) => {
				console.log('Initialize use SDK Place ID successful!');
			},
			(err) => {
				console.log('Initialize use SDK Place ID failure!. Error: ', err);
			});

		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			return true;
		});

		// update information counter
		Global.updateCounters();

		// init default value 
		setFilterPerformance(OptionsPeriod()[2]); //Set default period is month
		getStatistic(OptionsPeriod()[2], 'FIRST_LOAD');
		getIncomingActivityList('FIRST_LOAD');

		// first load data
		setTimeout(() => {
			getOpenTickets('FIRST_LOAD');

			// load configs from remoteConfig firebase
			remoteConfig()
				.setConfigSettings({
					minimumFetchIntervalMillis: 0,
				})
				.then(() => {
					remoteConfig()
						.fetchAndActivate()
						.then(fetchedRemotely => {
							if (!fetchedRemotely) {
								const new_feature = remoteConfig().getValue('new_feature');

								if (new_feature.asString()) {
									const config = JSON.parse(new_feature.asString());

									Global.newFeature = config;

									AsyncStorage.setItem('new_feature', new_feature.asString(), () => {
										console.log('Save cache successful!');
									});
								}
							}
							else {
								AsyncStorage.getItem('new_feature', (err, res) => {
									if (err) {
										Global.newFeature = {};
										return;
									}

									if (res) {
										Global.newFeature = JSON.parse(res);
									}
									else {
										Global.newFeature = {};
									}
								});
							}
						})
						.catch(error => console.log('Error: ', error));
				})
				.catch((e) => {
					console.log("fetch remote config unsuccessful!, Error: ", e);

					AsyncStorage.getItem('new_feature', (err, res) => {
						if (err) {
							Global.newFeature = {};
							return;
						}

						if (res) {
							Global.newFeature = JSON.parse(res);
						}
						else {
							Global.newFeature = {};
						}
					});
				})

			// Check update app version
			if (Global.checkedUpdates) {
				Global.checkUpdate(false, dispatch);
				Global.checkedUpdates = false;
			}

			if (Global.isVersionCRMNew) {

				AsyncStorage.getItem('showGuildLineHomeScreen', (err, result) => {
					if (err) {

						return;
					}

					if (!result) {
						AsyncStorage.setItem('showGuildLineHomeScreen', 'hasShowGuildLineHomeScreen');
						showOnScreenGuidelines()
					}
					else {
						// init check permission use to the feature call with softphone
						checkPermissionSoftPhone()

						// Show popup notification what's news in a new version
						// setTimeout(() => {
						// 	AsyncStorage.getItem('showWhatIsNew', (err, res) => {
						// 		if (err) {
						// 			return;
						// 		}

						// 		if (res == '1.0.3' && Global.checkVersionCRMExist('7.1.0.20220215.0930')) {
						// 			AsyncStorage.setItem('showWhatIsNew', '1.0.3', (err) => { })
						// 		}
						// 		else {
						// 			AsyncStorage.setItem('showWhatIsNew', '1.0.3', (err) => { })
						// 			navigation.navigate('WhatIsNewScreen');
						// 		}
						// 	});

						// }, 1000);
					}
				});
			}
		}, 1000);

		// listen event focus to Home screen and reload data
		const eventFocusScreen = DeviceEventEmitter.addListener('User.FocusHomeScreen', () => {
			getStatistic(filterPerformance, 'FIRST_LOAD');
			getIncomingActivityList('FIRST_LOAD');
			getOpenTickets('FIRST_LOAD');
		});

		// listen event to reload data activity
		const eventReloadActivity = DeviceEventEmitter.addListener('HomeScreen.ReloadActivity', () => {
			getIncomingActivityList('FIRST_LOAD');
		});

		// listen event to reload data ticket process
		const eventReloadTicketOpen = DeviceEventEmitter.addListener('HomeScreen.ReloadTicketOpen', () => {
			getOpenTickets('FIRST_LOAD');
		});

		// Setup shortcut Home screen device
		QuickActions.clearShortcutItems();

		setTimeout(() => {
			QuickActions.setShortcutItems(QuickActionsApp());
		}, 1000);

		// handle action press to shortcut Home Screen
		const eventQuickActions = DeviceEventEmitter.addListener("quickActionShortcut", doSomethingWithTheAction);

		QuickActions.popInitialAction()
			.then(doSomethingWithTheAction)
			.catch(console.error);

		// listen event actions handle open app from Widgets
		const eventHandlePressOnTicket = DeviceEventEmitter.addListener(EVENTS.HANDLE_URL_OPEN_FROM_WIDGET, (data: WidgetParams) => {
			switch (data.type) {
				case 'QUICK_CREATE_ACTIVITY_WIDGET':
					setTimeout(() => {
						switch (data.data?.action) {
							case 'call':
								logScreenView('CreateCallFromHomeScene');
								Global.isOpenComingActivity = false;
								return navigation.navigate('ActivityForm', { activity: { activitytype: 'Call' }, onReLoadData: _onReLoadData });

							case 'meeting':
								logScreenView('CreateMeetingFromHomeScene');
								Global.isOpenComingActivity = false;
								return navigation.navigate('ActivityForm', { activity: { activitytype: 'Meeting' }, onReLoadData: _onReLoadData })

							case 'task':
								logScreenView('CreateTaskFromHomeScene')
								Global.isOpenComingActivity = false;
								return navigation.navigate('ActivityForm', { activity: { activitytype: 'Task' }, onReLoadData: _onReLoadData })

							case 'globalsearch':
								DeviceEventEmitter.emit('Application.ChangeTab', { number: 4 });

							default:
								break;
						}
					}, 1000);

					break;
				case 'INCOMING_ACTIVITY_WIDGET':
					setTimeout(() => {
						Global.isOpenComingActivity = true;

						navigation.navigate('ActivityView', {
							activity: data.data,
							prevScene: 'RelatedScreen'
						});
					}, 1000);

					break;

				case 'TICKET_WAIT_PROCESS_WIDGET':
					logScreenView('ViewDetailTicket');

					navigation.navigate(Global.getTicketViewLabel(), {
						ticket: data.data,
						prevScene: 'HomeScreen',
						indexSelected: 0,
					});

					break;
			}
		});

		// trigger event dismiss tip tour
		const eventTipTourDismissShow = DeviceEventEmitter.addListener('tip_tour_dismiss_show', () => {
			checkPermissionSoftPhone();
		});

		return () => {
			backHandler.remove();
			eventFocusScreen.remove();
			eventReloadActivity.remove();
			eventQuickActions.remove();
			eventReloadTicketOpen.remove();
			eventHandlePressOnTicket.remove();
			eventTipTourDismissShow.remove();
		};
	}, []);

	// process logic show tip tour
	const showOnScreenGuidelines = () => {
		const tips = [];

		const quickCreateTip = {
			id: 'quickCreate',
			nextId: 'performance',
			delay: 100,
			nextAction: () => {
				closeTip();
			},
		};

		const performanceTip = {
			id: 'performance',
			prevId: 'quickCreate',
			nextAction: () => {
				closeTip();
			},
			prevAction: () => {
				closeTip();
			},
			delay: 100,
			nextId: 'incoming_activity',
		};

		const incomingActivityTip = {
			id: 'incoming_activity',
			prevId: 'performance',
			nextId: 'ticket_open',
			delay: 1000,
			nextAction: () => {
				contentRef.current?._root.scrollToPosition(0, heightDevice * .5);
				closeTip();
			},
			prevAction: () => {
				closeTip();
			},
		};

		const ticketOpenTip = {
			id: 'ticket_open',
			prevId: 'incoming_activity',
			delay: 1000,
			prevAction: () => {
				contentRef.current?._root.scrollToPosition(0, 0);

				closeTip();
			}
		};

		// check is show the performance section
		const hasShowPerformance = ((Global.getPermissionModule('Leads', null) && (config?.performance?.new_lead == '1' || config?.performance?.conversion_rate == '1'))
			|| (Global.getPermissionModule('SalesOrder', null) && (config?.performance?.sales == '1' || config?.performance?.deal_size == '1' || config?.performance?.deal_won == '1')));

		// check is show the Incoming Activity section
		const hasShowIncomingActivity = config?.incoming_activity != '0';

		// check is show the Ticket section
		const hasShowTicketOpen = !(config?.ticket_open?.is_show == '0' || !Global.isVersionCRMNew);

		if (hasShowPerformance) {
			tips.push(quickCreateTip);

			if (hasShowIncomingActivity) {
				tips.push(performanceTip);

				if (hasShowTicketOpen) {
					tips.push(incomingActivityTip);
					tips.push(ticketOpenTip);
				}
				else {
					incomingActivityTip.nextId = '';
					incomingActivityTip.nextAction = undefined;
					tips.push(incomingActivityTip);
				}
			}
			else {
				if (hasShowTicketOpen) {
					performanceTip.nextId = 'ticket_open';
					performanceTip.nextAction = () => closeTip();
					tips.push(performanceTip);

					ticketOpenTip.prevId = 'performance';
					ticketOpenTip.prevAction = () => closeTip();
					tips.push(ticketOpenTip);
				}
				else {
					performanceTip.nextId = '';
					performanceTip.nextAction = undefined;
					tips.push(performanceTip);
				}
			}
		}
		else {
			if (hasShowIncomingActivity) {
				quickCreateTip.nextId = 'incoming_activity';
				tips.push(quickCreateTip);

				if (hasShowTicketOpen) {
					incomingActivityTip.prevId = 'quickCreate';
					incomingActivityTip.nextAction = () => closeTip();
					tips.push(incomingActivityTip);

					ticketOpenTip.prevAction = () => closeTip();
					tips.push(ticketOpenTip);
				} else {
					incomingActivityTip.prevId = 'quickCreate'
					incomingActivityTip.nextId = '';
					incomingActivityTip.nextAction = undefined;
					tips.push(incomingActivityTip);
				}
			} else {
				if (hasShowTicketOpen) {
					quickCreateTip.nextId = 'ticket_open'
					tips.push(quickCreateTip);

					ticketOpenTip.prevId = 'quickCreate'
					ticketOpenTip.prevAction = () => closeTip();
					tips.push(ticketOpenTip);
				} else {
					quickCreateTip.nextId = ''
					quickCreateTip.nextAction = undefined;
					quickCreateTip.tipProps = {
						dismissable: true
					}
					tips.push(quickCreateTip);
				}
			}
		}

		showTipTour([...tips])
	}

	const checkPermissionSoftPhone = () => {
		if (Platform.OS == 'android') {
			if (Global.checkHasShowSoftPhoneSetting()) {
				if (!Global.showCheckPermissionSoftPhone) {
					DeviceEventEmitter.emit('Android.ShowRequirePermission');
					Global.showCheckPermissionSoftPhone = true;
				}
			}
		}
	}

	const doSomethingWithTheAction = (data) => {
		setTimeout(() => {
			if (Platform.OS == 'ios') {
				switch (data?.type) {
					case 'checkin':
						logScreenView('QuickCheckIn');

						Global.checkPermissionLocation(() => {
							navigation.navigate('Camera', { cameraType: 'both', type: 'check_in', data: {}, prevScene: 'TabCheckIn', title: getLabel('common.title_check_in') });
							Global.getInformationLocationCheckIn(null);
						});

						break;

					case 'add_call':
						logScreenView('CreateCallFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Call' } })

						break;

					case 'add_meeting':
						logScreenView('CreateMeetingFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Meeting' } })

						break;

					case 'add_task':
						logScreenView('CreateTaskFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Task' } })

						break;
				}
			}
			else {
				switch (data?.type) {
					case 'checkin':
						logScreenView('QuickCheckIn');

						Global.checkPermissionLocation(() => {
							navigation.navigate('Camera', { cameraType: 'both', type: 'check_in', data: {}, prevScene: 'TabCheckIn', title: getLabel('common.title_check_in') });

							Global.getInformationLocationCheckIn(null);
						});

						break;

					case 'add_call':
						logScreenView('CreateCallFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Call' } });

						break;

					case 'add_meeting':
						logScreenView('CreateMeetingFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Meeting' } });

						break;

					case 'add_task':
						logScreenView('CreateTaskFromHomeScene');

						Global.isOpenComingActivity = false;

						navigation.navigate('ActivityForm', { activity: { activitytype: 'Task' } });

						break;

				}
			}
		}, 1500);
	}

	const getStatistic = (period, loadType: 'FIRST_LOAD' | 'REFRESH') => {
		if (loadType == 'REFRESH') {
			setRefreshing(true);
			setLoading(false);
		}
		else {
			setLoading(true);
			setRefreshing(false);
		}

		var params = {
			RequestAction: 'GetStatistic',
			Data: {
				period: period.key
			}
		}

		if (Global.isVersionCRMNew) {
			params.Data.filter_by = Global.homeSettings?.performance?.filter_by || 'mine'
		}

		Global.callAPI(null, params,
			data => {
				setLoading(false);
				setRefreshing(false);
				setRefreshingScreen(false);

				if (data.success == 1) {
					setDataPerformance(data.data);
				}

			},
			error => {
				setLoading(false);
				setRefreshing(false);
				setRefreshingScreen(false);
			}
		);
	}

	const getIncomingActivityList = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH') => {
		if (loadType === 'REFRESH') {
			setLoadIncomingActivities(false);
			setRefreshingIncomingActivity(true);
		}
		else {
			setLoadIncomingActivities(true);
			setRefreshingIncomingActivity(false);
		}

		let offset = 0;

		if (loadType == 'LOAD_MORE') {
			if (paging?.next_offset) {
				offset = paging.next_offset;
			}
		}

		let params = {
			RequestAction: 'GetActivityList',
			Params: {
				filter: 'incoming',
				paging: {
					order_by: '',
					offset: offset,
					max_results: 50
				}
			}
		};

		Global.isOpenComingActivity = false

		// Call api
		Global.callAPI(null, params,
			data => {
				if (parseInt(data.success) === 1) {
					let list = data.entry_list || [];

					if (loadType == 'LOAD_MORE') {
						list = incomingActivityList.concat(list);
					}

					setIncomingActivityList(list);
					setLoadIncomingActivities(false);
					setRefreshingIncomingActivity(false);
					setRefreshingScreen(false);

					const pagingTemp = data.paging;

					if ((parseInt(pagingTemp?.next_offset || 0) + 50) >= (parseInt(pagingTemp?.total_count || 0)) && loadType == 'FIRST_LOAD') {
						pagingTemp.next_offset = '';
						pagingTemp.total_count = list?.length || 0;
						setPaging(pagingTemp);
					}
					else {
						setPaging(pagingTemp);
					}

					// reload data Widget
					if (Platform.OS == 'ios' && (parseInt(Platform.Version?.toString()?.split('.')?.[0] || '0') >= 14)) {
						updateDataIncomingActivityWidgets((list || []).slice(0, 5))
					}
					else if (Platform.OS == 'android') {
						updateDataIncomingActivityWidgets(list)
					}
				}
				else {
					setIncomingActivityList([]);
					setLoadIncomingActivities(false);
					setRefreshingIncomingActivity(false);
					setRefreshingScreen(false);
					Toast.show(getLabel('common.msg_connection_error'));
				}
			},
			(error) => {
				setLoadIncomingActivities(false);
				setRefreshingIncomingActivity(false);
				setRefreshingScreen(false);
				Toast.show(getLabel('common.msg_connection_error'));
			}
		);
	}

	// handle reload data of the Incoming Activity Widgets
	const updateDataIncomingActivityWidgets = (list: Array<any>) => {
		if (Platform.OS == 'android') {
			NativeModules.WidgetsHelper?.setIncomingData?.(JSON.stringify(list));
		}
		// Widget only support for IOS >= 14.*
		else if (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) {
			let res = [];

			if (list) {
				res = list.map((item) => {
					return {
						activityid: item?.activityid,
						subject: item?.subject,
						activitytype: item?.activitytype,
						date_start: item?.date_start,
						time_start: item?.time_start
					}
				})
			}

			NativeModules.WidgetsHelper?.setIncomingData?.(JSON.stringify(res));
		}
	}

	// handle reload data of the Process Ticket Widgets
	const updateDataProcessTicketWidgets = (list: Array<any>) => {
		if (Platform.OS == 'android') {
			try {
				NativeModules.WidgetsHelper?.setProcessingTicketData?.(JSON.stringify(list));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);
			}
		}
		// Widget only support for IOS >= 14.*
		else if (Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) {
			let res = [];

			if (list) {
				res = list.map((item) => {
					return {
						ticketid: item?.ticketid,
						ticket_no: item?.ticket_no,
						title: item?.title,
						createdtime: item?.createdtime,
						status: item?.status,
						priority: item?.priority,
						category: item?.category
					}
				});
			}

			try {
				NativeModules.WidgetsHelper?.setProcessingTicketData?.(JSON.stringify(res));
			} catch (error) {
				console.log('setProcessingTicketData Error: ', error);

			}
		}
	}

	const handleCreateActivity = (activityType) => {
		menuActivity?.current?.hide();

		Global.isOpenComingActivity = false;

		navigation.navigate('ActivityForm', { activity: { activitytype: activityType } });
	}

	const _onReLoadData = () => { }

	const getOpenTickets = (loadType: 'FIRST_LOAD' | 'REFRESH') => {
		if (config?.ticket_open?.is_show == '1' && Global.isVersionCRMNew) {
			if (loadType == 'REFRESH') {
				setRefreshingTicket(true);
			}
			else {
				setLoadTicket(true);
			}

			const params = {
				RequestAction: 'GetOpenTickets',
				Params: {
					ordering: {
						"createdtime": Global.homeSettings?.ticket_open?.create_time || "DESC",
						"priority": Global.homeSettings?.ticket_open?.priority || "DESC"
					},
					filter_by: Global.homeSettings?.ticket_open?.filter_by || 'mine'
				}
			}

			Global.saveMetaDataTicket();

			Global.callAPI(null, params,
				data => {
					if (data.success == 1) {
						setLoadTicket(false);
						setRefreshingTicket(false);

						let list = data?.entry_list || [];

						setTicketList(list);

						// Reload data of the Process Ticket Widgets
						if (Platform.OS == 'ios' && (parseInt(Platform.Version?.toString()?.split('.')?.[0] || '0') >= 14)) {
							updateDataProcessTicketWidgets((list || []).slice(0, 5));
						}
						else if (Platform.OS == 'android') {
							updateDataProcessTicketWidgets(list);
						}
					}
					else {
						setLoadTicket(false)
						setRefreshingTicket(false)
					}
				},
				err => {
					setLoadTicket(false)
					setRefreshingTicket(false)

				}
			);
		}
	}

	return (
		<>
			<IndicatorLoading
				loading={loadingPopup}
			/>

			<Header>
				<Left>
					<TouchableHighlight
						activeOpacity={.3}
						underlayColor={Colors.black.black5}
						style={{
							marginLeft: 10,
							width: 40,
							height: 40,
							justifyContent: 'center',
							alignItems: 'center',
							borderRadius: 40
						}}
						onPress={() => {
							navigation.openDrawer();
                            // console.log(NativeModules.CommunicationsHelper?.email(["manh.le@cloudpro.vn", "manh.le1@cloudpro.vn"], ["manh.le2@cloudpro.vn", "manh.le4@cloudpro.vn"], ["manh.le3@cloudpro.vn"], "ádasdasd", "đá ádjasd sad ", false))
						}}

					>
						<Icon
							name={getIcon('Menu')}
							style={{
								color: Colors.black.black1,
								fontSize: 18
							}}
						/>
					</TouchableHighlight>
				</Left>

				<Body>
					<Text
						allowFontScaling={true}
						fontSize={18}
					>
						{I18n.t(`common.tab_home`, { locale: Global.locale || "vn_vn" })}
					</Text>
				</Body>

				<Right>
					<Tip
						id='quickCreate'
						title={getLabel('guidelines.title_quick_create')}
						body={getLabel('guidelines.label_quick_create')}
						pulseColor={Colors.white.white1}
						showItemPulseAnimation
						dismissable={false}
						onPressItem={() => { }}
						active={false}
						style={{
							marginRight: 20,
							marginTop: 8,
							backgroundColor: '#fff',
						}}
					>
						<IconRight
							disabled={true}
							style={{
								marginRight: 0,
								backgroundColor: '#fff'
							}}
						>
							<MenuQuickCreate
								icon={getIcon('QuickCreate')}
								onSelected={(itemSelected) => {
									switch (itemSelected.key) {
										case 'Leads':
											logScreenView('CreateLeadFromHomeScene');

											navigation.navigate('LeadForm', { onReLoadData: _onReLoadData });
											break;

										case 'Contacts':
											logScreenView('CreateContactFormFromHomeScene');

											navigation.navigate('ContactForm', { onReLoadData: _onReLoadData });
											break;

										case 'Organizations':
											logScreenView('CreateOrganizationFromHomeScene');

											navigation.navigate('OrganizationForm', { onReLoadData: _onReLoadData });
											break;

										case 'Opportunities':
											logScreenView('CreateOpportunityFromHomeScene');

											navigation.navigate('OpportunityForm', { opportunity: { probability: 0 }, onReLoadData: _onReLoadData });
											break;

										case 'Tickets':
											logScreenView('CreateTicketFromHomeScene');

											navigation.navigate(Global.getTicketFormLabel(), { onReLoadData: _onReLoadData });
											break;

										case 'Call':
											logScreenView('CreateCallFromHomeScene');

											Global.isOpenComingActivity = false;
											return navigation.navigate('ActivityForm', { activity: { activitytype: 'Call' }, onReLoadData: _onReLoadData });
										case 'Meeting':
											logScreenView('CreateMeetingFromHomeScene');

											Global.isOpenComingActivity = false;
											return navigation.navigate('ActivityForm', { activity: { activitytype: 'Meeting' }, onReLoadData: _onReLoadData });

										case 'Task':
											logScreenView('CreateTaskFromHomeScene');
											Global.isOpenComingActivity = false;
											return navigation.navigate('ActivityForm', { activity: { activitytype: 'Task' }, onReLoadData: _onReLoadData });

										default:
											break;
									}
								}}
							/>
						</IconRight>
					</Tip>
				</Right>
			</Header>

			<Content
				scrollEnabled={true}
				ref={contentRef}
				nestedScrollEnabled
				refreshControl={
					<RefreshControl
						refreshing={refreshingScreen}
						onRefresh={() => {
							getStatistic(filterPerformance, 'REFRESH');
							getIncomingActivityList('REFRESH')
						}}
						tintColor='#309ed8'
						colors={['#309ed8', '#25add0', '#15c2c5']}
						progressBackgroundColor='#fff'
					/>
				}
			>
				{/* Section View performance */}
				{
					(Global.getPermissionModule('Leads', null) && (config?.performance?.new_lead == '1' || config?.performance?.conversion_rate == '1'))
						|| (Global.getPermissionModule('SalesOrder', null) && (config?.performance?.sales == '1' || config?.performance?.deal_size == '1' || config?.performance?.deal_won == '1'))
						? (
							<>
								<SpaceM />

								<Box
									backgroundColor='white1'
									paddingVertical='m'
									borderBottomWidth={0.25}
									borderTopWidth={0.25}
									borderBottomColor='black5'
									borderTopColor='black5'
								>
									{/* Section header */}
									<Tip
										id='performance'
										title={getLabel('common.title_performance')}
										body={getLabel('guidelines.label_performance') + (Global.isVersionCRMNew ? getLabel('guidelines.label_step_change_filter_by') : '')}
										pulseColor={Colors.white.white1}
										showItemPulseAnimation
										active={false}
										dismissable={false}
										onPressItem={() => { }}
										style={{
											width: widthDevice,
											backgroundColor: '#fff',
											minHeight: 36,
											zIndex: 100
										}}
									>
										<Box
											flexDirection='row'
											justifyContent='space-between'
											minHeight={36}
											paddingHorizontal='l'
											borderBottomColor='black3'
											borderBottomWidth={StyleSheet.hairlineWidth}
											alignItems='center'
											width={widthDevice}
											backgroundColor='white1'
										>
											<Text
												allowFontScaling={true}
												variant='headerSection'
											>
												{getLabel('common.title_performance')}
											</Text>

											<TouchableHighlight
												underlayColor={Colors.white.white2}
												activeOpacity={.3}
												onPress={() => {
													menuPerformance?.current?.show()
												}}
												style={{
													borderRadius: 20,
													paddingVertical: 3
												}}
											>
												<Box
													flexDirection='row'
													alignItems='center'
													paddingHorizontal='m'
													paddingVertical='s'
												>
													<Icon
														color={Colors.functional.primary}
														name={getIcon('Filter')}
													/>

													<SpaceHS />

													<Text allowFontScaling={true}
														color='primary'
													>
														{filterPerformance.label}
													</Text>
												</Box>
											</TouchableHighlight>
										</Box>
									</Tip>

									<Box
										position='absolute'
										top={0}
										left={0}
										flexDirection='row'
										justifyContent='space-between'
										minHeight={36}
										opacity={0}
										paddingHorizontal='l'
										borderBottomColor='black3'
										borderBottomWidth={StyleSheet.hairlineWidth}
										alignItems='center'
										width={widthDevice}
										backgroundColor='white1'
									>
										<Text
											allowFontScaling={true}
											variant='headerSection'
										>
											{getLabel('common.title_performance')}
										</Text>

										<TouchableHighlight
											underlayColor={Colors.white.white2}
											activeOpacity={.3}
											onPress={() => {
												menuPerformance?.current?.show()
											}}
											style={{
												borderRadius: 20,
												paddingVertical: 3
											}}
										>
											<Box
												flexDirection='row'
												alignItems='center'
												paddingHorizontal='m'
												paddingVertical='s'
											>
												<Icon
													color={Colors.functional.primary}
													name={getIcon('Filter')}
												/>

												<SpaceHS />

												<Text allowFontScaling={true}
													color='primary'
												>
													{filterPerformance.label}
												</Text>

												<Menu
													ref={menuPerformance}
													style={{}}
													button={<></>}
													animationDuration={0}
												>
													<ScrollView
														style={{
															maxHeight: heightDevice * .5
														}}
														nestedScrollEnabled={true}
													>
														{
															OptionsPeriod().map((period, index) => {
																return (
																	<MenuItem
																		key={index.toString()}
																		style={{
																			paddingLeft: 12
																		}}
																		onPress={() => {
																			setFilterPerformance(period)
																			menuPerformance?.current?.hide();
																			getStatistic(period, 'FIRST_LOAD')
																		}}
																	>
																		<Text
																			allowFontScaling={true}
																		>
																			{period.label}
																		</Text>
																	</MenuItem>
																)
															})
														}
													</ScrollView>
												</Menu>
											</Box>
										</TouchableHighlight>
									</Box>

									{/* Section content */}
									<Box
										paddingHorizontal='l'
									>
										<Tabs
											initialPage={0}
											locked={true}
											tabBarUnderlineStyle={styles.underLine}
											renderTabBar={() => <ScrollableTab
												style={{ ...styles.scrollTabs }}
												// tabsContainerStyle={{ minWidth: (widthDevice - 24) * 0.5, maxWidth: widthDevice }}
											/>
											}
										>
											{
												Global.getPermissionModule('SalesOrder', null) && config?.performance?.sales == '1' ? (
													<Tab
														heading={getLabel('home.label_tab_sales')}
														tabStyle={{ ...styles.tab }}
														activeTabStyle={{ ...styles.tabActive }}
														activeTextStyle={styles.textTabActive}
														textStyle={styles.textTab}
													>
														<PerformanceTab
															actual={dataPerformance?.sales?.value}
															previous={dataPerformance?.sales?.last_period}
															change={dataPerformance?.sales?.change}
															direction={dataPerformance?.sales?.direction}
															type='currency'
															period={filterPerformance}
															loading={loading}
															refreshing={refreshing}
															onRefresh={() => {
																setRefreshing(true);
																getStatistic(filterPerformance, 'REFRESH');
															}}
														/>
													</Tab>

												)
													: null
											}

											{
												Global.getPermissionModule('Leads', null) && config?.performance?.new_lead == '1' ? (

													<Tab
														heading={getLabel('home.label_tab_new_lead')}
														tabStyle={{ ...styles.tab }}
														activeTabStyle={{ ...styles.tabActive }}
														activeTextStyle={styles.textTabActive}
														textStyle={styles.textTab}
													>
														<PerformanceTab
															period={filterPerformance}
															actual={dataPerformance?.new_lead?.value}
															previous={dataPerformance?.new_lead?.last_period}
															change={dataPerformance?.new_lead?.change}
															direction={dataPerformance?.new_lead?.direction}
															refreshing={refreshing}
															loading={loading}
															onRefresh={() => {
																setRefreshing(true);
																getStatistic(filterPerformance, 'REFRESH');
															}}
														/>
													</Tab>

												)
													: null
											}

											{
												Global.getPermissionModule('SalesOrder', null) && config?.performance?.deal_won == '1' ? (
													<Tab
														heading={getLabel('home.label_tab_deal_won')}
														tabStyle={styles.tab}
														activeTabStyle={styles.tabActive}
														activeTextStyle={styles.textTabActive}
														textStyle={styles.textTab}
													>
														<PerformanceTab
															period={filterPerformance}
															actual={dataPerformance?.close_won_potential?.value}
															previous={dataPerformance?.close_won_potential?.last_period}
															change={dataPerformance?.close_won_potential?.change}
															direction={dataPerformance?.close_won_potential?.direction}
															refreshing={refreshing}
															loading={loading}
															onRefresh={() => {
																setRefreshing(true);
																getStatistic(filterPerformance, 'REFRESH');
															}}
														/>
													</Tab>

												)
													: null
											}

											{
												Global.getPermissionModule('SalesOrder', null) && config?.performance?.deal_size == '1' ? (
													<Tab
														heading={getLabel('home.label_tab_deal_size')}
														tabStyle={styles.tab}
														activeTabStyle={styles.tabActive}
														activeTextStyle={styles.textTabActive}
														textStyle={styles.textTab}
													>
														<PerformanceTab
															actual={dataPerformance?.avg_deal_size?.value || dataPerformance?.potential_sales?.value}
															previous={dataPerformance?.avg_deal_size?.last_period || dataPerformance?.potential_sales?.last_period}
															change={dataPerformance?.avg_deal_size?.change || dataPerformance?.potential_sales?.change}
															direction={dataPerformance?.avg_deal_size?.direction || dataPerformance?.potential_sales?.direction}
															type='currency'
															period={filterPerformance}
															refreshing={refreshing}
															loading={loading}
															onRefresh={() => {
																setRefreshing(true);
																getStatistic(filterPerformance, 'REFRESH');
															}}
														/>
													</Tab>

												)
													: null
											}

											{
												Global.getPermissionModule('Leads', null) && config?.performance?.conversion_rate == '1' ? (
													<Tab
														heading={getLabel('home.label_tab_conversion_rate')}
														tabStyle={styles.tab}
														activeTabStyle={styles.tabActive}
														activeTextStyle={styles.textTabActive}
														textStyle={styles.textTab}
													>
														<PerformanceTab
															period={filterPerformance}
															actual={dataPerformance?.convert_rate?.value}
															previous={dataPerformance?.convert_rate?.last_period}
															change={dataPerformance?.convert_rate?.change}
															direction={dataPerformance?.convert_rate?.direction}
															type='percent'
															refreshing={refreshing}
															loading={loading}
															onRefresh={() => {
																setRefreshing(true);
																getStatistic(filterPerformance, 'REFRESH');
															}}
														/>
													</Tab>

												)
													: null
											}
										</Tabs>
									</Box>
								</Box>
							</>
						)
						: null
				}

				{
					config?.incoming_activity == '0' ? null :
						(
							<>
								{/* Section View activity */}
								<SpaceM />

								<SectionView noPaddingHorizontal>
									<Tip
										id='incoming_activity'
										title={getLabel('common.title_upcoming_activities')}
										body={getLabel('guidelines.label_upcoming_activities')}
										pulseColor={Colors.white.white1}
										showItemPulseAnimation
										dismissable={false}
										onPressItem={() => { }}
										active={false}
										style={{
											width: widthDevice,
											backgroundColor: '#fff',
											zIndex: 100
										}}
									>
										<Box backgroundColor='white1' justifyContent={'space-between'} alignItems={'center'} paddingHorizontal={'l'} paddingVertical={'m'} flexDirection='row' width={widthDevice}>
											<Text allowFontScaling={true} variant='headerSection' >{getLabel('common.title_upcoming_activities')}</Text>

											<TouchableHighlight
												activeOpacity={0.3}
												underlayColor={Colors.white.white2}
												style={{
													paddingHorizontal: 12,
													paddingVertical: 4
												}}
												onPress={() => {
													menuActivity?.current?.show();
												}}
											>
												<>
													<Text
														allowFontScaling={true}
														color={'primary'}
													>
														{getLabel('common.btn_add_new')}
													</Text>
												</>
											</TouchableHighlight>
										</Box>
									</Tip>

									<Box
										position='absolute'
										top={0}
										left={0}
										backgroundColor='white1'
										justifyContent={'space-between'}
										alignItems={'center'}
										paddingHorizontal={'l'}
										paddingVertical={'m'}
										flexDirection='row'
										opacity={0}
										width={widthDevice}
									>
										<Text
											allowFontScaling={true}
											variant='headerSection'
										>
											{getLabel('common.title_upcoming_activities')}
										</Text>

										<TouchableHighlight
											activeOpacity={0.3}
											underlayColor={Colors.white.white2}
											style={{
												paddingHorizontal: 12,
												paddingVertical: 4
											}}
											onPress={() => {
												menuActivity?.current?.show();
											}}
										>
											<>
												<Text
													allowFontScaling={true}
													color={'primary'}
												>
													{getLabel('common.btn_add_new')}
												</Text>

												<Menu
													ref={menuActivity}
													style={{}}
													button={<></>}
												>
													<MenuItem
														onPress={() => {
															logScreenView('CreateCallFromHomeScene');
															handleCreateActivity('Call');
														}}
													>
														<Icon
															name={getIconModule('Call')}
														/>

														<SpaceHM />

														<Text
															allowFontScaling={true}
														>
															{getLabel('common.title_event_call')}
														</Text>
													</MenuItem>

													<MenuItem
														onPress={() => {
															logScreenView('CreateMeetingFromHomeScene');
															handleCreateActivity('Meeting');
														}}
													>
														<Icon
															name={getIconModule('Meeting')}
														/>

														<SpaceHM />

														<Text
															allowFontScaling={true}
														>
															{getLabel('common.title_event_meeting')}
														</Text>
													</MenuItem>

													<MenuItem
														onPress={() => {
															logScreenView('CreateTaskFromHomeScene');
															handleCreateActivity('Task');
														}}
													>
														<Icon
															name={getIconModule('Task')}
														/>

														<SpaceHM />

														<Text
															allowFontScaling={true}
														>
															{getLabel('common.title_event_task')}
														</Text>
													</MenuItem>
												</Menu>
											</>
										</TouchableHighlight>
									</Box>

									<Box
										paddingHorizontal={'z'}
									>
										<Divider />
									</Box>

									<SpaceS />

									<View>
										<FlatList
											data={[...incomingActivityList]}
											style={{
												maxHeight: heightDevice * .4,
												minHeight: 62
											}}
											nestedScrollEnabled={true}
											ListHeaderComponent={
												<Box
													visible={loadIncomingActivities}
													minHeight={60}
													justifyContent='center'
													alignItems='center'
												>
													<ActivityIndicator
														color={Colors.functional.primary}
														style={{
															transform: [{ scale: 1.4 }],
															paddingVertical: 4
														}}
													/>
												</Box>
											}
											ListEmptyComponent={
												<Box
													visible={(incomingActivityList.length <= 0 && !loadIncomingActivities) ? true : false}
													paddingVertical='l'
												>
													<Text
														textAlign='center'
														fontStyle='italic'
														color='dangerous'
														fontSize={12}
														allowFontScaling={true}
													>
														{getLabel('home.label_upcoming_activity_is_empty')}
													</Text>
												</Box>
											}
											// ListFooterComponent={
											// 	<>
											// 		<Box visible={loadIncomingActivities} minHeight={60} justifyContent='center' alignItems='center'>
											// 			<ActivityIndicator color={Colors.white.white5} style={{ transform: [{ scale: 1.4 }], paddingVertical: 4 }} />
											// 		</Box>
											// 		<Box
											// 			visible={(incomingActivityList.length <= 0 && !loadIncomingActivities) ? true : false}
											// 			paddingVertical='l'
											// 		>
											// 			<Text
											// 				textAlign='center'
											// 				fontStyle='italic'
											// 				color='dangerous'
											// 				fontSize={12}
											// 				allowFontScaling={true}
											// 			>
											// 				{getLabel('home.label_upcoming_activity_is_empty')}
											// 			</Text>
											// 		</Box>
											// 	</>
											// }
											renderItem={({ item, index }) =>
												<Box
													key={index}
												>
													<Box
														paddingHorizontal={'z'}
													>
														<ListItem
															style={{
																paddingHorizontal: 10
															}}
															icon={item.activitytype == 'Call' ? getIconModule('Call') : item.activitytype == 'Meeting' ? getIconModule('Meeting') : getIconModule('Task')}
															title={item.subject}
															subTitle={`${Global.formatDate(item.date_start)} ${Global.formatTime(item.date_start + ' ' + item.time_start)}`}
															iconBorder={true}
															numberOfLinesTitle={1}
															divider={false}
															titleStyle={{
																fontSize: 14
															}}
															subTitleStyle={{
																fontSize: 12,
																marginTop: 4
															}}
															onPress={() => {
																Global.isOpenComingActivity = true;

																navigation.navigate('ActivityView',
																	{
																		activity: item,
																		prevScene: 'RelatedScreen'
																	});
															}}
														/>
													</Box>

													<Divider />
												</Box>
											}
											refreshControl={
												<RefreshControl
													refreshing={refreshingIncomingActivity}
													onRefresh={() => {
														setRefreshingIncomingActivity(true)
														getIncomingActivityList('REFRESH')
													}}
													tintColor='#309ed8'
													colors={['#309ed8', '#25add0', '#15c2c5']}
													progressBackgroundColor='#fff'
												/>
											}
											onScroll={(e) => {
												setOnScrolled(true)
											}}
											keyExtractor={(item, index) => index.toString()}
											onEndReachedThreshold={0.5}
											onEndReached={() => {
												if (onScrolled) {
													if (paging && paging.next_offset) {
														getIncomingActivityList('LOAD_MORE')
													}
												}
											}}
										/>
									</View>
								</SectionView>
							</>
						)
				}

				{
					config?.ticket_open?.is_show == '0' || !Global.isVersionCRMNew ? null :
						(
							<>
								{/* Section View activity */}
								<SpaceM />

								<SectionView
									noPaddingHorizontal
								>
									<Tip
										id='ticket_open'
										title={getLabel('common.title_ticket_open')}
										body={getLabel('guidelines.label_ticket_open') + (Global.isVersionCRMNew ? getLabel('guidelines.label_step_change_filter_by') : '')}
										pulseColor={Colors.white.white1}
										showItemPulseAnimation
										dismissable={false}
										onPressItem={() => { }}
										active={false}
										style={{
											width: widthDevice,
											backgroundColor: '#fff'
										}}
									>
										<Box
											width={widthDevice}
											backgroundColor='white1'
											justifyContent={'space-between'}
											alignItems={'center'}
											paddingHorizontal={'l'}
											paddingVertical={'m'}
											flexDirection='row'
										>
											<Text
												allowFontScaling={true}
												variant='headerSection'
											>
												{getLabel('common.title_ticket_open')}
											</Text>

											<TouchableHighlight
												activeOpacity={0.3}
												underlayColor={Colors.white.white2}
												style={{
													paddingHorizontal: 12,
													paddingVertical: 4
												}}
												onPress={() => {
													navigation.navigate('TicketOpenList', { prevScreen: 'HomeScreenViewAll' });
												}}
											>
												<Text
													allowFontScaling={true}
													color={'primary'}
												>
													{getLabel('common.btn_view_all')}
												</Text>
											</TouchableHighlight>
										</Box>
									</Tip>

									<Box
										paddingHorizontal={'z'}
									>
										<Divider />
									</Box>

									<View>
										<Box
											visible={loadTicket}
											minHeight={60}
											justifyContent='center'
											alignItems='center'
										>
											<ActivityIndicator
												color={Colors.functional.primary}
												style={{
													transform: [{ scale: 1.4 }],
													paddingVertical: 4
												}}
											/>
										</Box>

										<Box
											visible={(ticketList.length <= 0 && !loadTicket) ? true : false}
											paddingVertical='l'
										>
											<Text
												textAlign='center'
												fontStyle='italic'
												color='dangerous'
												fontSize={12}
												allowFontScaling={true}
											>
												{getLabel('home.label_ticket_is_empty')}
											</Text>
										</Box>

										<Box
											visible={(ticketList.length > 0 && !loadTicket) ? true : false}
										>
											{
												ticketList?.map((item, index) => {
													return (
														<Box
															key={index}
														>
															<Box
																paddingHorizontal={'z'}
															>
																<ListItem
																	style={{
																		paddingHorizontal: 10
																	}}
																	icon={getIconModule('HelpDesk')}
																	title={item?.title || ''}
																	numberOfLinesTitle={1}
																	subTitle={item?.createdtime ? Global.formatDate(item.createdtime) : ''}
																	iconBorder={true}
																	divider={false}
																	titleStyle={{
																		fontSize: 14
																	}}
																	subTitleStyle={{
																		fontSize: 12,
																		marginTop: 4
																	}}
																	onPress={() => {
																		logScreenView('ViewDetailTicket');

																		navigation.navigate(Global.getTicketViewLabel(), {
																			ticket: item,
																			prevScene: 'HomeScreen',
																			indexSelected: index,
																		});
																	}}
																/>
															</Box>

															<Divider />
														</Box>
													)
												})
											}
										</Box>
									</View>
								</SectionView>

								<SpaceM />
							</>
						)
				}

				{
					config?.incoming_activity == '0' && config?.ticket_open?.is_show == '0' && config?.performance?.sales == '0'
						&& config?.performance?.new_lead == '0' && config?.performance?.deal_won == '0' && config?.performance?.deal_size == '0' && config?.performance?.conversion_rate == '0' ?
						(
							<Box
								justifyContent='center'
								alignItems='center'
								height={heightDevice * .8}
							>
								<Text
									fontWeight='bold'
									color='black3'
									fontSize={18}
								>
									{getLabel('home.label_config_is_disable')}
								</Text>

								<SpaceM />

								<TouchableOpacity
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'row',
										borderBottomWidth: StyleSheet.hairlineWidth,
										borderBottomColor: Colors.functional.primary
									}}
									onPress={() => {
										navigation.navigate('HomeSettings', {
											preScene: 'HomeScene'
										});
									}}
								>
									<Text
										fontSize={16}
										color='primary'

									>
										{getLabel('home.btn_config')}
									</Text>
								</TouchableOpacity>
							</Box>
						)
						: null
				}
			</Content>
		</>
	);
}

export default HomeScreen;


