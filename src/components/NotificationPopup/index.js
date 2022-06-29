import React, { Component, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { isIphoneX, widthDevice } from '../../utils/commons/commons';

const NotificationTemplate = () => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value
                });
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    { dx: pan.x, dy: pan.y }
                ]
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
            }
        })
    ).current;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: [{ translateX: pan.x }, { translateY: pan.y }]
            }}
            {...panResponder.panHandlers}
        >
            <View style={{
                height: 150,
                width: 150,
                backgroundColor: "blue",
                borderRadius: 5
            }} />
        </Animated.View>
    );
}


class NotificationPopup extends Component {

    constructor(props) {
        super(props);

    }

    render() {

        const { messagePopupState, hiddenMessage } = this.props;

        return (
            <NotificationTemplate

            >
            </NotificationTemplate>
        )
    }
}


function bindAction(dispatch) {
    return {
    };
}

const mapStateToProps = state => ({
    notificationState: state.notification,
});

export default connect(mapStateToProps, bindAction)(NotificationPopup);


const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: widthDevice - 50,
        height: null,
        minHeight: 120,
        left: 25,
        top: isIphoneX ? (34 + 10) : 10,
        borderRadius: 8
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.14,
            }
        }),
    }
})
