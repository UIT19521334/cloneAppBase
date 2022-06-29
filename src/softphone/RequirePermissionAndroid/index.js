import AsyncStorage from '@react-native-community/async-storage'
import React from 'react'
import { Animated, AppState, DeviceEventEmitter, Modal, NativeModules, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Permissions, { PERMISSIONS } from 'react-native-permissions'
import OverlayPermissionModule from 'rn-android-overlay-permission'
import { getLabel, heightDevice, isIphoneX, widthDevice } from '../../utils/commons/commons'
import notifee from '@notifee/react-native'

export default function RequirePermissionAndroid() {
    const [permissionList, setPermissionList] = React.useState([
        {
            title: getLabel('permission.label_camera'),
            description: getLabel('permission.label_camera_description'),
            onAllow: () => {
                Permissions
                    .request(PERMISSIONS.ANDROID.CAMERA)
                    .then((res) => {
                        const pers = [...permissionList];
                        if (res == 'granted') {
                            pers[0].visible = false;
                        }
                        else if (res == 'denied') {
                            pers[0].visible = true;
                        }
                        else if (res === 'blocked') {
                            pers[0].visible = true;
                            pers[0].buttonType = 'setting';
                        }
                        else if (res === 'unavailable') {
                            pers[0].visible = true;
                        }

                        setPermissionList(pers);
                    })
                    .catch((err) => {
                        console.warn('Request permission the camera error: ', err);
                    })
            },
            onSetting: () => {
                NativeModules.CheckPermissionAndroid.checkAutoStart()
            },
            visible: true,
            buttonType: 'allow'
        },
        {
            title: getLabel('permission.label_audio'),
            description: getLabel('permission.label_audio_description'),
            onAllow: () => {
                Permissions
                    .request(PERMISSIONS.ANDROID.RECORD_AUDIO)
                    .then((res) => {
                        const pers = [...permissionList];
                        if (res == 'granted') {
                            pers[1].visible = false;
                        }
                        else if (res == 'denied') {
                            pers[1].visible = true;
                        }
                        else if (res === 'blocked') {
                            pers[1].visible = true;
                            pers[1].buttonType = 'setting';
                        }
                        else if (res === 'unavailable') {
                            pers[1].visible = true;
                        }

                        setPermissionList(pers);
                    })
                    .catch((err) => {
                        console.warn('Request permission the camera error: ', err);
                    })
            },
            onSetting: () => {
                NativeModules.CheckPermissionAndroid.checkAutoStart()
            },
            visible: true,
            buttonType: 'allow'
        },
        {
            title: getLabel('permission.label_overlay'),
            description: getLabel('permission.label_overlay_description'),
            onAllow: () => { },
            onSetting: () => {
                OverlayPermissionModule.requestOverlayPermission()
            },
            visible: true,
            buttonType: 'setting'
        },
        {
            title: getLabel('permission.label_auto_start'),
            description: getLabel('permission.label_auto_start_description'),
            onAllow: () => { },
            onSetting: async () => {
                await notifee.openPowerManagerSettings()
            },
            visible: false,
            buttonType: 'setting'
        },
    ])

    const LineItem = ({ title, description, onAllow }) => (
        <View style={{ ...styles.lineItem }}>
            <Text allowFontScaling={false} style={{ ...styles.itemTitle }}>{title}</Text>
            <Text allowFontScaling={false} style={{ ...styles.itemSubTitle }}>{description}</Text>

            <TouchableOpacity style={{ ...styles.itemButton }} onPress={onAllow}>
                <Text allowFontScaling={false} style={{ ...styles.itemTextButton }}>{getLabel('permission.label_button_setting')}</Text>
            </TouchableOpacity>
        </View>
    )

    const [visible, setVisible] = React.useState(false);
    let appStateEvent = null;

    React.useEffect(() => {
        
        const eventShowPermission = DeviceEventEmitter.addListener('Android.ShowRequirePermission', () => {
            onChangeAppState('active')

            appStateEvent = AppState.addEventListener('change', onChangeAppState);

        })


        return () => {
            eventShowPermission.remove();
            appStateEvent && appStateEvent.remove();
        }
    }, []);

    const onChangeAppState = React.useCallback( async (state) => {
        if (state == 'active') {
            const permissionsTemp = [...permissionList];

            OverlayPermissionModule.isRequestOverlayPermissionGranted((status: any) => {
                if (status) {
                    permissionsTemp[2].visible = true;
                }
                else {
                    permissionsTemp[2].visible = false;
                }
            });

            Permissions.check(PERMISSIONS.ANDROID.CAMERA)
                .then((res) => {
                    if (res == 'granted') {
                        permissionsTemp[0].visible = false;
                    }
                    else if (res == 'denied') {
                        permissionsTemp[0].visible = true;
                    }
                    else if (res === 'blocked') {
                        permissionsTemp[0].visible = true;
                        permissionsTemp[0].buttonType = 'setting';
                    }
                    else if (res === 'unavailable') {
                        permissionsTemp[0].visible = true;
                    }
                })
                .catch((err) => {
                    console.log('Check permission CAMERA err: ', err)
                })

            Permissions.check(PERMISSIONS.ANDROID.RECORD_AUDIO)
                .then((res) => {
                    if (res == 'granted') {
                        permissionsTemp[1].visible = false;
                    }
                    else if (res == 'denied') {
                        permissionsTemp[1].visible = true;
                    }
                    else if (res === 'blocked') {
                        permissionsTemp[1].visible = true;
                        permissionsTemp[1].buttonType = 'setting';
                    }
                    else if (res === 'unavailable') {
                        permissionsTemp[1].visible = true;
                    }
                })
                .catch((err) => {
                    console.log('Check permission RECORD_AUDIO err: ', err)
                });

            const hasBrand = ['xiaomi', 'letv', 'asus', 'honor', 'oppo', 'vivo', 'nokia', 'redmi'].indexOf(DeviceInfo.getBrand().toLocaleLowerCase()) != -1;

            if (hasBrand) {
                const hasFirstCheck = await AsyncStorage.getItem('HasFirstCheckPermissionAuToStart');
                if (!hasFirstCheck) {
                    permissionsTemp[3].visible = true;
                    await AsyncStorage.setItem('HasFirstCheckPermissionAuToStart', "CHEKCED");
                }
                else {
                    permissionsTemp[3].visible = false;
                }
            }

            setPermissionList(permissionsTemp);
            setTimeout(() => {
                if (permissionsTemp.length > 0 && (permissionsTemp.findIndex((permission) => permission.visible == true) != -1)) {
                    toggleModal(true);
                }
                else {
                    toggleModal(false);
                }
            }, 500);

        }
    }, []);

    const [animation] = React.useState(new Animated.Value(0));

    const toggleModal = (isShow) => {
        if (isShow) {
            setVisible(true);
            Animated.spring(animation, {
                useNativeDriver: true,
                toValue: 1
            }).start(() => {
                AsyncStorage.setItem('ShowRequirePermission', 'true', (err) => {
                    console.log('Error: ', err);
                })
            });
        } else {
            Animated.spring(animation, {
                toValue: 0,
                useNativeDriver: true
            })
                .start(() => {
                    setVisible(false);
                })
        }
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
        >
            <Animated.View style={{
                ...styles.backdrop,
                opacity: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.2]
                })
            }} />
            <Animated.View
                style={{
                    ...styles.containerModal,
                    transform: [{
                        scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                        })
                    }]
                }}
            >
                <View style={{ ...styles.content, ...styles.shadow }}>
                    <View style={{ ...styles.header }}>
                        <Text allowFontScaling={false} style={{ ...styles.headerTitle }}>{getLabel('permission.title')}</Text>
                        <Text allowFontScaling={false} style={{ ...styles.headerSubTitle }}>{getLabel('permission.label_sub_title')}</Text>
                    </View>
                    <View style={{ ...styles.body }}>
                        <ScrollView>
                            {
                                permissionList.map((permission, idx) => {
                                    if (!permission.visible) {
                                        return null;
                                    }
                                    return (
                                        <LineItem
                                            key={idx.toString()}
                                            title={permission.title || ''}
                                            description={permission.description}
                                            onAllow={() => permission.buttonType == 'allow' ? permission.onAllow() : permission.onSetting()}
                                        />
                                    )
                                })
                            }
                        </ScrollView>
                    </View>
                    <View style={{ ...styles.footer }}>
                        <TouchableOpacity style={{ ...styles.buttonClose }} onPress={() => { toggleModal(false) }}>
                            <Text allowFontScaling={false} style={{ ...styles.buttonTextClose }}>{getLabel('common.btn_close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    containerModal: {
        flex: 1,
        paddingTop: heightDevice * .2,
        // paddingHorizontal: widthDevice * .1
    },
    backdrop: {
        position: 'absolute',
        zIndex: 0,
        width: widthDevice,
        height: heightDevice,
        backgroundColor: '#333',
        opacity: .2
    },
    content: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 12
    },
    header: {
        width: widthDevice,
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0',
        paddingHorizontal: 24
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginTop: 12
    },
    headerSubTitle: {
        fontSize: 12,
        fontWeight: '300',
        color: '#333',
        textAlign: 'center',
        marginVertical: 5
    },
    body: {
        flex: 1,
        marginBottom: 12,
    },
    lineItem: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        marginVertical: 4,
        marginHorizontal: 6,
        borderRadius: 6
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1187D0'
    },
    itemSubTitle: {
        fontSize: 12,
        fontWeight: '300',
        color: '#333',
        marginVertical: 5
    },
    itemButton: {
        backgroundColor: '#008ecf',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 10,
        alignSelf: 'center'
    },
    itemTextButton: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500'
    },
    footer: {
        flex: 1,
        maxHeight: isIphoneX ? 84 : 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 0.7,
        borderTopColor: '#d0d0d0',
        backgroundColor: '#fafafa',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    buttonClose: {
        backgroundColor: 'rgba(255, 229, 229, 1)',
        width: widthDevice * .6,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 8
    },
    buttonTextClose: {
        fontSize: 14,
        color: 'red',
        fontWeight: '500'
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.15,
                shadowRadius: 3.14,
            }
        }),
    }
})
