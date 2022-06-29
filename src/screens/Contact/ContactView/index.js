// Import libraries
import React, { Component } from 'react';
import {
    ActivityIndicator, Animated, BackHandler, FlatList, InteractionManager, Keyboard, Platform,
    ScrollView, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import { Image } from 'react-native-animatable';
import DocumentPicker from 'react-native-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuItem } from 'react-native-material-menu';
import Toast from 'react-native-root-toast';
import TimeAgo from 'react-native-timeago';
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign';
import OcticonsIcon from 'react-native-vector-icons/dist/Octicons';
import { connect } from 'react-redux';
import CommentInput from '../../../components/CommentInput';
import CommentView from '../../../components/CommentView';
// Import components
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView';
import {
    Divider, Header, LargeHeader, LBText, Left,

    ListItem, NBText, NText, Right,
    SBText,
    SectionView, SpaceHM, SpaceHS,

    SpaceL, SpaceS, SText,
    TabContent, TagOutLine
} from '../../../components/CustomComponentView';
import IndicatorLoading from '../../../components/IndicatorLoading';
import Menu from '../../../components/MenuPopup';
import SegmentedControl from '../../../components/SegmentedControl';
import Global from '../../../Global';
import { showAlert } from '../../../redux/actions/alert';
import { setContacts, setRelatedContacts } from '../../../redux/actions/contactActions';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { Box, Text } from '../../../themes/themes';
import {
    callHandler,
    formatDateTime,
    getIcon,
    getIconModule, getLabel, isIphoneX, sendEmailHandler, showOnMapHandler, SMSHandler, widthResponse
} from '../../../utils/commons/commons';
import I18n from '../../../utils/i18n';
import { PARAMS_ALERT } from '../../../utils/Models/models';
import { deleteItemDetailToList, updateItemDetailToList } from '../../Lead/Shared';
import styles from './styles';



const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);

export class ContactView extends Component {

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
            contact: {},
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
            this.setState({ contact: route?.params?.contact }, () => {
                this.loadData();
            })
        });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
        this.unsubscribe();
    }

    goBack() {
        if (this.props?.route?.params?.isViewDetailRelated) {
            this.props?.navigation.replace('ModalContactList', this.props?.route?.params?.dataRelated)
        }
        else {
            this.props?.navigation.goBack()
        }
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetContact',
            Params: {
                id: this.state.contact?.contactid || this.state.contact?.id,
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
            console.log('LOG.Contact information: ', data);
            if (parseInt(data.success) === 1) {
                console.log('LOG.Contact information: ', data.data.avatar);
                this.setState({
                    contact: data.data,
                    metaData: data.metadata,
                    counters: data.data.counters,
                    commentList: Global.sortCommentList(data.data?.modcomments_list || [])?.reverse()
                }, () => {
                    this.setState({ isReady: true });
                    if (this.props?.route?.params?.isViewDetailRelated) {
                        const resListRelatedContact = updateItemDetailToList('CONTACTS', data.data, this.props.route?.params?.dataRelated?.contactList || [], this.props.route?.params?.indexSelected)
                        this.props.route?.params?.updateChange?.(resListRelatedContact);
                    } else if (this.props?.route?.params?.prevScene == 'ContactList') {
                        const resListContact = updateItemDetailToList('CONTACTS', data.data, this.props.contactState.contacts, this.props.contactState.indexSelected)
                        this.props.dispatch(setContacts(resListContact))
                    }

                });


            }
            else {
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }) }));
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

    toggleFavorite = () => {
        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Contacts',
                id: this.state.contact?.id,
                starred: (parseInt(this.state.contact?.starred || '0') == 0) ? 1 : 0
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

        console.log('data comment parent: ', data);

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
                    {/* <TextInput
                        onFocus={() => {
                            this.commentLayout.measureLayout(
                                findNodeHandle(this.mainScroll), (x, y) => {
                                    this.mainScroll.scrollTo({ x: 0, y: y, animated: true });
                                }
                            )
                            // this.mainScroll.scrollToEnd()
                        }}
                        style={[styles.comment, { height: 40 }]}
                        underlineColorAndroid="transparent"
                        placeholder={getLabel('common.label_placeholder_comment')}
                        placeholderTextColor={Colors.black.black3}
                        multiline={true}
                        value={this.state.comment}
                        onChangeText={(value) => this.setState({ comment: value })}
                    /> */}
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
                            Global.saveComment(this, this.state.contact?.id, comment, 'reply', () => {
                                Keyboard.dismiss();
                                this.setState({ commentReply: '' }, () => {
                                    Global.getComments(this, this.state.contact?.id, data => {
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
        const { contact } = this.state;
        return (
            <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <HeaderSectionView
                        title={getLabel('common.title_info_base')}
                    />

                    <LineItemViewText
                        title={this.getFiledName('full_name').label}
                        value={contact?.label}
                    />
                    <LineItemViewText
                        title={this.getFiledName('account_id').label}
                        value={contact?.account_name}
                        handleOnPress={() => contact?.account_name && this.props.navigation.navigate('OrganizationView', { account: { id: contact.account_id }, prevScene: 'ContactView' })}
                    />
                    <LineItemViewText
                        title={this.getFiledName('mobile').label}
                        value={contact?.mobile}
                        handleOnPress={() => contact?.mobile && callHandler([contact?.mobile], contact.id, this.props.dispatch)}
                    />
                    <LineItemViewText
                        title={this.getFiledName('email').label}
                        value={contact?.email}
                        handleOnPress={() => contact?.email && sendEmailHandler([contact?.email], this.props.dispatch, this.props?.navigation)}
                    />
                    <LineItemViewText
                        title={this.getFiledName('assigned_user_id').label}
                        value={contact?.assigned_user_id ? Global.getAssignedOwnersName(contact.assigned_owners) : ''}
                    />

                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <Box
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        paddingHorizontal='l'
                        paddingVertical='m'
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
                                                parent_id: this.state.contact?.id,
                                                parent_name: this.state.contact?.label,
                                                parent_type: 'Contacts'
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
                                                parent_id: this.state.contact?.id,
                                                parent_name: this.state.contact?.label,
                                                parent_type: 'Contacts'
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
                                                parent_id: this.state.contact?.id,
                                                parent_name: this.state.contact?.label,
                                                parent_type: 'Contacts'
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

                    <Box>
                        <Divider />
                    </Box>

                    <SpaceS />
                    <ScrollView style={{ height: 188 }}>
                        {
                            !this.state.contact?.activities_list
                                || this.state.contact?.activities_list?.length <= 0
                                || this.state.contact?.activities_list?.filter((activity) => (activity.taskstatus == 'Planned' || activity.taskstatus == 'In Progress' || activity.taskstatus == 'Pending Input' || activity.eventstatus == 'Planned'))?.length <= 0 ?
                                (
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                    >
                                        <Text allowFontScaling={true} color='dangerous' fontSize={13} fontStyle='italic' fontWeight='600'>{getLabel('common.label_empty_upcoming_activities')}</Text>
                                    </Box>
                                )
                                : (
                                    this.state.contact?.activities_list?.map((activity, index) => {
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
                                )
                        }
                    </ScrollView>
                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <Box
                        justifyContent={'center'}
                        paddingHorizontal='l'
                        paddingVertical='m'
                    >
                        <Box
                            flexDirection='row'
                            justifyContent='space-between'
                        >
                            <NBText allowFontScaling={true} >{getLabel('common.title_comment')}</NBText>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        comment: '', attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.contact?.id, data => {
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
                    <Box
                        justifyContent={'space-between'}
                        flexDirection='row'
                        paddingHorizontal='l'
                        paddingVertical='m'
                    >
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
                                Global.saveComment(this, this.state.contact?.id, comment, 'post', () => {
                                    Keyboard.dismiss();
                                    this.setState({
                                        comment: '', attachment: []
                                    }, () => {
                                        Global.getComments(this, this.state.contact?.id, data => {
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
                                        key={index}
                                        onPress={() => {
                                            Keyboard.dismiss()
                                        }}
                                    >
                                        <Box flexDirection='row' paddingVertical={'m'} style={{ paddingRight: 22 }} >
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
        const { contact } = this.state;
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

                        <HeaderSectionView title={getLabel('contact.title_general_information')} />

                        <LineItemViewText
                            title={this.getFiledName('full_name').label}
                            value={contact?.label}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contacts_type').label}
                            value={contact?.contacts_type ? Global.getEnumLabel('Contacts', 'contacts_type', contact?.contacts_type) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contact_id').label}
                            value={contact?.contact_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('account_id').label}
                            value={contact?.account_name}
                            handleOnPress={() => contact?.account_name && this.props.navigation.navigate('OrganizationView', { account: { id: contact.account_id }, prevScene: 'ContactView' })}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mobile').label}
                            value={contact?.mobile}
                            handleOnPress={() => contact?.mobile && callHandler([contact?.mobile], contact.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('phone').label}
                            value={contact?.phone}
                            handleOnPress={() => contact?.phone && callHandler([contact?.phone], contact.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('homephone').label}
                            value={contact?.homephone}
                            handleOnPress={() => contact?.homephone && callHandler([contact?.homephone], contact.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherphone').label}
                            value={contact?.otherphone}
                            handleOnPress={() => contact?.otherphone && callHandler([contact?.otherphone], contact.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('leadsource').label}
                            value={contact?.leadsource ? Global.getEnumLabel('Contacts', 'leadsource', contact?.leadsource) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('title').label}
                            value={contact?.title}
                        />
                        <LineItemViewText
                            title={this.getFiledName('birthday').label}
                            value={contact?.birthday ? Global.formatDate(contact?.birthday) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('department').label}
                            value={contact?.department}
                        />
                        <LineItemViewText
                            title={this.getFiledName('contact_id').label}
                            value={contact?.contact_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('email').label}
                            value={contact?.email}
                            handleOnPress={() => contact?.email && sendEmailHandler([contact?.email], this.props.dispatch, this.props?.navigation)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('secondaryemail').label}
                            value={contact?.secondaryemail}
                            handleOnPress={() => contact?.secondaryemail && sendEmailHandler([contact?.secondaryemail], this.props.dispatch, this.props?.navigation)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assistant').label}
                            value={contact?.assistant}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assistantphone').label}
                            value={contact?.assistantphone}
                            handleOnPress={() => contact?.assistantphone && callHandler([contact?.assistantphone], contact.id, this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('donotcall').label}
                            value={contact?.donotcall == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('emailoptout').label}
                            value={contact?.emailoptout == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={contact?.assigned_user_id ? Global.getAssignedOwnersName(contact.assigned_owners) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('notify_owner').label}
                            value={contact?.notify_owner == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('reference').label}
                            value={contact?.reference == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('isconvertedfromlead').label}
                            value={contact?.isconvertedfromlead == 1 ? getLabel('common.label_yes') : getLabel('common.label_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdtime').label}
                            value={formatDateTime(contact?.createdtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdby').label}
                            value={Global.getUser(contact?.createdby)?.full_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime').label}
                            value={formatDateTime(contact?.modifiedtime)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('related_campaign').label}
                            value={contact?.related_campaign_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source').label}
                            value={contact?.source}
                        />
                        <LineItemViewText
                            title={this.getFiledName('rating').label}
                            value={contact?.rating ? Global.getEnumLabel('Contacts', 'rating', contact.rating) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id').label}
                            value={Global.getUser(contact?.main_owner_id)?.full_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department').label}
                            value={contact?.users_department ? Global.getEnumLabel('Contacts', 'users_department', contact.users_department) : ''}
                        />
                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('contact.title_address_information')} />

                        <LineItemViewText
                            title={this.getFiledName('mailingstreet').label}
                            value={contact?.mailingstreet}
                            handleOnPress={() => contact?.mailingstreet && showOnMapHandler(contact?.mailingstreet || '', this.props.dispatch)}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mailingpobox').label}
                            value={contact?.mailingpobox}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mailingcity').label}
                            value={contact?.mailingcity}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mailingstate').label}
                            value={contact?.mailingstate}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mailingzip').label}
                            value={contact?.mailingzip}
                        />
                        <LineItemViewText
                            title={this.getFiledName('mailingcountry').label}
                            value={contact?.mailingcountry}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherstreet').label}
                            value={contact?.otherstreet}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherpobox').label}
                            value={contact?.otherpobox}
                        />
                        <LineItemViewText
                            title={this.getFiledName('othercity').label}
                            value={contact?.othercity}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherstate').label}
                            value={contact?.otherstate}
                        />
                        <LineItemViewText
                            title={this.getFiledName('otherzip').label}
                            value={contact?.otherzip}
                        />
                        <LineItemViewText
                            title={this.getFiledName('othercountry').label}
                            value={contact?.othercountry}
                        />
                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>

                        <HeaderSectionView title={getLabel('contact.title_description_information')} />

                        <LineItemViewText title={this.getFiledName('description').label}
                            value={contact?.description} />

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
                        <Box>
                            <ListItem
                                divider={false}
                                style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                title={getLabel('common.title_activity')}
                                badgeCount={this.state.counters?.activities_count ? parseInt(this.state.counters?.activities_count) : '0'}
                                onPress={() => {
                                    this.props.navigation.navigate('ActivityList', { module: 'Contacts', parent: this.state.contact?.label, isFromDetailView: true, activityList: this.state.contact?.activities_list })
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
                                            contact_id: this.state.contact?.id,
                                            contact_name: this.state.contact?.label
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
                                            contact_id: this.state.contact?.id,
                                            contact_name: this.state.contact?.label
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
                                            contact_id: this.state.contact?.id,
                                            contact_name: this.state.contact?.label
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
                        Global.getPermissionModule('Potentials', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_opportunities')}
                                            badgeCount={this.state.counters?.opportunities_count ? parseInt(this.state.counters?.opportunities_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalOpportunityList', { module: 'Contacts', parent: this.state.contact?.label, isFromDetailView: true, opportunityList: this.state.contact?.opportunities_list })
                                            }}
                                            iconRight={Global.getPermissionModule('Potentials', 'CreateView') ? 'plus' : null}
                                            onPressIconRight={() => {
                                                let tmpOpportunity = {
                                                    contact_id: this.state.contact.id,
                                                    contact_name: this.state.contact.full_name,
                                                    related_to: this.state.contact.account_id,
                                                    related_to_name: this.state.contact.account_name,
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
                                    <Box>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_tickets')}
                                            badgeCount={this.state.counters?.tickets_count ? parseInt(this.state.counters?.tickets_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalTicketList', { module: 'Contacts', parent: this.state.contact?.label, isFromDetailView: true, ticketList: this.state.contact?.tickets_list })
                                            }}
                                            iconRight={Global.getPermissionModule('HelpDesk', 'CreateView') ? 'plus' : null}
                                            onPressIconRight={() => {
                                                let tmpTicket = {
                                                    contact_id: this.state.contact.id,
                                                    contact_name: this.state.contact.full_name,
                                                    parent_id: this.state.contact.account_id,
                                                    parent_name: this.state.contact.account_name
                                                }
                                                this.props.navigation.navigate(Global.getTicketFormLabel(), { ticket: tmpTicket });
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        )
                            : null
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
                                    this.props.navigation.navigate('ModalDocumentList', { module: 'Contacts', parent: this.state.contact?.label, isFromDetailView: true, documentList: this.state.contact?.documents_list })
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
        const { contact } = this.state;
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
                                <>
                                    <KeyboardAwareScrollView
                                        style={styles.fill}
                                        enabled={false}
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

                                </>
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

                                    if (contact?.mobile) {
                                        phones.push(contact?.mobile)
                                    }
                                    if (contact?.phone) {
                                        phones.push(contact?.phone)
                                    }
                                    if (contact?.homephone) {
                                        phones.push(contact?.homephone)
                                    }
                                    if (contact?.otherphone) {
                                        phones.push(contact?.otherphone)
                                    }

                                    callHandler(phones, contact?.id, this.props.dispatch)
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

                                    if (contact?.mobile) {
                                        phones.push(contact?.mobile)
                                    }
                                    if (contact?.phone) {
                                        phones.push(contact?.phone)
                                    }
                                    if (contact?.homephone) {
                                        phones.push(contact?.homephone)
                                    }
                                    if (contact?.otherphone) {
                                        phones.push(contact?.otherphone)
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
                                    showOnMapHandler(contact?.mailingstreet || '', this.props.dispatch)
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(contact?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(contact?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
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
                                        Global.getPermissionModule('Contacts', 'EditView') ?
                                            (
                                                <MenuItem
                                                    onPress={() => {
                                                        this.moreMenu.hide();
                                                        navigation.replace('ContactForm', { contact: contact, prevScene: 'ContactView' });
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

                                            if (contact?.email) {
                                                emails.push(contact?.email)
                                            }
                                            if (contact?.secondaryemail) {
                                                emails.push(contact?.secondaryemail)
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
                                        Global.getPermissionModule('Contacts', 'CreateView') ? (
                                            <MenuItem
                                                onPress={() => {
                                                    this.moreMenu.hide();
                                                    navigation.replace('ContactForm', { contact: contact, isDuplicate: true, prevScene: 'ContactView' });
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
                                        Global.getPermissionModule('Contacts', 'Delete') ? (
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
                                                                    Global.deleteRecord('Contacts', contact?.id, data => {
                                                                        this.setState({ loading: false })
                                                                        Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                                        Global.updateCounters();
                                                                        if (this.props?.route?.params?.isViewDetailRelated) {
                                                                            const resListRelatedContact = deleteItemDetailToList(this.props.contactState.contacts, this.props.contactState.indexSelected)
                                                                            this.props.dispatch(setRelatedContacts(resListRelatedContact))
                                                                        } else if (this.props?.route?.params?.prevScene == 'ContactList') {
                                                                            const resListContact = deleteItemDetailToList(this.props.contactState.contacts, this.props.contactState.indexSelected)
                                                                            this.props.dispatch(setContacts(resListContact))
                                                                        }
                                                                        navigation.navigate('ContactList');
                                                                    },
                                                                        error => {
                                                                            Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
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
                                    {
                                        contact?.avatar ?
                                            (
                                                <Text allowFontScaling={true} >{contact?.avatar}</Text>
                                            )
                                            : null
                                    }
                                    <Icon name={getIconModule('Contacts')} style={{ fontSize: 18 }} />
                                    <SpaceHS />
                                    <LBText allowFontScaling={true} numberOfLines={2} >{contact?.fullname || contact?.label || ''}</LBText>
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
                            <Header
                                noBorder style={{ minHeight: 36 }}>
                                <Left>
                                    <SpaceHM />
                                    <SText allowFontScaling={true} >Tags:</SText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {
                                        contact?.tags?.length > 0 && contact?.tags.map((item, index) => {
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
    contactState: state.contactState
})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactView)
