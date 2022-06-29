import { Content, Row, Text } from 'native-base';
import React, { Component } from 'react';
import {
    BackHandler, DeviceEventEmitter, FlatList, RefreshControl, TouchableHighlight, TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-root-toast';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
//Import Component
import CollapsibleList from '../../components/CollapsibleList';
import { Body, Header, ItemContentView, LargeHeader, Left, ListItemNotification, NBText, Right, SBText, SText, TabContent, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import { LoadingList, LoadingMoreList } from '../../components/Loading';
import SegmentedControl from '../../components/SegmentedControl';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { getIcon, getLabel, heightDevice } from '../../utils/commons/commons';
import styles from './styles';

class NotificationScreen extends Component {
    constructor(props) {
        super(props);

        this.navigation = this.props.navigation;
        this.route = this.props.route;

        this.state = {
            tabsOption: [
                {
                    label: getLabel('notification.tab_updates'),
                    badgeCount: 0,
                    isLoaded: false,
                },
                {
                    label: getLabel('notification.tab_tasks'),
                    badgeCount: 0,
                    isLoaded: false,
                },
                {
                    label: getLabel('notification.tab_birthdays'),
                    badgeCount: 0,
                    isLoaded: false,
                }
            ],
            tabSelected: 0,
            tabChanged: false,
            loaded: false,
            paging: {},
            loadingTabUpdate: false,
            loadMoreTabUpdate: false,
            refreshingTabUpdate: false,
            notificationList: [],
            // define state for the tab activity
            collapseOverdue: true,
            pagingTabTaskExpired: {},
            loadingTabTaskExpired: false,
            loadMoreTabTaskExpired: false,
            refreshingTabTaskExpired: false,
            collapseUpcoming: true,
            pagingTabTaskComing: {},
            loadingTabTaskComing: false,
            loadMoreTabTaskComing: false,
            refreshingTabTaskComing: false,
            notificationActivity: {
                comingList: [],
                overdueList: []
            },
            // define state for the tab birthdays
            collapseBirthDayToday: false,
            pagingTabBirthdayToday: {},
            loadingTabBirthdayToday: false,
            loadMoreTabBirthdayToday: false,
            refreshingTabBirthdayToday: false,
            collapseBirthdayUpcoming: false,
            pagingTabBirthdayComing: {},
            loadingTabBirthdayComing: false,
            loadMoreTabBirthdayComing: false,
            refreshingTabBirthdayComing: false,
            notificationBirthDay: {
                todayList: [],
                comingList: []
            },
            // define state for the feature accept invite meeting
            loading: false,
            /**
             * @author          : Manh Le
             * @date_change     : 2022-06-10
             * @purpose         : [Notifications] Request #6439: modify UI and backend logic to separate important notifications end check-in notifications
             * @description     : define state for a new feature
             * @version_crm     : 7.1.0.20220610.1200
             */
            collapseUpdate: true,
            collapseCheckIn: true,
            pagingCheckIn: {},
            loadingTabCheckIn: false,
            loadMoreTabCheckIn: false,
            refreshingTabCheckIn: false,
            notifies: {
                updateList: [],
                checkInList: []
            },
            // End by Manh Le at 2022-06-10
            counter: Global.counters.notifications_count || {},
            prevCounter: Global.counters.notifications_count || {}
        }
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );

        this.subscriberNewNotification = DeviceEventEmitter.addListener('HasNewNotification', (notification) => {
            switch (this.state.tabSelected) {
                case 0:
                    if (Global.checkVersionCRMExist('7.1.0.20220610.1200')) {
                        this.loadNotification('notify', 'FIRST_LOAD', 'update');
                        this.loadNotification('notify', 'FIRST_LOAD', 'checkin');
                    }
                    else {
                        this.loadNotification('notification', 'FIRST_LOAD');
                    }

                    break;

                case 1:
                    this.loadNotification('activity', 'FIRST_LOAD', 'coming');
                    this.loadNotification('activity', 'FIRST_LOAD', 'overdue');

                    break;

                case 2:
                    this.loadNotification('birthday', 'FIRST_LOAD', 'today');
                    this.loadNotification('birthday', 'FIRST_LOAD', 'coming');

                    break;
            }
        });

        const tabs = this.state.tabsOption;
        tabs[0].badgeCount = this.state.counter?.notification || this.state.counter?.notify || 0;
        tabs[1].badgeCount = this.state.counter.activity || 0;
        tabs[2].badgeCount = this.state.counter.birthday || 0;
        this.setState({
            tabsOption: tabs
        });

        if (!this.state.loaded) {
            switch (this.state.tabSelected) {
                case 1:
                    this.loadNotification('activity', 'FIRST_LOAD', 'coming');
                    this.loadNotification('activity', 'FIRST_LOAD', 'overdue');
                    break;

                case 2:
                    this.loadNotification('birthday', 'FIRST_LOAD', 'today');
                    this.loadNotification('birthday', 'FIRST_LOAD', 'coming');
                    break;

                default:
                    if (Global.checkVersionCRMExist('7.1.0.20220610.1200')) {
                        this.loadNotification('notify', 'FIRST_LOAD', 'update');
                        this.loadNotification('notify', 'FIRST_LOAD', 'checkin');
                    }
                    else {
                        this.loadNotification('notification', 'FIRST_LOAD');
                    }
            }
        }
    }

    componentWillUnmount() {
        this.backHandler && this.backHandler.remove();
        this.subscriberNewNotification && this.subscriberNewNotification.remove();
    }

    onTabChange() {
        if (this.state.tabChanged) {
            if (!this.state.tabsOption[this.state.tabSelected].isLoaded) {
                this.state.tabsOption[this.state.tabSelected].isLoaded = true;

                switch (this.state.tabSelected) {
                    case 0:
                        if (Global.checkVersionCRMExist('7.1.0.20220610.1200')) {
                            this.loadNotification('notify', 'FIRST_LOAD', 'update');
                            this.loadNotification('notify', 'FIRST_LOAD', 'checkin');
                        }
                        else {
                            this.loadNotification('notification', 'FIRST_LOAD');
                        }

                        break;

                    case 1:
                        this.loadNotification('activity', 'FIRST_LOAD', 'coming');
                        this.loadNotification('activity', 'FIRST_LOAD', 'overdue');

                        break;

                    case 2:
                        this.loadNotification('birthday', 'FIRST_LOAD', 'today');
                        this.loadNotification('birthday', 'FIRST_LOAD', 'coming');

                        break;
                }
            }
        }
    }

    /**
     * Modify by Manh Le
     * @date        : 2022-06-10
     * @function    : loadNotification
     * @purpose     : Addition for the new UI of tab Update
     * @description : @param type add new type "notify", @param subType add new types "update" and "checkin"
     * @version_crm : 7.1.0.20220610.1200 
    */
    loadNotification(type: 'notification' | 'activity' | 'birthday' | 'notify', loadType: 'FIRST_LOAD' | 'REFRESH' | 'LOAD_MORE', subType: '' | 'coming' | 'overdue' | 'today' | 'update' | 'checkin' = '') {
        this.resetLoading();

        if (loadType == 'REFRESH') {
            switch (type) {
                case 'activity':
                    this.setState({
                        refreshingTabTaskComing: subType == 'coming',
                        refreshingTabTaskExpired: subType == 'overdue'
                    });

                    break;

                case 'birthday':
                    this.setState({
                        refreshingTabBirthdayComing: subType == 'coming',
                        refreshingTabBirthdayToday: subType == 'today'
                    });
                    break;

                case 'notification':
                    this.setState({
                        refreshingTabUpdate: true
                    });
                    break;

                case 'notify':
                    this.setState({
                        refreshingTabUpdate: subType == 'update',
                        refreshingTabCheckIn: subType == 'checkin'
                    })
                    break;
            }
        }
        else if (loadType == 'LOAD_MORE') {
            switch (type) {
                case 'activity':
                    this.setState({
                        loadMoreTabTaskComing: subType == 'coming',
                        loadMoreTabTaskExpired: subType == 'overdue'
                    });

                    break;

                case 'birthday':
                    this.setState({
                        loadMoreTabBirthdayComing: subType == 'coming',
                        loadMoreTabBirthdayToday: subType == 'today'
                    });
                    break;

                case 'notification':
                    this.setState({
                        loadMoreTabUpdate: true
                    });
                    break;

                case 'notify':
                    this.setState({
                        loadMoreTabUpdate: subType == 'update',
                        loadMoreTabCheckIn: subType == 'checkin'
                    })
                    break;
            }
        }
        else {
            switch (type) {
                case 'activity':
                    this.setState({
                        loadingTabTaskComing: subType == 'coming',
                        loadingTabTaskExpired: subType == 'overdue'
                    });

                    break;

                case 'birthday':
                    this.setState({
                        loadingTabBirthdayComing: subType == 'coming',
                        loadingTabBirthdayToday: subType == 'today'
                    });
                    break;

                case 'notification':
                    this.setState({
                        loadingTabUpdate: true
                    });
                    break;

                case 'notify':
                    this.setState({
                        loadingTabUpdate: subType == 'update',
                        loadingTabCheckIn: subType == 'checkin'
                    })
                    break;
            }
        }

        var offset = 0;

        if (loadType == 'LOAD_MORE') {
            switch (type) {
                case 'activity':
                    if (subType == 'coming') {
                        if (this.state.pagingTabTaskComing?.next_offset) {
                            offset = this.state.pagingTabTaskComing?.next_offset || 0
                        }
                    }
                    else if (subType == 'overdue') {
                        if (this.state.pagingTabTaskExpired?.next_offset) {
                            offset = this.state.pagingTabTaskExpired?.next_offset || 0
                        }
                    }
                    break;

                case 'birthday':
                    if (subType == 'coming') {
                        if (this.state.pagingTabBirthdayComing?.next_offset) {
                            offset = this.state.pagingTabBirthdayComing?.next_offset || 0
                        }
                    }
                    else if (subType == 'today') {
                        if (this.state.pagingTabBirthdayToday?.next_offset) {
                            offset = this.state.pagingTabBirthdayToday?.next_offset || 0
                        }
                    }
                    break;

                case 'notification':
                    if (this.state.paging?.next_offset) {
                        offset = this.state.paging?.next_offset || 0
                    }
                    break;

                case 'notify':
                    if (subType == 'update') {
                        if (this.state.paging?.next_offset) {
                            offset = this.state.paging?.next_offset || 0
                        }
                    }
                    else if (subType == 'checkin') {
                        if (this.state.pagingCheckIn?.next_offset) {
                            offset = this.state.pagingCheckIn?.next_offset || 0
                        }
                    }
                    break;
            }
        }

        let params = {
            RequestAction: 'GetNotificationList',
            Params: {
                type: type,
                sub_type: subType,
                paging: {
                    offset: offset
                }
            }
        }

        console.log('Params request: ', params);

        Global.callAPI(null, params, (data) => {
            if (parseInt(data.success) !== 1) {
                Toast.show(getLabel('common.msg_no_results_found'));
                return;
            }

            let entryList = data.entry_list;
            let counter = data.counts;
            let counters = Global.counters;

            counters.notifications_count = counter;
            Global.setCounters(counters);
            this.state.counter = counter;
            this.state.prevCounter = counter
            this.setState({ counter: counter, prevCounter: counter });

            if (type == 'notification') {
                let notifications = this.state.notificationList;

                if (loadType == 'LOAD_MORE') {
                    notifications = notifications.concat(entryList);
                }
                else {
                    notifications = entryList;
                }

                this.setState({
                    paging: data?.paging || {},
                    notificationList: notifications,
                });
            }
            else if (type == 'notify' && subType == 'update') {
                let notifiesTemp = this.state.notifies;

                if (loadType == 'LOAD_MORE') {
                    notifiesTemp.updateList = notifiesTemp.updateList.concat(entryList);
                }
                else {
                    notifiesTemp.updateList = entryList;
                }

                this.setState({
                    paging: data?.paging || {},
                    notifies: notifiesTemp,
                });
            }
            else if (type == 'notify' && subType == 'checkin') {
                let notifiesTemp = this.state.notifies;
                let preCounter = this.state.prevCounter;

                if (loadType == 'LOAD_MORE') {
                    notifiesTemp.checkInList = notifiesTemp.checkInList.concat(entryList);
                }
                else {
                    notifiesTemp.checkInList = entryList;
                }

                preCounter.notify = counter?.notify || {};
                preCounter.notify_detail.checkin = counter.notify_detail?.checkin || '0';
                this.setState({
                    pagingCheckIn: data?.paging || {},
                    notifies: notifiesTemp,
                    counter: preCounter,
                    prevCounter: preCounter
                });
            }
            else if (type === 'activity' && subType === 'coming') {
                let notifyActivity = this.state.notificationActivity;

                if (loadType == 'LOAD_MORE') {
                    notifyActivity.comingList = notifyActivity.comingList.concat(entryList);
                }
                else {
                    notifyActivity.comingList = entryList;
                }

                this.setState({
                    pagingTabTaskComing: data?.paging || {},
                    notificationActivity: notifyActivity,
                });
            }
            else if (type === 'activity' && subType === 'overdue') {
                let notifyActivity = this.state.notificationActivity;

                if (loadType == 'LOAD_MORE') {
                    notifyActivity.overdueList = notifyActivity.overdueList.concat(entryList);
                }
                else {
                    notifyActivity.overdueList = entryList;
                }

                this.setState({
                    pagingTabTaskExpired: data?.paging || {},
                    notificationActivity: notifyActivity,
                });
            }
            else if (type === 'birthday' && subType === 'today') {
                let notifyBirthDay = this.state.notificationBirthDay;

                if (loadType == 'LOAD_MORE') {
                    notifyBirthDay.todayList = notifyBirthDay.todayList.concat(entryList);
                }
                else {
                    notifyBirthDay.todayList = entryList;
                }

                this.setState({
                    pagingTabBirthdayToday: data?.paging || {},
                    notificationBirthDay: notifyBirthDay,
                });
            }
            else {
                let notifyBirthDay = this.state.notificationBirthDay;

                if (loadType == 'LOAD_MORE') {
                    notifyBirthDay.comingList = notifyBirthDay.comingList.concat(entryList);
                }
                else {
                    notifyBirthDay.comingList = entryList;
                }

                this.setState({
                    pagingTabBirthdayComing: data?.paging || {},
                    notificationBirthDay: notifyBirthDay,
                });
            }

            Global.countNotification = counter.total;
            const tabs = [...this.state.tabsOption];
            if (type == 'notify') {
                tabs[0].badgeCount = counter?.notify || 0;
                tabs[0].isLoaded = true;
            }
            else if (type == 'notification') {
                tabs[0].badgeCount = counter.notification || 0;
                tabs[0].isLoaded = true;
            }
            tabs[1].badgeCount = counter.activity || 0;
            if (type == 'activity') {
                tabs[1].isLoaded = true;
            }
            tabs[2].badgeCount = counter.birthday || 0;
            if (type == 'birthday') {
                tabs[2].isLoaded = true;
            }

            this.setState({
                tabsOption: tabs,
                loaded: true
            });

            this.resetLoading();
        },
            (error) => {
                this.resetLoading();
                console.log('Error: ', error);
                Toast.show(getLabel('common.msg_connection_error'))
            });
    }

    resetLoading() {
        this.setState({
            loadingTabUpdate: false,
            loadingTabBirthdayComing: false,
            loadingTabBirthdayToday: false,
            loadingTabTaskComing: false,
            loadingTabTaskExpired: false,
            loadingTabCheckIn: false,// Manh le - [Notifications] Request #6439: modify UI and backend logic to separate important notifications end check-in notifications

            loadMoreTabUpdate: false,
            loadMoreTabBirthdayComing: false,
            loadMoreTabBirthdayToday: false,
            loadMoreTabTaskComing: false,
            loadMoreTabTaskExpired: false,
            loadMoreTabCheckIn: false,// Manh le - [Notifications] Request #6439: modify UI and backend logic to separate important notifications end check-in notifications

            refreshingTabUpdate: false,
            refreshingTabBirthdayComing: false,
            refreshingTabBirthdayToday: false,
            refreshingTabTaskComing: false,
            refreshingTabTaskExpired: false,
            refreshingTabCheckIn: false,// Manh le - [Notifications] Request #6439: modify UI and backend logic to separate important notifications end check-in notifications

            tabChanged: true
        });
    }

    /**
     * Modify by Manh Le
     * @date        : 2022-06-10
     * @function    : handleNotification
     * @purpose     : Handle action for the new UI of tab Update
     * @description : @param type add new type "checkin"
     * @version_crm : 7.1.0.20220610.1200
    */
    handleNotification(item: any, index: number, type: 'update' | 'expire' | 'upcoming' | 'birthday_today' | 'birthday_coming_soon' | 'checkin') {
        // Update status notification is read
        if (item?.data?.type === 'notification' && type != 'update' && type != 'checkin' && parseInt(item?.data?.read || '0') === 0) {
            let notifications = this.state.notificationList;
            notifications[index].data['read'] = 1;

            let tmpCounter = this.state.counter;
            tmpCounter.notification = (parseInt(tmpCounter.notification) - 1).toString();
            tmpCounter.total = (parseInt(tmpCounter.total || "1") - 1).toString();

            Global.counters.notifications_count = tmpCounter;

            let tabs = this.state.tabsOption;
            tabs[0].badgeCount = tmpCounter.notification || tmpCounter?.notify || 0;
            tabs[1].badgeCount = tmpCounter.activity || 0;
            tabs[2].badgeCount = tmpCounter.birthday || 0;

            this.setState({
                notificationList: notifications,
                tabsOption: tabs,
                counter: tmpCounter,
                prevCounter: tmpCounter
            }, () => {
                Global.setCounters(Global.counters);
            });

            // Handle notification when user clicked
            Global.handleNotification(item, 0, () => { });
        }
        /**
         * Add by Manh Le
         * @description : Code handle user press to item notification new logic
         * */
        if (item?.data?.type === 'notification' && (type == 'update' || type == 'checkin') && parseInt(item?.data?.read || '0') === 0) {

            let notifications = this.state.notifies;

            if (type == 'update') {
                notifications.updateList[index].data['read'] = '1';
            }
            else if (type == 'checkin') {
                notifications.checkInList[index].data['read'] = '1';
            }

            // -1 notification count
            let tmpCounter = this.state.counter;

            if (type == 'update') {
                tmpCounter.notify_detail.update = parseInt(tmpCounter?.notify_detail?.update || '1') - 1
            }
            else if (type == 'checkin') {
                tmpCounter.notify_detail.checkin = parseInt(tmpCounter?.notify_detail?.checkin || '1') - 1
            }

            tmpCounter.total = (parseInt(tmpCounter?.total || '1') - 1).toString();
            tmpCounter.notify = (parseInt(tmpCounter.notify || '1') - 1).toString();

            Global.counters.notifications_count = tmpCounter;
            Global.setCounters(Global.counters);

            let tabs = this.state.tabsOption;
            tabs[0].badgeCount = tmpCounter.notify || 0;
            tabs[1].badgeCount = tmpCounter.activity || 0;
            tabs[2].badgeCount = tmpCounter.birthday || 0;

            this.setState({
                tabsOption: tabs,
                counter: tmpCounter,
                prevCounter: tmpCounter,
                notifies: notifications
            });

            // Handle notification when user clicked
            Global.handleNotification(item, 0, undefined);
        }
        //End by Manh Le at 2022-06-10
        else {
            Global.handleNotification(item, parseInt(item?.data?.read || '0'), () => {
                if (item?.data?.read == '0') {
                    switch (type) {
                        case 'expire':
                            const notifyOverdueList = { ...this.state.notificationActivity };
                            notifyOverdueList.overdueList[index].data['read'] = 1;
                            this.setState({ notificationActivity: notifyOverdueList })
                            break;

                        case 'upcoming':
                            const notifyComingList = { ...this.state.notificationActivity };
                            notifyComingList.comingList[index].data['read'] = 1;
                            this.setState({ notificationActivity: notifyComingList })
                            break;

                        case 'birthday_today':
                            const notifyTodayListTemp = { ...this.state.notificationBirthDay };
                            notifyTodayListTemp.todayList[index].data['read'] = 1;
                            this.setState({ notificationBirthDay: notifyTodayListTemp })
                            break;

                        case 'birthday_coming_soon':
                            const notifyComingListTemp = { ...this.state.notificationBirthDay };
                            notifyComingListTemp.comingList[index].data['read'] = 1;
                            this.setState({ notificationBirthDay: notifyComingListTemp })
                            break;
                    }
                }
            });
        }

    }

    /**
     * @author          : Manh Le 
     * @date_change     : 2022-06-10
     * @function        : markNotificationsAsRead
     * @description     : Addition mark as read for check-in notification
     * @version_crm     : 7.1.0.20220610.1200
     * @param target    : includes: "id" is a id record notification,  
     *                       "all" will be mark as read all notification in the group update (old rule)
     *                      "update" will be mark as read all notification in the group Update,
     *                      "checkin" will be mark as read all notification check-in in the group Check-in
     * @param type     : includes update or checkin
     */
    markNotificationsAsRead(target: string, index: any, type?: 'update' | 'checkin') {
        var params = {
            RequestAction: 'MarkNotificationsAsRead',
            Params: {
                target: target
            }
        };

        this.setState({ loading: true });

        // Call api
        Global.callAPI(null, params, data => {
            this.setState({ loading: false });

            if (parseInt(data.success) === 1) {
                console.log('Update is read for notification', index);

                // Update counter notifications ==> new logic
                if (Global.checkVersionCRMExist('7.1.0.20220610.1200')) {
                    if (target == 'update') {
                        let notifiesTemp = this.state.notifies;

                        let list = [...notifiesTemp.updateList]?.map?.((noti) => {
                            noti.data['read'] = 1;
                            return noti;
                        }) || [];

                        notifiesTemp.updateList = list;

                        let tmpCounter = this.state.counter;
                        tmpCounter.notify = (parseInt(tmpCounter.notify || '0') - parseInt(tmpCounter.notify_detail?.update || '0')).toString();
                        tmpCounter.total = (parseInt(tmpCounter.total || '0') - parseInt(tmpCounter.notify_detail?.update || '0')).toString();
                        tmpCounter.notify_detail.update = '0'

                        let tabs = this.state.tabsOption;
                        tabs[0].badgeCount = tmpCounter.notify || 0;
                        tabs[1].badgeCount = tmpCounter.activity || 0;
                        tabs[2].badgeCount = tmpCounter.birthday || 0;

                        this.setState({
                            notifies: notifiesTemp,
                            tabsOption: tabs,
                            counter: tmpCounter,
                            prevCounter: tmpCounter
                        }, () => {
                            Global.counters.notifications_count = tmpCounter;
                            Global.setCounters(Global.counters);
                            this.loadNotification('notify', 'FIRST_LOAD', 'checkin');
                            Global.updateCounters();
                        });
                    }
                    else if (target == 'checkin') {
                        let notifiesTemp = this.state.notifies;

                        let list = [...notifiesTemp.checkInList]?.map?.((noti) => {
                            noti.data['read'] = 1;
                            return noti;
                        }) || [];

                        notifiesTemp.checkInList = list;

                        let tmpCounter = this.state.counter;
                        tmpCounter.notify = (parseInt(tmpCounter.notify || '0') - parseInt(tmpCounter.notify_detail?.checkin || '0')).toString();
                        tmpCounter.total = (parseInt(tmpCounter.total || '0') - parseInt(tmpCounter.notify_detail?.checkin || '0')).toString();
                        tmpCounter.notify_detail.checkin = '0'

                        let tabs = this.state.tabsOption;
                        tabs[0].badgeCount = tmpCounter.notify || 0;
                        tabs[1].badgeCount = tmpCounter.activity || 0;
                        tabs[2].badgeCount = tmpCounter.birthday || 0;

                        this.setState({
                            notifies: notifiesTemp,
                            tabsOption: tabs,
                            counter: tmpCounter,
                            prevCounter: tmpCounter
                        }, () => {
                            Global.counters.notifications_count = tmpCounter;
                            Global.setCounters(Global.counters);
                            this.loadNotification('notify', 'FIRST_LOAD', 'checkin');
                            Global.updateCounters();
                        });
                    }
                    else if (parseInt(index || 0) >= 0) {
                        if (type == 'update') {
                            let notifiesTemp = this.state.notifies;

                            notifiesTemp.updateList[index].data['read'] = 1;
                            notifiesTemp.updateList[index].data.extra_data.accepted = 1;

                            let tmpCounter = this.state.counter;
                            tmpCounter.notify = (parseInt(tmpCounter.notify || '0') - 1).toString();
                            tmpCounter.total = (parseInt(tmpCounter.total || '0') - 1).toString();
                            tmpCounter.notify_detail.update = (parseInt(tmpCounter.notify_detail?.update || '1') - 1).toString();

                            let tabs = this.state.tabsOption;
                            tabs[0].badgeCount = tmpCounter.notify || 0;
                            tabs[1].badgeCount = tmpCounter.activity || 0;
                            tabs[2].badgeCount = tmpCounter.birthday || 0;

                            this.setState({
                                notifies: notifiesTemp,
                                tabsOption: tabs,
                                counter: tmpCounter,
                                prevCounter: tmpCounter
                            }, () => {
                                Global.counters.notifications_count = tmpCounter;
                                Global.setCounters(Global.counters);
                                Global.updateCounters();
                            });
                        }
                        else if (type == 'checkin') {
                            let notifiesTemp = this.state.notifies;

                            notifiesTemp.checkInList[index].data['read'] = 1;

                            let tmpCounter = this.state.counter;
                            tmpCounter.notify = (parseInt(tmpCounter.notify || '0') - 1).toString();
                            tmpCounter.total = (parseInt(tmpCounter.total || '0') - 1).toString();
                            tmpCounter.notify_detail.checkin = (parseInt(tmpCounter.notify_detail?.checkin || '1') - 1).toString();

                            let tabs = this.state.tabsOption;
                            tabs[0].badgeCount = tmpCounter.notify || 0;
                            tabs[1].badgeCount = tmpCounter.activity || 0;
                            tabs[2].badgeCount = tmpCounter.birthday || 0;

                            this.setState({
                                notifies: notifiesTemp,
                                tabsOption: tabs,
                                counter: tmpCounter,
                                prevCounter: tmpCounter
                            }, () => {
                                Global.counters.notifications_count = tmpCounter;
                                Global.setCounters(Global.counters);
                                Global.updateCounters();
                            });
                        }
                    }
                }
                // Update counter notifications ==> old logic
                else {
                    if (target != 'all' && parseInt(index || 0) >= 0) {
                        const notiListTemp = [...this.state.notificationList];
                        notiListTemp[index].data['read'] = 1;
                        notiListTemp[index].data.extra_data.accepted = 1;

                        let tmpCounter = this.state.counter;
                        tmpCounter.total = (parseInt(tmpCounter?.total || '0') - 1).toString()
                        tmpCounter.notification = (parseInt(tmpCounter?.notification || '1') - 1).toString();

                        let tabs = this.state.tabsOption;
                        tabs[0].badgeCount = tmpCounter.notification || 0;
                        tabs[1].badgeCount = tmpCounter.activity || 0;
                        tabs[2].badgeCount = tmpCounter.birthday || 0;

                        this.setState({
                            tabsOption: tabs,
                            counter: tmpCounter,
                            prevCounter: tmpCounter,
                            notificationList: notiListTemp
                        }, () => {
                            Global.counters.notifications_count = tmpCounter;
                            Global.setCounters(Global.counters);
                            Global.updateCounters();
                        });
                    }
                    else {
                        const notiListTemp = [...this.state.notificationList].map((noti) => {
                            noti.data['read'] = 1;
                            return noti;
                        });

                        let tmpCounter = this.state.counter;
                        tmpCounter.total = (parseInt(tmpCounter?.total || '0') - parseInt(tmpCounter?.notification || '0')).toString()
                        tmpCounter.notification = '0';

                        let tabs = this.state.tabsOption;
                        tabs[0].badgeCount = tmpCounter.notification || 0;
                        tabs[1].badgeCount = tmpCounter.activity || 0;
                        tabs[2].badgeCount = tmpCounter.birthday || 0;

                        this.setState({
                            tabsOption: tabs,
                            counter: tmpCounter,
                            prevCounter: tmpCounter,
                            notificationList: notiListTemp
                        }, () => {
                            Global.counters.notifications_count = tmpCounter;
                            Global.setCounters(Global.counters);
                            this.loadNotification('notification', 'FIRST_LOAD');
                            Global.updateCounters();
                        });
                    }
                }

            }
            else {
                Toast.show(getLabel('common.msg_connection_error'));
            }
        },
            error => {
                this.setState({ loading: false });
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }
    // End by Manh Le at 2022-06-10

    acceptInvitation(notification: any, index: number) {

        var params = {
            RequestAction: 'AcceptInvitation',
            Data: {
                activity_id: notification?.related_record_id
            }
        };

        this.setState({ loading: true });

        // Call api
        Global.callAPI(null, params,
            data => {
                this.setState({ loading: false });

                if (parseInt(data.success) === 1) {

                    this.markNotificationsAsRead(notification.id, index, 'update');

                    setTimeout(() => {
                        if (Global.checkVersionCRMExist('7.1.0.20220610.1200')) {
                            this.loadNotification('notify', 'FIRST_LOAD', 'update');
                        }
                        else {
                            this.loadNotification('notification', 'FIRST_LOAD');
                        }

                    }, 1000);

                    Toast.show(getLabel('notification.msg_accept_successfully'));
                }
                else {

                    Toast.show(getLabel('notification.msg_accept_error'));
                }
            },
            error => {
                this.setState({ loading: false });
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    renderTabActivity() {
        const MAX_HEIGHT_OVERDUE = this.state.collapseOverdue ? (this.state.collapseUpcoming ? heightDevice * (.32) : heightDevice * 0.57) : 0;
        const MAX_HEIGHT_UPCOMING = this.state.collapseUpcoming ? (this.state.collapseOverdue ? heightDevice * (.32) : heightDevice * 0.57) : 0;

        return (

            <TabContent>
                <>
                    <CollapsibleList
                        buttonPosition='top'
                        buttonContent={
                            <View
                                style={styles.collapseButton}
                            >
                                <Row>
                                    <NBText
                                        allowFontScaling={true}
                                    >
                                        {getLabel('notification.label_overdue')}
                                    </NBText>

                                    <View
                                        style={styles.badgeView}
                                    >
                                        <SText
                                            allowFontScaling={true}
                                            color={Colors.white.white1}
                                        >
                                            {this.state.counter?.activity_detail?.overdue || '0'}
                                        </SText>
                                    </View>
                                </Row>

                                <View
                                    style={styles.btnShowHide}
                                >
                                    <Icon
                                        name={this.state.collapseOverdue ? 'angle-double-up' : 'angle-double-down'}
                                        style={styles.iconButtonShowHide}
                                    />

                                    <Text
                                        allowFontScaling={true}
                                        style={styles.txtButtonShowHide}
                                    >
                                        {this.state.collapseOverdue ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                    </Text>
                                </View>
                            </View>
                        }
                        onToggle={(collapsed) => {
                            this.setState({ collapseOverdue: collapsed });
                        }}
                        isShow={this.state.collapseOverdue}
                    >
                        <>
                            <LoadingList loading={this.state.loadingTabTaskExpired} />

                            <FlatList
                                shouldComponentUpdate
                                style={{
                                    maxHeight: MAX_HEIGHT_OVERDUE
                                }}
                                data={this.state.notificationActivity.overdueList}
                                disableVirtualization={false}
                                renderItem={({ item, index }) => {
                                    return (
                                        <ListItemNotification
                                            style={{
                                                minHeight: 72
                                            }}
                                            title={item.message}
                                            type={item.data?.related_module_name?.toString().toUpperCase()}
                                            subTitle={item.data?.created_time}
                                            unRead={parseInt(item?.data?.read || '0') != 1}
                                            onPress={() => this.handleNotification(item, index, 'expire')}
                                        />
                                    );
                                }}
                                keyExtractor={(item, idx) => idx.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshingTabTaskExpired}
                                        onRefresh={() => this.loadNotification('activity', 'REFRESH', 'overdue')}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => {
                                    if (this.state.pagingTabTaskExpired && this.state.pagingTabTaskExpired?.next_offset) {
                                        this.loadNotification('activity', 'LOAD_MORE', 'overdue')
                                    }
                                }}
                                ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabTaskExpired} />}
                            />
                        </>
                    </CollapsibleList>

                    <CollapsibleList
                        buttonPosition='top'
                        buttonContent={
                            <View style={styles.collapseButton}>
                                <Row>
                                    <NBText
                                        allowFontScaling={true}
                                    >
                                        {getLabel('notification.label_upcoming')}
                                    </NBText>

                                    <View
                                        style={styles.badgeView}
                                    >
                                        <SText
                                            allowFontScaling={true}
                                            color={Colors.white.white1}
                                        >
                                            {this.state.counter?.activity_detail?.coming || '0'}
                                        </SText>
                                    </View>
                                </Row>

                                <View
                                    style={styles.btnShowHide}
                                >
                                    <Icon
                                        name={this.state.collapseUpcoming ? 'angle-double-up' : 'angle-double-down'}
                                        style={styles.iconButtonShowHide}
                                    />
                                    <Text
                                        allowFontScaling={true}
                                        style={styles.txtButtonShowHide}
                                    >
                                        {this.state.collapseUpcoming ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                    </Text>
                                </View>
                                {/* <NText allowFontScaling={true}  color={Colors.functional.primary}>{collapseUpcoming ? getLabel('notification.btn_hide') : getLabel('notification.btn_show')}</NText> */}
                            </View>
                        }
                        onToggle={(collapsed) => {
                            this.setState({ collapseUpcoming: collapsed });
                        }}
                        isShow={this.state.collapseUpcoming}
                    >
                        <>
                            <LoadingList loading={this.state.loadingTabTaskComing} />
                            <FlatList
                                style={{ maxHeight: MAX_HEIGHT_UPCOMING }}
                                data={[...this.state.notificationActivity.comingList]}
                                renderItem={({ item, index }) => {
                                    return (
                                        <ListItemNotification
                                            style={{
                                                minHeight: 72
                                            }}
                                            title={item.message}
                                            type={item.data?.related_module_name?.toString().toUpperCase()}
                                            subTitle={item.data?.created_time}
                                            unRead={parseInt(item?.data?.read || '0') != 1}
                                            onPress={() => this.handleNotification(item, index, 'upcoming')}
                                        />
                                    );
                                }}
                                keyExtractor={(item, idx) => idx.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshingTabTaskComing}
                                        onRefresh={() => this.loadNotification('activity', 'REFRESH', 'coming')}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => {
                                    if (this.state.pagingTabTaskComing && this.state.pagingTabTaskComing?.next_offset) {
                                        this.loadNotification('activity', 'LOAD_MORE', 'coming')
                                    }
                                }}
                                ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabTaskComing} />}
                            />
                        </>
                    </CollapsibleList>
                </>
            </TabContent>
        )
    }

    renderTabBirthday() {
        const MAX_HEIGHT_BIRTHDAY_TODAY = this.state.collapseBirthDayToday ? (this.state.collapseBirthdayUpcoming ? heightDevice * (.32) : heightDevice * 0.57) : 0;
        const MAX_HEIGHT_BIRTHDAY_UPCOMING = this.state.collapseBirthdayUpcoming ? (this.state.collapseBirthDayToday ? heightDevice * (.32) : heightDevice * 0.57) : 0;

        return (
            <TabContent>
                <>
                    <CollapsibleList
                        buttonPosition='top'
                        buttonContent={
                            <View
                                style={styles.collapseButton}
                            >
                                <Row>
                                    <NBText
                                        allowFontScaling={true}
                                    >
                                        {getLabel('notification.label_birthday_today')}
                                    </NBText>

                                    <View
                                        style={styles.badgeView}
                                    >
                                        <SText
                                            allowFontScaling={true}
                                            color={Colors.white.white1}
                                        >
                                            {this.state.counter?.birthday_detail?.today || '0'}
                                        </SText>
                                    </View>
                                </Row>

                                <View
                                    style={styles.btnShowHide}
                                >
                                    <Icon
                                        name={this.state.collapseBirthDayToday ? 'angle-double-up' : 'angle-double-down'}
                                        style={styles.iconButtonShowHide}
                                    />
                                    <Text
                                        allowFontScaling={true}
                                        style={styles.txtButtonShowHide}
                                    >
                                        {this.state.collapseBirthDayToday ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                    </Text>
                                </View>
                            </View>
                        }
                        onToggle={(collapsed) => {
                            this.setState({ collapseBirthDayToday: collapsed });
                        }}
                        isShow={this.state.collapseBirthDayToday}
                    >
                        <FlatList
                            shouldComponentUpdate
                            style={{
                                maxHeight: MAX_HEIGHT_BIRTHDAY_TODAY
                            }}
                            data={[...this.state.notificationBirthDay.todayList]}
                            extraData={this}
                            disableVirtualization={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <ListItemNotification
                                        style={{
                                            minHeight: 72
                                        }}
                                        title={item?.message || ''}
                                        type={item.data?.related_module_name?.toString().toUpperCase()}
                                        subTitle={item.data?.created_time}
                                        unRead={parseInt(item?.data?.read || '0') != 1}
                                        onPress={() => this.handleNotification(item, index, 'birthday_today')}
                                    />
                                );
                            }}
                            keyExtractor={(item, idx) => idx.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshingTabBirthdayToday}
                                    onRefresh={() => this.loadNotification('birthday', 'REFRESH', 'today')}
                                    tintColor='#309ed8'
                                    colors={['#309ed8', '#25add0', '#15c2c5']}
                                    progressBackgroundColor='#fff'
                                />
                            }
                            onEndReachedThreshold={0.5}
                            onEndReached={() => {
                                if (this.state.pagingTabBirthdayToday && this.state.pagingTabBirthdayToday?.next_offset) {
                                    this.loadNotification('birthday', 'LOAD_MORE', 'today')
                                }
                            }}
                            ListHeaderComponent={<LoadingList loading={this.state.loadingTabBirthdayToday} />}
                            ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabBirthdayToday} />}
                        />

                    </CollapsibleList>

                    <CollapsibleList
                        buttonPosition='top'
                        buttonContent={
                            <View
                                style={styles.collapseButton}
                            >
                                <Row>
                                    <NBText
                                        allowFontScaling={true}
                                    >
                                        {getLabel('notification.label_birthday_coming')}
                                    </NBText>

                                    <View
                                        style={styles.badgeView}
                                    >
                                        <SText
                                            allowFontScaling={true}
                                            color={Colors.white.white1}
                                        >
                                            {this.state.counter?.birthday_detail?.coming || '0'}
                                        </SText>
                                    </View>
                                </Row>

                                <View
                                    style={styles.btnShowHide}
                                >
                                    <Icon
                                        name={this.state.collapseBirthdayUpcoming ? 'angle-double-up' : 'angle-double-down'}
                                        style={styles.iconButtonShowHide}
                                    />
                                    <Text
                                        allowFontScaling={true}
                                        style={styles.txtButtonShowHide}
                                    >
                                        {this.state.collapseBirthdayUpcoming ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                    </Text>
                                </View>
                                {/* <NText allowFontScaling={true}  color={Colors.functional.primary}>{collapseBirthdayUpcoming ? getLabel('notification.btn_hide') : getLabel('notification.btn_show')}</NText> */}
                            </View>
                        }
                        onToggle={(collapsed) => {
                            this.setState({ collapseBirthdayUpcoming: collapsed });
                        }}
                        isShow={this.state.collapseBirthdayUpcoming}
                    >
                        <FlatList
                            style={{
                                maxHeight: MAX_HEIGHT_BIRTHDAY_UPCOMING
                            }}
                            data={[...this.state.notificationBirthDay.comingList]}
                            extraData={this}
                            renderItem={({ item, index }) => {
                                return (
                                    <ListItemNotification
                                        style={{
                                            minHeight: 72
                                        }}
                                        title={item.message}
                                        type={item.data?.related_module_name?.toString().toUpperCase()}
                                        subTitle={item.data?.created_time}
                                        unRead={parseInt(item?.data?.read || '0') != 1}
                                        onPress={() => this.handleNotification(item, index, 'birthday_coming_soon')}
                                    />
                                );
                            }}
                            keyExtractor={(item, idx) => idx.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshingTabBirthdayComing}
                                    onRefresh={() => this.loadNotification('birthday', 'REFRESH', 'coming')}
                                    tintColor='#309ed8'
                                    colors={['#309ed8', '#25add0', '#15c2c5']}
                                    progressBackgroundColor='#fff'
                                />
                            }
                            onEndReachedThreshold={0.5}
                            onEndReached={() => {
                                if (this.state.pagingTabBirthdayComing && this.state.pagingTabBirthdayComing?.next_offset) {
                                    this.loadNotification('birthday', 'LOAD_MORE', 'coming')
                                }
                            }}
                            ListHeaderComponent={<LoadingList loading={this.state.loadingTabBirthdayComing} />}
                            ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabBirthdayComing} />}
                        />
                    </CollapsibleList>

                </>
            </TabContent>
        )
    }

    renderTabUpdate() {
        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) => (
                    <TabContent >
                        <ItemContentView style={{
                            maxHeight: 44,
                            justifyContent: 'flex-start',
                            paddingHorizontal: 12,
                            alignItems: 'center'
                        }}
                        >
                            <TouchableOpacity
                                style={{
                                    height: 44,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onPress={() => { this.markNotificationsAsRead('all', null) }}
                            >
                                <Icon
                                    name='envelope-open'
                                    style={{
                                        color: Colors.functional.primary,
                                        marginRight: 6
                                    }}
                                />
                                <SBText
                                    allowFontScaling={true}
                                    color={Colors.functional.primary}
                                >
                                    {getLabel('notification.btn_mark_all_read')}
                                </SBText>
                            </TouchableOpacity>
                        </ItemContentView>

                        <Content
                            scrollEnabled={false}
                        >
                            <LoadingList loading={this.state.loadingTabUpdate} />
                            <FlatList
                                shouldComponentUpdate
                                style={{
                                    height: heightDevice - 123 - 44 - insets.bottom - insets.top - 55
                                }}
                                data={this.state.notificationList}
                                disableVirtualization={false}
                                nestedScrollEnabled={true}
                                renderItem={({ item, index }) => {
                                    return (
                                        <ListItemNotification
                                            title={item.message}
                                            type={item.data?.related_module_name?.toString().toUpperCase()}
                                            subTitle={item.data?.created_time}
                                            unRead={parseInt(item?.data?.read || '0') != 1}
                                            onPress={() => this.handleNotification(item, index, undefined)}
                                            quickActionTitle={item.data?.extra_data?.action == 'invite' && item.data?.extra_data?.accepted == 0 ? getLabel('notification.btn_accept').toUpperCase() : ''}
                                            onQuickAction={() => this.acceptInvitation(item.data, index)}
                                        />
                                    );
                                }}
                                keyExtractor={(item, idx) => idx.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshingTabUpdate}
                                        onRefresh={() => this.loadNotification('notification', 'REFRESH')}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => {
                                    if (this.state.paging && this.state.paging?.next_offset) {
                                        this.loadNotification('notification', 'LOAD_MORE')
                                    }

                                }}
                                ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabUpdate} />}
                            />
                        </Content>
                    </TabContent>
                )}
            </SafeAreaInsetsContext.Consumer>
        )
    }

    /**
     * @author          : Manh Le 
     * @date_change     : 2022-06-10
     * @function        : renderTabUpdateNew
     * @description     : Build a new UI for the tab Update
     * @version_crm     : 7.1.0.20220610.1200
     */
    renderTabUpdateNewUI = () => {
        const MAX_HEIGHT_UPDATE = this.state.collapseUpdate ? (this.state.collapseCheckIn ? heightDevice * (.32) : heightDevice * 0.57) - 12 : 0;
        const MAX_HEIGHT_CHECK_IN = this.state.collapseCheckIn ? (this.state.collapseUpdate ? heightDevice * (.19) : heightDevice * 0.57 - 10) : 0;

        return (
            <SafeAreaInsetsContext.Consumer>
                {(insets) => (
                    <TabContent>
                        <>
                            <CollapsibleList
                                buttonPosition='top'
                                buttonContent={
                                    <View
                                        style={styles.collapseButton}
                                    >
                                        <Row>
                                            <NBText
                                                allowFontScaling={true}
                                            >
                                                {getLabel('notification.tab_updates')}
                                            </NBText>
                                            {
                                                parseInt(this.state.counter?.notify_detail?.update || '0') <= 0 ? null : (
                                                    <View
                                                        style={styles.badgeView}
                                                    >
                                                        <SText
                                                            allowFontScaling={true}
                                                            color={Colors.white.white1}
                                                        >
                                                            {this.state.counter?.notify_detail?.update || '0'}
                                                        </SText>
                                                    </View>
                                                )
                                            }
                                        </Row>

                                        <View
                                            style={styles.btnShowHide}
                                        >
                                            <Icon
                                                name={this.state.collapseUpdate ? 'angle-double-up' : 'angle-double-down'}
                                                style={styles.iconButtonShowHide}
                                            />
                                            <Text allowFontScaling={true} style={styles.txtButtonShowHide}>
                                                {this.state.collapseUpdate ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                            </Text>
                                        </View>
                                        {/* <NText allowFontScaling={true}  color={Colors.functional.primary}>{collapseOverdue ? getLabel('notification.btn_hide') : getLabel('notification.btn_show')}</NText> */}
                                    </View>
                                }
                                onToggle={(collapsed) => {
                                    this.setState({
                                        collapseUpdate: collapsed
                                    });
                                }}
                                isShow={this.state.collapseUpdate}
                            >
                                <>
                                    <LoadingList loading={this.state.loadingTabUpdate} />
                                    <View
                                        style={{
                                            minHeight: 44
                                        }}
                                    >
                                        <ItemContentView style={{
                                            height: 44,
                                            justifyContent: 'flex-start',
                                            paddingHorizontal: 12,
                                            alignItems: 'center'
                                        }}>
                                            <TouchableOpacity
                                                style={{
                                                    height: 44,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                onPress={() => { this.markNotificationsAsRead('update', null, 'update') }}
                                            >
                                                <Icon
                                                    name='envelope-open'
                                                    style={{
                                                        color: Colors.functional.primary,
                                                        marginRight: 6
                                                    }}
                                                />
                                                <SBText
                                                    allowFontScaling={true}
                                                    color={Colors.functional.primary}
                                                >
                                                    {getLabel('notification.btn_mark_all_read')}
                                                </SBText>
                                            </TouchableOpacity>
                                        </ItemContentView>
                                    </View>
                                    <FlatList
                                        shouldComponentUpdate
                                        style={{ maxHeight: MAX_HEIGHT_UPDATE }}
                                        data={this.state.notifies.updateList || []}
                                        disableVirtualization={false}
                                        renderItem={({ item, index }) => {
                                            return (
                                                <ListItemNotification
                                                    style={{ minHeight: 72 }}
                                                    title={item.message}
                                                    type={item.data?.related_module_name?.toString().toUpperCase()}
                                                    subTitle={item.data?.created_time}
                                                    unRead={parseInt(item?.data?.read || '0') != 1}
                                                    onPress={() => this.handleNotification(item, index, 'update')}
                                                    quickActionTitle={item.data?.extra_data?.action == 'invite' && item.data?.extra_data?.accepted == 0 ? getLabel('notification.btn_accept').toUpperCase() : ''}
                                                    onQuickAction={() => this.acceptInvitation(item.data, index)}
                                                />
                                            );
                                        }}
                                        keyExtractor={(item, idx) => idx.toString()}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={this.state.refreshingTabUpdate}
                                                onRefresh={() => this.loadNotification('notify', 'REFRESH', 'update')}
                                                tintColor='#309ed8'
                                                colors={['#309ed8', '#25add0', '#15c2c5']}
                                                progressBackgroundColor='#fff'
                                            />
                                        }
                                        onEndReachedThreshold={0.5}
                                        onEndReached={() => {
                                            if (this.state.paging && this.state.paging?.next_offset) {
                                                this.loadNotification('notify', 'LOAD_MORE', 'checkin')
                                            }
                                        }}
                                        ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabUpdate} />}
                                    />
                                </>
                            </CollapsibleList>

                            <CollapsibleList
                                buttonPosition='top'
                                buttonContent={
                                    <View style={styles.collapseButton}>
                                        <Row>
                                            <NBText
                                                allowFontScaling={true}
                                            >
                                                {getLabel('notification.tab_check_in')}
                                            </NBText>

                                            {
                                                parseInt(this.state.counter?.notify_detail?.checkin || '0') <= 0 ? null : (
                                                    <View
                                                        style={styles.badgeView}
                                                    >
                                                        <SText
                                                            allowFontScaling={true}
                                                            color={Colors.white.white1}
                                                        >
                                                            {this.state.counter?.notify_detail?.checkin || '0'}
                                                        </SText>
                                                    </View>
                                                )
                                            }

                                        </Row>
                                        <View
                                            style={styles.btnShowHide}
                                        >
                                            <Icon
                                                name={this.state.collapseCheckIn ? 'angle-double-up' : 'angle-double-down'}
                                                style={styles.iconButtonShowHide}
                                            />
                                            <Text
                                                allowFontScaling={true}
                                                style={styles.txtButtonShowHide}
                                            >
                                                {this.state.collapseCheckIn ? getLabel('calendar.btn_collapse') : getLabel('calendar.btn_expand')}
                                            </Text>
                                        </View>
                                    </View>
                                }
                                onToggle={(collapsed) => {
                                    this.setState({ collapseCheckIn: collapsed });
                                }}
                                isShow={this.state.collapseCheckIn}
                            >
                                <>

                                    <LoadingList loading={this.state.loadingTabCheckIn} />

                                    <View
                                        style={{
                                            minHeight: 44
                                        }}
                                    >
                                        <ItemContentView
                                            style={{
                                                height: 44,
                                                justifyContent: 'flex-start',
                                                paddingHorizontal: 12,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    height: 44,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                                onPress={() => { this.markNotificationsAsRead('checkin', null, 'checkin') }}
                                            >
                                                <Icon
                                                    name='envelope-open'
                                                    style={{
                                                        color: Colors.functional.primary,
                                                        marginRight: 6
                                                    }}
                                                />
                                                <SBText
                                                    allowFontScaling={true}
                                                    color={Colors.functional.primary}
                                                >
                                                    {getLabel('notification.btn_mark_all_read')}
                                                </SBText>
                                            </TouchableOpacity>
                                        </ItemContentView>
                                    </View>

                                    <FlatList
                                        style={{ maxHeight: MAX_HEIGHT_CHECK_IN }}
                                        data={[...this.state.notifies.checkInList]}
                                        renderItem={({ item, index }) => {
                                            return (
                                                <ListItemNotification
                                                    style={{
                                                        minHeight: 72
                                                    }}
                                                    title={item.message}
                                                    type={item.data?.related_module_name?.toString().toUpperCase()}
                                                    subTitle={item.data?.created_time}
                                                    unRead={parseInt(item?.data?.read || '0') != 1}
                                                    onPress={() => this.handleNotification(item, index, 'checkin')}
                                                />
                                            );
                                        }}
                                        keyExtractor={(item, idx) => idx.toString()}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={this.state.refreshingTabCheckIn}
                                                onRefresh={() => this.loadNotification('notify', 'REFRESH', 'checkin')}
                                                tintColor='#309ed8'
                                                colors={['#309ed8', '#25add0', '#15c2c5']}
                                                progressBackgroundColor='#fff'
                                            />
                                        }
                                        onEndReachedThreshold={0.5}
                                        onEndReached={() => {
                                            // if (this.state.pagingCheckIn && this.state.pagingCheckIn?.next_offset) {
                                            // 	this.loadNotification('notify', 'LOAD_MORE', 'checkin')
                                            // }
                                        }}
                                        ListFooterComponent={<LoadingMoreList loading={this.state.loadMoreTabCheckIn} />}
                                    />
                                </>
                            </CollapsibleList>
                        </>
                    </TabContent>
                )}
            </SafeAreaInsetsContext.Consumer>
        )
    }
    // End by Manh Le at 2022-06-10

    render() {
        return (
            <>
                <IndicatorLoading loading={this.state.loading} />

                <LargeHeader>
                    <Header noBorder>
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
                                onPress={() => this.navigation.openDrawer()}
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
                            <Title
                                allowFontScaling={true}
                            >
                                {getLabel('notification.title')}
                            </Title>
                        </Body>

                        <Right>
                            <TouchableHighlight
                                style={{
                                    marginRight: 4,
                                    borderRadius: 30,
                                    height: 40,
                                    width: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                activeOpacity={0.3}
                                underlayColor='#d0d0d0'
                                onPress={() => {
                                    this.navigation.navigate('NotificationSetting');
                                }}
                            >
                                <Icon
                                    name={getIcon('Setting')}
                                    style={{
                                        fontSize: 22
                                    }}
                                />
                            </TouchableHighlight>
                        </Right>
                    </Header>

                    <Box
                        justifyContent='center'
                        alignItems='center'
                        height={70}
                    >
                        <SegmentedControl
                            tabs={[...this.state.tabsOption]}
                            currentIndex={this.state.tabSelected}
                            onChange={(index) => {
                                this.setState({
                                    tabSelected: index
                                }, () => {
                                    this.onTabChange();
                                });
                            }}
                            paddingVertical={10}
                            activeTextColor={Colors.black.black1}
                            textColor={Colors.black.black2}
                            segmentedControlBackgroundColor={'#f0f0f0'}
                        />
                    </Box>
                </LargeHeader>

                {/*
					* Add by Manh Le
					* @date            : 2022-06-10
					* @purpose         : this line code will check if this is the latest CRM version or not? If it is the latest, it will render a new UI
					* @version_crm     : 7.1.0.20220610.1200
				* */ }
                {this.state.tabSelected === 0 && (Global.checkVersionCRMExist('7.1.0.20220610.1200') ? this.renderTabUpdateNewUI() : this.renderTabUpdate())}
                {/* //End by Manh Le at 2022-06-10 */}

                {this.state.tabSelected === 1 && this.renderTabActivity()}
                {this.state.tabSelected === 2 && this.renderTabBirthday()}
            </>
        );
    }

}

export default NotificationScreen;