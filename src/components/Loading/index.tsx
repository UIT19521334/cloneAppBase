/**
 * @file    : Loading/index.js
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : Create UI skeleton loading for list view
*/

import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native'
import { ActivityIndicator, View } from 'react-native'
import { Colors } from '../../themes/colors/Colors'
import { Box } from '../../themes/themes'
import { heightDevice, widthResponse } from '../../utils/commons/commons'
import Loader from '../Loader'

const LoadingList = ({ type = 'indicator', loading = false, numberItem = 5, titleSize = 13, subTitleSize = 10, iconTitle = false, iconSize = 20, lineHeight = 28 }) => {
    if (loading) {
        return (
            <View
                style={{
                    width: widthResponse,
                    minHeight: heightDevice,
                }}
            >
                {
                    type == 'indicator' ?
                        (
                            <Box
                                flex={1}
                                paddingTop='xl'
                            >
                                <ActivityIndicator
                                    color={Colors.functional.primary}
                                    style={{
                                        transform: [{ scale: 1.4 }],
                                        paddingVertical: 4
                                    }}
                                />
                            </Box>
                        )
                        : (
                            <Loader
                                number={numberItem}
                                titleSize={titleSize}
                                subTitleSize={subTitleSize}
                                iconSize={iconSize}
                                iconTitle={iconTitle}
                                lineHeight={lineHeight}
                            />
                        )
                }
            </View>
        )
    }
    else {
        return null;
    }

}

const LoadingMoreList = ({ type = 'indicator', loading = false, titleSize = 13, subTitleSize = 10, iconTitle = false, iconSize = 20, lineHeight = 28, minHeight = 120 }) => {
    if (loading) {
        return (
            <View
                style={{
                    backgroundColor: Colors.white.white1,
                    minHeight: minHeight
                }}
            >
                {
                    type === 'indicator' ?
                        (
                            <Box
                                flex={1}
                                justifyContent='center'
                                alignItems='center'
                            >
                                <ActivityIndicator
                                    color={Colors.functional.primary}
                                    style={{
                                        transform: [{ scale: 1.4 }], paddingVertical: 4
                                    }}
                                />
                            </Box>
                        )
                        :
                        (
                            <Loader
                                number={1}
                                titleSize={titleSize}
                                subTitleSize={subTitleSize}
                                iconSize={iconSize}
                                iconTitle={iconTitle}
                                lineHeight={lineHeight}
                            />
                        )
                }

            </View>
        )
    } else {
        return null;
    }

}

const LoadingPerformance = () => {
    const maxHeight = heightDevice * .15;
    const maxWidth = widthResponse;

    return (
        <Box
            width={widthResponse}
            height={maxHeight}
        >
            <ContentLoader
                foregroundColor={Colors.white.white1}
                backgroundColor={Colors.white.white3}
            >
                <Rect
                    x={(maxWidth / 2) - (maxWidth / 5 / 2)}
                    y={maxHeight / 8}
                    rx="8"
                    ry="8"
                    width={maxWidth / 5}
                    height="20"
                />

                <Rect
                    x={(maxWidth / 2) - (maxWidth / 5 / 2)}
                    y={(maxHeight / 8) * 3}
                    rx="10"
                    ry="10"
                    width={20}
                    height="20"
                />

                <Rect
                    x={(maxWidth / 2) - (maxWidth / 5 / 2 - 25)}
                    y={(maxHeight / 8) * 3}
                    rx="8"
                    ry="8"
                    width={maxWidth / 5 - 25}
                    height="20"
                />

                <Rect
                    x={(maxWidth / 2) - (maxWidth / 2 / 2)}
                    y={(maxHeight / 8) * 5}
                    rx="8"
                    ry="8"
                    width={maxWidth / 2 / 2}
                    height="20"
                />

                <Rect
                    x={(maxWidth / 2) + 10}
                    y={(maxHeight / 8) * 5}
                    rx="8"
                    ry="8"
                    width={maxWidth / 2 / 2 - 5}
                    height="20"
                />
            </ContentLoader>
        </Box>
    )
}


export {
    LoadingList,
    LoadingMoreList,
    Loader,
    LoadingPerformance
}
