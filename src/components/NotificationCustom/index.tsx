import React from 'react'
import { StyleSheet, Image, Platform } from 'react-native'
import { Box, Text } from '../../themes/themes'
import { SpaceS } from '../CustomComponentView'
import { appName } from '../../Config.json'
import TimeAgo from 'react-native-timeago'
import { getLabel } from '../../utils/commons/commons'
export default function NotificationCustom({ notification }) {
    return (
        <Box
            minHeight={80}
            width='100%'
            borderTopLeftRadius={15}
            borderTopRightRadius={15}
            padding='l'
        >
            <Box
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
            >
                <Box
                    flexDirection='row'
                    alignItems='center'
                >
                    <Image
                        source={require('../../assets/images/logocrm.png')}
                        resizeMode='contain'
                        style={{ width: 32, height: 20 }}
                    />

                    <Text color={'black1'} allowFontScaling={true} fontWeight='bold' marginLeft='m'>{appName}</Text>
                </Box>
                <Text color={'black1'} allowFontScaling={true} variant='time' textAlign='right' paddingVertical='m'>{getLabel('notification.label_time_now')}</Text>

            </Box>
            <Text color={'black1'} allowFontScaling={true} variant='headerSection' paddingTop='m'>{notification?.title}</Text>
            <Text color={'black1'} allowFontScaling={true} paddingVertical='s'>{notification?.message}</Text>
        </Box>
    )
}

const styles = StyleSheet.create({})
