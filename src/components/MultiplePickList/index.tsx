/**
 * @file    : MultiplePickList/index.js
 * @author  : Manh Le, Khiem Ha
 * @date    : 2022-01-26
 * @purpose : Create UI select multiple item picklist
*/

import { Input, Item } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleProp, TouchableHighlight } from 'react-native';
import Toast from 'react-native-root-toast';
import SortableList from 'react-native-sortable-list';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { getIcon, getLabel } from '../../utils/commons/commons';
import { BoxButton, ListItem, NText } from '../CustomComponentView';
import { LoadingMoreList } from '../Loading';
import styles from './styles';

// Define props-type for component MultiplePickList
type MultiplePickListProps = {
    selectedList: Array<any>,
    order: Array<number>,
    title: string,
    singleSelected?: boolean,
    required: number,
    type?: 'assigned_user' | 'user_feed' | 'normal' | 'invite_user' | 'invite_contact',
    updateOrder?: (order: Array<number>) => void,
    updateSelectedList?: (selectedList: Array<object>) => void,
    style?: StyleProp<Object>
}

export default function MultiplePickList({
    style = {},
    selectedList = [],
    order = [0],
    title = '',
    required = 0,
    singleSelected = false,
    updateOrder = undefined,
    updateSelectedList = undefined,
    type = 'assigned_user'
}: MultiplePickListProps) {

    const [keyword, setKeyword] = useState<string>('');
    const [userList, setUserList] = useState([]);
    const [paging, setPaging] = useState<any>({});
    const [resultsSearch, setResultSearch] = useState([]);
    const [isShowResultSearch, setShowResultSearch] = useState(false);
    const [isValid, setValid] = useState(true);
    const [list, setList] = useState([selectedList]);
    const [isShowInputSearch, setShowInputSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        if (singleSelected && selectedList.length == 0) {
            setShowInputSearch(true);
        }
        else if (singleSelected && selectedList.length > 0) {
            setShowInputSearch(false);
        }

        return () => { }
    }, [selectedList]);

    const checkInvalid = React.useCallback((ownerSelectedList: Array<any>, ownerOrder: Array<any>) => {
        let assignedOwners = Global.sortAssignedUserList(ownerSelectedList || [], ownerOrder || []);

        if (assignedOwners == '') {
            setValid(false);
            return;
        }
        else {
            let tempAssignedOwners = [];

            ownerSelectedList.map((item) => {
                tempAssignedOwners.push(item.id?.split(':')[0]);
            })

            if (assignedOwners.split(':')[0] == 'Groups' && (tempAssignedOwners.indexOf('Users') != -1)) {
                setValid(false);
                return;
            }
            else {
                setValid(true);
                return;
            }
        }
    }, [isValid]);

    const searchChange = React.useCallback((value: string) => {
        let results = [];
        setKeyword(value);

        if (value.length < Global?.validationConfig?.autocomplete_min_length) {
            setUserList([]);
        }
        else {
            let filterUserList = [];
            let filterGroupList = [];

            let userListTemp = Object.keys(Global.userList).map(function (key) {
                return { ...Global.userList[key] };
            });

            let groupListTemp = Object.keys(Global.groupList).map(function (key) {
                return { ...Global.groupList[key] };
            });

            let regex = value.unUnicode().trim();

            filterUserList = userListTemp.filter((user) => user.full_name.unUnicodeMatch(regex));

            filterUserList.map((item) => {
                item['email'] = item.email1;
                item['name'] = item.full_name;
                item['type'] = 'user';
            });

            if (!singleSelected) {
                filterGroupList = groupListTemp.filter((group) => group.name.unUnicodeMatch(regex));
                filterGroupList?.map((item) => {
                    item['email'] = '';
                    item['type'] = 'group';
                });
            }

            results = (results.concat(filterUserList)).concat(filterGroupList);

            let tmpResults = results;

            if (selectedList.length > 0) {
                selectedList.map((item) => {
                    results.map((result, index) => {
                        if (type == 'assigned_user') {
                            if (result.id == item?.id?.split(':')[1]) {
                                tmpResults.splice(index, 1);
                            }
                        }
                        else {
                            if (result.id == item?.id) {
                                tmpResults.splice(index, 1);
                            }
                        }
                    })
                });
            }

            setUserList(tmpResults);

            if (tmpResults.length > 0) {
                setShowResultSearch(true);
            }
        }
    }, [keyword, userList, isShowResultSearch, selectedList]);

    const searchContact = (keyword: string, loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH') => {

        if (loadType == 'FIRST_LOAD') {
            setLoading(true);
        }
        else if (loadType == 'REFRESH') {
            setRefreshing(true);
        }
        else {
            setLoadingMore(true);
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
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let list = data.entry_list;

                if (loadType == 'LOAD_MORE') {
                    list = resultsSearch.concat(list);
                }

                let tmpResults = [...list];

                if (selectedList.length > 0) {
                    selectedList.map((item) => {
                        list.map((result, index) => {
                            if (result.contactid == item.contactid || result.contactid == item.id) {
                                tmpResults.splice(index, 1);
                            }
                        })
                    });
                }

                setResultSearch(tmpResults);
                setPaging(data.paging);
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);

                if (list.length > 0) {
                    setShowResultSearch(true);
                }
                else {
                    Toast.show(
                        getLabel('common.msg_no_results_found'),
                        {
                            backgroundColor: Colors.functional.dangerous
                        }
                    );
                }
            }
            else {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);

                Toast.show(
                    getLabel('common.msg_no_results_found'),
                    {
                        backgroundColor: Colors.functional.dangerous
                    }
                );
            }
        },
            (error) => {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
                Toast.show(
                    getLabel('common.msg_connection_error'),
                    {
                        backgroundColor: Colors.functional.dangerous
                    }
                );
                console.log('MultiplePickList:searchContact:Error: ', error);
            })
    }

    const _onChangeOrder = React.useCallback((nextOrder: Array<number>) => {
        if (type == 'assigned_user') {
            checkInvalid(list, nextOrder);
        }

        updateOrder?.(nextOrder);
    }, [list]);

    const removeItem = (item: object, index: number) => {
        var tmpSelectedList = [...selectedList];
        var tempOrder = [];
        var orders = [...order];

        //Delete item from selected list
        tmpSelectedList.splice(orders[index], 1);
        setList(tmpSelectedList);
        updateSelectedList?.(tmpSelectedList);

        //Change value order array after delete item
        orders.map((itemOrder: number, i) => {
            if (itemOrder > order[index]) {
                tempOrder.push(itemOrder - 1);
            }
            else {
                tempOrder.push(itemOrder);
            }
        });

        tempOrder.splice(index, 1);
        orders = tempOrder;

        updateOrder?.(orders);

        if (type == 'assigned_user') {
            checkInvalid(tmpSelectedList, orders);
        }
    }

    const addNewItem = (newItem: any) => {
        let orders = [...order];

        if (type == 'assigned_user') {
            newItem.id = (newItem?.type == 'user') ? ('Users:' + newItem.id) : ('Groups:' + newItem.id);
            checkInvalid([...selectedList, newItem], [...orders, selectedList.length]);
        }

        orders.push(selectedList.length);

        setKeyword('');
        setShowResultSearch(false);

        if (type == 'invite_contact') {
            setResultSearch([]);
        }
        else {
            setUserList([]);
        }

        updateOrder?.(orders);

        setList([...selectedList, newItem]);
        updateSelectedList?.([...selectedList, newItem]);
    }

    const _renderRow = ({ data, active, index }) => {
        return (
            <Box
                key={index.toString()}
                flexDirection='row'
                alignItems={'center'}
                borderRadius={4}
                style={{
                    backgroundColor: index === 0 && type == 'assigned_user' ? '#eaf4fa' : '#fff',
                    marginBottom: 2
                }}
            >
                <TouchableHighlight
                    underlayColor={Colors.white.white3}
                    activeOpacity={.3}
                    style={{
                        width: 30,
                        borderRadius: 30 / 2,
                        height: 30,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => { removeItem(data, index) }}
                >
                    <Icon
                        name='times'
                        color={Colors.functional.primary}
                    />
                </TouchableHighlight>

                <NText
                    allowFontScaling={true}
                    color={Colors.functional.primary}
                    numberOfLines={1}
                > {data?.name || data?.fullname} {data?.email ? `(${data?.email})` : ''}
                </NText>
            </Box>
        );
    }

    return (
        <Box
            paddingHorizontal={'l'}
            paddingVertical={'m'}
            style={style}
        >
            <NText
                allowFontScaling={true}
                color={!isValid ? Colors.functional.dangerous : Colors.black.black2}
            >
                {title} <NText allowFontScaling={true} color={Colors.functional.dangerous}>{required == 1 ? '*' : ''}</NText>
            </NText>

            {
                (type == 'assigned_user' || type == 'invite_user' || type == 'invite_contact') && (
                    <Box
                        paddingHorizontal={'l'}
                        paddingVertical={'m'}
                    >
                        <SortableList
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                height: (selectedList.length * 35)
                            }}
                            data={selectedList}
                            order={order}
                            onActivateRow={(key) => console.log('MultiplePickList:onActivateRow: ', key)}
                            onReleaseRow={(key, currentOrder) => console.log('MultiplePickList:onReleaseRow: ', key, currentOrder)}
                            onChangeOrder={_onChangeOrder}
                            renderRow={(row) => _renderRow({ active: row.active, data: row.data, index: row.index })}
                            sortingEnabled={type == 'assigned_user'}
                            keyboardShouldPersistTaps='always'
                            scrollEnabled={!singleSelected}
                        />
                    </Box>
                )
            }

            <Item
                style={{
                    borderBottomColor: !isValid ? Colors.functional.dangerous : Colors.black.black4
                }}
            >
                {
                    !singleSelected ? (
                        <Input
                            placeholder={getLabel('globalSearch.keyword_invalid_min_height_msg', { minLength: Global?.validationConfig?.autocomplete_min_length })}
                            placeholderTextColor={Colors.black.black4}
                            style={{
                                fontSize: 14
                            }}
                            value={keyword}
                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            onChangeText={(value) => {
                                if (type == 'invite_contact') {
                                    setKeyword(value);
                                    setShowResultSearch(false);
                                }
                                else {
                                    searchChange(value);
                                }
                            }}
                            clearButtonMode='while-editing'
                        />
                    )
                        : isShowInputSearch ? (
                            <Input
                                placeholder={getLabel('globalSearch.keyword_invalid_min_height_msg', { minLength: Global?.validationConfig?.autocomplete_min_length })}
                                placeholderTextColor={Colors.black.black4}
                                style={{
                                    fontSize: 14
                                }}
                                value={keyword}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                onChangeText={(value) => {
                                    if (type == 'invite_contact') {
                                        setKeyword(value);
                                        setShowResultSearch(false);
                                    }
                                    else {
                                        searchChange(value);
                                    }
                                }}
                                clearButtonMode='while-editing'
                            />
                        )
                            : null
                }

                {
                    type == 'invite_contact' && (
                        <BoxButton
                            alignItems='center'
                            justifyContent='center'
                            borderRadius={4}
                            border={.7}
                            style={{
                                ...styles.btnSearch
                            }}
                            onPress={() => {
                                if (keyword.trim()?.length >= (Global?.validationConfig?.autocomplete_min_length || 3)) {
                                    searchContact(keyword, 'FIRST_LOAD');
                                }
                                else {
                                    Toast.show(
                                        getLabel('globalSearch.keyword_invalid_min_height_msg', { minLength: Global?.validationConfig?.autocomplete_min_length }),
                                        {
                                            backgroundColor: Colors.functional.dangerous,
                                        }
                                    );
                                }
                            }}
                        >
                            {
                                loading ? (
                                    <ActivityIndicator
                                        size={'small'}
                                    />
                                )
                                    : (
                                        <Icon
                                            name={getIcon('Search')}
                                            style={{
                                                fontSize: 14
                                            }}
                                        />
                                    )
                            }
                        </BoxButton>
                    )
                }
            </Item>

            {
                isShowResultSearch ?
                    (
                        <>
                            <Box
                                borderRadius={6}
                                paddingVertical={'m'}
                                backgroundColor='white1'
                                style={{
                                    ...styles.shadow
                                }}
                            >
                                <Box
                                    paddingHorizontal='m'
                                    style={{
                                        ...styles.fullWidth
                                    }}
                                >
                                    {
                                        type != 'invite_contact' ? (
                                            <FlatList
                                                data={userList || []}
                                                keyExtractor={(item, index) => index.toString()}
                                                keyboardShouldPersistTaps='always'
                                                nestedScrollEnabled={true}
                                                style={{
                                                    ...styles.lstView
                                                }}
                                                renderItem={({ item, index }) => {
                                                    return (
                                                        <ListItem
                                                            style={{
                                                                paddingHorizontal: 8
                                                            }}
                                                            noArrowRight={true}
                                                            thumbnailUri={Global.getImageUrl(Global.getUser(item.id)?.avatar)}
                                                            title={item?.name || ''}
                                                            subTitle={item?.email || ''}
                                                            onPress={() => { addNewItem(item); }}
                                                        />
                                                    );
                                                }}

                                            />
                                        ) : (
                                            <FlatList
                                                keyboardShouldPersistTaps='always'
                                                nestedScrollEnabled={true}
                                                style={{
                                                    ...styles.lstView
                                                }}
                                                data={resultsSearch || []}
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item, index }) => {
                                                    return (
                                                        <ListItem
                                                            style={{
                                                                paddingHorizontal: 8
                                                            }}
                                                            noArrowRight={true}
                                                            thumbnailUri={Global.getImageUrl(Global.getUser(item.id)?.avatar)}
                                                            title={item?.fullname || ''}
                                                            subTitle={item?.email || ''}
                                                            onPress={() => { addNewItem(item); }}
                                                        />
                                                    );
                                                }}
                                                onScroll={(e) => setScrolled(true)}
                                                onEndReachedThreshold={0.1}
                                                onEndReached={() => {
                                                    if (scrolled && paging && paging.next_offset) {
                                                        searchContact(keyword, 'LOAD_MORE')
                                                    }
                                                }}
                                                ListFooterComponent={<LoadingMoreList loading={loadingMore} />}
                                            />
                                        )
                                    }
                                </Box>
                            </Box>
                        </>

                    )
                    : null
            }
        </Box>
    )
}