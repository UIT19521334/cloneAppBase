import { BlurView } from '@react-native-community/blur'
import { View } from 'native-base'
import React from 'react'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import IndicatorLoading from '../../components/IndicatorLoading'
import NotificationBadge from '../../components/NotificationBadge'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { Box, Text } from '../../themes/themes'
import { widthDevice, widthResponse } from '../../utils/commons/commons'
import useHook from './hook'

export default function NavbarBottom() {

    const { routes, loading, indexSelected, _onSelectTab } = useHook();
    const isLargeScreen = widthDevice >= 768;
    return (
        <View
            style={{
                ...styles.content
            }}
        >
            <SafeAreaView
                edges={['left', 'right']}
                style={{
                    paddingBottom: useSafeAreaInsets().bottom
                }}
            >
                <Box
                    flexDirection='row'
                    justifyContent='space-around'
                    alignItems='center'
                    height={64}
                >

                    {
                        routes.map((tab, index) => {
                            return (
                                <TouchableOpacity
                                    key={index.toString()}
                                    style={{ ...styles.tabItem }}
                                    onPress={() => _onSelectTab(index)}
                                >
                                    <Box>
                                        {
                                            tab.key === 'Notifications' ?
                                                (
                                                    <NotificationBadge />
                                                )
                                                : null
                                        }
                                        {
                                            index != 2 ?
                                                (
                                                    <Icon
                                                        name={tab.icon}
                                                        size={26}
                                                        color={indexSelected == index ? Colors.functional.primary : Colors.black.black1}
                                                    />
                                                )
                                                : (
                                                    <Box
                                                        backgroundColor='primary'
                                                        width={50}
                                                        height={50}
                                                        borderRadius={18}
                                                        justifyContent='center'
                                                        alignItems='center'
                                                        style={{
                                                            marginBottom: 5
                                                        }}
                                                    >
                                                        <Icon
                                                            name={tab.icon}
                                                            size={26}
                                                            color={Colors.white.white1}
                                                        />
                                                    </Box>
                                                )
                                        }

                                    </Box>
                                    {
                                        index != 2 ?
                                            (
                                                <Text
                                                    allowFontScaling={false}
                                                    fontSize={12}
                                                    marginTop='m'
                                                    color={(indexSelected == index) ? 'primary' : 'black1'}
                                                >
                                                    {tab.title}
                                                </Text>
                                            )
                                            : null
                                    }

                                </TouchableOpacity>
                            )
                        })
                    }

                </Box>
            </SafeAreaView>
            <IndicatorLoading loading={loading} />
        </View>
    )
}

const styles = StyleSheet.create({
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        backgroundColor: '#fff',
        minHeight: 55,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.white.white5,
        ...Platform.select({
            android: {
                elevation: 10,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.45,
                shadowRadius: 3.14,
            }
        }),
    }
})


