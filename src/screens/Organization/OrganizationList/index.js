// Import libraries
import React, { useEffect, useState } from 'react'
import { Alert, BackHandler, DeviceEventEmitter, Image, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-root-toast'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch } from 'react-redux'
import moment from 'moment-timezone'
// Import components
import { Content, Header, IconRight, ItemListViewContent, LargeHeader, LBText, Left, MenuFilterList, NBText, NText, Right, SearchInput, SectionFilterList, SpaceHS, SText } from '../../../components/CustomComponentView'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { callHandler, getLabel, widthResponse, SMSHandler, sendEmailHandler, getIcon, logScreenView } from '../../../utils/commons/commons'
import styles from './styles'
import Global from '../../../Global'
import IndicatorLoading from '../../../components/IndicatorLoading'
import I18n from '../../../utils/i18n'
import { PARAMS_ACTION_SHEET, PARAMS_ALERT } from '../../../utils/Models/models'
import { showAlert } from '../../../redux/actions/alert'
import { LoadingList, LoadingMoreList } from '../../../components/Loading'


export default function OrganizationList({ route, navigation }) {
    const [refreshing, setRefreshing] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [paging, setPaging] = useState({});
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_organizations') })
    });
    const [optionsFilter, setOptionsFilter] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [actionsMore, setActionsMore] = useState([
        {
            label: getLabel('common.btn_edit'),
            icon: getIcon('Edit'),
            key: 'edit'
        },
        {
            label: getLabel('common.btn_send_email'),
            icon: getIcon('Mail'),
            key: 'mail'
        },
        {
            label: getLabel('common.btn_duplicate'),
            icon: getIcon('Duplicate'),
            key: 'duplicate'
        },
        {
            label: getLabel('common.btn_delete'),
            icon: getIcon('Delete'),
            key: 'delete'
        }

    ]);
    const dispatch = useDispatch();
    const [relatedOrganization, setRelatedOrganization] = useState([]);
    const [organizationsListFromDetail, setOrganizationsListFromDetail] = useState([]);
    const [keywordRelated, setKeywordRelated] = useState('');

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch') {
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
            if (!loaded) {
                if (route.params?.isFromDetailView) {
                    console.log('reload contact: ', route.params?.accountList || []);
                    setOrganizationsListFromDetail(route.params?.accountList || []);
                    setRelatedOrganization(route.params?.accountList || [])
                }
                else if (route.params?.prevScene == 'GlobalSearch') {
                    console.log('has trigger 2');
                    setKeyword(route.params?.keyword || '');
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter, route.params?.keyword);
                    }, 1000);
                }
                else {
                    loadData('FIRST_LOAD', filter, null);
                }
            }
            else {
                console.log('has trigger 1');
                if (route.params?.prevScene == 'GlobalSearch') {
                    setKeyword(route.params?.keyword || '')
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter, route.params?.keyword);
                    }, 500);
                }
            }
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            // Reset data when unmount screen 
            // setLoading(false);
            // setRefreshing(false);
            // setPaging({});
            // setKeyword('');
            // setFilter({
            //     cv_id: '',
            //     viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_organizations') })
            // });
            // setOrganizations([]);
        });

        return () => {
            unsubscribeBlur();
            unsubscribe();
        };
    }, [navigation, loaded])

    const loadData = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', customView, keywordGlobalSearch) => {
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
            else {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                return;
            }
        }

        let params = {
            RequestAction: 'GetAccountList',
            Params: {
                keyword: keywordGlobalSearch || keyword,
                cv_id: customView.cv_id,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let list = data.entry_list;
                if (loadType == 'LOAD_MORE') {
                    /** Added by
                     * @generator   :   Manh Le
                     * @date        :   2022-05-27 
                     * @description :   Fix duplicate errors on some CRM servers
                    */
                    list = Global.concatArray(organizations, list, 'accountid');
                    //End by Manh Le at 2022-05-27
                }

                setOptionsFilter(data.cv_list);
                setOrganizations(list);
                setLoaded(true);
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
        },
            (error) => {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_connection_error'));
            })

    }

    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Accounts',
                id: data.accountid,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let accountList = route.params?.isFromDetailView ? organizationsListFromDetail : organizations;
                accountList[indexSelected].starred = (accountList[indexSelected].starred == 0) ? 1 : 0;

                if (route.params?.isFromDetailView) {
                    setOrganizationsListFromDetail(accountList)
                } else {
                    setOrganizations(accountList);
                }
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const showActions = (data, indexRecord) => {

        let hasDelete = true;
        if (!Global.getPermissionModule('Accounts', 'EditView')) {
            const idxEdit = actionsMore.findIndex(action => action.key == 'edit');
            if (idxEdit != -1) {
                actionsMore.splice(idxEdit, 1);
            }
        }

        if (!Global.getPermissionModule('Accounts', 'Delete')) {
            hasDelete = false;
            const idxDelete = actionsMore.findIndex(action => action.key == 'delete');
            if (idxDelete != -1) {
                actionsMore.splice(idxDelete, 1);
            }
        }

        if (!Global.getPermissionModule('Accounts', 'CreateView')) {
            const idxDuplicate = actionsMore.findIndex(action => action.key == 'duplicate');
            if (idxDuplicate != -1) {
                actionsMore.splice(idxDuplicate, 1);
            }
        }

        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('common.label_option'),
            indexSelected: hasDelete ? actionsMore.length - 1 : -1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actionsMore,
            onSelected: (index) => {
                switch (index) {
                    case 0:
                        // Edit
                        logScreenView('EditOrganization');
                        const paramsAccount = {
                            prevScene: 'OrganizationList',
                            account: data,
                            indexSelected: indexRecord,
                            onUpdateItemSelected: _updateItemSelected,
                            onDeleteItemSelected: _onDeleteItemSelected
                        };

                        paramsAccount.account.id = paramsAccount.account.accountid;
                        navigation.navigate('OrganizationForm', {
                            ...paramsAccount
                        });
                        break;
                    case 1:
                        // Send email
                        let emails = [];
                        if (data?.email1) {
                            emails.push(data?.email1)
                        }

                        if (data?.email2) {
                            emails.push(data?.email2)
                        }

                        sendEmailHandler(emails, dispatch);
                        break;
                    case 2:
                        // Duplicate
                        logScreenView('DuplicateOrganization');
                        navigation.navigate('OrganizationForm', {
                            prevScene: 'OrganizationList',
                            account: data,
                            isDuplicate: true,
                            onCreateNew: _onCreateNew
                        });
                        break;
                    case 3:
                        // Delete
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
                                        Global.deleteRecord('Accounts', data.accountid, data => {
                                            Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                            Global.updateCounters();
                                            let accountList = [... (route.params?.isFromDetailView ? relatedOrganization : organizations)];
                                            accountList.splice(indexRecord, 1);
                                            if (route.params?.isFromDetailView) {
                                                setRelatedOrganization(accountList);
                                            }
                                            else {
                                                setOrganizations(accountList);
                                            }
                                            setLoading(false);
                                        },
                                            error => {
                                                Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                setLoading(false);
                                            })
                                    }
                                }
                            ]
                        }

                        dispatch(showAlert?.(params));

                        break;
                    default:
                        break;
                }
            }
        }

        dispatch(showActionSheet?.(params));
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
                            onPress={() => {
                                let phones = [];
                                if (item?.phone) {
                                    phones.push(item.phone)
                                }
                                if (item?.otherphone) {
                                    phones.push(item.otherphone)
                                }
                                callHandler(phones, item?.accountid, dispatch)
                            }}
                        >
                            <Icon name={getIcon('Call')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => {
                                let phones = [];
                                if (item?.phone) {
                                    phones.push(item.phone)
                                }
                                if (item?.otherphone) {
                                    phones.push(item.otherphone)
                                }
                                SMSHandler(phones, dispatch)
                            }}
                        >
                            <Icon name={getIcon('SMS')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => { showActions(item, index) }}
                        >
                            <Icon name={getIcon('More')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }

    const _updateItemSelected = (indexSelected, dataChange) => {
        let accountsTemp = [...organizations];

        accountsTemp[indexSelected].accountname = dataChange?.accountname || '';
        accountsTemp[indexSelected].starred = dataChange?.starred || '0';
        accountsTemp[indexSelected].assigned_owners = dataChange?.assigned_owners || '';

        setOrganizations(accountsTemp);
    }

    const _onDeleteItemSelected = (indexSelected) => {
        let accountsTemp = [...organizations];

        accountsTemp.splice(indexSelected, 1)

        setOrganizations(accountsTemp);
    }

    const _onCreateNew = (data) => {
        console.log('Data create: ', data);
        const newAccount = {
            accountid: data?.id || data?.accountid || '',
            accountname: data?.accountname || '',
            starred: 0,
            createdtime: data?.createdtime || new Date(),
            assigned_owners: data?.assigned_owners || []
        }

        let accountList = [...organizations];
        accountList.unshift(newAccount);

        setOrganizations(accountList)
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
                            onPress={() => route.params?.isFromDetailView ? navigation.navigate('DocumentView') : route.params?.prevScene == 'GlobalSearch' ? navigation.goBack() : navigation.openDrawer()}
                        >
                            <Icon name={route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch' ? getIcon('Back') : getIcon("Menu")} style={{ color: Colors.black.black1, fontSize: 18 }} />
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
                                        loadData('FIRST_LOAD', value, null)
                                    }}
                                />
                            )}

                    </Left>

                    <Right style={{ minWidth: '30%' }}>
                        {
                            Global.getPermissionModule('Accounts', 'CreateView') ? (
                                <>
                                    {
                                        !route.params?.isFromDetailView ? (
                                            <IconRight onPress={() => {
                                                logScreenView('CreateOrganization');
                                                const params = {
                                                    prevScene: 'OrganizationList',
                                                    onCreateNew: _onCreateNew
                                                }
                                                navigation.navigate('OrganizationForm', params);
                                            }}>
                                                <NBText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_add_new')}</NBText>
                                            </IconRight>
                                        ) : null
                                    }

                                </>
                            ) : null
                        }
                    </Right>
                </Header>
                <Header noBorder>
                    <SearchInput
                        autoFocus={false}
                        value={route.params?.isFromDetailView ? keywordRelated : keyword}
                        onValueChange={(value) => route.params?.isFromDetailView ? setKeywordRelated(value) : setKeyword(value)}
                        isClearText={true}
                        onClearText={() => route.params?.isFromDetailView ? setKeywordRelated('') : setKeyword('')}
                        backgroundColor={Colors.white.white3}
                        placeholder={getLabel('account.label_search_placeholder')}
                        onSearch={() => {
                            if (route.params?.isFromDetailView) {
                                Global.searchRelatedList('Accounts', relatedOrganization, keywordRelated, data => {
                                    setOrganizationsListFromDetail(data);
                                })
                            }
                            else {
                                loadData('FIRST_LOAD', filter, null)
                            }
                        }}
                    />
                </Header>
            </LargeHeader>

            <Content enableScroll={false}>
                <LoadingList loading={firstLoading} />
                <SwipeListView
                    useFlatList={true}
                    data={[...(route.params?.isFromDetailView ? organizationsListFromDetail : organizations)]}

                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
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
                                        logScreenView('ViewDetailOrganization');
                                        const params = {
                                            account: data.item,
                                            prevScene: 'OrganizationList',
                                            indexSelected: data.index,
                                            onUpdateItemSelected: _updateItemSelected,
                                            onDeleteItemSelected: _onDeleteItemSelected
                                        }
                                        console.log('Params pass: ', params);
                                        if (route?.params?.isFromDetailView) {
                                            navigation.replace('OrganizationView', {
                                                account: data.item,
                                                prevScene: 'OrganizationList',
                                                indexSelected: data.index,
                                                dataRelated: route?.params,
                                                isViewDetailRelated: true,
                                                updateChange: (list) => {
                                                    setOrganizationsListFromDetail(list);
                                                }
                                            })
                                        }
                                        else {
                                            navigation.navigate('OrganizationView', params)
                                        }
                                    }}
                                >

                                    <ItemListViewContent>
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true} numberOfLines={1}>{data.item.accountname}</LBText>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.btnStar]}
                                                onPress={() => { toggleFavorite(data.item, data.index) }}
                                            >
                                                <AntDesignIcon
                                                    name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'}
                                                    style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>

                                                    <Image
                                                        source={{ uri: Global.getImageUrl(data.item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.item.smownerid).avatar) }}
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? Global.getAssignedOwnersName(data.item?.assigned_owners) : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true} color={Colors.black.black2}>{data.item?.createdtime ? moment(data.item.createdtime).format('DD-MM-YYYY') : ''}</SText>
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
                                    setOrganizationsListFromDetail(route.params?.accountList || [])
                                }
                                else {
                                    loadData('REFRESH', filter, null)
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

                        }
                        else {
                            if (paging && paging.next_offset) {
                                loadData('LOAD_MORE', filter, null)
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
