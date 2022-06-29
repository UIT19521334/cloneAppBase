// Import libraries
import Moment from 'moment'
import React, { Component } from 'react'
import { ActivityIndicator, Animated, BackHandler, FlatList, InteractionManager, Keyboard, Platform, ScrollView, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
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
    Divider, Header, LargeHeader, LBText, Left, ListItem, NBText, NText,
    Right, SBText, SectionView, SpaceHM, SpaceHS, SpaceL, SpaceS, SText,
    TabContent, TagOutLine
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Menu from '../../../components/MenuPopup'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { setLeads } from '../../../redux/actions/leadAction'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { callHandler, formatDateTime, getIcon, getIconModule, getLabel, isIphoneX, sendEmailHandler, showOnMapHandler, SMSHandler, widthResponse } from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import { PARAMS_ALERT } from '../../../utils/Models/models'
import { deleteItemDetailToList, updateItemDetailToList } from '../Shared'
import styles from './styles'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);

export class LeadView extends Component {

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
            lead: {},
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
            this.setState({ lead: route?.params?.lead }, () => {
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
            this.props.navigation.navigate('ModalLeadList', this.props?.route?.params?.dataRelated)
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetLead',
            Params: {
                id: this.state.lead?.leadid || this.state.lead?.id,
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
                    lead: data.data,
                    metaData: data.metadata,
                    counters: data.data.counters,
                    commentList: Global.sortCommentList(data.data?.modcomments_list || [])?.reverse()
                }, () => {
                    this.setState({ isReady: true });
                    // Cập nhật thông tin lead được chọn trong màn hình List View related
                    // Ví dụ: Màn hình danh sách Lead được mở từ Tab related của màn hình Detail của Contact
                    // Sau đó chọn 1 lead bất kỳ và mở lên màn hình LeadView
                    // Tiếp theo thay đổi bất kỳ thông tin nào của lead liên quan đến các field được hiển thị ở màn hình list
                    // ==> Thì thông tin thay đổi sẽ được cập nhật lại ở màn hình list khi nhấn back về sẽ ko cần phải reload lại.
                    if (this.props?.route?.params?.isViewDetailRelated) {
                        const resListRelatedLead = updateItemDetailToList('LEADS',
                            data.data,
                            this.props.route?.params?.dataRelated?.leadList || [], this.props.route?.params?.indexSelected
                        );
                        this.props.route?.params?.updateChange?.(resListRelatedLead);
                    }
                    // cập nhật thông tin lead được chọn trong màn hình List View
                    // LeadList -> LedView: if user has Change value -> Update lead selected from LeadView to LeadList
                    else if (this.props.route?.params?.prevScene == 'LeadList') {
                        const resListLead = updateItemDetailToList('LEADS', data.data, this.props.leadState.leads, this.props.leadState.indexSelected)
                        this.props.dispatch(setLeads(resListLead))
                    }
                });


            }
            else {
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('lead.title', { locale: Global.locale || "vn_vn" }) }));
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
                module: 'Leads',
                id: this.state.lead?.id,
                starred: (parseInt(this.state.lead?.starred || '0') == 0) ? 1 : 0
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
                            //     }, 500)
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
                                                    time={Moment(item.createdtime)}
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
                            Global.saveComment(this, this.state.lead?.id, comment, 'reply', () => {
                                this.setState({
                                    commentReply: ''
                                }, () => {
                                    Global.getComments(this, this.state.lead?.id, data => {
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
                        title={this.state.metaData?.field_list?.full_name?.label || '---'}
                        value={this.state.lead?.label || ''}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.company?.label || '---'}
                        value={this.state.lead?.company || ''}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.mobile?.label || '---'}
                        value={this.state.lead?.mobile || ''}
                        handleOnPress={() => callHandler([this.state.lead?.mobile], this.state.lead.id, this.props.dispatch)}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.email?.label || '---'}
                        value={this.state.lead?.email || ''}
                        handleOnPress={() => this.state.lead?.email && sendEmailHandler([this.state.lead?.email], this.props.dispatch, this.props?.navigation)}
                    />
                    <LineItemViewText
                        title={this.state.metaData?.field_list?.assigned_user_id?.label || '---'}
                        value={this.state.lead?.assigned_user_id ? Global.getAssignedOwnersName(this.state.lead.assigned_owners) : ''}
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
                                                parent_id: this.state.lead?.id,
                                                parent_name: this.state.lead?.label,
                                                parent_type: 'Leads'
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
                                                parent_id: this.state.lead?.id,
                                                parent_name: this.state.lead?.label,
                                                parent_type: 'Leads'
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
                                                parent_id: this.state.lead?.id,
                                                parent_name: this.state.lead?.label,
                                                parent_type: 'Leads'
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
                            !this.state.lead?.activities_list
                                || this.state.lead?.activities_list?.length <= 0
                                || this.state.lead?.activities_list?.filter((activity) => (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned'))?.length <= 0 ?
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
                            this.state.lead?.activities_list?.map((activity, index) => {
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
                                    Keyboard.dismiss();
                                    this.setState({
                                        comment: '', attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.lead?.id, data => {
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
                                Global.saveComment(this, this.state.lead?.id, comment, 'post', () => {
                                    this.setState({ comment: '', attachment: [] }, () => {
                                        Global.getComments(this, this.state.lead?.id, data => {
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
                                <Box paddingLeft={'xl'} paddingVertical={'m'} key={index + item.name}>
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
                                                            time={Moment(item.createdtime)}
                                                            interval={20000}
                                                            style={{ color: Colors.black.black3 }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        paddingVertical={'m'}
                                                        flexDirection='row'
                                                        width={widthResponse - 70 - 24}
                                                    >
                                                        <CommentView
                                                            commentContent={item.commentcontent}
                                                            type='parent'
                                                        />

                                                        {/* </NText> */}
                                                    </Box>
                                                </Box>
                                                {
                                                    item?.attachments?.length > 0 && item.attachments.map((attachment, indexAttachment) => {
                                                        return (
                                                            <Box paddingVertical={'m'} key={indexAttachment}>
                                                                <TouchableOpacity
                                                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                                                    onPress={() => {

                                                                    }}
                                                                >
                                                                    <Icon name={getIcon('Close')} color={Colors.functional.primary} />
                                                                    <SpaceHS />
                                                                    <SText allowFontScaling={true} color={Colors.functional.primary}>{attachment.rawFileName}</SText>
                                                                </TouchableOpacity>
                                                            </Box>
                                                        )
                                                    })
                                                }
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

                        <HeaderSectionView title={getLabel('lead.title_lead_information')} />

                        <LineItemViewText
                            title={this.getFiledName('lastname').label}
                            value={this.state.lead?.lastname}
                        />

                        <LineItemViewText
                            title={this.getFiledName('firstname').label}
                            value={this.state.lead?.firstname}
                        />
                        <LineItemViewText
                            title={this.getFiledName('designation').label}
                            value={this.state.lead?.designation}
                        />

                        <LineItemViewText
                            title={this.getFiledName('phone').label}
                            value={this.state.lead?.phone}
                            handleOnPress={() => callHandler([this.state.lead?.phone], this.state.lead.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mobile').label}
                            value={this.state.lead?.mobile}
                            handleOnPress={() => callHandler([this.state.lead?.mobile], this.state.lead.id, this.props.dispatch)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('email').label}
                            value={this.state.lead?.email}
                            handleOnPress={() => this.state.lead?.email && sendEmailHandler([this.state.lead?.email], this.props.dispatch, this.props?.navigation)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('secondaryemail').label}
                            value={this.state.lead?.secondaryemail}
                            handleOnPress={() => this.state.lead?.secondaryemail && sendEmailHandler([this.state.lead?.secondaryemail], this.props.dispatch, this.props?.navigation)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('emailoptout').label}
                            value={this.state.lead?.emailoptout == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('related_campaign').label}
                            value={this.state.lead?.related_campaign}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department').label}
                            value={this.state.lead?.users_department ? this.getEnumLabel('users_department', this.state.lead?.users_department) : ''}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('lead.title_company_information')} />

                        <LineItemViewText
                            title={this.getFiledName('company').label}
                            value={this.state.lead?.company}
                        />
                        <LineItemViewText
                            title={this.getFiledName('industry').label}
                            value={this.state.lead?.industry ? this.getEnumLabel('industry', this.state.lead?.industry) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('annualrevenue').label}
                            value={Global.formatCurrency(this.state.lead?.annualrevenue || '0')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('website').label}
                            value={this.state.lead?.website}
                        />
                        <LineItemViewText
                            title={this.getFiledName('fax').label}
                            value={this.state.lead?.fax}
                        />
                        <LineItemViewText
                            title={this.getFiledName('noofemployees').label}
                            value={Global.formatNumber(parseFloat(this.state.lead?.noofemployees || '0').toFixed(Global.user?.no_of_currency_decimals ? parseInt(Global.user?.no_of_currency_decimals) : '0'))}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('lead.title_converted_information')} />
                        <LineItemViewText
                            title={this.getFiledName('account_converted_id').label}
                            value={this.state.lead?.account_converted_name}
                            handleOnPress={() => this.state.lead?.account_converted_name && this.props.navigation.navigate('OrganizationView', { account: { id: this.state.lead.account_converted_id }, prevScene: 'LeadView' })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contact_converted_id').label}
                            value={this.state.lead?.contact_converted_name}
                            handleOnPress={() => this.state.lead?.contact_converted_name && this.props.navigation.navigate('ContactView', { account: { id: this.state.lead.contact_converted_id }, prevScene: 'LeadView' })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('potential_converted_id').label}
                            value={this.state.lead?.potential_converted_name}
                            handleOnPress={() => this.state.lead?.potential_converted_name && this.props.navigation.navigate('OpportunityVIew', { account: { id: this.state.lead.potential_converted_id }, prevScene: 'LeadView' })}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('lead.title_address_information')} />

                        <LineItemViewText
                            title={this.getFiledName('lane').label}
                            value={this.state.lead?.lane}
                            handleOnPress={() => this.state.lead?.lane && showOnMapHandler(this.state.lead?.lane || '', this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('pobox').label}
                            value={this.state.lead?.pobox}
                        />
                        <LineItemViewText
                            title={this.getFiledName('code').label}
                            value={this.state.lead?.code}
                        />
                        <LineItemViewText
                            title={this.getFiledName('country').label}
                            value={this.state.lead?.country}
                        />
                        <LineItemViewText
                            title={this.getFiledName('state').label}
                            value={this.state.lead?.state}
                        />
                        <LineItemViewText
                            title={this.getFiledName('city').label}
                            value={this.state.lead?.city}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('lead.title_description_information')} />

                        <LineItemViewText
                            title={this.getFiledName('leadsource').label}
                            value={this.getEnumLabel('leadsource', this.state.lead?.leadsource)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('leadstatus').label}
                            value={this.state.lead?.leadstatus ? this.getEnumLabel('leadstatus', this.state.lead?.leadstatus) : ''}
                        />

                        <LineItemViewText
                            title={this.getFiledName('rating').label}
                            value={this.state.lead?.rating ? this.getEnumLabel('rating', this.state.lead?.rating) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.lead?.assigned_owners ? Global.getAssignedOwnersName(this.state.lead?.assigned_owners) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('description').label}
                            value={this.state.lead?.description}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id').label}
                            value={this.state.lead?.main_owner_name}
                        />

                        <LineItemViewText
                            title={this.getFiledName('createdtime').label}
                            value={formatDateTime(this.state.lead?.createdtime)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('modifiedtime').label}
                            value={formatDateTime(this.state.lead?.modifiedtime)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('createdby').label}
                            value={this.state.lead?.createdby ? Global.getUser(this.state.lead?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source').label}
                            value={this.state.lead?.source}
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
                    {/* Activity related*/}
                    <SectionView noPaddingHorizontal>
                        <ListItem
                            divider={false}
                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                            title={getLabel('common.title_activity')}
                            badgeCount={this.state.counters?.activities_count ? parseInt(this.state.counters?.activities_count) : '0'}
                            onPress={() => {
                                this.props.navigation.navigate('ActivityList', { module: 'Leads', parent: this.state.lead?.label, isFromDetailView: true, activityList: this.state.lead?.activities_list })
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
                                        related_lead: this.state.lead?.id,
                                        related_lead_name: this.state.lead?.label
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
                                        related_lead: this.state.lead?.id,
                                        related_lead_name: this.state.lead?.label
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
                                        related_lead: this.state.lead?.id,
                                        related_lead_name: this.state.lead?.label
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

                    <SpaceS />
                    {/* Document related */}
                    <SectionView noPaddingHorizontal>
                        <Box>
                            <ListItem
                                divider={false}
                                style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                title={getLabel('common.title_related_document')}
                                badgeCount={this.state.counters?.documents_count ? parseInt(this.state.counters?.documents_count) : '0'}
                                onPress={() => {
                                    this.props.navigation.navigate('ModalDocumentList', { module: 'Leads', parent: this.state.lead?.label, isFromDetailView: true, documentList: this.state.lead?.documents_list })
                                }}
                                noArrowRight
                            />
                        </Box>
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

        const { lead, interactionsComplete } = this.state;

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

                    {/* Content screen */}
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
                        {/* Action content */}
                        <ScrollView horizontal style={{ maxHeight: 90, flexDirection: 'row', width: widthResponse }}>
                            {/* Action call */}
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

                                    if (this.state.lead?.mobile) {
                                        phones.push(this.state.lead?.mobile)
                                    }

                                    if (this.state.lead?.phone) {
                                        phones.push(this.state.lead?.phone)
                                    }


                                    callHandler(phones, this.state.lead.id, this.props.dispatch)
                                }}
                            />
                            {/* Action send sms */}
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

                                    if (this.state.lead?.mobile) {
                                        phones.push(this.state.lead?.mobile)
                                    }
                                    if (this.state.lead?.phone) {
                                        phones.push(this.state.lead?.phone)
                                    }

                                    SMSHandler(phones, this.props.dispatch)
                                }}
                            />
                            {/* Action view address on Google map */}
                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={'location-arrow'}
                                label={getLabel('common.btn_location')}
                                onPress={() => {
                                    showOnMapHandler(this.state.lead?.lane || '', this.props.dispatch)
                                }}
                            />
                            {/* Action follow record */}
                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(this.state.lead?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(this.state.lead?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => {
                                    this.toggleFavorite()
                                }}
                            />
                            {/* Action more actions */}
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
                                        Global.getPermissionModule('Leads', 'EditView') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
                                                    navigation.replace('LeadForm', { lead: lead, prevScene: 'LeadView' });
                                                }}
                                            >
                                                <Icon name={getIcon('Edit')} />
                                                <SpaceHM />
                                                <NText allowFontScaling={true} >{getLabel('common.label_menu_edit')}</NText>
                                            </MenuItem>
                                        )
                                            : null
                                    }

                                    <MenuItem
                                        onPress={() => {
                                            let emails = [];

                                            if (this.state.lead?.email) {
                                                emails.push(this.state.lead?.email)
                                            }
                                            if (this.state.lead?.secondaryemail) {
                                                emails.push(this.state.lead?.secondaryemail)
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
                                        Global.getPermissionModule('Leads', 'CreateView') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
                                                    navigation.replace('LeadForm', { lead: lead, isDuplicate: true, prevScene: 'LeadView' });
                                                }}
                                            >
                                                <Icon name={getIcon('Duplicate')} />
                                                <SpaceHM />
                                                <NText allowFontScaling={true} >{getLabel('common.label_menu_duplicate')}</NText>
                                            </MenuItem>
                                        ) : null
                                    }

                                    {
                                        Global.getPermissionModule('Leads', 'Delete') ? (
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
                                                                    Global.deleteRecord('Leads', this.state.lead?.id, data => {
                                                                        this.setState({ loading: false })
                                                                        Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('lead.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                                        Global.updateCounters();
                                                                        if (this.props.route?.params?.prevScene == 'LeadList') {
                                                                            const resListLead = deleteItemDetailToList(this.props.leadState.leads, this.props.leadState.indexSelected)
                                                                            this.props.dispatch(setLeads(resListLead))
                                                                        }
                                                                        navigation.navigate('LeadList');
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
                                segmentedControlBackgroundColor={'#f0f0f0'}
                            />

                        </View>
                    </Animated.View>

                    {/* Fix header */}
                    <Animated.View
                        style={[
                            styles.bar,
                        ]}
                    >
                        <LargeHeader

                        >
                            <Header
                                noBorder
                            >
                                <Left>
                                    <SpaceHM />
                                    <Icon name={getIconModule('Leads')} style={{ fontSize: 18 }} />
                                    <SpaceHS />
                                    <LBText allowFontScaling={true} numberOfLines={2} >{lead?.fullname || lead?.label || ''}</LBText>
                                </Left>
                                <Right>
                                    <TouchableHighlight
                                        style={{
                                            borderRadius: 30,
                                            height: 40,
                                            width: 40,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 4
                                        }}
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
                                            lead?.tags?.length > 0 && lead?.tags.map((item, index) => {
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
    leadState: state.leadState
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
        dispatch,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LeadView)





