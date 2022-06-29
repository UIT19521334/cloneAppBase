// Import libraries
import { Container, Content, Input, Label } from 'native-base'
import React, { useState, useEffect } from 'react'
import { StyleSheet, TouchableHighlight, Platform, BackHandler, Switch, Alert, TouchableOpacity, Image, DeviceEventEmitter, ActivityIndicator } from 'react-native'
import { Body, BooleanItem, BoxButton, ButtonIconView, Header, InputItem, Left, NText, Right, SpaceHM, SpaceHS, SpaceL, SpaceM, SpaceS, SText, Title } from '../../../components/CustomComponentView'
import Toast from 'react-native-root-toast';
import moment from 'moment-timezone';
// Import components
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { getLabel, OptionsDay, OptionsHour, OptionsMinute, widthResponse, OptionsRecurring, OptionsRecurringType, getIcon, getIconModule, ParentTypeList, getParentName, isIphoneX, heightDevice } from '../../../utils/commons/commons'
import { Box, Text } from '../../../themes/themes'
import RNDatePicker from '../../../components/RNDatePicker'
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import Global from '../../../Global';
import IndicatorLoading from '../../../components/IndicatorLoading'
import GooglePlaceAutoComplete from '../../../components/GooglePlaceAutoComplete';
import { PARAMS_ALERT } from '../../../utils/Models/models'
import { showAlert } from '../../../redux/actions/alert'
import { Keyboard } from 'react-native';
import { LineItemViewText } from '../../../components/ComponentView';
import TimePicker from '../../../components/RNTimePicker'

const InputItemTitle = ({ isEdit, isMultiline = false, selectTextOnFocus = true, numPrecision = Global.user?.no_of_currency_decimals, value, title, onValueChange, keyboardType, inputType = 'text', isSecure = false, placeholder, groupInputStyle, inputStyle, style, required = 0, autoFocus, error = false, success = false, isSubmitted = false, isWord = true, stacked = false }) => {

    const [paddingLabel, setPaddingLabel] = React.useState(isMultiline ? 6 : 0);
    const [isValid, setValid] = React.useState(true);
    let separator = Global.user?.currency_decimal_separator || '.';
    let delimiter = Global.user?.currency_grouping_separator || ',';
    let precision = numPrecision || 0

    const handleChangeCurrency = (text) => {
        let textWithoutPrefixAndSufix = text || '0';

        const isNegativeValue = textWithoutPrefixAndSufix.includes('-');

        const textNumericValue = textWithoutPrefixAndSufix.replace(/\D+/g, '');

        const numberValue = Number(textNumericValue) * (isNegativeValue ? -1 : 1);

        const zerosOnValue = textNumericValue.replace(/[^0]/g, '').length;
        let newValue: number | null;

        if (!textNumericValue || (!numberValue && zerosOnValue === precision)) {
            // Allow to clean the value instead of beign 0
            newValue = 0;
        } else {
            newValue = numberValue / 10 ** precision;
        }
        onValueChange && onValueChange(newValue);
    }

    const handleChangeNumber = (value: string) => {
        let regex = new RegExp('\\' + delimiter, 'g');
        let newValue = (value || '0').replace(regex, '');

        if (Global.validateOnlyNumber(newValue)) {
            onValueChange && onValueChange(parseFloat(newValue).toFixed(0));
        }
        else {
            return;
        }

    }

    return (
        <Box
            flex={1}
            paddingHorizontal='l'
            backgroundColor='white1'
            style={{
                paddingTop: 18
            }}
        >
            <Box
                borderBottomWidth={.6}
                borderBottomColor='black3'
            >
                <Label
                    style={{
                        fontSize: 14,
                        color: Colors.black.black2
                    }}
                >
                    {title || ''} <SText allowFontScaling={true} color={Colors.functional.dangerous}>{required == 1 ? '*' : ''}</SText>
                </Label>
                <Input
                    style={[{ color: Colors.black.black1 }, inputStyle]}
                    autoFocus={autoFocus || false}
                    showSoftInputOnFocus={true}
                    selectTextOnFocus={selectTextOnFocus}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    placeholderTextColor={'red'}
                    disabled={!isEdit}
                    defaultValue={value}
                    autoCapitalize={inputType != 'email' ? 'sentences' : 'none'}
                    secureTextEntry={isSecure}
                    multiline={isMultiline}
                    clearButtonMode='while-editing'
                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                    onChangeText={(textChange) => {
                        if (inputType == 'text') {
                            onValueChange?.(textChange);
                        }
                        else if (inputType == 'currency') {

                            handleChangeNumber(textChange)
                        }
                        else if (inputType == 'email') { // check type email is valid
                            if (Global.validateEmail(textChange)) {
                                setValid(true);
                                onValueChange?.(textChange);
                            }
                            else {
                                setValid(false);
                                onValueChange?.(textChange);
                            }
                        }
                        else {
                            onValueChange?.(textChange);
                        }
                    }}
                    onFocus={() => { setPaddingLabel(0) }}
                    onBlur={() => { isMultiline ? setPaddingLabel(6) : setPaddingLabel(0) }}
                />
            </Box>
        </Box>
    )
}

export default function ActivityForm({ navigation, route }) {
    const [optionsDay, setOptionsDay] = React.useState(OptionsDay());
    const [optionHour, setOptionHour] = React.useState(OptionsHour());
    const [optionMinute, setOptionMinute] = React.useState(OptionsMinute());
    const [ownerSelectedList, setOwnerSelectedList] = React.useState([
        {
            id: 'Users:' + Global.user?.id,
            name: Global.getUser(Global.user?.id)?.full_name,
            email: Global.getUser(Global.user?.id)?.email1,
            type: 'user'
        }
    ]);
    const [ownerOrder, setOwnerOrder] = React.useState([0]);
    const [userInvitees, setUserInvitees] = React.useState([]);
    const [userInviteOrder, setUserInviteOrder] = React.useState([]);
    const [contactInvitees, setContactInvitees] = React.useState([]);
    const [contactInviteOrder, setContactInviteOrder] = React.useState([]);
    const [showAllFields, setShowAllFields] = React.useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [activity, setActivity] = useState(
        route?.params?.activity
            ? route.params.activity
            : {}
    );
    const [addressTemp, setAddressTemp] = useState('');
    const [reminder, setReminder] = useState(false);
    const [daysReminder, setDaysReminder] = useState('1');
    const [hoursReminder, setHoursReminder] = useState('0');
    const [minutesReminder, setMinutesReminder] = useState('0');
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);
    const [dataCheckIn, setDataCheckIn] = useState(route?.params?.dataCheckIn || {});
    const [isShowCheckIn, setShowCheckIn] = useState(false);
    const disPatch = useDispatch();
    const [isLoadingGetAddress, setLoadingGetAddress] = useState(false);

    useEffect(() => {
        console.log('Data route: ', route.params);

        if (route?.params?.prevScene == 'RelatedList') {
            let fieldKeyValue = '';
            let fieldName = route?.params.fieldRelated?.replace('id', 'name');
            let fieldNameValue = '';
            switch (activity.parent_type) {
                case 'Accounts':
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'Contacts':
                    fieldKeyValue = route?.params?.data?.contactid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'Leads':
                    fieldKeyValue = route?.params?.data?.leadid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'Potentials':
                    fieldKeyValue = route?.params?.data?.potentialid;
                    fieldNameValue = route?.params?.data?.potentialname;
                    break;
                case 'HelpDesk':
                    fieldKeyValue = route?.params?.data?.ticketid;
                    fieldNameValue = route?.params?.data?.title;
                    break;

                default:
                    break;
            }

            switch (route?.params?.moduleRelated) {
                case 'Accounts':
                    fieldName = 'related_account_name'
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'Contacts':
                    fieldKeyValue = route?.params?.data?.contactid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'Leads':
                    fieldName = 'related_lead_name'
                    fieldKeyValue = route?.params?.data?.leadid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'Potentials':
                    fieldKeyValue = route?.params?.data?.potentialid;
                    fieldNameValue = route?.params?.data?.potentialname;
                    break;
                case 'HelpDesk':
                    fieldKeyValue = route?.params?.data?.ticketid;
                    fieldNameValue = route?.params?.data?.title;
                    break;

                default:
                    break;
            }

            let tmpActivity = { ...activity };
            tmpActivity[route?.params?.fieldRelated] = fieldKeyValue;
            tmpActivity[fieldName] = fieldNameValue;
            setActivity(tmpActivity);
        }
    }, [route.params])

    const handleSelected = (fieldRelated, data) => {
        let fieldKeyValue = '';
        let fieldName = fieldRelated?.replace('id', 'name');
        let fieldNameValue = '';
        switch (activity.parent_type) {
            case 'Accounts':
                fieldKeyValue = data?.accountid;
                fieldNameValue = data?.accountname;
                break;
            case 'Contacts':
                fieldKeyValue = data?.contactid;
                fieldNameValue = data?.fullname;
                break;
            case 'Leads':
                fieldKeyValue = data?.leadid;
                fieldNameValue = data?.fullname;
                break;
            case 'Potentials':
                fieldKeyValue = data?.potentialid;
                fieldNameValue = data?.potentialname;
                break;
            case 'HelpDesk':
                fieldKeyValue = data?.ticketid;
                fieldNameValue = data?.title;
                break;

            default:
                break;
        }

        let tmpActivity = { ...activity };
        tmpActivity[fieldRelated] = fieldKeyValue;
        tmpActivity[fieldName] = fieldNameValue;
        setActivity(tmpActivity);
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                goBack();
                return true;
            }
        );
        return () => {
            backHandler.remove();
        };
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            // The screen is focused
            // Call any action
            if (route?.params?.prevScene == 'TabCheckIn') {
                setShowAllFields(true);
                setShowCheckIn(true);
                setLoadingGetAddress(Global.isProcessingGetAddressCheckIn);

                let inforCheckIn = { ...(route?.params?.dataCheckIn || {}) }
                if (Global.dataCheckIn && Object.keys(Global.dataCheckIn).length > 0) {
                    inforCheckIn.checkin_address = Global.dataCheckIn?.checkin_address;
                    inforCheckIn.checkin_longitude = Global.dataCheckIn?.checkin_longitude;
                    inforCheckIn.checkin_latitude = Global.dataCheckIn?.checkin_latitude;
                }
                setDataCheckIn(inforCheckIn)
            }

            if (route?.params?.prevScene == 'CheckInCamera') {
                setShowAllFields(true);
                setShowCheckIn(true);
                setLoadingGetAddress(Global.isProcessingGetAddressCheckIn);

                let inforCheckIn = { ...(route?.params?.dataCheckIn || {}) }
                if (Global.dataCheckIn && Object.keys(dataCheckIn).length > 0) {
                    inforCheckIn.checkin_address = Global?.dataCheckIn?.checkin_address;
                    inforCheckIn.checkin_longitude = Global?.dataCheckIn?.checkin_longitude;
                    inforCheckIn.checkin_latitude = Global?.dataCheckIn?.checkin_latitude;
                }
                setDataCheckIn(inforCheckIn)
                setActivity(route?.params?.activity || {})
            }

            if (!loaded) {
                if ((route?.params?.prevScene == 'ActivityList' || route?.params?.prevScene == 'Calendar') && (activity?.activityid || activity?.id)) {
                    getDataRecord();
                }
                else {
                    setLoading(true);
                    Global.getModuleMetaData(activity?.activitytype != 'Task' ? 'Events' : 'Calendar', metaData => {
                        if (activity?.id) {
                            let selectedList = Global.formatAssignedOwnersArray(activity?.assigned_owners, activity?.main_owner_id);
                            setOwnerSelectedList(selectedList);
                            setOwnerOrder(Object.keys(selectedList));
                            setUserInvitees(activity?.users_invitees);
                            setUserInviteOrder(Object.keys(activity?.users_invitees));
                            setContactInvitees(activity?.contact_invitees);
                            setContactInviteOrder(Object.keys(activity?.contact_invitees));
                            activity.date_start = new Date(`${formatDate(activity.date_start)} ${activity.time_start}`);
                            activity.due_date = new Date(`${formatDate(activity.due_date)} ${activity.time_end}`);
                            activity.parent_type = activity.parent_type ? activity.parent_type : (Global.checkVersionCRMExist('7.1.0.20220215.0930') ? 'Potentials' : 'Accounts');
                            if (parseInt(activity?.reminder_time || 0) > 0) {
                                setReminder(true);
                                generateTimeReminder(activity.reminder_time);
                            }
                        }
                        else {
                            activity.date_start = activity.date_start ? activity.date_start : new Date();
                            activity.due_date = activity.due_date ? activity.due_date : new Date();
                            activity.time_start = Global.generateTime(Global.formatTime(new Date()));
                            let duration = Global.otherEventDuration || 5 * 60 * 1000;
                            if (activity.activitytype == 'Call') {
                                duration = Global.callDuration || 5 * 60 * 1000;
                            }

                            let endDate = new Date((new Date('01/01/2000 ' + activity.time_start)).getTime() + duration);
                            activity.time_end = Global.formatTime(endDate);
                            activity.parent_type = activity.parent_type ? activity.parent_type : (Global.checkVersionCRMExist('7.1.0.20220215.0930') ? 'Potentials' : 'Accounts');
                            if (activity.activitytype == 'Call' || activity.activitytype == 'Meeting') {
                                activity.eventstatus = activity.eventstatus ? activity.eventstatus : 'Planned';
                                activity.visibility = activity.visibility ? activity.visibility : 'Public';

                                if (activity.activitytype == 'Call') {
                                    activity.events_call_direction = activity.events_call_direction ? activity.events_call_direction : 'Inbound';
                                }
                            }
                            else {
                                activity.taskstatus = activity.taskstatus ? activity.taskstatus : 'Planned';
                            }
                        }

                        setMetaData(metaData);
                        setLoading(false);
                    },
                        error => {
                            Toast.show(getLabel('common.msg_connection_error'));
                        });
                }
                setLoaded(true)
            }

        });

        let subscriptionGetAddressCheckIn = DeviceEventEmitter.addListener('Feature.CheckIn', () => {

            setLoadingGetAddress(false);
            let inforCheckIn = { ...(dataCheckIn) }
            if (Global.dataCheckIn && Object.keys(dataCheckIn).length > 0) {
                inforCheckIn.checkin_address = Global?.dataCheckIn?.checkin_address;
                inforCheckIn.checkin_longitude = Global?.dataCheckIn?.checkin_longitude;
                inforCheckIn.checkin_latitude = Global?.dataCheckIn?.checkin_latitude;
            }
            setDataCheckIn(inforCheckIn)
        })

        const unsubscribeBlur = navigation.addListener('blur', () => {
            // Reset data when unmount screen 
            setLoading(false);
        });

        return () => {
            unsubscribeBlur();
            unsubscribe();
            subscriptionGetAddressCheckIn.remove()
        };
    }, [navigation, loaded])

    const goBack = () => {
        Keyboard.dismiss();
        const params: PARAMS_ALERT = {
            title: getLabel('common.title_confirm_leave_page'),
            message: getLabel('common.label_msg_leave_page'),
            actions: [
                {
                    isCancel: true,
                    label: getLabel('common.btn_stay')
                },
                {
                    isCancel: false,
                    label: getLabel('common.btn_leave'),
                    isHighLight: true,
                    onPress: () => {
                        if (route?.params?.prevScene == 'ActivityView') {
                            if (route?.params?.parentScene == 'Calendar') {
                                navigation.replace('ActivityView', { activity: route?.params?.activity, prevScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });

                            } else {
                                navigation.replace('ActivityView', { activity: route?.params?.activity, prevScene: 'ActivityForm' });

                            }
                            // navigation.replace('ActivityView', { activity: route?.params?.activity, prevScene: 'ActivityForm' })
                        }
                        else {
                            navigation.goBack()
                        }
                    }
                }
            ]
        }

        disPatch(showAlert?.(params));
    }

    // Set date time start/end
    const setDateTime = (type, dateStart, dateEnd, timeStart, timeEnd) => {
        if (!timeStart) {
            return '00:00'
        }

        let hours = time.split(':')[0];
        let min = time.split(':')[1];

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
    }

    const changeTime = (timeStart, timeEnd, duration) => {
        let dateStartMoment = (new Date('01/01/2020 ' + timeStart)).getTime();
        let dateEndMoment = (new Date('01/01/2020 ' + timeEnd)).getTime();
        let tmpActivity = { ...activity };

        if (dateStartMoment >= dateEndMoment) {
            tmpActivity.time_start = timeStart;
            tmpActivity.time_end = Global.formatTime(new Date(dateStartMoment + duration))
        }
        else {
            tmpActivity.time_start = timeStart;
            tmpActivity.time_end = timeEnd;
        }

        return tmpActivity;
    }

    const formatDate = (date) => {
        return moment(date).format('YYYY/MM/DD')
    }

    const onChangeDateTime = (type, dateStart, dateEnd, timeStart, timeEnd) => {
        let tmpActivity = { ...activity };
        let dateStartTemp = new Date(`${formatDate(dateStart)} ${timeStart}`);
        let dateEndTemp = new Date(`${formatDate(dateEnd)} ${timeEnd}`);
        let preDateStartMoment = (new Date(formatDate(activity.date_start) + ' ' + activity.time_start)).getTime();
        let preDateEndMoment = (new Date(formatDate(activity.due_date) + ' ' + activity.time_end)).getTime();
        let dateStartMoment = dateStartTemp.getTime();
        let dateEndMoment = dateEndTemp.getTime();
        let duration = preDateEndMoment - preDateStartMoment;
        switch (type) {
            case 'date_start':
                if (dateStartMoment > dateEndMoment) {
                    tmpActivity.date_start = dateStartTemp;
                    tmpActivity.due_date = new Date(dateStartMoment + duration)
                }
                else {
                    tmpActivity.date_start = dateStart;
                    tmpActivity.due_date = dateEnd;
                }
                break;
            case 'due_date':
                if (dateEndMoment < dateStartMoment) {
                    return;
                }
                else {
                    tmpActivity.date_start = dateStartTemp;
                    tmpActivity.due_date = dateEndTemp;
                }
                break;

            case 'time_start':
                let tmpEndDate = new Date(dateStartMoment + duration);
                tmpActivity.date_start = dateStartTemp;
                tmpActivity.time_start = timeStart;
                tmpActivity.due_date = tmpEndDate;
                tmpActivity.time_end = Global.formatTime(tmpEndDate);
                break;

            case 'time_end':
                if (dateStartMoment > dateEndMoment) {
                    return;
                }
                else {
                    tmpActivity.date_start = dateStartTemp;
                    tmpActivity.time_start = timeStart;
                    tmpActivity.due_date = dateEndTemp;
                    tmpActivity.time_end = timeEnd;
                }
                break;
            default:
                break;
        }

        setActivity(tmpActivity);
    }

    // Set value when change
    const onValueChange = (field, value) => {
        let tmpActivity = { ...activity };
        if (field == 'parent_type') {
            tmpActivity.parent_id = '';
            tmpActivity.parent_name = '';
        }
        tmpActivity[field] = value;
        setActivity(tmpActivity);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetActivity',
            Params: {
                id: activity?.activityid || activity?.id,
            }
        }

        // Call api
        Global.callAPI(null, params, data => {
            if (data.message == 'ACCESS_DENIED') {
                setLoading(false);
                setShowAlertPermissionRecord(true);
                return;
            }

            if (parseInt(data.success) === 1) {
                let selectedList = Global.formatAssignedOwnersArray(data.data?.assigned_owners, data.data?.main_owner_id);
                let tmpActivity = { ...data.data };
                tmpActivity.date_start = new Date(`${formatDate(data.data?.date_start)} ${data.data?.time_start}`);
                tmpActivity.due_date = new Date(`${formatDate(data.data?.due_date)} ${data.data?.time_end}`)
                tmpActivity.parent_type = tmpActivity.parent_type ? tmpActivity.parent_type : (Global.checkVersionCRMExist('7.1.0.20220215.0930') ? 'Potentials' : 'Accounts');
                setOwnerSelectedList(selectedList);
                setOwnerOrder(Object.keys(selectedList));
                setUserInvitees(data.data?.users_invitees);
                setUserInviteOrder(Object.keys(data.data?.users_invitees));
                setContactInvitees(data.data?.contact_invitees);
                setContactInviteOrder(Object.keys(data.data?.contact_invitees));
                setActivity(tmpActivity);
                // Set reminder time
                if (parseInt(data?.data?.reminder_time || 0) > 0) {
                    setReminder(true);
                    generateTimeReminder(data.data.reminder_time);
                }

                if (route?.params?.prevScene == 'Calendar') {
                    Global.getModuleMetaData(activity?.activitytype != 'Task' ? 'Events' : 'Calendar', metaData => {
                        setMetaData(metaData);
                        setLoading(false);
                    }, () => {
                        setLoading(false);
                    })
                }
                else {
                    setMetaData(data.metadata);
                    setLoading(false);
                }
            }
            else {
                setLoading(false);
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('activity.title') }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    // Create/Edit activity
    const saveActivity = async () => {
        Keyboard.dismiss();
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRejectRequired = activity?.activitytype == 'Meeting' ? ['duration_hours', 'events_call_direction'] : ['duration_hours'];
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, activity, fieldsRejectRequired, activity?.activitytype != 'Task' ? 'Events' : 'Calendar');
        if (fieldsRequireEmpty) {
            Alert.alert(
                getLabel('common.alert_field_invalid_title'),
                fieldsRequireEmpty,
                [
                    {
                        text: 'Ok',
                        onPress: () => setSubmitForm(true),
                        style: 'cancel'
                    },
                ]
            );

            return;
        }

        if (assignedOwners == '') {
            Toast.show(getLabel('common.msg_assigned_owner_empty'));
            return;
        }

        let tempAssignedOwners = [];
        ownerSelectedList.map((item) => {
            tempAssignedOwners.push(item.id?.split(':')[0]);
        })

        if (assignedOwners.split(':')[0] == 'Groups' && (tempAssignedOwners.indexOf('Users') != -1)) {
            Toast.show(getLabel('common.msg_assigned_main_owner_invalid'));
            return;
        }

        // Do request
        setLoading(true);

        var params = {
            RequestAction: 'SaveActivity',
            Data: {
                subject: activity?.subject,
                date_start: Global.formatDate(activity.date_start),
                due_date: Global.formatDate(activity.due_date),
                time_start: activity?.time_start,
                parent_id: activity?.parent_id,
                taskpriority: activity?.taskpriority,
                location: activity?.location,
                sendnotification: activity?.sendnotification,
                description: activity?.description,
                assigned_user_id: assignedOwners,
            }
        };

        if (reminder) {
            params.Data.reminder_time = calculateTime(daysReminder, hoursReminder, minutesReminder);
        }
        else {
            params.Data.reminder_time = 0;
        }

        if (activity && activity.id) {
            params.Data.id = activity.id;
        }

        if (route?.params?.isDuplicate) {
            params.Data.id = '';
        }

        if (activity.activitytype == 'Call' || activity.activitytype == 'Meeting') {
            params.Data.user_invitees = Global.formatUserInviteesString(userInvitees);
            params.Data.contact_invitees = Global.formatContactInviteesString(contactInvitees);
            params.Data.eventstatus = activity?.eventstatus;
            params.Data.time_end = activity?.time_end;
            params.Data.visibility = activity?.visibility;
            params.Data.activitytype = activity?.activitytype;

            if (activity.activitytype == 'Call') {
                params.Data.events_call_direction = activity?.events_call_direction;
                params.Data.missed_call = activity?.missed_call;
                params.Data.events_call_purpose = activity?.events_call_purpose;
                params.Data.events_call_result = activity?.events_call_result;
            }
        }
        else {
            params.Data.taskstatus = activity?.taskstatus;
            params.Data.activitytype = 'Task';
        }

        if (isShowCheckIn) {
            params.Data.latitude = dataCheckIn.checkin_latitude;
            params.Data.longitude = dataCheckIn.checkin_longitude;
            params.Data.address = dataCheckIn.checkin_address;
            params.IsMultiPartData = 1;
            params.CustomerPicture = { uri: dataCheckIn.checkin_customer_image, name: 'customer_picture.jpg', type: 'image/jpeg' };
            params.SalesmanPicture = { uri: dataCheckIn.checkin_salesman_image, name: 'sale_picture.jpg', type: 'image/jpeg' };
        }

        if (Global.checkVersionCRMExist('7.1.0.20220215.0930')) {
            params.Data.related_lead = activity?.related_lead;
            params.Data.contact_id = activity?.contact_id;
            params.Data.related_account = activity?.related_account;
        }

        console.log('Params request: ', params);

        // Call api
        Global.callAPI(null, params, data => {
            console.log('Data respone: ', data);

            setLoading(false);
            if (activity?.id && !route?.params?.isDuplicate) { // Edit
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('activity.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == 'ActivityView') {
                                    if (route?.params?.parentScene == 'Calendar') {
                                        navigation.replace('ActivityView', { activity: data, prevScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });

                                    } else {
                                        navigation.replace('ActivityView', { activity: data, prevScene: 'ActivityForm' });
                                    }
                                }
                                else {
                                    route?.params?.onReLoadData?.();
                                    navigation.goBack();
                                }
                            }
                        }
                    );

                    Global.updateCounters();
                }
                else {
                    Toast.show(getLabel('common.msg_edit_error', { module: getLabel('activity.title').toLowerCase() }));
                }
            }
            else { // Create new activity
                if (parseInt(data.success) === 1) {
                    if (isShowCheckIn) {
                        checkIn(data.id);
                    }
                    else {
                        Toast.show(
                            getLabel('common.msg_create_success', { module: getLabel('activity.title').toLowerCase() }),
                            {
                                duration: Toast.durations.SHORT,
                                delay: 0,
                                animation: false,
                                hideOnPress: true,
                                onHidden: () => {
                                    if (route?.params?.prevScene == 'ActivityView') {
                                        navigation.replace('ActivityView', { activity: data, prevScene: 'ActivityForm' });
                                    }
                                    else if (Global?.isOpenComingActivity) {
                                        navigation.goBack();
                                        setTimeout(() => {
                                            DeviceEventEmitter.emit('HomeScreen.ReloadActivity')
                                        }, 700)
                                    }
                                    else {
                                        route?.params?.onReLoadData?.();
                                        navigation.goBack();
                                    }
                                }
                            }
                        );

                        Global.updateCounters();
                    }

                }
                else {
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('activity.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const checkIn = (id) => {
        setLoading(true);

        var params = {
            RequestAction: 'Checkin',
            Data: {
                id: id,
                latitude: dataCheckIn.checkin_latitude,
                longitude: dataCheckIn.checkin_longitude,
                address: dataCheckIn.checkin_address
            },
            CustomerPicture: { uri: dataCheckIn.checkin_customer_image, name: 'customer_picture.jpg', type: 'image/jpeg' },
            SalesmanPicture: { uri: dataCheckIn.checkin_salesman_image, name: 'sale_picture.jpg', type: 'image/jpeg' },
            IsMultiPartData: 1
        };

        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('checkIn.msg_check_in_error'));
                return;
            }
            Toast.show(
                getLabel('common.msg_create_success', { module: getLabel('activity.title').toLowerCase() }),
                {
                    duration: Toast.durations.SHORT,
                    delay: 0,
                    animation: false,
                    hideOnPress: true,
                    onHidden: () => {
                        navigation.replace('ActivityView', { activity: data, prevScene: 'ActivityForm' });
                    }
                }
            );

            Global.updateCounters();
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
            });
    }

    const calculateTime = (days, hours, minutes) => {
        return parseInt(days) * 24 * 60 + parseInt(hours) * 60 + parseInt(minutes) + '';
    }

    const generateTimeReminder = (time) => {
        var days = parseInt(parseInt(time) / 1440) + '';
        var hours = parseInt((parseInt(time) % 1440) / 60) + '';
        var minutes = (parseInt(time) % 1440) % 60 + '';

        setDaysReminder(days);
        setHoursReminder(hours);
        setMinutesReminder(minutes);
    }

    const onClearRelated = (module?: 'Leads' | 'Contacts' | 'Accounts' | undefined) => {
        let tmpActivity = { ...activity };

        switch (module) {
            case 'Leads':
                tmpActivity.related_lead = '';
                tmpActivity.related_lead_name = '';
                break;

            case 'Contacts':
                tmpActivity.contact_id = '';
                tmpActivity.contact_name = '';
                break;

            case 'Accounts':
                tmpActivity.related_account = '';
                tmpActivity.related_account_name = '';
                break;

            default:
                tmpActivity.parent_id = '';
                tmpActivity.parent_name = '';
                break;
        }

        setActivity(tmpActivity);
    }

    const renderAllFieldEvent = () => {
        return (
            <>
                {/* Section information activity */}
                <>
                    <SpaceS />
                    <Box
                        backgroundColor='white1'
                        paddingVertical='m'
                        borderBottomWidth={0.25}
                        borderTopWidth={0.25}
                        borderBottomColor='black5'
                        borderTopColor='black5'
                    >
                        {/* Header section */}
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                            minHeight={36}
                            marginHorizontal='l'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                            alignItems='center'
                        >
                            <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_activity_information')}</Text>
                        </Box>
                        {/* Header section */}

                        {/* Body section */}
                        <>

                            {/* Subject Activity */}
                            <InputItemTitle
                                isEdit={true}
                                stacked={true}
                                title={metaData?.field_list?.subject?.label}
                                required={metaData?.field_list?.subject?.required}
                                inputStyle={{ fontSize: 14 }}
                                value={activity?.subject || ''}
                                onValueChange={(value) => onValueChange('subject', value)}
                                isSubmitted={isSubmitForm}
                            />
                            {/* <SpaceS />
                            <InputItem
                                isEdit={true}
                                stacked={true}
                                title={metaData?.field_list?.subject?.label}
                                required={metaData?.field_list?.subject?.required}
                                inputStyle={{ fontSize: 14 }}
                                value={activity?.subject || ''}
                                onValueChange={(value) => onValueChange('subject', value)}
                                isSubmitted={isSubmitForm}
                            /> */}

                            {/* Datetime start */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <RNDatePicker
                                    iconRight={getIcon('Calendar')}
                                    dateFormat={Global.user?.date_format?.toUpperCase()}
                                    title={metaData?.field_list?.date_start?.label}
                                    required={metaData?.field_list?.date_start?.required}
                                    currentDate={activity.date_start || new Date()}
                                    selectedDate={(value) => {
                                        onChangeDateTime('date_start', value, activity.due_date, activity.time_start, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />

                                <SpaceHS />

                                <TimePicker
                                    iconRight={getIcon('Time')}
                                    title={getLabel('activity.label_time_start')}
                                    required={metaData?.field_list?.time_start?.required}
                                    options={Global.getEnum('Calendar', 'time_start')}
                                    value={activity.time_start}
                                    onSelected={(value) => {
                                        onChangeDateTime('time_start', activity.date_start, activity.due_date, value.key, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />
                            </Box>

                            {/* Datetime end  */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <RNDatePicker
                                    iconRight={getIcon('Calendar')}
                                    dateFormat={Global.user?.date_format?.toUpperCase()}
                                    title={metaData?.field_list?.due_date?.label}
                                    required={metaData?.field_list?.due_date?.required}
                                    currentDate={activity.due_date || new Date()}
                                    selectedDate={(value) => {
                                        onChangeDateTime('due_date', activity.date_start, value, activity.time_start, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />

                                <SpaceHS />

                                <TimePicker
                                    iconRight={getIcon('Time')}
                                    title={getLabel('activity.label_time_end')}
                                    required={metaData?.field_list?.time_end?.required}
                                    options={Global.getEnum('Calendar', 'time_start')}
                                    value={activity.time_end}
                                    onSelected={(value) => {
                                        onChangeDateTime('time_end', activity.date_start, activity.due_date, activity.time_start, value.key)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />
                            </Box>

                            {/* Activity Type and activity Events */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >


                                <Box
                                    flex={1}
                                >
                                    <ModalSelect
                                        title={metaData?.field_list?.eventstatus?.label}
                                        required={metaData?.field_list?.eventstatus?.required}
                                        options={Global.getEnum('Events', 'eventstatus')}
                                        value={
                                            activity?.eventstatus ? {
                                                key: activity?.eventstatus,
                                                label: Global.getEnumLabel('Events', 'eventstatus', activity?.eventstatus)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('eventstatus', value.key)}
                                        isSubmitted={isSubmitForm}
                                        disabled={isShowCheckIn}
                                    />
                                </Box>
                                <SpaceHS />
                                <Box flex={1} />

                            </Box>

                            {/* Send Notification When Update */}
                            <Box
                                paddingHorizontal='l'
                            >
                                <Box
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <NText allowFontScaling={true} >
                                        {metaData?.field_list?.sendnotification?.label}
                                    </NText>
                                    <Switch
                                        trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                        thumbColor={Colors.white.white1}
                                        ios_backgroundColor="#767577"
                                        style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                        value={activity?.sendnotification == 1 ? true : false}
                                        onValueChange={(value) => onValueChange('sendnotification', value ? 1 : 0)}
                                    />
                                </Box>
                            </Box>

                            {/* Priority and sharing */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <Box
                                    flex={1}
                                >
                                    <ModalSelect
                                        title={metaData?.field_list?.activitytype?.label}
                                        required={metaData?.field_list?.activitytype?.required}
                                        options={Global.getEnum('Events', 'activitytype')}
                                        value={
                                            activity?.activitytype ? {
                                                key: activity?.activitytype,
                                                label: Global.getEnumLabel('Events', 'activitytype', activity?.activitytype)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('activitytype', value.key)}
                                        isSubmitted={isSubmitForm}
                                        disabled={isShowCheckIn}
                                    />
                                </Box>
                                <SpaceHS />
                                <Box
                                    flex={1}
                                >
                                    <ModalSelect
                                        title={metaData?.field_list?.taskpriority?.label}
                                        required={metaData?.field_list?.taskpriority?.required}
                                        options={Global.getEnum('Events', 'taskpriority')}
                                        value={
                                            activity?.taskpriority ? {
                                                key: activity?.taskpriority,
                                                label: Global.getEnumLabel('Events', 'taskpriority', activity?.taskpriority)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('taskpriority', value.key)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                            </Box>

                            {/* Related to */}
                            <SpaceS />
                            <Box
                                paddingHorizontal='l'
                                paddingVertical='m'
                            >
                                <Text allowFontScaling={true} color='black2'>
                                    {metaData?.field_list?.parent_id?.label}
                                </Text>
                                <Box
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                    borderBottomColor='black4'
                                    flexDirection='row'
                                    height={40}
                                    alignItems='center'
                                >
                                    <ModalSelect
                                        value={
                                            activity?.parent_type ? {
                                                key: activity?.parent_type,
                                                label: getParentName(activity?.parent_type)
                                            } : {}
                                        }
                                        maxWidth={70}
                                        options={ParentTypeList(Global.checkVersionCRMExist('7.1.0.20220215.0930'))}
                                        onSelected={(value) => onValueChange('parent_type', value.key)}
                                    />
                                    <Box flex={1} paddingHorizontal='m'>
                                        <Text allowFontScaling={true} numberOfLines={1}>
                                            {activity?.parent_name || ''}
                                        </Text>
                                    </Box>
                                    {
                                        activity.parent_id && activity.parent_id != 0 ? (
                                            <ButtonIconView onPress={() => { onClearRelated?.() }}>
                                                <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                            </ButtonIconView>
                                        ) : null
                                    }

                                    <BoxButton
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRadius={4}
                                        border={.7}
                                        style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                        onPress={() => {
                                            navigation.navigate('RelatedModal', { module: activity.parent_type, fieldRelated: 'parent_id', preScreen: 'ActivityForm' });
                                        }}
                                    >
                                        <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                    </BoxButton>
                                </Box>
                            </Box>


                            {/* Location */}
                            <GooglePlaceAutoComplete
                                title={metaData?.field_list?.location?.label}
                                required={metaData?.field_list?.location?.required}
                                value={activity?.location || ''}
                                onChangeText={(value) => {
                                    let tmpActivity = { ...activity };
                                    tmpActivity.location = value;
                                    setActivity(tmpActivity);
                                }}
                                selectedChange={(value) => {
                                    let tmpActivity = { ...activity };
                                    tmpActivity.location = value.address;
                                    setActivity(tmpActivity);
                                }}
                            />

                            {/* Assign Owner */}
                            <SpaceS />
                            <MultiplePickList
                                title={metaData?.field_list?.assigned_user_id?.label}
                                required={metaData?.field_list?.assigned_user_id?.required}
                                order={[...ownerOrder]}
                                updateOrder={(orders) => { setOwnerOrder(orders) }}
                                selectedList={[...ownerSelectedList]}
                                updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                                singleSelected={true}
                            />

                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <Box>
                                    <ModalSelect
                                        title={metaData?.field_list?.visibility?.label}
                                        required={metaData?.field_list?.visibility?.required}
                                        options={Global.getEnum('Events', 'visibility')}
                                        value={
                                            activity?.visibility ? {
                                                key: activity?.visibility,
                                                label: Global.getEnumLabel('Events', 'visibility', activity?.visibility)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('visibility', value.key)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                                <SpaceHS />
                                <Box flex={1} />
                            </Box>

                            <SpaceM />
                        </>
                        {/* Body section */}

                    </Box>

                </>
                {/* Section information activity */}

                {/* Section related to activity */}
                {
                    Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                        <>
                            <SpaceS />
                            <Box
                                backgroundColor='white1'
                                paddingVertical='m'
                                borderBottomWidth={0.25}
                                borderTopWidth={0.25}
                                borderBottomColor='black5'
                                borderTopColor='black5'
                            >
                                <Box
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    minHeight={36}
                                    marginHorizontal='l'
                                    borderBottomColor='black4'
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                    alignItems='center'
                                >
                                    <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.label_customer_related')}</Text>
                                </Box>

                                {/* Body section */}
                                <Box
                                    minHeight={100}
                                >
                                    {/* Lead */}
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('lead.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.related_lead_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.related_lead && activity.related_lead != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Leads') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Leads', fieldRelated: 'related_lead', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('contact.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.contact_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.contact_id && activity.contact_id != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Contacts') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Contacts', fieldRelated: 'contact_id', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('account.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.related_account_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.related_account && activity.related_account != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Accounts') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'related_account', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceM />
                                </Box>
                                {/* Body section */}
                            </Box>
                        </>
                    )
                        : null
                }
                {/* Section related to activity */}


                {/* Section description activity */}
                <SpaceS />
                <Box
                    backgroundColor='white1'
                    paddingVertical='m'
                    borderBottomWidth={0.25}
                    borderTopWidth={0.25}
                    borderBottomColor='black5'
                    borderTopColor='black5'
                >
                    <Box
                        flexDirection='row'
                        justifyContent='space-between'
                        minHeight={36}
                        marginHorizontal='l'
                        borderBottomColor='black4'
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        alignItems='center'
                    >
                        <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_description_information')}</Text>
                    </Box>

                    {/* Body section */}
                    <Box
                        minHeight={100}
                    >
                        {/* Description */}
                        <InputItem
                            isEdit={true}
                            title={metaData?.field_list?.description?.label}
                            required={metaData?.field_list?.description?.required}
                            isMultiline={true}
                            selectTextOnFocus={false}
                            groupInputStyle={{
                                borderBottomWidth: null
                            }}
                            inputStyle={{
                                borderWidth: 0.5,
                                maxHeight: heightDevice * .5,
                                marginTop: 10,
                                borderRadius: 6,
                                borderColor: Colors.black.black4,
                            }}
                            isSubmitted={isSubmitForm}
                            value={activity?.description || ''}
                            onValueChange={(value) => onValueChange('description', value)}
                        />

                        <SpaceM />
                    </Box>
                    {/* Body section */}
                </Box>
                {/* Section description activity */}

                {/* Section information check-in */}
                {
                    (activity?.activitytype == 'Meeting' && isShowCheckIn) ?
                        (
                            <>
                                <SpaceS />
                                <Box
                                    backgroundColor='white1'
                                    paddingVertical='m'
                                    borderBottomWidth={0.25}
                                    borderTopWidth={0.25}
                                    borderBottomColor='black5'
                                    borderTopColor='black5'
                                >
                                    {/* Header section */}
                                    <Box
                                        flexDirection='row'
                                        justifyContent='space-between'
                                        minHeight={36}
                                        marginHorizontal='l'
                                        borderBottomColor='black4'
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        alignItems='center'
                                    >
                                        <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_check_in_information')}</Text>
                                    </Box>
                                    {/* Header section */}

                                    {/* Body section */}
                                    <>
                                        <SpaceS />
                                        <LineItemViewText
                                            title={getLabel('activity.label_check_in_address')}
                                            titleStyle={{
                                                color: Colors.black.black2
                                            }}
                                            value={dataCheckIn?.checkin_address || ''}
                                            RenderRightButton={() => {
                                                if (!isLoadingGetAddress && dataCheckIn && dataCheckIn?.checkin_address) {
                                                    return null;
                                                }

                                                return (
                                                    <TouchableHighlight
                                                        underlayColor={Colors.white.white3}
                                                        activeOpacity={.7}
                                                        onPress={() => {
                                                            if (!isLoadingGetAddress) {
                                                                Global.getInformationLocationCheckIn(null);
                                                                setLoadingGetAddress(true);
                                                                setTimeout(() => {
                                                                    setLoadingGetAddress(false)
                                                                }, 10000)
                                                            }
                                                        }}
                                                        style={{
                                                            borderRadius: 30
                                                        }}
                                                    >
                                                        <Box
                                                            width={30}
                                                            height={30}
                                                            borderRadius={(30) / 2}
                                                            borderWidth={.6}
                                                            borderColor='white4'
                                                            justifyContent='center'
                                                            alignItems='center'
                                                        >
                                                            {
                                                                isLoadingGetAddress ? (
                                                                    <ActivityIndicator color={Colors.functional.primary} size={'small'} />
                                                                )
                                                                    : (
                                                                        <Icon name={getIcon('CheckIn')} size={16} color={Colors.functional.primary} />
                                                                    )
                                                            }
                                                        </Box>
                                                    </TouchableHighlight>
                                                )
                                            }}
                                        />
                                        <SpaceS />
                                        <LineItemViewText
                                            title={getLabel('activity.label_check_in_time')}
                                            value={Global.formatDateTime(new Date())}
                                        />
                                        <SpaceS />
                                        <Box paddingHorizontal='l' paddingVertical='m' flexDirection='row'>
                                            <Box flex={1} alignItems='center' paddingHorizontal='l' >
                                                <NText allowFontScaling={true} color={Colors.black.black3} style={{ textAlign: 'center' }}>
                                                    {getLabel('activity.label_check_in_salesman_image')}
                                                </NText>
                                            </Box>
                                            <Box flex={1} alignItems='center' paddingHorizontal='l' >
                                                <NText allowFontScaling={true} color={Colors.black.black3} style={{ textAlign: 'center' }}>
                                                    {getLabel('activity.label_check_in_customer_image')}
                                                </NText>
                                            </Box>
                                        </Box>
                                        <SpaceS />
                                        <Box paddingHorizontal='l' paddingVertical='m' flexDirection='row' style={{ paddingBottom: 30 }}>
                                            <Box flex={1} alignItems='center' >
                                                <Image
                                                    source={{ uri: dataCheckIn.checkin_salesman_image }}
                                                    style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.btnCamera}
                                                    onPress={() => navigation.replace('Camera', { cameraType: 'front', type: 'check_in', data: dataCheckIn, activity: activity, prevScene: 'ActivityForm', checkInForm: route?.params?.prevScene, title: getLabel('common.title_check_in') })}
                                                >
                                                    <Icon name={getIcon('Camera')} style={styles.camera} />
                                                </TouchableOpacity>
                                            </Box>
                                            <Box flex={1} alignItems='center' >
                                                <Image
                                                    source={{ uri: dataCheckIn.checkin_customer_image }}
                                                    style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.btnCamera}
                                                    onPress={() => navigation.replace('Camera', { cameraType: 'back', type: 'check_in', data: dataCheckIn, activity: activity, prevScene: 'ActivityForm', checkInForm: route?.params?.prevScene, title: getLabel('common.title_check_in') })}
                                                >
                                                    <Icon name={getIcon('Camera')} style={styles.camera} />
                                                </TouchableOpacity>
                                            </Box>
                                        </Box>

                                    </>
                                    {/* Body section */}
                                </Box>
                            </>
                        )
                        : null
                }


                {/* Section information call log */}
                {
                    activity?.activitytype == 'Call' && (
                        <>
                            <SpaceS />
                            <Box
                                backgroundColor='white1'
                                paddingVertical='m'
                                borderBottomWidth={0.25}
                                borderTopWidth={0.25}
                                borderBottomColor='black5'
                                borderTopColor='black5'
                            >
                                {/* Header section */}
                                <Box
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    minHeight={36}
                                    marginHorizontal='l'
                                    borderBottomColor='black4'
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                    alignItems='center'
                                >
                                    <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_call_information')}</Text>
                                </Box>
                                {/* Header section */}

                                {/* Body section */}
                                <>
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        alignSelf='flex-start'
                                    >
                                        <ModalSelect
                                            title={metaData?.field_list?.events_call_direction?.label}
                                            required={metaData?.field_list?.events_call_direction?.required}
                                            options={Global.getEnum('Events', 'events_call_direction')}
                                            value={
                                                activity?.events_call_direction ? {
                                                    key: activity?.events_call_direction,
                                                    label: Global.getEnumLabel('Events', 'events_call_direction', activity?.events_call_direction)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('events_call_direction', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                    >
                                        {/* Reminder with email */}
                                        <Box
                                            flexDirection='row'
                                            alignItems='center'
                                            justifyContent='space-between'
                                        >
                                            <NText allowFontScaling={true} >
                                                {metaData?.field_list?.missed_call?.label}
                                            </NText>
                                            <Switch
                                                trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                                thumbColor={Colors.white.white1}
                                                ios_backgroundColor="#767577"
                                                style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                                value={activity?.missed_call == 1 ? true : false}
                                                onValueChange={(value) => onValueChange('missed_call', value ? 1 : 0)}
                                            />
                                        </Box>
                                    </Box>
                                    <SpaceS />
                                    <Box
                                        flexDirection='row'
                                        paddingHorizontal='l'
                                    >
                                        <Box
                                            flex={1}
                                        >
                                            <ModalSelect
                                                title={metaData?.field_list?.events_call_purpose?.label}
                                                required={metaData?.field_list?.events_call_purpose?.required}
                                                options={Global.getEnum('Events', 'events_call_purpose')}
                                                value={
                                                    activity?.events_call_purpose ? {
                                                        key: activity?.events_call_purpose,
                                                        label: Global.getEnumLabel('Events', 'events_call_purpose', activity?.events_call_purpose)
                                                    } : {}
                                                }
                                                onSelected={(value) => onValueChange('events_call_purpose', value.key)}
                                                isSubmitted={isSubmitForm}
                                            />
                                        </Box>
                                        <SpaceHS />
                                        <Box
                                            flex={1}
                                        >
                                            <ModalSelect
                                                title={metaData?.field_list?.events_call_result?.label}
                                                required={metaData?.field_list?.events_call_result?.required}
                                                options={Global.getEnum('Events', 'events_call_result')}
                                                value={
                                                    activity?.events_call_result ? {
                                                        key: activity?.events_call_result,
                                                        label: Global.getEnumLabel('Events', 'events_call_result', activity?.events_call_result)
                                                    } : {}
                                                }
                                                onSelected={(value) => onValueChange('events_call_result', value.key)}
                                                isSubmitted={isSubmitForm}
                                            />
                                        </Box>
                                    </Box>
                                    <SpaceS />
                                </>
                            </Box>
                        </>
                    )
                }

                {/* Section reminder activity */}
                <>
                    <SpaceS />
                    <Box
                        backgroundColor='white1'
                        paddingVertical='m'
                        borderBottomWidth={0.25}
                        borderTopWidth={0.25}
                        borderBottomColor='black5'
                        borderTopColor='black5'
                    >
                        {/* Header section */}
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                            minHeight={36}
                            marginHorizontal='l'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                            alignItems='center'
                        >
                            <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_remind_information')}</Text>
                        </Box>
                        {/* Header section */}

                        {/* Body section */}
                        <>
                            <SpaceS />
                            <Box
                                paddingHorizontal='l'
                            >
                                {/* Reminder with email */}
                                <Box
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <NText allowFontScaling={true} >
                                        {metaData?.field_list?.reminder_time?.label}
                                    </NText>
                                    <Switch
                                        trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                        thumbColor={Colors.white.white1}
                                        ios_backgroundColor="#767577"
                                        style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                        value={reminder}
                                        onValueChange={(value) => setReminder(value)}
                                    />
                                </Box>
                            </Box>
                            <SpaceS />

                            {
                                reminder && (
                                    <>
                                        <Box
                                            flexDirection='row'
                                            justifyContent='space-between'
                                            paddingHorizontal='l'
                                            alignItems='center'
                                        >
                                            <ModalSelect
                                                options={optionsDay}
                                                value={{
                                                    key: daysReminder,
                                                    label: daysReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setDaysReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_days')}</Text>

                                            <ModalSelect
                                                options={optionHour}
                                                value={{
                                                    key: hoursReminder,
                                                    label: hoursReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setHoursReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_hours')}</Text>

                                            <ModalSelect
                                                options={optionMinute}
                                                value={{
                                                    key: minutesReminder,
                                                    label: minutesReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setMinutesReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_minutes')}</Text>

                                        </Box>
                                        <SpaceS />
                                    </>
                                )
                            }
                        </>
                        {/* Body section */}
                    </Box>
                </>
                {/* Section reminder activity */}

                {/* Section recurrence activity */}
                {/* <>
                    <SpaceS />
                    <Box
                        backgroundColor='white1'
                        paddingVertical='m'
                        borderBottomWidth={0.25}
                        borderTopWidth={0.25}
                        borderBottomColor='black5'
                        borderTopColor='black5'
                    >
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                            minHeight={36}
                            marginHorizontal='l'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                            alignItems='center'
                        >
                            <Text  allowFontScaling={true}  variant='headerSection' >{getLabel('activity.title_recurrence_information')}</Text>
                        </Box>
                        <>
                            <Box
                                paddingHorizontal='l'
                            >
                                <BooleanItem
                                    title='Lặp lại'
                                    selected={false}
                                />
                            </Box>

                            <SpaceS />

                            <Box
                                flexDirection='row'
                                paddingHorizontal='l'
                                alignItems='center'
                            >
                                <Text  allowFontScaling={true} >Một lần vào mỗi</Text>
                                <SpaceHS />
                                <ModalSelect
                                    options={OptionsRecurring()}
                                    value={OptionsRecurring()[0]}
                                    itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                />
                                <SpaceHS />
                                <ModalSelect
                                    options={OptionsRecurringType()}
                                    value={OptionsRecurringType()[0]}
                                    itemStyle={{ minWidth: 90, alignItems: 'center', paddingLeft: 0 }}
                                    keyShow={'label'}
                                />

                            </Box>

                            <SpaceS />
                            <Box
                                flexDirection='row'
                                paddingHorizontal='l'
                                alignItems='center'
                            >
                                <RNDatePicker
                                    iconRight={'calendar'}
                                    title='Cho đến khi'
                                />

                            </Box>

                            <SpaceS />
                        </>
                    </Box>
                </> */}
                {/* Section recurrence activity */}



                {/* Section invite activity */}
                <SpaceS />
                <Box
                    backgroundColor='white1'
                    paddingVertical='m'
                    borderBottomWidth={0.25}
                    borderTopWidth={0.25}
                    borderBottomColor='black5'
                    borderTopColor='black5'
                >
                    <Box
                        flexDirection='row'
                        justifyContent='space-between'
                        minHeight={36}
                        marginHorizontal='l'
                        borderBottomColor='black4'
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        alignItems='center'
                    >
                        <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_invitee_information')}</Text>
                    </Box>

                    <SpaceM />
                    <MultiplePickList
                        title={metaData?.field_list?.contact_id?.label}
                        required={metaData?.field_list?.contact_id?.required}
                        order={[...contactInviteOrder]}
                        updateOrder={(orders) => { setContactInviteOrder(orders) }}
                        selectedList={[...contactInvitees]}
                        updateSelectedList={(list) => { setContactInvitees(list) }}
                        type='invite_contact'
                    />

                    <SpaceM />
                    <MultiplePickList
                        title={metaData?.field_list?.user_invitees?.label}
                        required={metaData?.field_list?.user_invitees?.required}
                        order={[...userInviteOrder]}
                        updateOrder={(orders) => { setUserInviteOrder(orders) }}
                        selectedList={[...userInvitees]}
                        updateSelectedList={(list) => { setUserInvitees(list) }}
                        type='invite_user'
                    />
                </Box>
                {/* Section invite activity */}
            </>
        )
    }

    const renderQuickCreateEvent = () => {
        return (
            <Box
                backgroundColor='white1'
            >
                <InputItemTitle
                    isEdit={true}
                    title={metaData?.field_list?.subject?.label}
                    required={metaData?.field_list?.subject?.required}
                    inputStyle={{ fontSize: 14 }}
                    stacked
                    value={activity?.subject || ''}
                    onValueChange={(value) => onValueChange('subject', value)}
                    isSubmitted={isSubmitForm}
                />

                <Box
                    flexDirection='row'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <RNDatePicker
                        iconRight={getIcon('Calendar')}
                        dateFormat={Global.user?.date_format?.toUpperCase()}
                        title={metaData?.field_list?.date_start?.label}
                        required={metaData?.field_list?.date_start?.required}
                        currentDate={activity.date_start || new Date()}
                        selectedDate={(value) => {
                            onChangeDateTime('date_start', value, activity.due_date, activity.time_start, activity.time_end)
                        }}
                        isSubmitted={isSubmitForm}
                    />

                    <SpaceHS />

                    <TimePicker
                        iconRight={getIcon('Time')}
                        title={getLabel('activity.label_time_start')}
                        required={metaData?.field_list?.time_start?.required}
                        options={Global.getEnum('Calendar', 'time_start')}
                        value={activity.time_start}
                        onSelected={(value) => {
                            onChangeDateTime('time_start', activity.date_start, activity.due_date, value.key, activity.time_end)
                        }}
                        isSubmitted={isSubmitForm}
                    />
                </Box>

                <Box
                    flexDirection='row'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <RNDatePicker
                        iconRight={getIcon('Calendar')}
                        dateFormat={Global.user?.date_format?.toUpperCase()}
                        title={metaData?.field_list?.due_date?.label}
                        required={metaData?.field_list?.due_date?.required}
                        currentDate={activity.due_date || new Date()}
                        selectedDate={(value) => {
                            onChangeDateTime('due_date', activity.date_start, value, activity.time_start, activity.time_end)
                        }}
                        isSubmitted={isSubmitForm}
                    />

                    <SpaceHS />

                    <TimePicker
                        iconRight={getIcon('Time')}
                        title={getLabel('activity.label_time_end')}
                        required={metaData?.field_list?.time_end?.required}
                        options={Global.getEnum('Calendar', 'time_start')}
                        value={activity.time_end}
                        onSelected={(value) => {
                            onChangeDateTime('time_end', activity.date_start, activity.due_date, activity.time_start, value.key)
                        }}
                        isSubmitted={isSubmitForm}
                    />
                </Box>

                {/* Location */}
                <GooglePlaceAutoComplete
                    title={metaData?.field_list?.location?.label}
                    required={metaData?.field_list?.location?.required}
                    value={activity?.location || ''}
                    onChangeText={(value) => {
                        let tmpActivity = { ...activity };
                        tmpActivity.location = value;
                        setActivity(tmpActivity);
                    }}
                    selectedChange={(value) => {
                        let tmpActivity = { ...activity };
                        tmpActivity.location = value.address;
                        setActivity(tmpActivity);
                    }}
                />

                <InputItem
                    isEdit={true}
                    title={metaData?.field_list?.description?.label}
                    required={metaData?.field_list?.description?.required}
                    placeholder={metaData?.field_list?.description?.label}
                    isMultiline={true}
                    groupInputStyle={{
                        borderBottomWidth: null
                    }}
                    selectTextOnFocus={false}
                    inputStyle={{
                        borderBottomWidth: 1,
                        maxHeight: heightDevice * .5,
                        marginTop: 10,
                        borderRadius: 6,
                        borderColor: Colors.black.black4,
                    }}
                    isSubmitted={isSubmitForm}
                    value={activity?.description || ''}
                    onValueChange={(value) => onValueChange('description', value)}
                />
                <SpaceS />

                {/* <Box
                    flexDirection='row'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <Box
                        flex={1}
                    >
                        <ModalSelect
                            title={metaData?.field_list?.activitytype?.label}
                            required={metaData?.field_list?.activitytype?.required}
                            options={Global.getEnum('Events', 'activitytype')}
                            value={
                                activity?.activitytype ? {
                                    key: activity?.activitytype,
                                    label: Global.getEnumLabel('Events', 'activitytype', activity?.activitytype)
                                } : {}
                            }
                            onSelected={(value) => onValueChange('activitytype', value.key)}
                            isSubmitted={isSubmitForm}
                        />
                    </Box>
                    <SpaceHS />
                    <Box
                        flex={1}
                    >
                        <ModalSelect
                            title={metaData?.field_list?.eventstatus?.label}
                            required={metaData?.field_list?.eventstatus?.required}
                            options={Global.getEnum('Events', 'eventstatus')}
                            value={
                                activity?.eventstatus ? {
                                    key: activity?.eventstatus,
                                    label: Global.getEnumLabel('Events', 'eventstatus', activity?.eventstatus)
                                } : {}
                            }
                            onSelected={(value) => onValueChange('eventstatus', value.key)}
                            isSubmitted={isSubmitForm}
                        />
                    </Box>
                </Box> */}

                {/* Priority and sharing */}
                {
                    activity?.activitytype == 'Call' ? (
                        <Box
                            flexDirection='row'
                            paddingVertical='l'
                            paddingHorizontal='l'
                        >
                            {/* <Box
                                flex={1}
                            >
                                <ModalSelect
                                    title={metaData?.field_list?.visibility?.label}
                                    required={metaData?.field_list?.visibility?.required}
                                    options={Global.getEnum('Events', 'visibility')}
                                    value={
                                        activity?.visibility ? {
                                            key: activity?.visibility,
                                            label: Global.getEnumLabel('Events', 'visibility', activity?.visibility)
                                        } : {}
                                    }
                                    onSelected={(value) => onValueChange('visibility', value.key)}
                                    isSubmitted={isSubmitForm}
                                />
                            </Box>
                            <SpaceHS /> */}
                            <Box
                                flex={1}
                            >
                                <ModalSelect
                                    title={metaData?.field_list?.events_call_direction?.label}
                                    required={metaData?.field_list?.events_call_direction?.required}
                                    options={Global.getEnum('Events', 'events_call_direction')}
                                    value={
                                        activity?.events_call_direction ? {
                                            key: activity?.events_call_direction,
                                            label: Global.getEnumLabel('Events', 'events_call_direction', activity?.events_call_direction)
                                        } : {}
                                    }
                                    onSelected={(value) => onValueChange('events_call_direction', value.key)}
                                    isSubmitted={isSubmitForm}
                                />
                            </Box>
                            <Box flex={1} />
                        </Box>

                    ) : null
                    // : (
                    //     <Box
                    //         alignSelf='flex-start'
                    //         paddingVertical='l'
                    //         paddingHorizontal='l'
                    //     >
                    //         <ModalSelect
                    //             title={metaData?.field_list?.visibility?.label}
                    //             required={metaData?.field_list?.visibility?.required}
                    //             options={Global.getEnum('Events', 'visibility')}
                    //             value={
                    //                 activity?.visibility ? {
                    //                     key: activity?.visibility,
                    //                     label: Global.getEnumLabel('Events', 'visibility', activity?.visibility)
                    //                 } : {}
                    //             }
                    //             onSelected={(value) => onValueChange('visibility', value.key)}
                    //             isSubmitted={isSubmitForm}
                    //         />
                    //     </Box>
                    // )
                }
                {/* Related to */}
                <SpaceS />
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Text allowFontScaling={true} color='black2'>
                        {metaData?.field_list?.parent_id?.label}
                    </Text>
                    <Box
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        borderBottomColor='black4'
                        flexDirection='row'
                        height={40}
                        alignItems='center'
                    >
                        <ModalSelect
                            value={
                                activity?.parent_type ? {
                                    key: activity?.parent_type,
                                    label: getParentName(activity?.parent_type)
                                } : {}
                            }
                            maxWidth={70}
                            options={ParentTypeList(Global.checkVersionCRMExist('7.1.0.20220215.0930'))}
                            onSelected={(value) => onValueChange('parent_type', value.key)}
                        />
                        <Box flex={1} paddingHorizontal='m'>
                            <Text allowFontScaling={true} numberOfLines={1}>
                                {activity?.parent_name || ''}
                            </Text>
                        </Box>
                        {
                            activity.parent_id && activity.parent_id != 0 ? (
                                <ButtonIconView onPress={() => { onClearRelated?.() }}>
                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                </ButtonIconView>
                            ) : null
                        }
                        <BoxButton
                            alignItems='center'
                            justifyContent='center'
                            borderRadius={4}
                            border={.7}
                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                            onPress={() => {
                                navigation.navigate('RelatedModal', { module: activity.parent_type, fieldRelated: 'parent_id', preScreen: 'ActivityForm' });
                            }}
                        >
                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                        </BoxButton>
                    </Box>

                </Box>

                {/* Section related to activity */}
                {
                    Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                        <>
                            <SpaceS />
                            {/* Body section */}
                            <Box
                                minHeight={100}
                            >
                                {/* Lead */}
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('lead.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.related_lead_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.related_lead && activity.related_lead != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Leads') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Leads', fieldRelated: 'related_lead', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('contact.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.contact_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.contact_id && activity.contact_id != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Contacts') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Contacts', fieldRelated: 'contact_id', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('account.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.related_account_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.related_account && activity.related_account != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Accounts') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'related_account', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceM />
                            </Box>
                            {/* Body section */}
                        </>
                    )
                        : null
                }
                {/* Section related to activity */}

                <SpaceS />
                <MultiplePickList
                    title={metaData?.field_list?.assigned_user_id?.label}
                    required={metaData?.field_list?.assigned_user_id?.required}
                    order={[...ownerOrder]}
                    updateOrder={(orders) => { setOwnerOrder(orders) }}
                    selectedList={[...ownerSelectedList]}
                    updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                    singleSelected={true}
                />
                <SpaceM />
                <MultiplePickList
                    title={metaData?.field_list?.user_invitees?.label}
                    required={metaData?.field_list?.user_invitees?.required}
                    order={[...userInviteOrder]}
                    updateOrder={(orders) => { setUserInviteOrder(orders) }}
                    selectedList={[...userInvitees]}
                    updateSelectedList={(list) => { setUserInvitees(list) }}
                    type='invite_user'
                />
                <SpaceM />
                <Box paddingHorizontal='l' >
                    <BoxButton row alignItems={'center'} paddingVertical={10} onPress={() => {
                        setShowAllFields(true)
                    }}>
                        <NText allowFontScaling={true} color={Colors.functional.primary}>
                            {getLabel('common.btn_show_all_fields')}
                        </NText>
                        <SpaceHS />
                        <Icon name={getIcon('ShowMore')} color={Colors.functional.primary} style={{ fontSize: 16 }} />
                    </BoxButton>
                </Box>
                <SpaceL />
            </Box>
        )
    }

    const renderAllFieldTask = () => {
        return (
            <>
                {/* Section information activity */}
                <>
                    <SpaceS />
                    <Box
                        backgroundColor='white1'
                        paddingVertical='m'
                        borderBottomWidth={0.25}
                        borderTopWidth={0.25}
                        borderBottomColor='black5'
                        borderTopColor='black5'
                    >
                        {/* Header section */}
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                            minHeight={36}
                            marginHorizontal='l'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                            alignItems='center'
                        >
                            <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_activity_information')}</Text>
                        </Box>
                        {/* Header section */}

                        {/* Body section */}
                        <>

                            {/* Subject Activity */}
                            {/* <SpaceS /> */}
                            <InputItemTitle
                                isEdit={true}
                                title={metaData?.field_list?.subject?.label}
                                required={metaData?.field_list?.subject?.required}
                                inputStyle={{ fontSize: 14 }}
                                stacked
                                value={activity?.subject || ''}
                                onValueChange={(value) => onValueChange('subject', value)}
                                isSubmitted={isSubmitForm}
                            />

                            {/* Datetime start */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <RNDatePicker
                                    iconRight={getIcon('Calendar')}
                                    dateFormat={Global.user?.date_format?.toUpperCase()}
                                    title={metaData?.field_list?.date_start?.label}
                                    required={metaData?.field_list?.date_start?.required}
                                    currentDate={activity.date_start || new Date()}
                                    selectedDate={(value) => {
                                        onChangeDateTime('date_start', value, activity.due_date, activity.time_start, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />

                                <SpaceHS />

                                <TimePicker
                                    iconRight={getIcon('Time')}
                                    title={getLabel('activity.label_time_start')}
                                    required={metaData?.field_list?.time_start?.required}
                                    options={Global.getEnum('Calendar', 'time_start')}
                                    value={activity.time_start}
                                    onSelected={(value) => {
                                        onChangeDateTime('time_start', activity.date_start, activity.due_date, value.key, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />
                            </Box>

                            {/* Datetime end  */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <RNDatePicker
                                    iconRight={getIcon('Calendar')}
                                    dateFormat={Global.user?.date_format?.toUpperCase()}
                                    title={metaData?.field_list?.due_date?.label}
                                    required={metaData?.field_list?.due_date?.required}
                                    currentDate={activity.due_date || new Date()}
                                    selectedDate={(value) => {
                                        onChangeDateTime('due_date', activity.due_date, value, activity.time_start, activity.time_end)
                                    }}
                                    isSubmitted={isSubmitForm}
                                />

                                <SpaceHS />
                                <Box flex={1} />
                            </Box>

                            {/* Activity Type and activity Events */}
                            <Box
                                flexDirection='row'
                                paddingVertical='l'
                                paddingHorizontal='l'
                            >
                                <Box
                                    flex={1}
                                >
                                    <ModalSelect
                                        title={metaData?.field_list?.taskstatus?.label}
                                        required={metaData?.field_list?.taskstatus?.required}
                                        options={Global.getEnum('Calendar', 'taskstatus')}
                                        value={
                                            activity?.taskstatus ? {
                                                key: activity?.taskstatus,
                                                label: Global.getEnumLabel('Calendar', 'taskstatus', activity?.taskstatus)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('taskstatus', value.key)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                                <SpaceHS />
                                <Box
                                    flex={1}
                                >
                                    <ModalSelect
                                        title={metaData?.field_list?.taskpriority?.label}
                                        required={metaData?.field_list?.taskpriority?.required}
                                        options={Global.getEnum('Calendar', 'taskpriority')}
                                        value={
                                            activity?.taskpriority ? {
                                                key: activity?.taskpriority,
                                                label: Global.getEnumLabel('Calendar', 'taskpriority', activity?.taskpriority)
                                            } : {}
                                        }
                                        onSelected={(value) => onValueChange('taskpriority', value.key)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                            </Box>


                            <SpaceS />
                            {/* Send Notification When Update */}
                            <Box
                                paddingHorizontal='l'
                            >
                                <Box
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <NText allowFontScaling={true} >
                                        {metaData?.field_list?.sendnotification?.label}
                                    </NText>
                                    <Switch
                                        trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                        thumbColor={Colors.white.white1}
                                        ios_backgroundColor="#767577"
                                        style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                        value={activity?.sendnotification == 1 ? true : false}
                                        onValueChange={(value) => onValueChange('sendnotification', value ? 1 : 0)}
                                    />
                                </Box>
                            </Box>

                            {/* Related to */}
                            <SpaceS />
                            <Box
                                paddingHorizontal='l'
                                paddingVertical='m'
                            >
                                <Text allowFontScaling={true} color='black2'>
                                    {metaData?.field_list?.parent_id?.label}
                                </Text>
                                <Box
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                    borderBottomColor='black4'
                                    flexDirection='row'
                                    height={40}
                                    alignItems='center'
                                >
                                    <ModalSelect
                                        value={
                                            activity?.parent_type ? {
                                                key: activity?.parent_type,
                                                label: getParentName(activity?.parent_type)
                                            } : {}
                                        }
                                        maxWidth={70}
                                        options={ParentTypeList(Global.checkVersionCRMExist('7.1.0.20220215.0930'))}
                                        onSelected={(value) => onValueChange('parent_type', value.key)}
                                    />
                                    <Box flex={1} paddingHorizontal='m'>
                                        <Text allowFontScaling={true} numberOfLines={1}>
                                            {activity?.parent_name || ''}
                                        </Text>
                                    </Box>
                                    {
                                        activity.parent_id && activity.parent_id != 0 ? (
                                            <ButtonIconView onPress={() => { onClearRelated?.() }}>
                                                <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                            </ButtonIconView>
                                        ) : null
                                    }
                                    <BoxButton
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRadius={4}
                                        border={.7}
                                        style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                        onPress={() => {
                                            navigation.navigate('RelatedModal', { module: activity.parent_type, fieldRelated: 'parent_id', preScreen: 'ActivityForm' });
                                        }}
                                    >
                                        <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                    </BoxButton>
                                </Box>

                            </Box>


                            {/* Location */}
                            <GooglePlaceAutoComplete
                                title={metaData?.field_list?.location?.label}
                                required={metaData?.field_list?.location?.required}
                                value={activity?.location || ''}
                                onChangeText={(value) => {
                                    let tmpActivity = { ...activity };
                                    tmpActivity.location = value;
                                    setActivity(tmpActivity);
                                }}
                                selectedChange={(value) => {
                                    let tmpActivity = { ...activity };
                                    tmpActivity.location = value.address;
                                    setActivity(tmpActivity);
                                }}
                            />

                            {/* Assign Owner */}
                            <SpaceS />
                            <MultiplePickList
                                title={metaData?.field_list?.assigned_user_id?.label}
                                required={metaData?.field_list?.assigned_user_id?.required}
                                order={[...ownerOrder]}
                                updateOrder={(orders) => { setOwnerOrder(orders) }}
                                selectedList={[...ownerSelectedList]}
                                updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                            />
                            <SpaceM />
                        </>
                        {/* Body section */}

                    </Box>

                </>
                {/* Section information activity */}

                {/* Section related to activity */}
                {
                    Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                        <>
                            <SpaceS />
                            <Box
                                backgroundColor='white1'
                                paddingVertical='m'
                                borderBottomWidth={0.25}
                                borderTopWidth={0.25}
                                borderBottomColor='black5'
                                borderTopColor='black5'
                            >
                                <Box
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    minHeight={36}
                                    marginHorizontal='l'
                                    borderBottomColor='black4'
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                    alignItems='center'
                                >
                                    <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.label_customer_related')}</Text>
                                </Box>

                                {/* Body section */}
                                <Box
                                    minHeight={100}
                                >
                                    {/* Lead */}
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('lead.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.related_lead_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.related_lead && activity.related_lead != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Leads') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Leads', fieldRelated: 'related_lead', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('contact.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.contact_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.contact_id && activity.contact_id != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Contacts') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Contacts', fieldRelated: 'contact_id', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <Text allowFontScaling={true} color='black2'>
                                            {getLabel('account.title')}
                                        </Text>
                                        <Box
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                            borderBottomColor='black4'
                                            flexDirection='row'
                                            height={40}
                                            alignItems='center'
                                        >
                                            <Box flex={1} paddingHorizontal='m'>
                                                <Text allowFontScaling={true} numberOfLines={1}>
                                                    {activity?.related_account_name?.trim() || ''}
                                                </Text>
                                            </Box>
                                            {
                                                activity.related_account && activity.related_account != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('Accounts') }}>
                                                        <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                    </ButtonIconView>
                                                ) : null
                                            }

                                            <BoxButton
                                                alignItems='center'
                                                justifyContent='center'
                                                borderRadius={4}
                                                border={.7}
                                                style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                onPress={() => {
                                                    navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'related_account', preScreen: 'ActivityForm' });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>
                                    </Box>

                                    <SpaceM />
                                </Box>
                                {/* Body section */}
                            </Box>
                        </>
                    )
                        : null
                }
                {/* Section related to activity */}

                {/* Section reminder activity */}
                <>
                    <SpaceS />
                    <Box
                        backgroundColor='white1'
                        paddingVertical='m'
                        borderBottomWidth={0.25}
                        borderTopWidth={0.25}
                        borderBottomColor='black5'
                        borderTopColor='black5'
                    >
                        {/* Header section */}
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                            minHeight={36}
                            marginHorizontal='l'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                            alignItems='center'
                        >
                            <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_remind_information')}</Text>
                        </Box>
                        {/* Header section */}

                        {/* Body section */}
                        <>
                            <SpaceS />
                            <Box
                                paddingHorizontal='l'
                            >
                                {/* Reminder with email */}
                                <Box
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <NText allowFontScaling={true} >
                                        {metaData?.field_list?.reminder_time?.label}
                                    </NText>
                                    <Switch
                                        trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                        thumbColor={Colors.white.white1}
                                        ios_backgroundColor="#767577"
                                        style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                        value={reminder}
                                        onValueChange={(value) => setReminder(value)}
                                    />
                                </Box>
                            </Box>
                            <SpaceS />

                            {
                                reminder && (
                                    <>
                                        <Box
                                            flexDirection='row'
                                            justifyContent='space-between'
                                            paddingHorizontal='l'
                                            alignItems='center'
                                        >
                                            <ModalSelect
                                                options={optionsDay}
                                                value={{
                                                    key: daysReminder,
                                                    label: daysReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setDaysReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_days')}</Text>

                                            <ModalSelect
                                                options={optionHour}
                                                value={{
                                                    key: hoursReminder,
                                                    label: hoursReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setHoursReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_hours')}</Text>

                                            <ModalSelect
                                                options={optionMinute}
                                                value={{
                                                    key: minutesReminder,
                                                    label: minutesReminder
                                                }}
                                                itemStyle={{ minWidth: 55, alignItems: 'center', paddingLeft: 0 }}
                                                onSelected={(value) => setMinutesReminder(value.key)}
                                            />
                                            <Text allowFontScaling={true} >{getLabel('calendar.label_minutes')}</Text>

                                        </Box>
                                        <SpaceS />
                                    </>
                                )
                            }
                        </>
                        {/* Body section */}
                    </Box>
                </>
                {/* Section reminder activity */}

                {/* Section description activity */}
                <SpaceS />
                <Box
                    backgroundColor='white1'
                    paddingVertical='m'
                    borderBottomWidth={0.25}
                    borderTopWidth={0.25}
                    borderBottomColor='black5'
                    borderTopColor='black5'
                >
                    <Box
                        flexDirection='row'
                        justifyContent='space-between'
                        minHeight={36}
                        marginHorizontal='l'
                        borderBottomColor='black4'
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        alignItems='center'
                    >
                        <Text allowFontScaling={true} variant='headerSection' >{getLabel('activity.title_description_information')}</Text>
                    </Box>

                    {/* Body section */}
                    <>
                        <Box
                        >
                            {/* Description */}
                            <InputItem
                                isEdit={true}
                                title={metaData?.field_list?.description?.label}
                                required={metaData?.field_list?.description?.required}
                                isMultiline={true}
                                groupInputStyle={{
                                    borderBottomWidth: null
                                }}
                                selectTextOnFocus={false}
                                inputStyle={{
                                    borderWidth: 0.5,
                                    maxHeight: heightDevice * .5,
                                    marginTop: 10,
                                    borderRadius: 6,
                                    borderColor: Colors.black.black4,
                                }}
                                isSubmitted={isSubmitForm}
                                value={activity?.description || ''}
                                onValueChange={(value) => onValueChange('description', value)}
                            />

                            <SpaceM />
                        </Box>
                    </>
                    {/* Body section */}
                </Box>
                {/* Section description activity */}
            </>
        )
    }

    const renderQuickCreateTask = () => {
        return (
            <Box
                backgroundColor='white1'
            >
                {/* <SpaceS /> */}
                <InputItemTitle
                    isEdit={true}
                    title={metaData?.field_list?.subject?.label}
                    required={metaData?.field_list?.subject?.required}
                    inputStyle={{ fontSize: 14 }}
                    stacked
                    value={activity?.subject || ''}
                    onValueChange={(value) => onValueChange('subject', value)}
                    isSubmitted={isSubmitForm}
                />

                <Box
                    flexDirection='row'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <RNDatePicker
                        iconRight={getIcon('Calendar')}
                        dateFormat={Global.user?.date_format?.toUpperCase()}
                        title={metaData?.field_list?.date_start?.label}
                        required={metaData?.field_list?.date_start?.required}
                        currentDate={activity.date_start || new Date()}
                        selectedDate={(value) => {
                            onChangeDateTime('date_start', value, activity.due_date, activity.time_start, activity.time_end)
                        }}
                        isSubmitted={isSubmitForm}
                    />

                    <SpaceHS />

                    <TimePicker
                        iconRight={getIcon('Time')}
                        title={getLabel('activity.label_time_start')}
                        required={metaData?.field_list?.time_start?.required}
                        options={Global.getEnum('Calendar', 'time_start')}
                        value={activity.time_start}
                        onSelected={(value) => {
                            onChangeDateTime('time_start', activity.date_start, activity.due_date, value.key, activity.time_end)
                        }}
                        isSubmitted={isSubmitForm}
                    />
                </Box>

                <Box
                    flexDirection='row'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <RNDatePicker
                        iconRight={getIcon('Calendar')}
                        dateFormat={Global.user?.date_format?.toUpperCase()}
                        title={metaData?.field_list?.due_date?.label}
                        required={metaData?.field_list?.due_date?.required}
                        currentDate={activity.due_date || new Date()}
                        selectedDate={(value) => {
                            onChangeDateTime('due_date', activity.due_date, value, activity.time_start, activity.time_end)
                        }}
                        style={{ flex: 1 }}
                        isSubmitted={isSubmitForm}
                    />
                    <SpaceHS />
                    <Box flex={1}>
                        {/* <ModalSelect
                            title={metaData?.field_list?.taskstatus?.label}
                            required={metaData?.field_list?.taskstatus?.required}
                            options={Global.getEnum('Calendar', 'taskstatus')}
                            value={
                                activity?.taskstatus ? {
                                    key: activity?.taskstatus,
                                    label: Global.getEnumLabel('Calendar', 'taskstatus', activity?.taskstatus)
                                } : {}
                            }
                            onSelected={(value) => onValueChange('taskstatus', value.key)}
                            isSubmitted={isSubmitForm}
                        /> */}
                    </Box>
                </Box>

                {/* Location */}
                <GooglePlaceAutoComplete
                    title={metaData?.field_list?.location?.label}
                    required={metaData?.field_list?.location?.required}
                    value={activity?.location || ''}
                    onChangeText={(value) => {
                        let tmpActivity = { ...activity };
                        tmpActivity.location = value;
                        setActivity(tmpActivity);
                    }}
                    selectedChange={(value) => {
                        let tmpActivity = { ...activity };
                        tmpActivity.location = value.address;
                        setActivity(tmpActivity);
                    }}
                />

                <InputItem
                    isEdit={true}
                    title={metaData?.field_list?.description?.label}
                    required={metaData?.field_list?.description?.required}
                    placeholder={metaData?.field_list?.description?.label}
                    isMultiline={true}
                    selectTextOnFocus={false}
                    groupInputStyle={{
                        borderBottomWidth: null
                    }}
                    inputStyle={{
                        borderBottomWidth: 0.8,
                        maxHeight: heightDevice * .5,
                        marginTop: 10,
                        borderRadius: 6,
                        borderColor: Colors.black.black4,
                    }}
                    isSubmitted={isSubmitForm}
                    value={activity?.description || ''}
                    onValueChange={(value) => onValueChange('description', value)}
                />
                <SpaceS />

                {/* Related to */}
                <SpaceS />
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Text allowFontScaling={true} color='black2'>
                        {metaData?.field_list?.parent_id?.label}
                    </Text>
                    <Box
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        borderBottomColor='black4'
                        flexDirection='row'
                        height={40}
                        alignItems='center'
                    >
                        <ModalSelect
                            value={
                                activity?.parent_type ? {
                                    key: activity?.parent_type,
                                    label: getParentName(activity?.parent_type)
                                } : {}
                            }
                            maxWidth={70}
                            options={ParentTypeList(Global.checkVersionCRMExist('7.1.0.20220215.0930'))}
                            onSelected={(value) => onValueChange('parent_type', value.key)}
                        />
                        <Box flex={1} paddingHorizontal='m'>
                            <Text allowFontScaling={true} numberOfLines={1}>
                                {activity?.parent_name || ''}
                            </Text>
                        </Box>
                        {
                            activity.parent_id && activity.parent_id != 0 ? (
                                <ButtonIconView onPress={() => { onClearRelated?.() }}>
                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                </ButtonIconView>
                            ) : null
                        }
                        <BoxButton
                            alignItems='center'
                            justifyContent='center'
                            borderRadius={4}
                            border={.7}
                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                            onPress={() => {
                                navigation.navigate('RelatedModal', { module: activity.parent_type, fieldRelated: 'parent_id', preScreen: 'ActivityForm' });
                            }}
                        >
                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                        </BoxButton>
                    </Box>

                </Box>

                {/* Section related to activity */}
                {
                    Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                        <>
                            <SpaceS />
                            {/* Body section */}
                            <Box
                                minHeight={100}
                            >
                                {/* Lead */}
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('lead.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.related_lead_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.related_lead && activity.related_lead != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Leads') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Leads', fieldRelated: 'related_lead', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('contact.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.contact_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.contact_id && activity.contact_id != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Contacts') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Contacts', fieldRelated: 'contact_id', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <Text allowFontScaling={true} color='black2'>
                                        {getLabel('account.title')}
                                    </Text>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <Text allowFontScaling={true} numberOfLines={1}>
                                                {activity?.related_account_name?.trim() || ''}
                                            </Text>
                                        </Box>
                                        {
                                            activity.related_account && activity.related_account != 0 ? (
                                                <ButtonIconView onPress={() => { onClearRelated?.('Accounts') }}>
                                                    <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                                                </ButtonIconView>
                                            ) : null
                                        }

                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'related_account', preScreen: 'ActivityForm' });
                                            }}
                                        >
                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>
                                </Box>

                                <SpaceM />
                            </Box>
                            {/* Body section */}
                        </>
                    )
                        : null
                }
                {/* Section related to activity */}

                <SpaceS />
                <MultiplePickList
                    title={metaData?.field_list?.assigned_user_id?.label}
                    required={metaData?.field_list?.assigned_user_id?.required}
                    order={[...ownerOrder]}
                    updateOrder={(orders) => { setOwnerOrder(orders) }}
                    selectedList={[...ownerSelectedList]}
                    updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                />
                <SpaceM />
                <Box paddingHorizontal='l' >
                    <BoxButton row alignItems={'center'} paddingVertical={10} onPress={() => {
                        setShowAllFields(true)
                    }}>
                        <NText allowFontScaling={true} color={Colors.functional.primary}>
                            {getLabel('common.btn_show_all_fields')}
                        </NText>
                        <SpaceHS />
                        <Icon name={getIcon('ShowMore')} color={Colors.functional.primary} style={{ fontSize: 16 }} />
                    </BoxButton>
                </Box>
                <SpaceL />
            </Box>
        )
    }

    return (
        <Container>
            <Header
            >
                {/* <Left>
                    <TouchableHighlight
                        activeOpacity={.3}
                        underlayColor={Colors.black.black5}
                        style={{
                            marginLeft: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4
                        }}
                        onPress={() => {
                            goBack();
                        }}
                    >
                        <Text allowFontScaling={true} color='primary'>{getLabel('common.btn_cancel')}</Text>
                    </TouchableHighlight>

                </Left> */}
                <Body>
                    <Title allowFontScaling={true}>
                        {route.params?.activity && route.params?.activity.id ?
                            getLabel('common.title_edit', { module: getLabel('activity.title').toLowerCase() })
                            : getLabel('common.title_create', { module: getLabel('activity.title').toLowerCase() })
                        }
                    </Title>
                </Body>
                {/* <Right>
                    <TouchableHighlight
                        activeOpacity={.3}
                        underlayColor={Colors.black.black5}
                        style={{
                            marginRight: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4
                        }}
                        onPress={saveActivity}
                    >
                        <Text allowFontScaling={true} color='primary'>{getLabel('common.btn_save')}</Text>
                    </TouchableHighlight>
                </Right> */}
            </Header>
            {
                metaData?.field_list ? (
                    <Content style={{ backgroundColor: Colors.white.white2 }}>
                        {
                            activity?.activitytype != 'Task' ? (
                                showAllFields ? renderAllFieldEvent() : renderQuickCreateEvent()
                            ) : (
                                showAllFields ? renderAllFieldTask() : renderQuickCreateTask()
                            )
                        }
                    </Content>
                ) : <Content style={{ backgroundColor: Colors.white.white1 }} />
            }
            <Box
                style={{ backgroundColor: Colors.white.white1, ...styles.shadow }}
            >
                <SafeAreaView edges={['bottom', 'left', 'right']}>

                    <Box
                        height={isIphoneX ? 54 : 62}
                        width={widthResponse}
                        justifyContent={'center'}
                        alignItems={isIphoneX ? 'flex-end' : 'center'}

                        flexDirection='row'
                    >
                        <TouchableOpacity
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 229, 229, 1)',
                                borderRadius: 5
                            }}
                            onPress={() => {
                                goBack();
                            }}
                        >
                            <Text allowFontScaling={true}
                                color='dangerous'
                                fontWeight='bold'
                            >
                                {getLabel('common.btn_cancel')}
                            </Text>
                        </TouchableOpacity>

                        <SpaceHM />

                        <TouchableOpacity
                            style={{
                                height: 40,
                                paddingHorizontal: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: Colors.functional.primary,
                                borderRadius: 5
                            }}
                            onPress={saveActivity}
                        >
                            <Text allowFontScaling={true}
                                color='white1'
                                fontWeight='bold'
                            >
                                {getLabel('common.btn_save')}
                            </Text>
                        </TouchableOpacity>

                    </Box>
                </SafeAreaView>
            </Box>
            <IndicatorLoading loading={loading} />
        </Container>
    )
}

const styles = StyleSheet.create({
    btnShowAllField: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.black.black5
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.14,
            }
        }),
    },
    btnCamera: {
        position: 'absolute',
        bottom: -20,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white.white2,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: Colors.white.white4,
        width: 40,
        height: 40
    },
    camera: {
        color: Colors.brand.brand1,
        fontSize: 24
    }
})
