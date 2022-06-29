import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { SpaceS, SText } from '../CustomComponentView'

export default function QuickActionHeader({ icon, iconElement, width = 0, label = '', color = Colors.functional.primary, 
borderColor = Colors.black.black4, onPress, children, disabled = false, style = {}, contentStyle = {} }) {
    let backgroundColor = Colors.white.white1;
    if (disabled) {
        backgroundColor = '#f0f0f0';
        color = '#b2b2b2'
    }

    return (
        <View style={{ minWidth: width, ...style }}>
            <TouchableOpacity
                disabled={disabled}
                onPress={() => onPress?.()}
                style={{ height: 90, alignItems: 'flex-end', justifyContent: 'center', ...contentStyle }}
            >
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    {
                        icon ?
                            (
                                <>
                                    <View
                                        style={[
                                            { alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderColor: borderColor, borderWidth: 1, borderRadius: 6 },
                                            disabled ? { backgroundColor: backgroundColor } : {}
                                        ]}
                                    >

                                        <Icon name={icon} style={{ fontSize: 18, color: color }} />
                                    </View>
                                    <SpaceS />
                                </>
                            )
                            : null
                    }

                    {
                        iconElement ?
                            (
                                <>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderColor: borderColor, borderWidth: 1, borderRadius: 6 }}>
                                        {iconElement}
                                    </View>
                                    <SpaceS />
                                </>
                            )
                            : null
                    }

                    <SText allowFontScaling={true} color={color}>{label}</SText>
                </View>
            </TouchableOpacity>

            {
                children
            }
        </View>
    )
}

const styles = StyleSheet.create({})
