/**
 * @file    : Collapsible.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : create UI collapsible view
*/

import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    TouchableWithoutFeedback, View
} from 'react-native';
import Animated, { Easing } from "react-native-reanimated";
import { bin, bInterpolate, useTransition } from 'react-native-redash';

const { not, interpolate } = Animated;

const Collapsible = ({ children, buttonContent, isShow = false, wrapperStyle, defaultCollapsed, onToggle, buttonPosition, maxHeight }) => {
    const [open, setOpen] = useState(false);

    const transition = useTransition(
        open,
        not(bin(open)),
        bin(open),
        400,
        Easing.inOut(Easing.ease)
    );

    const height = bInterpolate(
        transition,
        defaultCollapsed ? (maxHeight || 0) : 0,
        defaultCollapsed ? 0 : (maxHeight || 0)
    );

    const bottomRadius = interpolate(transition, {
        inputRange: [0, 16 / 400],
        outputRange: [8, 0]
    });

    useEffect(() => {
        onToggle?.(!open);

        return () => { }
    }, [open]);

    const renderButton = () => {
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    setOpen(prev => !prev);
                }}
            >
                <Animated.View
                    style={[
                        styles.container,
                        {
                            borderBottomLeftRadius: bottomRadius,
                            borderBottomRightRadius: bottomRadius
                        }
                    ]}
                >
                    {buttonContent}
                </Animated.View>

            </TouchableWithoutFeedback>
        );
    }

    return (
        <>
            {buttonPosition === 'top' ? renderButton() : null}

            <Animated.View
                style={{
                    ...styles.items,
                    ...wrapperStyle,
                    maxHeight: height
                }}
            >
                <View
                    style={{
                        flex: 1
                    }}
                >
                    {children}
                </View>
            </Animated.View>

            {buttonPosition === 'bottom' ? renderButton() : null}
        </>
    );
}

export default Collapsible;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    title: {
        fontSize: 16,
        fontWeight: "bold"
    },
    items: {
        overflow: "hidden"
    }
});