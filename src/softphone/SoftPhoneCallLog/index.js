import moment from 'moment-timezone';
import { Body, Container, Content, Header, Icon, Input, Left, ListItem, Right, Textarea, Title } from 'native-base';
import React, { Component } from 'react';
import {
    ActivityIndicator, Alert, DeviceEventEmitter,
    Dimensions, FlatList,
    Image, Modal, Platform,
    RefreshControl, Text, TouchableHighlight, TouchableOpacity, View
} from 'react-native';
import Toast from 'react-native-root-toast';
import variables from '../../../native-base-theme/variables/commonColor';
import ModalDropdown from '../../components/ModalDropdown';
import RadioButton from '../../components/RadioButton';
import RNDatePicker from '../../components/RNDatePicker';
import { Colors } from '../../themes/colors/Colors';
import { Icon as CustomIcon } from '../../themes/Icons/CustomIcon';
import { getIcon, getLabelWithGlobalInstance, widthDevice } from '../../utils/commons/commons';
import styles from './styles';

interface SoftPhoneCallLogProps {
    callLogData: {
        callPurpose: Object,
        callPurposeOther: String,
        callInBoundPurpose: Object,
        callInboundPurposeOther: String,
        startTime: String,
        endTime: String,
        subject: String,
        description: String,
        visibility: String,
        resultCall: Object,
        recallTime: Object,
        recallMoment: Object,
        recallTimeOther: Date,
        recallDateOther: Object,
        isOtherRecall: Boolean,
    };
    callId: String;
    metaData: Object;
    customerData: Object;
    isShowCreateCustomer: Boolean;
    isShowCallLog: Boolean;
    globalInstance: Object;
    direction: String;
    startTime: String;
    endTime: String;
}

export default class SoftPhoneCallLog extends Component<SoftPhoneCallLogProps> {

    constructor(props) {
        super(props)

        this.state = {
            callLogData: this.props.callLogData ? this.props.callLogData : {},
            metaData: this.props.metaData ? this.props.metaData : {},
            customerData: this.props.customerData ? this.props.customerData : {},
            productList: [],
            serviceList: [],
            isShowModalProduct: false,
            isShowModalService: false,
            loadingProduct: false,
            refreshingProduct: false,
            loadingService: false,
            refreshingService: false,
            pagingProduct: {},
            pagingService: {},
            productKeyword: '',
            serviceKeyword: '',
            rawListProduct: [],
            rawListService: [],
            productSelectedList: [],
            serviceSelectedList: [],
            rawProductSelectedList: [],
            rawServiceSelectedList: [],
            accountList: [],
            rawListAccount: [],
            accountKeyword: '',
            refreshing: false,
            loading: false,
            pagingAccount: {},
            accountSelected: {},
            showModalRelated: false,
        }
    }

    componentDidMount() {
        this.setState({
            metaData: this.props.metaData ? this.props.metaData : {},
            customerData: this.props.customerData ? this.props.customerData : {},
        }, () => {
            console.log('LOG.PROPDATA componentDidMount: ', JSON.stringify(this.props.customerData), this.state.customerData?.account_id_display, this.props.direction, this.props.startTime, ' s', this.props.endTime);
            const userInfo = {
                customer_id: this.state.customerData?.id || '',
                customer_type: this.state.customerData?.record_module === 'Contacts' ? 'Contacts' : 'Leads',
                account: {
                    account_id: this.state.customerData?.account_id || '',
                    account_name: this.state.customerData?.account_id_display || '',
                },
                salutationtype: this.state.customerData?.salutationtype ?
                    {
                        key: this.state.customerData?.salutationtype,
                        label: this.props.globalInstance.getEnumLabel(this.state.customerData?.record_module, 'salutationtype', this.state.customerData.salutationtype),
                    } :
                    {},
                lastname: this.state.customerData?.lastname || '',
                firstname: this.state.customerData?.firstname || '',
                mobile_phone: this.state.customerData?.mobile || this.props.phoneNumber || '',
                email: this.state.customerData?.email || '',
                product_ids: this.state.customerData?.product_ids || [],
                service_ids: this.state.customerData?.services_ids || [],
                company: this.state.customerData?.company || '',
            }
            let product_ids = this.props.customerData?.product_ids?.map((product) => {
                return {
                    productid: product.id,
                    label: product.text
                }
            }) || [];

            let services_ids = this.props.customerData?.services_ids?.map((service) => {
                return {
                    serviceid: service.id,
                    label: service.text
                }
            }) || [];

            const account = {
                accountid: this.state.customerData?.account_id || '',
                accountname: this.state.customerData?.account_id_display || '',
            }

            console.log('LOG.DATA USERINFOR: ', userInfo);

            this.setState({
                productSelectedList: product_ids,
                rawProductSelectedList: product_ids,
                serviceSelectedList: services_ids,
                rawServiceSelectedList: services_ids,
                accountSelected: account
            }, () => {
                this.state.callLogData.visibility = this.state.callLogData?.visibility || 'PUBLIC';
                this.onChangeValue('userInfo', userInfo);
            })
        });

        DeviceEventEmitter.addListener('SoftPhone.hasOtherCallIncoming', (data) => {
            if (data.hasOtherCallIncoming) {
                this.parseDataCallLog(true);
            }
        })
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('SoftPhone.hasOtherCallIncoming')
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        console.log('LOG.PROPDATA componentDidMount: ', JSON.stringify(nextProps.customerData));
        if (!nextProps.hasCallLogTemp) {
            this.setState({
                metaData: nextProps.metaData ? nextProps.metaData : {},
                customerData: nextProps.customerData ? nextProps.customerData : {},
            }, () => {
                const userInfo = {
                    customer_id: this.state.customerData?.id || '',
                    customer_type: this.state.customerData?.record_module === 'Contacts' ? 'Contacts' : 'Leads',
                    account: {
                        account_id: this.state.customerData?.account_id || '',
                        account_name: this.state.customerData?.account_id_display || '',
                    },
                    salutationtype: this.state.customerData?.salutationtype ?
                        {
                            key: this.state.customerData?.salutationtype,
                            label: this.props.globalInstance.getEnumLabel(this.state.customerData?.record_module, 'salutationtype', this.state.customerData.salutationtype),
                        }
                        : {},
                    lastname: this.state.customerData?.lastname || '',
                    firstname: this.state.customerData?.firstname || '',
                    mobile_phone: this.state.customerData?.mobile || nextProps.phoneNumber || '',
                    email: this.state.customerData?.email || '',
                    product_ids: this.state.customerData?.product_ids || [],
                    service_ids: this.state.customerData?.services_ids || [],
                    company: this.state.customerData?.company || '',
                }

                let product_ids = this.state.customerData?.product_ids?.map((product) => {
                    return {
                        productid: product.id,
                        label: product.text
                    }
                }) || [];

                let services_ids = this.state.customerData?.services_ids?.map((service) => {
                    return {
                        serviceid: service.id,
                        label: service.text
                    }
                }) || [];

                const account = {
                    accountid: this.state.customerData?.account_id || '',
                    accountname: this.state.customerData?.account_id_display || '',
                }

                this.setState({
                    accountSelected: account,
                    productSelectedList: product_ids,
                    rawProductSelectedList: product_ids,
                    serviceSelectedList: services_ids,
                    rawServiceSelectedList: services_ids,
                }, () => {
                    this.state.callLogData.visibility = this.state.callLogData?.visibility || 'PUBLIC';
                    this.onChangeValue('userInfo', userInfo);
                })
            });
        }
    }

    onChangeValue(key, value, subKey) {
        const { callLogData } = this.state;

        if (key) {
            if (subKey) {
                callLogData[key][subKey] = value;

            } else {
                callLogData[key] = value;

            }
        }

        this.setState({ callLogData: callLogData })
    }

    parseDataCallLog(hasOtherCallIncoming) {
        const title = `${getLabelWithGlobalInstance('common.undefine_label', this.props.globalInstance.locale)} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;

        let callLog = {
            pbx_call_id: this.props.callId,
            subject: this.state.callLogData?.subject || title,
            description: this.state.callLogData?.description || '',
            direction: this.props.direction,
            start_time: this.props.startTime ? moment(this.props.startTime || new Date).format('YYYY-MM-DD HH:mm:ss') : '',
            end_time: this.props.endTime ? moment(this.props.endTime || new Date).format('YYYY-MM-DD HH:mm:ss') : '',
            events_call_result: this.state.callLogData?.resultCall?.key || [...(this.state.metaData?.enum_list?.events_call_result || [])]?.[0]?.key || '',
            visibility: this.state.callLogData?.visibility || 'PUBLIC',
            customer_id: this.state.callLogData?.userInfo?.customer_id,
        };

        if (this.props.direction === 'INBOUND') {
            callLog.events_inbound_call_purpose = this.state.callLogData?.callInBoundPurpose?.key || '';
            callLog.events_inbound_call_purpose_other = this.state.callLogData?.callPurposeOther || '';
        }
        else {
            callLog.events_call_purpose = this.state.callLogData?.callPurpose?.key || '';
            callLog.events_call_purpose_other = this.state.callLogData?.callPurposeOther || '';
        }

        if (this.state.callLogData?.resultCall?.key === 'call_result_call_back_later') {
            const call_back = {
                call_back_time_other: this.state.callLogData?.isOtherRecall ? 1 : 0,
            }

            if (this.state.callLogData?.isOtherRecall) {
                call_back.date_start = this.state.callLogData?.recallDateOther ? moment(this.state.callLogData?.recallDateOther, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment(new Date()).add(1, 'day').format('YYYY-MM-DD');
                call_back.time_start = this.state.callLogData?.recallTimeOther?.key || ''
            }
            else {
                call_back.select_time = this.state.callLogData?.recallTime?.key || '';
                call_back.select_moment = this.state.callLogData?.recallMoment?.key || ''
            }

            callLog.call_back = call_back
        }

        if (this.state.callLogData?.resultCall?.key === 'call_result_customer_interested') {
            const userInfo = {
                customer_id: this.state.callLogData?.userInfo?.customer_id || '',
                customer_type: this.state.callLogData?.userInfo?.customer_type || '',
                account: {
                    account_id: this.state.customerData?.account_id || '',
                    account_name: this.state.customerData?.account_id_display || '',
                },
                salutationtype: this.state.callLogData?.userInfo?.salutationtype?.key || '',
                lastname: this.state.callLogData?.userInfo?.lastname || '',
                firstname: this.state.callLogData?.userInfo?.firstname || '',
                mobile_phone: this.state.callLogData?.userInfo?.mobile_phone || '',
                email: this.state.callLogData?.userInfo?.email || '',
            }

            if (this.state.accountSelected && Object.keys(this.state.accountSelected).length > 0) {
                const account = {
                    account_id: this.state.accountSelected?.accountid || '',
                    account_name: this.state.accountSelected?.accountname || '',
                }
                userInfo.account = account;
            }
            else {
                const account = {
                    account_id: this.state.customerData?.account_id || '',
                    account_name: this.state.customerData?.account_id_display || '',
                }

                userInfo.account = account;
            }

            let product_ids = this.state.productSelectedList.map((product) => {
                return product.productid;
            })

            let service_ids = this.state.serviceSelectedList.map((service) => {
                return service.serviceid;
            })

            if (this.state.callLogData?.userInfo?.customer_type === 'Leads') {
                userInfo.company = this.state.callLogData?.userInfo?.company || '';
            }

            userInfo.product_ids = product_ids || [];
            userInfo.service_ids = service_ids || [];


            callLog.customer_data = userInfo
        }

        console.log('LOG.CAllLOG DATA: ', JSON.stringify(callLog));
        this.props.context.saveCallLog(callLog, hasOtherCallIncoming);
    }

    searchProduct(loadType) {
        // Do request
        if (loadType == 'refresh') {
            this.setState({ loadingProduct: false });
            this.setState({ refreshingProduct: true });
        }
        else {
            this.setState({ loadingProduct: true });
            this.setState({ refreshingProduct: false });
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (this.state.pagingProduct.next_offset) {
                offset = this.state.pagingProduct.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetProductList',
            Params: {
                keyword: this.state.productKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        this.props.globalInstance.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Alert.alert(getLabelWithGlobalInstance('common.msg_no_results_found', this.props.globalInstance.locale));
                return;
            }

            var listData = data.entry_list;
            var list = listData;

            if (loadType == 'load_more') {
                var list = this.state.rawListProduct.concat(listData);
            }

            this.setState({
                pagingProduct: data.paging,
                rawListProduct: list,
                productList: list,
                loadingProduct: false,
                refreshingProduct: false
            });
        }, error => {
            this.setState({
                loadingProduct: false,
                refreshingProduct: false
            });
            Alert.alert(getLabelWithGlobalInstance('common.msg_connection_error', this.props.globalInstance.locale));
        });
    }

    searchService(loadType) {
        // Do request
        if (loadType == 'refresh') {
            this.setState({ loadingService: false });
            this.setState({ refreshingService: true });
        }
        else {
            this.setState({ loadingService: true });
            this.setState({ refreshingService: false });
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (this.state.pagingService.next_offset) {
                offset = this.state.pagingService.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetServiceList',
            Params: {
                keyword: this.state.serviceKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        this.props.globalInstance.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Alert.alert(getLabelWithGlobalInstance('common.msg_no_results_found', this.props.globalInstance.locale));
                return;
            }

            var listData = data.entry_list;
            var list = listData;

            if (loadType == 'load_more') {
                var list = this.state.rawListService.concat(listData);
            }

            this.setState({
                pagingService: data.paging,
                rawListService: list,
                serviceList: list,
                loadingService: false,
                refreshingService: false
            });
        }, error => {
            this.setState({
                loadingService: false,
                refreshingService: false
            });
            Alert.alert(getLabelWithGlobalInstance('common.msg_connection_error', this.props.globalInstance.locale));
        });
    }

    loadMoreProduct() {
        if (this.state.pagingProduct && this.state.pagingProduct.next_offset) {
            this.searchProduct('load_more');
        }
    }

    loadMoreService() {
        if (this.state.pagingService && this.state.pagingService.next_offset) {
            this.searchService('load_more');
        }
    }

    searchAccount(loadType) {
        // Do request
        if (loadType == 'refresh') {
            this.setState({ loading: false });
            this.setState({ refreshing: true });
        }
        else {
            this.setState({ loading: true });
            this.setState({ refreshing: false });
        }

        var offset = 0;

        if (loadType == 'load_more') {
            if (this.state.pagingAccount.next_offset) {
                offset = this.state.pagingAccount.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetAccountList',
            Params: {
                keyword: this.state.accountKeyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        this.props.globalInstance.callAPI(this, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabelWithGlobalInstance('common.msg_no_results_found', this.props.globalInstance.locale));
                return;
            }

            var listData = data.entry_list;
            var list = listData;

            if (loadType == 'load_more') {
                var list = this.state.rawListAccount.concat(listData);
            }

            this.setState({
                pagingAccount: data.paging,
                rawListAccount: list,
                accountList: list
            });
        }, error => {
            Toast.show(getLabelWithGlobalInstance('common.msg_connection_error', this.props.globalInstance.locale));
        });
    }

    selectAccount(account) {
        this.setState({ accountSelected: account, showModalRelated: false });
    }

    loadMoreAccount() {
        if (this.state.pagingAccount && this.state.pagingAccount.next_offset) {
            this.searchAccount('load_more');
        }
    }

    getIndexTime(time, type: 'Not minutes' | 'Minutes') {
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

    render() {
        const avatar = this.state.customerData?.customer_avatar ? { uri: this.state.customerData?.customer_avatar } : require('../../assets/images/avatar.jpg')
        console.log('LOG.ACCOUNT DATA: ', this.state.callLogData.userInfo);
        return (

            <>
                <Content>
                    <View style={{ height: variables.isIphoneX ? 64 : 34 }} />
                    <View style={styles.userInfoContent}>
                        <View style={styles.avatarContent}>
                            <Image source={avatar} style={styles.avatar} />
                        </View>
                        <View style={styles.profileContent}>
                            {
                                this.state.customerData && Object.keys(this.state.customerData).length > 0 ?
                                    (
                                        <Text  allowFontScaling={true}  numberOfLines={1} style={styles.txtName}>{this.state.customerData?.salutationtype ? ((this.props.globalInstance.getEnumLabel(this.state.customerData?.record_module, 'salutationtype', this.state.customerData?.salutationtype) || '') + ' ') : ''}{this.state.customerData?.full_name}</Text>
                                    )
                                    :
                                    (
                                        <Text  allowFontScaling={true}  numberOfLines={1} style={styles.txtName}>{
                                            getLabelWithGlobalInstance('common.undefine_label', this.props.globalInstance.locale)
                                        }</Text>
                                    )
                            }
                            <Text  allowFontScaling={true}  style={styles.txtPhoneNumber}>+{this.state.customerData?.mobile || this.props.phoneNumber}</Text>
                            <Text  allowFontScaling={true}  numberOfLines={2} style={styles.txtCompanyName}>{this.state.customerData?.account_id_display}</Text>
                        </View>
                    </View>

                    <View style={styles.formCallLog}>
                        <Text  allowFontScaling={true}  style={[styles.txtHeading, styles.txtWhite]}>{
                            getLabelWithGlobalInstance('call_log.information_call_title', this.props.globalInstance.locale, { direction: this.props.direction === 'INBOUND' ? getLabelWithGlobalInstance('call_log.direction_incoming_label', this.props.globalInstance.locale) : getLabelWithGlobalInstance('call_log.direction_call_out_label', this.props.globalInstance.locale) })
                        }</Text>
                        <View style={{ height: 12 }} />

                        {/* Mục đích cuộc gọi */}
                        <View style={{ ...styles.inputContainer }}>
                            <View style={{ ...styles.inputContentTitle }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                    getLabelWithGlobalInstance('call_log.target_label', this.props.globalInstance.locale)
                                }</Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <ModalDropdown
                                    style={{ flex: 1 }}
                                    options={this.props.direction === 'INBOUND' ? [...(this.state.metaData?.enum_list?.events_inbound_call_purpose || [])] : [...(this.state.metaData?.enum_list?.events_call_purpose || [])]}
                                    dropdownStyle={[styles.dropdownItem]}
                                    onSelect={(id, value) => {
                                        const title = `[${value?.label}] ${this.state.customerData?.full_name || getLabelWithGlobalInstance('common.undefine_label', this.props.globalInstance.locale)} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
                                        if (this.props.direction === 'INBOUND') {
                                            this.onChangeValue('callInBoundPurpose', value);
                                            this.onChangeValue('subject', title);
                                        } else {
                                            this.onChangeValue('callPurpose', value);
                                            this.onChangeValue('subject', title);
                                        }
                                    }}

                                    renderRow={(rowData, rowId, highlighted) => {
                                        return (
                                            <View style={{ backgroundColor: this.state.callLogData?.callInBoundPurpose?.key ? (this.state.callLogData?.callInBoundPurpose?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                <Text  allowFontScaling={true}  style={{
                                                    ...styles.rowDropdown
                                                }}>
                                                    {rowData.label}
                                                </Text>
                                            </View>
                                        )
                                    }}
                                >
                                    <View style={{ ...styles.dropdownView }}>
                                        <Text  allowFontScaling={true} >{this.props.direction === 'INBOUND' ? (this.state.callLogData?.callInBoundPurpose?.label || this.state.metaData?.field_list?.events_inbound_call_purpose?.label || '') : (this.state.callLogData?.callPurpose?.label || this.state.metaData?.field_list?.events_call_purpose?.label || '')}</Text>
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
                            (this.state.callLogData?.callPurpose?.key === 'call_purpose_other' || this.state.callLogData?.callInBoundPurpose?.key === 'inbound_call_purpose_other') ?
                                (
                                    <View style={{ ...styles.inputContainer }}>
                                        <View style={{ ...styles.inputContentTitle }}>
                                            <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                                getLabelWithGlobalInstance('call_log.target_other_label', this.props.globalInstance.locale)
                                            }</Text>
                                        </View>
                                        <View style={{ ...styles.inputRelatedContent }}>
                                            <Input
                                                style={{ ...styles.inputRelated }}
                                                value={this.state.callLogData?.callPurposeOther || ''}
                                                placeholder={getLabelWithGlobalInstance('call_log.target_other_label', this.props.globalInstance.locale)}
                                                selectTextOnFocus={true}
                                                onChangeText={(value) => {
                                                    const title = `[${value}] ${this.state.customerData?.full_name || getLabelWithGlobalInstance('common.undefine_label', this.props.globalInstance.locale)} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
                                                    this.onChangeValue('callPurposeOther', value);
                                                    this.onChangeValue('subject', title);
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
                                <Text  allowFontScaling={true} 
                                    style={styles.txtWhite}
                                >
                                    {this.state.metaData?.field_list?.subject?.label || ''}
                                </Text>
                            </View>
                            <View style={{ ...styles.inputRelatedContent }}>
                                <Input
                                    style={{ ...styles.inputRelated }}
                                    value={this.state.callLogData?.subject || ''}
                                    placeholder={this.state.metaData?.field_list?.subject?.label || ''}
                                    selectTextOnFocus={true}
                                    onChangeText={(value) => {
                                        this.onChangeValue('subject', value)
                                    }}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                            </View>
                        </View>

                        {/* Mô tả */}
                        <View style={{ ...styles.inputContainer }}>
                            <View style={{ ...styles.inputContentTitle }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{this.state.metaData?.field_list?.description?.label || ''}</Text>
                            </View>
                            <View style={{ flex: 2, backgroundColor: Colors.white.white1, borderRadius: 4 }}>
                                <Textarea
                                    style={{
                                        ...styles.inputRelated
                                    }}
                                    placeholder={this.state.metaData?.field_list?.description?.label || ''}
                                    value={this.state.callLogData?.description || ''}
                                    selectTextOnFocus={true}
                                    onChangeText={(value) => {
                                        this.onChangeValue('description', value)
                                    }}
                                />
                            </View>
                        </View>

                        {/* Chế độ lưu */}
                        <View style={{
                            flexDirection: 'row',
                            ...styles.inputContainer
                        }}
                        >
                            <View style={{ ...styles.inputContentTitle }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{this.state.metaData?.field_list?.visibility?.label || ''}</Text>
                            </View>
                            <View style={{
                                flex: 2,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                            >
                                <RadioButton
                                    label={getLabelWithGlobalInstance('call_log.public_label', this.props.globalInstance.locale)}
                                    labelStyle={{
                                        color: Colors.white.white1
                                    }}
                                    onSelect={() => {
                                        this.onChangeValue('visibility', 'PUBLIC')
                                    }}
                                    colorSelected={Colors.white.white1}
                                    color={Colors.white.white1}
                                    selected={this.state.callLogData?.visibility === 'PUBLIC'}
                                />

                                <View style={{ paddingHorizontal: 8 }} />

                                <RadioButton
                                    label={getLabelWithGlobalInstance('call_log.private_label', this.props.globalInstance.locale)}
                                    labelStyle={{
                                        color: Colors.white.white1
                                    }}
                                    onSelect={() => {
                                        this.onChangeValue('visibility', 'PRIVATE')
                                    }}
                                    colorSelected={Colors.white.white1}
                                    color={Colors.white.white1}
                                    selected={this.state.callLogData?.visibility === 'PRIVATE'}
                                />
                            </View>
                        </View>

                        {/* Kết quả */}
                        <View style={{ ...styles.inputContainer }}>
                            <View style={{ ...styles.inputContentTitle }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                    getLabelWithGlobalInstance('call_log.result_label', this.props.globalInstance.locale)
                                }</Text>
                            </View>
                            <View style={{ ...styles.inputRelatedContent }}>
                                <ModalDropdown
                                    style={{ flex: 1 }}
                                    options={[...this.state.metaData?.enum_list?.events_call_result || []]}
                                    dropdownStyle={[styles.dropdownItem]}
                                    onSelect={(id, value) => {
                                        this.onChangeValue('resultCall', value)

                                        if (value?.key === 'call_result_call_back_later') {
                                            const hoursNow = parseInt(moment(new Date()).format('HH'));
                                            const selectedTime = [...(this.state.metaData?.enum_list?.select_time || [])];
                                            const selectedMoment = [...(this.state.metaData?.enum_list?.select_moment || [])];
                                            const timeStart = [...(this.state.metaData?.enum_list?.time_start || [])];

                                            if (hoursNow < 12) {
                                                const indexSelectedTime = selectedTime?.findIndex((time) => time?.key === '02:00');
                                                const indexTimeStart = timeStart?.findIndex((time) => time?.key === '14:00');

                                                this.onChangeValue('recallTime', selectedTime[indexSelectedTime]);
                                                this.onChangeValue('recallTimeOther', timeStart[indexTimeStart]);
                                                this.onChangeValue('recallMoment', selectedMoment[0]);
                                            } else if (hoursNow > 14) {
                                                const indexSelectedTimes = selectedTime?.findIndex((time) => time?.key === '08:00');
                                                const indexTimeStarts = timeStart?.findIndex((time) => time?.key === '08:00');
                                                this.onChangeValue('recallTime', selectedTime[indexSelectedTimes]);
                                                this.onChangeValue('recallTimeOther', timeStart[indexTimeStarts]);
                                                this.onChangeValue('recallMoment', selectedMoment[1]);
                                            }

                                            this.setState({ isShowRepeat: true })
                                        } else {
                                            this.setState({ isShowRepeat: false })
                                        }

                                        if (value?.key === 'call_result_customer_interested') {
                                            this.setState({ isShowInfoCustomer: true })
                                        } else {
                                            this.setState({ isShowInfoCustomer: false })
                                        }
                                    }}
                                    renderRow={(rowData, rowId, highlighted) => {
                                        return (
                                            <View style={{ backgroundColor: this.state.callLogData?.resultCall?.key ? (this.state.callLogData?.resultCall?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                <Text  allowFontScaling={true}  style={{
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
                                        <Text  allowFontScaling={true} >{this.state.callLogData?.resultCall?.label || this.state.metaData?.field_list?.events_call_result?.label || ''}</Text>
                                        <Icon
                                            name='caret-down'
                                            type='FontAwesome'
                                            style={{ ...styles.iconDropdownView }}
                                        />
                                    </View>
                                </ModalDropdown>
                            </View>
                        </View>

                        {
                            this.state.isShowRepeat ?
                                (
                                    <>
                                        {/* Gọi lại vào */}

                                        {
                                            !this.state.callLogData?.isOtherRecall ?
                                                (
                                                    <View style={{
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
                                                                disabled={this.state.callLogData?.isOtherRecall}
                                                                options={[...(this.state.metaData?.enum_list?.select_time || [])]}
                                                                dropdownStyle={[styles.dropdownItem]}
                                                                onSelect={(id, value) => this.onChangeValue('recallTime', value)}
                                                                renderRow={(rowData, rowId, highlighted) => {
                                                                    return (
                                                                        <View
                                                                            style={{
                                                                                borderRadius: 4,
                                                                                backgroundColor: this.state.callLogData?.recallTime?.key ? (this.state.callLogData?.recallTime?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff'
                                                                            }}>
                                                                            <Text  allowFontScaling={true}  style={{
                                                                                ...styles.rowDropdown
                                                                            }}>
                                                                                {rowData.label}
                                                                            </Text>
                                                                        </View>
                                                                    )
                                                                }}
                                                                initialScrollIndex={this.state.callLogData?.recallTime?.key ? this.getIndexTime(this.state.callLogData?.recallTime?.key, 'Not minutes') : 0}

                                                            >
                                                                <View style={{ ...styles.dropdownView }}>
                                                                    <Text  allowFontScaling={true} >{this.state.callLogData?.recallTime?.label || ''}</Text>
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
                                                                disabled={this.state.callLogData?.isOtherRecall}
                                                                options={[...(this.state.metaData?.enum_list?.select_moment || [])]}
                                                                dropdownStyle={[styles.dropdownItem]}
                                                                onSelect={(id, value) => this.onChangeValue('recallMoment', value)}
                                                                renderRow={(rowData, rowId, highlighted) => {
                                                                    return (
                                                                        <View
                                                                            style={{
                                                                                borderRadius: 4,
                                                                                backgroundColor: this.state.callLogData?.recallMoment?.label ? (this.state.callLogData?.recallMoment?.key == rowData.key ? '#d0d0d0' : '#fff') : '#fff'
                                                                            }}
                                                                        >
                                                                            <Text  allowFontScaling={true}  style={{
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
                                                                    <Text  allowFontScaling={true} >{this.state.callLogData?.recallMoment?.label || ''}</Text>
                                                                    <Icon
                                                                        name='caret-down'
                                                                        type='FontAwesome'
                                                                        style={{ ...styles.iconDropdownView }} />
                                                                </View>
                                                            </ModalDropdown>
                                                        </View>
                                                    </View>
                                                ) : null
                                        }

                                        {/* Khác */}

                                        <View style={{ ...styles.otherViewContainer }}>
                                            <View style={{ flex: 1, justifyContent: 'center' }} />

                                            <View style={{ flex: 5 }}>
                                                <RadioButton
                                                    selected={this.state.callLogData?.isOtherRecall}
                                                    label={getLabelWithGlobalInstance('call_log.other_label', this.props.globalInstance.locale)}
                                                    onSelect={() => {
                                                        this.onChangeValue('isOtherRecall', !this.state.callLogData?.isOtherRecall)
                                                    }}
                                                    color={Colors.white.white1}
                                                    colorSelected={Colors.white.white1}
                                                    labelStyle={{
                                                        color: Colors.white.white1
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        {
                                            this.state.callLogData?.isOtherRecall ?
                                                (
                                                    <View style={{ flexDirection: 'row', minHeight: 40, marginVertical: 5 }}>
                                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                                        </View>
                                                        <View style={{ flex: 5, flexDirection: 'row' }}>

                                                            <RNDatePicker
                                                                iconRight={getIcon('Calendar')}
                                                                title={''}
                                                                required={false}
                                                                currentDate={new Date()}
                                                                selectedDate={(value) => {
                                                                    this.onChangeValue('recallDateOther', value)
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

                                                            {/* <DatePicker
                                                                style={{ flex: 1, backgroundColor: '#fff', borderRadius: 4 }}
                                                                date={new Date()}
                                                                mode="date"
                                                                placeholder="DD/MM/YYYY"
                                                                format="DD/MM/YYYY"
                                                                minDate={moment(new Date()).format('DD/MM/YYYY')}
                                                                maxDate="01/01/3000"
                                                                confirmBtnText={
                                                                    getLabelWithGlobalInstance('common.btn_selected', this.props.globalInstance.locale)
                                                                }
                                                                cancelBtnText={
                                                                    getLabelWithGlobalInstance('common.btn_ignore', this.props.globalInstance.locale)
                                                                }
                                                                showIcon={true}
                                                                iconComponent={
                                                                    <Icon name='calendar' style={{ color: '#b0b0b0', fontSize: 20, marginRight: 4 }} />
                                                                }
                                                                // iconSource={require('../../../images/calendar.png')}
                                                                onDateChange={(value) => { this.onChangeValue('recallDateOther', value) }}
                                                                customStyles={{
                                                                    dateInput: {
                                                                        paddingLeft: 4,
                                                                        alignItems: 'flex-start',
                                                                        borderWidth: 0,
                                                                    },
                                                                    btnTextConfirm: {
                                                                        height: 20
                                                                    },
                                                                    btnTextCancel: {
                                                                        height: 20
                                                                    }
                                                                }}
                                                            >

                                                            </DatePicker> */}

                                                            <View style={{ width: 10 }} />

                                                            <ModalDropdown
                                                                style={{ flex: 1 }}
                                                                options={[...(this.state.metaData?.enum_list?.time_start || [])]}
                                                                dropdownStyle={[styles.dropdownItem]}
                                                                onSelect={(id, value) => this.onChangeValue('recallTimeOther', value)}
                                                                renderRow={(rowData, rowId, highlighted) => {
                                                                    return (
                                                                        <View style={{ backgroundColor: this.state.callLogData?.recallTimeOther?.label ? (this.state.callLogData?.recallTimeOther?.key === rowData.key ? '#d0d0d0' : '#fff') : '#fff' }}>
                                                                            <Text  allowFontScaling={true}  style={{
                                                                                ...styles.rowDropdown
                                                                            }}>
                                                                                {rowData.label}
                                                                            </Text>
                                                                        </View>
                                                                    )
                                                                }}
                                                                initialScrollIndex={this.state.callLogData?.recallTimeOther?.key ? this.getIndexTime(this.state.callLogData?.recallTimeOther?.key, 'Minutes') : 0}
                                                            >
                                                                <View style={{
                                                                    ...styles.dropdownView
                                                                }}>
                                                                    <Text  allowFontScaling={true} >{this.state.callLogData?.recallTimeOther?.label || ''}</Text>
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
                                                : null
                                        }

                                    </>
                                )
                                : null
                        }

                        {
                            this.state.isShowInfoCustomer || this.state.callLogData?.resultCall?.key === 'call_result_customer_interested' ?
                                (
                                    <>
                                        {/* Họ và tên */}
                                        <View style={{ ...styles.inputContainer }}>
                                            <View style={{ ...styles.inputContentTitle }}>
                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                                    getLabelWithGlobalInstance('call_log.name_label', this.props.globalInstance.locale)
                                                }</Text>
                                            </View>
                                            <View style={{ ...styles.inputGroupContent }}>
                                                <ModalDropdown
                                                    style={{ flex: 1 }}
                                                    options={[...this.props.globalInstance.getEnum('Leads', 'salutationtype')]}
                                                    dropdownStyle={[styles.dropdownItem]}
                                                    onSelect={(id, value) => this.onChangeValue('userInfo', value, 'salutationtype')}
                                                    renderRow={(rowData, rowId, highlighted) => {
                                                        return (
                                                            <View style={{
                                                                backgroundColor: (this.state.callLogData?.userInfo?.salutationtype?.key ? (rowData.key === this.state.callLogData?.userInfo?.salutationtype?.key ? '#d0d0d0' : '#fff') : '#fff')
                                                            }}>
                                                                <Text  allowFontScaling={true}  style={{
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
                                                        <Text  allowFontScaling={true} >
                                                            {
                                                                this.state.callLogData?.userInfo?.salutationtype?.label || getLabelWithGlobalInstance('call_log.salutation_label', this.props.globalInstance.locale)
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
                                                    placeholder={getLabelWithGlobalInstance('call_log.last_name_label', this.props.globalInstance.locale)}
                                                    value={this.state.callLogData?.userInfo?.lastname || ''}
                                                    style={{
                                                        backgroundColor: Colors.white.white1,
                                                        borderRadius: 4,
                                                        ...styles.inputRelated
                                                    }}
                                                    onChangeText={(value) => {
                                                        this.onChangeValue('userInfo', value, 'lastname')
                                                    }}
                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                />

                                                <View style={{ width: 4 }} />

                                                <Input
                                                    placeholder={getLabelWithGlobalInstance('call_log.first_name_label', this.props.globalInstance.locale)}
                                                    value={this.state.callLogData?.userInfo?.firstname || ''}
                                                    style={{
                                                        backgroundColor: Colors.white.white1,
                                                        borderRadius: 4,
                                                        ...styles.inputRelated,
                                                    }}
                                                    onChangeText={(value) => {
                                                        this.onChangeValue('userInfo', value, 'firstname')
                                                    }}
                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                />
                                            </View>
                                        </View>

                                        {/* Số điện thoại */}
                                        <View style={{ ...styles.inputContainer }}>
                                            <View style={{ ...styles.inputContentTitle }}>
                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                                    getLabelWithGlobalInstance('call_log.phone_number_label', this.props.globalInstance.locale)
                                                }</Text>
                                            </View>
                                            <View style={{ ...styles.inputRelatedContent }}>
                                                <Input
                                                    keyboardType='numeric'
                                                    value={this.state.callLogData?.userInfo?.mobile_phone || ''}
                                                    style={{ ...styles.inputRelated }}
                                                    onChangeText={(value) => {
                                                        this.onChangeValue('userInfo', value, 'mobile_phone')
                                                    }}
                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                />
                                            </View>
                                        </View>

                                        {/* Email */}
                                        <View style={{ ...styles.inputContainer }}>
                                            <View style={{ ...styles.inputContentTitle }}>
                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>Email</Text>
                                            </View>
                                            <View style={{ ...styles.inputRelatedContent }}>
                                                <Input
                                                    keyboardType='email-address'
                                                    returnKeyType='done'
                                                    value={this.state.callLogData?.userInfo?.email || ''}
                                                    style={{
                                                        ...styles.inputRelated
                                                    }}
                                                    onChangeText={(value) => {
                                                        this.onChangeValue('userInfo', value, 'email')
                                                    }}
                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                />
                                            </View>
                                        </View>

                                        {/* Công ty */}
                                        {
                                            (this.state.customerData?.record_module === 'Contacts') ?
                                                (
                                                    <>

                                                        <View style={{ ...styles.inputContainer }}>
                                                            <View style={{ ...styles.inputContentTitle }}>
                                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                                                    {getLabelWithGlobalInstance('call_log.company_label', this.props.globalInstance.locale)}
                                                                </Text>
                                                            </View>
                                                            <View style={{ ...styles.inputRelatedContent }}>
                                                                <Input
                                                                    clearTextOnFocus={true}
                                                                    disabled={true}
                                                                    value={this.state.accountSelected.accountname || ''}
                                                                    style={{ ...styles.inputRelated }}
                                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                                />
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        this.setState({ showModalRelated: true }, () => {
                                                                            setTimeout(() => {
                                                                                this.searchAccount('first_load')
                                                                            }, 600)
                                                                        })
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
                                                            <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                                                {getLabelWithGlobalInstance('call_log.company_label', this.props.globalInstance.locale)}
                                                            </Text>
                                                        </View>
                                                        <View style={{ ...styles.inputRelatedContent }}>
                                                            <Input
                                                                returnKeyType='done'
                                                                clearButtonMode='while-editing'
                                                                selectTextOnFocus={true}
                                                                value={this.state.callLogData?.userInfo?.company || ''}
                                                                onChangeText={(value) => { this.onChangeValue('userInfo', value, 'company') }}
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
                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                                    {getLabelWithGlobalInstance('call_log.products_label', this.props.globalInstance.locale)}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    ...styles.containMultiplePickList
                                                }}
                                            >
                                                {
                                                    this.state.productSelectedList.map((product, idx) => {
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

                                                                        let productSelectedList = [...this.state.productSelectedList];
                                                                        productSelectedList.splice(idx, 1);
                                                                        this.setState({ productSelectedList: productSelectedList, rawProductSelectedList: productSelectedList })
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
                                                                        maxWidth: widthDevice / 3 * 2 - 50,
                                                                        paddingRight: 4
                                                                    }}
                                                                >
                                                                    <Text  allowFontScaling={true} 
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
                                                        this.setState({ isShowModalProduct: true }, () => {
                                                            setTimeout(() => {
                                                                this.searchProduct('first_load')
                                                            }, 1000)
                                                        })
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
                                                <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                                    {getLabelWithGlobalInstance('call_log.service_label', this.props.globalInstance.locale)}
                                                </Text>
                                            </View>
                                            <View style={{
                                                ...styles.containMultiplePickList
                                            }}>
                                                {
                                                    this.state.serviceSelectedList.map((service, idx) => {
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
                                                                        let serviceSelectedList = [...this.state.serviceSelectedList];

                                                                        serviceSelectedList.splice(idx, 1);
                                                                        this.setState({
                                                                            serviceSelectedList: serviceSelectedList,
                                                                            rawServiceSelectedList: serviceSelectedList
                                                                        })
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        name='close'
                                                                        style={{ ...styles.iconRemove }}
                                                                    />
                                                                </TouchableOpacity>
                                                                <View
                                                                    style={{
                                                                        maxWidth: widthDevice / 3 * 2 - 50,
                                                                        paddingRight: 4
                                                                    }}>
                                                                    <Text  allowFontScaling={true} 
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

                                                        this.setState({
                                                            isShowModalService: true
                                                        }, () => {
                                                            setTimeout(() => {
                                                                this.searchService('first_load')
                                                            }, 1000)
                                                        })
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
                {/* Action */}

                <View
                    style={[styles.actionsBottom, this.props.context.state.canCreateNewCustomer ? { alignItems: 'center' } : { justifyContent: 'center', alignItems: 'center' }]}
                >
                    {
                        this.props.context.state.canCreateNewCustomer ?
                            (
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
                                    onPress={() => { this.props.context.setState({ isShowCreateCustomer: true }) }}
                                >
                                    <Text  allowFontScaling={true} >{
                                        getLabelWithGlobalInstance('softPhone.create_new_customer_btn', this.props.globalInstance.locale)
                                    }</Text>
                                </TouchableOpacity>
                            )
                            :
                            null
                    }

                    {
                        this.props.currentCalling ?
                            (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.props.context.setState({
                                                isShowSoftPhone: true,
                                                isShowCallLog: false,
                                                currentCalling: false,
                                            })
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
                                        <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                            getLabelWithGlobalInstance('softPhone.back_btn', this.props.globalInstance.locale)
                                        }</Text>
                                    </TouchableOpacity>

                                </View>
                            )
                            :
                            (
                                <View style={{ flexDirection: 'row' }}>

                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                isShowCallLog: false,
                                                isShowSoftPhone: false,
                                                isShowModalProduct: false
                                            })
                                            this.props.context.props.dismissView?.();
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
                                        <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                            getLabelWithGlobalInstance('softPhone.exit_btn', this.props.globalInstance.locale)
                                        }</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {

                                            !this.props.context.state.loadingSaveCallLog && this.parseDataCallLog(false);
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
                                            this.props.context.state.loadingSaveCallLog ?
                                                (
                                                    <ActivityIndicator size='small' color={'#fff'}></ActivityIndicator>
                                                )
                                                :
                                                (
                                                    <Text  allowFontScaling={true}  style={styles.txtWhite}>{
                                                        getLabelWithGlobalInstance('softPhone.save_btn', this.props.globalInstance.locale)
                                                    }</Text>
                                                )
                                        }
                                    </TouchableOpacity>
                                </View>
                            )
                    }


                </View>

                <Modal
                    visible={this.state.isShowModalProduct}
                >
                    <Container
                        style={{
                            flex: 1,
                            backgroundColor: Colors.white.white1
                        }}
                    >
                        <Header
                            style={{
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: 0
                            }}
                        >
                            <Left />
                            <Body style={{ flex: 8 }}>
                                <Title allowFontScaling={true} >
                                    {getLabelWithGlobalInstance('product_info.title', this.props.globalInstance.locale)}
                                </Title>
                            </Body>
                            <Right>

                                <TouchableHighlight
                                    style={{ marginRight: 10, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                    activeOpacity={0.3}
                                    underlayColor='#d0d0d0'
                                    onPress={() => {
                                        this.setState({ isShowModalProduct: false, productSelectedList: this.state.rawProductSelectedList })
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
                                width: widthDevice,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: .5,
                                borderBottomColor: Colors.black.black5,
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: Colors.white.white3,
                                    borderWidth: .5,
                                    borderColor: Colors.white.white5,
                                    alignItems: 'center',
                                    borderRadius: 4
                                }}
                            >
                                <Input
                                    style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                    placeholder={getLabelWithGlobalInstance('product_info.placeholder_label', this.props.globalInstance.locale)}
                                    clearButtonMode='while-editing'
                                    value={this.state.productKeyword}
                                    onChangeText={(value) => {
                                        this.setState({ productKeyword: value })
                                    }}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                                <TouchableOpacity
                                    style={{ height: '100%', backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                    onPress={() => {
                                        this.searchProduct('first_load')
                                    }}
                                >
                                    <Icon name='search' style={{ color: '#333', fontSize: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: Colors.white.white3,
                                paddingTop: 12
                            }}
                        >

                            {
                                this.state.loadingProduct ?
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
                                extraData={this.state}
                                disableVirtualization={false}
                                data={[...(this.state.productList || [])]}
                                renderItem={({ item, index, separators }) => {
                                    const productSelectedList = [...this.state.productSelectedList];
                                    const hasIndexChecked = productSelectedList.findIndex((selected) => selected.productid === item.productid)

                                    return (

                                        <>
                                            <RadioButton
                                                style={{
                                                    height: 42,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingHorizontal: 12,
                                                    borderBottomWidth: 0.7,
                                                    borderBottomColor: Colors.black.black4
                                                }}
                                                onSelect={() => {
                                                    const product = item;
                                                    if (hasIndexChecked != -1) {
                                                        productSelectedList.splice(hasIndexChecked, 1)
                                                    } else {
                                                        productSelectedList.push(product)
                                                    }
                                                    this.setState({ productSelectedList: productSelectedList })
                                                }}
                                                label={item.label}
                                                selected={hasIndexChecked != -1}
                                                colorSelected={Colors.functional.primary}
                                            />
                                        </>
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshingProduct}
                                        onRefresh={() => { this.searchProduct('refresh') }}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => this.loadMoreProduct()}
                            />
                        </View>

                        <View style={{
                            minHeight: variables.isIphoneX ? 74 : 54,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: widthDevice,
                            borderTopWidth: .5,
                            borderTopColor: Colors.black.black5,
                        }}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 5,
                                    paddingHorizontal: 22,
                                    backgroundColor: Colors.functional.primary,
                                    borderRadius: 4,
                                    marginBottom: 8,
                                    minHeight: 36,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={() => {
                                    this.setState({
                                        isShowModalProduct: false,
                                        rawProductSelectedList: this.state.productSelectedList
                                    });
                                }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                    {getLabelWithGlobalInstance('product_info.confirm_btn', this.props.globalInstance.locale)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Container>
                </Modal>

                <Modal
                    visible={this.state.isShowModalService}
                >
                    <Container
                        style={{
                            flex: 1,
                            backgroundColor: Colors.white.white1
                        }}
                    >
                        <Header
                            style={{
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: 0
                            }}
                        >
                            <Left />
                            <Body style={{ flex: 8 }}>
                                <Title allowFontScaling={true} >
                                    {getLabelWithGlobalInstance('service_info.title', this.props.globalInstance.locale)}
                                </Title>
                            </Body>
                            <Right>
                                <TouchableHighlight
                                    style={{ marginRight: 10, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                    activeOpacity={0.3}
                                    underlayColor='#d0d0d0'
                                    onPress={() => {
                                        this.setState({ isShowModalService: false, serviceSelectedList: this.state.rawServiceSelectedList })
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
                                width: widthDevice,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: .5,
                                borderBottomColor: Colors.black.black5,
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: Colors.white.white3,
                                    borderWidth: .5,
                                    borderColor: Colors.white.white5,
                                    alignItems: 'center',
                                    borderRadius: 4
                                }}
                            >
                                <Input
                                    style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                    placeholder={getLabelWithGlobalInstance('service_info.placeholder_label', this.props.globalInstance.locale)}
                                    clearButtonMode='while-editing'
                                    value={this.state.serviceKeyword}
                                    onChangeText={(value) => {
                                        this.setState({ serviceKeyword: value })
                                    }}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        this.searchService('first_load')
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
                                backgroundColor: Colors.white.white3,
                                paddingTop: 12
                            }}
                        >
                            {
                                this.state.loadingService ?
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
                                extraData={this.state}
                                disableVirtualization={false}
                                data={[...(this.state.serviceList || [])]}
                                renderItem={({ item, index, separators }) => {
                                    const serviceSelectedList = [...this.state.serviceSelectedList];
                                    const hasIndexChecked = serviceSelectedList.findIndex((selected) => selected.serviceid === item.serviceid)

                                    return (
                                        <RadioButton
                                            style={{
                                                height: 42,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 12,
                                                borderBottomWidth: 0.7,
                                                borderBottomColor: Colors.black.black4
                                            }}
                                            onSelect={() => {
                                                const service = item;
                                                if (hasIndexChecked != -1) {
                                                    serviceSelectedList.splice(hasIndexChecked, 1)
                                                } else {
                                                    serviceSelectedList.push(service)
                                                }
                                                this.setState({ serviceSelectedList: serviceSelectedList });
                                            }}
                                            label={item.label}
                                            selected={hasIndexChecked != -1}
                                            colorSelected={Colors.functional.primary}
                                        />
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshingService}
                                        onRefresh={() => { this.searchService('refresh') }}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => this.loadMoreService()}
                            />
                        </View>

                        <View style={{
                            minHeight: variables.isIphoneX ? 74 : 54,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: widthDevice,
                            borderTopWidth: .5,
                            borderTopColor: Colors.black.black5,
                        }}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 5,
                                    paddingHorizontal: 22,
                                    backgroundColor: Colors.functional.primary,
                                    borderRadius: 4,
                                    marginBottom: 8,
                                    minHeight: 36,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={() => {
                                    this.setState({ isShowModalService: false, rawServiceSelectedList: this.state.serviceSelectedList })
                                }}>
                                <Text  allowFontScaling={true}  style={styles.txtWhite}>
                                    {getLabelWithGlobalInstance('product_info.confirm_btn', this.props.globalInstance.locale)}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Container>
                </Modal>

                <Modal
                    visible={this.state.showModalRelated}
                >
                    <Container
                        style={{
                            flex: 1,
                            backgroundColor: Colors.white.white1
                        }}
                    >
                        <Header
                            style={{
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: 0
                            }}
                        >
                            <Left>

                            </Left>
                            <Body>
                                <Title allowFontScaling={true} >
                                    {getLabelWithGlobalInstance('common.tab_related', this.props.globalInstance.locale)}
                                </Title>
                            </Body>
                            <Right>
                                <TouchableHighlight
                                    style={{ marginRight: 10, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                    activeOpacity={0.3}
                                    underlayColor='#d0d0d0'
                                    onPress={() => {
                                        this.setState({ showModalRelated: false })
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
                                width: widthDevice,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: Colors.white.white1,
                                borderBottomWidth: .5,
                                borderBottomColor: Colors.black.black5,
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    backgroundColor: Colors.white.white3,
                                    borderWidth: .5,
                                    borderColor: Colors.white.white5,
                                    alignItems: 'center',
                                    borderRadius: 4
                                }}
                            >
                                <Input
                                    style={{ borderBottomWidth: 0, fontSize: 14, minHeight: 42 }}
                                    placeholder={getLabelWithGlobalInstance('common.keyword_input_place_holder', this.props.globalInstance.locale)}
                                    placeholderTextColor="#878787"
                                    value={this.state.accountKeyword}
                                    clearButtonMode='while-editing'
                                    onChangeText={(value) => this.setState({ accountKeyword: value })}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />

                                <TouchableOpacity
                                    style={{ height: '100%', backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                    onPress={() => {
                                        this.searchAccount()
                                    }}
                                >
                                    <Icon name='search' style={{ color: '#333', fontSize: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {
                            this.state.loading ?
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
                                backgroundColor: Colors.white.white3,
                                paddingTop: 12
                            }}
                        >
                            <FlatList
                                data={this.state.accountList}
                                extraData={this.state}
                                disableVirtualization={false}
                                renderItem={({ item, index, separators }) =>
                                    <ListItem
                                        key={index}
                                        onPress={() => this.selectAccount(item)}
                                        style={{
                                            marginLeft: 0,
                                            backgroundColor: (this.state.accountSelected && (this.state.accountSelected?.accountid == item?.accountid)) ? Colors.white.white5 : Colors.white.white3
                                        }}
                                    >
                                        <Body>
                                            <Text  allowFontScaling={true} 
                                                style={{
                                                    flex: 3,
                                                    fontSize: 14,
                                                    marginTop: 5,
                                                    marginBottom: 5,
                                                    marginLeft: 10,
                                                    fontWeight: (Platform.OS === 'ios') ? '500' : undefined,
                                                    color: '#18191a'
                                                }}>
                                                {item.accountname} { }
                                            </Text>
                                        </Body>
                                    </ListItem>
                                }
                                keyExtractor={(item, index) => index.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={() => this.searchAccount('refresh')}
                                        tintColor='#309ed8'
                                        colors={['#309ed8', '#25add0', '#15c2c5']}
                                        progressBackgroundColor='#fff'
                                    />
                                }
                                onEndReachedThreshold={0.5}
                                onEndReached={() => this.loadMoreAccount()}
                            />
                        </View>
                    </Container>
                </Modal>
            </>
        )
    }
}


