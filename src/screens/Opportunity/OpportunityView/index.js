// Import libraries
import React, { Component } from 'react'
import {
    ActivityIndicator, Animated, BackHandler, FlatList, InteractionManager, Keyboard, KeyboardAvoidingView, Modal, Platform,
    ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native'
import { Image } from 'react-native-animatable'
import DocumentPicker from 'react-native-document-picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MenuItem } from 'react-native-material-menu'
import Toast from 'react-native-root-toast'
import TimeAgo from 'react-native-timeago'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import OcticonsIcon from 'react-native-vector-icons/dist/Octicons'
import { connect } from 'react-redux'
import CommentInput from '../../../components/CommentInput'
import CommentView from '../../../components/CommentView'
// Import components
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView'
import {
    Divider, Header, LargeHeader, LBText, Left,
    ListItem, NBText, NText, Right, SBText, SectionView, SpaceHM, SpaceHS, SpaceL, SpaceS, SText, TabContent, TagOutLine
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Menu from '../../../components/MenuPopup'
import ModalSelect from '../../../components/ModalSelect'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { showAlert } from '../../../redux/actions/alert'
import { displayMessageError, displayMessageSuccess } from '../../../redux/actions/messagePopup'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import {
    formatDateTime, getIcon, getIconModule, getLabel, heightDevice, isIphoneX, widthResponse
} from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import { ACTION_ALERT, PARAMS_ACTION_SHEET, PARAMS_ALERT, PARAMS_MESSAGE } from '../../../utils/Models/models'
import styles from './styles'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);
export class OpportunityView extends Component {

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
            opportunity: {},
            metaData: {},
            isReady: false,
            loading: false,
            counters: null,
            commentList: [],
            comment: '',
            commentReply: '',
            attachment: [],
            isShowLostReasonModal: false,
            lostReason: '',
            newSalesStage: '',
            isShowRequired: false,
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
            this.handleTabsChange(this.state.tabSelected);
            const { route } = this.props;
            this.setState({ opportunity: route?.params?.opportunity }, () => {
                this.loadData();
            })
        });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.backHandler.remove();
    }

    goBack() {
        if (this.props?.route?.params?.isViewDetailRelated) {
            this.props?.navigation.replace('ModalOpportunityList', this.props?.route?.params?.dataRelated)
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetOpportunity',
            Params: {
                id: this.state.opportunity?.potentialid || this.state.opportunity?.id,
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
                    opportunity: data.data,
                    metaData: data.metadata,
                    counters: data.data.counters,
                    commentList: Global.sortCommentList(data.data?.modcomments_list || [])?.reverse()
                }, () => {
                    this.setState({ isReady: true }, () => {
                        this.props.route?.params?.onUpdateItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1, data.data);
                    });
                });
            }
            else {
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('opportunity.title', { locale: Global.locale || "vn_vn" }) }));
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
                module: 'Potentials',
                id: this.state.opportunity?.id,
                starred: (parseInt(this.state.opportunity?.starred || '0') == 0) ? 1 : 0
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

    changeSalesStage() {
        this.setState({ loading: true });
        var paramsRequest = {
            RequestAction: 'SaveOpportunity',
            Data: {
                id: this.state.opportunity.potentialid || this.state.opportunity.id,
                sales_stage: this.state.newSalesStage,
                probability: Global.getProbabilityFromSalesStage(this.state.newSalesStage)
            }
        }

        if (this.state.newSalesStage == 'Closed Lost') {
            paramsRequest.Data.potentiallostreason = this.state.lostReason;
        }

        Global.callAPI(this, paramsRequest, data => {
            if (parseInt(data.success) === 1) {
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('opportunity.msg_change_sales_stage_success')
                }
                this.setState({ loading: false });
                this.props.displayMessageSuccess(paramsMessage);
                this.loadData();
            }
            else {
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('opportunity.msg_change_sales_stage_error')
                }
                this.setState({ loading: false });
                this.props.displayMessageError(paramsMessage);
            }
        },
            error => {
                this.setState({ loading: false });
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('common.msg_connection_error')
                }

                dispatch(displayMessageError(paramsMessage));
            });
    }

    changeStage = () => {
        const options = [...Global.getEnum('Potentials', 'sales_stage')];
        const indexSelected = options.findIndex((option) => option.key === this.state.opportunity.sales_stage);

        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('opportunity.title_change_sales_stage'),
            indexSelected: indexSelected,
            iconSelected: 'flag',
            selectedColor: Colors.functional.primary,
            backgroundSelectedColor: Colors.white.white2,
            options: options,
            onSelected: (index) => {
                const actionCancel: ACTION_ALERT = {
                    label: getLabel('common.btn_cancel'),
                    isCancel: true,
                    textStyle: { color: Colors.black.black1 },
                    isHighLight: false,
                    onPress: undefined

                }

                const actionConfirm: ACTION_ALERT = {
                    label: getLabel('common.btn_change'),
                    isCancel: false,
                    textStyle: undefined,
                    isHighLight: false,
                    onPress: () => {
                        this.setState({ newSalesStage: options[index].key });
                        if (options[index].key == 'Closed Lost') {
                            this.setState({ isShowLostReasonModal: true });
                        }
                        else {
                            this.changeSalesStage();
                        }
                    }
                }

                const paramAlert: PARAMS_ALERT = {
                    message: <NText allowFontScaling={true} >{getLabel('opportunity.msg_confirm_change_sales_stage')}<NBText allowFontScaling={true} >{Global.getEnumLabel('Potentials', 'sales_stage', options[index].key)}</NBText>?</NText>,
                    actions: [actionCancel, actionConfirm],
                }
                this.props.showAlert?.(paramAlert);
            }
        }
        this.props.showActionSheet?.(params);
    }

    replyComment(item) {
        // Just allow user reply one comment
        this.state.commentList.map((comment, index) => {
            if (comment.modcommentsid != item.modcommentsid) {
                this.state.commentList[index].isReplying = false;
            }
            else {
                this.state.commentList[index].isReplying = true;
            }

            if (comment.child_comments?.length > 0) {
                comment.child_comments.map((reply, indexReplyCmt) => {
                    if (reply.modcommentsid != item.modcommentsid) {
                        this.state.commentList[index].child_comments[indexReplyCmt].isReplying = false;
                    }
                    else {
                        this.state.commentList[index].child_comments[indexReplyCmt].isReplying = true;
                    }
                })
            }
        })

        this.setState({ commentList: this.state.commentList, commentReply: `@[${item.assigned_owners[0].name}](${item.smcreatorid}) ` })
    }

    async getAttachment() {
        try {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.allFiles],
            });
            let tmpResults = [];
            for (const res of results) {
                tmpResults.push({
                    uri: res.uri,
                    type: res.type,
                    name: res.name
                });
            }

            this.setState({ attachment: tmpResults });
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
                console.log('Cancel picker!');
            } else {
                throw err;
            }
        }
    }

    renderLostReasonModal() {
        return (
            <Modal
                visible={this.state.isShowLostReasonModal}
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
                                <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{getLabel('opportunity.title_lost_reason')}</Text>
                            </Box>
                            {/* Body */}
                            <Box
                                borderWidth={StyleSheet.hairlineWidth}
                                borderColor='black4'
                            >
                                <Box
                                    height={100}
                                    marginTop='l'
                                    paddingHorizontal='l'
                                >
                                    {/* <Label style={{
                                        paddingLeft: 0,
                                        fontSize: 14,
                                        color: Colors.black.black3
                                    }}>
                                        {this.state.metaData?.field_list?.potentiallostreason?.label}
                                    </Label> */}

                                    <ModalSelect
                                        title={this.state.metaData?.field_list?.potentiallostreason?.label}
                                        options={Global.getEnum('Potentials', 'potentiallostreason')}
                                        required={true}
                                        value={
                                            this.state.lostReason ? {
                                                key: this.state.lostReason,
                                                label: Global.getEnumLabel('Potentials', 'potentiallostreason', this.state.lostReason)
                                            } : {}
                                        }
                                        onSelected={(value, index) => {
                                            this.setState({ lostReason: value.key })

                                        }}
                                        isSubmitted={(!this.state.lostReason && this.state.isShowRequired)}
                                    />

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
                                            isShowLostReasonModal: false
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
                                        if (this.state.lostReason) {
                                            this.setState({
                                                isShowLostReasonModal: false,
                                            }, () => {
                                                setTimeout(() => {
                                                    this.changeSalesStage()
                                                }, 500)
                                            })
                                        }
                                        else {
                                            this.setState({
                                                isShowRequired: true
                                            }, () => {
                                                setTimeout(() => {
                                                    this.setState({
                                                        isShowRequired: false
                                                    })
                                                }, 4000)
                                            })
                                        }

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

    renderCommentChild(data, numberOfCommentShow) {
        return (
            <FlatList
                data={data}
                keyboardShouldPersistTaps='always'
                renderItem={({ item, index }) => {
                    if (index < numberOfCommentShow) {
                        return (
                            <>
                                <Box flexDirection='row' paddingVertical={'m'} style={{ paddingRight: 22 }} key={item}>
                                    <Box justifyContent='center' alignItems='center' style={{ width: 70, minHeight: 70 }}>
                                        <Box style={[styles.boxAvatarReply, styles.shadow]}>
                                            <Image
                                                source={{ uri: Global.getImageUrl(Global.getUser(item.smownerid)?.avatar) }}
                                                resizeMode='contain'
                                                style={styles.avatarReply}
                                            />
                                        </Box>
                                    </Box>
                                    <Box style={{ flex: 1 }}>
                                        <Box flexDirection='column' >
                                            <Box
                                                flexDirection='row'
                                                alignItems={'center'}
                                                width={widthResponse - 70 - 24 - 50}
                                            >
                                                <SBText allowFontScaling={true} >{Global.getUser(item.smownerid)?.full_name}</SBText>
                                                <SpaceHS />
                                                <OcticonsIcon name='primitive-dot' color={Colors.black.black3} />
                                                <SpaceHS />
                                                <TimeAgo
                                                    time={item.createdtime}
                                                    interval={20000}
                                                    style={{ color: Colors.black.black3 }}
                                                />
                                            </Box>
                                            <Box
                                                paddingVertical={'m'}
                                                flexDirection='row'
                                                width={widthResponse - 70 - 24 - 50}
                                            >
                                                {/* <SText allowFontScaling={true} numberOfLines={2}> */}
                                                <CommentView
                                                    commentContent={item.commentcontent}
                                                    type='child'
                                                />
                                                {/* </SText> */}
                                            </Box>
                                        </Box>
                                        <Box flexDirection='row' alignItems={'center'}>
                                            <TouchableHighlight
                                                activeOpacity={.2}
                                                underlayColor={Colors.white.white1}
                                                style={{ paddingVertical: 5 }}
                                                onPress={() => {
                                                    this.replyComment(item)
                                                }}
                                            >
                                                <SText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_reply')}</SText>
                                            </TouchableHighlight>
                                        </Box>
                                    </Box>
                                </Box>
                                {item.isReplying && this.renderReplyComponent(item)}
                                <Divider />
                            </>
                        )
                    }
                }}
            />
        )
    }

    renderReplyComponent(data) {
        return (
            <Box>
                <Box
                    paddingHorizontal={'l'}
                    paddingVertical={'m'}
                    style={styles.commnetContent}
                >

                    <CommentInput
                        comment={this.state.commentReply}
                        inputProps={{
                            style: [styles.comment, { height: 40 }],
                            underlineColorAndroid: "transparent",
                            placeholder: getLabel('common.label_placeholder_comment'),
                            placeholderTextColor: Colors.black.black3,
                            multiline: true,
                        }}
                        onCommentChange={(value) => {
                            this.setState({ commentReply: value })
                        }}
                    />
                </Box>
                <Box paddingHorizontal={'l'} paddingVertical={'m'}>
                    <TouchableHighlight
                        activeOpacity={.2}
                        underlayColor={Colors.functional.primary}
                        style={{
                            backgroundColor: Colors.functional.primary,
                            paddingHorizontal: 20,
                            paddingVertical: 5,
                            borderRadius: 6,
                            alignSelf: 'flex-end'
                        }}
                        onPress={() => {
                            let comment = {
                                commentcontent: this.state.commentReply,
                                parent_comments: data.modcommentsid
                            }
                            Keyboard.dismiss();
                            Global.saveComment(this, this.state.opportunity?.id, comment, 'reply', () => {
                                this.setState({ comment: '' }, () => {
                                    Global.getComments(this, this.state.opportunity?.id, data => {
                                        this.setState({ commentList: Global.sortCommentList(data || [])?.reverse() });
                                    }, () => {
                                        Toast.show(getLabel('common.msg_connection_error'));
                                    })
                                })
                            }, () => {
                                Toast.show(getLabel('common.msg_connection_error'))
                            })
                        }}
                    >
                        <NText allowFontScaling={true} color={Colors.white.white1}>{getLabel('common.btn_reply')}</NText>
                    </TouchableHighlight>
                </Box>
            </Box>
        )
    }

    renderTabOverView = () => {
        return (
            <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                <SpaceS />
                <SectionView noPaddingHorizontal>

                    <HeaderSectionView
                        title={getLabel('common.title_info_base')}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.potentialname?.label || '---'}
                        value={this.state.opportunity?.potentialname || ''}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.contact_id?.label || '---'}
                        value={this.state.opportunity?.contact_name || ''}
                        handleOnPress={() => this.state.opportunity?.contact_name && this.props.navigation.navigate('ContactView', { contact: { id: this.state.opportunity.contact_id }, prevScene: 'OpportunityView' })}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.closingdate?.label || '---'}
                        value={Global.formatDate(this.state.opportunity?.closingdate) || ''}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.assigned_user_id?.label || '---'}
                        value={this.state.opportunity?.assigned_user_id ? Global.getAssignedOwnersName(this.state.opportunity.assigned_owners) : ''}
                    />

                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <Box justifyContent={'space-between'} alignItems={'center'} paddingHorizontal='l' paddingVertical='m' flexDirection='row'>
                        <NBText allowFontScaling={true} >{getLabel('common.title_upcoming_activities')}</NBText>
                        <TouchableHighlight
                            activeOpacity={0.3}
                            underlayColor={Colors.white.white2}
                            style={{ paddingHorizontal: 12, paddingVertical: 4 }}
                            onPress={() => {
                                this.menuActivity.show();
                            }}
                        >
                            <>
                                <NText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NText>
                                <Menu
                                    ref={menuActivity => this.menuActivity = menuActivity}
                                    style={{ left: undefined, right: 18 }}
                                    button={
                                        <></>
                                    }
                                >
                                    <MenuItem
                                        onPress={() => {
                                            let activityTmpCall = {
                                                activitytype: 'Call',
                                                parent_id: this.state.opportunity?.id,
                                                parent_name: this.state.opportunity?.label,
                                                parent_type: 'Potentials'
                                            }
                                            this.props.navigation.navigate('ActivityForm', { activity: activityTmpCall });
                                            this.menuActivity.hide();
                                        }}
                                    >
                                        <Icon name={getIconModule('Call')} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.title_event_call')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => {
                                            let activityTmpMeeting = {
                                                activitytype: 'Meeting',
                                                parent_id: this.state.opportunity?.id,
                                                parent_name: this.state.opportunity?.label,
                                                parent_type: 'Potentials'
                                            }
                                            this.props.navigation.navigate('ActivityForm', { activity: activityTmpMeeting });
                                            this.menuActivity.hide();
                                        }}
                                    >
                                        <Icon name={getIconModule('Meeting')} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.title_event_meeting')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => {
                                            let activityTmpTask = {
                                                activitytype: 'Task',
                                                parent_id: this.state.opportunity?.id,
                                                parent_name: this.state.opportunity?.label,
                                                parent_type: 'Potentials'
                                            }
                                            this.props.navigation.navigate('ActivityForm', { activity: activityTmpTask });
                                            this.menuActivity.hide();
                                        }}
                                    >
                                        <Icon name={getIconModule('Task')} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.title_event_task')}</NText>
                                    </MenuItem>
                                </Menu>
                            </>
                        </TouchableHighlight>

                    </Box>

                    <Box paddingHorizontal='z'>
                        <Divider />
                    </Box>

                    <SpaceS />
                    <ScrollView style={{ height: 188 }}>
                        {
                            !this.state.opportunity?.activities_list
                                || this.state.opportunity?.activities_list?.length <= 0
                                || this.state.opportunity?.activities_list?.filter((activity) => (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned'))?.length <= 0 ?
                                (
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                    >
                                        <Text allowFontScaling={true} color='dangerous' fontSize={13} fontStyle='italic' fontWeight='600'>{getLabel('common.label_empty_upcoming_activities')}</Text>
                                    </Box>
                                )
                                : null
                        }

                        {
                            this.state.opportunity?.activities_list?.map((activity, index) => {
                                if (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned') {
                                    return (
                                        <Box key={index}>
                                            <Box paddingHorizontal={'z'} >
                                                <ListItem
                                                    style={{ paddingHorizontal: 10 }}
                                                    icon={activity.activitytype == 'Call' ? getIconModule('Call') : activity.activitytype == 'Meeting' ? getIconModule('Meeting') : getIconModule('Task')}
                                                    title={activity.subject}
                                                    subTitle={`${Global.formatDate(activity.date_start)} ${Global.formatTime(activity.date_start + ' ' + activity.time_start)}`}
                                                    iconBorder={true}
                                                    divider={false}
                                                    titleStyle={{ fontSize: 14 }}
                                                    subTitleStyle={{ fontSize: 12, marginTop: 4 }}
                                                    onPress={() => this.props.navigation.navigate('ActivityView', { activity: activity, prevScene: 'RelatedScreen' })}
                                                />
                                            </Box>
                                            <Divider />
                                        </Box>
                                    )
                                }
                            })
                        }
                    </ScrollView>
                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <Box justifyContent={'center'} paddingHorizontal='l' paddingVertical='m'>
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                        >
                            <NBText allowFontScaling={true} >{getLabel('common.title_comment')}</NBText>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        comment: '',
                                        attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.opportunity?.id, data => {
                                            this.setState({ commentList: Global.sortCommentList(data || [])?.reverse() });
                                        }, () => {
                                            Toast.show(getLabel('common.msg_connection_error'));
                                        })
                                    })
                                }}
                            >
                                <Icon name='sync' style={{ fontSize: 16 }} />
                            </TouchableOpacity>
                        </Box>
                        <SpaceS />
                        <Divider />
                    </Box>
                    <Box paddingHorizontal='l' paddingVertical='m'>
                        <View
                            ref={(commentLayout) => { this.commentLayout = commentLayout }}
                            style={styles.commnetContent} >
                            <CommentInput
                                comment={this.state.comment}
                                inputProps={{
                                    multiline: true,
                                    style: [styles.comment],
                                    placeholder: getLabel('common.label_placeholder_comment'),
                                    placeholderTextColor: Colors.black.black3,
                                    underlineColorAndroid: "transparent",
                                }}
                                onCommentChange={(value) => {
                                    this.setState({
                                        comment: value
                                    })
                                }}
                            />
                        </View>
                    </Box>
                    <Box justifyContent={'space-between'} flexDirection='row' paddingHorizontal='l' paddingVertical='m'>
                        <View />
                        {/* <TouchableHighlight
                            activeOpacity={.2}
                            underlayColor={Colors.white.white3}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 6
                            }}
                            onPress={() => {
                                this.getAttachment()
                            }}
                        >
                            <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_attach_file')}</NText>
                        </TouchableHighlight> */}
                        <TouchableHighlight
                            activeOpacity={.2}
                            underlayColor={Colors.functional.primary}
                            style={{
                                backgroundColor: Colors.functional.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 5,
                                borderRadius: 6
                            }}
                            onPress={() => {
                                let comment = {
                                    commentcontent: this.state.comment,
                                    filename: this.state.attachment
                                }
                                Keyboard.dismiss();
                                Global.saveComment(this, this.state.opportunity?.id, comment, 'post', () => {
                                    this.setState({
                                        comment: '',
                                        attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.opportunity?.id, data => {
                                            this.setState({ commentList: Global.sortCommentList(data || [])?.reverse() });
                                        }, () => {
                                            Toast.show(getLabel('common.msg_connection_error'));
                                        })
                                    })
                                }, () => {
                                    Toast.show(getLabel('common.msg_connection_error'))
                                })
                            }}
                        >
                            <NText allowFontScaling={true} color={Colors.white.white1}>{getLabel('common.btn_post')}</NText>
                        </TouchableHighlight>
                    </Box>
                    {
                        this.state.attachment.length > 0 && this.state.attachment.map((item, index) => {
                            return (
                                <Box paddingLeft={'xl'} paddingVertical={'m'}>
                                    <SpaceS />
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center' }}
                                        onPress={() => {
                                            let tmpAttachment = [...this.state.attachment];
                                            tmpAttachment.splice(index, 1);
                                            this.setState({ attachment: tmpAttachment });
                                        }}
                                    >
                                        <Icon name={getIcon('Close')} color={Colors.functional.primary} />
                                        <SpaceHS />
                                        <SText allowFontScaling={true} color={Colors.functional.primary}>{item.name}</SText>
                                    </TouchableOpacity>
                                </Box>
                            )
                        })
                    }
                    <SpaceS />
                    <Box paddingHorizontal={'l'} paddingVertical={'m'}>
                        <Divider />
                        <FlatList
                            data={this.state?.commentList}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps='always'
                            extraData={(item, index) => index.toString()}
                            renderItem={({ item, index }) =>
                                <>
                                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                                        <Box flexDirection='row' paddingVertical={'m'} style={{ paddingRight: 22 }}>
                                            <Box justifyContent='center' alignItems='center' style={{ width: 70, minHeight: 70 }}>
                                                <Box style={[styles.boxAvatar, styles.shadow]}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(Global.getUser(item.smownerid)?.avatar) }}
                                                        resizeMode='contain'
                                                        style={styles.avatar}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box style={{ flex: 1 }}>
                                                <Box flexDirection='column' >
                                                    <Box
                                                        flexDirection='row'
                                                        alignItems={'center'}
                                                        width={widthResponse - 70 - 24}
                                                    >
                                                        <NBText allowFontScaling={true}>{Global.getUser(item.smownerid)?.full_name}</NBText>
                                                        <SpaceHS />
                                                        <OcticonsIcon name='primitive-dot' color={Colors.black.black3} />
                                                        <SpaceHS />
                                                        <TimeAgo
                                                            time={item.createdtime}
                                                            interval={20000}
                                                            style={{ color: Colors.black.black3 }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        paddingVertical={'m'}
                                                        flexDirection='row'
                                                        width={widthResponse - 70 - 24}
                                                    >
                                                        {/* <NText allowFontScaling={true} numberOfLines={2}> */}
                                                        <CommentView
                                                            commentContent={item.commentcontent}
                                                            type='parent'
                                                        />
                                                        {/* </NText> */}
                                                    </Box>
                                                </Box>
                                                <Box flexDirection='row' alignItems={'center'}>
                                                    <TouchableHighlight
                                                        activeOpacity={.2}
                                                        underlayColor={Colors.white.white1}
                                                        style={{ paddingVertical: 5 }}
                                                        onPress={() => {
                                                            this.replyComment(item)
                                                        }}
                                                    >
                                                        <NText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_reply')}</NText>
                                                    </TouchableHighlight>
                                                    {
                                                        item?.child_comments?.length && !item.show_child_comment && (
                                                            <>
                                                                <SpaceHS />
                                                                <OcticonsIcon name='primitive-dot' color={Colors.black.black3} />
                                                                <SpaceHS />
                                                                <TouchableHighlight
                                                                    activeOpacity={.2}
                                                                    underlayColor={Colors.white.white1}
                                                                    style={{ paddingVertical: 5 }}
                                                                    onPress={() => {
                                                                        item.show_child_comment = true;
                                                                        if (item.child_comments.length > 3) {
                                                                            item.number_of_child_comment_not_show = item.child_comments.length - 3;
                                                                        }
                                                                        else {
                                                                            item.number_of_child_comment_not_show = 0;
                                                                        }
                                                                        this.setState({ commentList: this.state.commentList });
                                                                    }}
                                                                >
                                                                    <NText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_show_replies', { numberOfComments: item?.child_comments?.length })}</NText>
                                                                </TouchableHighlight>
                                                            </>
                                                        )
                                                    }
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TouchableWithoutFeedback>
                                    {item.isReplying && this.renderReplyComponent(item)}
                                    <Divider />
                                    <Box style={{ paddingLeft: 50 }}>
                                        {
                                            item.show_child_comment && (
                                                this.renderCommentChild(item.child_comments, item.child_comments?.length - item.number_of_child_comment_not_show)
                                            )
                                        }
                                        {
                                            item?.number_of_child_comment_not_show && item.number_of_child_comment_not_show > 0 ? (
                                                <>
                                                    <SpaceS />
                                                    <TouchableHighlight
                                                        activeOpacity={.2}
                                                        underlayColor={Colors.white.white1}
                                                        style={{ paddingVertical: 5 }}
                                                        onPress={() => {
                                                            if (item.number_of_child_comment_not_show > 3) {
                                                                item.number_of_child_comment_not_show = item.number_of_child_comment_not_show - 3;
                                                            }
                                                            else {
                                                                item.number_of_child_comment_not_show = 0;
                                                            }
                                                            this.setState({ commentList: this.state.commentList });
                                                        }}
                                                    >
                                                        <NText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_show_replies', { numberOfComments: item.number_of_child_comment_not_show })}</NText>
                                                    </TouchableHighlight>
                                                </>
                                            ) : null
                                        }
                                    </Box>
                                </>
                            }
                        />
                        <Divider />
                    </Box>
                </SectionView>
                <SpaceL />

            </TabContent>
        );
    }

    renderTabDetail = () => {

        if (this.state.loadingTabDetail) {
            return (
                <TabContent>
                    <ActivityIndicator style={{ paddingVertical: 10 }} />
                </TabContent>
            )
        } else {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('common.title_info_base')} />

                        <LineItemViewText
                            title={this.getFiledName('potentialname').label || '---'}
                            value={this.state.opportunity?.potentialname || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('potential_no').label || '---'}
                            value={this.state.opportunity?.potential_no || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('related_to').label || '---'}
                            value={this.state.opportunity?.related_to_name || ''}
                            handleOnPress={() => this.state.opportunity?.related_to_name && this.props.navigation.navigate('OrganizationView', { account: { id: this.state.opportunity.related_to }, prevScene: 'OpportunityView' })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contact_id').label || '---'}
                            value={this.state.opportunity?.contact_name || ''}
                            handleOnPress={() => this.state.opportunity?.contact_name && this.props.navigation.navigate('ContactView', { contact: { id: this.state.opportunity.contact_id }, prevScene: 'OpportunityView' })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('amount').label || '---'}
                            value={Global.formatCurrency(this.state.opportunity?.amount || 0)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('opportunity_type').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'opportunity_type', this.state.opportunity?.opportunity_type) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('closingdate').label || '---'}
                            value={Global.formatDate(this.state.opportunity?.closingdate) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('leadsource').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'leadsource', this.state.opportunity?.leadsource) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('nextstep').label || '---'}
                            value={this.state.opportunity?.nextstep || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('sales_stage').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'sales_stage', this.state.opportunity?.sales_stage) || ''}
                        />
                        {
                            this.state.opportunity?.sales_stage == 'Closed Lost' ? (
                                <LineItemViewText
                                    title={this.getFiledName('potentiallostreason').label || '---'}
                                    value={Global.getEnumLabel('Potentials', 'potentiallostreason', this.state.opportunity?.potentiallostreason || '')}
                                />
                            ) : null
                        }
                        <LineItemViewText
                            title={this.getFiledName('campaignid').label || '---'}
                            value={this.state.opportunity?.campaignname || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('probability').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'probability', this.state.opportunity?.probability) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('forecast_amount').label || '---'}
                            value={Global.formatCurrency(this.state.opportunity?.forecast_amount || 0)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('potentialresult').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'potentialresult', this.state.opportunity?.potentialresult) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('isconvertedfromlead').label}
                            value={this.state.opportunity?.isconvertedfromlead == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('rating').label || '---'}
                            value={Global.getEnumLabel('Potentials', 'rating', this.state.opportunity?.rating) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source').label}
                            value={this.state.opportunity?.source}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department').label}
                            value={this.state.opportunity?.users_department ? Global.getEnumLabel('Potentials', 'users_department', this.state.opportunity?.users_department) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdtime').label}
                            value={formatDateTime(this.state.opportunity?.createdtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdby').label}
                            value={this.state.opportunity?.createdby ? Global.getUser(this.state.opportunity?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime').label}
                            value={formatDateTime(this.state.opportunity?.modifiedtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id').label}
                            value={this.state.opportunity?.main_owner_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.opportunity?.assigned_owners ? Global.getAssignedOwnersName(this.state.opportunity?.assigned_owners) : ''}
                        />

                    </SectionView>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('opportunity.title_description_information')} />

                        <LineItemViewText
                            title={this.getFiledName('description').label}
                            value={this.state.opportunity?.description}
                        />

                    </SectionView>
                    <SpaceL />
                </TabContent>

            );
        }


    }

    renderTabRelated = () => {
        if (this.state.loadingTabRelated) {
            return (
                <TabContent>
                    <ActivityIndicator style={{ paddingVertical: 10 }} />
                </TabContent>
            )
        } else {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <Box paddingHorizontal={0}>
                            <ListItem
                                divider={false}
                                style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                title={getLabel('common.title_activity')}
                                badgeCount={this.state.counters?.activities_count ? parseInt(this.state.counters?.activities_count) : '0'}
                                onPress={() => {
                                    this.props.navigation.navigate('ActivityList', { module: 'Leads', parent: this.state.opportunity?.label, isFromDetailView: true, activityList: this.state.opportunity?.activities_list })
                                }}
                                iconRight={'plus'}
                                onPressIconRight={() => {
                                    this.menuActivity.show()
                                }}
                            />
                            <Menu
                                ref={menuActivity => this.menuActivity = menuActivity}
                                style={{ left: undefined, right: 18 }}
                                button={
                                    <></>
                                }
                            >
                                <MenuItem
                                    onPress={() => {
                                        let activityTmpCall = {
                                            activitytype: 'Call',
                                            parent_id: this.state.opportunity?.id,
                                            parent_name: this.state.opportunity?.label,
                                            parent_type: 'Potentials'
                                        }
                                        this.props.navigation.navigate('ActivityForm', { activity: activityTmpCall });
                                        this.menuActivity.hide();
                                    }}
                                >
                                    <Icon name={getIconModule('Call')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_call')}</NText>
                                </MenuItem>
                                <MenuItem
                                    onPress={() => {
                                        let activityTmpMeeting = {
                                            activitytype: 'Meeting',
                                            parent_id: this.state.opportunity?.id,
                                            parent_name: this.state.opportunity?.label,
                                            parent_type: 'Potentials'
                                        }
                                        this.props.navigation.navigate('ActivityForm', { activity: activityTmpMeeting });
                                        this.menuActivity.hide();
                                    }}
                                >
                                    <Icon name={getIconModule('Meeting')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_meeting')}</NText>
                                </MenuItem>
                                <MenuItem
                                    onPress={() => {
                                        let activityTmpTask = {
                                            activitytype: 'Task',
                                            parent_id: this.state.opportunity?.id,
                                            parent_name: this.state.opportunity?.label,
                                            parent_type: 'Potentials'
                                        }
                                        this.props.navigation.navigate('ActivityForm', { activity: activityTmpTask });
                                        this.menuActivity.hide();
                                    }}
                                >
                                    <Icon name={getIconModule('Task')} />
                                    <SpaceHM />
                                    <NText allowFontScaling={true} >{getLabel('common.title_event_task')}</NText>
                                </MenuItem>
                            </Menu>
                        </Box>

                    </SectionView>
                </TabContent>
            );
        }
    }

    render() {
        const { navigation, showAlert } = this.props;
        const { opportunity } = this.state;

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

        return (
            <>
                <View style={styles.fill}>

                    <Animated.ScrollView
                        ref={(mainScroll) => this.mainScroll = mainScroll}
                        style={styles.fill}
                        scrollEventThrottle={1}
                        keyboardShouldPersistTaps='always'
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
                                // <Content
                                //     style={styles.fill}
                                //     scrollEnabled={true}
                                //     disableKBDismissScroll={false}
                                //     keyboardShouldPersistTaps='always'

                                // >
                                <KeyboardAwareScrollView
                                    style={styles.fill}
                                    enabled={true}
                                    keyboardVerticalOffset={40}
                                    keyboardDismissMode='interactive'
                                    keyboardShouldPersistTaps='always'
                                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                                >
                                    <View style={{ marginTop: Platform.OS == 'ios' ? 0 : HEADER_MAX_HEIGHT }}>
                                        {this.state.tabSelected === 0 && this.renderTabOverView()}
                                        {this.state.tabSelected === 1 && this.renderTabDetail()}
                                        {this.state.tabSelected === 2 && this.renderTabRelated()}
                                    </View>
                                </KeyboardAwareScrollView>
                            )
                                : null
                        }
                    </Animated.ScrollView>
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
                                width={widthResponse * 0.2 < 90 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 90 ? 12 : 12,
                                }}
                                disabled={!Global.getPermissionModule('Potentials', 'EditView')}
                                icon={getIcon('Convert')}
                                label={getLabel('opportunity.btn_change_stage')}
                                onPress={() => this.changeStage()}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                disabled={!Global.getPermissionModule('Potentials', 'EditView')}
                                icon={getIcon('Edit')}
                                label={getLabel('common.btn_edit')}
                                onPress={() => {
                                    const params = {
                                        opportunity: opportunity,
                                        prevScene: 'OpportunityView',
                                        indexSelected: this.props.route?.params?.indexSelected,
                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                    }
                                    navigation.replace('OpportunityForm', { ...params })
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                disabled={!Global.getPermissionModule('Potentials', 'CreateView')}
                                icon={getIcon('Duplicate')}
                                label={getLabel('common.btn_duplicate')}
                                onPress={() => {
                                    const params = {
                                        opportunity: opportunity,
                                        isDuplicate: true,
                                        prevScene: 'OpportunityView',
                                        indexSelected: this.props.route?.params?.indexSelected,
                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                    }
                                    navigation.replace('OpportunityForm', { ...params })
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(opportunity?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(opportunity?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => this.toggleFavorite()}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 20,
                                }}
                                disabled={!Global.getPermissionModule('Potentials', 'Delete')}
                                icon={getIcon('Delete')}
                                label={getLabel('common.btn_delete')}
                                color={Colors.functional.dangerous}
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
                                                    Global.deleteRecord('Potentials', this.state.opportunity?.id, data => {
                                                        this.setState({ loading: false })
                                                        Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('opportunity.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                        Global.updateCounters();
                                                        this.props.route?.params?.onDeleteItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1);
                                                        navigation.navigate('OpportunityList');
                                                    },
                                                        error => {
                                                            Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('opportunity.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
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
                        <View style={{ maxHeight: 70, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <SegmentedControl
                                tabs={[...this.state.tabsOption]}
                                onChange={(index) => this.handleTabsChange(index)}
                                currentIndex={this.state.tabSelected}
                                paddingVertical={10}
                                activeTextColor={Colors.black.black1}
                                textColor={Colors.black.black2}
                                segmentedControlBackgroundColor={'#f0f0f0'} s
                            />

                        </View>
                    </Animated.View>

                    {/* Fix header */}
                    <Animated.View
                        style={[
                            styles.bar,
                        ]}
                    >
                        <LargeHeader>
                            <Header noBorder>
                                <Left>
                                    <SpaceHM />
                                    <Icon
                                        name={getIconModule('Potentials')}
                                        style={{ fontSize: 18 }}
                                    />
                                    <SpaceHS />
                                    <LBText allowFontScaling={true} numberOfLines={2} >{opportunity?.potentialname}</LBText>
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
                            <Header noBorder style={{ minHeight: 36 }}>
                                <Left>
                                    <SpaceHM />
                                    <SText allowFontScaling={true} >Tags:</SText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {
                                            opportunity?.tags?.length > 0 && opportunity?.tags.map((item, index) => {
                                                return (
                                                    <TagOutLine
                                                        color={item.visibility == 'private' ? Colors.functional.primary : Colors.functional.successful}
                                                        label={item.tag}
                                                    />
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </Left>
                            </Header>
                        </LargeHeader>
                    </Animated.View>
                </View>
                {this.renderLostReasonModal()}
                <IndicatorLoading loading={this.state.loading} />
            </>
        )
    }
}

const mapStateToProps = () => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        displayMessageSuccess: (message) => dispatch(displayMessageSuccess(message)),
        displayMessageError: (message) => dispatch(displayMessageError(message)),
        showAlert: (message) => dispatch(showAlert(message)),
        showActionSheet: (message) => dispatch(showActionSheet(message))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OpportunityView)
