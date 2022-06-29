
import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { Box } from '../../themes/themes';
import { NText, SpaceS } from '../CustomComponentView';

type LineItemInviteeViewTextProps = {
    title: StyleProp<string>,
    value: Array<Object>,
    textStyle?: StyleProp<TextStyle>,
    style?: StyleProp<ViewStyle>,
}

const LineItemInviteViewText = ({ title = '', value = [], textStyle = {}, style = {} }: LineItemInviteeViewTextProps) => {
    return (
        <Box paddingHorizontal='l' paddingVertical='m' style={[{ flex: 1 }, style]}>
            <NText allowFontScaling={true}  color={Colors.black.black3}>{title}</NText>
            <Box paddingVertical='s' />
            {
                value?.length > 0 && value?.map((item, index) => {
                    let color = Colors.black.black1;
                    if (item.status == 'Accepted') {
                        color = Colors.functional.successful;
                    }
                    else if (item.status == 'Failed') {
                        color = Colors.functional.dangerous;
                    }

                    return (
                        <Box key={index.toString()}>
                            <SpaceS />
                            <NText allowFontScaling={true}  style={[textStyle]}>
                                {
                                    item.email ? (
                                        `${item.name} (${item.email})`
                                    ) : `${item.name}`
                                }
                                <NText allowFontScaling={true}  style={[{color: color}, textStyle]}>{` [${item.display_status}]`}</NText>
                            </NText>
                        </Box>
                    )
                })
            }

        </Box>
    );
}

export default LineItemInviteViewText;