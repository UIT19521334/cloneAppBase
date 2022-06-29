// Import libraries
import React, { useEffect, useState } from 'react'
import {
    BackHandler, Keyboard, StyleSheet,
    Switch, TouchableHighlight, InteractionManager, TouchableOpacity
} from 'react-native'
import Toast from 'react-native-root-toast'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
// Import components
import {
    Body, BoxButton, ButtonIconView, Content, Header,
    IconRight, InputItem, Left, LText, NText,
    Right, SpaceHM, SpaceHS, SpaceL, SpaceS, Title
} from '../../../components/CustomComponentView'
import GooglePlaceAutoComplete from '../../../components/GooglePlaceAutoComplete'
import IndicatorLoading from '../../../components/IndicatorLoading'
import ModalSelect from '../../../components/ModalSelect'
import MultiplePickList from '../../../components/MultiplePickList'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles'

export default function OrganizationForm({ route, navigation }) {
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
    const [account, setAccount] = useState(
        route?.params?.account
            ? route.params.account
            : {}
    );
    const [showAlertPermissionRecord, setShowAlertPermissionRecord] = useState(false);
    const [isSubmitForm, setSubmitForm] = useState(false);
    const [interactionsComplete, setInteractionsComplete] = useState(false);

    const disPatch = useDispatch();

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setInteractionsComplete(true);
        });

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
            let fieldKeyValue = '';
            let fieldName = route?.params.fieldRelated?.replace('id', 'name');
            let fieldNameValue = '';
            switch (route?.params.fieldRelated) {
                case 'account_id':
                    fieldKeyValue = route?.params?.data?.accountid;
                    fieldNameValue = route?.params?.data?.accountname;
                    break;
                case 'related_campaign':
                    fieldKeyValue = route?.params?.data?.campaignid;
                    fieldNameValue = route?.params?.data?.campaignname;
                    break;

                default:
                    break;
            }

            let tmpAccount = { ...account };
            tmpAccount[route?.params?.fieldRelated] = fieldKeyValue;
            tmpAccount[fieldName] = fieldNameValue;
            setAccount(tmpAccount);
        }
    }, [route.params])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            if (route?.params?.prevScene == 'OrganizationList' && (account?.accountid || account?.id)) {
                getDataRecord();
            }
            else {
                setLoading(true);
                Global.getModuleMetaData('Accounts', metaData => {
                    if (account?.id) {
                        let selectedList = Global.formatAssignedOwnersArray(account?.assigned_owners, account?.main_owner_id);
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

        return unsubscribe;
    }, [navigation])

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
                        if (route?.params?.prevScene == 'OrganizationView') {
                            navigation.replace('OrganizationView', {
                                account: account,
                                prevScene: 'OrganizationForm',
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
        let tmpAccount = { ...account };
        tmpAccount[field] = value;
        setAccount(tmpAccount);
    }

    // Get data record when edit from list screen
    const getDataRecord = () => {
        setLoading(true);
        let params = {
            RequestAction: 'GetAccount',
            Params: {
                id: account?.accountid || account?.id,
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
                setAccount(data.data);
                setMetaData(data.metadata);
                setLoading(false);
            }
            else {
                setLoading(false);
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('account.title') }));
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    // Create/Edit account
    const saveAccount = () => {
        Keyboard.dismiss();
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList, ownerOrder);
        let fieldsRequireEmpty = Global.validateFieldsRequire(metaData?.field_list, account, [], 'Accounts');
        if (fieldsRequireEmpty) {
            // Alert.alert(
            //     getLabel('common.alert_field_invalid_title'),
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

        if (account?.email1) {
            if (!Global.validateEmail(account?.email1)) {
                Toast.show(getLabel('common.msg_email_invalid'));
                return;
            }
        }

        if (account?.email2) {
            if (!Global.validateEmail(account?.email2)) {
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
            RequestAction: 'SaveAccount',
            Data: account
        };

        params.Data.assigned_user_id = assignedOwners;

        if (account && account.id) {
            params.Data.id = account.id;
            params.Data.tags = '';
        }

        if (route?.params?.isDuplicate) {
            params.Data.id = '';
            params.Data.tags = '';
        }

        console.log('param update:', params.Data);

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            console.log('data: ', data);
            if (account?.id && !route?.params?.isDuplicate) {
                if (parseInt(data.success) === 1) {
                    console.log('Update from ', route?.params?.prevScene)
                    Toast.show(
                        getLabel('common.msg_edit_success', { module: getLabel('account.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == 'OrganizationView') {
                                    navigation.replace('OrganizationView', {
                                        account: data,
                                        prevScene: 'OrganizationForm',
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'OrganizationList') {
                                    console.log('Update from OrganizationList')
                                    route?.params?.onUpdateItemSelected?.(parseInt(route?.params?.indexSelected || 0) >= 0 ? parseInt(route?.params?.indexSelected || 0) : -1, account);
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
                    Toast.show(getLabel('common.msg_edit_error', { module: getLabel('account.title').toLowerCase() }));
                }
            }
            else {
                if (parseInt(data.success) === 1) {
                    Toast.show(
                        getLabel('common.msg_create_success', { module: getLabel('account.title').toLowerCase() }),
                        {
                            duration: Toast.durations.SHORT,
                            delay: 0,
                            animation: false,
                            hideOnPress: true,
                            onHidden: () => {
                                if (route?.params?.prevScene == 'OrganizationView') {
                                    navigation.replace('OrganizationView', {
                                        account: data,
                                        prevScene: 'OrganizationForm',
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected
                                    });
                                }
                                else if (route?.params?.prevScene == 'OrganizationList') {
                                    const newAccount = {
                                        ...params.Data,
                                        accountid: data.id,
                                        id: data.id,
                                        createdtime: new Date(),
                                        assigned_owners: ownerSelectedList
                                    }
                                    route?.params?.onCreateNew?.(newAccount);
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
                    Toast.show(getLabel('common.msg_create_error', { module: getLabel('account.title').toLowerCase() }));
                }
            }
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    const onClearRelated = (fieldKey, fieldValue) => {
        let tmpAccount = { ...account };
        tmpAccount[fieldKey] = '';
        tmpAccount[fieldValue] = '';
        setAccount(tmpAccount);
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
                    <Title allowFontScaling={true} >{getLabel('common.title_organizations')}</Title>
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
                                                title={metaData?.field_list?.accountname?.label}
                                                required={metaData?.field_list?.accountname?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={account?.accountname || ''}
                                                onValueChange={(value) => onValueChange('accountname', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            <InputItem
                                                isEdit={true}
                                                title={metaData?.field_list?.website?.label}
                                                required={metaData?.field_list?.website?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={account?.website || ''}
                                                onValueChange={(value) => onValueChange('website', value)}
                                                isSubmitted={isSubmitForm}
                                            />

                                            <InputItem
                                                isEdit={true}
                                                keyboardType='numeric'
                                                title={metaData?.field_list?.phone?.label}
                                                required={metaData?.field_list?.phone?.required}
                                                inputStyle={{ fontSize: 14 }}
                                                value={account?.phone || ''}
                                                onValueChange={(value) => onValueChange('phone', value)}
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
                                            {/* ----------------------------- Thông tin Công ty  ----------------------------- */}
                                            <>
                                                {/* Tên công ty */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.accountname?.label}
                                                    required={metaData?.field_list?.accountname?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.accountname || ''}
                                                    onValueChange={(value) => onValueChange('accountname', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Website */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.website?.label}
                                                    required={metaData?.field_list?.website?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.website || ''}
                                                    onValueChange={(value) => onValueChange('website', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Điện thoại */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType={'numeric'}
                                                    title={metaData?.field_list?.phone?.label}
                                                    required={metaData?.field_list?.phone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.phone || ''}
                                                    onValueChange={(value) => onValueChange('phone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mã CK */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.tickersymbol?.label}
                                                    required={metaData?.field_list?.tickersymbol?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.tickersymbol || ''}
                                                    onValueChange={(value) => onValueChange('tickersymbol', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Fax */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.fax?.label}
                                                    required={metaData?.field_list?.fax?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.fax || ''}
                                                    onValueChange={(value) => onValueChange('fax', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Là thành viên  */}
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
                                                                {account?.account_name || ''}
                                                            </NText>
                                                        </Box>
                                                        {
                                                            account.account_id && account.account_id != 0 ? (
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
                                                                navigation.navigate('RelatedModal', { module: 'Accounts', fieldRelated: 'account_id', preScreen: 'OrganizationForm' });
                                                            }}
                                                        >
                                                            <Icon name={getIcon('Search')} style={{ fontSize: 14 }} />
                                                        </BoxButton>
                                                    </Box>

                                                </Box>

                                                {/* SĐT khác */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType={'numeric'}
                                                    title={metaData?.field_list?.otherphone?.label}
                                                    required={metaData?.field_list?.otherphone?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.otherphone || ''}
                                                    onValueChange={(value) => onValueChange('otherphone', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mail */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.email1?.label}
                                                    required={metaData?.field_list?.email1?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.email1 || ''}
                                                    onValueChange={(value) => onValueChange('email1', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Mail Other*/}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.email2?.label}
                                                    required={metaData?.field_list?.email2?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.email2 || ''}
                                                    onValueChange={(value) => onValueChange('email2', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Loại hình doanh nghiệp*/}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.ownership?.label}
                                                    required={metaData?.field_list?.ownership?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.ownership || ''}
                                                    onValueChange={(value) => onValueChange('ownership', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Ngành nghề */}
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.industry?.label}
                                                        required={metaData?.field_list?.industry?.required}
                                                        options={Global.getEnum('Accounts', 'industry')}
                                                        value={
                                                            account?.industry ? {
                                                                key: account?.industry,
                                                                label: Global.getEnumLabel('Accounts', 'industry', account?.industry)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('industry', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Đánh giá */}
                                                <SpaceS />
                                                <Box paddingHorizontal='l' row paddingVertical='s' flexDirection='row'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.rating?.label}
                                                        required={metaData?.field_list?.rating?.required}
                                                        options={Global.getEnum('Accounts', 'rating')}
                                                        value={
                                                            account?.rating ? {
                                                                key: account?.rating,
                                                                label: Global.getEnumLabel('Accounts', 'rating', account?.rating)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('rating', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />

                                                </Box>

                                                {/* Loại công ty  */}
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.accounttype?.label}
                                                        required={metaData?.field_list?.accounttype?.required}
                                                        options={Global.getEnum('Accounts', 'accounttype')}
                                                        value={
                                                            account?.accounttype ? {
                                                                key: account?.accounttype,
                                                                label: Global.getEnumLabel('Accounts', 'accounttype', account?.accounttype)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('accounttype', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>

                                                {/* Mã ngành */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.siccode?.label}
                                                    required={metaData?.field_list?.siccode?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.siccode || ''}
                                                    onValueChange={(value) => onValueChange('siccode', value)}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quy mô công ty  */}
                                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                                    <ModalSelect
                                                        title={metaData?.field_list?.accounts_company_size?.label}
                                                        required={metaData?.field_list?.accounts_company_size?.required}
                                                        options={Global.getEnum('Accounts', 'accounts_company_size')}
                                                        value={
                                                            account?.accounts_company_size ? {
                                                                key: account?.accounts_company_size,
                                                                label: Global.getEnumLabel('Accounts', 'accounts_company_size', account?.accounts_company_size)
                                                            } : {}
                                                        }
                                                        onSelected={(value) => onValueChange('accounts_company_size', value.key)}
                                                        isSubmitted={isSubmitForm}
                                                    />
                                                </Box>


                                                {/* Doanh thu hàng năm */}
                                                <InputItem
                                                    isEdit={true}
                                                    keyboardType={'numeric'}
                                                    title={metaData?.field_list?.annual_revenue?.label}
                                                    required={metaData?.field_list?.annual_revenue?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    inputType='currency'
                                                    value={Global.formatNumberForm(account?.annual_revenue || 0).toString()}
                                                    onValueChange={(value) => onValueChange('annual_revenue', value)}
                                                    isSubmitted={isSubmitForm}
                                                />


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
                                                            value={account?.emailoptout == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('emailoptout', value ? 1 : 0)}
                                                        />
                                                    </Box>

                                                </Box>

                                                {/* Thông báo khi dữ liệu thay đổi */}
                                                <Box paddingHorizontal='l' paddingTop='l'>

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
                                                            value={account?.notify_owner == 1 ? true : false}
                                                            onValueChange={(value) => onValueChange('notify_owner', value ? 1 : 0)}
                                                        />
                                                    </Box>

                                                </Box>
                                            </>
                                            {/* ----------------------------- Thông tin Công ty  ----------------------------- */}

                                            {/* ----------------------------- Thông tin địa chỉ  ----------------------------- */}
                                            <>
                                                {/* Địa chỉ xuất hóa đơn */}
                                                <GooglePlaceAutoComplete
                                                    title={metaData?.field_list?.bill_street?.label}
                                                    required={metaData?.field_list?.bill_street?.required}
                                                    value={account?.bill_street || ''}
                                                    onChangeText={(value) => {
                                                        let tmpAccount = { ...account };
                                                        tmpAccount.bill_street = value;
                                                        setAccount(tmpAccount);
                                                    }}
                                                    selectedChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        tmpAccount.bill_street = value.address;
                                                        tmpAccount.bill_state = value.state;
                                                        tmpAccount.bill_city = value.city;
                                                        tmpAccount.bill_country = value.country;
                                                        tmpAccount.bill_street_longitude = value.longitude;
                                                        tmpAccount.bill_street_latitude = value.latitude;
                                                        setAccount(tmpAccount);
                                                    }}
                                                />

                                                {/* Quận/Huyện (Xuất hóa đơn) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.bill_state?.label}
                                                    required={metaData?.field_list?.bill_state?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.bill_state || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.bill_state = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.bill_state = value;
                                                        }
                                                        tmpAccount.bill_street_longitude = '';
                                                        tmpAccount.bill_street_latitude = '';
                                                        setAccount(tmpAccount);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tỉnh/ TP (Xuất hóa đơn) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.bill_city?.label}
                                                    required={metaData?.field_list?.bill_city?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.bill_city || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.bill_city = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.bill_city = value;
                                                        }
                                                        tmpAccount.bill_street_longitude = '';
                                                        tmpAccount.bill_street_latitude = '';
                                                        setAccount(tmpAccount);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quốc gia (Xuất hóa đơn) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.bill_country?.label}
                                                    required={metaData?.field_list?.bill_country?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.bill_country || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.bill_country = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.bill_country = value;
                                                        }
                                                        tmpAccount.bill_street_longitude = '';
                                                        tmpAccount.bill_street_latitude = '';
                                                        setAccount(tmpAccount);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Địa chỉ giao hàng */}
                                                <GooglePlaceAutoComplete
                                                    title={metaData?.field_list?.ship_street?.label}
                                                    required={metaData?.field_list?.ship_street?.required}
                                                    value={account?.ship_street || ''}
                                                    onChangeText={(value) => {
                                                        let tmpAccount = { ...account };
                                                        tmpAccount.ship_street = value;
                                                        setAccount(tmpAccount);
                                                    }}
                                                    selectedChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        tmpAccount.ship_street = value.address;
                                                        tmpAccount.ship_state = value.state;
                                                        tmpAccount.ship_city = value.city;
                                                        tmpAccount.ship_country = value.country;
                                                        tmpAccount.ship_street_longitude = value.longitude;
                                                        tmpAccount.ship_street_latitude = value.latitude;
                                                        setAccount(tmpAccount);
                                                    }}
                                                />

                                                {/* Quận/Huyện (Giao hàng) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.ship_state?.label}
                                                    required={metaData?.field_list?.ship_state?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.ship_state || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.ship_state = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.ship_state = value;
                                                        }
                                                        tmpAccount.ship_street_longitude = '';
                                                        tmpAccount.ship_street_latitude = '';
                                                        setAccount(tmpAccount);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Tỉnh/ TP (Giao hàng) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.ship_city?.label}
                                                    required={metaData?.field_list?.ship_city?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.ship_city || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.ship_city = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.ship_city = value;
                                                        }
                                                        tmpAccount.ship_street_longitude = '';
                                                        tmpAccount.ship_street_latitude = '';
                                                        setAccount(tmpAccount);
                                                    }}
                                                    isSubmitted={isSubmitForm}
                                                />

                                                {/* Quốc gia (Giao hàng) */}
                                                <InputItem
                                                    isEdit={true}
                                                    title={metaData?.field_list?.ship_country?.label}
                                                    required={metaData?.field_list?.ship_country?.required}
                                                    inputStyle={{ fontSize: 14 }}
                                                    value={account?.ship_country || ' '}
                                                    onValueChange={(value) => {
                                                        let tmpAccount = { ...account };
                                                        if (value[0] == ' ') {
                                                            tmpAccount.ship_country = value.slice(1, value.length);
                                                        }
                                                        else {
                                                            tmpAccount.ship_country = value;
                                                        }
                                                        tmpAccount.ship_street_longitude = '';
                                                        tmpAccount.ship_street_latitude = '';
                                                        setAccount(tmpAccount);
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
                                                    value={account?.description || ''}
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
                                        onPress={() => { Keyboard.dismiss(); saveAccount() }}
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
