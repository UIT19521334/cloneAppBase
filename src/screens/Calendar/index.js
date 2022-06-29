import Geolocation from '@react-native-community/geolocation';
import _ from 'lodash';
import moment from 'moment-timezone';
import { Input, Label, Content } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    BackHandler, DeviceEventEmitter, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform,
    RefreshControl, StyleProp, StyleSheet, TouchableHighlight, TouchableOpacity, View, PixelRatio, ActivityIndicator
} from 'react-native';
import Menu, { MenuDivider, MenuItem } from 'react-native-material-menu';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Toast from 'react-native-root-toast';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { useDispatch } from 'react-redux';
import { Body, Divider, Header, Left, NBText, NText, Right, SpaceHM, SpaceHS, SpaceS, TabContent, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import SegmentedControl from '../../components/SegmentedControl';
import Global from '../../Global';
import { CalendarList } from '../../package/react-native-calendars';
import { showActionSheet } from '../../redux/actions/actionSheet';
import { showAlert } from '../../redux/actions/alert';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box, Text } from '../../themes/themes';
import { LoadingList, LoadingMoreList } from '../../components/Loading'
//import Component
import { FOOTER_HEIGHT, formatTime, getHeightContent, getIcon, getIconModule, getLabel, HEADER_HEIGHT, heightDevice, isIphoneX, logScreenView, normalize, widthResponse } from '../../utils/commons/commons';
import { PARAMS_ACTION_SHEET, PARAMS_ALERT } from '../../utils/Models/models';
import styles from './styles';
import DeviceUiInfo from '../../utils/commons/DeviceUiInfo';
import { TextInput } from 'react-native-gesture-handler';

type TypeCalendar = 'CALL' | 'METTING' | 'TASK'

type MyCalendarItemProps = {
    type: StyleProp<TypeCalendar>,
    title: StyleProp<string>,
    status: StyleProp<string>,
    colorStatus: StyleProp<string>,
    time: StyleProp<string>,
    ownerName: StyleProp<string>,
    onPress: () => {}
}

const MyCalendarItem = ({ type, title, status, colorStatus, time = '', ownerName = '', starred = 0, onPress, toggleFavorite }: MyCalendarItemProps) => {

    let iconCalendar = '';

    switch (type) {
        case 'Call':
            iconCalendar = 'phone-alt'
            break;
        case 'Meeting':
            iconCalendar = 'users'
            break;

        default:
            iconCalendar = 'tasks'
            break;
    }

    return (
        <TouchableHighlight
            style={{
                minHeight: 80,
                width: widthResponse,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors.black.black4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.white.white1
            }}
            activeOpacity={0.3}
            underlayColor={Colors.white.white2}
            onPress={() => { onPress?.() }}

        >
            <>
                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        {
                            iconCalendar ?
                                (
                                    <Icon name={iconCalendar} color={Colors.functional.primary} />
                                )
                                :
                                null
                        }
                    </Box>
                    <Box flex={1}>
                        <Text allowFontScaling={true} fontSize={14} numberOfLines={1}>{title || ''}</Text>
                    </Box>
                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => { toggleFavorite?.() }}
                    >
                        <AntDesignIcon name={(starred == '0' || !starred) ? 'staro' : 'star'} style={[styles.iconStar, (starred == '0' || !starred) ? { color: Colors.black.black2 } : { color: Colors.yellow.yellow1 }]} />

                    </TouchableOpacity>
                </Box>

                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        <Icon name='clock' color={Colors.black.black3} />
                    </Box>
                    <Box flex={1}>
                        <Text fontSize={12} allowFontScaling={true} color={'black3'}>{time || ''}</Text>
                    </Box>

                </Box>

                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        <Icon name='user-circle' color={Colors.black.black3} />
                    </Box>
                    <Box flex={1}>
                        <Text fontSize={12} allowFontScaling={true} color={'black3'}>{ownerName || ''}</Text>
                    </Box>
                    <Box paddingRight='l'>
                        <Text fontSize={12} allowFontScaling={true} style={{ color: colorStatus ? colorStatus : Colors.black.black1 }}>{status || ''}</Text>
                    </Box>
                </Box>
            </>
        </TouchableHighlight>
    )
}

type SharedCalendarItemProps = {
    type: StyleProp<TypeCalendar>,
    title: StyleProp<string>,
    status: StyleProp<string>,
    colorStatus: StyleProp<string>,
    time: StyleProp<string>,
    ownerName: StyleProp<string>,
    userShare: StyleProp<string>,
    backgroundColorUserShare: StyleProp<string>,
    textColorUserShare: StyleProp<string>,
    onPress: () => {}
}

const SharedCalendarItem = ({ type, title, status, colorStatus, time = '', ownerName = '', userShare = '', backgroundColorUserShare = Colors.white.white1, textColorUserShare = Colors.black.black1, starred = 0, onPress, toggleFavorite }: SharedCalendarItemProps) => {

    let iconCalendar = '';

    switch (type) {
        case 'Call':
            iconCalendar = getIconModule('Call')
            break;
        case 'Meeting':
            iconCalendar = getIconModule('Meeting')
            break;

        default:
            iconCalendar = getIconModule('Task')
            break;
    }


    return (
        <TouchableHighlight
            style={{
                minHeight: 80,
                width: widthResponse,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors.black.black4,
                alignItems: 'center',
                justifyContent: 'center'
            }}
            activeOpacity={0.3}
            underlayColor={Colors.white.white2}
            onPress={() => { onPress?.() }}
        >
            <>
                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        {
                            iconCalendar ?
                                (
                                    <Icon name={iconCalendar} color={Colors.functional.primary} />
                                )
                                :
                                null
                        }
                    </Box>
                    <Box flex={1}>
                        <Text fontSize={14} allowFontScaling={true} numberOfLines={1}>{title || ''}</Text>
                    </Box>
                    <TouchableOpacity
                        style={{
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => { toggleFavorite?.() }}
                    >
                        <AntDesignIcon name={(starred == '0' || !starred) ? 'staro' : 'star'} style={[styles.iconStar, (starred == '0' || !starred) ? { color: Colors.black.black2 } : { color: Colors.yellow.yellow1 }]} />

                    </TouchableOpacity>
                </Box>

                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        <Icon name='clock' color={Colors.black.black3} />
                    </Box>
                    <Box flex={1}>
                        <Text fontSize={12} allowFontScaling={true} color={'black3'}>{time || ''}</Text>
                    </Box>
                    <Box paddingRight='l'>
                        <Text fontSize={12} allowFontScaling={true} style={{ color: colorStatus ? colorStatus : Colors.black.black1 }} >{status || ''}</Text>
                    </Box>
                </Box>

                <Box flexDirection='row' height={25} alignItems='center'>
                    <Box width={30} justifyContent='center' alignItems='center'>
                        <Icon name='user-circle' color={Colors.black.black3} />
                    </Box>
                    <Box flex={1}>
                        <Text fontSize={12} allowFontScaling={true} color={'black3'}>{ownerName || ''}</Text>
                    </Box>
                    <Box
                        marginRight='l'
                        paddingHorizontal='l'
                        paddingVertical='s'
                        alignItems='center'
                        justifyContent='center'
                        style={{ borderRadius: 30, backgroundColor: backgroundColorUserShare }}
                    >
                        <Text fontSize={12} allowFontScaling={true} style={{ color: textColorUserShare }} >{userShare}</Text>
                    </Box>
                </Box>
            </>
        </TouchableHighlight>
    )
}

const CalendarScreen = ({ route, navigation }) => {
    const [isShowCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment(new Date()).format('YYYY-MM-DD'))
    const [eventsDate, setEventsDate] = useState({})
    const [eventsDateTemp, setEventsDateTemp] = useState({})
    const [loadingEvent, setLoadingEvent] = useState(false)
    const [loading, setLoading] = useState(false);
    const [firstLoaded, setFirstLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [myActivityList, setMyActivityList] = useState([]);
    const [sharedActivityList, setSharedActivityList] = useState([]);
    const [activitySelected, setActivitySelected] = useState({});
    const [currentView, setCurrentView] = useState('MyCalendar');
    const [collapseCalendar, setCollapseCalendar] = useState(false);
    const [monthHeader, setMonthHeader] = useState(new Date());
    const [initIndexTab, setInitIndexTab] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [isShowGoToDateModal, setShowGoToDateModal] = useState(false);
    const [dateGoTo, setDateGoTo] = useState(moment(new Date()).format(Global.user?.date_format?.toUpperCase() || 'DD-MM-YYYY'));
    const [gpsLocation, setGpsLocation] = useState({});
    const [isShowConfirmCompleteMeeting, setShowConfirmCompleteMeeting] = useState(false);
    const [description, setDescription] = useState('');
    const [activityCheckOut, setActivityCheckOut] = useState({});

    const tabOptions = [
        {
            label: getLabel('calendar.tab_my_calendar'),
            dotColor: Colors.brand.brand2
        },
        {
            label: getLabel('calendar.tab_shared_calendar'),
            dotColor: Colors.brand.brand1
        }
    ]

    let menuHeader = useRef(null);
    let menuActivity = useRef(null);

    const [actionsMore, setActionsMore] = useState([
        {
            label: getLabel('common.btn_edit'),
            icon: getIcon('Edit')
        },
        {
            label: getLabel('common.btn_follow'),
            icon: getIcon('Follow')
        },
        {
            label: getLabel('common.btn_delete'),
            icon: getIcon('Delete')
        }
    ]);

    const dispatch = useDispatch();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );

        loadData('MyCalendar', 'FIRST_LOAD');
        setTimeout(() => {
            setShowCalendar(true);
        }, 500)

        return () => backHandler.remove();
    }, []);

    const _reloadData = () => {
        loadData(currentView, 'FIRST_LOAD');
    }

    useEffect(() => {

        console.log('Params change: ', route?.params);

        return () => { };
    }, [route.params]);

    useEffect(() => {
        if (Global.isVersionCRMNew) {
            const currentMonth = capitalizeFirstLetter(moment(monthHeader).format('YYYY-MM'))

            const params = {
                RequestAction: 'GetCalendarEventDates',
                Params: {
                    selected_month: currentMonth
                }
            }

            setLoadingEvent(true);

            Global.callAPI(null, params, data => {
                console.log('Data response GetCalendarEventDates: ', data);
                setLoadingEvent(false);
                if (data.success != '1') {
                    return;
                } else {
                    const events = { ...eventsDateTemp };
                    events[currentMonth] = data?.event_dates || {}
                    setEventsDateTemp(events);
                }
            },
                error => {
                    setLoadingEvent(false);
                    Toast.show(getLabel('calendar.load_activities_error_msg'));
                })
        }
        return () => {
        }
    }, [monthHeader]);

    useEffect(() => {
        if (eventsDateTemp && Object.keys(eventsDateTemp).length > 0 && Global.isVersionCRMNew) {
            let myCalendar = [];
            let shareCalendar = [];

            Object.keys(eventsDateTemp).forEach((month) => {
                myCalendar = myCalendar.concat(...(eventsDateTemp[month]?.my_calendar || []));
                shareCalendar = shareCalendar.concat(...(eventsDateTemp[month]?.shared_calendar || []));
            });
            const eventDates = {
                my_calendar: myCalendar,
                shared_calendar: shareCalendar
            }
            console.log('eventDates: ', eventDates);
            setEventsDate(eventDates)
        }
        return () => {

        }
    }, [eventsDateTemp])

    // load activity list when select date
    useEffect(() => {
        if (firstLoaded) {
            loadData(currentView, 'FIRST_LOAD');
        }
    }, [selectedDate]);

    // load activity list when select date
    useEffect(() => {
        if (firstLoaded) {
            loadData(currentView, 'FIRST_LOAD');

        }
    }, [currentView]);

    const loadData = (view: 'MyCalendar' | 'SharedCalendar', loadType: 'FIRST_LOAD' | 'REFRESH') => {
        console.log('LOG.selectedDate===============================================================================: ', selectedDate);
        if (loadType == 'REFRESH') {
            setLoading(false);
            setRefreshing(true);
        }
        else {
            setLoading(true);
            setRefreshing(false);
        }

        var params = {
            RequestAction: 'GetCalendarList',
            Params: {
                selected_date: selectedDate,
                view: view
            }
        };

        if (Global.isVersionCRMNew) {
            params.RequestAction = 'GetCalendarActivityList'
        }

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            setRefreshing(false);
            setFirstLoaded(true);
            console.log('LOG.DATA_LIST', data.entry_list);
            if (parseInt(data.success) === 1) {
                var list = data.entry_list;
                if (view == 'MyCalendar') {
                    console.log('load data setMyActivityList', list.length);
                    setMyActivityList(list);
                    if (!Global.isVersionCRMNew) {
                        setEventsDate(data.event_dates ? data.event_dates : {});

                    }
                }
                else {
                    console.log('load data setSharedActivityList', list.length);
                    setSharedActivityList(list);
                    if (!Global.isVersionCRMNew) {
                        setEventsDate(data.event_dates ? data.event_dates : {});

                    }
                }
            }
        }, error => {
            setLoading(false);
            setRefreshing(false);
            setFirstLoaded(true);
            Toast.show(getLabel('calendar.load_activities_error_msg'));
        });
    }

    const onChangeTab = (index) => {
        setInitIndexTab(index);
        console.log('selectedDate: ', selectedDate);
        setTimeout(() => {
            if (index == 0) {
                setCurrentView('MyCalendar');
                loadData('MyCalendar', 'FIRST_LOAD');

            }
            else {
                setCurrentView('SharedCalendar');
                loadData('SharedCalendar', 'FIRST_LOAD');
            }
        }, 500)
    }

    const onDayPress = (day) => {
        Global.calendarDate = day.dateString;
        setSelectedDate(day.dateString);
    }

    const getDisabledDates = (startDate, endDate, daysToDisable) => {
        const disabledDates = {};
        const start = moment(startDate);
        const end = moment(endDate);
        for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
            if (_.includes(daysToDisable, m.weekday())) {
                disabledDates[m.format('YYYY-MM-DD')] = { disabled: true };
            }
        }
        return disabledDates;
    }

    const handleCreateActivity = (type) => {
        menuActivity.current.hide();
        switch (type) {
            case 'Call':
                logScreenView('CreateCallFromCalendarScene');
                let activityCall = {
                    activitytype: 'Call',
                    date_start: new Date(selectedDate),
                    due_date: new Date(selectedDate),
                };

                navigation.navigate('ActivityForm', { activity: activityCall, prevScene: 'Calendar', onReLoadData: _reloadData });
                break;
            case 'Meeting':
                logScreenView('CreateMeetingFromCalendarScene');
                let activityMeeting = {
                    activitytype: 'Meeting',
                    date_start: new Date(selectedDate),
                    due_date: new Date(selectedDate),
                };

                navigation.navigate('ActivityForm', { activity: activityMeeting, prevScene: 'Calendar', onReLoadData: _reloadData });
                break;
            case 'Task':
                logScreenView('CreateTaskFromCalendarScene');
                let activityTask = {
                    activitytype: 'Task',
                    date_start: new Date(selectedDate),
                    due_date: new Date(selectedDate),
                };

                navigation.navigate('ActivityForm', { activity: activityTask, prevScene: 'Calendar', onReLoadData: _reloadData });
                break;

            default:
                break;
        }
    }

    const hideMenu = () => {
        menuHeader.current.hide();
        // onSelected?.(item);
    }

    const showMenu = () => menuHeader.current.show();

    const capitalizeFirstLetter = (str) => {
        return str[0]?.toUpperCase() + str.slice(1);
    };

    const toggleFavorite = (data, indexSelected) => {
        setProcessing(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Calendar',
                id: data.id,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                if (currentView == 'MyCalendar') {
                    let list = myActivityList;
                    list[indexSelected].starred = (list[indexSelected].starred == 0) ? 1 : 0;

                    setMyActivityList(list)
                }
                else {
                    let list = sharedActivityList;
                    list[indexSelected].starred = (list[indexSelected].starred == 0) ? 1 : 0;

                    setSharedActivityList(list)
                }
            }
            setProcessing(false)
        }, error => {
            setProcessing(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const showActions = (item, indexRecord, isComplete) => {
        const isOwnerRecord = Global.isOwnerRecord(item?.assigned_owners)
        let actions = [...actionsMore];
        if (!isOwnerRecord || isComplete) {
            actions = [actionsMore[1]]
        }
        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('common.label_option'),
            indexSelected: actions.length > 1 ? actions.length - 1 : -1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actions,
            onSelected: (index) => {
                if (isComplete) {
                    toggleFavorite(item, indexRecord);
                }
                else {
                    switch (index) {
                        case 0:
                            // Edit
                            logScreenView('EditActivityFromCalendarScene');
                            navigation.navigate('ActivityForm', { prevScene: 'Calendar', activity: item, onReLoadData: _reloadData });
                            break;
                        case 1:
                            // Follow
                            toggleFavorite(item, indexRecord);
                            break;
                        case 2:
                            // Delete
                            const params: PARAMS_ALERT = {
                                message: getLabel('common.title_confirm_delete_record'),
                                actions: [
                                    {
                                        isCancel: true,
                                        label: getLabel('common.btn_cancel')
                                    },
                                    {
                                        isCancel: false,
                                        label: getLabel('common.btn_delete'),
                                        isHighLight: true,
                                        onPress: () => {
                                            setLoading(true);
                                            Global.deleteRecord('Calendar', item.id, data => {
                                                logScreenView('DeleteActivityFromCalendarScene');
                                                console.log('LOG.indexRecord: ', indexRecord);
                                                Toast.show(getLabel('common.msg_delete_success', { module: getLabel('activity.title').toLowerCase() }));
                                                Global.updateCounters();
                                                let myActivityListTmp = [...myActivityList];
                                                myActivityListTmp.splice(indexRecord, 1);
                                                setMyActivityList(myActivityListTmp);
                                                setLoading(false);
                                            },
                                                error => {
                                                    Toast.show(getLabel('common.msg_delete_error', { module: I18n.t('activity.title').toLowerCase() }));
                                                    setLoading(false);
                                                })
                                        }
                                    }
                                ]
                            }

                            dispatch(showAlert?.(params));

                            break;
                        default:
                            break;
                    }
                }
            }
        }
        dispatch(showActionSheet(params));
    }

    const completeActivity = (activity, type) => {
        /* To do */
        /* Check activity in future */
        setLoading(true);
        var params = {
            RequestAction: 'SaveActivity',
            Data: {
                id: activity.id
            }
        };

        if (activity.activitytype == 'Task') {
            params.Data.taskstatus = 'Completed';
        }
        else {
            params.Data.eventstatus = 'Held';
        }

        if (type == 'check_out') { // Check out meeting
            params.Data.description = description;
        }

        // activity api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                setLoading(false);
                Toast.show(getLabel('common.msg_edit_error', { module: getLabel('activity.title').toLowerCase() }));
                return;
            }

            Toast.show(getLabel('common.msg_edit_success', { module: getLabel('activity.title').toLowerCase() }));

            // Update counters triggered
            Global.updateCounters();

            loadData(currentView, 'FIRST_LOAD');
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const renderConfirmCompleteMeeting = () => {
        return (
            <Modal
                visible={isShowConfirmCompleteMeeting}
                transparent={true}
                animationType='fade'
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent'
                    }}
                >
                    <Box
                        style={{ backgroundColor: 'transparent' }}
                        flex={1}
                        alignItems='center'
                        justifyContent='center'
                    >
                        {/* Back drop */}
                        <Box
                            width={widthResponse}
                            height={heightDevice}
                            backgroundColor='black1'
                            opacity={.5}
                            position='absolute'
                            onTouchEnd={() => { Keyboard.dismiss() }}
                        />

                        {/* Content */}
                        <Box
                            width={widthResponse * 0.8}
                            backgroundColor='white1'
                            borderRadius={8}
                            marginBottom='xl'
                            // minHeight={heightDevice * .2}
                            style={[styles.shadow]}
                        >

                            {/* Header */}
                            <Box
                                height={40}
                                justifyContent='center'
                                paddingHorizontal='l'
                            >
                                <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{getLabel('activity.title_mask_complete')}</Text>
                            </Box>
                            {/* Body */}
                            <Box
                                borderWidth={StyleSheet.hairlineWidth}
                                borderColor='black4'
                                minHeight={heightDevice * .2}
                            >
                                <Box
                                    marginTop='l'
                                    paddingHorizontal='l'
                                >
                                    <Label style={{
                                        paddingLeft: 0,
                                        fontSize: 14,
                                        color: Colors.black.black3,
                                        marginBottom: 10
                                    }}>
                                        {getLabel('activity.label_description')}
                                    </Label>
                                    <Box
                                        minHeight={heightDevice * .2}
                                        maxHeight={heightDevice * .4}
                                    >
                                        <TextInput
                                            style={{
                                                color: Colors.black.black1,
                                                borderWidth: 0.5,
                                                minHeight: heightDevice * .2,
                                                borderRadius: 6,
                                                borderColor: Colors.black.black4,
                                                textAlignVertical: 'top',
                                                padding: 8
                                            }}
                                            placeholder={getLabel('activity.label_description')}
                                            value={description}
                                            autoCapitalize='none'
                                            multiline={true}
                                            allowFontScaling={true}
                                            onChangeText={(value) => {
                                                setDescription(value);
                                            }}
                                        />
                                    </Box>

                                </Box>
                                <SpaceS />
                            </Box>
                            {/* Footer */}
                            <Box
                                height={50}
                                flexDirection='row'
                            >
                                {/* Button Cancel */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomLeftRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        setShowConfirmCompleteMeeting(false);
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRightWidth={StyleSheet.hairlineWidth}
                                        borderRightColor='black4'
                                    >
                                        <Text allowFontScaling={true} fontWeight='600'>{getLabel('common.btn_cancel')}</Text>
                                    </Box>
                                </TouchableHighlight>

                                {/* Button Save */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomRightRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        setShowConfirmCompleteMeeting(false);
                                        completeActivity(activityCheckOut, 'check_out');
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderLeftWidth={StyleSheet.hairlineWidth}
                                        borderLeftColor='black4'
                                    >
                                        <Text allowFontScaling={true} color='primary' fontWeight='600'>{getLabel('common.btn_save')}</Text>
                                    </Box>
                                </TouchableHighlight>
                            </Box>

                        </Box>
                    </Box>
                </KeyboardAvoidingView>
            </Modal>
        )
    }

    const renderCalendarWithSelectableDate = () => {
        let formattedEvensDate = {};
        let myEventDates = eventsDate?.my_calendar ? eventsDate?.my_calendar : [];
        let sharedEventDates = eventsDate?.shared_calendar ? eventsDate?.shared_calendar : [];

        formattedEvensDate = myEventDates?.reduce((obj, item) => {
            const isSelected = (item === selectedDate);
            obj[item] = {
                selected: isSelected,
                selectedColor: '#eaf4fa',
                selectedDayTextColor: Colors.functional.primary,
                dots: [
                    isSelected ? {} : { key: 'mine', color: Colors.brand.brand2, selectedDotColor: 'red' },
                ],
            };

            return obj;
        }, {});

        sharedEventDates?.length > 0 && sharedEventDates.map((eventDate) => {
            const isSelected = (eventDate === selectedDate);
            if (formattedEvensDate?.[eventDate]) {
                if (formattedEvensDate?.[eventDate]?.dots?.length > 0) {
                    if (!isSelected) {
                        formattedEvensDate[eventDate].dots.push({
                            key: 'shared',
                            color: Colors.brand.brand1,
                            selectedDotColor: 'red'
                        })
                    }
                }
                else {

                }
            }
            else {
                formattedEvensDate[eventDate] = {
                    selected: isSelected,
                    selectedColor: '#eaf4fa',
                    selectedDayTextColor: Colors.functional.primary,
                    dots: [
                        isSelected ? {} : { key: 'shared', color: Colors.brand.brand1, selectedDotColor: 'red' },
                    ],
                }
            }
        })
        // Format selected date if selected date is not event date
        if (!myEventDates?.includes(moment(selectedDate).format('YYYY-MM-DD')) && !sharedEventDates?.includes(moment(selectedDate).format('YYYY-MM-DD'))) {
            formattedEvensDate[moment(selectedDate).format('YYYY-MM-DD')] = {
                selected: true,
                selectedColor: '#eaf4fa',
                selectedDayTextColor: Colors.functional.primary,
                dots: [
                    {}
                ],
            };
        }

        const calendarStyle = {
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: Colors.black.black4,
            todayTextColor: Colors.functional.primary,
            selectedDayTextColor: Colors.functional.primary,
            dayTextColor: Colors.black.black1,
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '700',
            textDayFontSize: 14,
            textMonthFontSize: 14,
            textDayHeaderFontSize: 14,
            selectedText: { fontSize: 14 },
            'stylesheet.day.single': {
                base: {
                    height: 28,
                    width: 28,
                    alignItems: 'center'
                },
                text: {
                    marginTop: Platform.OS === 'android' ? 2 : 3
                }
            },
            'stylesheet.calendar.header': {
                week: {
                    marginTop: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                },
            },
            'stylesheet.calendar.main': {
                week: {
                    marginTop: 3,
                    marginBottom: 3,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                },
            },
        }

        return (
            <Box backgroundColor='white1'>
                <View style={styles.headerCalendarView}>
                    <Box
                        alignItems='center'
                        flexDirection='row'
                    >
                        <NBText allowFontScaling={true} >{capitalizeFirstLetter(moment(monthHeader).format('MMMM/YYYY'))}</NBText>
                        {
                            loadingEvent ? (
                                <ActivityIndicator
                                    size='small'
                                    color={Colors.functional.primary}
                                    style={{
                                        transform: [
                                            {
                                                scale: .6
                                            }
                                        ]
                                    }}
                                />
                            )
                                : null
                        }
                    </Box>
                    <TouchableOpacity style={styles.btnShowHide}
                        onPress={() => { setCollapseCalendar(!collapseCalendar) }}
                    >
                        <Icon
                            name={collapseCalendar ? 'angle-double-up' : 'angle-double-down'}
                            style={styles.iconButtonShowHide}
                        />
                        <Text allowFontScaling={true} style={styles.txtButtonShowHide}>
                            {collapseCalendar ? getLabel('calendar.btn_collapse_calendar') : getLabel('calendar.btn_expand_calendar')}
                        </Text>
                    </TouchableOpacity>
                </View>
                <CalendarList
                    style={[styles.calendar, { height: collapseCalendar ? 264 : 10, maxWidth: widthResponse }]}
                    current={selectedDate}
                    markingType={'multi-dot'}
                    onDayPress={onDayPress}
                    theme={calendarStyle}
                    markedDates={formattedEvensDate}
                    pastScrollRange={50}
                    pagingEnabled={true}
                    futureScrollRange={50}
                    scrollEnabled={true}
                    showScrollIndicator={true}
                    horizontal={true}
                    onVisibleMonthsChange={(months) => { setMonthHeader(months?.[0]?.dateString) }}
                    renderHeader={(date) => {
                        return (
                            <></>
                        )
                    }}
                />
            </Box>
        );
    }

    const renderHiddenRow = (item, index) => {
        let isComplete = false;
        if ((item.status == 'Held' && item.activitytype != 'Task') || (item.status == 'Completed')) {
            isComplete = true;
        }

        console.log('Assign owner: ', item?.assigned_owners, Global.isOwnerRecord(item?.assigned_owners));
        const isOwnerRecord = Global.isOwnerRecord(item?.assigned_owners);
        return (
            <View style={[styles.rowHidden]}>
                <View style={styles.actionsHidden}>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            disabled={!isOwnerRecord || isComplete || item.activitytype != 'Meeting' || (item.activitytype == 'Meeting' && item.is_checked_in == 1)}
                            onPress={() => {
                                // var dataCheckIn = { ...data };
                                logScreenView('CheckInActivityFromCalendarScene');
                                Global.checkPermissionLocation(() => {
                                    navigation.navigate('Camera', { cameraType: 'both', type: 'check_in', data: item, prevScene: 'Calendar', onReLoadData: _reloadData, title: getLabel('common.title_check_in') })
                                    Global.getInformationLocationCheckIn(null);
                                })
                                // checkIn(item, gpsLocation);
                            }}
                        >
                            <Icon name={getIcon('CheckIn')} style={[styles.iconAction, (!isOwnerRecord || isComplete || item.activitytype != 'Meeting' || (item.activitytype == 'Meeting' && item.is_checked_in == 1)) ? { color: '#b2b2b2' } : {}]} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            disabled={isComplete || !isOwnerRecord}
                            onPress={() => {
                                if (item.is_checked_in == 1) {
                                    setActivityCheckOut(item);
                                    setDescription(item?.description || '');
                                    setShowConfirmCompleteMeeting(true);
                                }
                                else {
                                    completeActivity(item);
                                }
                            }}
                        >
                            <Icon name={'check'} style={[styles.iconAction, !isOwnerRecord || isComplete ? { color: '#b2b2b2' } : {}]} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => {
                                showActions(item, index, isComplete)
                            }}
                        >
                            <Icon name={getIcon('More')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }

    const renderTabMyCalendar = () => {

        const heightListView = !collapseCalendar ? (heightDevice - HEADER_HEIGHT - FOOTER_HEIGHT - (isIphoneX ? 54 : 0) - 165) : (heightDevice - HEADER_HEIGHT - FOOTER_HEIGHT - 252 - (isIphoneX ? 57 : 0) - 165)

        return (
            <TabContent>
                <LoadingList loading={loading} lineHeight={18} numberItem={3} iconTitle={true} minHeight={40} />
                <SwipeListView
                    useFlatList={true}
                    style={{ minHeight: 50, maxHeight: heightListView }}
                    data={[...myActivityList]}
                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipe={false}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data.item, data.index)}
                                <MyCalendarItem
                                    type={data.item.activitytype}
                                    title={data.item.title}
                                    time={formatTime(data.item.start)}
                                    ownerName={Global.getAssignedOwnersName(data.item.assigned_owners)}
                                    status={
                                        data.item.activitytype == 'Task'
                                            ? Global.getEnumLabel('Calendar', 'taskstatus', data.item.status)
                                            : Global.getEnumLabel('Events', 'eventstatus', data.item.status)
                                    }
                                    colorStatus={
                                        data.item.activitytype == 'Task'
                                            ? Global.getEnumColor('Calendar', 'taskstatus', data.item.status)
                                            : Global.getEnumColor('Events', 'eventstatus', data.item.status)
                                    }
                                    starred={data.item?.starred}
                                    onPress={() => { setActivitySelected({ index: data.index, type: 'MyCalendar' }); logScreenView('ViewActivityFromCalendarScene'); navigation.navigate('ActivityView', { activity: data.item, prevScene: 'Calendar', onReLoadData: _reloadData }) }}
                                    toggleFavorite={() => toggleFavorite(data.item, data.index)}
                                />
                            </SwipeRow>
                        )
                    }}
                    onRowOpen={(rowKey, rowMap) => {
                        setTimeout(() => {
                            rowMap[rowKey] && rowMap[rowKey].closeRow();
                        }, 4000)
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadData(currentView, 'REFRESH')
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    onEndReachedThreshold={0.1}
                    onPanResponderTerminationRequest={false}
                />
            </TabContent>

        );
    }

    const renderTabSharedCalendar = () => {
        const heightListView = !collapseCalendar ? (heightDevice - HEADER_HEIGHT - FOOTER_HEIGHT - (isIphoneX ? 54 : 0) - 165) : (heightDevice - HEADER_HEIGHT - FOOTER_HEIGHT - 252 - (isIphoneX ? 57 : 0) - 165)

        return (
            <TabContent >
                <LoadingList loading={loading} lineHeight={18} numberItem={3} iconTitle={true} minHeight={40} />
                <FlatList
                    style={{ minHeight: 50, maxHeight: heightListView }}
                    keyExtractor={(item, idx) => idx.toString()}
                    data={sharedActivityList}
                    renderItem={({ item, index }) => {
                        return (
                            <SharedCalendarItem
                                type={item.activitytype}
                                title={item.title}
                                time={formatTime(item.start)}
                                ownerName={Global.getAssignedOwnersName(item.assigned_owners)}
                                status={
                                    item.activitytype == 'Task'
                                        ? Global.getEnumLabel('Calendar', 'taskstatus', item.status)
                                        : Global.getEnumLabel('Events', 'eventstatus', item.status)
                                }
                                colorStatus={
                                    item.activitytype == 'Task'
                                        ? Global.getEnumColor('Calendar', 'taskstatus', item.status)
                                        : Global.getEnumColor('Events', 'eventstatus', item.status)
                                }
                                userShare={Global.getUser(item.userid).full_name}
                                backgroundColorUserShare={item.color}
                                textColorUserShare={item.textColor}
                                starred={item?.starred}
                                onPress={() => { setActivitySelected({ index: index, type: 'SharedCalendar' }); logScreenView('ViewActivityFromCalendarScene'); navigation.navigate('ActivityView', { activity: item, prevScene: 'Calendar', onReLoadData: _reloadData }) }}
                                toggleFavorite={() => toggleFavorite(item, index)}
                            />
                        )
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadData(currentView, 'REFRESH')
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                />
            </TabContent>

        );
    }

    const renderGoToDateModal = () => {
        return (
            <Modal
                visible={isShowGoToDateModal}
                transparent={true}
                animationType='fade'
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent'
                    }}
                >
                    <Box
                        style={{ backgroundColor: 'transparent' }}
                        flex={1}
                        alignItems='center'
                        justifyContent='center'
                    >
                        {/* Back drop */}
                        <Box
                            width={widthResponse}
                            height={heightDevice}
                            backgroundColor='black1'
                            opacity={.5}
                            position='absolute'
                            onTouchEnd={() => { Keyboard.dismiss() }}
                        />

                        {/* Content */}
                        <Box
                            width={widthResponse * 0.8}
                            backgroundColor='white1'
                            borderRadius={8}
                            marginBottom='xl'
                            style={[styles.shadow]}
                        >

                            {/* Header */}
                            <Box
                                height={40}
                                justifyContent='center'
                                paddingHorizontal='l'
                            >
                                <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{getLabel('calendar.btn_go_to_date')}</Text>
                            </Box>
                            {/* Body */}
                            <Box
                                borderWidth={StyleSheet.hairlineWidth}
                                borderColor='black4'
                            >
                                <Box
                                    height={50}
                                    marginTop='l'
                                    paddingHorizontal='l'
                                    justifyContent='center'
                                >
                                    <Input
                                        style={[
                                            {
                                                color: Colors.black.black1,
                                                borderWidth: 0.5,
                                                height: 50,
                                                borderRadius: 6,
                                                marginTop: 10,
                                                borderColor: Colors.black.black4,
                                                fontSize: 14
                                            }
                                        ]}
                                        selectTextOnFocus={true}
                                        placeholder={Global.user?.date_format.toUpperCase()}
                                        value={dateGoTo}
                                        autoCapitalize='none'
                                        keyboardType='numeric'
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                        onSubmitEditing={() => {
                                            setShowGoToDateModal(false);
                                            onDayPress({ dateString: moment(dateGoTo, Global.user?.date_format?.toUpperCase()).format('YYYY-MM-DD') });
                                            setDateGoTo('');
                                        }}
                                        onChangeText={(value) => {
                                            if (dateGoTo.length > value.length) { // Check is delete characters
                                                setDateGoTo(value);
                                            }
                                            else {
                                                if (value.length < 11) {
                                                    let tmpValue = value;
                                                    if (Global?.user?.date_format?.split('-')?.[0]?.length == 2) {
                                                        if (value.length == 2 || value.length == 5) {
                                                            tmpValue = value + '-';
                                                        }
                                                        else {
                                                            //Add character '/' to string
                                                            if (value.length >= 2 && value[2] != '-') {
                                                                tmpValue = value.splice(2, 0, '-');
                                                            }

                                                            if (value.length >= 5 && value[5] != '-') {
                                                                tmpValue = value.splice(5, 0, '-');
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (value.length == 4 || value.length == 7) {
                                                            tmpValue = value + '-';
                                                        }
                                                        else {
                                                            //Add character '/' to string
                                                            if (value.length >= 4 && value[4] != '-') {
                                                                tmpValue = value.splice(4, 0, '-');
                                                            }

                                                            if (value.length >= 7 && value[7] != '-') {
                                                                tmpValue = value.splice(7, 0, '-');
                                                            }
                                                        }
                                                    }

                                                    setDateGoTo(tmpValue);
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                                <SpaceS />
                            </Box>
                            {/* Footer */}
                            <Box
                                height={50}
                                flexDirection='row'
                            >
                                {/* Button Cancel */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomLeftRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        setShowGoToDateModal(false);
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRightWidth={StyleSheet.hairlineWidth}
                                        borderRightColor='black4'
                                    >
                                        <Text allowFontScaling={true} fontWeight='600'>{getLabel('common.btn_cancel')}</Text>
                                    </Box>
                                </TouchableHighlight>

                                {/* Button Save */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomRightRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        setShowGoToDateModal(false);
                                        onDayPress({ dateString: moment(dateGoTo, Global.user?.date_format?.toUpperCase()).format('YYYY-MM-DD') });
                                        setDateGoTo('');
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderLeftWidth={StyleSheet.hairlineWidth}
                                        borderLeftColor='black4'
                                    >
                                        <Text allowFontScaling={true} color='primary' fontWeight='600'>{getLabel('calendar.btn_go_to_date')}</Text>
                                    </Box>
                                </TouchableHighlight>
                            </Box>

                        </Box>
                    </Box>
                </KeyboardAvoidingView>
            </Modal>
        )
    }

    return (
        <>
            <Header>
                <Left
                    style={{
                        width: widthResponse * .3
                    }}
                >
                    <TouchableHighlight
                        activeOpacity={.3}
                        underlayColor={Colors.black.black5}
                        style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Icon name={getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                    </TouchableHighlight>
                </Left>
                <Body
                    style={{
                        width: widthResponse * .4
                    }}
                >
                    <Title allowFontScaling={true} >{getLabel('common.tab_calendar')}</Title>
                </Body>
                <Right
                    style={{
                        width: widthResponse * .3,
                    }}
                >
                    <TouchableHighlight
                        style={{ marginRight: 4, borderRadius: 30, height: widthResponse * .15 >= 40 ? 40 : (widthResponse * .15), width: widthResponse * .15 >= 40 ? 40 : (widthResponse * .15), justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={0.3}
                        underlayColor='#d0d0d0'
                        onPress={() => {
                            menuActivity?.current?.show();
                        }}
                    >
                        <>
                            <Icon name={getIcon('Add')} style={{ fontSize: widthResponse * .15 >= 40 ? 22 : 18 }} />
                            <Menu
                                ref={menuActivity}
                                style={{}}
                                button={
                                    <></>
                                }
                            >
                                <MenuItem
                                    onPress={() => { handleCreateActivity('Call') }}
                                >
                                    <Icon name={getIconModule('Call')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_call')}</NText>
                                </MenuItem>
                                <MenuItem
                                    onPress={() => { handleCreateActivity('Meeting') }}
                                >
                                    <Icon name={getIconModule('Meeting')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_meeting')}</NText>
                                </MenuItem>
                                <MenuItem
                                    onPress={() => { handleCreateActivity('Task') }}
                                >
                                    <Icon name={getIconModule('Task')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_task')}</NText>
                                </MenuItem>
                            </Menu>

                        </>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{ marginRight: 4, borderRadius: 30, height: widthResponse * .15 >= 40 ? 40 : (widthResponse * .15), width: widthResponse * .15 >= 40 ? 40 : (widthResponse * .15), justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={0.3}
                        underlayColor='#d0d0d0'
                        onPress={() => {
                            logScreenView('CalendarSetting');
                            navigation.navigate('CalendarSetting', { prevScene: 'Calendar', onReLoadData: _reloadData })
                        }}
                    >
                        <Icon name={getIcon('Setting')} style={{ fontSize: widthResponse * .15 >= 40 ? 22 : 18 }} />
                    </TouchableHighlight>
                </Right>
            </Header>

            {isShowCalendar && renderCalendarWithSelectableDate()}
            <SpaceS />
            <Content scrollEnabled={false} style={{}}>
                <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white.white1, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: widthResponse, paddingHorizontal: 12, paddingTop: 15 }}>

                        <TouchableHighlight
                            underlayColor={Colors.white.white2}
                            activeOpacity={.3}
                            onPress={showMenu}
                        >
                            <>
                                <Box
                                    paddingHorizontal='m'
                                    paddingVertical='m'
                                    borderRadius={20}
                                    flexDirection='row'
                                    borderWidth={1}
                                    borderColor='black5'
                                    justifyContent='center'
                                    alignItems='center'
                                    minHeight={32}
                                    style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 5
                                    }}
                                >
                                    <Icon name={getIcon('Calendar')} color={Colors.functional.primary} />
                                    <SpaceHS />
                                    <Text
                                        allowFontScaling={true}
                                        style={{ textTransform: 'capitalize', fontSize: 14 }}
                                        color={'primary'}>
                                        {moment(selectedDate, 'YYYY-MM-DD').format(`dddd, ${Global.user?.date_format.toUpperCase()}`)}
                                    </Text>
                                </Box>
                                <Menu
                                    style={{ marginTop: -15 }}
                                    ref={menuHeader}
                                    button={
                                        <></>
                                    }
                                    animationDuration={0}
                                >
                                    <MenuItem
                                        style={{ width: 180, justifyContent: 'center', alignItems: 'center', height: 35 }}
                                    >
                                        <Icon name={getIcon('Calendar')} color={Colors.functional.primary} />
                                        <SpaceHS />
                                        <NText allowFontScaling={true} style={{ textTransform: 'capitalize' }} color={Colors.functional.primary}>{moment(selectedDate, 'YYYY-MM-DD').format(`dddd, ${Global.user?.date_format.toUpperCase()}`)}</NText>
                                    </MenuItem>
                                    <MenuDivider />
                                    <MenuItem
                                        style={{ justifyContent: 'center', alignItems: 'flex-start' }}
                                        onPress={() => {
                                            hideMenu();
                                            onDayPress({ dateString: moment(new Date()).format('YYYY-MM-DD') });
                                        }}
                                    >
                                        <SpaceHM />
                                        {getLabel('calendar.btn_today')}
                                    </MenuItem>
                                    <MenuItem
                                        style={{ justifyContent: 'center', alignItems: 'flex-start' }}
                                        onPress={() => {
                                            hideMenu();
                                            onDayPress({ dateString: moment(new Date()).add(1, 'days').format('YYYY-MM-DD') });

                                        }}
                                    >
                                        <SpaceHM />
                                        {getLabel('calendar.btn_tomorrow')}
                                    </MenuItem>
                                    <MenuItem
                                        style={{ justifyContent: 'center', alignItems: 'flex-start' }}
                                        onPress={() => {
                                            hideMenu();
                                            setShowGoToDateModal(true);
                                        }}
                                    >
                                        <SpaceHM />
                                        {getLabel('calendar.btn_go_to_date')}
                                    </MenuItem>
                                </Menu>
                            </>
                        </TouchableHighlight>

                        <Box
                            flexDirection='row'
                            borderRadius={20}
                            borderWidth={1}
                            borderColor='black5'
                            alignItems='center'
                            justifyContent='center'
                            minHeight={32}
                        >

                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 30
                                }}
                                onPress={() => {
                                    onDayPress({ dateString: moment(selectedDate).add(-1, 'days').format('YYYY-MM-DD') });
                                }}
                            >
                                <Text
                                    allowFontScaling={true}
                                    color={'black3'}
                                    style={{
                                        fontSize: 12
                                    }}
                                >
                                    <Icon name='angle-left' allowFontScaling={true} size={20} />
                                </Text>
                            </TouchableOpacity>

                            <TouchableHighlight
                                activeOpacity={0.3}
                                underlayColor={Colors.white.white2}
                                style={{
                                    paddingHorizontal: 4,
                                    paddingVertical: 4,
                                    borderLeftWidth: 1,
                                    borderRightWidth: 1,
                                    borderColor: Colors.black.black5
                                }}
                                onPress={() => {
                                    onDayPress({ dateString: moment(new Date()).format('YYYY-MM-DD') });
                                }}
                            >
                                <Text
                                    allowFontScaling={true}
                                    color={'primary'}
                                    fontSize={14}
                                >
                                    {getLabel('calendar.btn_today')}
                                </Text>
                            </TouchableHighlight>

                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 30,
                                }}
                                onPress={() => {
                                    onDayPress({ dateString: moment(selectedDate).add(1, 'days').format('YYYY-MM-DD') });

                                }}
                            >
                                <Text
                                    allowFontScaling={true}
                                    color={'black3'}
                                    fontSize={14}
                                >
                                    <Icon name='angle-right' allowFontScaling={true} size={20} />
                                </Text>
                            </TouchableOpacity>

                        </Box>

                    </View>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: Colors.white.white1
                    }}>
                        <SegmentedControl
                            tabs={tabOptions}
                            currentIndex={initIndexTab}
                            onChange={(index) => {
                                setInitIndexTab(index);
                                if (index == 0) {
                                    setCurrentView('MyCalendar');
                                }
                                else {
                                    setCurrentView('SharedCalendar');
                                }
                            }}
                            activeTextColor={Colors.black.black1}
                            textColor={Colors.black.black2}
                            segmentedControlBackgroundColor={'#f0f0f0'}
                            paddingVertical={8}
                        />
                        <Divider style={{ width: widthResponse }} />
                        <View
                            style={{
                                flex: 1,
                                width: widthResponse,
                                flexDirection: 'row',
                                backgroundColor: Colors.white.white4,
                            }}
                        >

                            {initIndexTab == 0 && isShowCalendar && renderTabMyCalendar()}
                            {initIndexTab == 1 && isShowCalendar && renderTabSharedCalendar()}
                        </View>
                    </View>
                </View>
            </Content>

            {renderGoToDateModal()}
            {renderConfirmCompleteMeeting()}
            <IndicatorLoading loading={processing} />
        </>
    )
}

export default CalendarScreen;
