import moment from 'moment-timezone';
import { Body, Container, Content, Header, Icon, Input, Left, ListItem, Right, Title } from 'native-base';
import React from 'react';
import { ActivityIndicator, DeviceEventEmitter, Dimensions, 
    FlatList, Image, ImageBackground, Modal, Platform, 
    RefreshControl, SafeAreaView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import ModalDropdown from '../../../components/ModalDropdown';
import RadioButton from '../../../components/RadioButton';
import RNDatePicker from '../../../components/RNDatePicker';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { Icon as CustomIcon } from '../../../themes/Icons/CustomIcon';
import { getIcon, getLabel, heightDevice, isIphoneX, widthDevice } from '../../../utils/commons/commons';
import SyncCall from '../../Models/SyncCall';
import QuickCreateCustomer from '../../SoftPhoneCallLog/QuickCreateCustomer';
import SoftPhoneEvents from '../../SoftPhoneEvents';
var height = heightDevice;
var width = widthDevice;

interface CallLogProps {
    metaData: Object;
    syncCall: SyncCall;
    onSaveLogToCache: Function;
    onSaveLog: Function;
    hasCreateNewCustomer: Boolean;
    loadingSaveCallLog: Boolean;
    onCreateNewCustomer: Function;
}

const unknownLabel = (Global.locale  || "vn_vn") == 'vn_vn' ? 'Không xác định' : 'Unknown';

const selectMomentDefault = [
    {
        "value": "this_afternoon",
        "color": "",
        "assign": "1",
        "key": "this_afternoon",
        "label": "Chiều nay"
    },
    {
        "value": "next_morning",
        "color": "",
        "assign": "1",
        "key": "next_morning",
        "label": "Sáng mai"
    },
    {
        "value": "next_afternoon",
        "color": "",
        "assign": "1",
        "key": "next_afternoon",
        "label": "Chiều mai"
    }
]

const selectTimeDefault = [
    {
        "value": "01:00",
        "color": "",
        "assign": "1",
        "key": "01:00",
        "label": "01:00"
    },
    {
        "value": "02:00",
        "color": "",
        "assign": "1",
        "key": "02:00",
        "label": "02:00"
    },
    {
        "value": "03:00",
        "color": "",
        "assign": "1",
        "key": "03:00",
        "label": "03:00"
    },
    {
        "value": "04:00",
        "color": "",
        "assign": "1",
        "key": "04:00",
        "label": "04:00"
    },
    {
        "value": "05:00",
        "color": "",
        "assign": "1",
        "key": "05:00",
        "label": "05:00"
    },
    {
        "value": "06:00",
        "color": "",
        "assign": "1",
        "key": "06:00",
        "label": "06:00"
    },
    {
        "value": "07:00",
        "color": "",
        "assign": "1",
        "key": "07:00",
        "label": "07:00"
    },
    {
        "value": "08:00",
        "color": "",
        "assign": "1",
        "key": "08:00",
        "label": "08:00"
    },
    {
        "value": "09:00",
        "color": "",
        "assign": "1",
        "key": "09:00",
        "label": "09:00"
    },
    {
        "value": "10:00",
        "color": "",
        "assign": "1",
        "key": "10:00",
        "label": "10:00"
    },
    {
        "value": "11:00",
        "color": "",
        "assign": "1",
        "key": "11:00",
        "label": "11:00"
    },
    {
        "value": "12:00",
        "color": "",
        "assign": "1",
        "key": "12:00",
        "label": "12:00"
    }
]

const CallLog = (props: CallLogProps) => {

    const [events_inbound_call_purpose, setEvents_inbound_call_purpose] = React.useState(Global.getEnum('Events', 'events_inbound_call_purpose'));
    const [events_call_purpose, setEvents_call_purpose] = React.useState(Global.getEnum('Events', 'events_call_purpose'));
    const [events_call_result, setEvents_call_result] = React.useState(Global.getEnum('Events', 'events_call_result'));
    const [select_time, setSelect_time] = React.useState(selectTimeDefault);
    const [select_moment, setSelect_moment] = React.useState(selectMomentDefault);
    const [time_start, setTime_start] = React.useState(Global.getEnum('Events', 'time_start'));
    const [syncCall, setSyncCall] = React.useState(props.syncCall || new SyncCall());
    const [callLogData, setCallLogData] = React.useState({ ...(props.syncCall?.callLogData || {}) });
    const [productList, setProductList] = React.useState([]);
    const [rawProductList, setRawProductList] = React.useState([]);
    const [serviceList, setServiceList] = React.useState([]);
    const [rawServiceList, setRawServiceList] = React.useState([]);
    const [showModalRelated, setShowModalRelated] = React.useState(false);
    const [isShowModalProduct, setShowModalProduct] = React.useState(false);
    const [isShowModalService, setShowModalService] = React.useState(false);
    const [refreshingProduct, setRefreshingProduct] = React.useState(false);
    const [loadingProduct, setLoadingProduct] = React.useState(false);
    const [pagingProduct, setPagingProduct] = React.useState({});
    const [productKeyword, setProductKeyword] = React.useState('');
    const [refreshingService, setRefreshingService] = React.useState(false);
    const [loadingService, setLoadingService] = React.useState(false);
    const [pagingService, setPagingService] = React.useState({});
    const [serviceKeyword, setServiceKeyword] = React.useState('');
    const [accountList, setAccountList] = React.useState([]);
    const [rawAccountList, setRawAccountList] = React.useState([]);
    const [refreshingAccount, setRefreshingAccount] = React.useState(false);
    const [loadingAccount, setLoadingAccount] = React.useState(false);
    const [pagingAccount, setPagingAccount] = React.useState({});
    const [accountKeyword, setAccountKeyword] = React.useState('');
    const [isShowCreateCustomer, setShowCreateCustomer] = React.useState(false);

    React.useEffect(() => {
        const subscriber = DeviceEventEmitter.addListener(SoftPhoneEvents.EVENT_HAS_OTHER_INCOMING_CALL, (data) => {
            props.onSaveLog?.(callLogData, true);
        });

        return () => {
            subscriber.remove();
        }
    }, [])

    React.useEffect(() => {

        if (!props.syncCall?.callLogData || (Object.keys(props.syncCall?.callLogData).length <= 0)) {
            const userInfo = {
                customer_id: props.syncCall?.customerData?.id || '',
                customer_type: props.syncCall?.customerData?.record_module === 'Contacts' ? 'Contacts' : 'Leads',
                account: {
                    account_id: props.syncCall?.customerData?.account_id || '',
                    account_name: props.syncCall?.customerData?.account_id_display || '',
                },
                salutationtype: props.syncCall?.customerData?.salutationtype ?
                    {
                        key: props.syncCall?.customerData?.salutationtype,
                        label: Global.getEnumLabel(props.syncCall?.customerData?.record_module, 'salutationtype', props.syncCall?.customerData?.salutationtype),
                    } :
                    {},
                lastname: props.syncCall?.customerData?.lastname || '',
                firstname: props.syncCall?.customerData?.firstname || '',
                mobile_phone: props.syncCall?.customerData?.mobile || props.syncCall?.phoneNumber || '',
                email: props.syncCall?.customerData?.email || '',
                product_ids: props.syncCall?.customerData?.product_ids || [],
                service_ids: props.syncCall?.customerData?.services_ids || [],
                company: props.syncCall?.customerData?.company || '',
            }

            let product_ids = props.syncCall?.customerData?.product_ids?.map((product) => {
                return {
                    productid: product.id,
                    label: product.text
                }
            }) || [];

            let services_ids = props.syncCall?.customerData?.services_ids?.map((service) => {
                return {
                    serviceid: service.id,
                    label: service.text
                }
            }) || [];

            const account = {
                accountid: props.syncCall?.customerData?.account_id || '',
                accountname: props.syncCall?.customerData?.account_id_display || '',
            }

            userInfo.productSelectedList = product_ids;
            userInfo.rawProductSelectedList = product_ids;
            userInfo.serviceSelectedList = services_ids;
            userInfo.rawServiceSelectedList = services_ids;
            userInfo.accountSelected = account;

            console.log('LOG.DATA USERINFOR: ', userInfo);
            let callLogTemp = { ...callLogData };
            if (props?.syncCall?.direction?.toUpperCase() === 'INBOUND'
                && (callLogTemp?.callInBoundPurpose?.key)
            ) {
                callLogTemp.subject = `[${callLogTemp?.callInBoundPurpose?.label}] ${syncCall?.customerName || getLabel('common.undefine_label')} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
            }
            else if (props?.syncCall?.direction?.toUpperCase() === 'OUTBOUND'
                && (callLogTemp?.callPurpose?.key)
            ) {
                callLogTemp.subject = `[${callLogTemp?.callPurpose?.label}] ${syncCall?.customerName || getLabel('common.undefine_label')} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
            }

            callLogTemp.visibility = callLogData?.visibility || 'PUBLIC';
            callLogTemp.userInfo = userInfo;
            setCallLogData(callLogTemp);
        }
        return () => { }
    }, [props.syncCall]);

    const onChangeValue = React.useCallback((key, value, subKey) => {
        let callLogDataTemp = { ...callLogData };
        console.log('>>>>>>>>>>>> onChangeValue', key, value, subKey, callLogData);
        if (key) {
            if (subKey) {
                const data = { ...(callLogDataTemp[key] || {}) };
                data[subKey] = value;
                callLogDataTemp[key] = data;

            } else {
                callLogDataTemp[key] = value;
            }
        }
        console.log('>>>>>>>>>>>> callLogData', callLogDataTemp);

        // syncCall.callLogData = callLogData;
        // setSyncCall(syncCall);
        setCallLogData(callLogDataTemp);
    }, [callLogData]);

    const getIndexTime = (time, type: 'Not minutes' | 'Minutes') => {
        if (time) {
            let hour = time.split(':')[0];
            let minute = time.split(':')[1];
            let index = 0;

            if (type == 'Not minutes') {
                index = hour - 1;
            }
            else {
                index = hour * 2;
            }

            if (minute >= 30) {
                index = index + 1;
            }

            return index;
        }
        else {
            return 0;
        }
    }

    const searchProduct = (loadType) => {
        // Do request
        if (loadType == 'refresh') {
            setLoadingProduct(false);
            setRefreshingProduct(true);
        }
        else {
            setLoadingProduct(true);
            setRefreshingProduct(false);
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (pagingProduct?.next_offset) {
                offset = pagingProduct?.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetProductList',
            Params: {
                keyword: productKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        console.log('<<<<<<<<<< Params request: ', params);
        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                setLoadingProduct(false);
                setRefreshingProduct(false);
                Toast.show(getLabel('common.msg_no_results_found'));
                return;
            }
            var listData = data?.entry_list || [];
            var list = listData;

            if (loadType == 'load_more') {
                list = rawProductList.concat(listData);
            }

            setPagingProduct(data?.paging || {});
            setRawProductList(list);
            setProductList(list);
            setLoadingProduct(false);
            setRefreshingProduct(false);

        }, error => {
            setLoadingProduct(false);
            setRefreshingProduct(false);
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const loadMoreProduct = () => {
        if (pagingProduct && pagingProduct.next_offset) {
            searchProduct('load_more');
        }
    }

    const searchService = (loadType) => {
        // Do request
        if (loadType == 'refresh') {
            setLoadingService(false);
            setRefreshingService(true);
        }
        else {
            setLoadingService(true);
            setRefreshingService(false);
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (pagingService?.next_offset) {
                offset = pagingService.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetServiceList',
            Params: {
                keyword: serviceKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                setLoadingService(false);
                setRefreshingService(false);
                Toast.show(getLabel('common.msg_no_results_found'));
                return;
            }
            var listData = data?.entry_list || [];
            var list = listData;

            if (loadType == 'load_more') {
                list = rawServiceList.concat(listData);
            }

            setPagingService(data?.paging || {});
            setRawServiceList(list);
            setServiceList(list);
            setLoadingService(false);
            setRefreshingService(false);

        }, error => {
            setLoadingService(false);
            setRefreshingService(false);
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const loadMoreService = () => {
        if (pagingService && pagingService.next_offset) {
            searchService('load_more');
        }
    }

    const searchAccount = (loadType) => {
        // Do request
        if (loadType == 'refresh') {
            setLoadingAccount(false);
            setRefreshingAccount(true);
        }
        else {
            setLoadingAccount(true);
            setRefreshingAccount(false);
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (pagingAccount.next_offset) {
                offset = pagingAccount.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetAccountList',
            Params: {
                keyword: accountKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                setLoadingAccount(false);
                setRefreshingAccount(false);
                Toast.show(getLabel('common.msg_no_results_found'));
                return;
            }

            var listData = data?.entry_list || [];
            var list = listData;

            if (loadType == 'load_more') {
                list = rawAccountList.concat(listData);
            }

            setPagingAccount(data?.paging || {});
            setRawAccountList(list);
            setAccountList(list);
            setLoadingAccount(false);
            setRefreshingAccount(false);
        }, error => {
            setLoadingAccount(false);
            setRefreshingAccount(false);
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const selectAccount = (account) => {
        onChangeValue('userInfo', account, 'accountSelected');
        setShowModalRelated(false);
    }

    const loadMoreAccount = () => {
        if (pagingAccount && pagingAccount?.next_offset) {
            searchAccount('load_more');
        }
    }

    const timerString = (duration) => {

        if (duration <= 0) {
            return '00:00';
        }
        var date = new Date(0);
        date.setSeconds(duration);

        return date.toISOString().substring(11, 19);

    }

    const getDuration = React.useCallback(() => {
        
        if (props.syncCall?.calling || !props.syncCall?.answered) {
            return '00:00'
        }
        else if (props.syncCall?.endedCallkit && props.syncCall?.endedStringeeCall && props.syncCall?.answered && !props.syncCall?.calling && props.syncCall?.startTime && props.syncCall?.endTime) {
            let currentDate = new Date();
            let startTimeCall = moment(props.syncCall?.startTime || currentDate);
            let endTimeCall = moment(props.syncCall?.endTime || currentDate);

            let duration = endTimeCall.diff(startTimeCall, 'seconds');
            console.error('?????????? duration: ', duration, props.syncCall?.startTime, props.syncCall?.endTime, startTimeCall, endTimeCall);
            return timerString(duration);
        }
        else {
            return '00:00'
        }
    }, [props.syncCall]);

    return (
        <ImageBackground
            source={require('../../../assets/images/bg.jpg')}
            blurRadius={5}
            style={{
                ...styles.container
            }}
        >
            {
                isShowCreateCustomer ? (
                    <>
                        <QuickCreateCustomer
                            globalInstance={Global}
                            phoneNumber={props.syncCall?.phoneNumber}
                            onDismissCreate={() => {
                                setShowCreateCustomer(false);
                            }}
                            onCreateNewCustomer={(customer, module) => {
                                console.log('LOG. New Customer: ', customer, module);
                                setShowCreateCustomer(false);
                                props?.onCreateNewCustomer?.(customer, module);
                            }}
                        />
                    </>
                )
                    : (
                        <SafeAreaView
                            style={{ flex: 1 }}
                        >
                            <Content
                                style={{ flex: 1 }}
                            >
                                {/* Customer information */}
                                <View style={{ ...styles.customerInfoContainer }}>
                                    <Image
                                        source={{ uri: Global.getImageUrl(syncCall?.avatar) }}
                                        style={{
                                            width: width * 0.25,
                                            height: width * 0.25,
                                            borderRadius: (width * 0.25) / 2,
                                            resizeMode: Platform.OS == 'ios' ? 'stretch' : 'cover',
                                            borderColor: '#ffffff',
                                            borderWidth: 2,
                                            shadowColor: '#e2e2e2',
                                            shadowOffset: {
                                                width: 0,
                                                height: 10,
                                            },
                                            shadowOpacity: 0.53,
                                            shadowRadius: 13.97,
                                        }}
                                        resizeMode='stretch'
                                    />

                                    <View style={{ ...styles.customerInfoContent }}>
                                        <Text style={{ ...styles.customerName }}>
                                            {syncCall?.customerName || unknownLabel}
                                        </Text>

                                        <View style={{ paddingVertical: 4 }} />

                                        <Text style={{ ...styles.phoneNumber }}>
                                            {syncCall?.phoneNumber || unknownLabel}
                                        </Text>

                                        <View style={{ paddingVertical: 4 }} />

                                        <Text style={{ ...styles.companyName }}>
                                            {syncCall?.companyName || unknownLabel}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ paddingVertical: 8 }} />
                                {/* Call information */}
                                <View
                                    style={{
                                        paddingHorizontal: 12
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontSize: 16,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {getLabel('call_log.information_call_title', { direction: syncCall?.direction?.toUpperCase() == 'INBOUND' ? getLabel('call_log.direction_incoming_label') : getLabel('call_log.direction_call_out_label') })} {getDuration()}
                                    </Text>

                                    {/* Mục đích cuộc gọi */}
                                    <View style={{ ...styles.inputContainer }}>
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text allowFontScaling={true} style={styles.txtWhite}>
                                                {
                                                    syncCall?.direction === 'INBOUND'
                                                        ? (props.metaData?.field_list?.events_inbound_call_purpose?.label || getLabel('call_log.target_label'))
                                                        : (props.metaData?.field_list?.callPurpose?.label || getLabel('call_log.target_label'))
                                                }
                                            </Text>
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <ModalDropdown
                                                style={{ flex: 1 }}
                                                options={syncCall?.direction?.toUpperCase() === 'INBOUND' ? [...(events_inbound_call_purpose || [])] : [...(events_call_purpose || [])]}
                                                dropdownStyle={[styles.dropdownItem]}
                                                onSelect={(id, value) => {
                                                    const title = `[${value?.label}] ${syncCall?.customerName || getLabel('common.undefine_label')} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
                                                    let callLogDataTemp = { ...callLogData };
                                                    if (syncCall?.direction?.toUpperCase() === 'INBOUND') {
                                                        callLogDataTemp.callInBoundPurpose = value;
                                                        callLogDataTemp.subject = title;
                                                    } else {
                                                        callLogDataTemp.callPurpose = value;
                                                        callLogDataTemp.subject = title;
                                                    }
                                                    setCallLogData(callLogDataTemp);
                                                }}

                                                renderRow={(rowData, rowId, highlighted) => {
                                                    return (
                                                        <View style={{ backgroundColor: callLogData?.callInBoundPurpose?.key ? (callLogData?.callInBoundPurpose?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                            <Text allowFontScaling={true} style={{
                                                                ...styles.rowDropdown
                                                            }}>
                                                                {rowData.label}
                                                            </Text>
                                                        </View>
                                                    )
                                                }}
                                            >
                                                <View style={{ ...styles.dropdownView }}>
                                                    <Text allowFontScaling={true} >{syncCall?.direction?.toUpperCase() === 'INBOUND' ? (callLogData?.callInBoundPurpose?.label || props.metaData?.field_list?.events_inbound_call_purpose?.label || getLabel('call_log.target_label')) : (callLogData?.callPurpose?.label || props.metaData?.field_list?.callPurpose?.label || getLabel('call_log.target_label'))}</Text>
                                                    <Icon
                                                        name='caret-down'
                                                        type='FontAwesome'
                                                        style={{ ...styles.iconDropdownView }}
                                                    />
                                                </View>
                                            </ModalDropdown>
                                        </View>
                                    </View>

                                    {/* Muc dich khac */}
                                    {
                                        (callLogData?.callPurpose?.key === 'call_purpose_other'
                                            || callLogData?.callInBoundPurpose?.key === 'inbound_call_purpose_other') ?
                                            (
                                                <View style={{ ...styles.inputContainer }}>
                                                    <View style={{ ...styles.inputContentTitle }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>{
                                                            getLabel('call_log.target_other_label')
                                                        }</Text>
                                                    </View>
                                                    <View style={{ ...styles.inputRelatedContent }}>
                                                        <Input
                                                            style={{ ...styles.inputRelated }}
                                                            value={callLogData?.callPurposeOther || ''}
                                                            placeholder={getLabel('call_log.target_other_label')}
                                                            selectTextOnFocus={true}
                                                            clearButtonMode='while-editing'
                                                            onChangeText={(value) => {
                                                                const title = `[${value}] ${syncCall?.customerName || getLabel('common.undefine_label')} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
                                                                let callLogDataTemp = { ...callLogData };
                                                                callLogDataTemp.callPurposeOther = value;
                                                                callLogDataTemp.subject = title;
                                                                setCallLogData(callLogDataTemp);
                                                            }}
                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                        />
                                                    </View>
                                                </View>
                                            )
                                            : null
                                    }

                                    {/* Tiêu đề call log */}
                                    <View style={{ ...styles.inputContainer }}>
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text allowFontScaling={true}
                                                style={styles.txtWhite}
                                            >
                                                {getLabel('call_log.subject_label')}
                                            </Text>
                                        </View>
                                        <View style={{ ...styles.inputRelatedContent }}>
                                            <Input
                                                style={{ ...styles.inputRelated, minHeight: 44, maxHeight: 64, paddingVertical: 4 }}
                                                value={callLogData?.subject || ''}
                                                multiline
                                                placeholder={getLabel('call_log.subject_label')}
                                                selectTextOnFocus={true}
                                                onChangeText={(value) => {
                                                    onChangeValue('subject', value)
                                                }}
                                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                            />
                                        </View>
                                    </View>

                                    {/* Mô tả */}
                                    <View style={{ ...styles.inputContainer }}>
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text
                                                allowFontScaling={true}
                                                style={styles.txtWhite}>
                                                {getLabel('call_log.description_label')}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 2, backgroundColor: '#fff', borderRadius: 4 }}>
                                            <Input
                                                style={{
                                                    ...styles.inputRelated,
                                                    minHeight: 54,
                                                    maxHeight: 64
                                                }}
                                                multiline
                                                placeholder={getLabel('call_log.description_label')}
                                                value={callLogData?.description || ''}
                                                selectTextOnFocus={true}
                                                clearButtonMode='while-editing'
                                                onChangeText={(value) => {
                                                    onChangeValue('description', value)
                                                }}
                                            />
                                        </View>
                                    </View>

                                    {/* Chế độ lưu */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            ...styles.inputContainer
                                        }}
                                    >
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text allowFontScaling={true} style={styles.txtWhite}>{getLabel('call_log.visibility_label')}</Text>
                                        </View>
                                        <View
                                            style={{
                                                flex: 2,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >

                                            <RadioButton
                                                label={getLabel('call_log.public_label')}
                                                labelStyle={{
                                                    color: '#ffffff'
                                                }}
                                                onSelect={() => {
                                                    onChangeValue('visibility', 'PUBLIC')
                                                }}
                                                colorSelected={'#FFFFFF'}
                                                color={'#ffffff'}
                                                selected={callLogData?.visibility === 'PUBLIC'}
                                            />

                                            <View style={{ paddingHorizontal: 8 }} />

                                            <RadioButton
                                                label={getLabel('call_log.private_label')}
                                                labelStyle={{
                                                    color: '#ffffff'
                                                }}
                                                onSelect={() => {
                                                    onChangeValue('visibility', 'PRIVATE')
                                                }}
                                                colorSelected={'#ffffff'}
                                                color={'#ffffff'}
                                                selected={callLogData?.visibility === 'PRIVATE'}
                                            />

                                        </View>
                                    </View>

                                    {/* Kết quả */}
                                    <View style={{ ...styles.inputContainer }}>
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text allowFontScaling={true} style={styles.txtWhite}>
                                                {getLabel('call_log.result_label')}
                                            </Text>
                                        </View>
                                        <View style={{ ...styles.inputRelatedContent }}>
                                            <ModalDropdown
                                                style={{ flex: 1 }}
                                                options={[...events_call_result || []]}
                                                dropdownStyle={[styles.dropdownItem]}
                                                onSelect={(id, value) => {
                                                    const callLogTemp = { ...callLogData };

                                                    if (value?.key === 'call_result_call_back_later') {
                                                        const hoursNow = parseInt(moment(new Date()).format('HH'));
                                                        const selectedTime = [...(props.metaData?.enum_list?.select_time || select_time || [])];
                                                        const selectedMoment = [...(props.metaData?.enum_list?.select_moment || select_moment || [])];
                                                        const timeStart = [...(props.metaData?.enum_list?.time_start || time_start || [])];

                                                        if (hoursNow < 12) {
                                                            const indexSelectedTime = selectedTime?.findIndex((time) => time?.key === '02:00');
                                                            const indexTimeStart = timeStart?.findIndex((time) => time?.key === '14:00');
                                                            callLogTemp.recallTime = selectedTime[indexSelectedTime];
                                                            callLogTemp.recallTimeOther = timeStart[indexTimeStart];
                                                            callLogTemp.recallMoment = selectedMoment[0];
                                                        } else if (hoursNow > 14) {
                                                            const indexSelectedTimes = selectedTime?.findIndex((time) => time?.key === '08:00');
                                                            const indexTimeStarts = timeStart?.findIndex((time) => time?.key === '08:00');
                                                            callLogTemp.recallTime = selectedTime[indexSelectedTimes];
                                                            callLogTemp.recallTimeOther = timeStart[indexTimeStarts];
                                                            callLogTemp.recallMoment = selectedMoment[1];
                                                        }
                                                    }
                                                    callLogTemp.resultCall = value;
                                                    setCallLogData(callLogTemp);

                                                }}
                                                renderRow={(rowData, rowId, highlighted) => {
                                                    return (
                                                        <View style={{ backgroundColor: callLogData?.resultCall?.key ? (callLogData?.resultCall?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                            <Text allowFontScaling={true} style={{
                                                                ...styles.rowDropdown
                                                            }}>
                                                                {rowData.label}
                                                            </Text>
                                                        </View>
                                                    )
                                                }

                                                }
                                            >
                                                <View style={{ ...styles.dropdownView }}>
                                                    <Text allowFontScaling={true} >{callLogData?.resultCall?.label || props.metaData?.field_list?.resultCall?.label || getLabel('call_log.result_label')}</Text>
                                                    <Icon
                                                        name='caret-down'
                                                        type='FontAwesome'
                                                        style={{ ...styles.iconDropdownView }}
                                                    />
                                                </View>
                                            </ModalDropdown>
                                        </View>
                                    </View>

                                    {/* Gọi lại vào nếu có */}
                                    {
                                        callLogData?.resultCall?.key == 'call_result_call_back_later' ? (
                                            <>

                                                {
                                                    callLogData?.isOtherRecall ? null : (
                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                ...styles.inputContainer
                                                            }}>
                                                            <View style={{ flex: 1, justifyContent: 'center' }} />
                                                            <View
                                                                style={{
                                                                    flex: 5,
                                                                    flexDirection: 'row'
                                                                }}
                                                            >

                                                                <ModalDropdown
                                                                    style={{ flex: 1 }}
                                                                    disabled={callLogData?.isOtherRecall}
                                                                    options={[...(props.metaData?.enum_list?.select_time || select_time || [])]}
                                                                    dropdownStyle={[styles.dropdownItem]}
                                                                    onSelect={(id, value) => onChangeValue('recallTime', value)}
                                                                    renderRow={(rowData, rowId, highlighted) => {
                                                                        return (
                                                                            <View
                                                                                style={{
                                                                                    borderRadius: 4,
                                                                                    backgroundColor: callLogData?.recallTime?.key ? (callLogData?.recallTime?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff'
                                                                                }}>
                                                                                <Text allowFontScaling={true} style={{
                                                                                    ...styles.rowDropdown
                                                                                }}>
                                                                                    {rowData.label}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    }}
                                                                    initialScrollIndex={callLogData?.recallTime?.key ? getIndexTime(callLogData?.recallTime?.key, 'Not minutes') : 0}

                                                                >
                                                                    <View style={{ ...styles.dropdownView }}>
                                                                        <Text allowFontScaling={true} >{callLogData?.recallTime?.label || ''}</Text>
                                                                        <Icon
                                                                            name='clock-o'
                                                                            type='FontAwesome'
                                                                            style={{ ...styles.iconDropdownView }}
                                                                        />
                                                                    </View>
                                                                </ModalDropdown>

                                                                <View style={{ width: 10 }} />

                                                                <ModalDropdown
                                                                    style={{ flex: 1 }}
                                                                    disabled={callLogData?.isOtherRecall}
                                                                    options={[...(props.metaData?.enum_list?.select_moment || select_moment || [])]}
                                                                    dropdownStyle={[styles.dropdownItem]}
                                                                    onSelect={(id, value) => onChangeValue('recallMoment', value)}
                                                                    renderRow={(rowData, rowId, highlighted) => {
                                                                        return (
                                                                            <View
                                                                                style={{
                                                                                    borderRadius: 4,
                                                                                    backgroundColor: callLogData?.recallMoment?.label ? (callLogData?.recallMoment?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff'
                                                                                }}
                                                                            >
                                                                                <Text allowFontScaling={true} style={{
                                                                                    ...styles.rowDropdown
                                                                                }}>
                                                                                    {rowData.label}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    }

                                                                    }
                                                                >
                                                                    <View style={{ ...styles.dropdownView }}>
                                                                        <Text allowFontScaling={true} >{callLogData?.recallMoment?.label || ''}</Text>
                                                                        <Icon
                                                                            name='caret-down'
                                                                            type='FontAwesome'
                                                                            style={{ ...styles.iconDropdownView }} />
                                                                    </View>
                                                                </ModalDropdown>
                                                            </View>

                                                        </View>
                                                    )
                                                }

                                                {/* Khi Khác */}
                                                <View style={{ ...styles.otherViewContainer }}>
                                                    <View style={{ flex: 1, justifyContent: 'center' }} />

                                                    <View style={{ flex: 5 }}>
                                                        <RadioButton
                                                            selected={callLogData?.isOtherRecall}
                                                            label={getLabel('call_log.other_label')}
                                                            onSelect={() => {
                                                                onChangeValue('isOtherRecall', !callLogData?.isOtherRecall)
                                                            }}
                                                            color={'#fff'}
                                                            colorSelected={'#fff'}
                                                            labelStyle={{
                                                                color: '#fff'
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                {
                                                    !callLogData?.isOtherRecall ? null : (
                                                        <View style={{ flexDirection: 'row', minHeight: 40, marginVertical: 5 }}>
                                                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                                            </View>
                                                            <View style={{ flex: 7, flexDirection: 'row' }}>

                                                                <RNDatePicker
                                                                    iconRight={getIcon('Calendar')}
                                                                    title={''}
                                                                    required={false}
                                                                    currentDate={new Date()}
                                                                    selectedDate={(value) => {
                                                                        onChangeValue('recallDateOther', value)
                                                                    }}
                                                                    hideTitle={true}
                                                                    style={{
                                                                        minHeight: 42,
                                                                        borderRadius: 4,
                                                                    }}
                                                                    contentStyle={{
                                                                        alignItems: 'center'
                                                                    }}
                                                                />

                                                                <View style={{ width: 10 }} />

                                                                <ModalDropdown
                                                                    style={{ flex: 1 }}
                                                                    options={[...(props.metaData?.enum_list?.time_start || time_start || [])]}
                                                                    dropdownStyle={[styles.dropdownItem]}
                                                                    onSelect={(id, value) => onChangeValue('recallTimeOther', value)}
                                                                    renderRow={(rowData, rowId, highlighted) => {
                                                                        return (
                                                                            <View style={{ backgroundColor: callLogData?.recallTimeOther?.label ? (callLogData?.recallTimeOther?.key === rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                                                <Text allowFontScaling={true} style={{
                                                                                    ...styles.rowDropdown
                                                                                }}>
                                                                                    {rowData.label}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    }}
                                                                    initialScrollIndex={callLogData?.recallTimeOther?.key ? getIndexTime(callLogData?.recallTimeOther?.key, 'Minutes') : 0}
                                                                >
                                                                    <View style={{
                                                                        ...styles.dropdownView
                                                                    }}>
                                                                        <Text allowFontScaling={true} >{callLogData?.recallTimeOther?.label || ''}</Text>
                                                                        <Icon
                                                                            name='clock-o'
                                                                            type='FontAwesome'
                                                                            style={{ ...styles.iconDropdownView }}
                                                                        />
                                                                    </View>
                                                                </ModalDropdown>


                                                            </View>
                                                        </View>
                                                    )
                                                }

                                            </>
                                        )
                                            : null
                                    }

                                    {
                                        callLogData?.resultCall?.key === 'call_result_customer_interested' ? (
                                            <>
                                                {/* Họ và tên */}
                                                <View style={{ ...styles.inputContainer }}>
                                                    <View style={{ ...styles.inputContentTitle }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>{
                                                            getLabel('call_log.name_label')
                                                        }</Text>
                                                    </View>
                                                    <View style={{ ...styles.inputGroupContent }}>
                                                        <ModalDropdown
                                                            style={{ flex: 1 }}
                                                            options={[...Global.getEnum('Leads', 'salutationtype')]}
                                                            dropdownStyle={[styles.dropdownItem]}
                                                            onSelect={(id, value) => onChangeValue('userInfo', value, 'salutationtype')}
                                                            renderRow={(rowData, rowId, highlighted) => {
                                                                return (
                                                                    <View style={{
                                                                        backgroundColor: (callLogData?.userInfo?.salutationtype?.key ? (rowData.key === callLogData?.userInfo?.salutationtype?.key ? '#d0d0d0' : '#fff') : '#fff')
                                                                    }}>
                                                                        <Text allowFontScaling={true} style={{
                                                                            ...styles.rowDropdown
                                                                        }}>
                                                                            {rowData.label}
                                                                        </Text>
                                                                    </View>
                                                                )
                                                            }

                                                            }
                                                        >
                                                            <View style={{
                                                                ...styles.dropdownView
                                                            }}
                                                            >
                                                                <Text allowFontScaling={true} >
                                                                    {
                                                                        callLogData?.userInfo?.salutationtype?.label || getLabel('call_log.salutation_label')
                                                                    }
                                                                </Text>
                                                                <Icon
                                                                    name='caret-down'
                                                                    type='FontAwesome'
                                                                    style={{ ...styles.iconDropdownView }} />
                                                            </View>
                                                        </ModalDropdown>

                                                        <View style={{ width: 4 }} />

                                                        <Input
                                                            placeholder={getLabel('call_log.last_name_label')}
                                                            value={callLogData?.userInfo?.lastname || ''}
                                                            style={{
                                                                backgroundColor: '#fff',
                                                                borderRadius: 4,
                                                                ...styles.inputRelated
                                                            }}
                                                            onChangeText={(value) => {
                                                                onChangeValue('userInfo', value, 'lastname')
                                                            }}
                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                        />

                                                        <View style={{ width: 4 }} />

                                                        <Input
                                                            placeholder={getLabel('call_log.first_name_label')}
                                                            value={callLogData?.userInfo?.firstname || ''}
                                                            style={{
                                                                backgroundColor: '#fff',
                                                                borderRadius: 4,
                                                                ...styles.inputRelated,
                                                            }}
                                                            onChangeText={(value) => {
                                                                onChangeValue('userInfo', value, 'firstname')
                                                            }}
                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                        />
                                                    </View>
                                                </View>

                                                {/* Số điện thoại */}
                                                <View style={{ ...styles.inputContainer }}>
                                                    <View style={{ ...styles.inputContentTitle }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>{
                                                            getLabel('call_log.phone_number_label')
                                                        }</Text>
                                                    </View>
                                                    <View style={{ ...styles.inputRelatedContent }}>
                                                        <Input
                                                            keyboardType='numeric'
                                                            value={callLogData?.userInfo?.mobile_phone || ''}
                                                            style={{ ...styles.inputRelated }}
                                                            placeholder={getLabel('call_log.phone_number_label')}
                                                            onChangeText={(value) => {
                                                                onChangeValue('userInfo', value, 'mobile_phone')
                                                            }}
                                                            clearButtonMode='while-editing'
                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                        />
                                                    </View>
                                                </View>

                                                {/* Email */}
                                                <View style={{ ...styles.inputContainer }}>
                                                    <View style={{ ...styles.inputContentTitle }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>Email</Text>
                                                    </View>
                                                    <View style={{ ...styles.inputRelatedContent }}>
                                                        <Input
                                                            keyboardType='email-address'
                                                            returnKeyType='done'
                                                            clearButtonMode='while-editing'
                                                            placeholder='Email'
                                                            value={callLogData?.userInfo?.email || ''}
                                                            style={{
                                                                ...styles.inputRelated
                                                            }}
                                                            onChangeText={(value) => {
                                                                onChangeValue('userInfo', value, 'email')
                                                            }}
                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                        />
                                                    </View>
                                                </View>

                                                {/* Công ty */}
                                                {
                                                    (callLogData?.userInfo?.record_module == 'Contacts') ?
                                                        (
                                                            <>

                                                                <View style={{ ...styles.inputContainer }}>
                                                                    <View style={{ ...styles.inputContentTitle }}>
                                                                        <Text allowFontScaling={true} style={styles.txtWhite}>
                                                                            {getLabel('call_log.company_label')}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={{ ...styles.inputRelatedContent }}>
                                                                        <Input
                                                                            clearTextOnFocus={true}
                                                                            disabled={true}
                                                                            value={callLogData?.userInfo?.accountSelected?.accountname || ''}
                                                                            style={{ ...styles.inputRelated }}
                                                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                                        />
                                                                        <TouchableOpacity
                                                                            onPress={() => {
                                                                                setShowModalRelated(true);
                                                                                setTimeout(() => {
                                                                                    searchAccount('first_load')
                                                                                }, 600)
                                                                            }}
                                                                            style={{ ...styles.btnSearchCompany }}>
                                                                            <Icon
                                                                                name='search'
                                                                                style={{ ...styles.iconSearch }}
                                                                            />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>

                                                            </>
                                                        )
                                                        :
                                                        (
                                                            <View style={{ ...styles.inputContainer }}>
                                                                <View style={{ ...styles.inputContentTitle }}>
                                                                    <Text allowFontScaling={true} style={styles.txtWhite}>
                                                                        {getLabel('call_log.company_label')}
                                                                    </Text>
                                                                </View>
                                                                <View style={{ ...styles.inputRelatedContent }}>
                                                                    <Input
                                                                        returnKeyType='done'
                                                                        clearButtonMode='while-editing'
                                                                        selectTextOnFocus={true}
                                                                        value={callLogData?.userInfo?.company || ''}
                                                                        onChangeText={(value) => { onChangeValue('userInfo', value, 'company') }}
                                                                        style={{ ...styles.inputRelated }}
                                                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                                    />
                                                                </View>
                                                            </View>
                                                        )
                                                }

                                                {/* Sản phẩm quan tâm */}
                                                <View style={{ ...styles.multiplePickList }}>
                                                    <View
                                                        style={{
                                                            ...styles.headerMultiplePickList
                                                        }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>
                                                            {getLabel('call_log.products_label')}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            ...styles.containMultiplePickList
                                                        }}
                                                    >
                                                        {
                                                            callLogData?.userInfo?.productSelectedList?.map((product, idx) => {
                                                                return (
                                                                    <View
                                                                        key={idx}
                                                                        style={{
                                                                            ...styles.itemPickListContain
                                                                        }}
                                                                    >
                                                                        <TouchableOpacity
                                                                            style={{
                                                                                ...styles.btnRemoveItem
                                                                            }}
                                                                            onPress={() => {
                                                                                let callLogTemp = { ...(callLogData) };
                                                                                let userInfo = { ...(callLogData?.userInfo || {}) }
                                                                                let productSelectedList = [...userInfo?.productSelectedList];
                                                                                productSelectedList.splice(idx, 1);
                                                                                userInfo.productSelectedList = productSelectedList;
                                                                                userInfo.rawProductSelectedList = productSelectedList;
                                                                                callLogTemp.userInfo = userInfo;
                                                                                setCallLogData(callLogTemp);
                                                                            }}
                                                                        >
                                                                            <Icon
                                                                                name='close'
                                                                                style={{
                                                                                    ...styles.iconRemove
                                                                                }}
                                                                            />
                                                                        </TouchableOpacity>
                                                                        <View
                                                                            style={{
                                                                                maxWidth: width / 3 * 2 - 50,
                                                                                paddingRight: 4
                                                                            }}
                                                                        >
                                                                            <Text allowFontScaling={true}
                                                                                numberOfLines={1}
                                                                            >
                                                                                {product?.label || ''}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            })
                                                        }

                                                        <TouchableOpacity
                                                            style={{
                                                                ...styles.btnAdd
                                                            }}
                                                            onPress={() => {
                                                                setShowModalProduct(true);
                                                                setTimeout(() => {
                                                                    searchProduct('first_load')
                                                                }, 1000)
                                                            }}
                                                        >
                                                            <Icon
                                                                name='add'
                                                                style={{ ...styles.iconAdd }} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                {/* Dịch vụ quan tâm */}
                                                <View style={{ ...styles.multiplePickList }}>
                                                    <View style={{
                                                        ...styles.headerMultiplePickList
                                                    }}>
                                                        <Text allowFontScaling={true} style={styles.txtWhite}>
                                                            {getLabel('call_log.service_label')}
                                                        </Text>
                                                    </View>
                                                    <View style={{
                                                        ...styles.containMultiplePickList
                                                    }}>
                                                        {
                                                            callLogData?.userInfo?.serviceSelectedList?.map((service, idx) => {
                                                                return (
                                                                    <View
                                                                        key={idx}
                                                                        style={{
                                                                            ...styles.itemPickListContain
                                                                        }}>
                                                                        <TouchableOpacity
                                                                            style={{
                                                                                ...styles.btnRemoveItem
                                                                            }}
                                                                            onPress={() => {
                                                                                let callLogTemp = { ...(callLogData) };
                                                                                let userInfo = { ...(callLogData?.userInfo || {}) }
                                                                                let serviceSelectedList = [...userInfo?.serviceSelectedList];
                                                                                serviceSelectedList.splice(idx, 1);
                                                                                userInfo.serviceSelectedList = serviceSelectedList;
                                                                                userInfo.rawServiceSelectedList = serviceSelectedList;
                                                                                callLogTemp.userInfo = userInfo;
                                                                                setCallLogData(callLogTemp)
                                                                            }}
                                                                        >
                                                                            <Icon
                                                                                name='close'
                                                                                style={{ ...styles.iconRemove }}
                                                                            />
                                                                        </TouchableOpacity>
                                                                        <View
                                                                            style={{
                                                                                maxWidth: width / 3 * 2 - 50,
                                                                                paddingRight: 4
                                                                            }}>
                                                                            <Text allowFontScaling={true}
                                                                                numberOfLines={1}
                                                                            >
                                                                                {service?.label || ''}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            })
                                                        }

                                                        <TouchableOpacity
                                                            style={{
                                                                ...styles.btnAdd
                                                            }}
                                                            onPress={() => {
                                                                setShowModalService(true);

                                                                setTimeout(() => {
                                                                    searchService('first_load')
                                                                }, 1000)
                                                            }}
                                                        >
                                                            <Icon
                                                                name='add'
                                                                style={{
                                                                    ...styles.iconAdd
                                                                }}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>

                                                </View>

                                            </>
                                        )
                                            : null
                                    }

                                </View>

                                <View style={{ height: 40 }} />
                            </Content>

                            <View
                                style={{
                                    minHeight: 56,
                                    ...styles.actionsBottom,
                                    ...(props.hasCreateNewCustomer ? { alignItems: 'center' } : { justifyContent: 'center', alignItems: 'center' })
                                }}
                            >

                                {
                                    props.hasCreateNewCustomer ? (
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: 5,
                                                paddingHorizontal: 12,
                                                backgroundColor: '#e0e0e0',
                                                borderRadius: 4,
                                                height: 36,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => setShowCreateCustomer(true)}
                                        >
                                            <Text allowFontScaling={true} >{
                                                getLabel('softPhone.create_new_customer_btn')
                                            }</Text>
                                        </TouchableOpacity>
                                    )
                                        : null
                                }

                                {
                                    props.syncCall?.calling ? (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    props.onSaveLogToCache?.(callLogData);
                                                }}
                                                style={{
                                                    paddingVertical: 5,
                                                    paddingHorizontal: 12,
                                                    borderRadius: 4,
                                                    borderWidth: 1,
                                                    borderColor: '#fff',
                                                    marginRight: 12,
                                                    height: 36,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Text
                                                    allowFontScaling={true}
                                                    style={styles.txtWhite}
                                                >
                                                    {getLabel('softPhone.save_temp_btn')}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )
                                        : (
                                            <>
                                                <View style={{ flexDirection: 'row' }}>

                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            props.onSaveLog?.(callLogData, false);
                                                        }}
                                                        style={{
                                                            paddingVertical: 5,
                                                            paddingHorizontal: 12,
                                                            borderRadius: 4,
                                                            borderWidth: 1,
                                                            borderColor: '#fff',
                                                            marginRight: 12,
                                                            height: 36,
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Text
                                                            allowFontScaling={true}
                                                            style={styles.txtWhite}
                                                        >
                                                            {getLabel('softPhone.exit_btn')}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => {

                                                            !props.loadingSaveCallLog && props.onSaveLog?.(callLogData, false);
                                                        }}
                                                        style={{
                                                            paddingVertical: 5,
                                                            paddingHorizontal: 12,
                                                            backgroundColor: '#169bd5',
                                                            borderRadius: 4,
                                                            height: 36,
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {
                                                            props.loadingSaveCallLog ?
                                                                (
                                                                    <ActivityIndicator size='small' color={'#fff'}></ActivityIndicator>
                                                                )
                                                                :
                                                                (
                                                                    <Text
                                                                        allowFontScaling={true}
                                                                        style={styles.txtWhite}
                                                                    >
                                                                        {getLabel('softPhone.save_btn')}
                                                                    </Text>
                                                                )
                                                        }
                                                    </TouchableOpacity>

                                                </View>
                                            </>
                                        )
                                }
                            </View>
                        </SafeAreaView>
                    )
            }

            <Modal
                visible={isShowModalProduct}
            >
                <Container
                    style={{
                        flex: 1,
                        backgroundColor: '#fff'
                    }}
                >
                    <Header
                        style={{
                            backgroundColor: '#fff',
                            borderBottomWidth: 0
                        }}
                    >
                        <Left />
                        <Body style={{ flex: 8 }}>
                            <Title allowFontScaling={true} >
                                {getLabel('product_info.title')}
                            </Title>
                        </Body>
                        <Right>

                            <TouchableHighlight
                                style={{ marginRight: 10, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={0.3}
                                underlayColor='#d0d0d0'
                                onPress={() => {
                                    setShowModalProduct(false);
                                    onChangeValue('userInfo', callLogData?.userInfo?.rawProductSelectedList || [], 'productSelectedList')
                                }}
                            >
                                <CustomIcon name={getIcon('Close')} style={{ fontSize: 25 }} />
                            </TouchableHighlight>
                        </Right>
                    </Header>

                    <View
                        style={{
                            minHeight: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: width,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: '#ffffff',
                            borderBottomWidth: .5,
                            borderBottomColor: '#e2e2e2',
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: '#f0f0f0',
                                borderWidth: .5,
                                borderColor: '#e2e2e2',
                                alignItems: 'center',
                                borderRadius: 4
                            }}
                        >
                            <Input
                                style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                placeholder={getLabel('product_info.placeholder_label')}
                                clearButtonMode='while-editing'
                                value={productKeyword}
                                onChangeText={(value) => {
                                    setProductKeyword(value);
                                }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <TouchableOpacity
                                style={{ height: '100%', backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                onPress={() => {
                                    searchProduct('first_load')
                                }}
                            >
                                <Icon name='search' style={{ color: '#333', fontSize: 20 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#f0f0f0',
                            paddingTop: 12
                        }}
                    >

                        {
                            loadingProduct ?
                                (
                                    <View
                                        style={{
                                            paddingVertical: 10
                                        }}
                                    >
                                        <ActivityIndicator />
                                    </View>
                                )
                                : null
                        }
                        <FlatList
                            disableVirtualization={false}
                            data={[...(productList || [])]}
                            renderItem={({ item, index, separators }) => {
                                const productSelectedList = [...(callLogData?.userInfo?.productSelectedList || [])];
                                const hasIndexChecked = productSelectedList?.findIndex((selected) => selected?.productid === item?.productid)

                                return (

                                    <>
                                        <RadioButton
                                            style={{
                                                height: 42,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 12,
                                                borderBottomWidth: 0.7,
                                                borderBottomColor: '#b2b2b2'
                                            }}
                                            onSelect={() => {
                                                const product = item;
                                                if (hasIndexChecked != -1) {
                                                    productSelectedList.splice(hasIndexChecked, 1)
                                                } else {
                                                    productSelectedList.push(product)
                                                }

                                                onChangeValue('userInfo', productSelectedList, 'productSelectedList')
                                            }}
                                            label={item?.label || item?.name}
                                            selected={hasIndexChecked != -1}
                                            colorSelected={'#008ecf'}
                                        />
                                    </>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshingProduct}
                                    onRefresh={() => { searchProduct('refresh') }}
                                    tintColor='#309ed8'
                                    colors={['#309ed8', '#25add0', '#15c2c5']}
                                    progressBackgroundColor='#fff'
                                />
                            }
                            onEndReachedThreshold={0.5}
                            onEndReached={() => loadMoreProduct()}
                        />
                    </View>

                    <View style={{
                        minHeight: isIphoneX ? 74 : 54,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: width,
                        borderTopWidth: .5,
                        borderTopColor: '#e2e2e2',
                    }}>
                        <TouchableOpacity
                            style={{
                                paddingVertical: 5,
                                paddingHorizontal: 22,
                                backgroundColor: '#008ecf',
                                borderRadius: 4,
                                marginBottom: 8,
                                minHeight: 36,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                                setShowModalProduct(false);
                                onChangeValue('userInfo', callLogData?.userInfo?.productSelectedList || [], 'rawProductSelectedList')
                            }}>
                            <Text allowFontScaling={true} style={styles.txtWhite}>
                                {getLabel('product_info.confirm_btn')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Container>
            </Modal>

            <Modal
                visible={isShowModalService}
            >
                <Container
                    style={{
                        flex: 1,
                        backgroundColor: '#fff'
                    }}
                >
                    <Header
                        style={{
                            backgroundColor: '#fff',
                            borderBottomWidth: 0
                        }}
                    >
                        <Left />
                        <Body style={{ flex: 8 }}>
                            <Title allowFontScaling={true} >
                                {getLabel('service_info.title')}
                            </Title>
                        </Body>
                        <Right>
                            <TouchableHighlight
                                style={{
                                    marginRight: 10,
                                    borderRadius: 30,
                                    height: 40,
                                    width: 40,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                activeOpacity={0.3}
                                underlayColor='#d0d0d0'
                                onPress={() => {
                                    setShowModalService(false);
                                    onChangeValue('userInfo', callLogData?.userInfo?.rawServiceSelectedList || [], 'rawServiceSelectedList');
                                }}
                            >
                                <CustomIcon name={getIcon('Close')} style={{ fontSize: 25 }} />
                            </TouchableHighlight>
                        </Right>
                    </Header>

                    <View
                        style={{
                            minHeight: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: width,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: '#fff',
                            borderBottomWidth: .5,
                            borderBottomColor: '#e2e2e2',
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: '#f0f0f0',
                                borderWidth: .5,
                                borderColor: '#e2e2e2',
                                alignItems: 'center',
                                borderRadius: 4
                            }}
                        >
                            <Input
                                style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                placeholder={getLabel('service_info.placeholder_label')}
                                clearButtonMode='while-editing'
                                value={serviceKeyword}
                                onChangeText={(value) => {
                                    setAccountKeyword(value)
                                }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    searchService('first_load')
                                }}
                                style={{ height: '100%', backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                            >
                                <Icon name='search' style={{ color: '#333', fontSize: 20 }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#f0f0f0',
                            paddingTop: 12
                        }}
                    >
                        {
                            loadingService ?
                                (
                                    <View
                                        style={{
                                            paddingVertical: 10
                                        }}
                                    >
                                        <ActivityIndicator />
                                    </View>
                                )
                                : null
                        }
                        <FlatList
                            disableVirtualization={false}
                            data={[...(serviceList || [])]}
                            renderItem={({ item, index, separators }) => {
                                const serviceSelectedList = [...(callLogData?.userInfo?.serviceSelectedList || [])];
                                const hasIndexChecked = serviceSelectedList.findIndex((selected) => selected?.serviceid === item?.serviceid)

                                return (
                                    <RadioButton
                                        style={{
                                            height: 42,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: 12,
                                            borderBottomWidth: 0.7,
                                            borderBottomColor: '#b2b2b2'
                                        }}
                                        onSelect={() => {
                                            const service = item;
                                            if (hasIndexChecked != -1) {
                                                serviceSelectedList.splice(hasIndexChecked, 1)
                                            } else {
                                                serviceSelectedList.push(service)
                                            }

                                            onChangeValue('userInfo', serviceSelectedList, 'serviceSelectedList')
                                        }}
                                        label={item?.label}
                                        selected={hasIndexChecked != -1}
                                        colorSelected={'#008ecf'}
                                    />
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshingService}
                                    onRefresh={() => searchService('refresh')}
                                    tintColor='#309ed8'
                                    colors={['#309ed8', '#25add0', '#15c2c5']}
                                    progressBackgroundColor='#fff'
                                />
                            }
                            onEndReachedThreshold={0.5}
                            onEndReached={() => loadMoreService()}
                        />
                    </View>

                    <View style={{
                        minHeight: isIphoneX ? 74 : 54,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: width,
                        borderTopWidth: .5,
                        borderTopColor: '#e2e2e2',
                    }}>
                        <TouchableOpacity
                            style={{
                                paddingVertical: 5,
                                paddingHorizontal: 22,
                                backgroundColor: '#008ecf',
                                borderRadius: 4,
                                marginBottom: 8,
                                minHeight: 36,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={() => {
                                setShowModalService(false);
                                onChangeValue('userInfo', callLogData?.userInfo?.serviceSelectedList || [], 'rawServiceSelectedList');
                            }}>
                            <Text allowFontScaling={true} style={styles.txtWhite}>
                                {getLabel('product_info.confirm_btn')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Container>
            </Modal>

            <Modal
                visible={showModalRelated}
            >
                <Container
                    style={{
                        flex: 1,
                        backgroundColor: '#fff'
                    }}
                >
                    <Header
                        style={{
                            backgroundColor: '#fff',
                            borderBottomWidth: 0
                        }}
                    >
                        <Left>

                        </Left>
                        <Body>
                            <Title allowFontScaling={true} >
                                {getLabel('common.tab_related')}
                            </Title>
                        </Body>
                        <Right>
                            <TouchableHighlight
                                style={{ marginRight: 10, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={0.3}
                                underlayColor='#d0d0d0'
                                onPress={() => {
                                    setShowModalRelated(false);
                                }}
                            >
                                <CustomIcon name={getIcon('Close')} style={{ fontSize: 25 }} />
                            </TouchableHighlight>
                        </Right>
                    </Header>
                    <View
                        style={{
                            minHeight: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: width,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: '#fff',
                            borderBottomWidth: .5,
                            borderBottomColor: '#e2e2e2',
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: '#f0f0f0',
                                borderWidth: .5,
                                borderColor: '#e2e2e2',
                                alignItems: 'center',
                                borderRadius: 4
                            }}
                        >
                            <Input
                                style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                placeholder={getLabel('common.keyword_input_place_holder')}
                                placeholderTextColor="#878787"
                                value={accountKeyword}
                                clearButtonMode='while-editing'
                                onChangeText={(value) => setAccountKeyword(value)}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />

                            <TouchableOpacity
                                style={{ height: '100%', backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                onPress={() => {
                                    searchAccount()
                                }}
                            >
                                <Icon name='search' style={{ color: '#333', fontSize: 20 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        loadingAccount ?
                            (
                                <View
                                    style={{
                                        paddingVertical: 10
                                    }}
                                >
                                    <ActivityIndicator />
                                </View>
                            )
                            : null
                    }

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#f0f0f0',
                            paddingTop: 12
                        }}
                    >
                        <FlatList
                            data={accountList}
                            disableVirtualization={false}
                            renderItem={({ item, index, separators }) =>
                                <ListItem
                                    key={index}
                                    onPress={() => selectAccount(item)}
                                    style={{
                                        marginLeft: 0,
                                        backgroundColor: (callLogData?.userInfo?.accountSelected && (callLogData?.userInfo?.accountSelected?.accountid == item?.accountid)) ? '#e2e2e2' : '#f0f0f0'
                                    }}
                                >
                                    <Body>
                                        <Text allowFontScaling={true}
                                            style={{
                                                flex: 3,
                                                fontSize: 14,
                                                marginTop: 5,
                                                marginBottom: 5,
                                                marginLeft: 10,
                                                fontWeight: (Platform.OS === 'ios') ? '500' : undefined,
                                                color: '#18191a'
                                            }}>
                                            {item?.accountname || ''}
                                        </Text>
                                    </Body>
                                </ListItem>
                            }
                            keyExtractor={(item, index) => index.toString()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshingAccount}
                                    onRefresh={() => searchAccount('refresh')}
                                    tintColor='#309ed8'
                                    colors={['#309ed8', '#25add0', '#15c2c5']}
                                    progressBackgroundColor='#fff'
                                />
                            }
                            onEndReachedThreshold={0.5}
                            onEndReached={() => loadMoreAccount()}
                        />
                    </View>
                </Container>
            </Modal>

        </ImageBackground>
    )
}

export default CallLog;

const styles = StyleSheet.create({
    container: {
        width: width,
        height: height,
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: Number.MAX_SAFE_INTEGER,
    },
    actionsBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: isIphoneX ? 75 : 60,
        paddingHorizontal: 12
    },
    customerInfoContainer: {
        paddingHorizontal: 12,
        paddingTop: 20,
        flexDirection: 'row'
    },
    customerInfoContent: {
        justifyContent: 'center',
        paddingLeft: 10,
        flex: 1,
    },
    customerName: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold'
    },
    phoneNumber: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    companyName: {
        color: '#fff',
        fontSize: 14,
    },
    inputContainer: {
        minHeight: 42,
        marginVertical: 5
    },
    inputContentTitle: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5
    },
    inputRelatedContent: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    inputGroupContent: {
        flex: 2,
        flexDirection: 'row',
    },
    inputRelated: {
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        color: '#333',
        fontSize: 14,
        maxHeight: 42
    },
    btnSearchCompany: {
        width: 36,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d0d0d0',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4
    },
    iconSearch: {
        fontSize: 16,
        color: '#333'
    },
    txtWhite: {
        color: '#fff'
    },
    dropdownItem: {
        width: 150,
        position: 'absolute',
        padding: 5,
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 2,
        justifyContent: 'center',
        marginTop: -18
    },
    rowDropdown: {
        marginVertical: 8,
        marginHorizontal: 6,
        fontSize: 12,
        textAlign: 'left',
        textAlignVertical: 'center'
    },
    dropdownView: {
        backgroundColor: '#fff',
        borderRadius: 4,
        height: 42,
        paddingHorizontal: 4,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconDropdownView: {
        color: '#b2b2b2',
        fontSize: 16
    },
    otherViewContainer: {
        flexDirection: 'row',
        minHeight: 40,
        marginVertical: 5
    },
    multiplePickList: {
        minHeight: 40,
        marginVertical: 5
    },
    headerMultiplePickList: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5
    },
    containMultiplePickList: {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: 4,
        alignItems: 'center',
    },
    btnAdd: {
        backgroundColor: Colors.functional.primary,
        width: 25, height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 3,
        borderRadius: 4
    },
    iconAdd: {
        fontSize: 22,
        color: '#fff'
    },
    itemPickListContain: {
        flexDirection: 'row',
        backgroundColor: '#e2e2e2',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxHeight: 30,
        borderRadius: 4,
        margin: 3
    },
    btnRemoveItem: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconRemove: {
        color: '#333',
        fontSize: 18
    },
})