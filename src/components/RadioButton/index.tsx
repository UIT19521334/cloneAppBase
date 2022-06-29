import React from 'react'
import { Colors } from '../../themes/colors/Colors'
import { Box } from '../../themes/themes'
import { SpaceHS } from '../CustomComponentView'
import { StyleSheet, View, TouchableOpacity, TextStyle, ViewStyle, Text } from 'react-native'

type RadioButtonProps = {
    size?: Number,
    selected: Boolean,
    label: String,
    color?: String,
    colorSelected?: String,
    onSelect: () => void,
    labelStyle?: TextStyle,
    style?: ViewStyle
}

export default function RadioButton({
    size = 16,
    selected = false,
    label = '',
    color = Colors.black.black4,
    colorSelected = Colors.black.black3,
    onSelect = undefined,
    labelStyle = {},
    style = {}
}: RadioButtonProps) {
    return (
        <TouchableOpacity
            style={style}
            onPress={() => { onSelect?.() }}>
            <Box flexDirection='row' style={{paddingVertical: 8}}>
                <Box
                    width={size}
                    height={size}
                    borderRadius={size / 2}
                    borderWidth={1}
                    alignItems='center'
                    justifyContent='center'
                    style={{
                        borderColor: selected ? colorSelected : color
                    }}
                >
                    {
                        selected ?
                            (
                                <Box
                                    width={size * 0.6}
                                    height={size * 0.6}
                                    borderRadius={(size * 0.6) / 2}
                                    style={{
                                        backgroundColor: colorSelected
                                    }}
                                />
                            )
                            : null
                    }
                </Box>
                <SpaceHS />
                {
                    label ? <Text 
                    allowFontScaling={true}  
                    style={{color: '#333', ...labelStyle}}
                    >{label}</Text> : null
                }
            </Box>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({

})
