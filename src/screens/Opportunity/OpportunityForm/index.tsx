// Import libraries
import React, { useEffect, useState } from 'react'
import { BackHandler, InteractionManager, Keyboard, StyleSheet, TouchableOpacity } from 'react-native'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
// Import components
import { Body, BoxButton, ButtonIconView, Content, Header, InputItem, NText, SpaceHM, SpaceHS, SpaceL, SpaceS, Title } from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import RNDatePicker from '../../../components/RNDatePicker'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles'

export default function OpportunityForm({ navigation, route }) {

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
    const [loaded, setLoaded] = useState(false);
    const [metaData, setMetaData] = useState({});
    const [opportunity, setOpportunity] = useState(
        route?.params?.opportunity
            ? route.params.opportunity
            : {}
    );
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);

    const disPatch = useDispatch();
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
        if (route?.params?.prevScene == 'RelatedList') {
            let tmpOpportunity = { ...opportunity };
            let fieldKeyValue = '';
            let fieldName = '';
            if (route?.params?.fieldRelated?.search('id') != -1) {
                fieldName = route?.params.fieldRelated?.replace('id', 'name');
            }
            else {
                fieldName = route?.params.fieldRelated + '_name';
            }

            let fieldNameValue = '';
            switch (route?.params.fieldRelated) {
                case 'related_to':
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'contact_id':
                    fieldKeyValue = route?.params?.data?.contactid;
                    fieldNameValue = route?.params?.data?.fullname;
                    if (route?.params?.data?.accountid && route?.params?.data?.accountid != 0) {
                        tmpOpportunity['related_to'] = route?.params?.data?.accountid;
                        tmpOpportunity['related_to_name'] = route?.params?.data?.accountname;
                    }
                    break;
                case 'related_campaign':
                    fieldKeyValue = route?.params?.data?.campaignid;
                    fieldNameValue = route?.params?.data?.campaignname;
                    break;

                default:
                    break;
            }

            tmpOpportunity[route?.params?.fieldRelated] = fieldKeyValue;
            tmpOpportunity[fieldName] = fieldNameValue;
            setOpportunity(tmpOpportunity);
        }
    }, [route.params])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            if (!loaded) {
                if (route?.params?.prevScene == 'OpportunityList' && (opportunity?.potentialid || opportunity?.id)) {
                    getDataRecord();
                }
                else {
                    setLoading(true);
                    Global.getModuleMetaData('Potentials', metaData => {
                        if (opportunity?.id) {
                            let selectedList = Global.formatAssignedOwnersArray(opportunity?.assigned_owners, opportunity?.main_owner_id);
                            setOwnerSelectedList(selectedList);
                            setOwnerOrder(Object.keys(selectedList));
                            opportunity.closingdate = opportunity.closingdate ? new Date(`${opportunity.closingdate}`) : new Date();
                        }
                        else {
                            opportunity.closingdate = null;
                            opportunity.sales_stage = opportunity.sal ? opportunity.sal : 'Prospecting';
                            opportunity.probability = opportunity.probability ? opportunity.probability : Global.getProbabilityFromSalesStage('Prospecting');
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
                        if (route?.params?.prevScene == 'OpportunityView') {
                            navigation.replace('OpportunityView',
                                {
                                    opportunity: opportunity,
                                    prevScene: 'OpportunityForm',
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
        disPatch(showAlert?.(params))
    }

    // Set value when change
    const onValueChange = (field, value) => {
        let tmpOpportunity = { ...opportunity };
        tmpOpportunity[field] = value;
        setOpportunity(tmpOpportunity);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetOpportunity',
            Params: {
                id: opportunity?.potentialid || opportunity?.id,
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
                let tmpOpportunity = { ...data.data };
                let selectedList = Global.formatAssignedOwnersArray(data.data?.assigned_owners, data.data?.main_owner_id);
                setOwnerSelectedList(selectedList);
                setOwnerOrder(Object.keys(selectedList));
                tmpOpportunity.closingdate = tmpOpportunity.closingdate ? new Date(`${tmpOpportunity.closingdate}`) : null;
                setOpportunity(tmpOpportunity);
                setMetaData(data.metadata);
                setLoading(false);
                setLoaded(true)
            }
            else {
                setLoading(false);
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('opportunity.title') }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    // Create/Edit opp
    const saveOpportunity = () => {
        Keyboard.dismiss();
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, opportunity, [], 'Potentials');
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

        if (opportunity?.email) {
            if (!Global.validateEmail(opportunity?.email)) {
                Toast.show(getLabel('common.msg_email_invalid'));
                return;
            }
        }

        if (opportunity?.secondaryemail) {
            if (!Global.validateEmail(opportunity?.secondaryemail)) {
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
            RequestAction: 'SaveOpportunity',
            Data: { ...opportunity }
        };

        if (opportunity.closingdate) {
            params.Data.closingdate = Global.formatDate(opportunity.closingdate); // Format date allow user format
        }

        params.Data.assigned_user_id = assignedOwners;

        if (opportunity && opportunity.id) {
            params.Data.id = opportunity.id;
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
            if (opportunity?.id && !route?.params?.isDuplicate) {
                if (parseInt(data.success) === 1) {
                    console.log('Route params data: ', route.params);
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('opportunity.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == 'OpportunityView' || route?.params?.parentScene == 'OpportunityView') {
                                    navigation.replace('OpportunityView', {
                                        opportunity: data,
                                        prevScene: 'OpportunityForm',
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'OpportunityList' || route?.params?.parentScene == 'OpportunityList') {
                                    route?.params?.onUpdateItemSelected?.(parseInt(route?.params?.indexSelected || 0) >= 0 ? parseInt(route?.params?.indexSelected || 0) : -1, opportunity);
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
                    Toast.show(getLabel('common.msg_edit_error', { module: getLabel('opportunity.title').toLowerCase() }));
                }
            }
            else {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_create_success', { module: getLabel('opportunity.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                console.log('Params Data: ', route?.params);
                                if (route?.params?.prevScene == 'OpportunityView' || route?.params?.parentScene == 'OpportunityView') {
                                    navigation.replace('OpportunityView', {
                                        opportunity: data,
                                        prevScene: 'OpportunityForm',
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'OpportunityList' || route?.params?.parentScene == 'OpportunityList') {
                                    const newOpp = {
                                        ...params.Data,
                                        potentialid: data.id,
                                        id: data.id,
                                        createdtime: new Date(),
                                        assigned_owners: ownerSelectedList
                                    }
                                    route?.params?.onCreateNew?.(newOpp);
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
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('opportunity.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const onClearRelated = (fieldKey, fieldValue) => {
        let tmpOpportunity = { ...opportunity };
        tmpOpportunity[fieldKey] = '';
        tmpOpportunity[fieldValue] = '';
        setOpportunity(tmpOpportunity);
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
                    <Title allowFontScaling={true} >{getLabel('common.title_opportunities')}</Title>
                </Body>
            </Header>

            {
                metaData?.field_list ? (
                    <>
                    <Content style={{ backgroundColor: Colors.white.white1 }} contentOffset={0}>
                        {
                            !showAllFields ?
                                (
                                    <>
                                        <InputItem
                                            isEdit={true}
                                            title={metaData?.field_list?.potentialname?.label}
                                            required={metaData?.field_list?.potentialname?.required}
                                            inputStyle={{ fontSize: 14 }}
                                            value={opportunity?.potentialname || ''}
                                            onValueChange={(value) => onValueChange('potentialname', value)}
                                            isSubmitted={isSubmitForm}
                                        />

                                        {/* Công ty  */}
                                        <SpaceS />
                                        <Box
                                            paddingHorizontal='l'
                                            paddingVertical='l'
                                        >
                                            <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                {metaData?.field_list?.related_to?.label}
                                            </NText>
                                            <Box
                                                borderBottomWidth={StyleSheet.hairlineWidth}
                                                borderBottomColor='black3'
                                                flexDirection='row'
                                                height={40}
                                                alignItems='center'
                                            >
                                                <Box flex={1} paddingHorizontal='m'>
                                                    <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                        {opportunity?.related_to_name || ''}
                                                    </NText>
                                                </Box>
                                                {
                                                    opportunity.related_to && opportunity.related_to != 0 ? (
                                                        <ButtonIconView onPress={() => { onClearRelated?.('related_to', 'related_to_name') }}>
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
                                                        if (route?.params?.prevScene == 'OpportunityList' || route?.params?.parentScene == 'OpportunityList') {
                                                            navigation.navigate('RelatedModal', {
                                                                module: 'Accounts',
                                                                fieldRelated: 'related_to',
                                                                prevScene: 'OpportunityForm',
                                                                parentFrom: 'OpportunityList',
                                                                indexSelected: route?.params?.indexSelected,
                                                                onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                                                                onCreateNew: route?.params?.onCreateNew
                                                            });
                                                        }
                                                        else {
                                                            navigation.navigate('RelatedModal', {
                                                                module: 'Accounts',
                                                                fieldRelated: 'related_to',
                                                                prevScene: 'OpportunityForm',
                                                                parentFrom: 'OpportunityView',
                                                                indexSelected: route?.params?.indexSelected,
                                                                onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                                                                onCreateNew: route?.params?.onCreateNew
                                                            });
                                                        }

                                                    }}
                                                >
                                                    <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                </BoxButton>
                                            </Box>

                                        </Box>

                                        <InputItem
                                            isEdit={true}
                                            keyboardType='numeric'
                                            title={metaData?.field_list?.amount?.label}
                                            required={metaData?.field_list?.amount?.required}
                                            inputStyle={{ fontSize: 14 }}
                                            inputType='currency'
                                            value={Global.formatNumberForm(opportunity?.amount || 0).toString()}
                                            onValueChange={(value) =>{console.log('amount', value);
                                             onValueChange('amount', value)}}
                                            isSubmitted={isSubmitForm}
                                        />
                                        <SpaceS />
                                        {/* Ngày chốt dự kiến' */}
                                        <Box
                                            paddingHorizontal='l'
                                            paddingVertical='m'
                                        >
                                            <RNDatePicker
                                                iconRight={getIcon('Calendar')}
                                                dateFormat={Global.user?.date_format?.toUpperCase()}
                                                title={metaData?.field_list?.closingdate?.label}
                                                required={metaData?.field_list?.closingdate?.required}
                                                currentDate={opportunity.closingdate}
                                                minDate={new Date()}
                                                selectedDate={(value) => {
                                                    onValueChange('closingdate', value || new Date())
                                                }}
                                                isSubmitted={isSubmitForm}
                                            />
                                        </Box>
                                        <SpaceS />
                                        {/* Bước bán hàng */}
                                        <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                            <ModalSelect
                                                style={{ flex: 1 }}
                                                title={metaData?.field_list?.sales_stage?.label}
                                                required={metaData?.field_list?.sales_stage?.required}
                                                options={Global.getEnum('Potentials', 'sales_stage')}
                                                value={
                                                    opportunity?.sales_stage ? {
                                                        key: opportunity?.sales_stage,
                                                        label: Global.getEnumLabel('Potentials', 'sales_stage', opportunity?.sales_stage)
                                                    } : {}
                                                }
                                                onSelected={(value, index) => {
                                                    let probabilityValue = Global.getProbabilityFromSalesStage(value.key);
                                                    let tmpOpportunity = { ...opportunity };
                                                    tmpOpportunity['sales_stage'] = value.key;
                                                    tmpOpportunity['probability'] = probabilityValue;
                                                    setOpportunity(tmpOpportunity);
                                                }}
                                                isSubmitted={isSubmitForm}
                                            />
                                            <SpaceHS />
                                            {/* Tỉ lệ thành công */}
                                            <ModalSelect
                                                style={{ flex: 1 }}
                                                title={metaData?.field_list?.probability?.label}
                                                required={metaData?.field_list?.probability?.required}
                                                options={Global.getEnum('Potentials', 'probability')}
                                                value={
                                                    opportunity?.probability ? {
                                                        key: opportunity?.probability,
                                                        label: Global.getEnumLabel('Potentials', 'probability', opportunity?.probability)
                                                    } : {}
                                                }
                                                onSelected={(value, index) => {
                                                    onValueChange('probability', value.key)
                                                }}
                                                isSubmitted={isSubmitForm}
                                            />
                                        </Box>

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
                                        <>
                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.potentialname?.label}
                                                required={metaData?.field_list?.potentialname?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={opportunity?.potentialname || ''}
                                                onValueChange={(value) => onValueChange('potentialname', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            {/* Công ty  */}
                                            <SpaceS />
                                            <Box
                                                paddingHorizontal='l'
                                                paddingVertical='l'
                                            >
                                                <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                    {metaData?.field_list?.related_to?.label}
                                                </NText>
                                                <Box
                                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                                    borderBottomColor='black3'
                                                    flexDirection='row'
                                                    height={40}
                                                    alignItems='center'
                                                >
                                                    <Box flex={1} paddingHorizontal='m'>
                                                        <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                            {opportunity?.related_to_name || ''}
                                                        </NText>
                                                    </Box>
                                                    {
                                                        opportunity.related_to && opportunity.related_to != 0 ? (
                                                            <ButtonIconView onPress={() => { onClearRelated?.('related_to', 'related_to_name') }}>
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
                                                            if (route?.params?.prevScene == 'OpportunityList' || route?.params?.parentScene == 'OpportunityList') {
                                                                navigation.navigate('RelatedModal', {
                                                                    module: 'Accounts',
                                                                    fieldRelated: 'related_to',
                                                                    prevScene: 'OpportunityForm',
                                                                    parentFrom: 'OpportunityList',
                                                                    indexSelected: route?.params?.indexSelected,
                                                                    onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                    onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                                });
                                                            }
                                                            else {
                                                                navigation.navigate('RelatedModal', {
                                                                    module: 'Accounts',
                                                                    fieldRelated: 'related_to',
                                                                    prevScene: 'OpportunityForm',
                                                                    parentFrom: 'OpportunityView',
                                                                    indexSelected: route?.params?.indexSelected,
                                                                    onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                    onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                                });
                                                            }
                                                            // navigation.navigate('RelatedModal', {
                                                            //     module: 'Accounts',
                                                            //     fieldRelated: 'related_to',
                                                            //     prevScene: 'OpportunityForm',
                                                            //     parentFrom: route?.params?.prevScene,
                                                            //     indexSelected: route?.params?.indexSelected,
                                                            //     onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            //     onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                            // });
                                                        }}
                                                    >
                                                        <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                    </BoxButton>
                                                </Box>

                                            </Box>

                                            {/* Người liên hệ  */}
                                            <SpaceS />
                                            <Box
                                                paddingHorizontal='l'
                                                paddingVertical='l'
                                            >
                                                <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>
                                                    {metaData?.field_list?.contact_id?.label}
                                                </NText>
                                                <Box
                                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                                    borderBottomColor='black3'
                                                    flexDirection='row'
                                                    height={40}
                                                    alignItems='center'
                                                >
                                                    <Box flex={1} paddingHorizontal='m'>
                                                        <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>
                                                            {opportunity?.contact_name || ''}
                                                        </NText>
                                                    </Box>
                                                    {
                                                        opportunity.contact_id && opportunity.contact_id != 0 ? (
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
                                                            if (route?.params?.prevScene == 'OpportunityList' || route?.params?.parentScene == 'OpportunityList') {
                                                                navigation.navigate('RelatedModal', {
                                                                    module: 'Contacts',
                                                                    fieldRelated: 'contact_id',
                                                                    prevScene: 'OpportunityForm',
                                                                    keyword: opportunity?.related_to_name ? opportunity?.related_to_name : '',
                                                                    parentFrom: 'OpportunityList',
                                                                    indexSelected: route?.params?.indexSelected,
                                                                    onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                    onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                                });
                                                            }
                                                            else {
                                                                navigation.navigate('RelatedModal', {
                                                                    module: 'Contacts',
                                                                    fieldRelated: 'contact_id',
                                                                    prevScene: 'OpportunityForm',
                                                                    keyword: opportunity?.related_to_name ? opportunity?.related_to_name : '',
                                                                    parentFrom: 'OpportunityView',
                                                                    indexSelected: route?.params?.indexSelected,
                                                                    onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                                    onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                                });
                                                            }
                                                            // navigation.navigate('RelatedModal', {
                                                            //     module: 'Contacts',
                                                            //     fieldRelated: 'contact_id',
                                                            //     prevScene: 'OpportunityForm',
                                                            //     keyword: opportunity?.related_to_name ? opportunity?.related_to_name : '',
                                                            //     parentFrom: route?.params?.prevScene,
                                                            //     indexSelected: route?.params?.indexSelected,
                                                            //     onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                            //     onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                                            // });
                                                        }}
                                                    >
                                                        <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                    </BoxButton>
                                                </Box>

                                            </Box>

                                            {/* Giá trị cơ hội */}
                                            <InputItem
                                                isEdit={true}
                                                keyboardType='numeric'
                                                title={metaData?.field_list?.amount?.label}
                                                required={metaData?.field_list?.amount?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                inputType='currency'
                                                value={Global.formatNumberForm(opportunity?.amount || 0).toString()}
                                                onValueChange={(value) => onValueChange('amount', value)}
                                                isSubmitted={isSubmitForm}
                                            />
                                            <SpaceS />

                                            {/* Ngày chốt dự kiến' */}
                                            <Box
                                                paddingHorizontal='l'
                                                paddingVertical='m'
                                            >
                                                <RNDatePicker
                                                    iconRight={getIcon('Calendar')}
                                                    dateFormat={Global.user?.date_format?.toUpperCase()}
                                                    title={metaData?.field_list?.closingdate?.label}
                                                    required={metaData?.field_list?.closingdate?.required}
                                                    currentDate={opportunity.closingdate}
                                                    minDate={new Date()}
                                                    selectedDate={(value) => {
                                                        onValueChange('closingdate', value || new Date())
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>
                                            <SpaceS />
                                            {/* Loại */}
                                            <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                <ModalSelect
                                                    title={metaData?.field_list?.opportunity_type?.label}
                                                    required={metaData?.field_list?.opportunity_type?.required}
                                                    options={Global.getEnum('Potentials', 'opportunity_type')}
                                                    value={
                                                        opportunity?.opportunity_type ? {
                                                            key: opportunity?.opportunity_type,
                                                            label: Global.getEnumLabel('Potentials', 'opportunity_type', opportunity?.opportunity_type)
                                                        } : {}
                                                    }
                                                    onSelected={(value) => onValueChange('opportunity_type', value.key)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            {/* Nguồn */}
                                            <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                <ModalSelect
                                                    title={metaData?.field_list?.leadsource?.label}
                                                    required={metaData?.field_list?.leadsource?.required}
                                                    options={Global.getEnum('Potentials', 'leadsource')}
                                                    value={
                                                        opportunity?.leadsource ? {
                                                            key: opportunity?.leadsource,
                                                            label: Global.getEnumLabel('Potentials', 'leadsource', opportunity?.leadsource)
                                                        } : {}
                                                    }
                                                    onSelected={(value) => onValueChange('leadsource', value.key)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            {/* Bước bán hàng */}
                                            <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                <ModalSelect
                                                    style={{ flex: 1 }}
                                                    title={metaData?.field_list?.sales_stage?.label}
                                                    required={metaData?.field_list?.sales_stage?.required}
                                                    options={Global.getEnum('Potentials', 'sales_stage')}
                                                    value={
                                                        opportunity?.sales_stage ? {
                                                            key: opportunity?.sales_stage,
                                                            label: Global.getEnumLabel('Potentials', 'sales_stage', opportunity?.sales_stage)
                                                        } : {}
                                                    }
                                                    onSelected={(value, index) => {
                                                        let probabilityValue = Global.getProbabilityFromSalesStage(value.key);
                                                        let tmpOpportunity = { ...opportunity };
                                                        tmpOpportunity['sales_stage'] = value.key;
                                                        tmpOpportunity['probability'] = probabilityValue;
                                                        setOpportunity(tmpOpportunity);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                                <SpaceHS />
                                                {/* Tỉ lệ thành công */}
                                                <ModalSelect
                                                    style={{ flex: 1 }}
                                                    title={metaData?.field_list?.probability?.label}
                                                    required={metaData?.field_list?.probability?.required}
                                                    options={Global.getEnum('Potentials', 'probability')}
                                                    value={
                                                        opportunity?.probability ? {
                                                            key: opportunity?.probability,
                                                            label: Global.getEnumLabel('Potentials', 'probability', opportunity?.probability)
                                                        } : {}
                                                    }
                                                    onSelected={(value, index) => {
                                                        onValueChange('probability', value.key)
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            {/* Bước tiếp theo */}
                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.nextstep?.label}
                                                required={metaData?.field_list?.nextstep?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={opportunity?.nextstep || ''}
                                                onValueChange={(value) => onValueChange('nextstep', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            {/* Doanh số dự kiến */}
                                            <InputItem
                                                isEdit={true}
                                                keyboardType='numeric'
                                                title={metaData?.field_list?.forecast_amount?.label}
                                                required={metaData?.field_list?.forecast_amount?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                inputType='currency'
                                                value={Global.formatNumberForm(opportunity?.forecast_amount || 0).toString()}
                                                onValueChange={(value) => onValueChange('forecast_amount', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            {/* Đánh giá */}
                                            <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                <ModalSelect
                                                    title={metaData?.field_list?.rating?.label}
                                                    required={metaData?.field_list?.rating?.required}
                                                    options={Global.getEnum('Potentials', 'rating')}
                                                    value={
                                                        opportunity?.rating ? {
                                                            key: opportunity?.rating,
                                                            label: Global.getEnumLabel('Potentials', 'rating', opportunity?.rating)
                                                        } : {}
                                                    }
                                                    onSelected={(value) => onValueChange('rating', value.key)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            {/* Kết quả */}
                                            <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                <ModalSelect
                                                    title={metaData?.field_list?.potentialresult?.label}
                                                    required={metaData?.field_list?.potentialresult?.required}
                                                    options={Global.getEnum('Potentials', 'potentialresult')}
                                                    value={
                                                        opportunity?.potentialresult ? {
                                                            key: opportunity?.potentialresult,
                                                            label: Global.getEnumLabel('Potentials', 'potentialresult', opportunity?.potentialresult)
                                                        } : {}
                                                    }
                                                    onSelected={(value) => onValueChange('potentialresult', value.key)}
                                                    isSubmitted={isSubmitForm}
                                                />
                                            </Box>

                                            {/* Mô tả */}
                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.description?.label}
                                                required={metaData?.field_list?.description?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                isMultiline={true}
                                                selectTextOnFocus={false}
                                                value={opportunity?.description || ''}
                                                onValueChange={(value) => onValueChange('description', value)}
                                                isSubmitted={isSubmitForm}
                                            />

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
                                 onPress={() => { Keyboard.dismiss(); saveOpportunity() }}
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
                    <Content style={{ backgroundColor: Colors.white.white1 }} contentOffset={0} />
                )
            }
            <IndicatorLoading loading={loading} />
        </>
    )
}
