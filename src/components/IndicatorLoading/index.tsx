/**
 * @file    : HightLightText/index.js
 * @author  : Manh Le
 * @date    : 2021-01-01
 * @purpose : Create overlay loading using style of IOS (Activity Indicator)
*/

import React from 'react';
import { ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { heightDevice, widthDevice } from '../../utils/commons/commons';
import { SpaceL } from '../CustomComponentView';

export default function IndicatorLoading({ loading, loadingText, size = 'small' }: { loading: boolean, loadingText?: string, size?: 'small' | 'large' }) {
    
    return (
        <Modal
            visible={loading}
            animationType='fade'
            transparent={true}
        >

            <Box
                flex={1}
                backgroundColor='black1'
                opacity={.1}
            />

            <Box
                width={widthDevice}
                height={heightDevice}
                position={'absolute'}
                zIndex={10}
                alignItems='center'
                justifyContent='center'
            >
                <Box
                    width={size == 'small' ? 80 : (widthDevice * .5 < 200 ? (widthDevice * .5) : 200)}
                    height={size == 'small' ? 80 : (widthDevice * .5 < 200 ? (widthDevice * .5) : 200)}
                    borderRadius={15}
                    backgroundColor='black3'
                    alignItems='center'
                    justifyContent='center'
                    shadowColor='black1'
                    shadowOffset={{
                        width: 0,
                        height: 2
                    }}
                    shadowOpacity={0.25}
                    shadowRadius={3.84}
                    elevation={5}
                    paddingHorizontal='l'
                >
                    <ActivityIndicator
                        color={Colors.white.white1}
                        size='large'
                        style={{
                            transform: [
                                {
                                    scale: size == 'small' ? 1 : 1.4
                                }
                            ]
                        }}
                    />
                    {
                        loadingText ? (
                            <>
                                <SpaceL />

                                <Text
                                    color='white1'
                                    fontSize={15}
                                    textAlign='center'
                                    marginTop='l'
                                >
                                    {loadingText}
                                </Text>
                            </>
                        )
                            : null
                    }

                </Box>
            </Box>
        </Modal>

    )
}