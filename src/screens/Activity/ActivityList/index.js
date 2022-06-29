import React, { Component, useState, useEffect } from 'react'
import { ActivityIndicator, Alert, Image, Keyboard, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { connect, useDispatch } from 'react-redux'

//Component
import { Content, Header, IconRight, ItemListViewContent, LargeHeader, LBText, Left, MenuFilterList, NBText, NText, Right, SearchInput, SpaceHS, SText } from '../../../components/CustomComponentView'
import { Leads } from '../../../fakedata'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { getIcon, getLabel, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ACTION_SHEET } from '../../../utils/Models/models';
import Global from '../../../Global';

import styles from './styles'
import IndicatorLoading from '../../../components/IndicatorLoading'
import { BackHandler } from 'react-native'

const ActivityList = ({ route, navigation }) => {

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        key: 'All',
        label: 'All Activity'
    });
    const [optionsFilter, setOptionsFilter] = useState([
        {
            key: 'All',
            label: 'All Activity'
        },
        {
            key: 'Today',
            label: `Today's Activity`
        },
    ]);
    const [activityList, setActivityList] = useState(
        route?.params?.activityList
            ? route.params.activityList
            : []
    );
    const [activityListRelated, setActivityListRelated] = useState(
        route?.params?.activityList
            ? route.params.activityList
            : []
    );
    const [actionsMore, setActionsMore] = useState([
        {
            label: 'Edit',
            icon: 'pen'
        },
        {
            label: 'Show Location',
            icon: 'location-arrow'
        },
        {
            label: 'Send Email',
            icon: 'envelope'
        },
        {
            label: 'Duplicate',
            icon: 'clone'
        },
        {
            label: 'Send Zalo',
            icon: 'comment'
        },
        {
            label: 'Delete',
            icon: 'trash-alt'
        }

    ]);

    const dispatch = useDispatch()

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (route.params?.isFromDetailView) {
                    navigation.goBack();
                }
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    const showActions = () => {
        const params: PARAMS_ACTION_SHEET = {
            title: 'More',
            indexSelected: actionsMore.length - 1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actionsMore,
            onSelected: (index) => {
                Alert.alert('Action selected at ' + index)
            }
        }
        dispatch(showActionSheet(params));
    }

    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Calendar',
                id: data.activityid || data.id,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let tmpActivityList = activityList;
                tmpActivityList[indexSelected].starred = (tmpActivityList[indexSelected].starred == 0) ? 1 : 0;

                setActivityList(tmpActivityList);
                setActivityListRelated(tmpActivityList);
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const renderHiddenRow = (item, index) => {
        return (
            <View style={[styles.rowHidden]}>
                <View style={styles.actionsHidden}>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { }}
                        >
                            <Icon name={getIcon('Call')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { }}
                        >
                            <Icon name={getIcon('SMS')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { showActions(); }}
                        >
                            <Icon name={getIcon('More')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <>
            <LargeHeader

            >
                <Header

                    noBorder
                >
                    <Left style={{ minWidth: '70%' }}>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => route.params?.isFromDetailView ? navigation.goBack() : navigation.openDrawer()}
                        >
                            <Icon name={route.params?.isFromDetailView ? getIcon('Back') : getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>
                        {
                            route.params?.isFromDetailView ? (
                                <NBText allowFontScaling={true} >{route.params?.parent || ''}</NBText>
                            ) : (
                                <MenuFilterList
                                    value={filter}
                                    options={optionsFilter}
                                    onSelected={(value) => { setFilter(value) }}
                                />
                            )
                        }

                    </Left>

                    <Right style={{ minWidth: '30%' }}>
                        {/* <IconRight onPress={() => { navigation.navigate('LeadForm') }}>
                            <NBText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NBText>
                        </IconRight> */}
                    </Right>
                </Header>
                <Header
                    noBorder
                >
                    <SearchInput
                        autoFocus={false}
                        value={keyword}
                        onValueChange={(value) => setKeyword(value)}
                        isClearText={true}
                        onClearText={() => setKeyword('')}
                        backgroundColor={Colors.white.white3}
                        placeholder={getLabel('common.label_search_placeholder', { moduleName: getLabel('common.title_activity') })}
                        onSearch={() => {
                            if (route.params?.isFromDetailView) {
                                Global.searchRelatedList('Calendar', activityListRelated, keyword, data => {
                                    setActivityList(data);
                                })
                            }
                            else {
                                loadData('FIRST_LOAD', filter)
                            }
                        }}
                    />
                </Header>
            </LargeHeader>

            <Content enableScroll={false}>
                <SwipeListView
                    useFlatList={true}
                    data={activityList}
                    renderItem={(data, index) => {
                        let iconCalendar = '';

                        switch (data.item?.activitytype) {
                            case 'Call':
                                iconCalendar = 'phone-alt'
                                break;
                            case 'Meeting':
                                iconCalendar = 'users'
                                break;

                            default:
                                iconCalendar = 'tasks'
                                break;
                        }

                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipe={true}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data, index)}

                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => {
                                        if (route?.params?.isFromDetailView) {
                                            navigation.replace('ActivityView', {
                                                activity: data.item,
                                                prevScene: 'ActivityList',
                                                dataRelated: route?.params,
                                                isViewDetailRelated: true
                                            })
                                        }
                                        else {
                                            navigation.navigate('ActivityView', { activity: data.item })
                                        }
                                    }}
                                >

                                    <ItemListViewContent
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ width: 20 }}>
                                                <Icon name={iconCalendar} style={styles.iconModule} />
                                            </View>
                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true} numberOfLines={1}>{data.item?.subject}</LBText>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.btnStar]}
                                                onPress={() => { toggleFavorite(data.item, data.index) }}
                                            >
                                                <AntDesignIcon name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ width: 20, alignItems: 'center' }}>
                                                <Icon name={getIcon('Status')} />
                                            </View>

                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <NText allowFontScaling={true} numberOfLines={1}>
                                                    {
                                                        data.item?.activitytype == 'Task'
                                                            ? Global.getEnumLabel('Calendar', 'taskstatus', data.item?.taskstatus)
                                                            : Global.getEnumLabel('Events', 'eventstatus', data.item?.eventstatus)
                                                    }
                                                </NText>
                                            </View>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(data.item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.item.smownerid).avatar) }}
                                                        resizeMode='cover'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? (Global.getAssignedOwnersName(data.item.assigned_owners) || '') : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true} color={Colors.black.black2}>{data.item?.createdtime ? Global.formatDate(data.item.createdtime) : ''}</SText>
                                            </View>
                                        </View>
                                    </ItemListViewContent>
                                </TouchableHighlight>

                            </SwipeRow>
                        )
                    }}
                    onRowOpen={(rowKey, rowMap) => {
                        setTimeout(() => {
                            rowMap[rowKey] && rowMap[rowKey].closeRow();
                        }, 4000)
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true)
                                setTimeout(() => {
                                    setRefreshing(false)
                                }, 2000);
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    onEndReachedThreshold={0.1}
                    onPanResponderTerminationRequest={false}
                />

            </Content>
            <IndicatorLoading loading={loading} />
        </>
    )
}

export default ActivityList;

