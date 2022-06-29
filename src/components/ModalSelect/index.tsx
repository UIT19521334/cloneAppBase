/**
 * @file    : ModalSelect/index.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Create custom Modal Select Options UI
*/

// Import libraries
import { Picker as SelectPicker } from '@react-native-community/picker';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Platform, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Menu, { MenuDivider, MenuItem } from 'react-native-material-menu';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import Global from '../../Global';
// Import components
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { getLabel, widthResponse } from '../../utils/commons/commons';
import I18n from '../../utils/i18n';
import { BoxButton, NText, SpaceHS } from '../CustomComponentView';
import ModalDropdown from '../ModalDropdown';

// Define props-type
type PresentTypeModalSelect = 'dropdown' | 'menu' | 'device';

type ModalSelectProps = {
    presentType: PresentTypeModalSelect,
    flex?: StyleProp<number>,
    style?: StyleProp<ViewStyle>,
    contentStyle?: StyleProp<ViewStyle>,
    itemStyle?: StyleProp<ViewStyle>,
    title?: StyleProp<string>,
    value: StyleProp<object | string>,
    options: StyleProp<object | any>[],
    initPositionSelect?: number,
    maxWidth?: StyleProp<number | undefined>,
    keyShow: StyleProp<string>,
    keySelect: StyleProp<string>,
    keyValue: StyleProp<string>,
    required: number,
    customView: () => React.ReactElement,
    onSelected?: (item: Object | any, index: number) => void,
    isSubmitted?: StyleProp<boolean>,
    disabled?: StyleProp<boolean>
}

export default function ModalSelect({
    presentType = 'dropdown',
    flex = 0,
    style = {},
    contentStyle = {},
    title = '',
    value = null,
    options = [],
    initPositionSelect = 0,
    maxWidth = undefined,
    itemStyle = undefined,
    keyShow = 'label',
    keySelect = 'key',
    keyValue = 'label',
    required = 0,
    customView = undefined,
    onSelected = undefined,
    isSubmitted = false,
    disabled = false
}: ModalSelectProps) {

    const menu = useRef(null);
    const scrollView = useRef(null);
    const [openModalIOS, setOpenModalIOS] = useState(false);
    const [itemSelected, setItemSelected] = useState('');
    const [itemSelectedTemp, setItemSelectedTemp] = useState('');

    useEffect(() => {
        setItemSelected(options?.[initPositionSelect]?.[keySelect]);

        if (typeof value == 'object' && presentType === 'device') {
            setItemSelected(value?.key);
            setItemSelectedTemp(value?.key)
        }

        return () => { }
    }, []);

    // render UI modal style menu (menu like material style on Android)
    if (presentType === 'menu') {
        return (
            <>
                <Box
                    flex={flex}
                    style={style}
                >
                    {
                        title ?
                            (
                                <>
                                    <Text
                                        allowFontScaling={true}
                                        color='black2'
                                        variant='label'
                                    >
                                        {title} {required == 1 ? <Text allowFontScaling={true} color='dangerous'>*</Text> : null}
                                    </Text>

                                    <Box
                                        margin='s'
                                    />
                                </>
                            ) : null
                    }

                    <BoxButton
                        border={1}
                        paddingHorizontal={6}
                        borderRadius={4}
                        height={30}
                        row
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        style={[
                            {
                                width: undefined
                            },
                            contentStyle
                        ]}
                        onPress={() => {
                            menu.current.show();

                            const timeOutScrollTo = parseInt((options.length / 10).toString()) + 1

                            let wait = new Promise((resolve) => setTimeout(resolve, timeOutScrollTo * 500));  // Smaller number should work

                            wait.then(() => {
                                let index = 0;

                                if ((initPositionSelect > (options.length - 1))) {
                                    index = options.length - 1;
                                }
                                else if (initPositionSelect < 0) {
                                    index = 0;
                                }
                                else {
                                    index = initPositionSelect;
                                }

                                scrollView.current && scrollView.current.scrollToIndex({ animated: true, index })
                            });
                        }}

                    >
                        <View
                            style={{
                                maxWidth: maxWidth
                            }}
                        >
                            <NText
                                allowFontScaling={true}
                                numberOfLines={1}
                            >
                                {typeof value === 'string' ? (value || '...') : (value?.[keyShow] || '...')}
                            </NText>
                        </View>

                        <SpaceHS />

                        <FontAwesomeIcon
                            name='caret-down'
                            style={{
                                fontSize: 22,
                                color: Colors.black.black3
                            }}
                        />
                    </BoxButton>

                    <Menu
                        ref={menu}
                    >
                        <FlatList
                            style={{
                                maxHeight: 186
                            }}
                            data={options}
                            keyExtractor={(item, idx) => idx.toString()}
                            renderItem={({ item, index, separators }) => {
                                return (
                                    <>
                                        <MenuItem
                                            onPress={() => {
                                                onSelected?.(item, index)
                                                menu.current.hide();
                                            }}
                                        >
                                            {item?.[keyValue] || ''}
                                        </MenuItem>

                                        <MenuDivider />
                                    </>
                                );
                            }}
                            ref={scrollView}
                        />
                    </Menu>
                </Box>
            </>
        )
    }
    // render UI modal style dropdown
    else if (presentType === 'dropdown') {
        return (
            <>
                <Box
                    flex={flex}
                    style={style}
                >
                    {
                        title ?
                            (
                                <>
                                    <Text
                                        allowFontScaling={true}
                                        color={isSubmitted && required == 1 && ((typeof value === 'string' && !value) || (typeof value === 'object' && !value?.key)) ? 'dangerous' : 'black2'}
                                        variant='label'
                                    >
                                        {title} {required == 1 ? <Text allowFontScaling={true} color='dangerous'>*</Text> : null}
                                    </Text>

                                    <Box
                                        margin='s'
                                    />
                                </>
                            ) : null
                    }

                    <ModalDropdown
                        disabled={disabled}
                        options={options}
                        renderRow={(rowData, sectionID, rowID, highlightRow) => {
                            return (
                                <Box
                                    backgroundColor='white1'
                                    paddingVertical='l'
                                    paddingLeft='m'
                                    minWidth={120}
                                    style={itemStyle}
                                >
                                    <Text>
                                        {rowData?.[keyValue]}
                                    </Text>
                                </Box>

                            );
                        }}
                        onSelect={(id, value) => onSelected?.(value, id)}
                    >
                        <Box
                            borderWidth={1}
                            borderColor={isSubmitted && required == 1 && ((typeof value === 'string' && !value) || (typeof value === 'object' && !value?.key)) ? 'dangerous' : 'black5'}
                            paddingHorizontal={'m'}
                            borderRadius={4}
                            height={30}
                            flexDirection='row'
                            justifyContent={'space-between'}
                            backgroundColor={disabled ? 'white3' : 'white1'}
                            alignItems={'center'}
                            style={[{ width: undefined }, contentStyle]}
                        >
                            <View
                                style={{
                                    maxWidth: maxWidth
                                }}
                            >
                                <NText
                                    allowFontScaling={true}
                                    numberOfLines={1}
                                >
                                    {typeof value === 'string' ? (value || I18n.t('common.label_select', { locale: Global.locale || "vn_vn" })) : (value?.[keyShow] || I18n.t('common.label_select', { locale: Global.locale || "vn_vn" }))}
                                </NText>
                            </View>

                            <SpaceHS />

                            {
                                !disabled ? (
                                    <FontAwesomeIcon
                                        name='caret-down'
                                        style={{
                                            fontSize: 22,
                                            color: Colors.black.black3
                                        }}
                                    />
                                ) : null
                            }
                        </Box>
                    </ModalDropdown>
                </Box>
            </>
        )
    }
    // render UI modal style platform (android: dialog select, IOS: UISelect)
    else if (presentType === 'device') {
        return (
            <>
                <Box
                    flex={flex}
                    style={style}
                >
                    {
                        title ?
                            (
                                <>
                                    <Text
                                        allowFontScaling={true}
                                        color='black2'
                                        variant='label'
                                    >
                                        {title} {required == 1 ? <Text allowFontScaling={true} color='dangerous'>*</Text> : null}
                                    </Text>

                                    <Box
                                        margin='s'
                                    />
                                </>
                            ) : null
                    }

                    {
                        customView ?
                            (
                                <TouchableOpacity
                                    style={[
                                        {
                                            width: undefined
                                        },
                                        contentStyle
                                    ]}
                                    onPress={() => {
                                        setOpenModalIOS(true)
                                    }}
                                >
                                    {customView()}
                                </TouchableOpacity>
                            )
                            :
                            (
                                <BoxButton
                                    border={1}
                                    paddingHorizontal={6}
                                    borderRadius={4}
                                    height={30}
                                    row
                                    justifyContent={'space-between'}
                                    alignItems={'center'}
                                    style={[
                                        {
                                            width: undefined
                                        },
                                        contentStyle
                                    ]}
                                    onPress={() => {
                                        setOpenModalIOS(true)
                                    }}

                                >
                                    <View
                                        style={{
                                            maxWidth: maxWidth
                                        }}
                                    >
                                        <NText
                                            allowFontScaling={true}
                                            numberOfLines={1}
                                        >
                                            {typeof value === 'string' ? (value || '...') : (value?.[keyShow] || '...')}
                                        </NText>
                                    </View>

                                    <SpaceHS />

                                    <FontAwesomeIcon
                                        name='caret-down'
                                        style={{
                                            fontSize: 22,
                                            color: Colors.black.black3
                                        }}
                                    />
                                </BoxButton>
                            )
                    }

                    <Modal
                        visible={openModalIOS}
                        transparent={true}
                    >
                        <Box
                            backgroundColor='black1'
                            opacity={.2}
                            flex={1}
                        />

                        <Box
                            height={280}
                            backgroundColor='white1'
                            width={widthResponse}
                            position='absolute'
                            left={0}
                            bottom={0}
                            zIndex={10}
                            borderTopWidth={StyleSheet.hairlineWidth}
                            borderTopColor='black2'
                        >
                            <Box
                                height={40}
                                width={widthResponse}
                                backgroundColor='white3'
                                flexDirection='row'
                                alignItems='center'
                                justifyContent='space-between'
                            >
                                <TouchableOpacity
                                    style={{
                                        height: 40,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center'

                                    }}
                                    onPress={() => {
                                        setItemSelectedTemp(itemSelected);
                                        setOpenModalIOS(false);
                                    }}
                                >
                                    <Text
                                        allowFontScaling={true}
                                        color='dangerous'
                                    >
                                        {getLabel('common.btn_cancel')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        height: 40,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        setItemSelected(itemSelectedTemp);
                                        onSelected?.(itemSelectedTemp, null);
                                        setOpenModalIOS(false);
                                    }}
                                >
                                    <Text
                                        allowFontScaling={true}
                                        color='primary'
                                    >
                                        {getLabel('common.btn_save')}
                                    </Text>
                                </TouchableOpacity>
                            </Box>

                            <Box
                                margin={'l'}
                                backgroundColor={Platform.OS == 'android' ? 'white2' : 'white1'}
                                borderRadius={8}
                            >
                                <SelectPicker
                                    selectedValue={itemSelectedTemp}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setItemSelectedTemp(itemValue);
                                    }}
                                >
                                    {
                                        options && options.map((item, index) => {
                                            return (
                                                <SelectPicker.Item
                                                    label={item?.[keyValue] || ''}
                                                    value={item?.[keySelect]}
                                                    key={index}
                                                />
                                            )
                                        })
                                    }
                                </SelectPicker>
                            </Box>
                        </Box>
                    </Modal>
                </Box >
            </>
        )
    }
}