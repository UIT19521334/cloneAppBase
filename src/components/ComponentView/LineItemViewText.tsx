
import React from 'react';
import { Clipboard, StyleProp, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Toast from 'react-native-root-toast';
import { Colors } from '../../themes/colors/Colors';
import { Box } from '../../themes/themes';
import { getLabel, widthDevice, widthResponse } from '../../utils/commons/commons';
import { NText } from '../CustomComponentView';
import HTML from "react-native-render-html";

type LineItemViewTextProps = {
    title: StyleProp<string>,
    value: StyleProp<string | any>,
    titleStyle?: StyleProp<TextStyle>,
    textStyle?: StyleProp<TextStyle>,
    style?: StyleProp<ViewStyle>,
    isRenderHTML?: boolean,
    handleOnPress?: () => void,
    RenderRightButton?: () => React.ReactElement
}

const LineItemViewText = ({ title = '', value = '', titleStyle = {}, textStyle = {}, style = {}, isRenderHTML = false, handleOnPress = undefined, RenderRightButton = undefined }: LineItemViewTextProps) => {
    
    const isHtmlString = /<\/?[a-z][\s\S]*>/i.test(value);
    return (
        <Box paddingHorizontal='l' paddingVertical='m' style={[{ flex: 1 }, style]}>
            <NText allowFontScaling={true} color={Colors.black.black3} style={titleStyle}>{title}</NText>
            <Box paddingVertical='s' />
            <Box
                flex={1}
                flexDirection={'row'}
                alignItems='center'
            >
                <TouchableOpacity
                    style={{ flex: 1 }}
                    onLongPress={() => {
                        Clipboard.setString(value);
                        Toast.show(getLabel('common.msg_copy_to_clipboard_success'))
                    }}
                    onPress={() => handleOnPress?.()}
                >
                    {
                        isHtmlString ? (
                            <HTML
                                source={{ html: '<div>' + value + '</div>' }}
                                contentWidth={widthDevice * .8}
                            />
                        )
                            : (
                                <NText allowFontScaling={true} style={textStyle}>{value}</NText>
                            )
                    }
                </TouchableOpacity>

                {RenderRightButton ? RenderRightButton() : null}
            </Box>
        </Box>
    );
}

export default LineItemViewText;