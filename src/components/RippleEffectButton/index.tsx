import React from 'react'
import { StyleSheet, View, TouchableWithoutFeedback, Animated, Easing, Platform } from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Text } from '../../themes/themes'

const RippleEffectButton = ({ style = {}, iconLeft = null, size = 20, color = Colors.black.black5, label = '', textStyle = {}, iconRight = null, onPress = undefined }) => {

    const [maxOpacity, setMaxOpacity] = React.useState(0.12);
    const [scaleValue, setScaleValue] = React.useState(new Animated.Value(0.01));
    const [opacityValue, setOpacityValue] = React.useState(new Animated.Value(maxOpacity));

    const onPressedIn = () => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 225,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
            useNativeDriver: true
        }).start();
        
    }

    const onPressedOut = () => {
        Animated.timing(opacityValue, {
            toValue: 0,
            useNativeDriver: true
        }).start(() => {
            scaleValue.setValue(0.01);
            opacityValue.setValue(maxOpacity);
        });
    }

    const renderRippleView = () => {

        const rippleSize = size * 2;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: rippleSize,
                    height: rippleSize,
                    borderRadius: rippleSize / 2,
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                    backgroundColor: color || 'black',
                }}
            />
        );
    }

    const containerSize = size * 2;
    const iconContainer = { width: containerSize, height: containerSize };

    return (
        <TouchableWithoutFeedback 
        onPressIn={onPressedIn} 
        onPressOut={onPressedOut}
        onPress={() => {onPress?.();}}
        >
            <View style={[styles.iconContainer, iconContainer, style]}>
                {renderRippleView()}
                {
                    iconLeft ?
                        (
                            <>
                                <Icon name={iconLeft} size={size} color={color}/>
                            </>
                        ) : null

                }
                {
                    label ?
                        (
                            <>
                                <Text  allowFontScaling={true}  fontSize={14} style={textStyle} >{label}</Text>
                            </>
                        ) : null

                }
                {
                    iconRight ?
                        (
                            <>
                                <Icon name={iconRight} size={size}  color={color}/>
                            </>
                        ) : null

                }

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
});

export default RippleEffectButton 
