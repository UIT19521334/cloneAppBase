// Import library
import { Content } from 'native-base'
import React, { useEffect, useState } from 'react'
import { BackHandler, InteractionManager, Keyboard, Switch, TouchableOpacity } from 'react-native'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { Body, BoxButton, Header, InputItem, NText, SpaceHM, SpaceHS, SpaceL, SpaceS, Title } from '../../../components/CustomComponentView'
import GooglePlaceAutoComplete from '../../../components/GooglePlaceAutoComplete'
import IndicatorLoading from '../../../components/IndicatorLoading'
// Import components
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { setLeads } from '../../../redux/actions/leadAction'
import { LeadState, PARAMS_ALERT } from '../../../utils/Models/models'
import { addItemToList, updateItemDetailToList } from '../Shared'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import styles from './styles'

function LeadForm({ route, navigation }) {
    //State
    const [ownerSelectedList, setOwnerSelectedList] = useState([
        {
            id: 'Users:' + Global.user?.id,
            name: Global.getUser(Global.user?.id)?.full_name,
            email: Global.getUser(Global.user?.id)?.email1,
            type: 'user'
        }
    ]);
    const [ownerOrder, setOwnerOrder] = useState([0]);
    const [showAllFields, setShowAllFields] = useState(false);
    const [loading, setLoading] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [lead, setLead] = useState(
        route?.params?.lead
            ? route.params.lead
            : {
                leadstatus: 'New'
            }
    );
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);

    // Functions handle
    const disPatch = useDispatch();
    const { leads, indexSelected }: LeadState = useSelector(state => state.leadState);
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

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            // Disable android hardware back button
            if (route?.params?.prevScene == 'LeadList' && (lead?.leadid || lead?.id)) {
                getDataRecord();
            }
            else {
                setLoading(true);
                Global.getModuleMetaData('Leads', metaData => {
                    if (lead?.id) {
                        let selectedList = Global.formatAssignedOwnersArray(lead?.assigned_owners, lead?.main_owner_id);
                        setOwnerSelectedList(selectedList);
                        setOwnerOrder(Object.keys(selectedList));
                    }
                    setMetaData(metaData);
                    setLoading(false);
                },
                    error => {
                        Toast.show(getLabel('common.msg_connection_error'));
                    });
            }
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            // Reset data when unmount screen 
            setLoading(false);
        });

        return () => {
            unsubscribe();
            unsubscribeBlur();
        }
    }, [navigation])

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
                        if (route?.params?.prevScene == 'LeadView') {
                            navigation.replace('LeadView', { lead: lead, prevScene: 'LeadForm' });
                        }
                        else {
                            navigation.goBack();
                        }
                    }
                }
            ]
        }
        disPatch(showAlert?.(params));
        return true;
    }

    // Set value when change
    const onValueChange = (field, value) => {
        let tmpLead = { ...lead };
        tmpLead[field] = value;
        setLead(tmpLead);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetLead',
            Params: {
                id: lead?.leadid || lead?.id,
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
                setLead(data.data);
                setMetaData(data.metadata);
                setLoading(false);
            }
            else {
                setLoading(false);
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('lead.title') }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    // Create/Edit lead
    const saveLead = () => {
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, lead, [], 'Leads');
        if (fieldsRequireEmpty) {
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

        if (lead?.email) {
            if (!Global.validateEmail(lead?.email)) {
                Toast.show(getLabel('common.msg_email_invalid'));
                return;
            }
        }

        if (lead?.secondaryemail) {
            if (!Global.validateEmail(lead?.secondaryemail)) {
                Toast.show(getLabel('common.msg_email_invalid'));
                return;
            }
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
            RequestAction: 'SaveLead',
            Data: lead
        };

        params.Data.assigned_user_id = assignedOwners;

        if (lead && lead.id) {
            params.Data.id = lead.id;
            params.Data.tags = '';
        }

        if (route?.params?.isDuplicate) {
            params.Data.id = '';
            params.Data.tags = '';
        }

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            console.log('Lead data: ', data);
            if (lead?.id && !route?.params?.isDuplicate) {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('lead.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                const leadsTemp = updateItemDetailToList('LEADS', lead, leads, indexSelected);
                                disPatch(setLeads(leadsTemp));
                                if (route?.params?.prevScene == 'LeadView') {
                                    navigation.replace('LeadView', { lead: data, prevScene: 'LeadForm' });
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
                    Toast.show(getLabel('common.msg_edit_error', { module: getLabel('lead.title').toLowerCase() }));
                }
            }
            else {
                if (parseInt(data.success) === 1) {
                    const newLead = {
                        id: data.id,
                        firstname: lead?.firstname || '',
                        lastname: lead?.lastname || '',
                        salutation: lead?.salutationtype || '',
                        company: lead?.company || '',
                        leadstatus: lead?.leadstatus || '',
                        mobile: lead?.mobile || '',
                        email: lead?.email || '',
                        address: lead?.lane || '',
                        starred: '0',
                        assigned_owners: ownerSelectedList,
                        full_name: (lead?.salutationtype ? (Global.getEnumLabel('Leads', 'salutationtype', lead?.salutationtype) + ' ') : '') + (lead?.lastname ? (lead?.lastname + ' ') : '') + (lead?.firstname || ''),
                        createdtime: new Date().toString()
                    }


                    Toast.show(
                        getLabel('common.msg_create_success', { module: getLabel('lead.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                const leadsTemp = addItemToList('LEADS', newLead, leads);
                                disPatch(setLeads(leadsTemp));
                                if (route?.params?.prevScene == 'LeadView') {
                                    navigation.replace('LeadView', { lead: data, prevScene: 'LeadForm' });
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
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('lead.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
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

    // Render UI
    return (
        <>
            <Header
            >
                {/* <Left>
                    <TouchableHighlight
                        activeOpacity={0.2}
                        underlayColor={Colors.white.white2}
                        style={{
                            marginLeft: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4
                        }}
                        onPress={() => {
                            Keyboard.dismiss();
                            goBack();
                        }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LText>
                    </TouchableHighlight>
                </Left> */}
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_leads')}</Title>
                </Body>
                {/* <Right>
                    <IconRight
                        onPress={() => { Keyboard.dismiss(); saveLead() }}
                        style={{
                            marginRight: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4
                        }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_save')}</LText>
                    </IconRight>
                </Right> */}
            </Header>
            {
                metaData?.field_list ? (
                    <>
                        <Content
                            style={{ backgroundColor: Colors.white.white1 }}>

                            {
                                !showAllFields ?
                                    (
                                        <>
                                            <Box width={widthResponse} paddingHorizontal='l' flexDirection='row' alignItems='flex-end'>
                                                <ModalSelect
                                                    maxWidth={70}
                                                    options={Global.getEnum('Leads', 'salutationtype')}
                                                    value={
                                                        lead?.salutationtype ? {
                                                            key: lead?.salutationtype,
                                                            label: Global.getEnumLabel('Leads', 'salutationtype', lead?.salutationtype)
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
                                                    value={lead?.lastname || ''}
                                                    onValueChange={(value) => onValueChange('lastname', value)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                                <InputItem
                                                    style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                    isEdit={true}
                                                    title={metaData?.field_list?.firstname?.label}
                                                    required={metaData?.field_list?.firstname?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.firstname || ''}
                                                    onValueChange={(value) => onValueChange('firstname', value)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.company?.label}
                                                required={metaData?.field_list?.company?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={lead?.company || ''}
                                                onValueChange={(value) => onValueChange('company', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.mobile?.label}
                                                required={metaData?.field_list?.mobile?.required}
                                                keyboardType='numeric'
                                                inputStyle={{ fontSize: 14 }}
                                                value={lead?.mobile || ''}
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
                                                value={lead?.email || ''}
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
                                                        {getLabel('common.btn_show_all_fields')}
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
                                            {/* ----------------------------- Thông tin liên hệ  ----------------------------- */}
                                            <>
                                                {/* Ten */}
                                                <Box width={widthResponse} paddingHorizontal='l' flexDirection='row' alignItems='flex-end'>
                                                    <ModalSelect
                                                        maxWidth={70}
                                                        options={Global.getEnum('Leads', 'salutationtype')}
                                                        value={
                                                            lead?.salutationtype ? {
                                                                key: lead?.salutationtype,
                                                                label: Global.getEnumLabel('Leads', 'salutationtype', lead?.salutationtype)
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
                                                        value={lead?.lastname || ''}
                                                        onValueChange={(value) => onValueChange('lastname', value)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                    <InputItem
                                                        style={{ paddingHorizontal: 0, paddingTop: 22 }}
                                                        isEdit={true}
                                                        title={metaData?.field_list?.firstname?.label}
                                                        required={metaData?.field_list?.firstname?.required}
                                                        inputStyle={{ fontSize: 14 }}
                                                        value={lead?.firstname || ''}
                                                        onValueChange={(value) => onValueChange('firstname', value)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Công ty */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.company?.label}
                                                    required={metaData?.field_list?.company?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.company || ''}
                                                    onValueChange={(value) => onValueChange('company', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tên thường gọi */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.designation?.label}
                                                    required={metaData?.field_list?.designation?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.designation || ''}
                                                    onValueChange={(value) => onValueChange('designation', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Điện thoại bàn */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.phone?.label}
                                                    required={metaData?.field_list?.phone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.phone || ''}
                                                    onValueChange={(value) => onValueChange('phone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Nguồn */}
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.leadsource?.label}
                                                        required={metaData?.field_list?.leadsource?.required}
                                                        options={Global.getEnum('Leads', 'leadsource')}
                                                        value={
                                                            lead?.leadsource ? {
                                                                key: lead?.leadsource,
                                                                label: Global.getEnumLabel('Leads', 'leadsource', lead?.leadsource)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('leadsource', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Di động  */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.mobile?.label}
                                                    required={metaData?.field_list?.mobile?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    keyboardType='numeric'
                                                    value={lead?.mobile || ''}
                                                    onValueChange={(value) => onValueChange('mobile', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Ngành nghề */}
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.industry?.label}
                                                        required={metaData?.field_list?.industry?.required}
                                                        options={Global.getEnum('Leads', 'industry')}
                                                        value={
                                                            lead?.industry ? {
                                                                key: lead?.industry,
                                                                label: Global.getEnumLabel('Leads', 'industry', lead?.industry)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('industry', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Fax */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.fax?.label}
                                                    required={metaData?.field_list?.fax?.required}
                                                    keyboardType='number-pad'
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.fax || ''}
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
                                                    value={lead?.email || ''}
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
                                                    value={lead?.secondaryemail || ''}
                                                    onValueChange={(value) => onValueChange('secondaryemail', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Doanh thu hàng năm */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.annualrevenue?.label}
                                                    required={metaData?.field_list?.annualrevenue?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    keyboardType='numeric'
                                                    inputType='currency'
                                                    value={Global.formatNumberForm(lead?.annualrevenue || 0)}
                                                    onValueChange={(value) => onValueChange('annualrevenue', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Số nhân viên */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.noofemployees?.label}
                                                    required={metaData?.field_list?.noofemployees?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    keyboardType='numeric'
                                                    inputType='currency'
                                                    value={Global.formatNumberForm(lead?.noofemployees || 0)}
                                                    onValueChange={(value) => onValueChange('noofemployees', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Website */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.website?.label}
                                                    required={metaData?.field_list?.website?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.website || ''}
                                                    onValueChange={(value) => onValueChange('website', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tình trạng */}
                                                <SpaceS />
                                                <Box paddingHorizontal='l' row paddingVertical='s' flexDirection='row'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.leadstatus?.label}
                                                        required={metaData?.field_list?.leadstatus?.required}
                                                        initPositionSelect={3}
                                                        options={Global.getEnum('Leads', 'leadstatus')}
                                                        value={
                                                            lead?.leadstatus ? {
                                                                key: lead?.leadstatus,
                                                                label: Global.getEnumLabel('Leads', 'leadstatus', lead?.leadstatus)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('leadstatus', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />

                                                </Box>

                                                {/* Đánh giá */}
                                                <SpaceS />
                                                <Box paddingHorizontal='l' row paddingVertical='s' flexDirection='row'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.rating?.label}
                                                        required={metaData?.field_list?.rating?.required}
                                                        initPositionSelect={3}
                                                        options={Global.getEnum('Leads', 'rating')}
                                                        value={
                                                            lead?.rating ? {
                                                                key: lead?.rating,
                                                                label: Global.getEnumLabel('Leads', 'rating', lead?.rating)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('rating', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />

                                                </Box>

                                                {/* Từ chối nhận email */}
                                                <Box paddingHorizontal='l' paddingTop='l'>

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
                                                            value={lead?.emailoptout == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('emailoptout', value ? 1 : 0)}
                                                        />
                                                    </Box>

                                                </Box>

                                            </>
                                            {/* ----------------------------- Thông tin liên hệ  ----------------------------- */}

                                            {/* ----------------------------- Thông tin địa chỉ  ----------------------------- */}
                                            <>
                                                {/* Địa chỉ */}

                                                <GooglePlaceAutoComplete
                                                    title={metaData?.field_list?.lane?.label}
                                                    required={metaData?.field_list?.lane?.required}
                                                    value={lead?.lane || ''}
                                                    onChangeText={(value) => {
                                                        let tmpLead = { ...lead };
                                                        tmpLead.lane = value;
                                                        setLead(tmpLead);
                                                    }}
                                                    selectedChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        tmpLead.lane = value.address;
                                                        tmpLead.state = value.state;
                                                        tmpLead.city = value.city;
                                                        tmpLead.country = value.country;
                                                        tmpLead.longitude = value.longitude;
                                                        tmpLead.latitude = value.latitude;
                                                        setLead(tmpLead);
                                                    }}
                                                />

                                                {/* Vùng, Miền */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.pobox?.label}
                                                    required={metaData?.field_list?.pobox?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.pobox || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        if (value[0] == ' ') {
                                                            tmpLead.pobox = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpLead.pobox = value;
                                                        }
                                                        setLead(tmpLead);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quận/Huyện */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.state?.label}
                                                    required={metaData?.field_list?.state?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.state || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        if (value[0] == ' ') {
                                                            tmpLead.state = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpLead.state = value;
                                                        }

                                                        tmpLead.longitude = '';
                                                        tmpLead.latitude = '';
                                                        setLead(tmpLead);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tỉnh/ TP */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.city?.label}
                                                    required={metaData?.field_list?.city?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.city || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        if (value[0] == ' ') {
                                                            tmpLead.city = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpLead.city = value;
                                                        }
                                                        tmpLead.longitude = '';
                                                        tmpLead.latitude = '';
                                                        setLead(tmpLead);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mã vùng */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.code?.label}
                                                    required={metaData?.field_list?.code?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.code || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        if (value[0] == ' ') {
                                                            tmpLead.code = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpLead.code = value;
                                                        }
                                                        setLead(tmpLead);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quốc gia */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.country?.label}
                                                    required={metaData?.field_list?.country?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={lead?.country || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpLead = { ...lead };
                                                        if (value[0] == ' ') {
                                                            tmpLead.country = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpLead.country = value;
                                                        }
                                                        tmpLead.longitude = '';
                                                        tmpLead.latitude = '';
                                                        setLead(tmpLead);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </>
                                            {/* ----------------------------- Thông tin địa chỉ  ----------------------------- */}

                                            {/* ----------------------------- Thông tin mô tả  ----------------------------- */}
                                            <>
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.description?.label}
                                                    required={metaData?.field_list?.description?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    isMultiline={true}
                                                    selectTextOnFocus={false}
                                                    value={lead?.description || ''}
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
                                        onPress={() => { Keyboard.dismiss(); saveLead() }}
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

export default LeadForm;


