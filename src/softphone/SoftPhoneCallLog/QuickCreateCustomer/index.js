import moment from 'moment-timezone';
import {
    Body, Container, Content, Form,
    Header, Icon, Input, Item, Label, Left, ListItem,
    Right, Title
} from 'native-base';
import React, { Component } from 'react';
import {
    ActivityIndicator, Alert, Dimensions, FlatList, Modal, RefreshControl,
    Text, TouchableOpacity, View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-root-toast';
import variables from '../../../../native-base-theme/variables/commonColor';
import { SpaceS } from '../../../components/CustomComponentView';
import ModalDropdown from '../../../components/ModalDropdown';
import RadioButton from '../../../components/RadioButton';
import RNDatePicker from '../../../components/RNDatePicker';
import { Colors } from '../../../themes/colors/Colors';
import { getIcon, getLabelWithGlobalInstance, widthDevice } from '../../../utils/commons/commons';
import styles from './styles';

var deviceInfo = DeviceInfo.getManufacturer().toString().toUpperCase().trim();
export class QuickCreateCustomer extends Component {

    constructor(props) {
        super(props);

        var currentDate = new Date();

        // Work around to fix timezone issue in Asus device
        if (deviceInfo === 'ASUS') {
            var currentDateString = moment().tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            currentDate = moment(currentDateString);
        }
    }

    state = {
        newCustomer: {
            customerType: 'Lead',
            salutationtype: {},
            firstname: '',
            lastname: '',
            mobile: this.props.phoneNumber ? this.props.phoneNumber : '',
            email: '',
            assigned_user_id: 'Users:' + this.props.globalInstance.user?.id,
            company: '',
            lane: '',
            city: {},
            state: {},
            country: {},
            description: '',
            title: '',
            birthday: new Date(),
            account: {}
        },
        showModalRelated: false,
        accountList: [],
        rawListAccount: [],
        accountKeyword: '',
        refreshing: false,
        loading: false,
        pagingAccount: {},
        accountSelected: {},
        optionsState: [...this.props.globalInstance.getEnum('Leads', 'state')],
        optionsCity: [...this.props.globalInstance.getEnum('Leads', 'city')],
        optionsCountry: [...this.props.globalInstance.getEnum('Leads', 'country')],
        optionsSalutation: [...this.props.globalInstance.getEnum('Leads', 'salutationtype')]
    }

    onChangeValue = (key, value) => {
        let user = { ...this.state.newCustomer };

        if (key === 'customerType') {
            switch (value) {
                case 'Contact':
                    this.setState({
                        optionsState: [...this.props.globalInstance.getEnum('Contacts', 'mailingstate')],
                        optionsCity: [...this.props.globalInstance.getEnum('Contacts', 'mailingcity')],
                        optionsCountry: [...this.props.globalInstance.getEnum('Contacts', 'mailingcountry')],
                        optionsSalutation: [...this.props.globalInstance.getEnum('Contacts', 'salutationtype')]
                    })
                    break;

                default:
                    this.setState({
                        optionsState: [...this.props.globalInstance.getEnum('Leads', 'state')],
                        optionsCity: [...this.props.globalInstance.getEnum('Leads', 'city')],
                        optionsCountry: [...this.props.globalInstance.getEnum('Leads', 'country')],
                        optionsSalutation: [...this.props.globalInstance.getEnum('Leads', 'salutationtype')]
                    })
                    break;
            }
        }

        user[key] = value;

        this.setState({ newCustomer: user })
    }

    validateBirthDate(birthdate) {
        var birthday = moment(birthdate, `${this.props.globalInstance?.user?.date_format?.toUpperCase()}`).toDate().getTime();
        var currentDate = moment(moment(this.currentDate).format(`${this.props.globalInstance?.user?.date_format?.toUpperCase()}`), `${this.props.globalInstance?.user?.date_format?.toUpperCase()}`)?.toDate()?.getTime();

        console.log('LOG.compare datetime: ', birthday, currentDate);

        if (birthday >= currentDate) {
            return false
        }

        return true;
    }

    onCreateCustomer() {
        // this.props.onDismissCreate?.();
        const { newCustomer, accountSelected } = this.state;
        let dataNewCustomer = {};

        if (newCustomer.email) {
            if (!this.props.globalInstance.validateEmail(newCustomer.email)) {
                Alert.alert('', getLabelWithGlobalInstance('create_customer.msg_email_invalid', this.props.globalInstance.locale));
                return;
            }
        }

        if (!newCustomer.firstname) {
            Alert.alert('', getLabelWithGlobalInstance('create_customer.msg_first_name_empty', this.props.globalInstance.locale));
            return;
        }

        if (this.state.newCustomer.customerType === 'Lead') {
            dataNewCustomer.salutationtype = newCustomer.salutationtype?.key || '';
            dataNewCustomer.firstname = newCustomer.firstname || '';
            dataNewCustomer.lastname = newCustomer.lastname || '';
            dataNewCustomer.mobile = newCustomer.mobile || '';
            dataNewCustomer.email = newCustomer.email || '';
            dataNewCustomer.company = newCustomer.company || '';
            dataNewCustomer.lane = newCustomer.lane || '';
            dataNewCustomer.city = newCustomer.city || '';
            dataNewCustomer.state = newCustomer.state || '';
            dataNewCustomer.country = newCustomer.country || '';
            dataNewCustomer.description = newCustomer.description || '';
            dataNewCustomer.assigned_user_id = newCustomer.assigned_user_id || '';
            this.props.onCreateNewCustomer?.(dataNewCustomer, 'Leads');
        }
        else {
            if (!this.validateBirthDate(newCustomer.birthday)) {
                Alert.alert(getLabelWithGlobalInstance('create_customer.msg_date_of_birth_less_than_current_date', this.props.globalInstance.locale));
                return;
            }

            dataNewCustomer.salutationtype = newCustomer.salutationtype?.key || '';
            dataNewCustomer.firstname = newCustomer.firstname || '';
            dataNewCustomer.lastname = newCustomer.lastname || '';
            dataNewCustomer.mobile = newCustomer.mobile || '';
            dataNewCustomer.email = newCustomer.email || '';
            dataNewCustomer.account_id = accountSelected?.accountid || '';
            dataNewCustomer.title = newCustomer.title || '';
            dataNewCustomer.birthday = newCustomer.birthday || '';
            dataNewCustomer.mailingstreet = newCustomer.lane || '';
            dataNewCustomer.mailingcity = newCustomer.city || '';
            dataNewCustomer.mailingstate = newCustomer.state || '';
            dataNewCustomer.mailingcountry = newCustomer.country || '';
            dataNewCustomer.description = newCustomer.description || '';
            dataNewCustomer.assigned_user_id = newCustomer.assigned_user_id || '';
            this.props.onCreateNewCustomer?.(dataNewCustomer, 'Contacts');
        }


    }

    componentDidMount() {
        console.log('LOG.salutationtype',);
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
                list = this.state.rawListAccount.concat(listData);
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

    render() {
        return (
            <Container style={{ backgroundColor: 'transparent' }}>
                <View style={{ height: 44 }} />
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: Dimensions.get('screen').width,
                        height: 20
                    }}
                >
                    <Text allowFontScaling={true} style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>{getLabelWithGlobalInstance('create_customer.title', this.props.globalInstance.locale)}</Text>
                </View>
                <View style={{ height: 20 }} />
                <Content
                >
                    <Form>
                        <Item stackedLabel style={{ borderBottomWidth: 0 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_customer_type', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Item style={{ borderBottomWidth: 0 }}>
                                <RadioButton
                                    selected={this.state.newCustomer.customerType === 'Lead'}
                                    label={getLabelWithGlobalInstance('create_customer.label_customer_lead', this.props.globalInstance.locale)}
                                    labelStyle={{
                                        color: Colors.white.white1
                                    }}
                                    colorSelected={Colors.white.white1}
                                    color={Colors.white.white1}
                                    onSelect={() => { this.onChangeValue('customerType', 'Lead') }}
                                />

                                <View style={{ width: 20 }} />

                                <RadioButton
                                    selected={this.state.newCustomer.customerType === 'Contact'}
                                    label={getLabelWithGlobalInstance('create_customer.label_customer_contact', this.props.globalInstance.locale)}
                                    labelStyle={{
                                        color: Colors.white.white1
                                    }}
                                    colorSelected={Colors.white.white1}
                                    color={Colors.white.white1}
                                    onSelect={() => { this.onChangeValue('customerType', 'Contact') }}
                                />
                            </Item>
                        </Item>

                        <Item stackedLabel style={{ borderBottomWidth: 0, marginLeft: 12, paddingRight: 8 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_full_name', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Item style={{ flexDirection: 'row', borderBottomWidth: 0, paddingRight: 12, marginLeft: 0, alignItems: 'center' }}>
                                <ModalDropdown
                                    style={{ flex: 1 }}
                                    options={[...this.state.optionsSalutation]}
                                    dropdownStyle={{
                                        width: 150,
                                        position: 'absolute',
                                        padding: 5,
                                        borderColor: 'lightgray',
                                        borderWidth: 1,
                                        borderRadius: 2,
                                        justifyContent: 'center',
                                        marginTop: -18
                                    }}
                                    onSelect={(id, value) => {
                                        let user = this.state.newCustomer;
                                        user.salutationtype = value;
                                        this.setState({ newCustomer: user })
                                    }}
                                    initialScrollIndex={this.state.newCustomer?.salutationtype?.key ? ([...this.state.optionsSalutation].findIndex((salu) => salu.key === this.state.newCustomer?.salutationtype?.key)) : 0}
                                    renderRow={(rowData, rowId, highlighted) => {
                                        return (
                                            <View style={{ backgroundColor: highlighted ? '#d0d0d0' : '#fff' }}>
                                                <Text allowFontScaling={true} style={{
                                                    marginVertical: 8,
                                                    marginHorizontal: 6,
                                                    fontSize: 12,
                                                    textAlign: 'left',
                                                    textAlignVertical: 'center'
                                                }}>
                                                    {rowData?.label || ''}
                                                </Text>
                                            </View>
                                        )
                                    }

                                    }
                                >
                                    <View style={{ marginTop: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', ...styles.inputStyle }}>
                                        <Text allowFontScaling={true} >{this.state.newCustomer.salutationtype?.label || getLabelWithGlobalInstance('create_customer.label_salutation_type', this.props.globalInstance.locale)}</Text>
                                        <Icon name='caret-down' type='FontAwesome' style={{ color: '#b0b0b0', fontSize: 16 }} />
                                    </View>
                                </ModalDropdown>
                                <View style={{ width: 3 }} />
                                <Input
                                    style={{ ...styles.inputStyle }}
                                    placeholder={getLabelWithGlobalInstance('create_customer.label_last_name', this.props.globalInstance.locale)}
                                    value={this.state.newCustomer.lastname}
                                    onChangeText={(value) => { this.onChangeValue('lastname', value) }}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                                <View style={{ width: 3 }} />
                                <Input
                                    style={{ ...styles.inputStyle }}
                                    placeholder={getLabelWithGlobalInstance('create_customer.label_first_name', this.props.globalInstance.locale)}
                                    value={this.state.newCustomer.firstname}
                                    onChangeText={(value) => { this.onChangeValue('firstname', value) }}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                            </Item>
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, marginLeft: 16, paddingRight: 12, }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_phone_number', this.props.globalInstance.locale)} <Text allowFontScaling={true} style={{ color: 'red' }}>*</Text></Label>
                            <SpaceS />
                            <Input
                                value={this.state.newCustomer.mobile}
                                disabled={true}
                                style={{ ...styles.inputStyle }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        {
                            this.state.newCustomer.customerType === 'Lead' ?
                                (
                                    <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                                        <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_company', this.props.globalInstance.locale)}</Label>
                                        <SpaceS />
                                        <Input
                                            style={{ ...styles.inputStyle }}
                                            value={this.state.newCustomer.company}
                                            placeholder={getLabelWithGlobalInstance('create_customer.label_company', this.props.globalInstance.locale)}
                                            clearButtonMode='while-editing'
                                            onChangeText={(value) => { this.onChangeValue('company', value) }}
                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                        />
                                    </Item>
                                )
                                :
                                (
                                    <>
                                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 16, paddingLeft: 0, marginLeft: 12 }}>
                                            <Label style={{ fontSize: 14, color: '#fff', paddingBottom: 4 }}>{getLabelWithGlobalInstance('create_customer.label_company', this.props.globalInstance.locale)}</Label>
                                            <SpaceS />
                                            <Item style={{ borderBottomWidth: 0, backgroundColor: '#fff', borderRadius: 4, paddingLeft: 0 }}>
                                                <Input
                                                    style={{ borderBottomWidth: 0, color: '#333', width: '100%', fontSize: 14, paddingLeft: 6, height: 40 }}
                                                    value={this.state.accountSelected?.accountname || ''}
                                                    disabled={true}
                                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                                />
                                                <Icon
                                                    active
                                                    name='search'
                                                    style={{ color: '#333' }}
                                                    onPress={() => {
                                                        this.setState({ showModalRelated: true }, () => {
                                                            setTimeout(() => {
                                                                this.searchAccount('first_load')
                                                            }, 1000)
                                                        })
                                                    }}
                                                />
                                            </Item>
                                        </Item>

                                        <Item stackedLabel style={{ borderBottomWidth: 0, alignItems: 'flex-start' }}>
                                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_birthday', this.props.globalInstance.locale)}</Label>
                                            <SpaceS />
                                            <View style={{ flex: 1, flexDirection: 'row', paddingRight: 12 }}>
                                                <RNDatePicker
                                                    iconRight={getIcon('Calendar')}
                                                    title={''}
                                                    required={false}
                                                    currentDate={this.state.newCustomer.birthday}
                                                    selectedDate={(value) => {
                                                        this.onChangeValue('birthday', value)
                                                    }}
                                                    hideTitle={true}
                                                    style={{
                                                        minHeight: 42,
                                                        borderRadius: 4,
                                                        flex: 1
                                                    }}
                                                    contentStyle={{
                                                        alignItems: 'center'
                                                    }}
                                                />
                                            </View>
                                        </Item>

                                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                                            <Label style={{ fontSize: 14, color: '#fff' }}>{this.props.globalInstance?.locale == 'vn_vn' ? 'Chức vụ' : 'Position'}</Label>
                                            <SpaceS />
                                            <Input
                                                style={{ ...styles.inputStyle }}
                                                value={this.state.newCustomer.title}
                                                placeholder={this.props.globalInstance?.locale == 'vn_vn' ? 'Chức vụ' : 'Position'}
                                                clearButtonMode='while-editing'
                                                onChangeText={(value) => { this.onChangeValue('title', value) }}
                                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                            />
                                        </Item>
                                    </>
                                )
                        }

                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>Email</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle }}
                                value={this.state.newCustomer.email}
                                keyboardType='email-address'
                                placeholder='Email'
                                clearButtonMode='while-editing'
                                autoCapitalize='none'
                                onChangeText={(value) => { this.onChangeValue('email', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_address', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle }}
                                value={this.state.newCustomer.lane}
                                placeholder={getLabelWithGlobalInstance('create_customer.label_address', this.props.globalInstance.locale)}
                                clearButtonMode='while-editing'
                                onChangeText={(value) => { this.onChangeValue('lane', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_state', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle }}
                                value={this.state.newCustomer.state}
                                placeholder={getLabelWithGlobalInstance('create_customer.label_state', this.props.globalInstance.locale)}
                                clearButtonMode='while-editing'
                                onChangeText={(value) => { this.onChangeValue('state', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_city', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle }}
                                value={this.state.newCustomer.city}
                                placeholder={getLabelWithGlobalInstance('create_customer.label_city', this.props.globalInstance.locale)}
                                clearButtonMode='while-editing'
                                onChangeText={(value) => { this.onChangeValue('city', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_country', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle }}
                                value={this.state.newCustomer.country}
                                clearButtonMode='while-editing'
                                placeholder={getLabelWithGlobalInstance('create_customer.label_country', this.props.globalInstance.locale)}
                                onChangeText={(value) => { this.onChangeValue('country', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                        <Item stackedLabel style={{ borderBottomWidth: 0, paddingRight: 12, marginLeft: 16 }}>
                            <Label style={{ fontSize: 14, color: '#fff' }}>{getLabelWithGlobalInstance('create_customer.label_description', this.props.globalInstance.locale)}</Label>
                            <SpaceS />
                            <Input
                                style={{ ...styles.inputStyle, minHeight: 64 }}
                                placeholder={getLabelWithGlobalInstance('create_customer.label_description', this.props.globalInstance.locale)}
                                value={this.state.newCustomer.description}
                                multiline={true}
                                onChangeText={(value) => { this.onChangeValue('description', value) }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Item>
                    </Form>
                    <View style={{ height: 44 }} />
                </Content>

                <View
                    style={{ height: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', width: widthDevice, marginBottom: variables.isIphoneX ? 20 : 10 }}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#d0d0d0',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 36,
                            borderRadius: 4
                        }}
                        onPress={() => { this.props.onDismissCreate?.() }}
                    >
                        <Text allowFontScaling={true} >{getLabelWithGlobalInstance('common.btn_cancel', this.props.globalInstance.locale)}</Text>
                    </TouchableOpacity>

                    <View style={{ width: 15 }} />

                    <TouchableOpacity
                        style={{
                            backgroundColor: '#169bd5',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 36,
                            borderRadius: 4
                        }}
                        onPress={() => { this.onCreateCustomer?.() }}
                    >
                        <Text allowFontScaling={true} style={{ color: '#fff' }}>{getLabelWithGlobalInstance('common.btn_save', this.props.globalInstance.locale)}</Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={this.state.showModalRelated}
                >
                    <Container>
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
                                <TouchableOpacity
                                    style={{
                                        marginRight: 10
                                    }}
                                    onPress={() => {
                                        this.setState({ showModalRelated: false })
                                    }}
                                >
                                    <Icon name={'close'} style={{ fontSize: 26 }} />
                                </TouchableOpacity>
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
                            }}
                        >
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
                                    onPress={() => this.searchAccount()}
                                >
                                    <Icon
                                        name="search"
                                        style={{
                                            color: '#333',
                                            fontSize: 20
                                        }} />
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

                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={this.state.accountList}
                                extraData={this.state}
                                disableVirtualization={false}
                                renderItem={({ item, index, separators }) =>
                                    <ListItem
                                        key={index}
                                        onPress={() => this.selectAccount(item)}
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
                                                {item.accountname}
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

            </Container>
        )
    }
}

export default QuickCreateCustomer


