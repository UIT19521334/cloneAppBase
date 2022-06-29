import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { InteractionManager, Modal, TextInput, TouchableOpacity, View } from 'react-native'
import { BackHandler, Keyboard, StyleSheet, TouchableHighlight } from 'react-native'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { Body, BoxButton, ButtonIconView, Content, Header, IconRight, InputItem, Left, LText, NText, Right, SpaceHM, SpaceHS, SpaceL, SpaceM, SpaceS, Title } from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getLabel, heightDevice, isIphoneX, widthDevice, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles';
import HTML from 'react-native-render-html';
import { CKEditorModal, CKEditorModalRef } from '../../../components/CkEditor'
import { Input } from 'native-base'
import MultipleEmailInput from '../../../components/MultipleEmailInput'

const isHtmlString = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);


const SessionView = ({ children, title }: { children: React.ReactElement, title: string }) => {
    return (
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
                    <Text allowFontScaling={true} variant='headerSection' >{title || ''}</Text>
                </Box>
                {/* Header section */}
                {children}
            </Box>
        </>
    )
}


export default function TicketForm({ route, navigation }) {

    const [ownerSelectedList, setOwnerSelectedList] = React.useState([
        {
            id: 'Users:' + Global.user?.id,
            name: Global.getUser(Global.user?.id)?.full_name,
            email: Global.getUser(Global.user?.id)?.email1,
            type: 'user'
        }
    ]);

    const [ownerOrder, setOwnerOrder] = React.useState([0]);
    const [showAllFields, setShowAllFields] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [ticket, setTicket] = useState(
        route?.params?.ticket
            ? route.params.ticket
            : {
            }
    );
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);
    const [interactionsComplete, setInteractionsComplete] = useState(false);
    const [isCreate, setCreate] = useState(false);
    const ckEditorDescriptionRef = useRef<CKEditorModalRef>(null);

    const disPatch = useDispatch();

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
        if (route?.params?.prevScene == 'RelatedList') {
            console.log(route?.params);
            let tmpTicket = { ...ticket };
            let fieldKeyValue = '';
            let fieldName = route?.params.fieldRelated?.replace('id', 'name');
            let fieldNameValue = '';
            switch (route?.params.fieldRelated) {
                case 'parent_id':
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'contact_id':
                    fieldKeyValue = route?.params?.data?.contactid;
                    fieldNameValue = route?.params?.data?.fullname;
                    if (route?.params?.data?.accountid && route?.params?.data?.accountid != 0) {
                        tmpTicket['parent_id'] = route?.params?.data?.accountid;
                        tmpTicket['parent_name'] = route?.params?.data?.accountname;
                    }

                    break;
                case 'product_id':
                    fieldKeyValue = route?.params?.data?.productid;
                    fieldNameValue = route?.params?.data?.productname;
                    break;
                case 'service_id':
                    fieldKeyValue = route?.params?.data?.serviceid;
                    fieldNameValue = route?.params?.data?.servicename;
                    break;
                case 'related_lead':
                    fieldName = 'related_lead_name'
                    fieldKeyValue = route?.params?.data?.leadid;
                    fieldNameValue = route?.params?.data?.fullname;
                    break;
                case 'related_campaign':
                    fieldName = 'related_campaign_name'
                    fieldKeyValue = route?.params?.data?.campaignid;
                    fieldNameValue = route?.params?.data?.campaignname;
                    break;

                default:
                    break;
            }

            tmpTicket[route?.params?.fieldRelated] = fieldKeyValue;
            tmpTicket[fieldName] = fieldNameValue;
            setTicket(tmpTicket);
        }
    }, [route.params])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            if (!loaded) {
                if (route?.params?.prevScene == 'TicketList' && (ticket?.ticketid || ticket?.id)) {
                    getDataRecord();
                }
                else {
                    setLoading(true);
                    Global.getModuleMetaData('HelpDesk', metaData => {
                        if (ticket?.id) {
                            let selectedList = Global.formatAssignedOwnersArray(ticket?.assigned_owners, ticket?.main_owner_id);
                            setOwnerSelectedList(selectedList);
                            setOwnerOrder(Object.keys(selectedList));
                        }
                        else {
                            const enumTicketStatus = Global.getEnum('HelpDesk', 'ticketstatus') || [];
                            const indexStatusOpen = enumTicketStatus?.findIndex((item) => item?.key == 'Open');

                            onValueChange('ticketstatus', enumTicketStatus[indexStatusOpen != -1 ? indexStatusOpen : 1]?.key);
                            setCreate(true);
                        }
                        setMetaData(metaData);
                        setLoading(false);
                        setLoaded(true);
                    },
                        error => {
                            Toast.show(getLabel('common.msg_connection_error'));
                        });
                }
            }
        });

        return unsubscribe;
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
                        if (route?.params?.prevScene == Global.getTicketViewLabel()) {
                            navigation.replace(Global.getTicketViewLabel(), {
                                ticket: ticket,
                                prevScene: Global.getTicketFormLabel(),
                                indexSelected: route?.params?.indexSelected,
                                onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                onDeleteItemSelected: route?.params?.onDeleteItemSelected
                            });
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
        let tmpTicket = { ...ticket };
        tmpTicket[field] = value;
        setTicket(tmpTicket);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetTicket',
            Params: {
                id: ticket?.ticketid || ticket?.id,
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
                setTicket(data.data);
                setMetaData(data.metadata);
                setLoading(false);
                setLoaded(true)
            }
            else {
                setLoading(false);
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('ticket.title') }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    // Create/Edit ticket
    const saveTicket = () => {
        Keyboard.dismiss();
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, ticket, [], 'HelpDesk');
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
            RequestAction: 'SaveTicket',
            Data: ticket
        };

        params.Data.assigned_user_id = assignedOwners;

        if (ticket && ticket.id) {
            params.Data.id = ticket.id;
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
            if (ticket?.id && !route?.params?.isDuplicate) {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('ticket.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == Global.getTicketViewLabel() || route?.params?.parentScene == Global.getTicketViewLabel()) {
                                    navigation.replace(Global.getTicketViewLabel(), {
                                        ticket: data,
                                        prevScene: Global.getTicketFormLabel(),
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'TicketList' || route?.params?.parentScene == 'TicketList') {
                                    route?.params?.onUpdateItemSelected?.(parseInt(route?.params?.indexSelected || 0) >= 0 ? parseInt(route?.params?.indexSelected || 0) : -1, ticket);
                                    navigation.goBack();
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
                    Toast.show(getLabel('common.msg_edit_error', { module: getLabel('ticket.title').toLowerCase() }));
                }
            }
            else {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_create_success', { module: getLabel('ticket.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == Global.getTicketViewLabel() || route?.params?.parentScene == Global.getTicketViewLabel()) {
                                    navigation.replace(Global.getTicketViewLabel(), {
                                        ticket: data,
                                        prevScene: Global.getTicketFormLabel(),
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'TicketList' || route?.params?.parentScene == 'TicketList') {
                                    const newTicket = {
                                        ...params.Data,
                                        ticketid: data.id,
                                        id: data.id,
                                        createdtime: new Date(),
                                        assigned_owners: ownerSelectedList
                                    }
                                    route?.params?.onCreateNew?.(newTicket);
                                    navigation.goBack();
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
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('ticket.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const onClearRelated = (fieldKey, fieldValue) => {
        let tmpTicket = { ...ticket };
        tmpTicket[fieldKey] = '';
        tmpTicket[fieldValue] = '';
        setTicket(tmpTicket);
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
                <Left>
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
                            goBack();
                        }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LText>
                    </TouchableHighlight>
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_tickets')}</Title>
                </Body>
                <Right>
                    <IconRight
                        onPress={() => { saveTicket() }}
                        style={{
                            marginRight: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 4
                        }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_save')}</LText>
                    </IconRight>
                </Right>
            </Header>
            {
                metaData?.field_list ? (
                    <Content style={{ backgroundColor: Colors.white.white2 }}>

                        <TransitionView>
                            {/* ----------------------------- Thông tin Ticket  ----------------------------- */}
                            <SessionView
                                title={getLabel('ticket.title_ticket_information')}
                            >
                                <>
                                    {/* Tiêu đề */}
                                    <Box minHeight={64}>
                                        <InputItem
                                            isEdit={true}
                                            stacked={true}
                                            title={metaData?.field_list?.ticket_title?.label}
                                            inputStyle={{ fontSize: 14, width: widthDevice - 24, minHeight: 44 }}
                                            groupInputStyle={{
                                                justifyContent: 'flex-start',
                                                alignItems: 'flex-start'
                                            }}
                                            required={metaData?.field_list?.ticket_title?.required}
                                            value={ticket?.ticket_title || ''}
                                            onValueChange={(value) => onValueChange('ticket_title', value)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>

                                    {/* Danh mục */}
                                    <SpaceM />
                                    <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                        <ModalSelect
                                            title={metaData?.field_list?.ticketcategories?.label}
                                            required={metaData?.field_list?.ticketcategories?.required}
                                            options={Global.getEnum('HelpDesk', 'ticketcategories')}
                                            value={
                                                ticket?.ticketcategories ? {
                                                    key: ticket?.ticketcategories,
                                                    label: Global.getEnumLabel('HelpDesk', 'ticketcategories', ticket?.ticketcategories)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('ticketcategories', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>

                                    {/* nhom khach hang va muc do uu tien */}
                                    <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                        {/* Tình trạng */}
                                        <ModalSelect
                                            flex={1}
                                            title={metaData?.field_list?.ticketstatus?.label}
                                            required={metaData?.field_list?.ticketstatus?.required}
                                            options={Global.getEnum('HelpDesk', 'ticketstatus')}
                                            disabled={isCreate}
                                            value={
                                                ticket?.ticketstatus ? {
                                                    key: ticket?.ticketstatus,
                                                    label: Global.getEnumLabel('HelpDesk', 'ticketstatus', ticket?.ticketstatus)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('ticketstatus', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                        <SpaceHS />
                                        <ModalSelect
                                            flex={1}
                                            title={metaData?.field_list?.ticketpriorities?.label}
                                            required={metaData?.field_list?.ticketpriorities?.required}
                                            options={Global.getEnum('HelpDesk', 'ticketpriorities')}
                                            value={
                                                ticket?.ticketpriorities ? {
                                                    key: ticket?.ticketpriorities,
                                                    label: Global.getEnumLabel('HelpDesk', 'ticketpriorities', ticket?.ticketpriorities)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('ticketpriorities', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>

                                    {/* Sản phẩm */}
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                            {metaData?.field_list?.product_id?.label}
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
                                                    {ticket?.product_name || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.product_id && ticket.product_id != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('product_id', 'product_name') }}>
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Products',
                                                            fieldRelated: 'product_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Products',
                                                            fieldRelated: 'product_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    // navigation.navigate('RelatedModal', { module: 'Products', fieldRelated: 'product_id', preScreen: Global.getTicketFormLabel() });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>

                                    {/* Dịch vụ */}
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                            {metaData?.field_list?.service_id?.label}
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
                                                    {ticket?.service_name || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.service_id && ticket.service_id != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('service_id', 'service_name') }}>
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Services',
                                                            fieldRelated: 'service_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Services',
                                                            fieldRelated: 'service_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    // navigation.navigate('RelatedModal', { module: 'Services', fieldRelated: 'service_id', preScreen: Global.getTicketFormLabel() });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>

                                    {/* Chien dich */}
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                            {metaData?.field_list?.related_campaign?.label}
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
                                                    {ticket?.related_campaign_name || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.related_campaign && ticket.related_campaign != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('related_campaign', 'related_campaign_name') }}>
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Campaigns',
                                                            fieldRelated: 'related_campaign',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Campaigns',
                                                            fieldRelated: 'related_campaign',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    // navigation.navigate('RelatedModal', { module: 'Services', fieldRelated: 'service_id', preScreen: Global.getTicketFormLabel() });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>

                                    {/* nguon 1 & nguon2 */}
                                    <SpaceS />
                                    <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                        <ModalSelect
                                            flex={1}
                                            title={metaData?.field_list?.leadsource?.label}
                                            required={metaData?.field_list?.leadsource?.required}
                                            options={Global.getEnum('HelpDesk', 'leadsource')}
                                            value={
                                                ticket?.leadsource ? {
                                                    key: ticket?.leadsource,
                                                    label: Global.getEnumLabel('HelpDesk', 'leadsource', ticket?.leadsource)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('leadsource', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                        <SpaceHS />
                                        <ModalSelect
                                            flex={1}
                                            title={metaData?.field_list?.leadsource_level_2?.label}
                                            required={metaData?.field_list?.leadsource_level_2?.required}
                                            options={Global.getEnum('HelpDesk', 'leadsource_level_2')}
                                            value={
                                                ticket?.leadsource_level_2 ? {
                                                    key: ticket?.leadsource_level_2,
                                                    label: Global.getEnumLabel('HelpDesk', 'leadsource_level_2', ticket?.leadsource_level_2)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('leadsource_level_2', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>


                                </>

                            </SessionView>

                            <SessionView
                                title={getLabel('ticket.title_contact_information')}
                            >
                                <>
                                    <SpaceS />
                                    <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                        <ModalSelect

                                            title={metaData?.field_list?.helpdesk_customer_type?.label}
                                            required={metaData?.field_list?.helpdesk_customer_type?.required}
                                            options={Global.getEnum('HelpDesk', 'helpdesk_customer_type')}
                                            value={
                                                ticket?.helpdesk_customer_type ? {
                                                    key: ticket?.helpdesk_customer_type,
                                                    label: Global.getEnumLabel('HelpDesk', 'helpdesk_customer_type', ticket?.helpdesk_customer_type)
                                                } : {}
                                            }
                                            onSelected={(value) => onValueChange('helpdesk_customer_type', value.key)}
                                            isSubmitted={isSubmitForm}
                                        />
                                    </Box>

                                    {/* Lead */}
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                            {metaData?.field_list?.related_lead?.label}
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
                                                    {ticket?.related_lead_name?.trim() || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.related_lead && ticket.related_lead != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('related_lead', 'related_lead_name') }}>
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Leads',
                                                            fieldRelated: 'related_lead',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Leads',
                                                            fieldRelated: 'related_lead',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    // navigation.navigate('RelatedModal', { module: 'Products', fieldRelated: 'product_id', preScreen: Global.getTicketFormLabel() });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>
                                    {/* Người liên hệ */}
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
                                                    {ticket?.contact_name || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.contact_id && ticket.contact_id != 0 ? (
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Contacts',
                                                            fieldRelated: 'contact_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            keyword: ticket?.parent_name ? ticket?.parent_name : '',
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Contacts',
                                                            fieldRelated: 'contact_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            keyword: ticket?.parent_name ? ticket?.parent_name : '',
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }

                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>

                                    {/* Công ty */}
                                    <SpaceS />
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='m'
                                    >
                                        <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                            {metaData?.field_list?.parent_id?.label}
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
                                                    {ticket?.parent_name || ''}
                                                </NText>
                                            </Box>
                                            {
                                                ticket.parent_id && ticket.parent_id != 0 ? (
                                                    <ButtonIconView onPress={() => { onClearRelated?.('parent_id', 'parent_name') }}>
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
                                                    if (route?.params?.preScreen == 'TicketList' || route?.params?.parentScene == 'OpportunityList') {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Accounts',
                                                            fieldRelated: 'parent_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: 'TicketList',
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }
                                                    else {
                                                        navigation.navigate('RelatedModal', {
                                                            module: 'Accounts',
                                                            fieldRelated: 'parent_id',
                                                            preScreen: Global.getTicketFormLabel(),
                                                            parentFrom: Global.getTicketViewLabel(),
                                                            indexSelected: route?.params?.indexSelected,
                                                            onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                        });
                                                    }

                                                    // navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'parent_id', preScreen: Global.getTicketFormLabel() });
                                                }}
                                            >
                                                <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                            </BoxButton>
                                        </Box>

                                    </Box>

                                    {/* Email */}
                                    <InputItem
                                        isEdit={true}
                                        stacked={true}
                                        title={metaData?.field_list?.contact_email?.label}
                                        inputStyle={{ fontSize: 14, width: widthDevice - 24 }}
                                        groupInputStyle={{
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                        required={metaData?.field_list?.contact_email?.required}
                                        value={ticket?.contact_email || ''}
                                        onValueChange={(value) => onValueChange('contact_email', value)}
                                        isSubmitted={isSubmitForm}
                                    />

                                    {/* mobile */}
                                    <InputItem
                                        isEdit={true}
                                        stacked={true}
                                        title={metaData?.field_list?.contact_mobile?.label}
                                        inputStyle={{ fontSize: 14, width: widthDevice - 24 }}
                                        groupInputStyle={{
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                        keyboardType='numeric'
                                        required={metaData?.field_list?.contact_mobile?.required}
                                        value={ticket?.contact_mobile || ''}
                                        onValueChange={(value) => onValueChange('contact_mobile', value)}
                                        isSubmitted={isSubmitForm}
                                    />


                                    {/* helpdesk_related_emails */}

                                    <MultipleEmailInput
                                        label={metaData?.field_list?.helpdesk_related_emails?.label}
                                        required={metaData?.field_list?.helpdesk_related_emails?.required}
                                        value={ticket?.helpdesk_related_emails || ''}
                                        onValueChange={(value) => onValueChange('helpdesk_related_emails', value)}
                                        isSubmitted={isSubmitForm}
                                    />
                                    {/* <InputItem
                                        isEdit={true}
                                        stacked={true}
                                        title={metaData?.field_list?.helpdesk_related_emails?.label}
                                        inputStyle={{ fontSize: 14, width: widthDevice - 24 }}
                                        isMultiline={true}
                                        groupInputStyle={{
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                        required={metaData?.field_list?.helpdesk_related_emails?.required}
                                        value={ticket?.helpdesk_related_emails || ''}
                                        onValueChange={(value) => onValueChange('helpdesk_related_emails', value)}
                                        isSubmitted={isSubmitForm}
                                    /> */}


                                </>
                            </SessionView>

                            <SessionView
                                title={getLabel('ticket.title_description_information')}
                            >
                                <Box minHeight={160}>
                                    <InputItem
                                        stacked={true}
                                        isEdit={true}
                                        title={metaData?.field_list?.description?.label}
                                        required={metaData?.field_list?.description?.required}
                                        inputStyle={{ fontSize: 14, width: widthDevice - 24, minHeight: 120 }}
                                        groupInputStyle={{
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                        isMultiline={true}
                                        selectTextOnFocus={false}
                                        value={ticket?.description || ''}
                                        onValueChange={(value) => onValueChange('description', value)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                            </SessionView>

                            <SessionView
                                title={getLabel('ticket.title_resolution_information')}
                            >
                                <Box minHeight={160}>
                                    <InputItem
                                        stacked={true}
                                        isEdit={true}
                                        title={metaData?.field_list?.solution?.label}
                                        required={metaData?.field_list?.solution?.required}
                                        inputStyle={{ fontSize: 14, width: widthDevice - 24, minHeight: 120 }}
                                        groupInputStyle={{
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start'
                                        }}
                                        isMultiline={true}
                                        selectTextOnFocus={false}
                                        value={ticket?.solution || ''}
                                        onValueChange={(value) => onValueChange('solution', value)}
                                        isSubmitted={isSubmitForm}
                                    />
                                </Box>
                            </SessionView>

                            <SessionView
                                title={getLabel('ticket.title_management_information')}
                            >
                                <>
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
                                </>
                            </SessionView>
                            {/* Số giờ xử lý */}
                            {/* <InputItem
                                    isEdit={true}
                                    title={metaData?.field_list?.hours?.label}
                                    required={metaData?.field_list?.hours?.required}
                                    inputStyle={{ fontSize: 14 }}
                                    keyboardType={'numeric'}
                                    value={ticket?.hours || ''}
                                    onValueChange={(value) => onValueChange('hours', value)}
                                    isSubmitted={isSubmitForm}
                                /> */}

                            {/* Số ngày xử lý */}
                            {/* <InputItem
                                    isEdit={true}
                                    title={metaData?.field_list?.days?.label}
                                    required={metaData?.field_list?.days?.required}
                                    inputStyle={{ fontSize: 14 }}
                                    keyboardType={'numeric'}
                                    value={ticket?.days || ''}
                                    onValueChange={(value) => onValueChange('days', value)}
                                    isSubmitted={isSubmitForm}
                                /> */}

                        </TransitionView>
                        <SpaceL />
                    </Content>

                ) : (
                    <Content style={{ backgroundColor: Colors.white.white1 }} />
                )
            }
            <IndicatorLoading loading={loading} />
        </>
    )
}