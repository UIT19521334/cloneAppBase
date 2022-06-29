// Import libraries
import Geolocation from '@react-native-community/geolocation';
import { Input, Label } from 'native-base';
import React, { Component } from 'react';
import {
    Animated, BackHandler, DeviceEventEmitter, Image, InteractionManager, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableHighlight,
    TouchableOpacity, View
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Toast from 'react-native-root-toast';
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import { connect } from 'react-redux';
// Import components
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView';
import LineItemInviteViewText from '../../../components/ComponentView/LineItemInviteViewText';
import {
    Header, LBText, Left, NText, Right,
    SectionView, SpaceHM, SpaceHS,
    SpaceL, SpaceS, TabContent
} from '../../../components/CustomComponentView';
import IndicatorLoading from '../../../components/IndicatorLoading';
import PlayAudioURL from '../../../components/PlayAudioURL';
import Global from '../../../Global';
import { showAlert } from '../../../redux/actions/alert';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { Box, Text } from '../../../themes/themes';
import {
    getIcon, getIconModule, getLabel, heightDevice, isIphoneX, showOnMapHandler, widthResponse
} from '../../../utils/commons/commons';
import I18n from '../../../utils/i18n';
import { PARAMS_ALERT } from '../../../utils/Models/models';
import styles from './styles';

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 148;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_HEIGHT + 12;
export class ActivityView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(
                // iOS has negative initial scroll value because content inset...
                Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
            ),
            refreshing: false,
            tabsOption: [
                {
                    label: getLabel('common.tab_over_view'),
                    isLoaded: false,
                },
                {
                    label: getLabel('common.tab_detail'),
                    isLoaded: false,
                },
                {
                    label: getLabel('common.tab_related'),
                    isLoaded: false,
                }],
            tabSelected: 0,
            animTransitionChangeTab: new Animated.Value(0),
            loadingTabOverView: false,
            loadingTabDetail: false,
            loadingTabRelated: false,
            activity: {},
            metaData: {},
            isReady: false,
            loading: false,
            counters: null,
            gpsLocation: {},
            isShowConfirmCompleteMeeting: false,
            description: '',
            interactionsComplete: false
        };
    }

    componentDidMount() {

        InteractionManager.runAfterInteractions(() => {
            this.setState({ interactionsComplete: true });
        });
        this.unsubscribe = this.props?.navigation?.addListener('focus', () => {
            // The screen is focused
            // Call any action
            const { navigation, route } = this.props;
            if (route?.params?.prevScene != 'Camera') {
                this.setState({ activity: route?.params?.activity }, () => {
                    this.loadData();
                })
            }
        });

        this.unsubscribeBlur = this.props?.navigation?.addListener('blur', () => {
            // The screen is unfocused
            // Call any action
            this.setState({ loading: false });
        });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.unsubscribeBlur();
        Geolocation.clearWatch(this.watchId);
        this.backHandler.remove();
    }

    goBack() {
        if (this.props?.route?.params?.isViewDetailRelated) {
            this.props?.navigation.replace('ActivityList', this.props?.route?.params?.dataRelated)
        }
        else if (this.props?.route?.params?.prevScene == 'Calendar') {
            this.props?.navigation.navigate('Calendar', { prevDataType: 'Reload' })
        }
        else if (Global?.isOpenComingActivity) {
            this.props?.navigation.goBack();
            setTimeout(() => {
                DeviceEventEmitter.emit('HomeScreen.ReloadActivity')
            }, 700)
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetActivity',
            Params: {
                id: this.state.activity?.activityid || this.state.activity?.id,
            }
        }

        // Call api
        Global.callAPI(this, params, data => {
            if (data.message == 'ACCESS_DENIED') {
                this.setState({
                    showAlertPermissionRecord: true
                });
                return;
            }

            if (parseInt(data.success) === 1) {
                this.setState({
                    activity: data.data,
                    metaData: data.metadata,
                    counters: data.data.counters
                }, () => {
                    this.setState({ isReady: true });
                });

                if (this.props.route?.params?.prevScene === 'Calendar') {
                    this.props.route?.params?.onReLoadData?.();
                }
            }
            else {
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('activity.title', { locale: Global.locale || "vn_vn" }) }));
            }
        },
            error => {
                Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
            });
    }

    getFiledName(key) {
        let fieldName = {};

        let fieldList = this.state.metaData?.field_list;

        if (fieldList) {
            fieldName = fieldList?.[key] || {}
        }
        return fieldName;
    }

    getModuleName(module) {
        let moduleName = '';
        switch (module) {
            case 'Accounts':
                moduleName = getLabel('common.title_organizations')
                break;
            case 'Contacts':
                moduleName = getLabel('common.title_contacts')
                break;
            case 'Leads':
                moduleName = getLabel('common.title_leads')
                break;
            case 'Potentials':
                moduleName = getLabel('common.title_opportunities')
                break;
            case 'HelpDesk':
                moduleName = getLabel('common.title_tickets')
                break;
            default:
                break;
        }
        return moduleName;
    }

    getEnumLabel(field, key) {
        let label = ''
        let enumList = this.state.metaData?.enum_list;

        if (enumList) {
            const list: Array<any> = enumList?.[field] || []

            const indexSelected = list.findIndex((item) => item.key === key)

            if (indexSelected != -1) {
                label = list[indexSelected].label
            }
        }
        return label;
    }

    toggleFavorite = () => {
        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: this.state.activity?.record_module,
                id: this.state.activity?.id,
                starred: (parseInt(this.state.activity?.starred || '0') == 0) ? 1 : 0
            }
        };

        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }
            this.loadData();

        }, error => {
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    handleTabsChange = index => {
        this.setState({ tabSelected: index }, () => {
            Animated.timing(
                this.state.animTransitionChangeTab,
                {
                    toValue: -(index * widthResponse),
                    duration: 200,
                    useNativeDriver: true
                }
            ).start(() => {
                if (!this.state.tabsOption[index].isLoaded) {
                    this.state.tabsOption[index].isLoaded = true;
                    switch (index) {
                        case 0:
                            // this.setState({ loadingTabOverView: true }, () => {
                            //     setTimeout(() => {
                            //         this.setState({ loadingTabOverView: false });
                            //     }, 500);
                            // });
                            break;
                        case 1:
                            // this.setState({ loadingTabDetail: true }, () => {

                            //     setTimeout(() => {
                            //         this.setState({ loadingTabDetail: false });
                            //     }, 500)
                            // });
                            break;
                        case 2:
                            // this.setState({ loadingTabRelated: true }, () => {
                            //     setTimeout(() => {
                            //         this.setState({ loadingTabRelated: false });
                            //     }, 500)
                            // });
                            break;
                    }
                }
            });
        });
    }

    completeActivity(type) {
        /* To do */
        /* Check activity in future */
        this.setState({ loading: true });
        var params = {
            RequestAction: 'SaveActivity',
            Data: {
                id: this.state.activity.id
            }
        };

        if (this.state.activity.activitytype == 'Task') {
            params.Data.taskstatus = 'Completed';
        }
        else {
            params.Data.eventstatus = 'Held';
        }

        if (type == 'check_out') { // Check out meeting
            params.Data.description = this.state.description;
        }

        // activity api
        Global.callAPI(this, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.msg_edit_error', { module: getLabel('activity.title').toLowerCase() }));
                return;
            }

            if (this.props.route?.params?.prevScene === 'Calendar') {
                this.props.route?.params?.onReLoadData?.();
            }
            Toast.show(getLabel('common.msg_edit_success', { module: getLabel('activity.title').toLowerCase() }));

            // Update counters triggered
            Global.updateCounters();

            this.loadData();
        },
            error => {
                Toast.show(getLabel('common.msg_connection_error'));
            });
    }

    renderConfirmCompleteMeeting() {
        return (
            <Modal
                visible={this.state.isShowConfirmCompleteMeeting}
                transparent={true}
                animationType='fade'
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent'
                    }}
                >
                    <Box
                        style={{ backgroundColor: 'transparent' }}
                        flex={1}
                        alignItems='center'
                        justifyContent='center'
                    >
                        {/* Back drop */}
                        <Box
                            width={widthResponse}
                            height={heightDevice}
                            backgroundColor='black1'
                            opacity={.5}
                            position='absolute'
                            onTouchEnd={() => { Keyboard.dismiss() }}
                        />

                        {/* Content */}
                        <Box
                            width={widthResponse * 0.8}
                            backgroundColor='white1'
                            borderRadius={8}
                            marginBottom='xl'
                            style={[styles.shadow]}
                        >

                            {/* Header */}
                            <Box
                                height={40}
                                justifyContent='center'
                                paddingHorizontal='l'
                            >
                                <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{getLabel('activity.title_mask_complete')}</Text>
                            </Box>
                            {/* Body */}
                            <Box
                                borderWidth={StyleSheet.hairlineWidth}
                                borderColor='black4'
                                minHeight={heightDevice * .2}
                            >
                                <Box
                                    marginTop='l'
                                    paddingHorizontal='l'
                                >
                                    <Label style={{
                                        paddingLeft: 0,
                                        fontSize: 14,
                                        color: Colors.black.black3,
                                        marginBottom: 10
                                    }}>
                                        {this.state.metaData?.field_list?.description?.label}
                                    </Label>
                                    <Box
                                        minHeight={heightDevice * .2}
                                        maxHeight={heightDevice * .4}
                                    >
                                        <TextInput
                                            style={[
                                                {
                                                    color: Colors.black.black1,
                                                    borderWidth: 0.5,
                                                    minHeight: heightDevice * .2,
                                                    borderRadius: 6,
                                                    borderColor: Colors.black.black4,
                                                    textAlignVertical: 'top',
                                                    padding: 8
                                                }
                                            ]}
                                            placeholder={this.state.metaData?.field_list?.description?.label}
                                            value={this.state.description}
                                            autoCapitalize='none'
                                            multiline={true}
                                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                            onChangeText={(value) => {
                                                this.setState({ description: value })
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <SpaceS />
                            </Box>
                            {/* Footer */}
                            <Box
                                height={50}
                                flexDirection='row'
                            >
                                {/* Button Cancel */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomLeftRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        this.setState({
                                            isShowConfirmCompleteMeeting: false
                                        })
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRightWidth={StyleSheet.hairlineWidth}
                                        borderRightColor='black4'
                                    >
                                        <Text allowFontScaling={true} fontWeight='600'>{getLabel('common.btn_cancel')}</Text>
                                    </Box>
                                </TouchableHighlight>

                                {/* Button Save */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomRightRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        this.setState({
                                            isShowConfirmCompleteMeeting: false,
                                        }, () => {
                                            setTimeout(() => {
                                                this.completeActivity('check_out');
                                            }, 300)
                                        })
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderLeftWidth={StyleSheet.hairlineWidth}
                                        borderLeftColor='black4'
                                    >
                                        <Text allowFontScaling={true} color='primary' fontWeight='600'>{getLabel('common.btn_save')}</Text>
                                    </Box>
                                </TouchableHighlight>
                            </Box>

                        </Box>
                    </Box>
                </KeyboardAvoidingView>
            </Modal>
        )
    }

    renderTabDetail = () => {
        if (this.state.activity?.activitytype == 'Task') {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView
                            title={getLabel('activity.title_activity_information')}
                        />
                        <Box
                            flexDirection='row'
                            width={widthResponse}
                        >
                            <LineItemViewText
                                title={this.state.metaData?.field_list?.date_start?.label || ''}
                                value={`${Global.formatDate(this.state.activity?.date_start)} ${this.state.activity?.time_start}` || ''}
                            />
                            <LineItemViewText
                                title={this.state.metaData?.field_list?.due_date?.label || ''}
                                value={`${Global.formatDate(this.state.activity?.due_date)}` || ''}
                            />
                        </Box>

                        <Box
                            flexDirection='row'
                            width={widthResponse}
                        >
                            <LineItemViewText
                                title={this.getFiledName('taskstatus').label}
                                value={Global.getEnumLabel('Calendar', 'taskstatus', this.state.activity?.taskstatus)}
                                textStyle={{ color: Global.getEnumColor('Calendar', 'taskstatus', this.state.activity?.taskstatus) || '#333' }}
                            />
                            <LineItemViewText
                                title={this.getFiledName('activitytype').label}
                                value={getLabel('common.title_event_task')}
                            // textStyle={{ color: Global.getEnumColor('Calendar', 'activitytype', this.state.activity?.activitytype) || '#333' }}
                            />
                        </Box>

                        <LineItemViewText
                            title={this.getFiledName('description').label}
                            value={this.state.activity?.description}
                        />

                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.activity?.assigned_owners ? Global.getAssignedOwnersName(this.state.activity?.assigned_owners) : ''}
                        />

                        <LineItemViewText
                            title={this.getFiledName('taskpriority').label}
                            value={Global.getEnumLabel('Calendar', 'taskpriority', this.state.activity?.taskpriority)}
                            textStyle={{ color: Global.getEnumColor('Calendar', 'taskpriority', this.state.activity?.taskpriority) || '#333' }}
                        />

                        <LineItemViewText
                            title={this.getFiledName('reminder_time').label}
                            value={this.state.activity?.reminder_time != 0 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />

                        <LineItemViewText
                            title={this.getFiledName('sendnotification').label}
                            value={this.state.activity?.sendnotification != 0 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />

                        <LineItemViewText
                            title={this.getFiledName('parent_id').label}
                            value={ !this.state.activity?.parent_name ? '' : (`[${this.getModuleName(this.state.activity?.parent_type)}] `+ this.state.activity?.parent_name)}
                            handleOnPress={() => {
                                if (this.state.activity?.parent_name) {
                                    switch (this.state.activity.parent_type) {
                                        case 'Accounts':
                                            this.props.navigation.navigate('OrganizationView', { account: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Contacts':
                                            this.props.navigation.navigate('ContactView', { contact: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Leads':
                                            this.props.navigation.navigate('LeadView', { lead: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Potentials':
                                            this.props.navigation.navigate('OpportunityView', { opportunity: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'HelpDesk':
                                            this.props.navigation.navigate(Global.getTicketViewLabel(), { ticket: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }}
                        />

                        <LineItemViewText
                            title={this.getFiledName('location').label}
                            value={this.state.activity?.location || ''}
                            handleOnPress={() => this.state.activity?.location && showOnMapHandler(this.state.activity?.location || '', this.props.dispatch)}
                        />
                    </SectionView>

                    {
                        Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <HeaderSectionView title={getLabel('activity.label_customer_related')} />

                                    <LineItemViewText
                                        title={getLabel('lead.title')}
                                        value={this.state.activity?.related_lead_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.related_lead) {
                                                this.props.navigation.navigate('LeadView', { lead: { id: this.state.activity?.related_lead }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />

                                    <LineItemViewText
                                        title={this.getFiledName('contact_id').label}
                                        value={this.state.activity?.contact_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.contact_id) {
                                                this.props.navigation.navigate('ContactView', { contact: { id: this.state.activity?.related_lead }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />

                                    <LineItemViewText
                                        title={getLabel('account.title')}
                                        value={this.state.activity?.related_account_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.related_account) {
                                                this.props.navigation.navigate('OrganizationView', { account: { id: this.state.activity?.related_account }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />
                                </SectionView>
                            </>
                        ) : null
                    }

                    <SpaceL />
                </TabContent>
            )
        } else {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView
                            title={getLabel('activity.title_activity_information')}
                        />
                        <Box
                            flexDirection='row'
                            width={widthResponse}
                        >
                            <LineItemViewText
                                title={this.state.metaData?.field_list?.date_start?.label || ''}
                                value={`${Global.formatDate(this.state.activity?.date_start)} ${this.state.activity?.time_start}` || ''}
                            />
                            <LineItemViewText
                                title={this.state.metaData?.field_list?.due_date?.label || ''}
                                value={`${Global.formatDate(this.state.activity?.due_date)} ${this.state.activity?.time_end}` || ''}
                            />
                        </Box>

                        <Box
                            flexDirection='row'
                            width={widthResponse}
                        >
                            <LineItemViewText
                                title={this.getFiledName('eventstatus').label}
                                value={Global.getEnumLabel('Events', 'eventstatus', this.state.activity?.eventstatus)}
                                textStyle={{ color: Global.getEnumColor('Events', 'eventstatus', this.state.activity?.eventstatus) || '#333' }}
                            />
                            <LineItemViewText
                                title={this.getFiledName('activitytype').label}
                                value={Global.getEnumLabel('Events', 'activitytype', this.state.activity?.activitytype)}
                                textStyle={{ color: Global.getEnumColor('Events', 'activitytype', this.state.activity?.activitytype) || '#333' }}
                            />
                        </Box>

                        <LineItemViewText
                            title={this.getFiledName('description').label}
                            value={this.state.activity?.description}
                        />

                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.activity?.assigned_owners ? Global.getAssignedOwnersName(this.state.activity?.assigned_owners) : ''}
                        />

                        <LineItemViewText
                            title={this.getFiledName('visibility').label}
                            value={Global.getEnumLabel('Events', 'visibility', this.state.activity?.visibility)}
                            textStyle={{ color: Global.getEnumColor('Events', 'visibility', this.state.activity?.visibility) || '#333' }}
                        />

                        <LineItemViewText
                            title={this.getFiledName('reminder_time').label}
                            value={this.state.activity?.reminder_time != 0 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />

                        <LineItemViewText
                            title={this.getFiledName('recurringtype').label}
                            value={this.state.activity?.recurringtype != '--None--' && this.state.activity?.recurringtype != '' ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />

                        <LineItemViewText
                            title={this.getFiledName('sendnotification').label}
                            value={this.state.activity?.sendnotification != 0 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />

                        <LineItemViewText
                            title={this.getFiledName('parent_id').label}
                            value={ !this.state.activity?.parent_name ? '' : (`[${this.getModuleName(this.state.activity?.parent_type)}] `+ this.state.activity?.parent_name)}
                            handleOnPress={() => {
                                if (this.state.activity?.parent_name) {
                                    switch (this.state.activity.parent_type) {
                                        case 'Accounts':
                                            this.props.navigation.navigate('OrganizationView', { account: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Contacts':
                                            this.props.navigation.navigate('ContactView', { contact: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Leads':
                                            this.props.navigation.navigate('LeadView', { lead: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'Potentials':
                                            this.props.navigation.navigate('OpportunityView', { opportunity: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        case 'HelpDesk':
                                            this.props.navigation.navigate(Global.getTicketViewLabel(), { ticket: { id: this.state.activity.parent_id }, prevScene: 'ActivityView' });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }}
                        />

                        <LineItemViewText
                            title={this.getFiledName('location').label}
                            value={this.state.activity?.location || ''}
                            handleOnPress={() => this.state.activity?.location && showOnMapHandler(this.state.activity?.location || '', this.props.dispatch)}
                        />
                    </SectionView>

                    {
                        Global.checkVersionCRMExist('7.1.0.20220215.0930') ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <HeaderSectionView title={getLabel('activity.label_customer_related')} />

                                    <LineItemViewText
                                        title={getLabel('lead.title')}
                                        value={this.state.activity?.related_lead_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.related_lead) {
                                                this.props.navigation.navigate('LeadView', { lead: { id: this.state.activity?.related_lead }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />

                                    <LineItemViewText
                                        title={this.getFiledName('contact_id').label}
                                        value={this.state.activity?.contact_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.contact_id) {
                                                this.props.navigation.navigate('ContactView', { contact: { id: this.state.activity?.contact_id }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />

                                    <LineItemViewText
                                        title={getLabel('account.title')}
                                        value={this.state.activity?.related_account_name || ''}
                                        handleOnPress={() => {
                                            if (this.state.activity?.related_account) {
                                                this.props.navigation.navigate('OrganizationView', { account: { id: this.state.activity?.related_account }, prevScene: 'ActivityView' });
                                            }
                                        }}
                                    />
                                </SectionView>
                            </>
                        ) : null
                    }

                    {
                        (this.state.activity?.activitytype == 'Call') ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <HeaderSectionView title={getLabel('activity.title_call_information')} />

                                    <LineItemViewText
                                        title={this.getFiledName('events_call_direction').label}
                                        value={Global.getEnumLabel('Events', 'events_call_direction', this.state.activity?.events_call_direction)}
                                        textStyle={{ color: Global.getEnumColor('Events', 'events_call_direction', this.state.activity?.events_call_direction) || '#333' }}
                                    />
                                    {
                                        this.state.activity.events_call_direction.toString().toUpperCase == 'OUTBOUND' ?
                                            (
                                                <LineItemViewText
                                                    title={this.getFiledName('events_call_purpose').label}
                                                    value={Global.getEnumLabel('Events', 'events_call_purpose', this.state.activity?.events_call_purpose)}
                                                    textStyle={{ color: Global.getEnumColor('Events', 'events_call_purpose', this.state.activity?.events_call_purpose) || '#333' }}
                                                />
                                            )
                                            :
                                            (
                                                < LineItemViewText
                                                    title={this.getFiledName('events_inbound_call_purpose').label}
                                                    value={Global.getEnumLabel('Events', 'events_inbound_call_purpose', this.state.activity?.events_inbound_call_purpose)}
                                                    textStyle={{ color: Global.getEnumColor('Events', 'events_inbound_call_purpose', this.state.activity?.events_inbound_call_purpose) || '#333' }}
                                                />
                                            )
                                    }


                                    <LineItemViewText
                                        title={this.getFiledName('missed_call').label}
                                        value={this.state.activity?.missed_call != 0 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                                    />

                                    <LineItemViewText
                                        title={this.getFiledName('events_call_result').label}
                                        value={Global.getEnumLabel('Events', 'events_call_result', this.state.activity?.events_call_result)}
                                        textStyle={{ color: Global.getEnumColor('Events', 'events_call_result', this.state.activity?.events_call_result) || '#333' }}
                                    />

                                    <Box paddingHorizontal='l' paddingVertical='m' style={[{ flex: 1 }]}>
                                        <NText allowFontScaling={true} color={Colors.black.black3}>{this.getFiledName('pbx_call_id').label}</NText>
                                        <Box paddingVertical='s' />

                                        {
                                            this.state.activity.can_play_recording && parseInt(this.state.activity.can_play_recording) == 1 ?
                                                (
                                                    <>
                                                        <TouchableOpacity
                                                            style={{
                                                                width: 30,
                                                                height: 30,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: 30 / 2,
                                                            }}
                                                            onPress={() => this.setState({ showModalPlayAudio: true })}
                                                        >
                                                            <FontAwesome5 name='play-circle' style={{ color: Colors.black.black3, fontSize: 20 }} />
                                                        </TouchableOpacity>
                                                        <PlayAudioURL
                                                            url={`${Global.getServiceUrl('serverUrl')}/entrypoint.php?name=GetCallRecording&token=${Global.token}&pbx_call_id=${this.state.activity.pbx_call_id}`}
                                                            hasOpenModal={this.state.showModalPlayAudio}
                                                            onClose={() => { this.setState({ showModalPlayAudio: false }) }}
                                                        />
                                                    </>
                                                )
                                                :
                                                null
                                        }
                                    </Box>

                                </SectionView>
                            </>
                        ) : null
                    }

                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('activity.title_invitee_information')} />

                        <LineItemInviteViewText
                            title={this.getFiledName('contact_id').label}
                            value={this.state.activity?.contact_invitees}
                        />

                        <LineItemInviteViewText
                            title={this.getFiledName('user_invitees').label}
                            value={this.state.activity?.users_invitees}
                        />
                    </SectionView>

                    <SpaceS />
                    {
                        (this.state.activity.checkin_longitude && this.state.activity.checkin_latitude) ? (
                            <SectionView noPaddingHorizontal>
                                <HeaderSectionView title={getLabel('activity.title_check_in_information')} />
                                <LineItemViewText
                                    title={this.getFiledName('checkin_address').label}
                                    value={this.state.activity?.checkin_address}
                                />
                                <LineItemViewText
                                    title={this.getFiledName('checkin_time').label}
                                    value={Global.formatDateTime(this.state.activity?.checkin_time)}
                                />

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
                                <Box paddingHorizontal='l' paddingVertical='m' flexDirection='row'>
                                    <Box flex={1} alignItems='center' >
                                        <Image
                                            source={{ uri: Global.getImageUrl(this.state.activity?.checkin_salesman_image) }}
                                            style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                                        />
                                    </Box>
                                    <Box flex={1} alignItems='center' >
                                        <Image
                                            source={{ uri: Global.getImageUrl(this.state.activity?.checkin_customer_image) }}
                                            style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                                        />
                                    </Box>
                                </Box>
                            </SectionView>
                        ) : null
                    }

                    <SpaceL />
                </TabContent>

            );
        }
    }

    render() {
        const { route, navigation, showAlert } = this.props;
        const { activity } = this.state;
        var isComplete = false;
        if ((activity.eventstatus == 'Held' && activity.activitytype != 'Task') || (activity.taskstatus == 'Completed')) {
            isComplete = true;
        }
        const scrollY = Animated.add(
            this.state.scrollY,
            Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
        );
        const headerTranslate = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -HEADER_SCROLL_DISTANCE],
            extrapolate: 'clamp',
        });

        if (!this.state.interactionsComplete) {
            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: Colors.white.white1
                    }}
                >
                </View>
            )
        }

        const isOwnerRecord = Global.isOwnerRecord(activity?.assigned_owners);

        return (
            <>
                <View style={styles.fill}>
                    <KeyboardAvoidingView
                        style={styles.fill}
                        enabled={true}
                        keyboardVerticalOffset={56}
                        behavior={Platform.OS == "ios" ? "padding" : "height"}
                    >
                        <Animated.ScrollView
                            ref={(mainScroll) => this.mainScroll = mainScroll}
                            style={styles.fill}
                            scrollEventThrottle={1}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                                { useNativeDriver: true },
                            )}
                            contentInset={{
                                top: HEADER_MAX_HEIGHT,
                            }}
                            contentOffset={{
                                y: -HEADER_MAX_HEIGHT,
                            }}
                        >
                            {
                                this.state.isReady ? (
                                    <View style={{ marginTop: Platform.OS == 'ios' ? 0 : HEADER_MAX_HEIGHT }}>
                                        {this.renderTabDetail()}
                                    </View>
                                )
                                    : null
                            }
                        </Animated.ScrollView>
                    </KeyboardAvoidingView>
                    {/* Header Scroll */}
                    <Animated.View
                        style={[
                            styles.header,
                            { transform: [{ translateY: headerTranslate }] },
                        ]}
                    >
                        <View style={{ flex: 1 }} />
                        <ScrollView horizontal style={{ maxHeight: 90, flexDirection: 'row', width: widthResponse }}>
                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                icon={getIcon('CheckIn')}
                                disabled={!isOwnerRecord || isComplete || activity.activitytype != 'Meeting' || (activity.activitytype == 'Meeting' && activity.checkin_time)}
                                label={getLabel('common.btn_check_in')}
                                onPress={() => {
                                    var dataCheckIn = { ...this.state.activity };
                                    if (this.props.route?.params?.prevScene === 'Calendar') {
                                        Global.checkPermissionLocation(() => {
                                            this.props.navigation.replace('Camera', { cameraType: 'both', type: 'check_in', data: dataCheckIn, prevScene: 'ActivityView', parentScene: 'Calendar', onReLoadData: this.props.route?.params?.onReLoadData, title: getLabel('common.title_check_in') })
                                            Global.getInformationLocationCheckIn(null);
                                        })
                                    }
                                    else {
                                        Global.checkPermissionLocation(() => {
                                            this.props.navigation.replace('Camera', { cameraType: 'both', type: 'check_in', data: dataCheckIn, prevScene: 'ActivityView', title: getLabel('common.title_check_in') })
                                            Global.getInformationLocationCheckIn(null);
                                        })
                                    }
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                icon={getIcon('Edit')}
                                disabled={!isOwnerRecord || isComplete}
                                label={getLabel('common.btn_edit')}
                                onPress={() => {
                                    if (route?.params?.prevScene === 'Calendar') {
                                        navigation.replace('ActivityForm', { activity: this.state.activity, prevScene: 'ActivityView', parentScene: 'Calendar', onReLoadData: route?.params?.onReLoadData })
                                    }
                                    else {
                                        navigation.replace('ActivityForm', { activity: this.state.activity, prevScene: 'ActivityView' })
                                    }
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 15,
                                }}
                                icon={'check'}
                                disabled={!isOwnerRecord || isComplete}
                                label={getLabel('common.btn_mask_completed')}
                                onPress={() => {
                                    if (activity.activitytype == 'Meeting' && activity.checkin_time) { // Meeting is checked in and not check out
                                        this.setState({
                                            description: this.state.activity?.description || '',
                                            isShowConfirmCompleteMeeting: true
                                        });
                                    }
                                    else {
                                        this.completeActivity();
                                    }
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(activity?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(activity?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => {
                                    this.toggleFavorite()
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                icon={getIcon('Delete')}
                                disabled={!isOwnerRecord || isComplete}
                                color={Colors.functional.dangerous}
                                label={getLabel('common.btn_delete')}
                                onPress={() => {
                                    const params: PARAMS_ALERT = {
                                        message: getLabel('common.title_confirm_delete_record'),
                                        actions: [
                                            {
                                                isCancel: true,
                                                label: getLabel('common.btn_cancel')
                                            },
                                            {
                                                isCancel: false,
                                                label: getLabel('common.btn_delete'),
                                                isHighLight: true,
                                                onPress: () => {
                                                    this.setState({ loading: true })
                                                    Global.deleteRecord(this.state.activity?.record_module, this.state.activity?.id, data => {
                                                        this.setState({ loading: false })
                                                        if (route?.params?.prevScene === 'Calendar') {
                                                            route?.params?.onReLoadData?.();
                                                        }
                                                        Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('activity.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                        Global.updateCounters();
                                                        navigation.goBack();
                                                    },
                                                        error => {
                                                            Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('lead.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                            this.setState({ loading: false })
                                                        })
                                                }
                                            }
                                        ]
                                    }
                                    showAlert?.(params)
                                }}
                            />
                        </ScrollView>
                    </Animated.View>

                    {/* Fix header */}
                    <Animated.View
                        style={[
                            styles.bar,
                        ]}
                    >
                        <Header noBorder>
                            <Left style={{ minWidth: '70%' }}>
                                <SpaceHM />
                                <Icon name={getIconModule(this.state.activity?.activitytype || 'Task')} style={{ fontSize: 18 }} />
                                <SpaceHS />
                                <Box flex={1}>
                                    <LBText allowFontScaling={true} numberOfLines={2}>
                                        {activity?.label}
                                    </LBText>
                                </Box>
                            </Left>
                            <Right>
                                <TouchableHighlight
                                    style={{ marginRight: 4, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                    activeOpacity={0.3}
                                    underlayColor='#d0d0d0'
                                    onPress={() => {
                                        this.goBack();
                                    }}
                                >
                                    <Icon name={getIcon('Close')} style={{ fontSize: 25 }} />
                                </TouchableHighlight>
                            </Right>
                        </Header>
                    </Animated.View>
                </View>
                <IndicatorLoading loading={this.state.loading} />
                {this.renderConfirmCompleteMeeting()}
            </>
        )
    }
}

const mapStateToProps = () => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityView)
