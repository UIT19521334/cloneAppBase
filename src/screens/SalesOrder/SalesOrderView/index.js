import { Tab, Tabs } from 'native-base'
import React, { Component } from 'react'
import {
    ActivityIndicator, Animated,
    findNodeHandle, KeyboardAvoidingView, Platform,
    ScrollView, TextInput, TouchableOpacity,
    TouchableHighlight, View
} from 'react-native'
import { Image } from 'react-native-animatable'
import { MenuItem } from 'react-native-material-menu'
import { SafeAreaView } from 'react-native-safe-area-context'
import TimeAgo from 'react-native-timeago'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import OcticonsIcon from 'react-native-vector-icons/dist/Octicons'
import { connect } from 'react-redux'
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView'
import { Divider, Header, LBText, Left, ListItem, NBText, NText, Right, SectionView, SpaceHM, SpaceHS, SpaceL, SpaceS, TabContent } from '../../../components/CustomComponentView'
import Menu from '../../../components/MenuPopup'
import SectionCollapseView from '../../../components/SectionCollapseView'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box } from '../../../themes/themes'
import { getLabel, widthResponse } from '../../../utils/commons/commons'
import styles from './styles'
const HEADER_HEIGHT = 52
const HEADER_MAX_HEIGHT = 215;
const HEADER_MIN_HEIGHT = 52;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - 12;

const LineItem = () => {
    return (
        <Box borderColor='white4' borderWidth={.4} width={widthResponse} paddingHorizontal='l' paddingVertical='m'>
            <Box flex={1} height={25} justifyContent='space-between' flexDirection='row' alignItems='center'>
                <NText allowFontScaling={true}  numberOfLines={1}>Máy điều hòa Nicky X921</NText>
            </Box>
            <Box flex={1} height={25} justifyContent='space-between' flexDirection='row' alignItems='center'>
                <NText allowFontScaling={true}  numberOfLines={1} color={Colors.black.black3}>Total</NText>
                <NText allowFontScaling={true}  color={Colors.black.black3}>2 x 2,400,000 = 4,800,000</NText>
            </Box>
            <Box flex={1} height={25} justifyContent='space-between' flexDirection='row' alignItems='center'>
                <NText allowFontScaling={true}  numberOfLines={1} color={Colors.black.black3}>Discount (-)</NText>
                <NText allowFontScaling={true}  color={Colors.black.black3}>960,000</NText>
            </Box>
            <Box flex={1} height={25} justifyContent='space-between' flexDirection='row' alignItems='center'>
                <NText allowFontScaling={true}  numberOfLines={1}>Net Price</NText>
                <NBText allowFontScaling={true} >3,840,000</NBText>
            </Box>
        </Box>
    )
}

export class SalesOrderView extends Component {

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
            tabSelected: 1,
            animTransitionChangeTab: new Animated.Value(0),
            loadingTabOverView: false,
            loadingTabDetail: false,
            loadingTabRelated: false
        };
    }

    componentDidMount() {
        this.handleTabsChange(this.state.tabSelected);
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
                            this.setState({ loadingTabOverView: true }, () => {
                                setTimeout(() => {
                                    this.setState({ loadingTabOverView: false });
                                }, 500)
                            });
                            break;
                        case 1:
                            this.setState({ loadingTabDetail: true }, () => {

                                setTimeout(() => {
                                    this.setState({ loadingTabDetail: false });
                                }, 500)
                            });
                            break;
                        case 2:
                            this.setState({ loadingTabRelated: true }, () => {
                                setTimeout(() => {
                                    this.setState({ loadingTabRelated: false });
                                }, 500)
                            });
                            break;
                    }
                }
            });
        });
    }

    renderTabOverView = () => {
        return (
            <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <HeaderSectionView
                        title={getLabel('common.title_info_base')}
                    />

                    <LineItemViewText title='SO Number' value='SO0291' />
                    <LineItemViewText title='Organization Name' value='Công ty thiết kế đồ họa GraTomato' />
                    <LineItemViewText title='Status' value='Paid' textStyle={{ color: Colors.variants.primary5 }} />
                    <LineItemViewText title='Grand Total' value={Global.formatNumber('120000000')} textStyle={{
                        color: Colors.functional.dangerous,
                        fontWeight: '700'
                    }} />
                    <LineItemViewText title='Assigned To' value='Nguyen Thi Hoa' />

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
                                <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NText>
                                <Menu
                                    ref={menuActivity => this.menuActivity = menuActivity}
                                    style={{ left: undefined, right: 18 }}
                                    button={
                                        <></>
                                    }
                                >
                                    <MenuItem
                                        onPress={() => {

                                        }}
                                    >
                                        <Icon name='phone-alt' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.title_event_call')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => {

                                        }}
                                    >
                                        <Icon name='users' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.title_event_meeting')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => {

                                        }}
                                    >
                                        <Icon name='tasks' />
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

                        <Box paddingHorizontal='z'>
                            <ListItem
                                style={{ paddingHorizontal: 10 }}
                                icon={'phone-alt'}
                                title='Sales call'
                                subTitle='15-09-2020 - 09:00'
                                iconBorder={true}
                            />
                        </Box>
                        <Box paddingHorizontal='z'>
                            <ListItem
                                style={{ paddingHorizontal: 10 }}
                                icon={'phone-alt'}
                                title='Sales call'
                                subTitle='15-09-2020 - 09:00'
                                iconBorder={true}
                            />
                        </Box>
                        <Box paddingHorizontal='z'>
                            <ListItem
                                style={{ paddingHorizontal: 10 }}
                                icon={'phone-alt'}
                                title='Sales call'
                                subTitle='15-09-2020 - 09:00'
                                iconBorder={true}
                            />
                        </Box>
                        <Box paddingHorizontal='z'>
                            <ListItem
                                style={{ paddingHorizontal: 10 }}
                                icon={'phone-alt'}
                                title='Sales call'
                                subTitle='15-09-2020 - 09:00'
                                iconBorder={true}
                            />
                        </Box>

                    </ScrollView>



                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    <Box justifyContent='center' paddingHorizontal='l' paddingVertical='m'>
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
                    <Box paddingHorizontal='l' paddingVertical='m'>
                        <View
                            ref={(commentLayout) => { this.commentLayout = commentLayout }}
                            style={styles.commnetContent} >
                            <TextInput
                                onFocus={() => {
                                    this.commentLayout.measureLayout(
                                        findNodeHandle(this.mainScroll), (x, y) => {
                                            this.mainScroll.scrollTo({ x: 0, y: y, animated: true });
                                        }
                                    )
                                    // this.mainScroll.scrollToEnd()
                                }}
                                style={[styles.comment]}
                                underlineColorAndroid="transparent"
                                placeholder={getLabel('common.label_placeholder_comment')}
                                placeholderTextColor={Colors.black.black3}
                                multiline={true}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </View>
                    </Box>
                    <Box justifyContent='space-between' flexDirection='row' paddingHorizontal='l' paddingVertical='m'>
                        <TouchableHighlight
                            activeOpacity={.2}
                            underlayColor={Colors.white.white3}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 6
                            }}
                            onPress={() => {

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

                            }}
                        >
                            <NText allowFontScaling={true}  color={Colors.white.white1}>{getLabel('common.btn_post')}</NText>
                        </TouchableHighlight>
                    </Box>
                    <SpaceS />
                    <Box paddingHorizontal='l' paddingVertical='m'>
                        <Divider />

                        <Box flexDirection='row' paddingVertical='m' style={{ paddingRight: 22 }}>
                            <Box justifyContent='center' alignItems='center' style={{ width: 70, minHeight: 70 }}>
                                <Box style={[styles.boxAvatar, styles.shadow]}>
                                    <Image
                                        source={require('../../../assets/images/avatar.jpg')}
                                        resizeMode='cover'
                                        style={styles.avatar}
                                    />
                                </Box>

                            </Box>
                            <Box style={{ flex: 1 }}>
                                <Box flexDirection='column' >
                                    <Box flexDirection='row' alignItems='center' width={widthResponse - 70 - 24}>
                                        <NBText allowFontScaling={true} >Le Hoang Manh</NBText>
                                        <SpaceHS />
                                        <OcticonsIcon name='primitive-dot' color={Colors.black.black3} />
                                        <SpaceHS />
                                        <TimeAgo
                                            time={'2020-10-08 12:25'}
                                            interval={20000}
                                            style={{ color: Colors.black.black3 }}
                                        />
                                    </Box>
                                    <Box paddingVertical='m' flexDirection='row' width={widthResponse - 70 - 24}>
                                        <NText allowFontScaling={true}  numberOfLines={2}>Magna ipsum cillum eu consectetur id do. Anim deserunt anim officia pariatur ipsum labore ad. In reprehenderit pariatur deserunt pariatur labore nostrud ea ullamco reprehenderit sunt veniam proident ea ullamco. Id elit laboris nulla magna. Magna culpa enim nisi mollit aute cupidatat fugiat et culpa eiusmod duis culpa quis qui. Adipisicing do commodo minim incididunt. Ex enim culpa ipsum dolor occaecat reprehenderit.</NText>
                                    </Box>
                                </Box>
                                <Box flexDirection='row'>
                                    <TouchableHighlight
                                        activeOpacity={.2}
                                        underlayColor={Colors.white.white1}
                                        style={{ paddingVertical: 5 }}
                                        onPress={() => {

                                        }}
                                    >
                                        <NText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_reply')}</NText>
                                    </TouchableHighlight>
                                </Box>

                            </Box>
                        </Box>
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
                    <Tabs
                        tabBarBackgroundColor={Colors.functional.dangerous}
                        style={{ backgroundColor: Colors.white.white1 }}
                        tabBarUnderlineStyle={{
                            height: 1,
                            backgroundColor: Colors.functional.primary
                        }}
                        tabBarTextStyle={
                            Colors.black.black1
                        }
                        tabBarActiveTextColor={
                            Colors.functional.primary
                        }
                    >
                        <Tab heading='Item Details'>
                            <SafeAreaView
                                edges={['bottom', 'left', 'right']}
                                style={{ backgroundColor: Colors.white.white2, flex: 1 }}
                            >
                                <SpaceS />
                                <SectionCollapseView initState={false} title='Section 1'>
                                    <LineItem />
                                    <LineItem />

                                </SectionCollapseView>

                                <SpaceS />
                                <SectionCollapseView initState={false} title='Section 2'>
                                    <LineItem />
                                    <LineItem />
                                </SectionCollapseView>

                                <SpaceS />
                                <Box paddingVertical='m' paddingHorizontal='l' backgroundColor='white1'>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true} >Item Total</NText>
                                        <NBText allowFontScaling={true} >{Global.formatNumber(8040000)}</NBText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>Overall Discount (0.00) (-)</NText>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>{Global.formatNumber(0)}</NText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>Charges (+)</NText>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>{Global.formatNumber(500000)}</NText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true} >Pre Tax Total</NText>
                                        <NBText allowFontScaling={true} >{Global.formatNumber(8540000)}</NBText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>Tax (+)</NText>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>{Global.formatNumber(241400)}</NText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>Tax On Charges (+)</NText>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>{Global.formatNumber(100600)}</NText>
                                    </Box>
                                    <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={25}>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>Adjustment (-)</NText>
                                        <NText allowFontScaling={true}  color={Colors.black.black3}>{Global.formatNumber(100000)}</NText>
                                    </Box>




                                </Box>

                                <SpaceS />
                                <Box
                                    flexDirection='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                    height={42}
                                    paddingHorizontal='l'
                                    width={widthResponse}
                                    marginBottom='xl'
                                    backgroundColor='white1'
                                >
                                    <NText allowFontScaling={true} >Grand Total</NText>
                                    <LBText allowFontScaling={true}  color={Colors.functional.dangerous}>{Global.formatNumber('8782000')}</LBText>
                                </Box>
                                <SpaceL />
                            </SafeAreaView>


                        </Tab>

                        <Tab heading='SO Detail'>
                            <SafeAreaView
                                edges={['bottom', 'left', 'right']}
                                style={{ backgroundColor: Colors.white.white2, flex: 1 }}
                            >
                                <SpaceS />
                                <SectionCollapseView initState={false} title='Thông tin Hóa đơn'>
                                    <LineItemViewText title='Tên hóa đơn' value='SO0291' />
                                    <LineItemViewText title='Loại hóa đơn' value='Bán ra' textStyle={{ color: 'purple' }} />
                                    <LineItemViewText title='Chủ sở hữu' value='OnlineCRM' />
                                    <LineItemViewText title='Công ty' value='Công ty TNHH Phần Mềm Quản Lý Khách Hàng Việt Nam' />
                                    <LineItemViewText title='Ngày lập Hóa đơn' value='' />
                                    <LineItemViewText title='Người liên hệ' value='' />
                                    <LineItemViewText title='Tình trạng' value='' />
                                    <LineItemViewText title='Đơn hàng' value='' />
                                    <LineItemViewText title='Chiến dịch' value='' />
                                    <LineItemViewText title='Người phụ trách' value='' />
                                    <LineItemViewText title='Mô tả' value='' />
                                    <LineItemViewText title='Giao cho' value='' />
                                    <LineItemViewText title='Phòng ban của Nhân viên' value='' />
                                </SectionCollapseView>

                                <SpaceS />
                                <SectionCollapseView initState={false} title='Thông tin địa chỉ'>
                                    <LineItemViewText title='Địa chỉ xuất hóa đơn' value='' />
                                    <LineItemViewText title='Tỉnh/ Tp (Xuất hóa đơn)' value='' />
                                    <LineItemViewText title='Quận/Huyện (Xuất hóa đơn)' value='' />
                                    <LineItemViewText title='Quận/Huyện (Xuất hóa đơn)' value='' />
                                    <LineItemViewText title='Địa chỉ giao hàng' value='' />
                                    <LineItemViewText title='Tỉnh/ TP (Giao hàng)' value='' />
                                    <LineItemViewText title='Quận/Huyện (Giao hàng)' value='' />
                                    <LineItemViewText title='Quốc gia (Giao hàng)' value='' />
                                </SectionCollapseView>


                            </SafeAreaView>
                        </Tab>
                    </Tabs>
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
                        <Box paddingHorizontal='z'>
                            <ListItem
                                title={getLabel('common.title_activity')}
                                badgeCount={42}
                            />
                        </Box>

                    </SectionView>
                </TabContent>
            );
        }
    }

    render() {
        const { navigation } = this.props;

        const scrollY = Animated.add(
            this.state.scrollY,
            Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
        );
        const headerTranslate = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -HEADER_SCROLL_DISTANCE],
            extrapolate: 'clamp',
        });

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
                            style={[styles.fill]}
                            scrollEventThrottle={1}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                                { useNativeDriver: true },
                            )}
                            // refreshControl={
                            //     <RefreshControl
                            //         refreshing={this.state.refreshing}
                            //         onRefresh={() => {
                            //             this.setState({ refreshing: true });
                            //             setTimeout(() => this.setState({ refreshing: false }), 1000);
                            //         }}
                            //         // Android offset for RefreshControl
                            //         progressViewOffset={HEADER_MAX_HEIGHT}
                            //     />
                            // }
                            // iOS offset for RefreshControl
                            contentInset={{
                                top: HEADER_MAX_HEIGHT,
                            }}
                            contentOffset={{
                                y: -HEADER_MAX_HEIGHT,
                            }}
                        >

                            <Animated.View
                                style={{
                                    flex: 1,
                                    width: widthResponse,
                                    flexDirection: 'row',
                                    backgroundColor: Colors.white.white4,
                                    transform: [{ translateX: this.state.animTransitionChangeTab }]
                                }}
                            >

                                {this.renderTabOverView()}
                                {this.renderTabDetail()}
                                {this.renderTabRelated()}

                            </Animated.View>
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
                        <View style={{ minHeight: 90, flexDirection: 'row', width: widthResponse }}>
                            <QuickActionHeader
                                width={widthResponse / 3}
                                icon={'pen'}
                                label={getLabel('common.btn_edit')}
                            />

                            <QuickActionHeader
                                width={widthResponse / 3}
                                iconElement={<AntDesignIcon name='staro' style={{ fontSize: 18, color: Colors.yellow.yellow1 }} />}
                                label={getLabel('common.btn_follow')}
                            />

                            <QuickActionHeader
                                width={widthResponse / 3}
                                icon={'ellipsis-h-alt'}
                                label={getLabel('common.btn_more')}
                                onPress={() => {
                                    this.moreMenu.show();
                                }}
                            >
                                <Menu
                                    ref={(moreMenu) => this.moreMenu = moreMenu}
                                    style={{ right: 20, left: undefined, marginTop: -28 }}
                                >
                                    <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name='pen' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_edit')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name='envelope' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_send_email')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name='clone' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_duplicate')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name='comment' />
                                        <SpaceHM />
                                        <NText allowFontScaling={true} >{getLabel('common.label_menu_send_zalo')}</NText>
                                    </MenuItem>
                                    <MenuItem
                                        onPress={() => { }}
                                    >
                                        <Icon name='trash-alt' color={Colors.functional.dangerous} />
                                        <SpaceHM />
                                        <NText allowFontScaling={true}  color={Colors.functional.dangerous}>{getLabel('common.label_menu_delete')}</NText>
                                    </MenuItem>
                                </Menu>

                            </QuickActionHeader>
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
                        {/* <LargeHeader> */}
                        <Header>
                            <Left>
                                <SpaceHM />
                                <Icon name='file-invoice-dollar' style={{ fontSize: 18 }} />
                                <SpaceHS />
                                <LBText allowFontScaling={true} >SO0291</LBText>
                            </Left>
                            <Right>
                                <TouchableHighlight
                                    style={{ marginRight: 4, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                    activeOpacity={0.3}
                                    underlayColor='#d0d0d0'
                                    onPress={() => navigation.goBack()}
                                >
                                    <Icon name='times' style={{ fontSize: 25 }} />
                                </TouchableHighlight>
                            </Right>
                        </Header>
                        {/* <Header noBorder style={{ minHeight: 36 }}>
                                <Left>
                                    <SpaceHM />
                                    <SText allowFontScaling={true} >Tags:</SText>
                                    <TagOutLine
                                        color={Colors.functional.successful}
                                        label={'Starred'}
                                    />
                                    <TagOutLine
                                        color={Colors.functional.dangerous}
                                        label={'Hot'}
                                    />
                                    <TagOutLine
                                        color={Colors.functional.primary}
                                        label={'Potential'}
                                    />
                                </Left>
                            </Header>
                        </LargeHeader> */}
                    </Animated.View>
                </View>
            </>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(SalesOrderView)
