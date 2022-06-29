// Import libraries
import { Content } from 'native-base'
import React, { Component } from 'react'
import {
    ActivityIndicator, Animated,
    BackHandler,
    findNodeHandle, FlatList, Platform, ScrollView, TextInput,
    TouchableHighlight, View
} from 'react-native'
import { Image } from 'react-native-animatable'
import DocumentPicker from 'react-native-document-picker'
import Toast from 'react-native-root-toast'
import TimeAgo from 'react-native-timeago'
import OcticonsIcon from 'react-native-vector-icons/dist/Octicons'
import { connect } from 'react-redux'
// Import components
import { HeaderSectionView, LineItemViewText } from '../../../components/ComponentView'
import {
    Divider, Header, LBText, Left, NText, Right,
    SBText, SectionView, SpaceHM, SpaceHS, SpaceL, SpaceS, SText
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { getIcon, getIconModule, getLabel, isIphoneX, widthResponse } from '../../../utils/commons/commons'
import styles from './styles'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);

export class FaqView extends Component {

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
            faq: {},
            metaData: {},
            isReady: false,
            loading: false,
            counters: null,
            commentList: [],
            comment: {},
            attachment: []
        };
    }

    componentDidMount() {
        this.unsubscribe = this.props?.navigation?.addListener('focus', () => {
            // The screen is focused
            // Call any action
            this.handleTabsChange(this.state.tabSelected);
            const { route } = this.props;
            this.setState({ faq: route?.params?.faq }, () => {
                this.loadData();
            })
        });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation?.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
        this.unsubscribe();
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetFaq',
            Params: {
                id: this.state.faq?.faqid || this.state.faq?.id,
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
                    faq: data.data,
                    metaData: data.metadata,
                    counters: data.data.counters,
                    commentList: Global.sortCommentList(data.data?.modcomments_list || [])?.reverse()
                }, () => {
                    this.setState({ isReady: true });
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
                id: this.state.faq?.id,
                starred: (parseInt(this.state.faq?.starred || '0') == 0) ? 1 : 0
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

        this.setState({ commentList: this.state.commentList })
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
                                                <SText allowFontScaling={true}  numberOfLines={2}>
                                                    {item.commentcontent}
                                                </SText>
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
                                                <SText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_reply')}</SText>
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

                    <TextInput
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
                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
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
                                commentcontent: this.state.comment,
                                parent_comments: data.modcommentsid
                            }
                            Global.saveComment(this, this.state.faq?.id, comment, 'reply', () => {
                                this.setState({ comment: '' }, () => { this.loadData(); })
                            }, () => {
                                Toast.show(getLabel('common.msg_connection_error'))
                            })
                        }}
                    >
                        <NText allowFontScaling={true}  color={Colors.white.white1}>{getLabel('common.btn_reply')}</NText>
                    </TouchableHighlight>
                </Box>
            </Box>
        )
    }

    getLabelRating = (number: number) => {
        switch (number) {
            case 1:
                return <Text  allowFontScaling={true} >★<Text  allowFontScaling={true}  color='black1'>★★★★</Text></Text>;
            case 2:
                return <Text  allowFontScaling={true} >★★<Text  allowFontScaling={true}  color='black1'>★★★</Text></Text>;
            case 3:
                return <Text  allowFontScaling={true} >★★★<Text  allowFontScaling={true}  color='black1'>★★</Text></Text>;
            case 4:
                return <Text  allowFontScaling={true} >★★★★<Text  allowFontScaling={true}  color='black1'>★</Text></Text>;
            case 5:
                return <Text  allowFontScaling={true} >★★★★★</Text>;

            default:
                return '';
        }
    }

    renderTabDetail = () => {

        if (this.state.loadingTabDetail) {
            return (
                <View>
                    <ActivityIndicator style={{ paddingVertical: 10 }} />
                </View>
            )
        } else {
            return (
                <ScrollView style={{ backgroundColor: Colors.white.white3, flex: 1, height: '100%' }}>

                    <SpaceS />
                    <SectionView noPaddingHorizontal style={{ flex: 1 }}>

                        <HeaderSectionView title={getLabel('faq.title_faq_information')} />
                        <LineItemViewText
                            title={this.getFiledName('product_id')?.label}
                            value={this.state.faq?.product_name || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('faq_no')?.label}
                            value={this.state.faq?.faq_no || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('faqstatus')?.label}
                            value={Global.getEnumLabel('Faq', 'faqstatus', this.state.faq?.faqstatus) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('faqcategories')?.label}
                            value={Global.getEnumLabel('Faq', 'faqcategories', this.state.faq?.faqcategories) || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('question')?.label}
                            value={this.state.faq?.question || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('faq_answer')?.label}
                            value={this.state.faq?.faq_answer || ''}
                            handleOnPress={() => {
                                this.props?.navigation?.navigate('RMWebView', { htmlString: '<div>' + this.state.faq?.faq_answer + '</div>', title: this.state.faq?.question || '' })
                            }}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime')?.label}
                            value={this.state.faq?.modifiedtime || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('source')?.label}
                            value={this.state.faq?.source || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdtime')?.label}
                            value={this.state.faq?.createdtime || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('createdby')?.label}
                            value={this.state.faq?.createdby ? Global.getUser(this.state.faq?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('main_owner_id')?.label}
                            value={this.state.faq?.main_owner_name || ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department')?.label}
                            value={this.state.faq?.users_department ? this.getEnumLabel('users_department', this.state.faq?.users_department) : ''}
                        />

                    </SectionView>
                    <SpaceS />
                    {/* <SectionView noPaddingHorizontal>
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
                                <TouchableOpacity onPress={() => this.setState({ comment: '', attachment: [] }, () => { this.loadData(); })}>
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
                                <TextInput
                                    onFocus={() => {
                                        // this.mainScroll.scrollToEnd()
                                    }}
                                    style={[styles.comment]}
                                    underlineColorAndroid="transparent"
                                    placeholder={getLabel('common.label_placeholder_comment')}
                                    placeholderTextColor={Colors.black.black3}
                                    multiline={true}
                                    value={this.state.comment}
                                    onChangeText={(value) => this.setState({ comment: value })}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                            </View>
                        </Box>
                        <Box justifyContent={'space-between'} flexDirection='row' paddingHorizontal={'l'} paddingVertical={'m'}>
                            <TouchableHighlight
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
                            </TouchableHighlight>
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
                                    Global.saveComment(this, this.state.faq?.id, comment, 'post', () => {
                                        this.setState({ comment: '', attachment: [] }, () => { this.loadData(); })
                                    }, () => {
                                        Toast.show(getLabel('common.msg_connection_error'))
                                    })
                                }}
                            >
                                <NText allowFontScaling={true}  color={Colors.white.white1}>{getLabel('common.btn_post')}</NText>
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
                                            <SText allowFontScaling={true}  color={Colors.functional.primary}>{item.name}</SText>
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
                                renderItem={({ item, index }) =>
                                    <>
                                        <Box flexDirection='row' paddingVertical={'m'} style={{ paddingRight: 22 }} key={index}>
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
                                                        <NBText allowFontScaling={true} >{Global.getUser(item.smownerid)?.full_name}</NBText>
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
                                                        <NText allowFontScaling={true}  numberOfLines={2}>
                                                            {item.commentcontent}
                                                        </NText>
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
                                                        <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_reply')}</NText>
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
                                                                    <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_show_replies', { numberOfComments: item?.child_comments?.length })}</NText>
                                                                </TouchableHighlight>
                                                            </>
                                                        )
                                                    }
                                                </Box>
                                            </Box>
                                        </Box>
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
                                                            <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_show_replies', { numberOfComments: item.number_of_child_comment_not_show })}</NText>
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

                    </SectionView> */}
                    <SpaceL />
                </ScrollView>

            );
        }


    }

    render() {
        const { navigation, showAlert } = this.props;
        const { faq } = this.state;

        return (
            <>
                <View style={styles.fill}>
                    <Header noBorder
                        style={{
                            width: widthResponse
                        }}
                    >
                        <Left style={{ minWidth: '70%' }}>
                            <SpaceHM />
                            <Icon name={getIconModule('Faq')} style={{ fontSize: 18 }} />
                            <SpaceHS />
                            <Box flex={1}>
                                <LBText allowFontScaling={true} numberOfLines={2} >
                                    {faq?.label}
                                </LBText>
                            </Box>
                        </Left>
                        <Right>
                            <TouchableHighlight
                                style={{ marginRight: 4, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={0.3}
                                underlayColor='#d0d0d0'
                                onPress={() => {
                                    navigation.goBack()
                                }}
                            >
                                <Icon name={getIcon('Close')} style={{ fontSize: 25 }} />
                            </TouchableHighlight>
                        </Right>
                    </Header>
                    <Content
                    >
                        {
                            this.state.isReady ? (
                                this.renderTabDetail()
                            )
                                : null
                        }
                    </Content>
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

export default connect(mapStateToProps, mapDispatchToProps)(FaqView)
