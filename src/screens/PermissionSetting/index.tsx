import React from 'react'
import { Animated, DeviceEventEmitter, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Colors } from '../../themes/colors/Colors'
import { Text, Box } from '../../themes/themes'
import { FOOTER_HEIGHT, getLabel, isIphoneX, widthResponse } from '../../utils/commons/commons'
import { check, PERMISSIONS, request, RESULTS, openSettings } from 'react-native-permissions';
import { Icon } from '../../themes/Icons/CustomIcon'
export default function PermissionSetting() {
    const [permissionName, setPermissionName] = React.useState('');
    const [permissionType, setPermissionType] = React.useState(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    const [visible, setVisible] = React.useState(false);
    const [animation] = React.useState(new Animated.Value(0));
    const [fromScene, setFromScene] = React.useState('Scene');
    React.useEffect(() => {

        const unsubscribe = DeviceEventEmitter.addListener('Application.ShowPermissionSettings', ({ title, type }) => {
            console.log('Has trigger show popup check notification');
            if (type) {
                if (type == 'modal') {
                    setFromScene('Modal')
                }
                else {
                    setFromScene('Scene')
                }
            }
            else {
                setFromScene('Scene')
            }

            setPermissionName(title);
            onShow();
        })

        return () => {
            unsubscribe.remove()
        }
    }, [])

    const onShow = () => {
        setVisible(true);
        Animated.spring(animation, {
            useNativeDriver: true,
            toValue: 1
        }).start(() => { });
    }

    const onHide = () => {
        Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true
        })
            .start(() => {
                setVisible(false);
                setFromScene('Scene')
            })
    }

    if (!visible) {
        return null;
    }

    return (

        <Animated.View
            style={{
                position: 'absolute',
                bottom: fromScene == 'Scene' ? (FOOTER_HEIGHT + 10) : (isIphoneX ? 44 : 15),
                left: 0,
                width: widthResponse,
                minHeight: 60,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [
                    {
                        scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1]
                        })
                    }
                ]
            }}
        >
            <Box
                flex={1}
                backgroundColor='white1'
                minHeight={70}
                width={widthResponse - 24}
                borderRadius={6}
                style={{ ...styles.shadow }}
                justifyContent='center'
                alignItems='center'
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        width: 25,
                        height: 25,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={onHide}
                >
                    <Icon name='times' size={18} />
                </TouchableOpacity>
                {
                    permissionName ?
                        (
                            <Box
                                marginTop='xl'
                                width={widthResponse * .8}
                            >
                                <Text allowFontScaling={true} textAlign='center'>{permissionName}</Text>
                            </Box>
                        )
                        : null
                }



                <TouchableOpacity
                    style={{
                        alignSelf: 'center',
                        marginTop: 6,
                        marginBottom: permissionName ? 12 : 0
                    }}
                    onPress={() => {
                        openSettings().then((err) => {
                            console.log('Can ont open setting!');
                        });
                        onHide();
                    }}
                >
                    <Text
                        paddingHorizontal='l'
                        paddingVertical='m'
                        fontSize={16}
                        fontWeight='600'
                        color='primary'
                        allowFontScaling={true}
                    >
                        {getLabel('checkIn.label_open_settings')}
                    </Text>
                </TouchableOpacity>
            </Box>
        </Animated.View>
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
    }
})
