import React, { useEffect } from 'react';
import { Modal, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Global from '../../Global';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box, Text } from '../../themes/themes';
import { getLabel, heightDevice, isIphoneX, widthDevice } from '../../utils/commons/commons';
import { SpaceS } from '../CustomComponentView';

type PickerType = 'date' | 'time';

type RNDatePickerProps = {
    style?: ViewStyle,
    contentStyle?: ViewStyle,
    currentDate: Date,
    maxDate?: Date,
    minDate?: Date,
    selectedDate?: (date: Date) => void,
    dateFormat?: string,
    timeFormat?: string,
    iconLeft?: string,
    iconLeftStyle?: TextStyle,
    contentIconLeftStyle?: ViewStyle,
    iconRightStyle?: TextStyle,
    contentIconRightStyle?: ViewStyle,
    iconRight?: string,
    imageLeft?: string,
    imageRight?: string,
    imageUriLeft?: string,
    imageUriRight?: string,
    title: string,
    hideTitle?: boolean,
    required: number,
    type?: PickerType,
    isSubmitted?: boolean
}

const RNDatePicker = ({
    style,
    contentStyle = undefined,
    currentDate = null,
    maxDate = undefined,
    minDate = new Date(1930, 12, 30),
    selectedDate = undefined,
    dateFormat = 'DD-MM-YYYY',
    timeFormat = 'HH:mm',
    iconLeft = undefined,
    iconLeftStyle = undefined,
    contentIconLeftStyle = undefined,
    iconRight = undefined,
    iconRightStyle = undefined,
    contentIconRightStyle = undefined,
    imageLeft = undefined,
    imageRight = undefined,
    imageUriLeft = undefined,
    imageUriRight = undefined,
    title = undefined,
    hideTitle = false,
    required = 0,
    type = 'date',
    isSubmitted = false
}: RNDatePickerProps) => {

    const [date, setDate] = React.useState(currentDate)
    const [dateTemp, setDateTemp] = React.useState(currentDate)
    const [isOpen, setOpen] = React.useState(false)

    const showModal = () => {
        setOpen(true);
        setDateTemp(date);
    };
    const hideModal = () => {
        setOpen(false);
        setDateTemp(date);
    };
    const hasIcon = iconLeft || imageLeft || imageUriLeft || iconRight || imageRight || imageUriRight;

    useEffect(() => {
        setDate(currentDate);
        setDateTemp(currentDate);
    }, [currentDate])

    return (
        <Box
            flexDirection='column'
            flex={1}
        >
            {
                !hideTitle ?
                    (
                        <Text  allowFontScaling={true}  color={isSubmitted && required == 1 && !currentDate ? 'dangerous' : 'black2'} fontSize={13}>{title} {required == 1 ? <Text  allowFontScaling={true}  color='dangerous'>*</Text> : <></>}</Text>
                    )
                    : null
            }
            <Box
                minHeight={44}

                justifyContent='flex-end'
                backgroundColor='white1'
                borderBottomColor={isSubmitted && required == 1 && !currentDate ? 'dangerous' :'black3'}
                borderBottomWidth={StyleSheet.hairlineWidth}
                style={style}
            >
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
                                                onPress={showModal}
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
                                    <Text allowFontScaling={true} >{type === 'date' ? Global.formatDate(date) : Global.formatTime(date)}</Text>
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
                                                onPress={showModal}
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
                                onPress={showModal}
                            >
                                <Text  allowFontScaling={true} >{type === 'date' ? Global.formatDate(currentDate) : Global.formatTime(date)}</Text>
                            </TouchableOpacity>
                        )
                }


            </Box >

            <Modal
                visible={isOpen}
                transparent={true}
            >
                <Box
                    flex={1}
                    alignItems='center'
                    justifyContent='flex-end'
                    width={widthDevice}
                    height={heightDevice}
                >
                    <Box
                        flex={1}
                        width={widthDevice}
                        backgroundColor='black1'
                        opacity={.3}
                    >

                    </Box>

                    <Box
                        flex={1}
                        width={widthDevice}
                        maxHeight={300}
                        backgroundColor='white4'
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Box
                            backgroundColor='white2'
                            maxHeight={40}
                            flex={1}
                            width={widthDevice}
                            borderWidth={StyleSheet.hairlineWidth}
                            borderColor='black4'
                            flexDirection='row'
                            justifyContent='space-between'
                            alignItems='center'
                            paddingHorizontal='m'
                        >
                            <TouchableOpacity
                                style={{
                                    height: 40,
                                    paddingHorizontal: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={hideModal}
                            >
                                <Text  allowFontScaling={true} 
                                    color='dangerous'
                                    fontSize={16}
                                    fontWeight='600'
                                >
                                    {getLabel('common.btn_cancel')}
                                </Text>
                            </TouchableOpacity>

                            <Text  allowFontScaling={true} 
                                fontSize={15}
                                fontWeight='500'
                            >
                                {type === 'date' ? Global.formatDate(dateTemp) : Global.formatTime(dateTemp)}
                            </Text>

                            <TouchableOpacity
                                style={{
                                    height: 40,
                                    paddingHorizontal: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={() => { hideModal(); selectedDate?.(dateTemp) }}
                            >
                                <Text  allowFontScaling={true} 
                                    color='primary'
                                    fontSize={16}
                                    fontWeight='600'
                                >
                                    {getLabel('common.btn_select')}
                                </Text>
                            </TouchableOpacity>
                        </Box>

                        <SpaceS />

                        <DatePicker
                            mode={type}
                            locale={Global.locale === 'vn_vn' ? 'vi' : 'en'}
                            maximumDate={maxDate}
                            minimumDate={minDate}
                            date={dateTemp}
                            onDateChange={setDateTemp}
                            style={{
                                flex: 1,
                            }}
                        />
                    </Box>

                    {
                        isIphoneX ?
                            (
                                <Box
                                    width={widthDevice}
                                    height={34}
                                    backgroundColor='white4'
                                />
                            )
                            : null
                    }

                </Box>

            </Modal>

        </Box>
    )
}
export default RNDatePicker;

const styles = StyleSheet.create({})
