// Import libraries
import React, { Component } from 'react'
import { InteractionManager } from 'react-native'
import {
    ActivityIndicator, Animated,
    FlatList, Keyboard, Platform,
    ScrollView, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View,
    findNodeHandle, KeyboardAvoidingView, TextInput, BackHandler
} from 'react-native'
import { Image } from 'react-native-animatable'
import { replaceMentionValues } from 'react-native-controlled-mentions'
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
    ListItem, NBText, NText, Right,
    SBText, SectionView, SpaceHM, SpaceHS,
    SpaceL, SpaceS, SText, TabContent, TagOutLine
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Menu from '../../../components/MenuPopup'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { setRelatedContacts } from '../../../redux/actions/contactActions'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import {
    callHandler,
    formatDateTime,
    getIcon,
    getIconModule, getLabel, isIphoneX, sendEmailHandler, showOnMapHandler, SMSHandler, widthResponse
} from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);


export class OrganizationView extends Component {
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
            account: {},
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
            console.log('Params init: ', route.params);

            this.setState({ account: route?.params?.account }, () => {
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
            this.props.navigation.navigate('ModalOrganizationList', this.props?.route?.params?.dataRelated)
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetAccount',
            Params: {
                id: this.state.account?.accountid || this.state.account?.id,
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
                    account: data.data,
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
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }) }));
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
                module: 'Accounts',
                id: this.state.account?.id,
                starred: (parseInt(this.state.account?.starred || '0') == 0) ? 1 : 0
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
                                                    type='parent'
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
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }

    renderReplyComponent(data) {
        return (
            <Box>
                <Box
                    paddingHorizontal={'l'}
                    paddingVertical={'m'}
                    style={styles.commentContent}
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

                            Global.saveComment(this, this.state.account?.id, comment, 'reply', () => {
                                Keyboard.dismiss();
                                this.setState({
                                    commentReply: ''
                                }, () => {
                                    Global.getComments(this, this.state.account?.id, data => {
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
                        title={this.state.metaData?.field_list?.accountname?.label || '---'}
                        value={this.state.account?.accountname || ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.bill_city?.label || '---'}
                        value={this.state.account?.bill_city || ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.bill_country?.label || '---'}
                        value={this.state.account?.bill_country || ''}
                    />

                    <LineItemViewText
                        title={this.state.metaData?.field_list?.assigned_user_id?.label || '---'}
                        value={this.state.account?.assigned_user_id ? Global.getAssignedOwnersName(this.state.account.assigned_owners) : ''}
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
                                                parent_id: this.state.account?.id,
                                                parent_name: this.state.account?.label,
                                                parent_type: 'Accounts'
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
                                                parent_id: this.state.account?.id,
                                                parent_name: this.state.account?.label,
                                                parent_type: 'Accounts'
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
                                                parent_id: this.state.account?.id,
                                                parent_name: this.state.account?.label,
                                                parent_type: 'Accounts'
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
                            !this.state.account?.activities_list
                                || this.state.account?.activities_list?.length <= 0
                                || this.state.account?.activities_list?.filter((activity) => (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned'))?.length <= 0 ?
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
                            this.state.account?.activities_list?.map((activity, index) => {
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
                                        Global.getComments(this, this.state.account?.id, data => {
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
                            style={styles.commentContent} >
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
                                Global.saveComment(this, this.state.account?.id, comment, 'post', () => {
                                    Keyboard.dismiss();
                                    this.setState({
                                        comment: '',
                                        attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.account?.id, data => {
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
                                <Box paddingLeft={'xl'} paddingVertical={'m'} key={index}>
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
                            renderItem={({ item, index }) =>
                                <>
                                    <TouchableWithoutFeedback
                                        onPress={() => Keyboard.dismiss()}
                                    >
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
                            keyExtractor={(item, index) => index.toString()}
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
                            title={this.getFiledName('accountname').label}
                            value={this.state.account?.accountname}
                        />
                        <LineItemViewText
                            title={this.getFiledName('account_no').label}
                            value={this.state.account?.account_no}
                        />
                        <LineItemViewText
                            title={this.getFiledName('website').label}
                            value={this.state.account?.website}
                        />
                        <LineItemViewText
                            title={this.getFiledName('tickersymbol').label}
                            value={this.state.account?.tickersymbol}
                        />
                        <LineItemViewText
                            title={this.getFiledName('account_id').label}
                            value={this.state.account?.account_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('phone').label}
                            value={this.state.account?.phone}
                            handleOnPress={() => callHandler([this.state.account?.phone], this.state.account.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherphone').label}
                            value={this.state.account?.otherphone}
                            handleOnPress={() => callHandler([this.state.account?.otherphone], this.state.account.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('fax').label}
                            value={this.state.account?.fax}
                        />
                        <LineItemViewText
                            title={this.getFiledName('email1').label}
                            value={this.state.account?.email1}
                        />
                        <LineItemViewText
                            title={this.getFiledName('email2').label}
                            value={this.state.account?.email2}
                        />
                        <LineItemViewText
                            title={this.getFiledName('accounts_company_size').label}
                            value={this.state.account?.accounts_company_size ? Global.getEnumLabel('Accounts', 'accounts_company_size', this.state.account?.accounts_company_size) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ownership').label}
                            value={this.state.account?.ownership}
                        />
                        <LineItemViewText
                            title={this.getFiledName('industry').label}
                            value={this.state.account?.industry ? Global.getEnumLabel('Accounts', 'industry', this.state.account?.industry) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('rating').label}
                            value={this.state.account?.rating ? Global.getEnumLabel('Accounts', 'rating', this.state.account?.rating) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('accounttype').label}
                            value={this.state.account?.accounttype ? Global.getEnumLabel('Accounts', 'accounttype', this.state.account?.accounttype) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('siccode').label}
                            value={this.state.account?.siccode}
                        />
                        <LineItemViewText
                            title={this.getFiledName('annual_revenue').label}
                            value={Global.formatCurrency(this.state.account?.annual_revenue || 0)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('emailoptout').label}
                            value={this.state.account?.emailoptout == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('notify_owner').label}
                            value={this.state.account?.notify_owner == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('isconvertedfromlead').label}
                            value={this.state.account?.isconvertedfromlead == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source').label}
                            value={this.state.account?.source}
                        />
                        <LineItemViewText
                            title={this.getFiledName('related_campaign').label}
                            value={this.state.account?.related_campaign_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department').label}
                            value={this.state.account?.users_department ? Global.getEnumLabel('Accounts', 'users_department', this.state.account?.users_department) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdtime').label}
                            value={formatDateTime(this.state.account?.createdtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdby').label}
                            value={this.state.account?.createdby ? Global.getUser(this.state.account?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime').label}
                            value={formatDateTime(this.state.account?.modifiedtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id').label}
                            value={this.state.account?.main_owner_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.account?.assigned_owners ? Global.getAssignedOwnersName(this.state.account?.assigned_owners) : ''}
                        />
                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('account.title_address_information')} />

                        <LineItemViewText
                            title={this.getFiledName('bill_street').label}
                            value={this.state.account?.bill_street}
                            handleOnPress={() => this.state.account?.bill_street && showOnMapHandler(this.state.account?.bill_street || '', this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('bill_city').label}
                            value={this.state.account?.bill_city}
                        />
                        <LineItemViewText
                            title={this.getFiledName('bill_state').label}
                            value={this.state.account?.bill_state}
                        />
                        <LineItemViewText
                            title={this.getFiledName('bill_country').label}
                            value={this.state.account?.bill_country}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ship_street').label}
                            value={this.state.account?.ship_street}
                            handleOnPress={() => this.state.account?.ship_street && showOnMapHandler(this.state.account?.ship_street || '', this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ship_city').label}
                            value={this.state.account?.ship_city}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ship_state').label}
                            value={this.state.account?.ship_state}
                        />
                        <LineItemViewText
                            title={this.getFiledName('ship_country').label}
                            value={this.state.account?.ship_country}
                        />
                    </SectionView>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('account.title_description_information')} />

                        <LineItemViewText
                            title={this.getFiledName('description').label}
                            value={this.state.account?.description}
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
                                    this.props.navigation.navigate('ActivityList', { module: 'Accounts', parent: this.state.account?.label, isFromDetailView: true, activityList: this.state.account?.activities_list })
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
                                            related_account: this.state.account?.id,
                                            related_account_name: this.state.account?.label
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
                                            related_account: this.state.account?.id,
                                            related_account_name: this.state.account?.label
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
                                            related_account: this.state.account?.id,
                                            related_account_name: this.state.account?.label
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

                    {
                        Global.getPermissionModule('Contacts', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_contacts')}
                                            badgeCount={this.state.counters?.contacts_count ? parseInt(this.state.counters?.contacts_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalContactList', { module: 'Accounts', parent: this.state.account?.label, isFromDetailView: true, contactList: this.state.account?.contacts_list })
                                            }}
                                            iconRight={Global.getPermissionModule('Contacts', 'CreateView') ? 'plus' : null}
                                            onPressIconRight={() => {
                                                let tmpContact = {
                                                    account_id: this.state.account.id,
                                                    account_name: this.state.account.accountname
                                                }
                                                this.props.navigation.navigate('ContactForm', { contact: tmpContact });
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        )
                            : null
                    }

                    {
                        Global.getPermissionModule('Potentials', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_opportunities')}
                                            badgeCount={this.state.counters?.opportunities_count ? parseInt(this.state.counters?.opportunities_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalOpportunityList', { module: 'Accounts', parent: this.state.account?.label, isFromDetailView: true, opportunityList: this.state.account?.opportunities_list })
                                            }}
                                            iconRight={Global.getPermissionModule('Potentials', 'CreateView') ? 'plus' : null}
                                            onPressIconRight={() => {
                                                let tmpOpportunity = {
                                                    related_to: this.state.account.id,
                                                    related_to_name: this.state.account.accountname,
                                                    probability: 0
                                                }
                                                this.props.navigation.navigate('OpportunityForm', { opportunity: tmpOpportunity });
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        ) : null
                    }
                    {
                        Global.getPermissionModule('HelpDesk', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_tickets')}
                                            badgeCount={this.state.counters?.tickets_count ? parseInt(this.state.counters?.tickets_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalTicketList', { module: 'Accounts', parent: this.state.account?.label, isFromDetailView: true, ticketList: this.state.account?.tickets_list })
                                            }}
                                            iconRight={Global.getPermissionModule('HelpDesk', 'CreateView') ? 'plus' : null}
                                            onPressIconRight={() => {
                                                let tmpTicket = {
                                                    parent_id: this.state.account.id,
                                                    parent_name: this.state.account.accountname
                                                }
                                                this.props.navigation.navigate(Global.getTicketFormLabel(), { ticket: tmpTicket });
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        ) : null
                    }

                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <Box>
                            <ListItem
                                divider={false}
                                style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                title={getLabel('common.title_related_document')}
                                badgeCount={this.state.counters?.documents_count ? parseInt(this.state.counters?.documents_count) : '0'}
                                onPress={() => {
                                    this.props.navigation.navigate('ModalDocumentList', { module: 'Accounts', parent: this.state.account?.label, isFromDetailView: true, documentList: this.state.account?.documents_list })
                                }}
                                noArrowRight
                            />
                        </Box>
                    </SectionView>

                    <SpaceS />
                </TabContent>
            );
        }
    }

    render() {
        const { navigation, showAlert } = this.props;
        const { account } = this.state;
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
                            this.state.isReady ?
                                (
                                    <KeyboardAwareScrollView
                                        style={styles.fill}
                                        enabled={true}
                                        keyboardVerticalOffset={40}
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
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={'phone-alt'}
                                label={getLabel('common.btn_call')}
                                onPress={() => {
                                    let phones = [];

                                    if (account?.phone) {
                                        phones.push(account?.phone)
                                    }

                                    if (account?.otherphone) {
                                        phones.push(account?.otherphone)
                                    }

                                    callHandler(phones, account?.id, this.props.dispatch)
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={'sms'}
                                label={getLabel('common.btn_sms')}
                                onPress={() => {
                                    let phones = [];

                                    if (account?.phone) {
                                        phones.push(account?.phone)
                                    }

                                    if (account?.otherphone) {
                                        phones.push(account?.otherphone)
                                    }

                                    SMSHandler(phones, this.props.dispatch)
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={'location-arrow'}
                                label={getLabel('common.btn_location')}
                                onPress={() => {
                                    showOnMapHandler(account?.bill_street || '', this.props.dispatch)
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(account?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(account?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => {
                                    this.toggleFavorite()
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={'ellipsis-h-alt'}
                                label={getLabel('common.btn_more')}
                                onPress={() => {
                                    this.moreMenu.show();
                                }}
                            >
                                <Menu
                                    ref={(moreMenu) => this.moreMenu = moreMenu}
                                    animationDuration={0}
                                    style={{ right: 20, left: undefined, marginTop: -28 }}
                                >
                                    {
                                        Global.getPermissionModule('Accounts', 'EditView') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
                                                    const params = {
                                                        account: account,
                                                        prevScene: 'OrganizationView',
                                                        indexSelected: this.props.route?.params?.indexSelected,
                                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                                    }
                                                    navigation.replace('OrganizationForm', { ...params });
                                                }}
                                            >
                                                <Icon name={getIcon('Edit')} />
                                                <SpaceHM />
                                                <NText allowFontScaling={true} >{getLabel('common.label_menu_edit')}</NText>
                                            </MenuItem>
                                        ) : null
                                    }

                                    <MenuItem
                                        onPress={() => {
                                            let emails = [];

                                            if (account?.email1) {
                                                emails.push(account?.email1)
                                            }
                                            if (account?.email2) {
                                                emails.push(account?.email2)
                                            }

                                            this.moreMenu.hide();
                                            sendEmailHandler(emails, this.props.dispatch, this.props?.navigation);
                                        }}
                                    >
                                        <Icon name={getIcon('Mail')} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_send_email')}</NText>
                                    </MenuItem>

                                    {
                                        Global.getPermissionModule('Accounts', 'CreateView') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
                                                    const params = {
                                                        account: account,
                                                        isDuplicate: true,
                                                        prevScene: 'OrganizationView',
                                                        indexSelected: this.props.route?.params?.indexSelected,
                                                        onUpdateItemSelected: this.props.route?.params?.onUpdateItemSelected,
                                                        onDeleteItemSelected: this.props.route?.params?.onDeleteItemSelected
                                                    }
                                                    navigation.replace('OrganizationForm', { ...params });
                                                }}
                                            >
                                                <Icon name={getIcon('Duplicate')} />
                                                <SpaceHM />
                                                <NText allowFontScaling={true} >{getLabel('common.label_menu_duplicate')}</NText>
                                            </MenuItem>
                                        ) : null
                                    }

                                    {/* <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name={getIcon('Zalo')} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_send_zalo')}</NText>
                                    </MenuItem> */}
                                    {
                                        Global.getPermissionModule('Accounts', 'Delete') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
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
                                                                    Global.deleteRecord('Accounts', account?.id, data => {
                                                                        this.setState({ loading: false })
                                                                        Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                                        Global.updateCounters();
                                                                        this.props.route?.params?.onDeleteItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1);
                                                                        navigation.navigate('OrganizationList');
                                                                    },
                                                                        error => {
                                                                            Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                                            this.setState({ loading: false })
                                                                        })
                                                                }
                                                            }
                                                        ]
                                                    }
                                                    showAlert?.(params)

                                                }}
                                            >
                                                <Icon name={getIcon('Delete')} color={Colors.functional.dangerous} />
                                                <SpaceHM />
                                                <NText allowFontScaling={true} color={Colors.functional.dangerous}>{getLabel('common.label_menu_delete')}</NText>
                                            </MenuItem>
                                        ) : null
                                    }

                                </Menu>

                            </QuickActionHeader>
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
                                <Left style={{ minWidth: '70%' }}>
                                    <SpaceHM />
                                    <Icon name={getIconModule('Accounts')} style={{ fontSize: 18 }} />
                                    <SpaceHS />
                                    <LBText allowFontScaling={true} numberOfLines={2}>
                                        {account?.accountname}
                                    </LBText>
                                </Left>
                                <Right style={{ minWidth: '30%' }}>
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
                                            account?.tags?.length > 0 && account?.tags.map((item, index) => {
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

const mapStateToProps = () => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
        setRelatedContacts: (list) => dispatch(setRelatedContacts(list)),
        dispatch,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationView)
