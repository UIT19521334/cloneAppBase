import React, { useRef } from 'react'
import { Animated, Modal, Platform, StyleSheet, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Menu from 'react-native-material-menu';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box, Text } from '../../themes/themes';
import {
    WheelPicker
} from "react-native-wheel-picker-android";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';

const TimePicker = ({
    value = undefined,
    options = [],
    onSelected = undefined,
    style = {},
    contentStyle = undefined,
    iconLeft = undefined,
    iconLeftStyle = undefined,
    contentIconLeftStyle = undefined,
    iconRight = undefined,
    iconRightStyle = undefined,
    contentIconRightStyle = undefined,
    title = undefined,
    required = undefined,
}) => {
    const hasIcon = iconLeft || iconRight;
    const menu = useRef();
    const flatListRef = useRef(null);
    const areaInsets = useSafeAreaInsets();
    const showMenu = () => {
        // menu.current.show();
        setVisible(true)
    };

    const setInitialIndex = () => {
        if (value) {
            let hour = value.split(':')?.[0];
            let minute = value.split(':')?.[1];
            let index = hour * 2;

            if (minute >= 30) {
                index = index + 1;
            }

            return index + 1;
        }
        else {
            return 0;
        }
    }

    const hideMenu = () => {
        menu.current.hide()
    };

    const [selectedItem, setSelectedItem] = React.useState(6)
    const [visible, setVisible] = React.useState(false);

    const onItemSelected = selected => {
        setSelectedItem(selected);
    };

    const _hide = () => setVisible(false);

    const convertToStringList = (list: Array<any>) => {
        const res = list.map((item, idx) => item?.label || item?.name || item?.value || '');

        return res;
    }

    const [wheelPickerData, setWheelPickerData] = React.useState(convertToStringList(options));

    React.useEffect(() => {
        setSelectedItem(setInitialIndex())
    }, [])

    React.useEffect(() => {
        setSelectedItem(setInitialIndex())
    }, [value])

    const findIndexSelected = (itemSelect: object) => {
        let res = 0;
        
        if (itemSelect && Object.keys(itemSelect).length > 0 ) {
            const indexSelected = [...options].findIndex((item) => item.key === itemSelect.key);
            
            if (indexSelected != -1) {
                return indexSelected;
            }
        }

        return res;
    }

    return (
        <>
            <Box
                flexDirection='column'
                flex={1}
            >
                <Text allowFontScaling={true} style={{ color: Colors.black.black2, fontSize: 13 }}>{title} {required ? <Text allowFontScaling={true} style={{ color: Colors.functional.dangerous }}>*</Text> : <></>}</Text>
                <TouchableHighlight
                    activeOpacity={.3}
                    underlayColor={Colors.white.white2}
                    onPress={showMenu}
                    style={[{ minHeight: 44, justifyContent: 'flex-end', backgroundColor: Colors.white.white1, borderBottomColor: Colors.black.black3, borderBottomWidth: StyleSheet.hairlineWidth }, style]}
                >
                    <>
                        {
                            hasIcon ?
                                (
                                    <Box
                                        flexDirection='row'
                                        height={36}
                                        alignItems='flex-end'
                                        justifyContent='center'
                                        paddingHorizontal='m'
                                        style={contentStyle}
                                    >
                                        {
                                            iconLeft ?
                                                (
                                                    <TouchableOpacity
                                                        style={[
                                                            {
                                                                minWidth: 25,
                                                                height: 25,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginBottom: 3,
                                                                borderWidth: StyleSheet.hairlineWidth,
                                                                borderRadius: 4
                                                            },
                                                            contentIconLeftStyle
                                                        ]}
                                                        onPress={showMenu}
                                                    >
                                                        <Icon name={iconLeft} style={[iconLeftStyle]} size={14} />
                                                    </TouchableOpacity>
                                                )
                                                : null
                                        }
                                        <Box
                                            style={[{
                                                flex: 1,
                                                alignItems: 'flex-start',
                                                justifyContent: 'center',
                                                marginBottom: 6
                                            }
                                            ]}
                                        >
                                            <Text allowFontScaling={true} >{Global.formatTime12H(value)}</Text>
                                        </Box>

                                        {
                                            iconRight ?
                                                (
                                                    <TouchableOpacity
                                                        style={[
                                                            {
                                                                minWidth: 25,
                                                                height: 25,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginBottom: 3,
                                                                borderWidth: StyleSheet.hairlineWidth,
                                                                borderRadius: 4
                                                            },
                                                            contentIconRightStyle
                                                        ]}
                                                        onPress={showMenu}
                                                    >
                                                        <Icon name={iconRight} style={[iconRightStyle]} size={14} />
                                                    </TouchableOpacity>
                                                )
                                                : null
                                        }

                                    </Box>
                                )
                                :
                                (
                                    <TouchableOpacity
                                        style={
                                            [{
                                                flex: 1,
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-end',
                                                minHeight: 36,
                                            },
                                                contentStyle
                                            ]
                                        }
                                        onPress={showMenu}
                                    >
                                        <Text allowFontScaling={true} >{Global.formatTime12H(value)}</Text>
                                    </TouchableOpacity>
                                )
                        }
                        {/* <Menu
                            ref={menu}
                            style={{ marginTop: -18, }}
                            button={
                                <></>
                            }
                            animationDuration={300}

                        >
                            <WheelPicker
                                selectedItem={selectedItem}
                                data={wheelPickerData}
                                onItemSelected={onItemSelected}
                            /> */}
                        {/* <Divider />
                            <FlatList
                                ref={flatListRef}
                                data={options}
                                style={{ maxHeight: 400 }}
                                renderItem={({ item, index }) => {
                                    if (index == options.length - 1) {
                                        setTimeout(() => {
                                            flatListRef?.current?.scrollToIndex({ index: setInitialIndex(), animated: true, });
                                        }, 300)
                                    }

                                    return (
                                        <MenuItem
                                            key={index}
                                            style={item?.key === value ? { backgroundColor: Colors.white.white2 } : {}}
                                            onPress={() => { onSelected?.(item); hideMenu() }}>
                                            <NText allowFontScaling={true} color={item?.key === value ? Colors.functional.primary : Colors.black.black1}>{item?.label}</NText>
                                            {
                                                item?.key === value ?
                                                    (
                                                        <>
                                                            <SpaceHL />
                                                            <Icon name='check' color={Colors.functional.primary} />
                                                        </>
                                                    )
                                                    : null
                                            }

                                        </MenuItem>
                                    )
                                }}
                            /> */}
                        {/* </Menu> */}
                    </>
                </TouchableHighlight >
            </Box>

            <Modal
                visible={visible}
                transparent
            >
                <View style={{
                    width: widthDevice,
                    height: heightDevice
                }}>

                    <TouchableWithoutFeedback
                        onPress={_hide}
                        accessible={false}
                        style={{
                            flex: 1,

                        }}
                    >
                        <Box
                            style={{
                                flex: 1,
                                backgroundColor: Colors.black.black1,
                                opacity: .2,
                            }}
                        />
                    </TouchableWithoutFeedback>

                    <View style={{
                        ...styles.shadowMenuContainer,
                        paddingBottom: areaInsets.bottom + 34,
                    }}>
                        <View
                            style={{
                                height: 50,
                                backgroundColor: Colors.white.white3,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexDirection: 'row'
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 20
                                }}
                                onPress={() => {setSelectedItem(setInitialIndex()); _hide()}}
                            >
                                <Text allowFontScaling={true} fontSize={16} fontWeight='600' color='black2'>{getLabel('common.btn_cancel')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 20
                                }}
                                onPress={() => {_hide(); setSelectedItem(setInitialIndex()); onSelected?.([...options]?.[selectedItem])}}
                            >
                                <Text allowFontScaling={true} fontSize={16} color='primary'>{getLabel('common.btn_select')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingVertical: 12, justifyContent: 'center', alignItems: 'center', }}>
                            <WheelPicker
                                selectedItem={selectedItem}
                                initPosition={5}
                                data={wheelPickerData}
                                onItemSelected={onItemSelected}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    shadowMenuContainer: {
        minHeight: 0,
        backgroundColor: Colors.white.white1,
        width: widthResponse,

        // Shadow
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.94,
                shadowRadius: 2,
            },
            android: {
                elevation: 8,
            },
        }),
    },
})

export default TimePicker;