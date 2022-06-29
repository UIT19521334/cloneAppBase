import React, { Component, useState, useEffect } from 'react'
import { ActivityIndicator, Alert, Image, Keyboard, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { log } from 'react-native-reanimated'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch } from 'react-redux'

//Component
import { Content, Header, IconRight, ItemListViewContent, LargeHeader, Left, MenuFilterList, NBText, NText, Right, SearchInput, SpaceHS, SText } from '../../../components/CustomComponentView'
import { SalesOrder } from '../../../fakedata'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { getLabel, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ACTION_SHEET } from '../../../utils/Models/models';

import styles from './styles'

export default SalesOrderList = ({ navigation }) => {

    const [refreshing, setRefreshing] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        key: 'All',
        label: 'All Sales Order'
    });
    const [optionsFilter, setOptionsFilter] = useState([
        {
            key: 'All',
            label: 'All Sales Order'
        },
        {
            key: 'Today',
            label: `Today's Sales Order`
        },
    ]);
    const [orders, setOrders] = useState([
    ]);
    const [actionsMore, setActionsMore] = useState([
        {
            label: 'Edit',
            icon: 'pen'
        },
        {
            label: 'Duplicate',
            icon: 'clone'
        },
        {
            label: 'Delete',
            icon: 'trash-alt'
        }

    ]);

    const dispatch = useDispatch();

    useEffect(() => {
        setOrders(SalesOrder)
        return () => {
        }
    }, [])

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
        dispatch(showActionSheet?.(params));
    }

    const renderHiddenRow = (item, index) => {
        return (
            <View style={[styles.rowHidden]}>
                <View style={styles.actionsHidden}>
                    {/* <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { }}
                        >
                            <Icon name='phone-alt' style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { }}
                        >
                            <Icon name='sms' style={styles.iconAction} />

                        </TouchableHighlight>
                    </View> */}
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { showActions(); }}
                        >
                            <Icon name='ellipsis-h-alt' style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <>
            <LargeHeader>
                <Header noBorder>
                    <Left>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Icon name='bars' style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>
                        <MenuFilterList
                            value={filter}
                            options={optionsFilter}
                            onSelected={(value) => { setFilter(value) }}
                        />
                    </Left>

                    <Right>
                        <IconRight onPress={() => { navigation.navigate('SalesOrderForm') }}>
                            <NBText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NBText>
                        </IconRight>
                    </Right>
                </Header>
                <Header noBorder>
                    <SearchInput
                        autoFocus={false}
                        value={keyword}
                        onValueChange={(value) => setKeyword(value)}
                        isClearText={true}
                        onClearText={() => setKeyword('')}
                        backgroundColor={Colors.white.white3}
                        placeholder='Enter name lead'
                    />
                </Header>
            </LargeHeader>

            <Content enableScroll={false}>
                <SwipeListView
                    useFlatList={true}
                    data={orders}
                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipe={false}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data, index)}

                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => { navigation.navigate('SalesOrderView') }}
                                >

                                    <ItemListViewContent
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <NBText allowFontScaling={true}  numberOfLines={1}>{data.item.salesorder_no}</NBText>
                                            </View>
                                            <TouchableOpacity style={[styles.btnStar]}>
                                                <AntDesignIcon name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <Icon name='building' />

                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <NText allowFontScaling={true}  numberOfLines={1}>{data.item.account_name}</NText>
                                            </View>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <Icon name='flag' />

                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <NText allowFontScaling={true}  numberOfLines={1}>{data.item.sostatus}</NText>
                                            </View>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={require('../../../assets/images/avatar.jpg')}
                                                        resizeMode='cover'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true}  numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? (data.item.assigned_owners[0]?.name || '') : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true}  color={Colors.black.black2}>19-09-2020</SText>
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

        </>
    )
}
