import React, { useEffect } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { normalize, widthDevice, widthResponse } from '../../utils/commons/commons';
import { SegmentControlProps } from '../../utils/Models/models';
const shadow = {
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.62,

    elevation: 4,
};

// So that it stretches in landscape mode.
const width = (widthDevice >= 768 ? (widthDevice * 0.7) : widthDevice)  - 32;


const segmentedControlDefaultProps = {
    tabs: [],
    onChange: () => { },
    currentIndex: 0,
    segmentedControlBackgroundColor: '#E5E5EA',
    activeSegmentBackgroundColor: 'white',
    textColor: 'black',
    activeTextColor: 'black',
    paddingVertical: 12,
};

const SegmentedControl = (segmentedControlDefaultProps: SegmentControlProps) => {
    const translateValue = (width - 4) / segmentedControlDefaultProps?.tabs?.length;
    const [tabTranslate, setTabTranslate] = React.useState(new Animated.Value(0));

    // useCallBack with an empty array as input, which will call inner lambda only once and memoize the reference for future calls
    const memoizedTabPressCallback = React.useCallback((index) => {
        segmentedControlDefaultProps?.onChange(index);
    }, []);

    useEffect(() => {
        // Animating the active index based current index
        Animated.spring(tabTranslate, {
            toValue: segmentedControlDefaultProps?.currentIndex * translateValue,
            stiffness: 180,
            damping: 20,
            mass: 1,
            useNativeDriver: true,
        }).start();
    }, [segmentedControlDefaultProps?.currentIndex]);

    const convertCounter = (count: number) => {
        if (count < 1000) {
            return count;
        }
        else if (count < 100000){
            return parseFloat(count / 1000).toFixed(1) + 'k'
        }
        else {
            return parseFloat(count / 1000).toFixed(0) + 'k'
        }
    }

    return (
        <Animated.View
            style={[
                styles.segmentedControlWrapper,
                {
                    backgroundColor: segmentedControlDefaultProps?.segmentedControlBackgroundColor,
                },
            ]}>
            <Animated.View
                style={[
                    {
                        ...StyleSheet.absoluteFill,
                        position: 'absolute',
                        width: (width - 4) / segmentedControlDefaultProps?.tabs?.length,
                        top: 0,
                        marginVertical: 2,
                        marginHorizontal: 2,
                        backgroundColor: segmentedControlDefaultProps?.activeSegmentBackgroundColor,
                        borderRadius: 8,
                        ...shadow,
                    },
                    {
                        transform: [
                            {
                                translateX: tabTranslate,
                            },
                        ],
                    },
                ]}
            >
            </Animated.View>
            {segmentedControlDefaultProps?.tabs.map((tab, index) => {
                const isCurrentIndex = segmentedControlDefaultProps?.currentIndex === index;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.textWrapper,
                            {
                                paddingVertical: segmentedControlDefaultProps?.paddingVertical,
                            },
                        ]}
                        onPress={() => memoizedTabPressCallback(index)}
                        activeOpacity={0.7}>
                        <Text 
                            allowFontScaling={true}
                            numberOfLines={1}
                            style={[
                                styles.textStyles,
                                { color: segmentedControlDefaultProps?.textColor },
                                isCurrentIndex && { color: segmentedControlDefaultProps?.activeTextColor },
                            ]}
                        >
                            {tab?.label || tab || ''}
                        </Text>
                        {
                            tab?.dotColor ?
                                (
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tab.dotColor, marginLeft: 4 }} />
                                )
                                : null
                        }
                        {
                            tab?.badgeCount ?
                                (

                                    <View
                                        style={styles.badgeView}
                                    >
                                        <Text allowFontScaling={true} style={{ color: Colors.white.white1, fontSize: 11 }}>{convertCounter(tab?.badgeCount || 0)}</Text>
                                    </View>
                                )
                                : null
                        }

                    </TouchableOpacity>
                );
            })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    segmentedControlWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        width: width,
        marginVertical: 15,
    },
    textWrapper: {
        flex: 1,
        elevation: 9,
        paddingHorizontal: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textStyles: {
        fontSize: 13,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    badgeView: {
        marginLeft: 4,
        backgroundColor: Colors.functional.dangerous,
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4
    }
});

SegmentedControl.defaultProps = {
    tabs: [],
    onChange: () => { },
    currentIndex: 0,
    segmentedControlBackgroundColor: '#E5E5EA',
    activeSegmentBackgroundColor: 'white',
    textColor: 'black',
    activeTextColor: 'black',
    paddingVertical: 12,
};

export default SegmentedControl;
