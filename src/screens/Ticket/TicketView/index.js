// Import libraries
import React, { Component } from 'react'
import {
    ActivityIndicator, Animated, findNodeHandle, FlatList, Keyboard, KeyboardAvoidingView, Platform, RefreshControl,
    ScrollView, TextInput, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View, BackHandler, DeviceEventEmitter
} from 'react-native'
import { Image } from 'react-native-animatable'
import { MenuItem } from 'react-native-material-menu'
import Toast from 'react-native-root-toast'
import TimeAgo from 'react-native-timeago'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import OcticonsIcon from 'react-native-vector-icons/dist/Octicons'
import { connect } from 'react-redux'
import DocumentPicker from 'react-native-document-picker';
// Import components
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView'
import {
    Divider, Header, LargeHeader, LBText, Left, ListItem, NBText, NText, Right,
    SectionView, SpaceHM, SpaceHS, SpaceL, SpaceS, SText, TabContent, TagOutLine, SBText
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Menu from '../../../components/MenuPopup'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { getIcon, getIconModule, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import styles from './styles'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import { showAlert } from '../../../redux/actions/alert'
import { replaceMentionValues } from 'react-native-controlled-mentions';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CommentView from '../../../components/CommentView';
import CommentInput from '../../../components/CommentInput'
import { Content } from 'native-base'
import { InteractionManager } from 'react-native'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);

export class TicketView extends Component {

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
            ticket: {},
            metaData: {},
            isReady: false,
            loading: false,
            counters: null,
            commentList: [],
            comment: '',
            commentReply: '',
            attachment: [],
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
            this.setState({ ticket: route?.params?.ticket }, () => {
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
            this.props?.navigation.replace('ModalTicketList', this.props?.route?.params?.dataRelated)
        }
        if (this.props?.route?.params?.prevScene == 'HomeScreen') {
            DeviceEventEmitter.emit('HomeScreen.ReloadTicketOpen');
            this.props?.navigation.goBack()
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetTicket',
            Params: {
                id: this.state.ticket?.ticketid || this.state.ticket?.id,
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
                    ticket: data.data,
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
                Toast.show(getLabel('common.msg_module_not_exits_error', { module: getLabel('common.title_tickets') }));
            }
        },
            error => {
                Toast.show(getLabel('common.msg_connection_error'));
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
                module: 'HelpDesk',
                id: this.state.ticket?.id,
                starred: (parseInt(this.state.ticket?.starred || '0') == 0) ? 1 : 0
            }
        };

        console.log('LOG.parames: ', params);


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
            if (!this.state.tabsOption[index].isLoaded) {
                this.state.tabsOption[index].isLoaded = true;
            }
        });
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

    renderCommentChild(data, numberOfCommentShow) {
        return (
            <FlatList
                data={data}
                keyboardShouldPersistTaps='always'
                extraData={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    if (index < numberOfCommentShow) {
                        return (
                            <>
                                <Box flexDirection='row' paddingVertical={'m'} style={{ paddingRight: 22 }}>
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
                            Global.saveComment(this, this.state.ticket?.id, comment, 'reply', () => {
                                this.setState({
                                    comment: ''
                                }, () => {
                                    Global.getComments(this, this.state.ticket?.id, data => {
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
                        title={this.state.metaData?.field_list?.ticket_title?.label || '---'}
                        value={this.state.ticket?.ticket_title || ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.parent_id?.label || '---'}
                        value={this.state.ticket?.parent_name || ''}
                        handleOnPress={() => this.state.ticket?.parent_name && this.props.navigation.navigate('OrganizationView', { account: { id: this.state.ticket.parent_id }, prevScene: Global.getTicketViewLabel() })}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.contact_id?.label || '---'}
                        value={this.state.ticket?.contact_name || ''}
                        handleOnPress={() => this.state.ticket?.contact_name && this.props.navigation.navigate('ContactView', { contact: { id: this.state.ticket.contact_id }, prevScene: Global.getTicketViewLabel() })}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.assigned_user_id?.label || '---'}
                        value={this.state.ticket?.assigned_user_id ? Global.getAssignedOwnersName(this.state.ticket.assigned_owners) : ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.ticketstatus?.label || '---'}
                        value={Global.getEnumLabel( 'HelpDesk', 'ticketstatus', this.state.ticket?.ticketstatus || '') }
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.ticket_no?.label || '---'}
                        value={this.state.ticket?.ticket_no || ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.description?.label || '---'}
                        value={this.state.ticket?.description || ''}
                    />

                </SectionView>

                <SpaceS />
                <SectionView
                    noPaddingHorizontal
                >
                    <Box
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        paddingHorizontal={'l'}
                        paddingVertical={'m'}
                        flexDirection='row'
                    >
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
                                                parent_id: this.state.ticket?.id,
                                                parent_name: this.state.ticket?.label,
                                                parent_type: 'HelpDesk'
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
                                                parent_id: this.state.ticket?.id,
                                                parent_name: this.state.ticket?.label,
                                                parent_type: 'HelpDesk'
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
                                                parent_id: this.state.ticket?.id,
                                                parent_name: this.state.ticket?.label,
                                                parent_type: 'HelpDesk'
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

                    <Box
                        paddingHorizontal={'z'}
                    >
                        <Divider />
                    </Box>

                    <SpaceS />
                    <ScrollView style={{ maxHeight: 188, minHeight: 45 }}>
                        {
                            !this.state.ticket?.activities_list
                                || this.state.ticket?.activities_list?.length <= 0
                                || this.state.ticket?.activities_list?.filter((activity) => (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned'))?.length <= 0 ?
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
                            this.state.ticket?.activities_list?.map((activity, index) => {
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
                    <Box
                        justifyContent={'center'}
                        paddingHorizontal={'l'}
                        paddingVertical={'m'}
                    >
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
                                        Global.getComments(this, this.state.ticket?.id, data => {
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
                    <Box
                        paddingHorizontal={'l'}
                        paddingVertical={'m'}
                    >
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
                    <Box justifyContent={'space-between'} flexDirection='row' paddingHorizontal={'l'} paddingVertical={'m'}>
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
                                Global.saveComment(this, this.state.ticket?.id, comment, 'post', () => {
                                    this.setState({
                                        comment: '',
                                        attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.ticket?.id, data => {
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

    getLabelRating = (number: number) => {
        switch (number) {
            case 1:
                return <Text allowFontScaling={true} >★<Text allowFontScaling={true} color='black1'>★★★★</Text></Text>;
            case 2:
                return <Text allowFontScaling={true} >★★<Text allowFontScaling={true} color='black1'>★★★</Text></Text>;
            case 3:
                return <Text allowFontScaling={true} >★★★<Text allowFontScaling={true} color='black1'>★★</Text></Text>;
            case 4:
                return <Text allowFontScaling={true} >★★★★<Text allowFontScaling={true} color='black1'>★</Text></Text>;
            case 5:
                return <Text allowFontScaling={true} >★★★★★</Text>;

            default:
                return '';
        }
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

                        <HeaderSectionView title={getLabel('ticket.title_ticket_information')} />

                        <LineItemViewText
                            title={this.getFiledName('ticket_title')?.label}
                            value={this.state.ticket?.ticket_title || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('parent_id')?.label}
                            value={this.state.ticket?.parent_name || ''}
                            handleOnPress={() => this.state.ticket?.parent_name && this.props.navigation.navigate('OrganizationView', { account: { id: this.state.ticket.parent_id }, prevScene: Global.getTicketViewLabel() })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contact_id')?.label}
                            value={this.state.ticket?.contact_name || ''}
                            handleOnPress={() => this.state.ticket?.contact_name && this.props.navigation.navigate('ContactView', { contact: { id: this.state.ticket.contact_id }, prevScene: Global.getTicketViewLabel() })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.ticket?.assigned_owners ? Global.getAssignedOwnersName(this.state.ticket?.assigned_owners) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('product_id')?.label}
                            value={this.state.ticket?.product_name || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('service_id')?.label}
                            value={this.state.ticket?.service_id || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ticketpriorities')?.label}
                            value={this.state.ticket?.ticketpriorities ? this.getEnumLabel('ticketpriorities', this.state.ticket?.ticketpriorities) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ticketstatus')?.label}
                            value={this.state.ticket?.ticketstatus ? this.getEnumLabel('ticketstatus', this.state.ticket?.ticketstatus) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('hours')?.label}
                            value={this.state.ticket?.hours ? Global.formatNumber(this.state.ticket?.hours) : ''}
                        />

                        <LineItemViewText
                            title={this.getFiledName('ticketcategories')?.label}
                            value={this.state.ticket?.ticketcategories || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('days')?.label}
                            value={this.state.ticket?.days ? Global.formatNumber(this.state.ticket?.days) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ticket_no')?.label}
                            value={this.state.ticket?.ticket_no || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime')?.label}
                            value={this.state.ticket?.modifiedtime || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source')?.label}
                            value={this.state.ticket?.source || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdtime')?.label}
                            value={this.state.ticket?.createdtime || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdby')?.label}
                            value={this.state.ticket?.createdby ? Global.getUser(this.state.ticket?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id')?.label}
                            value={this.state.ticket?.main_owner_name || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('helpdesk_rating')?.label}
                            value={(this.state.ticket?.helpdesk_rating ? this.getLabelRating(parseInt(this.state.ticket.helpdesk_rating)) : '')}
                            textStyle={{
                                color: Colors.brand.brand2
                            }}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department')?.label}
                            value={this.state.ticket?.users_department ? this.getEnumLabel('users_department', this.state.ticket?.users_department) : ''}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('ticket.title_description_information')} />
                        <LineItemViewText
                            title={this.getFiledName('description')?.label}
                            value={this.state.ticket?.description || ''}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('ticket.title_resolution_information')} />
                        <LineItemViewText
                            title={this.getFiledName('solution')?.label}
                            value={this.state.ticket?.solution || ''}
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
                        <ListItem
                            divider={false}
                            style={{ paddingRight: 12 }}
                            title={getLabel('common.title_activity')}
                            badgeCount={this.state.counters?.activities_count ? parseInt(this.state.counters?.activities_count) : '0'}
                            onPress={() => {
                                this.props.navigation.navigate('ActivityList', { module: 'Leads', parent: this.state.ticket?.label, isFromDetailView: true, activityList: this.state.ticket?.activities_list })
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
                                        parent_id: this.state.ticket?.id,
                                        parent_name: this.state.ticket?.label,
                                        parent_type: 'HelpDesk'
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
                                        parent_id: this.state.ticket?.id,
                                        parent_name: this.state.ticket?.label,
                                        parent_type: 'HelpDesk'
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
                                        parent_id: this.state.ticket?.id,
                                        parent_name: this.state.ticket?.label,
                                        parent_type: 'HelpDesk'
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
                    </SectionView>
                </TabContent>
            );
        }
    }

    render() {
        const { navigation, showAlert } = this.props;

        const scrollY = Animated.add(
            this.state.scrollY,
            Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
        );
        const headerTranslate = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -HEADER_SCROLL_DISTANCE],
            extrapolate: 'clamp',
        });

        const { ticket, interactionsComplete } = this.state;
        if (!interactionsComplete) {
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
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true });
                                    setTimeout(() => this.setState({ refreshing: false }), 1000);
                                }}
                                // Android offset for RefreshControl
                                progressViewOffset={HEADER_MAX_HEIGHT}
                            />
                        }
                        // iOS offset for RefreshControl
                        contentInset={{
                            top: HEADER_MAX_HEIGHT,
                        }}
                        contentOffset={{
                            y: -HEADER_MAX_HEIGHT,
                        }}
                    >
                        <KeyboardAwareScrollView
                            style={styles.fill}
                            enabled={true}
                            keyboardVerticalOffset={40}
                            keyboardShouldPersistTaps='always'
                            behavior={Platform.OS == "ios" ? "padding" : "height"}
                        >
                            {
                                this.state.isReady ?
                                    (
                                        <View style={{ marginTop: Platform.OS == 'ios' ? 0 : HEADER_MAX_HEIGHT }}>
                                            {this.state.tabSelected === 0 && this.renderTabOverView()}
                                            {this.state.tabSelected === 1 && this.renderTabDetail()}
                                            {this.state.tabSelected === 2 && this.renderTabRelated()}
                                        </View>
                                    )
                                    : null
                            }
                        </KeyboardAwareScrollView>
                    </Animated.ScrollView>
                    {/* Header Scroll */}
                    <Animated.View

                        style={[
                            styles.header,
                            { transform: [{ translateY: headerTranslate }] },
                        ]}
                    >
                        <View style={{ flex: 1 }} />
                        <View style={{ minHeight: 90, flexDirection: 'row', width: widthResponse }}>
                            <QuickActionHeader
                                width={widthResponse * 0.25}
                                contentStyle={{
                                    alignItems: 'center'
                                }}
                                disabled={!Global.getPermissionModule('HelpDesk', 'EditView')}
                                icon={getIcon('Edit')}
                                label={getLabel('common.label_menu_edit')}
                                onPress={() => {
                                    navigation.replace(Global.getTicketFormLabel(), {
                                        ticket: ticket,
                                        prevScene: Global.getTicketViewLabel(),
                                        indexSelected: this.props.route?.params?.indexSelected,
                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                    });
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.25}
                                contentStyle={{
                                    alignItems: 'center'
                                }}
                                icon={getIcon('Duplicate')}
                                disabled={!Global.getPermissionModule('HelpDesk', 'CreateView')}
                                label={getLabel('common.label_menu_duplicate')}
                                onPress={() => {
                                    const params = {
                                        ticket: ticket,
                                        isDuplicate: true,
                                        prevScene: Global.getTicketViewLabel(),
                                        indexSelected: this.props.route?.params?.indexSelected,
                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                    }
                                    navigation.replace(Global.getTicketFormLabel(), { ...params })

                                    
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.25}
                                contentStyle={{
                                    alignItems: 'center'
                                }}

                                iconElement={<AntDesignIcon name={(parseInt(ticket?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(ticket?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => {
                                    this.toggleFavorite()
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.25}
                                contentStyle={{
                                    alignItems: 'center'
                                }}
                                disabled={!Global.getPermissionModule('HelpDesk', 'Delete')}
                                icon={getIcon('Delete')}
                                label={getLabel('common.label_menu_delete')}
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
                                                    Global.deleteRecord('HelpDesk', this.state.ticket?.id, data => {
                                                        this.setState({ loading: false })
                                                        Toast.show(getLabel('common.msg_delete_success', { module: getLabel('ticket.title').toLowerCase() }));
                                                        Global.updateCounters();
                                                        this.props.route?.params?.onDeleteItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1);
                                                        navigation.navigate('TicketList');
                                                    },
                                                        error => {
                                                            Toast.show(getLabel('common.msg_delete_error', { module: getLabel('ticket.title').toLowerCase() }));
                                                            this.setState({ loading: false })
                                                        })
                                                }
                                            }
                                        ]
                                    }
                                    showAlert?.(params)

                                }}
                            />

                        </View>
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
                                <Left style={{ minWidth: '70%' }}>
                                    <SpaceHM />
                                    <Icon name={getIconModule('HelpDesk')} style={{ fontSize: 18 }} />
                                    <SpaceHS />
                                    <Box flex={1}>
                                        <LBText
                                            allowFontScaling={true}
                                            numberOfLines={2}
                                        >
                                            {ticket?.label || this.props.route?.params?.ticket?.title || ''}
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
                            <Header noBorder style={{ minHeight: 36 }}>
                                <Left>
                                    <SpaceHM />
                                    <SText allowFontScaling={true} >Tags:</SText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {
                                            ticket?.tags?.length > 0 && ticket?.tags.map((item, index) => {
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
                <IndicatorLoading loading={this.state.loading} />
            </>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketView)
