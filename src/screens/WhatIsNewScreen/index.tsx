import { Container, Content } from 'native-base'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Global from '../../Global'
import { Colors } from '../../themes/colors/Colors'
import { Text, Box } from '../../themes/themes'
import { getLabel, heightDevice } from '../../utils/commons/commons'

export default function WhatIsNewScreen({navigation}) {
    const insets = useSafeAreaInsets();
    return (
        <Container>
            <Content
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: heightDevice * 0.03
                }}
            >
                <Text
                    fontSize={18}
                    fontWeight='bold'
                    color='black1'
                >
                    {getLabel('common.title_notification_update')} <Text color='primary'>{Global.appVersion}</Text>?
                </Text>

                <Box
                    paddingVertical='xl'
                    paddingLeft='l'
                >
                    <Text
                        fontSize={15}
                        color='black2'
                    >
                        {getLabel('common.msg_content_update')}
                    </Text>
                </Box>
            </Content>
            <Box
                style={{
                    paddingBottom: insets.bottom + 20
                }}
                paddingHorizontal='xl'
                paddingVertical='l'
                backgroundColor='white2'
            >
                <TouchableOpacity
                    style={{
                        backgroundColor: Colors.functional.primary,
                        height: 44,
                        borderRadius: 6,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Text
                        fontSize={18}
                        fontWeight='bold'
                        color='white1'
                    >
                        {getLabel('common.btn_continue')}
                    </Text>
                </TouchableOpacity>
            </Box>
        </Container>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
