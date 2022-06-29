/**
 * @file    : Loader/index.js
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : Create UI skeleton loading
*/
import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native'
import { Colors } from '../../themes/colors/Colors'
import { widthResponse } from '../../utils/commons/commons'

const ItemLoader = ({ idx = 0, titleSize = 13, subTitleSize = 10, iconTitle = false, iconSize = 20, lineHeight = 28 }) => (
    <>
        {
            iconTitle ? <Rect
                x="12"
                y={idx * 100 + 8}
                rx="5"
                ry="5"
                width={iconSize}
                height={iconSize}
            />
                : null
        }

        <Rect
            x={iconTitle ? 40 : 12}
            y={idx * 100 + 12}
            rx="4"
            ry="4"
            width={widthResponse * .6}
            height="13"
        />

        <Rect
            x={(widthResponse - 12 * 4)}
            y={idx * 100 + 8}
            rx="10"
            ry="10"
            width={iconSize}
            height={iconSize}
        />

        <Rect
            x="12"
            y={(idx * 100) + 15 + lineHeight}
            rx="5"
            ry="5"
            width="20"
            height="20"
        />

        <Rect
            x="40"
            y={(idx * 100) + 20 + lineHeight}
            rx="3"
            ry="3"
            width={widthResponse * .2}
            height="10"
        />

        <Rect
            x={(widthResponse - (12 * 2) - 4 - (widthResponse * .2))}
            y={(idx * 100) + 20 + lineHeight}
            rx="3"
            ry="3"
            width={widthResponse * .2}
            height="10"
        />

        <Rect
            x="12"
            y={((idx * 100) + lineHeight + 6) + 15 + lineHeight}
            rx="15"
            ry="15"
            width="20"
            height="20"
        />

        <Rect
            x="40"
            y={((idx * 100) + lineHeight + 6) + 20 + lineHeight}
            rx="3"
            ry="3"
            width={widthResponse * .2}
            height="10"
        />

        <Rect
            x={(widthResponse - (12 * 2) - 4 - (widthResponse * .2))}
            y={((idx * 100) + lineHeight + 6) + 20 + lineHeight}
            rx="3"
            ry="3"
            width={widthResponse * .2}
            height="10"
        />
    </>
)

export default function Loader({ number = 1, titleSize = 13, subTitleSize = 10, iconTitle = false, iconSize = 20, lineHeight = 28 }) {

    return (
        <>
            <ContentLoader foregroundColor={Colors.white.white1} backgroundColor={Colors.white.white5}>
                {
                    [...Array(number).keys()].map((item) => {
                        return <ItemLoader
                            key={item.toString()}
                            idx={item}
                            titleSize={titleSize}
                            subTitleSize={subTitleSize}
                            iconSize={iconSize}
                            iconTitle={iconTitle}
                            lineHeight={lineHeight}
                        />
                    })
                }
            </ContentLoader>
        </>
    )
}

