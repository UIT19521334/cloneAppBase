// Import libraries
import moment from 'moment-timezone'
import React, { useEffect, useState } from 'react'
import { BackHandler, Image, Keyboard, KeyboardAvoidingView, 
    Modal, RefreshControl, StyleSheet, TouchableHighlight, TouchableOpacity, View 
} from 'react-native'
import Toast from 'react-native-root-toast'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import { useDispatch } from 'react-redux'
// Import components
import {
    Content, Header, IconRight, ItemListViewContent, LargeHeader, 
    LBText, Left, NBText, NText, Right,
    SearchInput, SectionFilterList, SpaceHS, SpaceS, SText
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import { LoadingList, LoadingMoreList } from '../../../components/Loading'
import ModalSelect from '../../../components/ModalSelect'
import Global from '../../../Global'
import { showActionSheet } from '../../../redux/actions/actionSheet'
import { showAlert } from '../../../redux/actions/alert'
import { displayMessageError, displayMessageSuccess } from '../../../redux/actions/messagePopup'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { getIcon, getIconModule, getLabel, heightDevice, logScreenView, widthResponse } from '../../../utils/commons/commons'
import { ACTION_ALERT, PARAMS_ACTION_SHEET, PARAMS_ALERT, PARAMS_MESSAGE } from '../../../utils/Models/models'
import styles from './styles'

const OpportunityList = ({ navigation, route }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isShowRequired, setShowRequired] = useState(false);
    const [paging, setPaging] = useState({});
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_opportunities') })
    });
    const [optionsFilter, setOptionsFilter] = useState([]);
    const [opportunities, setOpportunities] = useState(
        route?.params?.opportunityList
            ? route.params.opportunityList
            : []
    );
    const [opportunitiesRelated, setOpportunitiesRelated] = useState(
        route?.params?.opportunityList
            ? route.params.opportunityList
            : []
    );
    const [actionsMore, setActionsMore] = useState([
        {
            label: getLabel('common.btn_edit'),
            icon: getIcon('Edit'),
            key: 'edit'
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
    const [actionSaleStage, setActionSaleStage] = useState(Global.getEnum('Potentials', 'sales_stage'))
    const [isShowLostReasonModal, setShowLostReasonModal] = useState(false);
    const [lostReason, setLostReason] = useState('');
    const [newSalesStage, setNewSalesStage] = useState('false');
    const [positionChangeState, setPositionChangeState] = useState(-1);
    const [opportunityChangeStage, setOpportunityChangeStage] = useState({});

    const dispatch = useDispatch()
    const [oppListFromDetail, setOppListFromDetail] = React.useState([]);
    const [oppListRelated, setOppListRelated] = React.useState([]);

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
            if (route?.params?.isFromDetailView) {
                setOppListFromDetail(route.params?.opportunityList || []);
                setOppListRelated(route.params?.opportunityList || [])
            }
            else if (!loaded) {
                if (route.params?.prevScene == 'GlobalSearch') {
                    setKeyword(route.params?.keyword || '');
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter, route.params?.keyword);
                    }, 1000);
                } else {
                loadData('FIRST_LOAD', filter, null);
                    
                }
            }
            else {
                if (route.params?.prevScene == 'GlobalSearch') {
                    setKeyword(route.params?.keyword || '')
                    setTimeout(() => {
                        loadData('FIRST_LOAD', filter, route.params?.keyword);
                    }, 500);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [navigation, loaded])

    /**
     * @function updateItemSelecte xử lý cập nhật lại thông tin record item được chọn
     * khi có bất kỳ thay đổi nào từ màn hình detail
     * */ 
    const _updateItemSelected = (indexSelected, dataChange) => {
        let oppList = [...opportunities];
        oppList[indexSelected].potentialname = dataChange?.potentialname || '';
        oppList[indexSelected].sales_stage = dataChange?.sales_stage || '';
        oppList[indexSelected].amount = dataChange?.amount || '';
        oppList[indexSelected].accountname = dataChange?.related_to_name || '';
        oppList[indexSelected].starred = dataChange?.starred || '0';
        oppList[indexSelected].assigned_owners = dataChange?.assigned_owners || '';

        setOpportunities(oppList);
    }

    /**
     * @function _onDeleteItemSelected xử lý cập nhật lại thông tin record item được chọn
     * khi đã bị xoá bởi người dùng từ màn hình detail
     * */ 
    const _onDeleteItemSelected = (indexSelected) => {
        let oppList = [...opportunities];

        oppList.splice(indexSelected, 1)

        setOpportunities(oppList);
    }

    /**
     * @function _onCreateNew xử lý cập nhật lại thông tin thêm mới record item
     * đã được tạo mới bởi người dùng từ màn hình form sau khi lưu form thành công
     * và back về màn hình list
     * */
    const _onCreateNew = (data) => {
        console.log('Data Opp create: ', data);
        const newOpp = {
            potentialid: data?.id || data?.potentialid || '',
            potentialname: data?.potentialname || '',
            sales_stage: data?.sales_stage || '',
            amount: data?.amount || '',
            accountname: data?.accountname || data?.related_to_name || '',
            starred: 0,
            createdtime: data?.createdtime || new Date(),
            assigned_owners: data?.assigned_owners || []
        }

        let oppList = [...opportunities];
        oppList.unshift(newOpp);

        setOpportunities(oppList)
    }

    /**
     * @function showActions xử lý show các quick action có trong từng module
     * lưu ý: nếu có một số action như xoá hay edit thông tin thì phải 
     * gọi hàm @function Global.getPermissionModule để kiểm tra perssion của user
    */
    const showActions = (data, indexRecord) => {
        let hasDelete = true;
        if (!Global.getPermissionModule('Potentials', 'EditView')) {
            const idxEdit = actionsMore.findIndex(action => action.key == 'edit');
            if (idxEdit != -1) {
                actionsMore.splice(idxEdit, 1);
            }
        }

        if (!Global.getPermissionModule('Potentials', 'Delete')) {
            hasDelete = false;
            const idxDelete = actionsMore.findIndex(action => action.key == 'delete');
            if (idxDelete != -1) {
                actionsMore.splice(idxDelete, 1);
            }
        }

        if (!Global.getPermissionModule('Potentials', 'CreateView')) {
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
                        logScreenView('EditOpportunity');
                        const paramsOpp = {
                            prevScene: 'OpportunityList',
                            opportunity: data,
                            indexSelected: indexRecord,
                            onUpdateItemSelected: _updateItemSelected,
                            onDeleteItemSelected: _onDeleteItemSelected
                        };

                        paramsOpp.opportunity.id = paramsOpp.opportunity.potentialid;

                        navigation.navigate('OpportunityForm', { ...paramsOpp });
                        break;
                    case 1:
                        logScreenView('DuplicateOpportunity');
                        // Duplicate
                        navigation.navigate('OpportunityForm', {
                            prevScene: 'OpportunityList',
                            opportunity: data,
                            isDuplicate: true,
                            onCreateNew: _onCreateNew
                        });
                        break;
                    case 2:
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
                                        Global.deleteRecord('Potentials', data.potentialid, data => {
                                            Toast.show(getLabel('common.msg_delete_success', { module: getLabel('opportunity.title').toLowerCase() }));
                                            Global.updateCounters();
                                            let opportunityList = [...(route.params?.isFromDetailView ? oppListRelated : opportunities)];
                                            opportunityList.splice(indexRecord, 1);
                                            setOpportunities(opportunityList);
                                            setOppListRelated(opportunityList);
                                            setLoading(false);
                                        },
                                            error => {
                                                Toast.show(getLabel('common.msg_delete_error', { module: getLabel('opportunity.title').toLowerCase() }));
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

    /**
     * @function loadData xử lý lấy dữ liệu từ server có 2 parmas:
     * @param loadTye: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH'
     * @param customView: thông tin option filter được chọn
    */
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
                return;
            }
        }

        let params = {
            RequestAction: 'GetOpportunityList',
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
                    list = opportunities.concat(list);
                }
                setOptionsFilter(data.cv_list);
                setOpportunities(list);
                setPaging(data.paging);
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                setLoaded(true);
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

    /**
     * Hàm đánh dấu yêu thích
     * @function toggleFavorite có 2 @argument {data, indexSelected}
     * @param data là thông tin record được chọn
     * @param indexSelected là vị trí của record được chọn trong danh sách
    */
    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Potentials',
                id: data.potentialid,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let opportunityList = route.params?.isFromDetailView ? oppListRelated : opportunities;
                opportunityList[indexSelected].starred = (opportunityList[indexSelected].starred == 0) ? 1 : 0;

                setOpportunities(opportunityList)
                setOppListRelated(opportunityList)
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const changeSalesStage = (opportunityChange, newStage, position) => {
        console.log('Position need change state: ', position);
        setLoading(true);
        var paramsRequest = {
            RequestAction: 'SaveOpportunity',
            Data: {
                id: opportunityChange?.potentialid,
                sales_stage: newStage,
                probability: Global.getProbabilityFromSalesStage(newStage)
            }
        }

        if (newSalesStage == 'Closed Lost') {
            paramsRequest.Data.potentiallostreason = lostReason;
        }

        Global.callAPI(null, paramsRequest, data => {
            setLoading(false);
            setLostReason('');
            setNewSalesStage('');

            setOpportunityChangeStage({});
            if (parseInt(data.success) === 1) {
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('opportunity.msg_change_sales_stage_success')
                }

                dispatch(displayMessageSuccess(paramsMessage));
                console.log('positionChangeState', positionChangeState);
                if (position || (position == 0)) {

                    if (route.params?.isFromDetailView) {
                        const opportunityDetailList = [...oppListFromDetail];
                        opportunityDetailList[position].sales_stage = newStage;
                        setOppListFromDetail(opportunityDetailList);
                    } else {
                        const opportunityList = [...opportunities];
                        opportunityList[position].sales_stage = newStage;
                        setOpportunities(opportunityList);
                    }
                    setPositionChangeState(-1)
                }
                else {
                    loadData('FIRST_LOAD', filter, null);
                    setPositionChangeState(-1)
                }
            }
            else {
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('opportunity.msg_change_sales_stage_error')
                }

                dispatch(displayMessageError(paramsMessage));
            }
        },
            error => {
                setLoading(false);
                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('common.msg_connection_error')
                }

                dispatch(displayMessageError(paramsMessage));
            });
    }

    const changeStage = (position) => {
        const opportunitiesTemp = [...opportunities];
        const oppSelected = opportunitiesTemp[position];
        const options = [...actionSaleStage];
        const indexSelected = options.findIndex((option) => option.key === oppSelected.sales_stage);
        setPositionChangeState(position);
        setOpportunityChangeStage(oppSelected);
        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('opportunity.title_change_sales_stage'),
            indexSelected: indexSelected,
            iconSelected: 'flag',
            selectedColor: Colors.functional.primary,
            backgroundSelectedColor: Colors.white.white2,
            options: options,
            onSelected: (index) => {
                const actionCancel: ACTION_ALERT = {
                    label: getLabel('common.btn_cancel'),
                    isCancel: true,
                    textStyle: { color: Colors.black.black1 },
                    isHighLight: false,
                    onPress: undefined

                }

                const actionConfirm: ACTION_ALERT = {
                    label: getLabel('common.btn_change'),
                    isCancel: false,
                    textStyle: undefined,
                    isHighLight: false,
                    onPress: () => {
                        setNewSalesStage(options[index]?.key)
                        if (options[index]?.key == 'Closed Lost') {
                            setShowLostReasonModal(true);
                        }
                        else {
                            changeSalesStage(opportunitiesTemp[position], options[index]?.key, position);
                        }
                    }
                }

                const paramAlert: PARAMS_ALERT = {
                    message: <NText allowFontScaling={true} >{getLabel('opportunity.msg_confirm_change_sales_stage')}<NBText allowFontScaling={true} >{Global.getEnumLabel('Potentials', 'sales_stage', options[index].key)}</NBText>?</NText>,
                    actions: [actionCancel, actionConfirm],
                }
                dispatch(showAlert?.(paramAlert));
            }
        }
        dispatch(showActionSheet?.(params));
    }

    const renderHiddenRow = (item, index) => {
        return (
            <View style={[styles.rowHidden]}>
                <View style={styles.actionsHidden}>
                    <View style={styles.actionHiddenContent}>
                        {
                            Global.getPermissionModule('Potentials', 'EditView') ? (
                                <TouchableHighlight
                                    style={styles.action}
                                    activeOpacity={.3}
                                    underlayColor={Colors.black.black4}
                                    onPress={() => {
                                        // rowMap[item.index] && rowMap[item.index].closeRow();

                                        changeStage(index);
                                    }}
                                >
                                    <Icon name={getIcon('Convert')} style={styles.iconAction} />

                                </TouchableHighlight>
                            )
                                : null
                        }

                    </View>
                    <View style={styles.actionHiddenContent}>
                        {
                            (!Global.getPermissionModule('Potentials', 'CreateView') &&
                                !Global.getPermissionModule('Potentials', 'EditView') &&
                                !Global.getPermissionModule('Potentials', 'Delete')) ? null :
                                (
                                    <TouchableHighlight
                                        style={styles.action}
                                        activeOpacity={.3}
                                        underlayColor={Colors.black.black4}
                                        onPress={() => { showActions(item, index); }}
                                    >
                                        <Icon name={getIcon('More')} style={styles.iconAction} />

                                    </TouchableHighlight>
                                )

                        }

                    </View>
                </View>
            </View>
        )
    }

    const renderLostReasonModal = () => {
        return (
            <Modal
                visible={isShowLostReasonModal}
                transparent={true}
                animationType='fade'
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : null}
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent'
                    }}
                >
                    <Box
                        style={{ backgroundColor: 'transparent' }}
                        flex={1}
                        alignItems='center'
                        justifyContent='center'
                    >
                        {/* Back drop */}
                        <Box
                            width={widthResponse}
                            height={heightDevice}
                            backgroundColor='black1'
                            opacity={.5}
                            position='absolute'
                            onTouchEnd={() => { Keyboard.dismiss() }}
                        />

                        {/* Content */}
                        <Box
                            width={widthResponse * 0.8}
                            backgroundColor='white1'
                            borderRadius={8}
                            marginBottom='xl'
                            style={[styles.shadow]}
                        >

                            {/* Header */}
                            <Box
                                height={40}
                                justifyContent='center'
                                paddingHorizontal='l'
                            >
                                <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{getLabel('opportunity.title_lost_reason')}</Text>
                            </Box>
                            {/* Body */}
                            <Box
                                borderWidth={StyleSheet.hairlineWidth}
                                borderColor='black4'
                            >
                                <Box
                                    height={100}
                                    marginTop='l'
                                    paddingHorizontal='l'
                                >
                                    {/* <Label style={{
                                        paddingLeft: 0,
                                        fontSize: 14,
                                        color: Colors.black.black3
                                    }}>
                                        {getLabel('opportunity.title_lost_reason')}
                                    </Label> */}
                                    <ModalSelect
                                        title={getLabel('opportunity.title_lost_reason')}
                                        options={Global.getEnum('Potentials', 'potentiallostreason')}
                                        required={true}
                                        value={
                                            lostReason ? {
                                                key: lostReason,
                                                label: Global.getEnumLabel('Potentials', 'potentiallostreason', lostReason)
                                            } : {}
                                        }
                                        onSelected={(value, index) => {
                                            setLostReason(value.key)
                                        }}
                                        isSubmitted={(!lostReason && isShowRequired)}
                                    />

                                    {/* <Input
                                        style={[
                                            {
                                                color: Colors.black.black1,
                                                borderWidth: 0.5,
                                                height: 100,
                                                borderRadius: 6,
                                                marginTop: 10,
                                                borderColor: Colors.black.black4,
                                            }
                                        ]}
                                        selectTextOnFocus={true}
                                        placeholder={getLabel('opportunity.title_lost_reason')}
                                        value={lostReason}
                                        autoCapitalize='none'
                                        multiline={true}
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                        onChangeText={(value) => {
                                            setLostReason(value)
                                        }}
                                    /> */}
                                </Box>
                                <SpaceS />
                            </Box>
                            {/* Footer */}
                            <Box
                                height={50}
                                flexDirection='row'
                            >
                                {/* Button Cancel */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomLeftRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        setShowLostReasonModal(false);
                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderRightWidth={StyleSheet.hairlineWidth}
                                        borderRightColor='black4'
                                    >
                                        <Text allowFontScaling={true} fontWeight='600'>{getLabel('common.btn_cancel')}</Text>
                                    </Box>
                                </TouchableHighlight>

                                {/* Button Save */}
                                <TouchableHighlight
                                    style={{
                                        flex: 1,
                                        borderBottomRightRadius: 8
                                    }}
                                    activeOpacity={0.3}
                                    underlayColor={Colors.white.white2}
                                    onPress={() => {
                                        if (lostReason) {
                                            setShowLostReasonModal(false);
                                            setTimeout(() => {
                                                changeSalesStage(opportunityChangeStage, newSalesStage, positionChangeState);
                                            }, 600);
                                        } else {
                                            setShowRequired(true);
                                        }

                                    }}
                                >
                                    <Box
                                        flex={1}
                                        alignItems='center'
                                        justifyContent='center'
                                        borderLeftWidth={StyleSheet.hairlineWidth}
                                        borderLeftColor='black4'
                                    >
                                        <Text allowFontScaling={true} color='primary' fontWeight='600'>{getLabel('common.btn_save')}</Text>
                                    </Box>
                                </TouchableHighlight>
                            </Box>

                        </Box>
                    </Box>
                </KeyboardAvoidingView>
            </Modal>
        )
    }

    return (
        <>
            <IndicatorLoading loading={loading} />
            <LargeHeader>
                <Header noBorder>
                    <Left style={{ minWidth: '70%' }}>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch' ? navigation.goBack() : navigation.openDrawer()}
                        >
                            <Icon name={route.params?.isFromDetailView || route.params?.prevScene == 'GlobalSearch' ? getIcon('Back') : getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
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
                            )
                        }
                    </Left>

                    <Right style={{ minWidth: '30%' }}>
                        {
                            Global.getPermissionModule('Potentials', 'CreateView') ?
                                (
                                    <>
                                        {
                                            !route.params?.isFromDetailView ? (
                                                <IconRight onPress={() => {
                                                    logScreenView('CreateOpportunity');
                                                    const params = {
                                                        prevScene: 'OpportunityList',
                                                        opportunity: { probability: 0 },
                                                        onCreateNew: _onCreateNew
                                                    }
                                                    navigation.navigate('OpportunityForm', params)
                                                }}>
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
                        placeholder={getLabel('common.label_search_placeholder', { moduleName: getLabel('common.title_opportunities') })}
                        onSearch={() => {
                            if (route.params?.isFromDetailView) {
                                Global.searchRelatedList('Potentials', oppListFromDetail, keyword, data => {
                                    setOppListRelated(data);
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
                    data={[...(route.params?.isFromDetailView ? oppListRelated : opportunities)]}
                    renderItem={(data, index) => {
                        return (
                            <SwipeRow
                                key={index}
                                disableRightSwipe={true}
                                disableLeftSwipse={false}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data.item, data.index)}

                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => {
                                        if (route?.params?.isFromDetailView) {
                                            navigation.replace('OpportunityView', {
                                                opportunity: data.item,
                                                prevScene: 'OpportunityList',
                                                dataRelated: route?.params,
                                                isViewDetailRelated: true,
                                                indexSelected: data.index,
                                                onUpdateItemSelected: _updateItemSelected,
                                                onDeleteItemSelected: _onDeleteItemSelected
                                            })
                                        }
                                        else {
                                            logScreenView('ViewDetailOpportunity');
                                            navigation.navigate('OpportunityView', {
                                                opportunity: data.item,
                                                prevScene: 'OpportunityList',
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
                                                <LBText allowFontScaling={true} numberOfLines={1}>{data.item.potentialname}</LBText>
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
                                            <View style={{ width: 20, alignItems: 'center' }}>
                                                <Icon name={getIcon('Status')} />
                                            </View>
                                            <SpaceHS />
                                            <View style={{ flex: 1 }}>
                                                <NText allowFontScaling={true} numberOfLines={1}>{Global.getEnumLabel('Potentials', 'sales_stage', data.item.sales_stage)}</NText>
                                            </View>

                                            <SText allowFontScaling={true} color={Colors.black.black2}>{Global.formatCurrency(data.item.amount)}</SText>
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
                                    setOppListRelated(oppListFromDetail || [])
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
                    onEndReachedThreshold={0.5}
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
            {renderLostReasonModal()}
        </>
    )
}

export default OpportunityList;