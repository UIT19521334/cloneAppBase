// Import libraries
import { useNavigation } from '@react-navigation/core'
import React, { useEffect } from 'react'
import { BackHandler, Image, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-root-toast'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch, useSelector } from 'react-redux'
// Import Components
import { Content, Header, IconRight, ItemListViewContent, LargeHeader, LBText, Left, NBText, NText, Right, SearchInput, SectionFilterList, SpaceHS, SText } from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import { LoadingList, LoadingMoreList } from '../../../components/Loading'
import Global from '../../../Global'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { showAlert } from '../../../redux/actions/alert'
import {
    initContacts,
    setContactLoaded,
    setContactReload, setContacts,
    setContactSelected, setFilter,
    setFirstLoading, setKeyword, setKeywordRelated, setLoading,
    setLoadMore, setOptionsFilter, setPaging, setRefreshing, setRelatedContacts
} from '../../../redux/actions/contactActions'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { callHandler, getIcon, getIconModule, getLabel, logScreenView, sendEmailHandler, showOnMapHandler, SMSHandler, widthResponse } from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import { ContactState, PARAMS_ACTION_SHEET, PARAMS_ALERT } from '../../../utils/Models/models'
import styles from './styles'

const ContactList = ({ route }) => {
    const navigation = useNavigation();
    const {
        loading,
        refreshing,
        firstLoading,
        loadMore,
        keyword,
        filter,
        paging,
        optionsFilter,
        contacts,
        relatedContacts,
        keywordRelated,
        actionsMore,
        loaded,
        reload
    }: ContactState = useSelector(state => state.contactState);

    const [contactListFromDetail, setContactListFromDetail] = React.useState([]);
    const [contactListRelated, setContactListRelated] = React.useState([]);

    const dispatch = useDispatch();

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
        if (route.params?.isFromDetailView) {
            console.log('reload contact: ', route.params?.contactList || []);
            setContactListFromDetail(route.params?.contactList || []);
            setContactListRelated(route.params?.contactList || [])
        }

        return () => {
            backHandler.remove();
        }
    }, [])

    useEffect(() => {

        const subscribe = navigation.addListener('focus', () => {
            if (!loaded || reload) {

                if (route.params?.prevScene == 'GlobalSearch') {
                    dispatch(setKeyword(route.params?.keyword || ''))
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter);
                    }, 500);
                } else {
                    dispatch(initContacts())
                    loadData('FIRST_LOAD', filter);
                }
            }
            else {
                console.log('Has trigger contactlist', route.params?.prevScene);
                if (route.params?.prevScene == 'GlobalSearch') {
                    dispatch(setKeyword(route.params?.keyword || ''))
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter);
                    }, 500);
                }
            }
        })

        return () => {
            subscribe();
        };
    }, [navigation, loaded]);

    const loadData = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', customView) => {
        if (loadType === 'REFRESH') {
            dispatch(setFirstLoading(false));
            dispatch(setLoadMore(false));
            dispatch(setRefreshing(true));
        }
        else if (loadType === 'LOAD_MORE') {
            dispatch(setFirstLoading(false));
            dispatch(setRefreshing(false));
            dispatch(setLoadMore(true));
        }
        else {
            dispatch(setFirstLoading(true));
            dispatch(setLoadMore(false));
            dispatch(setRefreshing(false));
        }

        let offset = 0;

        if (loadType == 'LOAD_MORE') {
            if (paging?.next_offset) {
                offset = paging.next_offset;
            }
        }

        let params = {
            RequestAction: 'GetContactList',
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

        console.log("Params request: ", params);

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
                    list = Global.concatArray(contacts, list, 'contactid');
                    //End by Manh Le at 2022-05-27
                }
                // console.log('>>>> data: ', JSON.stringify(list));
                dispatch(setOptionsFilter(data.cv_list));
                dispatch(setContacts(list));
                dispatch(setFirstLoading(false));
                dispatch(setRefreshing(false));
                dispatch(setLoadMore(false));
                dispatch(setPaging(data.paging));
                dispatch(setContactLoaded(true))
                dispatch(setContactReload(false))
            }
            else {
                dispatch(setFirstLoading(false));
                dispatch(setRefreshing(false));
                dispatch(setLoadMore(false));
                Toast.show(getLabel('common.msg_no_results_found'));
            }
        },
            (error) => {
                dispatch(setFirstLoading(false));
                dispatch(setRefreshing(false));
                dispatch(setLoadMore(false));
                Toast.show(getLabel('common.msg_connection_error'));
            })

    }


    const showActions = (item, indexRecord) => {
        let hasDelete = true;
        if (!Global.getPermissionModule('Contacts', 'EditView')) {
            const idxEdit = actionsMore.findIndex(action => action.key == 'edit');
            if (idxEdit != -1) {
                actionsMore.splice(idxEdit, 1);
            }
        }

        if (!Global.getPermissionModule('Contacts', 'Delete')) {
            hasDelete = false;
            const idxDelete = actionsMore.findIndex(action => action.key == 'delete');
            if (idxDelete != -1) {
                actionsMore.splice(idxDelete, 1);
            }
        }

        if (!Global.getPermissionModule('Contacts', 'CreateView')) {
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
                        logScreenView('EditContact');
                        dispatch(setContactSelected(indexRecord));
                        navigation.navigate('ContactForm', { prevScene: 'ContactList', contact: item });
                        break;
                    case 1:
                        // Show location
                        showOnMapHandler(item.mailingstreet || '', dispatch)
                        break;
                    case 2:
                        // Send email
                        let emails = [];

                        if (item?.email) {
                            emails.push(item?.email)
                        }
                        if (item?.secondaryemail) {
                            emails.push(item?.secondaryemail)
                        }
                        sendEmailHandler(emails, dispatch);
                        break;
                    case 3:
                        // Duplicate
                        logScreenView('DuplicateContact');
                        navigation.navigate('ContactForm', { prevScene: 'ContactList', contact: item, isDuplicate: true });
                        break;
                    case 4:
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
                                        dispatch(setLoading(true));
                                        Global.deleteRecord('Contacts', item.contactid, data => {
                                            console.log('LOG.indexRecord: ', indexRecord);
                                            Toast.show(I18n.t('common.msg_delete_success', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                            Global.updateCounters();
                                            let contactList = [...(route.params?.isFromDetailView ? contactListRelated : contacts)];
                                            contactList.splice(indexRecord, 1);
                                            if (route.params?.isFromDetailView) {
                                                dispatch(setRelatedContacts(contactList));
                                                setContactListRelated(contactList)
                                            } else {
                                                dispatch(setContacts(contactList));
                                            }
                                            dispatch(setLoading(false));
                                        },
                                            error => {
                                                Toast.show(I18n.t('common.msg_delete_error', { locale: Global.locale || "vn_vn", module: I18n.t('contact.title', { locale: Global.locale || "vn_vn" }).toLowerCase() }));
                                                dispatch(setLoading(false));
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
        dispatch(showActionSheet(params));
    }

    const toggleFavorite = (data, indexSelected) => {
        dispatch(setLoading(true))

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Contacts',
                id: data.contactid,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let contactList = route.params?.isFromDetailView ? contactListFromDetail : contacts;
                contactList[indexSelected].starred = (contactList[indexSelected].starred == 0) ? 1 : 0;

                if (route.params?.isFromDetailView) {
                    setContactListFromDetail(contactList)
                } else {
                    dispatch(setContacts(contactList))
                }
            }
            dispatch(setLoading(false))
        }, error => {
            dispatch(setLoading(false))
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
                            onPress={() => {
                                let phones = [];

                                if (item?.mobile) {
                                    phones.push(item?.mobile)
                                }
                                if (item?.phone) {
                                    phones.push(item?.phone)
                                }
                                if (item?.homephone) {
                                    phones.push(item?.homephone)
                                }
                                if (item?.otherphone) {
                                    phones.push(item?.otherphone)
                                }

                                callHandler(phones, item?.contactid, dispatch);
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

                                if (item?.mobile) {
                                    phones.push(item?.mobile)
                                }
                                if (item?.phone) {
                                    phones.push(item?.phone)
                                }
                                if (item?.homephone) {
                                    phones.push(item?.homephone)
                                }
                                if (item?.otherphone) {
                                    phones.push(item?.otherphone)
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

    return (
        <>
            <LargeHeader>
                <Header noBorder>
                    <Left style={{ minWidth: '70%' }}>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{
                                ...styles.btn_left
                            }}
                            // kiểm tra màn hình được mở từ mà hình detail của module khác bất kỳ 
                            // hoặc Global search 
                            // ==> Khi nhấn vào sẽ chuyển về màn hình trước đó
                            // ==> Ngược lại thì sẽ mở menu sidebar
                            onPress={() => route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch' ? navigation.goBack() : navigation.openDrawer()}
                        >
                            <Icon name={route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch' ? getIcon('Back') : getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>

                        {/* 
                            // kiểm tra màn hình được mở từ mà hình detail của module khác bất kỳ 
                            // ==> Sẽ chỉ hiển thị thông tin related như tên của record,...
                            // ==> Ngược lại sẽ render bộ lọc danh sách
                        */}
                        {
                            route.params?.isFromDetailView ? (
                                <NBText allowFontScaling={true} >{route.params?.parent || ''}</NBText>
                            ) : (
                                <SectionFilterList
                                    value={filter}
                                    options={optionsFilter}
                                    onSelected={(value) => {
                                        // Lưu thông tin filter được chọn
                                        dispatch(setFilter(value));
                                        //reload lại dữ liệu
                                        loadData('FIRST_LOAD', value)
                                        // console.log(">>> data contact: ", JSON.stringify(contacts))
                                    }}
                                />
                            )
                        }
                    </Left>

                    <Right style={{ minWidth: '30%' }}>
                        {
                            Global.getPermissionModule('Contacts', 'CreateView') ? (
                                <>
                                    {
                                        !route.params?.isFromDetailView ? (
                                            <IconRight onPress={() => {
                                                logScreenView('CreateContact');
                                                navigation.navigate('ContactForm');
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
                        onValueChange={(value) => dispatch(route.params?.isFromDetailView ? setKeywordRelated(value) : setKeyword(value))}
                        isClearText={true}
                        onClearText={() => dispatch(route.params?.isFromDetailView ? setKeywordRelated('') : setKeyword(''))}
                        backgroundColor={Colors.white.white3}
                        placeholder={getLabel('contact.label_search_placeholder')}
                        onSearch={() => {
                            if (route.params?.isFromDetailView) {
                                Global.searchRelatedList('Contacts', contactListRelated, keywordRelated, data => {
                                    setContactListFromDetail(data);
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
                    data={[...(route.params?.isFromDetailView ? contactListFromDetail : contacts)]}
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
                                        dispatch(setContactSelected(data.index));
                                        if (route?.params?.isFromDetailView) {
                                            navigation.replace('ContactView', {
                                                contact: data.item,
                                                prevScene: 'ContactList',
                                                indexSelected: data.index,
                                                dataRelated: route?.params,
                                                isViewDetailRelated: true,
                                                updateChange: (list) => {
                                                    setContactListFromDetail(list);

                                                }
                                            })
                                        }
                                        else {
                                            logScreenView('ViewDetailContact');
                                            navigation.navigate('ContactView', { contact: data.item, prevScene: 'ContactList' })
                                        }
                                    }}
                                >
                                    <ItemListViewContent
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true} numberOfLines={1}>
                                                    {data.item.salutation ? (Global.getEnumLabel('Contacts', 'salutationtype', data.item.salutation) + ' ') : ''}
                                                    {route.params?.isFromDetailView ? Global.getFullName(data.item.firstname, data.item.lastname) : data.item.fullname}
                                                    <LBText allowFontScaling={true} onPress={() => callHandler([data.item?.mobile], data.item?.contactid, dispatch)}>{data.item?.mobile ? ` - ${data.item.mobile}` : ''}</LBText>
                                                </LBText>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => { toggleFavorite(data.item, data.index) }}
                                                style={[styles.btnStar]}
                                            >
                                                <AntDesignIcon name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ width: 20, alignItems: 'center' }}>
                                                <Icon name={getIconModule('Accounts')} />
                                            </View>

                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <NText allowFontScaling={true} numberOfLines={1}>{data.item.accountname}</NText>
                                            </View>
                                        </View>

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
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? Global.getAssignedOwnersName(data.item?.assigned_owners) : ''}</NText>
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
                                    setContactListFromDetail(route.params?.contactList || [])
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

                        }
                        else {
                            if (paging && paging.next_offset && !loadMore) {
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

export default ContactList
