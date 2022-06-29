import React, { useEffect, useState } from 'react'
import { BackHandler, Image, RefreshControl, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch } from 'react-redux'
//Component
import { Content, Header, ItemListViewContent, LargeHeader, LBText, Left, NText, Right, SearchInput, SectionFilterList, SpaceHS, SText } from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import Global from '../../../Global'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { getIcon, getLabel, logScreenView } from '../../../utils/commons/commons'
import styles from './styles'


export default function FaqList({ navigation }) {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState({});
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_faq') })
    });
    const [optionsFilter, setOptionsFilter] = useState([]);
    const [faqList, setFaqList] = useState([]);
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

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation?.goBack();
                return true;
            }
        );
        loadData('FIRST_LOAD', filter);
        return () => backHandler.remove();
    }, []);

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
    //         // The screen is focused
    //         // Call any action
    //         loadData('FIRST_LOAD', filter);
    //     });

    //     const unsubscribeBlur = navigation.addListener('blur', () => {
    //         // Reset data when unmount screen 
    //         setLoading(false);
    //         setRefreshing(false);
    //         setPaging({});
    //         setKeyword('');
    //         setFilter({
    //             cv_id: '',
    //             viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_faq') })
    //         });
    //         setFaqList([]);
    //     });

    //     return () => {
    //         unsubscribeBlur();
    //         unsubscribe();
    //     };
    // }, [navigation])

    const loadData = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', customView) => {
        if (loadType === 'REFRESH') {
            setLoading(false);
            setRefreshing(true);
        }
        else {
            setLoading(true);
            setRefreshing(false);
        }
        let offset = 0;

        if (loadType == 'LOAD_MORE') {
            if (paging?.next_offset) {
                offset = paging.next_offset;
            }
        }

        let params = {
            RequestAction: 'GetFaqList',
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

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let list = data.entry_list;
                if (loadType == 'LOAD_MORE') {
                    list = contacts.concat(list);
                }

                setOptionsFilter(data.cv_list);
                setFaqList(list);
                setLoading(false);
                setRefreshing(false);
                setPaging(data.paging);
            }
            else {
                setLoading(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_no_results_found'));
            }
        },
            (error) => {
                setLoading(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_connection_error'));
            })

    }

    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Faq',
                id: data.id,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let faqs = faqList;
                faqs[indexSelected].starred = (faqs[indexSelected].starred == 0) ? 1 : 0;

                setFaqList(faqs)
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
                            onPress={() => {  }}
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
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Icon name={getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>
                        <SectionFilterList
                            value={filter}
                            options={optionsFilter}
                            onSelected={(value) => {
                                setFilter(value);
                                loadData('FIRST_LOAD', value)
                            }}
                        />
                    </Left>

                    <Right style={{ minWidth: '30%' }}>
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
                        placeholder={getLabel('common.label_search_placeholder', { moduleName: getLabel('common.title_faq')})}
                        onSearch={() => {
                            loadData('FIRST_LOAD', filter)
                        }}
                    />
                </Header>
            </LargeHeader>

            <Content enableScroll={false}>
                <SwipeListView
                    useFlatList={true}
                    data={faqList}
                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipe={true}
                                leftOpenValue={0}
                                rightOpenValue={0}
                            >
                                <></>
                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => { logScreenView('ViewDetailFAQ'); navigation.navigate('FaqView', { faq: data.item, prevScene: 'FaqList' }) }}
                                >
                                    <ItemListViewContent
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true}  numberOfLines={1}>{data.item?.question}</LBText>
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
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(data.item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.item.smownerid).avatar) }} resizeMode='stretch'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true}  numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? (data.item.assigned_owners[0]?.name || '') : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true}  color={Colors.black.black2}>{data.item?.createdtime ? Global.formatDate(data.item.createdtime) : ''}</SText>
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
                                loadData('REFRESH', filter)
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    keyExtractor={(item, index) => index.toString()}
                    onEndReachedThreshold={0.1}
                    onEndReached={() => {
                        if (paging && paging.next_offset) {
                            loadData('LOAD_MORE', filter)
                        }
                    }}
                    onPanResponderTerminationRequest={false}
                />
            </Content>
            <IndicatorLoading loading={loading} />
        </>
    )
}
