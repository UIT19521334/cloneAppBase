/**
 * @file    : DateTimePickerCustom/index.js
 * @author  : Manh Le, Khiem Ha
 * @date    : 2021-01-26
 * @purpose : custom UI of Date Picker
*/

// Import libraries
import moment from 'moment-timezone';
import React from 'react';
import { PixelRatio, Pressable, StyleSheet, TouchableHighlight } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
// Import components
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box, Text } from '../../themes/themes';
import { getIcon, getLabel } from '../../utils/commons/commons';

export default function DateTimePickerCustom({ title, contentStyle = {}, value = '', onDateChange = undefined, disabled = false, required = false, isSubmitted = false }) {
    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
    const [currentDateSelected, setCurrentDateSelected] = React.useState(moment(new Date(), Global.user?.date_format.toUpperCase()).toDate());

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        onDateChange(date)
        hideDatePicker();
    };

    React.useEffect(() => {
        if (value) {
            const selected = moment(value, Global.user?.date_format.toUpperCase()).toDate();
            setCurrentDateSelected(selected);
        }

        return () => { }
    }, [value])

    return (
        <Box
            minHeight={65}
            paddingHorizontal='l'
            style={[contentStyle]}
        >
            <Text
                allowFontScaling={true}
                color={isSubmitted && required == 1 && !value ? 'dangerous' : 'black2'}
                paddingVertical='l'
            >
                {title} <Text allowFontScaling={true} color='dangerous'>{required ? '*' : ''}</Text>
            </Text>

            <Box
                flexDirection='row'
                paddingVertical='m'
                borderBottomWidth={2 / PixelRatio.getPixelSizeForLayoutSize(1)}
                justifyContent='space-between'
                alignItems='center'
                borderBottomColor={isSubmitted && required == 1 && !value ? 'dangerous' : 'black2'}
            >
                <Pressable
                    onPress={showDatePicker}
                    disabled={disabled}
                >
                    <Text
                        allowFontScaling={true}
                        color={value ? 'black1' : 'black3'}
                    >
                        {value ? value : Global.user?.date_format?.toUpperCase()}
                    </Text>
                </Pressable>

                {
                    disabled ? null :
                        (
                            <TouchableHighlight
                                underlayColor={Colors.white.white4}
                                activeOpacity={.3}
                                style={{
                                    backgroundColor: Colors.white.white1,
                                    width: 30,
                                    height: 30,
                                    borderRadius: 30 / 2,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ...styles.shadow
                                }}
                                onPress={showDatePicker}
                            >
                                <Icon
                                    name={getIcon('Calendar')}
                                    size={16}
                                />
                            </TouchableHighlight>
                        )
                }

            </Box>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={currentDateSelected}
                headerTextIOS={title}
                confirmTextIOS={getLabel('common.btn_select')}
                cancelTextIOS={getLabel('common.btn_cancel')}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                locale={Global.locale == 'vn_vn' ? 'vi-VN' : 'es-ES'}
            />
        </Box>
    )
}


const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.14,
            }
        }),
    },
    shadow1: {
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.20,
                shadowRadius: 1.41,
            }
        }),
    }
});