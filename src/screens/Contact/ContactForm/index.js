// Import libraries
import moment from 'moment-timezone'
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { InteractionManager, Keyboard, TouchableOpacity } from 'react-native'
import { BackHandler, StyleSheet, Switch, TouchableHighlight } from 'react-native'
import ActionSheet from 'react-native-action-sheet'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import {
    Body, BoxButton, ButtonIconView, Header, IconRight, InputItem, Left,
    LText, NText, Right, SpaceHM, SpaceHS, SpaceL, SpaceS, Title
} from '../../../components/CustomComponentView'
import GooglePlaceAutoComplete from '../../../components/GooglePlaceAutoComplete'
import IndicatorLoading from '../../../components/IndicatorLoading'
// Import components
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import RNDatePicker from '../../../components/RNDatePicker'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { setContacts } from '../../../redux/actions/contactActions'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import { PARAMS_ALERT, ContactState } from '../../../utils/Models/models'
import { addItemToList, updateItemDetailToList } from '../../Lead/Shared'
import styles from './styles'

export default function ContactForm({ route, navigation }) {

    const [ownerSelectedList, setOwnerSelectedList] = React.useState([
        {
            id: 'Users:' + Global.user?.id,
            name: Global.getUser(Global.user?.id)?.full_name,
            email: Global.getUser(Global.user?.id)?.email1,
            type: 'user'
        }
    ]);
    const [ownerOrder, setOwnerOrder] = React.useState([0]);
    const [showAllFields, setShowAllFields] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [contact, setContact] = useState(
        route?.params?.contact
            ? route.params.contact
            : {
                contacts_type: 'Contact'
            }
    );
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);

    const disPatch = useDispatch();
    const { contacts, indexSelected }: ContactState = useSelector(state => state.contactState);

    const [interactionsComplete, setInteractionsComplete] = useState(false);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setInteractionsComplete(true);
        })
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                goBack();
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        // The screen is focused
        // Call any action
        console.log('PrevScene data: ', JSON.stringify(route?.params));
        if (route?.params?.prevScene == 'ContactList' && (contact?.contactid || contact?.id)) {
            getDataRecord();
        }
        else {
            setLoading(true);
            Global.getModuleMetaData('Contacts', metaData => {
                if (contact?.id) {
                    let selectedList = Global.formatAssignedOwnersArray(contact?.assigned_owners, contact?.main_owner_id);
                    setOwnerSelectedList(selectedList);
                    setOwnerOrder(Object.keys(selectedList));
                    contact.birthday = contact.birthday ? new Date(`${contact.birthday}`) : null;
                }
               
                setMetaData(metaData);
                setLoading(false);
            },
                error => {
                    Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale }));
                });
        }


    }, [])


    useEffect(() => {
        console.log('PrevScene data: ', JSON.stringify(route?.params));
        if (route?.params?.prevScene == 'RelatedList') {
            console.log(route?.params);
            let fieldKeyValue = '';
            let fieldName = route?.params.fieldRelated?.replace('id', 'name');
            let fieldNameValue = '';
            switch (route?.params.fieldRelated) {
                case 'account_id':
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'contact_id':
                    fieldKeyValue = route?.params?.data?.contactid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'related_campaign':
                    fieldKeyValue = route?.params?.data?.campaignid;
                    fieldName = 'related_campaign_name'
                    fieldNameValue = route?.params?.data?.campaignname;
                    break;

                default:
                    break;
            }

            let tmpContact = { ...contact };
            tmpContact[route?.params?.fieldRelated] = fieldKeyValue;
            tmpContact[fieldName] = fieldNameValue;
            setContact(tmpContact);
        }
    }, [route.params])

    const goBack = () => {
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
                        if (route?.params?.prevScene == 'ContactView') {
                            navigation.replace('ContactView', { contact: contact, prevScene: 'ContactForm' });
                        }
                        else {
                            navigation.goBack();
                        }
                    }
                }
            ]
        }

        disPatch(showAlert?.(params));
    }

    // Set value when change
    const onValueChange = (field, value) => {
        let tmpContact = { ...contact };
        tmpContact[field] = value;
        setContact(tmpContact);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetContact',
            Params: {
                id: contact?.contactid || contact?.id,
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
                setOwnerSelectedList(selectedList);
                setOwnerOrder(Object.keys(selectedList));
                setContact(data.data);
                setMetaData(data.metadata);
                setLoading(false);
            }
            else {
                setLoading(false);
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }) }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
            });
    }

    // Create/Edit contact
    const saveContact = () => {
        Keyboard.dismiss();

        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, contact, [], 'Contacts');
        if (fieldsRequireEmpty) {
            // Alert.alert(
            //     I18n.t('common.alert_field_invalid_title', { locale: Global.locale }),
            //     fieldsRequireEmpty,
            //     [
            //         {
            //             text: 'Ok',
            //             onPress: () => console.log('Cancel Pressed'),
            //             style: 'cancel'
            //         },
            //     ]
            // );
            let paramAlert: PARAMS_ALERT = {
                title: getLabel('common.alert_field_invalid_title'),
                message: fieldsRequireEmpty,
                actions: [
                    {
                        isCancel: false,
                        label: getLabel('common.btn_ok'),
                        onPress: () => setSubmitForm(true)
                    }
                ]
            }

            disPatch(showAlert(paramAlert));

            return;
        }

        if (contact?.email) {
            if (!Global.validateEmail(contact?.email)) {
                Toast.show(I18n.t('common.msg_email_invalid', { locale: Global.locale || "vn_vn" }));
                return;
            }
        }

        if (contact?.secondaryemail) {
            if (!Global.validateEmail(contact?.secondaryemail)) {
                Toast.show(I18n.t('common.msg_email_invalid', { locale: Global.locale || "vn_vn" }));
                return;
            }
        }

        if (assignedOwners == '') {
            Toast.show(I18n.t('common.msg_assigned_owner_empty', { locale: Global.locale || "vn_vn" }));
            return;
        }

        let tempAssignedOwners = [];
        ownerSelectedList.map((item) => {
            tempAssignedOwners.push(item.id?.split(':')[0]);
        })

        if (assignedOwners.split(':')[0] == 'Groups' && (tempAssignedOwners.indexOf('Users') != -1)) {
            Toast.show(I18n.t('common.msg_assigned_main_owner_invalid', { locale: Global.locale || "vn_vn" }));
            return;
        }

        // Do request
        setLoading(true);

        var params = {
            RequestAction: 'SaveContact',
            Data: contact
        };

        if (contact.birthday) {
            params.Data.birthday = Global.formatDate(contact.birthday);
        }

        params.Data.assigned_user_id = assignedOwners;

        if (contact && contact.id) {
            params.Data.id = contact.id;
            params.Data.tags = '';
        }

        if (route?.params?.isDuplicate) {
            params.Data.id = '';
            params.Data.tags = '';
        }

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            console.log('data: ', data);
            if (contact?.id && !route?.params?.isDuplicate) {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('contact.title').toLowerCase() }),
                        {
                            duration: 1000,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                const contactTemp = updateItemDetailToList('CONTACTS', contact, contacts, indexSelected);
                                disPatch(setContacts(contactTemp));
                                if (route?.params?.prevScene == 'ContactView') {
                                    navigation.replace('ContactView', { contact: data, prevScene: 'ContactForm' });
                                }
                                else {
                                    navigation.goBack();
                                }
                            }
                        }
                    );

                    Global.updateCounters();
                }
                else {
                    Toast.show(I18n.t('common.msg_edit_error', { module: getLabel('contact.title').toLowerCase() }));
                }
            }
            else {
                if (parseInt(data.success) === 1) {
                    const newContact = {
                        id: data.id,
                        firstname: contact?.firstname || '',
                        lastname: contact?.lastname || '',
                        salutation: contact?.salutationtype || '',
                        accountname: contact?.account_name || '',
                        mobile: contact?.mobile || '',
                        email: contact?.email || '',
                        address: contact?.mailingstreet || '',
                        starred: '0',
                        assigned_owners: ownerSelectedList,
                        full_name: (contact?.salutationtype ? (Global.getEnumLabel('Contacts', 'salutationtype', contact?.salutationtype) + ' ') : '') + (contact?.lastname ? (contact?.lastname + ' ') : '') + (contact?.firstname || ''),
                        createdtime: new Date().toString()
                    }

                    Toast.show(
                        getLabel('common.msg_create_success', { module: getLabel('contact.title').toLowerCase() }),
                        {
                            duration: 1000,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                const contactsTemp = addItemToList('CONTACTS', newContact, contacts);
                                disPatch(setContacts(contactsTemp));
                                if (route?.params?.prevScene == 'ContactView') {
                                    navigation.replace('ContactView', { contact: data, prevScene: 'ContactForm' });
                                }
                                else {
                                    navigation.goBack();
                                }
                            }
                        }
                    );

                    Global.updateCounters();
                }
                else {
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('contact.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const showOptionChangeAvatar = () => {
        var options = [
            'Take Photo',
            'Upload Photo',
            'Cancel'
        ];

        var DESTRUCTIVE_INDEX = 0;
        var CANCEL_INDEX = 2;

        ActionSheet.showActionSheetWithOptions({
            options: options,
            cancelButtonIndex: CANCEL_INDEX,
            destructiveButtonIndex: DESTRUCTIVE_INDEX,
            tintColor: 'blue'
        },
            (buttonIndex) => {

            });

    }

    const onClearRelated = (fieldKey, fieldValue) => {
        let tmpContact = { ...contact };
        tmpContact[fieldKey] = '';
        tmpContact[fieldValue] = '';
        setContact(tmpContact);
    }

    if (!interactionsComplete) {
        return (
            <Box
                style={{
                    flex: 1,
                    backgroundColor: Colors.white.white1
                }}
            >
            </Box>
        )
    }

    return (
        <>
            <Header
            >
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_contacts')}</Title>
                </Body>
            </Header>

            {
                metaData?.field_list ? (
                    <>
                        <Content style={{ backgroundColor: Colors.white.white1 }} disableKBDismissScroll>
                            {
                                !showAllFields ?
                                    (
                                        <>
                                            {/* <Box justifyContent='center' alignItems='center' height={90} flex={1}>
                                            <Box
                                                width={71}
                                                height={71}
                                                borderRadius={71 / 2}
                                                borderWidth={2}
                                                borderColor='white5'
                                                justifyContent='center'
                                                alignItems='center'
                                            >
                                                <Image
                                                    source={require('../../../assets/images/avatar.jpg')}
                                                    style={{ width: 70, height: 70, borderRadius: 70 / 2 }}
                                                    resizeMode='contain'
                                                />
                                                <BoxButton
                                                    style={{
                                                        position: 'absolute',
                                                        right: -10,
                                                        bottom: -5,
                                                        zIndex: 10,
                                                        borderRadius: 30 / 2,
                                                        width: 30,
                                                        height: 30,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderWidth: 0.5,
                                                        borderColor: Colors.white.white5
                                                    }}
                                                    onPress={() => {
                                                        showOptionChangeAvatar();
                                                    }}
                                                >
                                                    <Icon name={getIcon('Camera')} />
                                                </BoxButton>
                                            </Box>
                                        </Box> */}

                                            <Box width={widthResponse} paddingHorizontal='l' flexDirection='row' alignItems='flex-end'>
                                                <ModalSelect
                                                    maxWidth={70}
                                                    options={Global.getEnum('Contacts', 'salutationtype')}
                                                    value={
                                                        contact?.salutationtype ? {
                                                            key: contact?.salutationtype,
                                                            label: Global.getEnumLabel('Contacts', 'salutationtype', contact?.salutationtype)
                                                        } : {}
                                                    }
                                                    onSelected={(value) => onValueChange('salutationtype', value.key)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                                <InputItem
                                                    style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                    isEdit={true}
                                                    title={metaData?.field_list?.lastname?.label}
                                                    required={metaData?.field_list?.lastname?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.lastname || ''}
                                                    onValueChange={(value) => onValueChange('lastname', value)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                                <InputItem
                                                    style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                    isEdit={true}
                                                    title={metaData?.field_list?.firstname?.label}
                                                    required={metaData?.field_list?.firstname?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    required={1}
                                                    value={contact?.firstname || ''}
                                                    onValueChange={(value) => onValueChange('firstname', value)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            <SpaceS />

                                            <Box
                                                paddingHorizontal='l'
                                                paddingVertical='m'
                                            >
                                                <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                    {metaData?.field_list?.account_id?.label}
                                                </NText>
                                                <Box
                                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                                    borderBottomColor='black4'
                                                    flexDirection='row'
                                                    height={40}
                                                    alignItems='center'
                                                >
                                                    <Box flex={1} paddingHorizontal='m'>
                                                        <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                            {contact?.account_name || ''}
                                                        </NText>
                                                    </Box>
                                                    {
                                                        contact.account_id && contact.account_id != 0 ? (
                                                            <ButtonIconView onPress={() => { onClearRelated?.('account_id', 'account_name') }}>
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
                                                            navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'account_id', preScreen: 'ContactForm' });
                                                        }}
                                                    >
                                                        <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                    </BoxButton>
                                                </Box>
                                            </Box>

                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.mobile?.label}
                                                required={metaData?.field_list?.mobile?.required}
                                                keyboardType='numeric'
                                                inputStyle={{ fontSize: 14 }}
                                                value={contact?.mobile || ''}
                                                onValueChange={(value) => onValueChange('mobile', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.email?.label}
                                                required={metaData?.field_list?.email?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                keyboardType='email-address'
                                                inputType='email'
                                                value={contact?.email || ''}
                                                onValueChange={(value) => onValueChange('email', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            <SpaceS />
                                            <MultiplePickList
                                                title={metaData?.field_list?.assigned_user_id?.label}
                                                required={metaData?.field_list?.assigned_user_id?.required}
                                                order={[...ownerOrder]}
                                                updateOrder={(orders) => { setOwnerOrder(orders) }}
                                                selectedList={[...ownerSelectedList]}
                                                updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                                            />

                                            <Box paddingHorizontal='l' >
                                                <BoxButton row alignItems={'center'} paddingVertical={10} onPress={() => {
                                                    setShowAllFields(true)
                                                }}>
                                                    <NText allowFontScaling={true} color={Colors.functional.primary}>
                                                        {I18n.t('common.btn_show_all_fields', { locale: Global.locale || "vn_vn" })}
                                                    </NText>
                                                    <SpaceHS />
                                                    <Icon name={getIcon('ShowMore')} color={Colors.functional.primary} style={{ fontSize: 16 }} />
                                                </BoxButton>
                                            </Box>
                                        </>
                                    )
                                    : null
                            }
                            {
                                showAllFields ?
                                    (
                                        <TransitionView>
                                            <>
                                                {/* Avatar */}
                                                {/* <Box justifyContent='center' alignItems='center' height={90} flex={1}>
                                                <Box
                                                    width={71}
                                                    height={71}
                                                    borderRadius={71 / 2}
                                                    borderWidth={2}
                                                    borderColor='white5'
                                                    justifyContent='center'
                                                    alignItems='center'
                                                >
                                                    <Image
                                                        source={require('../../../assets/images/avatar.jpg')}
                                                        style={{ width: 70, height: 70, borderRadius: 70 / 2 }}
                                                        resizeMode='contain'
                                                    />
                                                    <BoxButton
                                                        style={{
                                                            position: 'absolute',
                                                            right: -10,
                                                            bottom: -5,
                                                            zIndex: 10,
                                                            borderRadius: 30 / 2,
                                                            width: 30,
                                                            height: 30,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderWidth: 0.5,
                                                            borderColor: Colors.white.white5
                                                        }}
                                                        onPress={() => {
                                                            showOptionChangeAvatar();
                                                        }}
                                                    >
                                                        <Icon name={getIcon('Camera')} />
                                                    </BoxButton>
                                                </Box>
                                            </Box> */}

                                                {/* Ten */}
                                                <Box width={widthResponse} paddingHorizontal='l' flexDirection='row' alignItems='flex-end'>
                                                    <ModalSelect
                                                        maxWidth={70}
                                                        options={Global.getEnum('Contacts', 'salutationtype')}
                                                        value={
                                                            contact?.salutationtype ? {
                                                                key: contact?.salutationtype,
                                                                label: Global.getEnumLabel('Contacts', 'salutationtype', contact?.salutationtype)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('salutationtype', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                    <InputItem
                                                        style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                        isEdit={true}
                                                        title={metaData?.field_list?.lastname?.label}
                                                        required={metaData?.field_list?.lastname?.required}
                                                        inputStyle={{ fontSize: 14 }}
                                                        value={contact?.lastname || ''}
                                                        onValueChange={(value) => onValueChange('lastname', value)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                    <InputItem
                                                        style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                        isEdit={true}
                                                        title={metaData?.field_list?.firstname?.label}
                                                        required={metaData?.field_list?.firstname?.required}
                                                        inputStyle={{ fontSize: 14 }}
                                                        value={contact?.firstname || ''}
                                                        onValueChange={(value) => onValueChange('firstname', value)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Ngày sinh */}
                                                <SpaceS />

                                                <Box
                                                    paddingHorizontal='l'
                                                    paddingVertical='m'
                                                >
                                                    <RNDatePicker
                                                        iconRight={getIcon('Calendar')}
                                                        dateFormat={Global.user?.date_format?.toUpperCase()}
                                                        title={metaData?.field_list?.birthday?.label}
                                                        required={metaData?.field_list?.birthday?.required}
                                                        currentDate={contact.birthday}
                                                        maxDate={moment(new Date()).add(-14, 'years').toDate()}
                                                        selectedDate={(value) => {
                                                            onValueChange('birthday', value || moment(new Date()).add(-14, 'years').toDate())
                                                        }}
                                                    />
                                                    {/* <NText allowFontScaling={true}  color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                    {metaData?.field_list?.birthday?.label}
                                                </NText>
                                                <Box
                                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                                    borderBottomColor='black4'
                                                    flexDirection='row'
                                                    height={40}
                                                    alignItems='center'
                                                >
                                                    <Box flex={1} paddingHorizontal='m'>
                                                        <NText allowFontScaling={true}  style={{ fontSize: 15 }} numberOfLines={1}>
                                                            {Global.formatDate(contact?.birthday) || ''}
                                                        </NText>
                                                    </Box>
                                                    <BoxButton
                                                        alignItems='center'
                                                        justifyContent='center'
                                                        borderRadius={4}
                                                        border={.7}
                                                        style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                                        onPress={() => {

                                                        }}
                                                    >
                                                        <Icon name={getIcon('Calendar')} style={{ fontSize: 14 }} />
                                                    </BoxButton>
                                                </Box> */}

                                                </Box>

                                                {/* Công ty */}
                                                <SpaceS />
                                                <Box
                                                    paddingHorizontal='l'
                                                    paddingVertical='m'
                                                >
                                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                        {metaData?.field_list?.account_id?.label}
                                                    </NText>
                                                    <Box
                                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                                        borderBottomColor='black4'
                                                        flexDirection='row'
                                                        height={40}
                                                        alignItems='center'
                                                    >
                                                        <Box flex={1} paddingHorizontal='m'>
                                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                                {contact?.account_name || ''}
                                                            </NText>
                                                        </Box>
                                                        {
                                                            contact.account_id && contact.account_id != 0 ? (
                                                                <ButtonIconView onPress={() => { onClearRelated?.('account_id', 'account_name') }}>
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
                                                                navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'account_id', preScreen: 'ContactForm' });
                                                            }}
                                                        >
                                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                        </BoxButton>
                                                    </Box>

                                                </Box>

                                                {/* Chức vụ */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.title?.label}
                                                    required={metaData?.field_list?.title?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.title || ''}
                                                    onValueChange={(value) => onValueChange('title', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Phòng ban */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.department?.label}
                                                    required={metaData?.field_list?.department?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.department || ''}
                                                    onValueChange={(value) => onValueChange('department', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Loại & Nguồn */}
                                                <SpaceS />
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        flex={1}
                                                        title={metaData?.field_list?.contacts_type?.label}
                                                        required={metaData?.field_list?.contacts_type?.required}
                                                        options={Global.getEnum('Contacts', 'contacts_type')}
                                                        value={
                                                            contact?.contacts_type ? {
                                                                key: contact?.contacts_type,
                                                                label: Global.getEnumLabel('Contacts', 'contacts_type', contact?.contacts_type)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('contacts_type', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                    <SpaceHS />
                                                    <ModalSelect
                                                        flex={1}
                                                        title={metaData?.field_list?.leadsource?.label}
                                                        required={metaData?.field_list?.leadsource?.required}
                                                        options={Global.getEnum('Contacts', 'leadsource')}
                                                        value={
                                                            contact?.leadsource ? {
                                                                key: contact?.leadsource,
                                                                label: Global.getEnumLabel('Contacts', 'leadsource', contact?.leadsource)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('leadsource', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* ĐT Công ty */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.phone?.label}
                                                    required={metaData?.field_list?.phone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.phone || ''}
                                                    onValueChange={(value) => onValueChange('phone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Di động */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.mobile?.label}
                                                    required={metaData?.field_list?.mobile?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mobile || ''}
                                                    onValueChange={(value) => onValueChange('mobile', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* ĐT nhà */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.homephone?.label}
                                                    required={metaData?.field_list?.homephone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.homephone || ''}
                                                    onValueChange={(value) => onValueChange('homephone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* ĐT khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.otherphone?.label}
                                                    required={metaData?.field_list?.otherphone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.otherphone || ''}
                                                    onValueChange={(value) => onValueChange('otherphone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Fax */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.fax?.label}
                                                    required={metaData?.field_list?.fax?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.fax || ''}
                                                    onValueChange={(value) => onValueChange('fax', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mail */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.email?.label}
                                                    required={metaData?.field_list?.email?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    keyboardType='email-address'
                                                    inputType='email'
                                                    value={contact?.email || ''}
                                                    onValueChange={(value) => onValueChange('email', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mail Other*/}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.secondaryemail?.label}
                                                    required={metaData?.field_list?.secondaryemail?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    keyboardType='email-address'
                                                    inputType='email'
                                                    value={contact?.secondaryemail || ''}
                                                    onValueChange={(value) => onValueChange('secondaryemail', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Trợ lý */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.assistant?.label}
                                                    required={metaData?.field_list?.assistant?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.assistant || ''}
                                                    onValueChange={(value) => onValueChange('assistant', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* ĐT trợ lý */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType='numeric'
                                                    title={metaData?.field_list?.assistantphone?.label}
                                                    required={metaData?.field_list?.assistantphone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.assistantphone || ''}
                                                    onValueChange={(value) => onValueChange('assistantphone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Báo cáo cho */}
                                                <SpaceS />
                                                <Box
                                                    paddingHorizontal='l'
                                                    paddingVertical='m'
                                                >
                                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                        {metaData?.field_list?.contact_id?.label}
                                                    </NText>
                                                    <Box
                                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                                        borderBottomColor='black4'
                                                        flexDirection='row'
                                                        height={40}
                                                        alignItems='center'
                                                    >
                                                        <Box flex={1} paddingHorizontal='m'>
                                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                                {contact.contact_name}
                                                            </NText>
                                                        </Box>
                                                        {
                                                            contact.contact_id && contact.contact_id != 0 ? (
                                                                <ButtonIconView onPress={() => { onClearRelated?.('contact_id', 'contact_name') }}>
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
                                                                navigation.navigate('RelatedModal', { module: 'Contacts', fieldRelated: 'contact_id', preScreen: 'ContactForm' });
                                                            }}
                                                        >
                                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                        </BoxButton>
                                                    </Box>

                                                </Box>

                                                {/* Từ chối nhận email */}
                                                <Box paddingHorizontal='l' paddingVertical='l'>

                                                    <Box
                                                        flexDirection='row'
                                                        alignItems='center'
                                                        justifyContent='space-between'
                                                    >
                                                        <NText allowFontScaling={true} >
                                                            {metaData?.field_list?.emailoptout?.label}
                                                        </NText>
                                                        <Switch
                                                            trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                                            thumbColor={Colors.white.white1}
                                                            ios_backgroundColor="#767577"
                                                            style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                                            value={contact?.emailoptout == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('emailoptout', value ? 1 : 0)}
                                                        />
                                                    </Box>

                                                </Box>

                                                {/* Tham khảo */}
                                                <Box paddingHorizontal='l' paddingVertical='l'>

                                                    <Box
                                                        flexDirection='row'
                                                        alignItems='center'
                                                        justifyContent='space-between'
                                                    >
                                                        <NText allowFontScaling={true} >
                                                            {metaData?.field_list?.reference?.label}
                                                        </NText>
                                                        <Switch
                                                            trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                                            thumbColor={Colors.white.white1}
                                                            ios_backgroundColor="#767577"
                                                            style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                                            value={contact?.reference == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('reference', value ? 1 : 0)}
                                                        />
                                                    </Box>

                                                </Box>

                                                {/* Không liên lạc qua ĐT */}
                                                <Box paddingHorizontal='l' paddingVertical='l'>
                                                    <Box
                                                        flexDirection='row'
                                                        alignItems='center'
                                                        justifyContent='space-between'
                                                    >
                                                        <NText allowFontScaling={true} >
                                                            {metaData?.field_list?.donotcall?.label}
                                                        </NText>
                                                        <Switch
                                                            trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                                            thumbColor={Colors.white.white1}
                                                            ios_backgroundColor="#767577"
                                                            style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                                            value={contact?.donotcall == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('donotcall', value ? 1 : 0)}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Thông báo khi dữ liệu thay đổi */}
                                                <Box paddingHorizontal='l' paddingVertical='l'>
                                                    <Box
                                                        flexDirection='row'
                                                        alignItems='center'
                                                        justifyContent='space-between'
                                                    >
                                                        <NText allowFontScaling={true} >
                                                            {metaData?.field_list?.notify_owner?.label}
                                                        </NText>
                                                        <Switch
                                                            trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                                            thumbColor={Colors.white.white1}
                                                            ios_backgroundColor="#767577"
                                                            style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                                            value={contact?.notify_owner == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('notify_owner', value ? 1 : 0)}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Đánh giá */}
                                                <SpaceS />
                                                <Box paddingHorizontal='l' row paddingVertical='s' flexDirection='row'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.rating?.label}
                                                        required={metaData?.field_list?.rating?.required}
                                                        options={Global.getEnum('Contacts', 'rating')}
                                                        value={
                                                            contact?.rating ? {
                                                                key: contact?.rating,
                                                                label: Global.getEnumLabel('Contacts', 'rating', contact?.rating)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('rating', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />

                                                </Box>

                                            </>
                                            {/* ----------------------------- Thông tin địa chỉ  ----------------------------- */}
                                            <>
                                                {/* Địa chỉ */}
                                                <GooglePlaceAutoComplete
                                                    title={metaData?.field_list?.mailingstreet?.label}
                                                    required={metaData?.field_list?.mailingstreet?.required}
                                                    value={contact?.mailingstreet || ''}
                                                    onChangeText={(value) => {
                                                        let tmpContact = { ...contact };
                                                        tmpContact.mailingstreet = value;
                                                        setContact(tmpContact);
                                                    }}
                                                    selectedChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        tmpContact.mailingstreet = value.address;
                                                        tmpContact.mailingstate = value.state;
                                                        tmpContact.mailingcity = value.city;
                                                        tmpContact.mailingcountry = value.country;
                                                        tmpContact.mailingstreet_longitude = value.longitude;
                                                        tmpContact.mailingstreet_latitude = value.latitude;
                                                        setContact(tmpContact);
                                                    }}
                                                />

                                                {/* Vùng, Miền */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mailingpobox?.label}
                                                    required={metaData?.field_list?.mailingpobox?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mailingpobox || ''}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        tmpContact.mailingpobox = value.toString();
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tỉnh/ TP */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mailingcity?.label}
                                                    required={metaData?.field_list?.mailingcity?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mailingcity || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.mailingcity = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.mailingcity = value;
                                                        }
                                                        tmpContact.mailingstreet_longitude = '';
                                                        tmpContact.mailingstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quận/Huyện */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mailingstate?.label}
                                                    required={metaData?.field_list?.mailingstate?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mailingstate || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.mailingstate = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.mailingstate = value;
                                                        }
                                                        tmpContact.mailingstreet_longitude = '';
                                                        tmpContact.mailingstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mã vùng */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mailingzip?.label}
                                                    required={metaData?.field_list?.mailingzip?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mailingzip || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.mailingzip = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.mailingzip = value;
                                                        }
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quốc gia */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mailingcountry?.label}
                                                    required={metaData?.field_list?.mailingcountry?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.mailingcountry || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.mailingcountry = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.mailingcountry = value;
                                                        }
                                                        tmpContact.mailingstreet_longitude = '';
                                                        tmpContact.mailingstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </>
                                            {/* ----------------------------- Thông tin địa chỉ  ----------------------------- */}

                                            {/* ----------------------------- Thông tin địa chỉ khác  ----------------------------- */}
                                            <>
                                                {/* Địa chỉ khác */}
                                                <GooglePlaceAutoComplete
                                                    title={metaData?.field_list?.otherstreet?.label}
                                                    required={metaData?.field_list?.otherstreet?.required}
                                                    value={contact?.otherstreet || ''}
                                                    onChangeText={(value) => {
                                                        let tmpContact = { ...contact };
                                                        tmpContact.otherstreet = value;
                                                        setContact(tmpContact);
                                                    }}
                                                    selectedChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        tmpContact.otherstreet = value.address;
                                                        tmpContact.otherstate = value.state;
                                                        tmpContact.othercity = value.city;
                                                        tmpContact.othercountry = value.country;
                                                        tmpContact.otherstreet_longitude = value.longitude;
                                                        tmpContact.otherstreet_latitude = value.latitude;
                                                        setContact(tmpContact);
                                                    }}
                                                />

                                                {/* Vùng, Miền khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.otherpobox?.label}
                                                    required={metaData?.field_list?.otherpobox?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.otherpobox || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.otherpobox = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.otherpobox = value;
                                                        }
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tỉnh/ TP khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.othercity?.label}
                                                    required={metaData?.field_list?.othercity?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.othercity || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.othercity = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.othercity = value;
                                                        }
                                                        tmpContact.otherstreet_longitude = '';
                                                        tmpContact.otherstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quận/Huyện khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.otherstate?.label}
                                                    required={metaData?.field_list?.otherstate?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.otherstate || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.otherstate = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.otherstate = value;
                                                        }
                                                        tmpContact.otherstreet_longitude = '';
                                                        tmpContact.otherstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mã vùng khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.otherzip?.label}
                                                    required={metaData?.field_list?.otherzip?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.otherzip || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.otherzip = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.otherzip = value;
                                                        }
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quốc gia khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.othercountry?.label}
                                                    required={metaData?.field_list?.othercountry?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={contact?.othercountry || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpContact = { ...contact };
                                                        if (value[0] == ' ') {
                                                            tmpContact.othercountry = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpContact.othercountry = value;
                                                        }
                                                        tmpContact.otherstreet_longitude = '';
                                                        tmpContact.otherstreet_latitude = '';
                                                        setContact(tmpContact);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </>
                                            {/* ----------------------------- Thông tin địa chỉ khác  ----------------------------- */}

                                            {/* ----------------------------- Thông tin mô tả  ----------------------------- */}
                                            <>
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.description?.label}
                                                    required={metaData?.field_list?.description?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    isMultiline={true}
                                                    selectTextOnFocus={false}
                                                    value={contact?.description || ''}
                                                    onValueChange={(value) => onValueChange('description', value)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </>
                                            {/* ----------------------------- Thông tin mô tả  ----------------------------- */}

                                            {/* Giao cho */}
                                            <SpaceS />
                                            <MultiplePickList
                                                title={metaData?.field_list?.assigned_user_id?.label}
                                                required={metaData?.field_list?.assigned_user_id?.required}
                                                required={1}
                                                order={[...ownerOrder]}
                                                updateOrder={(orders) => { setOwnerOrder(orders) }}
                                                selectedList={[...ownerSelectedList]}
                                                updateSelectedList={(list) => { setOwnerSelectedList(list) }}
                                            />

                                        </TransitionView>

                                    )
                                    : null
                            }

                            <SpaceL />
                            <SpaceL />
                            <SpaceL />
                            <SpaceL />
                            <SpaceL />
                            <SpaceL />
                        </Content>
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
                                            Keyboard.dismiss();
                                            goBack();
                                        }}
                                    >
                                        <Text
                                            allowFontScaling={true}
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
                                        onPress={() => { Keyboard.dismiss(); saveContact() }}
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

                    </>
                ) : (
                    <Content style={{ backgroundColor: Colors.white.white1 }} />
                )
            }
            <IndicatorLoading loading={loading} />
        </>
    )
}
