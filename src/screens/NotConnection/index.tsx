import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, TouchableOpacityBase, View } from 'react-native'
import { SpaceL } from '../../components/CustomComponentView'
import Global from '../../Global'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { getLabel, widthDevice } from '../../utils/commons/commons'
import NetInfo from "@react-native-community/netinfo";

export default function NotConnected({ route, navigation }) {
    let timeOutOpenNetWork = null;

    React.useEffect(() => {
        NetInfo.fetch().then(state => {
            if (state.type.toLocaleLowerCase() != 'none') {
                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                Global.checkNetworkStatusAsync((response) => {
                    if (response) {
                        timeOutOpenNetWork = setTimeout(() => {
                            Global.updateNetworkStatus(true)
                            navigation.goBack();
                        }, 5000);
                    }
                })
            }
        });

        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.type.toLocaleLowerCase() != 'none') {

                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                Global.checkNetworkStatusAsync((response) => {
                    if (response) {
                        timeOutOpenNetWork = setTimeout(() => {
                            Global.updateNetworkStatus(true)
                            navigation.goBack();
                        }, 5000);
                    }
                })

            }
        });
        return () => {
            unsubscribe();
            timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
        }
    }, [])

    const reConnect = () => {
        NetInfo.fetch().then(state => {
            if (state.type.toLocaleLowerCase() != 'none') {
                Global.checkNetworkStatusAsync((response) => {
                    if (response) {
                        Global.updateNetworkStatus(true)
                        navigation.goBack();
                    }
                })
            }
        });
    }

    return (
        <View style={{ ...styles.container }}>
            <Icon
                name='wifi-slash'
                size={widthDevice * .2}
                color={Colors.black.black3}
            />

            <SpaceL />

            <Text
                style={{
                    ...styles.title
                }}
            >
                {getLabel('common.label_check_connection')}
            </Text>

            <SpaceL />

            <TouchableOpacity
                style={{
                    ...styles.btn_retry,
                }}
                onPress={reConnect}
            >
                <Text style={{
                    ...styles.label_retry
                }}>
                    {getLabel('common.btn_retry')}
                </Text>
            </TouchableOpacity>

            <SpaceL />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black.black3
    },
    btn_retry: {
        backgroundColor: Colors.functional.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6

    },
    label_retry: {
        color: Colors.white.white1,
        fontSize: 16,
        fontWeight: 'bold'
    },
    btn_guideline: {
        borderColor: Colors.functional.primary,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6

    },
    label_guideline: {
        color: Colors.functional.primary,
        fontSize: 16,
        fontWeight: 'bold'
    }
})
