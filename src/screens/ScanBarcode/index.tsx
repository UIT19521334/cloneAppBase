/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */


import {
    BarcodeMaskWithOuterLayout,
    useBarcodeRead
} from '@nartc/react-native-barcode-mask/dist/react-native-barcode-mask.esm';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated, Platform, ScrollView, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Global from '../../Global';
import { maxWidthActually } from '../../softphone/SoftPhoneUI';
import { Colors } from '../../themes/colors/Colors';
import { getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import RNQRGenerator from 'rn-qr-generator';
import { check, PERMISSIONS, request, openSettings, openLimitedPhotoLibraryPicker } from 'react-native-permissions';

const useCountDown = (start: number) => {
    const [counter, setCounter] = useState(start);
    useEffect(() => {
        if (counter === 0) {
            return;
        }
        setTimeout(() => {
            setCounter(counter - 1);
        }, 1000);

        return() => {
            setCounter(0);
        };
    }, [counter]);
    return counter;
};

function Countdown({ seconds }): JSX.Element {
    const timeLeft = useCountDown(seconds);
    return <Text>{timeLeft}s</Text>;
}

const ScanBarcode = () => {
    const [barcodeReadCount, setBarcodeReadCount] = useState(0);
    const [barcodeReadAware, setBarcodeReadAware] = useState(false);
    const [firstOpenPhoto, setFirstOpenPhoto] = useState(false);
    const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
    const [showResult, setShowResult] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [resultCheckIn, setResultCheckIn] = useState<'success' | 'error' | undefined>(undefined);
    const [checkInData, setCheckInData] = useState({ attendee_name: '', errorMessage: '', event_name: '', checkin_time: '' });
    const [animTransition] = useState(new Animated.Value(0));
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [countdown, setCountdown] = useState(30);

    let timer = null;

    const {
        barcodeRead,
        onBarcodeRead,
        onBarcodeFinderLayoutChange,
    } = useBarcodeRead(
        true,
        data => data,
        processed => {
            console.log('Result scan: ', processed);
            checkQRcode(processed);
        },
    );

    const checkQRcode = (code: string) => {
        if (!barcodeReadAware) {
            setBarcodeReadAware(true);
            setShowLoading(true);
            const params = {
                RequestAction: 'CheckinCustomer',
                Params: {
                    qr_code: code
                }
            }

            Global.callAPI(null, params, data => {

                if (parseInt(data?.success || '') == 1) {
                    setResultCheckIn('success');
                    setCheckInData({
                        event_name: data?.data?.event_name || '',
                        attendee_name: data?.data?.attendee_name || '',
                        errorMessage: '',
                        checkin_time: data?.data?.checkin_time || ''
                    });

                    setTimeout(() => {
                        setShowLoading(false);
                        showMessage()
                    }, 300);
                }
                else {
                    setResultCheckIn('error');

                    let message = '';
                    switch (data?.message) {
                        case 'INVALID_QR_CODE':
                            message = getLabel('scanCode.msg_invalid_qr_code')
                            break;

                        case 'QR_CODE_ALREADY_ACTIVATED':
                            message = getLabel('scanCode.msg_qr_code_already_activited')
                            break;

                        case 'RECORD_NOT_EXIST':
                            if (['Leads', 'Contacts'].findIndex(moduleName => data?.extra_data?.record_type == moduleName) != -1) {
                                message = getLabel('scanCode.msg_invalid_customer')
                            }
                            else if (data?.extra_data?.record_type == 'CPEventManagement') {
                                message = getLabel('scanCode.msg_invalid_event')
                            }
                            else {
                                message = getLabel('scanCode.msg_invalid_registration')
                            }
                            break;

                        case 'UNKNOWN_ERROR':
                            message = getLabel('common.msg_connection_error')
                            break;

                        default:
                            message = data?.message;
                            break;
                    }

                    setCheckInData({
                        event_name: '',
                        attendee_name: '',
                        errorMessage: message,
                        checkin_time: ''
                    });

                    setTimeout(() => {
                        setShowLoading(false);
                        showMessage()
                    }, 300);
                }
            }, error => {
                console.log('Error: ', error);
                setResultCheckIn('error');

                setCheckInData({
                    event_name: '',
                    attendee_name: '',
                    errorMessage: error?.toString(),
                    checkin_time: ''
                });

                setTimeout(() => {
                    setShowLoading(false);
                    showMessage()
                }, 300);
            });
        }
    }

    const showMessage = () => {
        Vibration.vibrate([0, 500], false);
        setShowResult(true);
        Animated.timing(
            animTransition,
            {
                useNativeDriver: true,
                toValue: 1,
                duration: 200,
            }
        ).start(() => {
            setCountdown(30)
            setTimeout(() => {
                hideMessage();
            }, 30000);
        })
    }

    const hideMessage = () => {

        Animated.timing(
            animTransition,
            {
                useNativeDriver: true,
                toValue: 0,
                duration: 500,
            }
        ).start(() => {
            setShowResult(false);
            setBarcodeReadAware(false);
        });
    }

    const takePhoto = () => {
        if (!Global.checkUserAgent()) {
            ImagePicker.openCamera({
                cropping: false,
                compressImageQuality: 0.75,
                includeBase64: true
            }).then(image => {
                setShowLoading(true);
                setTimeout(() => {
                    RNQRGenerator.detect({
                        base64: image?.data
                    })
                        .then(response => {
                            const { values } = response; // Array of detected QR code values. Empty if nothing found.
                            console.log('Value qr code: ', values);
                            if (values.length > 0) {
                                checkQRcode(values?.[0])
                            }
                            else {
                                setShowLoading(false);
                                Alert.alert(
                                    getLabel('common.tab_notifications'),
                                    getLabel('scanCode.msg_not_detect_qr_code_in_image'),
                                    [
                                        {
                                            text: getLabel('common.btn_close')
                                        }
                                    ]
                                );
                            }
                        })
                        .catch(error => {
                            setShowLoading(false);
                            Alert.alert(
                                getLabel('common.tab_notifications'),
                                getLabel('scanCode.msg_not_detect_qr_code_in_image'),
                                [
                                    {
                                        text: getLabel('common.btn_close')
                                    }
                                ]
                            );
                            console.log(getLabel('scanCode.msg_not_detect_qr_code_in_image'), error)
                        });
                }, 400);

            })
                .catch((err) => {
                    setShowLoading(false);
                    Alert.alert(
                        getLabel('common.tab_notifications'),
                        getLabel('scanCode.msg_not_detect_qr_code_in_image'),
                        [
                            {
                                text: getLabel('common.btn_close')
                            }
                        ]
                    );
                    console.log('takePhoto error: ', err);
                });;
        }
        else {
            Alert.alert(
                getLabel('common.tab_notifications'),
                'Your device is not support camera!',
                [
                    {
                        text: getLabel('common.btn_close')
                    }
                ]
            );
        }
    }

    const checkPermissionAccessPhoto = (callback) => {
        if (Platform.OS == 'ios') {
            check(PERMISSIONS.IOS.PHOTO_LIBRARY)
                .then((res) => {
                    if (res != 'granted' && res != 'limited') {
                        Alert.alert(
                            getLabel('common.title_permission'),
                            getLabel('scanCode.alert_request_permission_photo_msg'),
                            [
                                {
                                    text: getLabel('common.btn_no'),
                                    style: 'cancel',
                                },
                                {
                                    text: getLabel('tools.label_open_settings'),
                                    style: 'destructive',
                                    onPress: () => {
                                        openSettings()
                                    }
                                }
                            ]
                        );
                    }
                    else if (res == 'limited') {
                        if (firstOpenPhoto) {
                            Alert.alert(
                                getLabel('scanCode.title_permission_photo'),
                                getLabel('scanCode.msg_permission_photo'),
                                [
                                    {
                                        text: getLabel('scanCode.btn_select_more'),
                                        onPress: () => {
                                            try {
                                                setTimeout(openLimitedPhotoLibraryPicker, 300);
                                            } catch (e) {
                                                console.log('openLimitedPhotoLibraryPicker', e);
                                            }
                                            callback?.();
                                        }
                                    },
                                    {
                                        text: getLabel('scanCode.btn_keep_current_selection'),
                                        onPress: () => {
                                            callback?.();
                                        }
                                    },
                                    {
                                        text: getLabel('scanCode.btn_change_permission'),
                                        onPress: () => {
                                            openSettings()
                                        }
                                    }
                                ]
                            );
                        }
                        else {
                            setFirstOpenPhoto(true);
                            callback?.();
                        }

                    }
                    else {
                        callback?.()
                    }
                })
                .catch((err) => {
                    console.log('Error: ', err);

                });
        }
        else {
            check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
                .then((res) => {
                    if (res != 'granted') {
                        Alert.alert(
                            getLabel('common.title_permission'),
                            getLabel('scanCode.alert_request_permission_photo_msg'),
                            [
                                {
                                    text: getLabel('common.btn_no'),
                                    style: 'cancel',
                                },
                                {
                                    text: getLabel('tools.label_open_settings'),
                                    style: 'destructive',
                                    onPress: () => {
                                        request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
                                            .then((response) => {
                                                if (response != 'granted') {
                                                    navigation.goBack()
                                                }
                                            })
                                    }
                                }
                            ]
                        );
                    }
                    else {
                        callback?.()
                    }
                })
                .catch((err) => {
                    console.log('Error: ', err);

                })
        }
    }

    const selectPhotoFromAlbum = () => {
        checkPermissionAccessPhoto(() => {
            ImagePicker.openPicker({
                multiple: false,
                cropping: false,
                includeBase64: true
            })
                .then(image => {
                    setShowLoading(true)
                    setTimeout(() => {
                        RNQRGenerator.detect({
                            base64: image?.data
                        })
                            .then(response => {
                                const { values } = response; // Array of detected QR code values. Empty if nothing found.
                                console.log('Value qr code: ', values);
                                if (values.length > 0) {
                                    checkQRcode(values?.[0])
                                }
                                else {
                                    setShowLoading(false);
                                    Alert.alert(
                                        getLabel('common.tab_notifications'),
                                        getLabel('scanCode.msg_not_detect_qr_code_in_image'),
                                        [
                                            {
                                                text: getLabel('common.btn_close')
                                            }
                                        ]
                                    );
                                }
                            })
                            .catch(error => {
                                setShowLoading(false);
                                Alert.alert(
                                    getLabel('common.tab_notifications'),
                                    getLabel('scanCode.msg_not_detect_qr_code_in_image'),
                                    [
                                        {
                                            text: getLabel('common.btn_close')
                                        }
                                    ]
                                );
                                console.log(getLabel('scanCode.msg_not_detect_qr_code_in_image'), error)
                            });
                    }, 400);

                })
                .catch((err) => {
                    setShowLoading(false);
                    console.log('selectPhotoFromAlbum error: ', err);
                });
        });
    }

    useEffect(() => {
        if (Platform.OS == 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then((res) => {
                    if (res == 'blocked') {
                        Alert.alert(
                            getLabel('common.tab_notifications'),
                            getLabel('scanCode.alert_request_permission_camera_msg'),
                            [
                                {
                                    text: getLabel('common.btn_no'),
                                    style: 'cancel',
                                    onPress: () => {
                                        navigation.goBack()
                                    }
                                },
                                {
                                    text: getLabel('tools.label_open_settings'),
                                    style: 'destructive',
                                    onPress: () => {
                                        openSettings()
                                    }
                                }
                            ]
                        );
                    }
                    else if (res == 'denied') {
                        request(PERMISSIONS.IOS.CAMERA)
                            .then((response) => {
                                if (response != 'granted') {
                                    navigation.goBack()
                                }
                            })
                    }
                })
                .catch((error) => {
                    console.log('Error: ', error);
                });
        }
        else {
            check(PERMISSIONS.ANDROID.CAMERA)
                .then((res) => {
                    if (res == 'blocked' || res == 'denied') {
                        Alert.alert(
                            getLabel('common.tab_notifications'),
                            getLabel('scanCode.alert_request_permission_camera_msg'),
                            [
                                {
                                    text: getLabel('common.btn_no'),
                                    style: 'cancel',
                                    onPress: () => {
                                        navigation.goBack()
                                    }
                                },
                                {
                                    text: getLabel('tools.label_open_settings'),
                                    style: 'destructive',
                                    onPress: () => {
                                        request(PERMISSIONS.ANDROID.CAMERA)
                                            .then((response) => {
                                                if (response != 'granted') {
                                                    navigation.goBack()
                                                }
                                            });
                                    }
                                }
                            ]
                        )

                    }
                })
                .catch((error) => {
                    console.log('Error: ', error);
                });
        }

        return () => {
            
        };
    }, []);

    return (
        <>
            <StatusBar barStyle='light-content' />
            <SafeAreaView
                edges={['left', 'right']}
                style={{
                    ...styles.container
                }}>
                <RNCamera
                    androidCameraPermissionOptions={{
                        title: 'permissionCamera',
                        message: 'permissionCameraMessage',
                        buttonPositive: 'ok',
                        buttonNegative: 'cancel',
                    }}
                    style={styles.scanner}
                    type={RNCamera.Constants.Type.back}
                    flashMode={flashMode}
                    barCodeTypes={[
                        RNCamera.Constants.BarCodeType.code128,
                        RNCamera.Constants.BarCodeType.code39,
                        RNCamera.Constants.BarCodeType.code39mod43,
                        RNCamera.Constants.BarCodeType.qr
                    ]}
                    onBarCodeRead={(e) => {
                        console.log('>>>>>>>>>>>onBarCodeRead:', e);
                        if (Platform.OS == 'android') {
                            checkQRcode(e.data);
                        } 
                        else {
                            onBarcodeRead(e);    
                        }
                        
                    }}
                    captureAudio={false}>
                    <BarcodeMaskWithOuterLayout
                        maskOpacity={0.5}
                        width={widthDevice * .8}
                        height={widthDevice * .8}
                        edgeRadius={10}
                        edgeBorderWidth={4}
                        edgeWidth={25}
                        edgeHeight={25}
                        animationDuration={2000}
                        animatedLineThickness={2}
                        edgeColor={Colors.white.white1}
                        backgroundColor={Colors.black.black1}
                        animatedLineColor={Colors.functional.warning}
                        onLayoutChange={onBarcodeFinderLayoutChange}
                    />
                </RNCamera>

                <View
                    style={{
                        ...styles.topFloating
                    }}
                >
                    <Text style={{
                        ...styles.buttonText,
                        textAlign: 'center'
                    }}>
                        {getLabel('scanCode.msg_reminder')}
                    </Text>
                </View>

                <View
                    style={{
                        ...styles.floatingContainer,
                        bottom: insets.bottom + (heightDevice * 0.1),
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            if (flashMode == RNCamera.Constants.FlashMode.torch) {
                                setFlashMode(RNCamera.Constants.FlashMode.off);
                            }
                            else if (flashMode == RNCamera.Constants.FlashMode.off) {
                                setFlashMode(RNCamera.Constants.FlashMode.torch)
                            }
                        }}
                        style={{
                            ...styles.floatingButton
                        }}
                    >
                        <Icon
                            name={flashMode == RNCamera.Constants.FlashMode.torch ? 'flash-off' : 'flash-on'}
                            type='MaterialIcons'
                            style={{
                                ...styles.floatingIcon
                            }}
                        />
                        <View style={{ width: 5 }} />
                        <Text
                            style={{
                                ...styles.floatingText
                            }}
                        >
                            {flashMode == RNCamera.Constants.FlashMode.torch ? getLabel('scanCode.btn_off_flash') : getLabel('scanCode.btn_open_flash')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            ...styles.floatingButton
                        }}
                        onPress={() => {
                            var options = [
                                getLabel('profile.btn_take_photo_option'),
                                getLabel('profile.btn_select_photo_from_album_option'),
                                getLabel('common.btn_cancel')
                            ];

                            var DESTRUCTIVE_INDEX = 0;
                            var CANCEL_INDEX = 2;

                            ActionSheet.showActionSheetWithOptions({
                                options: options,
                                cancelButtonIndex: CANCEL_INDEX,
                                destructiveButtonIndex: DESTRUCTIVE_INDEX,
                                tintColor: 'blue'
                            },
                                (buttonIndex) => {
                                    if (buttonIndex == 0) {
                                        takePhoto();
                                    }

                                    if (buttonIndex == 1) {
                                        selectPhotoFromAlbum()
                                    }
                                });

                        }}
                    >
                        <Icon
                            name='image-search-outline'
                            type='MaterialCommunityIcons'
                            style={{
                                ...styles.floatingIcon
                            }}
                        />
                        <View style={{ width: 5 }} />
                        <Text
                            style={{
                                ...styles.floatingText
                            }}
                        >
                            {getLabel('scanCode.btn_choose_image_qr_code')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {
                showLoading && Platform.OS == 'ios' ? (
                    <BlurView
                        style={{
                            ...styles.popupContainer,
                            zIndex: Number.MAX_VALUE * 0.8,
                        }}
                        blurType='light'
                    >

                        <View
                            style={{
                                backgroundColor: Colors.white.white1,
                                padding: widthDevice * .07,
                                borderRadius: 12,
                                maxWidth: 250
                            }}
                        >
                            <View
                                style={{
                                    ...styles.activityIndicatorView,
                                    width: undefined,
                                    height: undefined
                                }}
                            >
                                <ActivityIndicator
                                    size={'large'}
                                    color={Colors.black.black3}
                                />
                            </View>
                            <Text
                                numberOfLines={3}
                                style={styles.messagePopup}
                            >
                                {getLabel('scanCode.label_checking')}
                            </Text>
                        </View>
                    </BlurView>
                )
                    : showLoading && Platform.OS == 'ios' ? (
                        <View
                            style={{
                                ...styles.popupContainer,
                                backgroundColor: 'rgba(0, 0, 0, 0,5)',
                                zIndex: Number.MAX_VALUE * 0.8,
                            }}
                        >

                            <View
                                style={{
                                    backgroundColor: Colors.white.white1,
                                    padding: widthDevice * .07,
                                    borderRadius: 12,
                                    maxWidth: 250
                                }}
                            >
                                <View
                                    style={{
                                        ...styles.activityIndicatorView,
                                        width: undefined,
                                        height: undefined
                                    }}
                                >
                                    <ActivityIndicator
                                        size={'large'}
                                        color={Colors.black.black3}
                                    />
                                </View>
                                <Text
                                    numberOfLines={3}
                                    style={styles.messagePopup}
                                >
                                    {getLabel('scanCode.label_checking')}
                                </Text>
                            </View>
                        </View>
                    )
                        : null
            }

            {
                showResult && Platform.OS == 'ios' ? (
                    <BlurView
                        style={{
                            ...styles.popupContainer,
                        }}
                        blurType='light'
                    >

                        <Animated.View
                            style={{
                                ...styles.iconContainer,
                                transform: [
                                    {
                                        scale: animTransition.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 1]
                                        })
                                    }
                                ]
                            }}
                        >
                            <View
                                style={{
                                    ...styles.iconView,
                                    backgroundColor: resultCheckIn == 'success' ? Colors.functional.successful : Colors.functional.dangerous,
                                }}
                            >
                                <Icon
                                    name={resultCheckIn == 'success' ? 'check' : 'times'}
                                    type={resultCheckIn == 'success' ? 'FontAwesome' : 'FontAwesome'}
                                    style={{
                                        ...styles.icon
                                    }}
                                />
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    paddingTop: 16,
                                    justifyContent: 'flex-start',
                                    alignItems: 'center'
                                }}
                            >

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View>
                                        <Text
                                            style={styles.messagePopup}
                                        >
                                            {
                                                resultCheckIn == 'success'
                                                    ?
                                                    (
                                                        <Text>
                                                            {getLabel('scanCode.check_in_event_success_sub1_msg')} <Text style={styles.fontBold}>{checkInData?.attendee_name}</Text> {getLabel('scanCode.check_in_event_success_sub2_msg')} <Text style={styles.fontBold}>{checkInData?.event_name}</Text> {getLabel('scanCode.check_in_event_success_sub3_msg')} <Text style={styles.fontBold}>{checkInData?.checkin_time}</Text>.
                                                        </Text>

                                                    )

                                                    : checkInData?.errorMessage
                                            }
                                        </Text>
                                    </View>
                                </ScrollView>
                            </View>

                            <View
                                style={styles.contentFooterButton}
                            >

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        // setShowResult(false);
                                        // setBarcodeReadAware(false)
                                        hideMessage()
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...styles.buttonText
                                        }}
                                    >
                                        {getLabel('common.btn_continue')} (<Countdown seconds={countdown} />)
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </Animated.View>
                    </BlurView>
                )
                    : showResult && Platform.OS == 'android' ?
                        (
                            <View
                                style={{
                                    ...styles.popupContainer,
                                    backgroundColor: 'rgba(0, 0, 0, 0,5)',
                                    zIndex: Number.MAX_VALUE
                                }}
                            >

                                <Animated.View
                                    style={{
                                        ...styles.iconContainer,
                                        transform: [
                                            {
                                                scale: animTransition.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 1]
                                                })
                                            }
                                        ]
                                    }}
                                >
                                    <View
                                        style={{
                                            ...styles.iconView,
                                            backgroundColor: resultCheckIn == 'success' ? Colors.functional.successful : Colors.functional.dangerous,
                                        }}
                                    >
                                        <Icon
                                            name={resultCheckIn == 'success' ? 'check' : 'times'}
                                            type={resultCheckIn == 'success' ? 'FontAwesome' : 'FontAwesome'}
                                            style={{
                                                ...styles.icon
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingTop: 16,
                                            justifyContent: 'flex-start',
                                            alignItems: 'center'
                                        }}
                                    >

                                        <ScrollView
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View>
                                                <Text
                                                    style={styles.messagePopup}
                                                >
                                                    {
                                                        resultCheckIn == 'success'
                                                            ?
                                                            (
                                                                <Text>
                                                                    {getLabel('scanCode.check_in_event_success_sub1_msg')} <Text style={styles.fontBold}>{checkInData?.attendee_name}</Text> {getLabel('scanCode.check_in_event_success_sub2_msg')} <Text style={styles.fontBold}>{checkInData?.event_name}</Text> {getLabel('scanCode.check_in_event_success_sub3_msg')} <Text style={styles.fontBold}>{checkInData?.checkin_time}</Text>.
                                                                </Text>

                                                            )

                                                            : checkInData?.errorMessage
                                                    }
                                                </Text>
                                            </View>
                                        </ScrollView>
                                    </View>

                                    <View
                                        style={styles.contentFooterButton}
                                    >

                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                // setShowResult(false);
                                                // setBarcodeReadAware(false)
                                                hideMessage();
                                                // alert('onclick')
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    ...styles.buttonText
                                                }}
                                            >
                                                {getLabel('common.btn_continue')} (<Countdown seconds={countdown} />)
                                            </Text>
                                        </TouchableOpacity>

                                    </View>
                                </Animated.View>
                            </View>
                        )
                        : null
            }

        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    floatingContainer: {
        position: 'absolute',
        zIndex: Number.MAX_VALUE,
        left: 0,
        height: 50,
        width: widthDevice,
        paddingHorizontal: 12,
        flexDirection: 'row'
    },
    floatingButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingIcon: {
        color: Colors.white.white1,
        fontSize: 22
    },
    floatingText: {
        fontSize: 15,
        color: Colors.white.white1
    },
    scanner: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    fontBold: {
        fontWeight: 'bold'
    },
    messagePopup: {
        color: '#333333',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontSize: 16,
        marginTop: 6
    },
    contentFooterButton: {
        minWidth: maxWidthActually * .8 > 290 ? 290 : maxWidthActually * .8,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        backgroundColor: Colors.functional.primary,
        borderRadius: 42,
        width: maxWidthActually * .4 > 165 ? 165 : maxWidthActually * .4,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.white.white1
    },
    popupContainer: {
        position: 'absolute',
        zIndex: Number.MAX_VALUE,
        width: widthDevice,
        height: heightDevice,
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconContainer: {
        minWidth: maxWidthActually * .8 > 320 ? 320 : maxWidthActually * .8,
        maxWidth: 320,
        minHeight: maxWidthActually * .8 > 335 ? 335 : maxWidthActually * .8,
        backgroundColor: Colors.white.white1,
        borderRadius: 12,
        justifyContent: 'center',
    },
    iconContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 50,
        fontWeight: 'bold',
        color: Colors.white.white1
    },
    activityIndicatorView: {
        marginBottom: 18,
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconView: {
        alignSelf: 'center',
        marginTop: 22,
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topFloating: {
        position: 'absolute',
        left: widthDevice * 0.1,
        top: (heightDevice - (widthDevice * 0.8)) / 2 + 15,
        zIndex: Number.MAX_VALUE,
        width: widthDevice * 0.8,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ScanBarcode;