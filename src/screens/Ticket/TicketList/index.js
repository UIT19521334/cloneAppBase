import React, { useEffect, useState } from 'react'
import { BackHandler, Image, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-root-toast'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch } from 'react-redux'
//Component
import { Content, Header, IconRight, ItemListViewContent, LargeHeader, LBText, Left, NBText, NText, Right, SearchInput, SectionFilterList, SpaceHS, SText } from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Global from '../../../Global'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { getIcon, getLabel, logScreenView, widthResponse } from '../../../utils/commons/commons'
import { PARAMS_ACTION_SHEET, PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles'
import { LoadingList, LoadingMoreList } from '../../../components/Loading'

export default function TicketList({ navigation, route }) {
    const [refreshing, setRefreshing] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [paging, setPaging] = useState({});
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_tickets') })
    });
    const [optionsFilter, setOptionsFilter] = useState([]);
    const [tickets, setTickets] = useState(
        route?.params?.ticketList
            ? route.params.ticketList
            : []
    );
    const [ticketsRelated, setTicketsRelated] = useState(
        route?.params?.ticketList
            ? route.params.ticketList
            : []
    );
    const [actionsMore, setActionsMore] = useState([
        {
            label: getLabel('common.btn_edit'),
            icon: getIcon('Edit')
        },
        {
            label: getLabel('common.btn_delete'),
            icon: getIcon('Delete')
        }

    ]);

    const dispatch = useDispatch();
    const [ticketListFromDetail, setTicketListFromDetail] = React.useState([]);
    const [ticketListRelated, setTicketListRelated] = React.useState([]);
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

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // The screen is focused
            // Call any action
            if (route?.params?.isFromDetailView) {
                setTicketListFromDetail(route.params?.ticketList || []);
                setTicketListRelated(route.params?.ticketList || [])
            }
            else if (!loaded) {
                loadData('FIRST_LOAD', filter);

            }
            // if (!route?.params?.isFromDetailView) {
            //     loadData('FIRST_LOAD', filter);
            // }
        });

        // const unsubscribeBlur = navigation.addListener('blur', () => {
        //     // Reset data when unmount screen 
        //     setLoading(false);
        //     setRefreshing(false);
        //     setPaging({});
        //     setKeyword('');
        //     setFilter({
        //         cv_id: '',
        //         viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_tickets') })
        //     });
        //     setTickets([]);
        //     setTicketsRelated([]);
        // });

        return () => {
            // unsubscribeBlur();
            unsubscribe();
        };
    }, [navigation, loaded])

    const loadData = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', customView) => {
        if (loadType === 'REFRESH') {
            setFirstLoading(false);
            setLoadMore(false);
            setRefreshing(true);
        }
        else if (loadType === 'LOAD_MORE') {
            setFirstLoading(false);
            setLoadMore(true);
            setRefreshing(false);
        }
        else {
            setFirstLoading(true);
            setLoadMore(false);
            setRefreshing(false);
        }

        let offset = 0;

        if (loadType == 'LOAD_MORE') {
            if (paging?.next_offset) {
                offset = paging.next_offset;
            }
        }

        let params = {
            RequestAction: 'GetTicketList',
            Params: {
                keyword: keyword,
                cv_id: customView.cv_id,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        if (route?.params?.prevScreen == 'HomeScreenViewAll' && Global.isVersionCRMNew) {
            params.Params.filters = {
                "status": "Open"
            }
            params.Params.ordering = {
                "createdtime": Global.homeSettings?.ticket_open?.create_time || "DESC",
                "priority": Global.homeSettings?.ticket_open?.priority || "DESC"
            };
            params.Params.filter_by = Global.homeSettings?.ticket_open?.filter_by || 'all'
        }

        console.log('Params request TicketList: ', params);

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let list = data.entry_list;
                if (loadType == 'LOAD_MORE') {
                    list = tickets.concat(list);
                }
                console.log('Item data: ', list?.[0]);
                setOptionsFilter(data.cv_list);
                setTickets(list);
                // setTicketsRelated(list);
                // setLoading(false);
                // setRefreshing(false);
                setPaging(data.paging);
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
            }
            else {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_no_results_found'));
            }
            setLoaded(true);

        },
            (error) => {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                setLoaded(true);
                Toast.show(getLabel('common.msg_connection_error'));
            })

    }

    const showActions = (item, indexRecord) => {

        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('common.label_option'),
            indexSelected: actionsMore.length - 1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actionsMore,
            onSelected: (index) => {
                switch (index) {
                    case 0:
                        logScreenView('EditTicket');
                        // Edit
                        navigation.navigate(Global.getTicketFormLabel(), { prevScene: 'TicketList', ticket: item });
                        break;
                    case 1:
                        // Delete
                        setLoading(true);
                        Global.deleteRecord('HelpDesk', item.ticketid, data => {
                            Toast.show(getLabel('common.msg_delete_success', { module: getLabel('ticket.title').toLowerCase() }));
                            Global.updateCounters();
                            let ticketList = tickets;
                            ticketList.splice(indexRecord, 1);
                            setTickets(ticketList);
                            setTicketsRelated(ticketList);
                            setLoading(false);
                        },
                            error => {
                                Toast.show(getLabel('common.msg_delete_error', { module: getLabel('ticket.title').toLowerCase() }));
                                setLoading(false);
                            })
                        break;
                    default:
                        break;
                }
            }
        }
        dispatch(showActionSheet?.(params));
    }

    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'HelpDesk',
                id: data.ticketid,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let ticketList = route.params?.isFromDetailView ? ticketListRelated : tickets;
                ticketList[indexSelected].starred = (ticketList[indexSelected].starred == 0) ? 1 : 0;

                setTickets(ticketList);
                setTicketListRelated(ticketList);
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
                        {
                            Global.getPermissionModule('HelpDesk', 'EditView') ? (
                                <TouchableHighlight
                                    style={styles.action}
                                    activeOpacity={.3}
                                    underlayColor={Colors.black.black4}
                                    onPress={() => {
                                        const paramsTicket = {
                                            prevScene: 'TicketList',
                                            ticket: item,
                                            indexSelected: index,
                                            onUpdateItemSelected: _updateItemSelected,
                                            onDeleteItemSelected: _onDeleteItemSelected
                                        };

                                        paramsTicket.ticket.id = paramsTicket.ticket?.ticketid;
                                        logScreenView('EditTicket');
                                        navigation.navigate(Global.getTicketFormLabel(), { ...paramsTicket })
                                    }}
                                >
                                    <Icon name={getIcon('Edit')} style={styles.iconAction} />
                                </TouchableHighlight>
                            )
                                : null
                        }

                    </View>
                    <View style={styles.actionHiddenContent}>
                        {
                            Global.getPermissionModule('HelpDesk', 'Delete') ? (
                                <TouchableHighlight
                                    style={styles.action}
                                    activeOpacity={.3}
                                    underlayColor={Colors.black.black4}
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
                                                        setLoading(true);
                                                        Global.deleteRecord('HelpDesk', item.ticketid, data => {
                                                            Toast.show(getLabel('common.msg_delete_success', { module: getLabel('ticket.title').toLowerCase() }));
                                                            Global.updateCounters();
                                                            let ticketList = [...(route.params?.isFromDetailView ? ticketListRelated : tickets)];
                                                            ticketList.splice(index, 1);
                                                            setTickets(ticketList);
                                                            setTicketListRelated(ticketList);
                                                            setLoading(false);
                                                        },
                                                            error => {
                                                                Toast.show(getLabel('common.msg_delete_error', { module: getLabel('ticket.title').toLowerCase() }));
                                                                setLoading(false);
                                                            })
                                                    }
                                                }
                                            ]
                                        }

                                        dispatch(showAlert?.(params));

                                    }}
                                >
                                    <Icon name={getIcon('Delete')} style={[styles.iconAction, { color: Colors.functional.dangerous }]} />

                                </TouchableHighlight>
                            )
                                : null
                        }
                    </View>
                </View>
            </View>
        )
    }

    const _updateItemSelected = (indexSelected, dataChange) => {
        console.log('Data change: ', indexSelected, dataChange);
        let ticketList = [...(route?.params?.isFromDetailView ? ticketListRelated : tickets)];

        ticketList[indexSelected].title = dataChange?.ticket_title || '';
        ticketList[indexSelected].status = dataChange?.ticketstatus || '';
        ticketList[indexSelected].starred = dataChange?.starred || '0';
        ticketList[indexSelected].assigned_owners = dataChange?.assigned_owners || '';

        setTickets(ticketList);
        setTicketListRelated(ticketList);
    }

    const _onDeleteItemSelected = (indexSelected) => {
        let ticketList = [...(route?.params?.isFromDetailView ? ticketListRelated : tickets)];

        ticketList.splice(indexSelected, 1)

        setTickets(ticketList);
        setTicketListRelated(ticketList);
    }

    const _onCreateNew = (data) => {
        console.log('Data create: ', data);
        const newTicket = {
            ticketid: data?.id || data?.ticketid || '',
            title: data?.ticket_title || '',
            status: data?.ticketstatus || '',
            starred: 0,
            createdtime: data?.createdtime || new Date(),
            assigned_owners: data?.assigned_owners || []
        }

        let ticketList = [...tickets];
        ticketList.unshift(newTicket);

        setTickets(ticketList)
    }

    return (
        <>
            <LargeHeader>
                <Header noBorder>
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
                                <SectionFilterList
                                    value={filter}
                                    options={optionsFilter}
                                    onSelected={(value) => {
                                        setFilter(value);
                                        loadData('FIRST_LOAD', value)
                                    }}
                                />
                            )
                        }
                    </Left>

                    <Right style={{ minWidth: '30%' }}>
                        {
                            Global.getPermissionModule('HelpDesk', 'CreateView') ? (
                                <>
                                    {
                                        !route.params?.isFromDetailView ? (
                                            <IconRight onPress={() => { logScreenView('CreateTicket'); navigation.navigate(Global.getTicketFormLabel()) }}>
                                                <NBText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NBText>
                                            </IconRight>
                                        ) : null
                                    }
                                </>
                            )
                                : null
                        }
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
                        placeholder={getLabel('common.label_search_placeholder', { moduleName: getLabel('common.title_tickets') })}
                        onSearch={() => {
                            if (route.params?.isFromDetailView) {
                                Global.searchRelatedList('HelpDesk', ticketListFromDetail, keyword, data => {
                                    setTicketListRelated(data);
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
                <LoadingList loading={firstLoading} />
                <SwipeListView
                    useFlatList={true}
                    data={[...(route?.params?.isFromDetailView ? ticketListRelated : tickets)]}
                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipe={false}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data.item, data.index)}

                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => {
                                        if (route?.params?.isFromDetailView) {
                                            navigation.replace(Global.getTicketViewLabel(), {
                                                ticket: data.item,
                                                prevScene: 'TicketList',
                                                dataRelated: route?.params,
                                                isViewDetailRelated: true,
                                                indexSelected: data.index,
                                                onUpdateItemSelected: _updateItemSelected,
                                                onDeleteItemSelected: _onDeleteItemSelected
                                            })
                                        }
                                        else {
                                            logScreenView('ViewDetailTicket');
                                            navigation.navigate(Global.getTicketViewLabel(), {
                                                ticket: data.item,
                                                prevScene: 'TicketList',
                                                indexSelected: data.index,
                                                onUpdateItemSelected: _updateItemSelected,
                                                onDeleteItemSelected: _onDeleteItemSelected
                                            })
                                        }
                                    }}
                                >
                                    <ItemListViewContent
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true} numberOfLines={1}>{data.item.title}</LBText>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => { toggleFavorite(data.item, data.index) }}
                                                style={[styles.btnStar]}
                                            >
                                                <AntDesignIcon name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                            </TouchableOpacity>
                                        </View>

                                        {
                                            (data.item.status != '' && data.item.status != null && data.item.status != undefined) ? (
                                                <View
                                                    style={[styles.lineItem]}
                                                >
                                                    <View style={{ width: 20, alignItems: 'center' }}>
                                                        <Icon name={getIcon('Status')} />
                                                    </View>
                                                    <SpaceHS />
                                                    <View style={{ flex: 1 }}>
                                                        <NText allowFontScaling={true} numberOfLines={1} color={Global.getEnumColor('HelpDesk', 'ticketstatus', data.item.status)}>
                                                            {Global.getEnumLabel('HelpDesk', 'ticketstatus', data.item?.status)}
                                                        </NText>
                                                    </View>
                                                </View>
                                            )
                                                : null
                                        }

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(data.item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.item.smownerid).avatar) }} resizeMode='stretch'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? (data.item.assigned_owners[0]?.name || '') : ''}</NText>
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
                                if (route.params?.isFromDetailView) {
                                    setTicketListRelated(ticketListFromDetail || [])
                                }
                                else {
                                    loadData('REFRESH', filter)
                                }
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    onEndReachedThreshold={0.1}
                    onEndReached={() => {
                        if (route.params?.isFromDetailView) {
                            setTicketListRelated(ticketListFromDetail || [])
                        }
                        else {
                            if (paging && paging.next_offset) {
                                loadData('LOAD_MORE', filter)
                            }
                        }
                    }}
                    onPanResponderTerminationRequest={false}
                    ListFooterComponent={<LoadingMoreList loading={loadMore} />}
                />
            </Content>
            <IndicatorLoading loading={loading} />
        </>
    )
}
