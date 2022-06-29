// Import libraries
import moment from 'moment-timezone'
import React from 'react'
import { BackHandler, FlatList, Image, Keyboard, RefreshControl, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-root-toast'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import Global from '../../../Global'
// Import components
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { TransitionView } from '../../../utils/animation/Transition'
import { getIcon, getIconModule, getLabel, getParentName, HEADER_HEIGHT, heightDevice, isIphoneX } from '../../../utils/commons/commons'
import { RelatedModalProps } from '../../../utils/Models/models'
import { Header, ItemListViewContent, LargeHeader, LBText, Left, NText, Right, SearchInput, SpaceHS, SpaceL, SText, Title } from '../../CustomComponentView'
import IndicatorLoading from '../../IndicatorLoading'
import { LoadingList, LoadingMoreList } from '../../Loading'

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

export default function ({ navigation, route }) {

    const props: RelatedModalProps = route.params as RelatedModalProps;
    const [keyword, setKeyword] = React.useState(route?.params?.keyword ? route?.params?.keyword : '')
    const [iconTitle, setIconTitle] = React.useState(null);
    const [requestAction, setRequestAction] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);
    // const [isRefreshing, setRefreshing] = React.useState(false);
    const [paging, setPaging] = React.useState({});
    const [data, setData] = React.useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [firstLoading, setFirstLoading] = React.useState(false);
    const [loadMore, setLoadMore] = React.useState(false);
    React.useEffect(() => {

        switch (props.module) {
            case 'Products':
                setIconTitle(getIconModule('Products'))
                setRequestAction('GetProductList')
                getRelatedList('FIRST_LOAD', 'GetProductList')
                break;

            case 'Services':
                setIconTitle(getIconModule('Services'))
                setRequestAction('GetServiceList')
                getRelatedList('FIRST_LOAD', 'GetServiceList')
                break;

            case 'Users':
                setIconTitle('user')
                break;

            case 'Accounts':
                setIconTitle('building')
                setRequestAction('GetAccountList')
                getRelatedList('FIRST_LOAD', 'GetAccountList')
                break;

            case 'Potentials':
                setIconTitle('sack')
                setRequestAction('GetOpportunityList')
                getRelatedList('FIRST_LOAD', 'GetOpportunityList')
                break;

            case 'Leads':
                setIconTitle('user')
                setRequestAction('GetLeadList')
                getRelatedList('FIRST_LOAD', 'GetLeadList')
                break;

            case 'Contacts':
                setIconTitle('user-tie')
                setRequestAction('GetContactList')
                getRelatedList('FIRST_LOAD', 'GetContactList')
                break;

            case 'HelpDesk':
                setIconTitle(getIconModule('HelpDesk'))
                setRequestAction('GetTicketList')
                getRelatedList('FIRST_LOAD', 'GetTicketList')
                break;

            default:
                break;
        }

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation.navigate(route?.params?.prevScene, {
                    prevScene: route?.params?.parentFrom,
                    moduleRelated: props?.module,
                    indexSelected: route?.params?.indexSelected,
                    onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                    onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                    onCreateNew: route?.params?.onCreateNew
                });
                return true;
            }
        );

        return () => backHandler.remove();
    }, [])

    const toggleFavorite = (item, index) => {

        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: props.module,
                id: item.leadid || item.contactid || item.accountid || item.potentialid || item.ticketid,
                starred: (item.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, response => {
            if (parseInt(response.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (index != -1) {
                let list = data;
                list[index].starred = (list[index].starred == 0) ? 1 : 0;

                setData(list)
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const renderItem = (data, index) => {
        switch (props.module) {
            case 'Products':
                return (
                    <Box paddingHorizontal='l' paddingVertical='m' borderBottomWidth={StyleSheet.hairlineWidth} borderBottomColor='black4' backgroundColor='white1'>
                        <Text allowFontScaling={true} numberOfLines={1} paddingVertical='m'>{data.productname}</Text>
                        <Text allowFontScaling={true} numberOfLines={1} paddingVertical='m' color='black2'>{getLabel('common.label_stock')}: {Global.formatNumber(data.qtyinstock)}</Text>
                        <Text allowFontScaling={true} numberOfLines={1} paddingVertical='m' color='black2'>{getLabel('common.label_unit_price')}: {Global.formatCurrency(data.unit_price)}</Text>
                    </Box>
                )

            case 'Services':
                return (
                    <Box paddingHorizontal='l' paddingVertical='m' borderBottomWidth={StyleSheet.hairlineWidth} borderBottomColor='black4' backgroundColor='white1'>
                        <Text allowFontScaling={true} numberOfLines={1} paddingVertical='m'>{data.servicename}</Text>
                        <Text allowFontScaling={true} numberOfLines={1} paddingVertical='m' color='black2'>{getLabel('common.label_unit_price')}: {Global.formatCurrency(data.unit_price)}</Text>
                    </Box>
                )

            case 'Users':

                break;

            case 'Accounts':
                return (
                    <View>

                        <ItemListViewContent>
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={{ flex: 1 }}>
                                    <LBText allowFontScaling={true} numberOfLines={1}>{data.accountname}</LBText>
                                </View>
                                <TouchableOpacity style={[styles.btnStar]} onPress={() => { toggleFavorite(data, index) }}>
                                    <AntDesignIcon
                                        name={(data.starred === '0' || !data.starred) ? 'staro' : 'star'}
                                        style={[styles.iconStar, (data?.starred === '0' || !data?.starred) ? {} : { color: Colors.yellow.yellow1 }]}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={styles.ownerContent}>
                                    <View style={styles.avatarContent}>

                                        <Image
                                            source={{ uri: Global.getImageUrl(data.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.smownerid).avatar) }}
                                            resizeMode='cover'
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                                    </View>
                                </View>
                                <View style={styles.time}>
                                    <SText allowFontScaling={true} color={Colors.black.black2}>{data?.createdtime ? moment(data.createdtime).format('DD-MM-YYYY') : ''}</SText>
                                </View>
                            </View>
                        </ItemListViewContent>
                    </View>
                )

            case 'Potentials':
                return (
                    <View>
                        <ItemListViewContent
                        >
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={{ flex: 1 }}>
                                    <LBText allowFontScaling={true} numberOfLines={1}>{data.potentialname}</LBText>
                                </View>
                                <TouchableOpacity style={[styles.btnStar]} onPress={() => { toggleFavorite(data, index) }}>
                                    <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data?.starred === '0' || !data?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <Icon name={getIconModule('Accounts')} />

                                <SpaceHS />
                                <View style={{ flex: 1 }}>
                                    <NText allowFontScaling={true} numberOfLines={1}>{data.accountname}</NText>
                                </View>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <Icon name={getIcon('Status')} />

                                <SpaceHS />
                                <View style={{ flex: 1 }}>
                                    <NText allowFontScaling={true} numberOfLines={1}>{Global.getEnumLabel('Potentials', 'sales_stage', data.sales_stage)}</NText>
                                </View>

                                <SText allowFontScaling={true} color={Colors.black.black2}>{Global.formatCurrency(data.amount)}</SText>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={styles.ownerContent}>
                                    <View style={styles.avatarContent}>

                                        <Image
                                            source={{ uri: Global.getImageUrl(data?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.smownerid).avatar) }}
                                            resizeMode='stretch'
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                                    </View>
                                </View>
                                <View style={styles.time}>
                                    <SText allowFontScaling={true} color={Colors.black.black2}>{data?.createdtime ? moment(data.createdtime).format('DD-MM-YYYY') : ''}</SText>
                                </View>
                            </View>
                        </ItemListViewContent>
                    </View>
                )
                break;

            case 'Leads':
                return (
                    <View>
                        <ItemListViewContent
                        >
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={{ flex: 1 }}>
                                    <LBText allowFontScaling={true} numberOfLines={1}>{data.salutation ? (Global.getEnumLabel('Leads', 'salutationtype', data.salutation) + ' ') : ''}{data.fullname}{data?.mobile ? ` - ${data.mobile}` : ''}</LBText>
                                </View>
                                <TouchableOpacity style={[styles.btnStar]} onPress={() => { toggleFavorite(data, index) }}>
                                    <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data?.starred === '0' || !data?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                </TouchableOpacity>
                            </View>
                            <View
                                style={{ flexDirection: 'row' }}
                            >
                                <View
                                    style={[styles.lineItem, { flex: 1 }]}
                                >
                                    <Icon name={getIconModule('Accounts')} />

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1}>{data.company}</NText>
                                    </View>
                                </View>
                                <SpaceHS />
                                {
                                    (data.leadstatus != '' && data.leadstatus != null && data.leadstatus != undefined) ? (
                                        <View
                                            style={[styles.lineItem, { justifyContent: 'flex-end' }]}
                                        >
                                            <NText allowFontScaling={true} style={{ textAlign: 'right' }} numberOfLines={1} color={Global.getEnumColor('Leads', 'leadstatus', data.leadstatus)}>
                                                {Global.getEnumLabel('Leads', 'leadstatus', data.leadstatus)}
                                            </NText>
                                        </View>
                                    )
                                        : null
                                }
                            </View>
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={styles.ownerContent}>
                                    <View style={styles.avatarContent}>
                                        <Image
                                            source={{ uri: Global.getImageUrl(data?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.smownerid).avatar) }}
                                            resizeMode='cover'
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? (Global.getAssignedOwnersName(data.assigned_owners) || '') : ''}</NText>
                                    </View>
                                </View>
                                <View style={styles.time}>
                                    <SText allowFontScaling={true} color={Colors.black.black2}>{data?.createdtime ? Global.formatDate(data.createdtime) : ''}</SText>
                                </View>
                            </View>
                        </ItemListViewContent>
                    </View>
                )
                break;

            case 'Contacts':
                return (
                    <View>

                        <ItemListViewContent
                        >
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={{ flex: 1 }}>
                                    <LBText allowFontScaling={true} numberOfLines={1}>{data.salutation ? (Global.getEnumLabel('Contacts', 'salutationtype', data.salutation) + ' ') : ''}{data.fullname}{data?.mobile ? ` - ${data.mobile}` : ''}</LBText>
                                </View>
                                <TouchableOpacity style={[styles.btnStar]} onPress={() => { toggleFavorite(data, index) }}>
                                    <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data?.starred === '0' || !data?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <Icon name={getIconModule('Accounts')} />

                                <SpaceHS />
                                <View style={{ flex: 1 }}>
                                    <NText allowFontScaling={true} numberOfLines={1}>{data.accountname}</NText>
                                </View>
                            </View>

                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={styles.ownerContent}>
                                    <View style={styles.avatarContent}>
                                        <Image
                                            source={{ uri: Global.getImageUrl(data?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.smownerid).avatar) }} resizeMode='stretch'
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                                    </View>
                                </View>
                                <View style={styles.time}>
                                    <SText allowFontScaling={true} color={Colors.black.black2}>{data?.createdtime ? moment(data.createdtime).format('DD-MM-YYYY') : ''}</SText>
                                </View>
                            </View>
                        </ItemListViewContent>
                    </View>
                )
                break;

            case 'HelpDesk':
                return (
                    <View>
                        <ItemListViewContent
                        >
                            <View
                                style={[styles.lineItem]}
                            >
                                <View style={{ flex: 1 }}>
                                    <LBText allowFontScaling={true} numberOfLines={1}>{data.title}</LBText>
                                </View>
                                <TouchableOpacity style={[styles.btnStar]} onPress={() => { toggleFavorite(data, index) }}>
                                    <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data?.starred === '0' || !data?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                                </TouchableOpacity>
                            </View>

                            {
                                (data.status != '' && data.status != null && data.status != undefined) ? (
                                    <View
                                        style={[styles.lineItem]}
                                    >
                                        <Icon name={getIcon('Status')} />

                                        <SpaceHS />
                                        <View style={{ flex: 1 }}>
                                            <NText allowFontScaling={true} numberOfLines={1} color={Global.getEnumColor('HelpDesk', 'ticketstatus', data.status)}>
                                                {Global.getEnumLabel('HelpDesk', 'ticketstatus', data?.status)}
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
                                            source={{ uri: Global.getImageUrl(data?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.smownerid).avatar) }} resizeMode='stretch'
                                            style={styles.avatar}
                                        />
                                    </View>

                                    <SpaceHS />
                                    <View style={{ flex: 1 }}>
                                        <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? (data.assigned_owners[0]?.name || '') : ''}</NText>
                                    </View>
                                </View>
                                <View style={styles.time}>
                                    <SText allowFontScaling={true} color={Colors.black.black2}>{data?.createdtime ? Global.formatDate(data.createdtime) : ''}</SText>
                                </View>
                            </View>
                        </ItemListViewContent>
                    </View>
                )
                break;

            default:
                break;
        }
    }

    const onRefresh = () => {
        getRelatedList('REFRESH', requestAction);
    }

    const handleLoadMore = () => {
        if (paging && paging.next_offset) {
            getRelatedList('LOAD_MORE', requestAction);
        }
    }

    const getRelatedList = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', requestAction) => {
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
                return;
            }
        }

        let params = {
            RequestAction: requestAction,
            Params: {
                keyword: keyword,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        Global.callAPI(null, params, dataResponse => {
            if (parseInt(dataResponse.success) === 1) {
                let list = dataResponse.entry_list;
                if (loadType == 'LOAD_MORE') {
                    list = data.concat(list);
                }
                setData(list);
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                setPaging(dataResponse.paging);
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

    return (
        <>
            <LargeHeader
            >
                <Header
                    noBorder
                >
                    <Left style={{ paddingLeft: 12 }}>
                        <Icon name={iconTitle} style={{ fontSize: 18 }} />
                        <SpaceHS />
                        <Title allowFontScaling={true} >{getLabel('common.title_select')} {getParentName(props.module)}</Title>
                    </Left>
                    <Right>
                        <TouchableHighlight
                            activeOpacity={.2}
                            underlayColor={Colors.white.white2}
                            style={
                                styles.btnClose
                            }
                            onPress={() => {
                                if (route?.params?.prevScene || route?.params?.preScreen) {
                                    navigation.navigate(route?.params?.prevScene || route?.params?.preScreen, {
                                        prevScene: route?.params?.parentFrom,
                                        indexSelected: route?.params?.indexSelected,
                                        onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                        onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                                        onCreateNew: route?.params?.onCreateNew
                                    });
                                } else {
                                    navigation.goBack();
                                }

                            }}
                        >
                            <Icon name='times' style={{ fontSize: 20 }} />
                        </TouchableHighlight>
                    </Right>
                </Header>
                <Header noBorder>
                    <SearchInput
                        autoFocus={true}
                        value={keyword}
                        onValueChange={(value) => setKeyword(value)}
                        isClearText={true}
                        onClearText={() => setKeyword('')}
                        placeholder={getLabel('common.label_placeholder_search')}
                        onSearch={() => {
                            getRelatedList('FIRST_LOAD', requestAction)
                        }}
                    />
                </Header>
            </LargeHeader>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <LoadingList loading={firstLoading} />
                <FlatList
                    onScroll={(e) => {
                        Keyboard.dismiss();
                    }}
                    keyboardShouldPersistTaps='always'
                    nestedScrollEnabled={true}
                    keyboardDismissMode={'interactive'}
                    style={{ maxHeight: (isIphoneX ? (heightDevice - 34) : heightDevice) - HEADER_HEIGHT }}
                    data={[...data]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        return (
                            <TransitionView transitionDuration={200}>
                                <TouchableOpacity
                                    activeOpacity={.3}
                                    onPress={() => {
                                        if (route?.params?.prevScene || route?.params?.preScreen) {
                                            navigation.navigate(route?.params?.prevScene || route?.params?.preScreen, {
                                                data: item,
                                                fieldRelated: route?.params?.fieldRelated,
                                                prevScene: 'RelatedList',
                                                parentScene: route?.params?.parentFrom,
                                                moduleRelated: route?.params?.module,
                                                indexSelected: route?.params?.indexSelected,
                                                onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                                                onCreateNew: route?.params?.onCreateNew
                                            })
                                        } else {
                                            navigation.setParams({
                                                data: item,
                                                fieldRelated: route?.params?.fieldRelated,
                                                prevScene: 'RelatedList',
                                                moduleRelated: route?.params?.module,
                                                parentScene: route?.params?.parentFrom,
                                                indexSelected: route?.params?.indexSelected,
                                                onUpdateItemSelected: route?.params?.onUpdateItemSelected,
                                                onDeleteItemSelected: route?.params?.onDeleteItemSelected,
                                                onCreateNew: route?.params?.onCreateNew
                                            });

                                            navigation.goBack();
                                        }

                                    }}
                                >
                                    {renderItem(item, index)}
                                </TouchableOpacity>
                            </TransitionView>
                        )
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    onEndReachedThreshold={0.4}
                    onEndReached={handleLoadMore}
                    ListFooterComponent={<LoadingMoreList loading={loadMore} />}
                />
                <SpaceL />
            </View>
            <IndicatorLoading loading={isLoading} />
        </>
    )
}

const styles = StyleSheet.create({
    btnClose: {
        width: 36,
        height: 36,
        borderRadius: 36 / 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',

    },
    lineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        paddingHorizontal: 12
    },
    btnStar: {
        flex: 1,
        maxWidth: 28,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStar: {
        fontSize: 20,
        color: Colors.black.black1
    },
    ownerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarContent: {
        backgroundColor: Colors.white.white2,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25 / 2,
        marginLeft: -5
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 25 / 2,
        resizeMode: 'cover'
    },
    time: {
        flex: 1,
        maxWidth: 100,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
})
