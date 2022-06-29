import React from 'react';
import { Animated, Text, Easing, Platform, StatusBar, Vibration } from 'react-native';
import { IOStyle } from './iOStyle';
import { TapticFeedback } from '../../index';

const animatedDuration = 350;
const minVelocityToFling = -150;
const navBarOffset = 56;

const IS_IOS = Platform.OS === 'ios';

export class NotificationBase extends React.Component {

    static show;
    static hide;

    constructor(props) {
        super(props);

        this.state = {
            dataNoti: {},
            currentNotiId: ''
        }

        NotificationBase.show = (params) => {
            try {
                this.setState({ dataNoti: params }, () => {
                    this.show();
                })

            } catch (e) {
                throw new Error('Unable to show Notification, because there is no instance of Notification');
            }
        };
        NotificationBase.hide = () => {
            try {
                this.setState({ dataNoti: {} }, () => {
                    this.hide();
                })
            } catch (e) {
                throw new Error('Unable to show Notification, because there is no instance of Notification');
            }
        };
    }



    /**
     * onLayout is not invoked immediately, so by default the value is pretty high.
     * Afterwards the value will be changed depending on the @viewHeight value
     */
    translateY = new Animated.Value(-9000);

    /**
     * Default StatusBar offset.
     * .ios component overrides it depending on the type of iPhone
     */
    offset = 22;

    /**
     * Height of Notification's root view, it changes after onLayout invoking
     */
    viewHeight = 0;
    onLayoutHasBeenInvoked = false;

    timer;

    show = () => {
        const {
            onShow,
            tapticFeedback,
            hideStatusBar,
            hasSound
        } = this.props;

        this.autohide();
        if (hasSound && this.state.dataNoti?.id != this.state.currentNotiId) {
            Vibration.vibrate([100]);
            this.setState({ currentNotiId: this.state.dataNoti?.id }, () => {
                this.props.playSoundNotification();
            })
        }
        else {
            Vibration.vibrate([100]);
            this.setState({ currentNotiId: this.state.dataNoti?.id }, () => {
            });
        }

        Animated.spring(this.translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start(() => {
        });

        if (onShow) {
            onShow();
        }

        if (hideStatusBar) {
            IS_IOS && StatusBar.setHidden(true, 'slide');
        }

        if (tapticFeedback && IS_IOS) {
            TapticFeedback.impact();
        }



    };

    hide = () => {

        const {
            hideStatusBar,
            onHide,
        } = this.props;

        Animated.timing(this.translateY, {
            toValue: (this.viewHeight + navBarOffset + this.offset * 2) * -1,
            useNativeDriver: true,
            duration: animatedDuration,
            easing: Easing.bezier(.53, .67, .19, 1.1),
        }).start(() => {
            // this.setState({ currentNotiId: '' })
        });

        if (onHide) {
            onHide();
        }

        if (hideStatusBar) {
            IS_IOS && StatusBar.setHidden(false, 'slide');
        }
    };

    autohide = () => {

        const {
            autohide,
            duration,
        } = this.props;

        clearTimeout(this.timer);
        this.timer = undefined;
        autohide && (this.timer = setTimeout(this.hide, duration));
    };

    onGestureEvent = (event) => {

        const { translationY } = event.nativeEvent;

        const value = translationY > 0
            ? translationY / 9
            : translationY / (IS_IOS ? 2 : 1);

        this.translateY.setValue(value);

        if (this.props.onDragGestureEvent) {
            this.props.onDragGestureEvent(event);
        }
    };

    onHandlerStateChange = (event) => {
        const { velocityY, translationY, numberOfPointers } = event.nativeEvent;

        if (this.props.onDragGestureHandlerStateChange) {
            this.props.onDragGestureHandlerStateChange(event);
        }

        if (velocityY < minVelocityToFling && numberOfPointers === 0) {
            Animated.spring(this.translateY, {
                toValue: (this.viewHeight + this.offset * 2) * -1,
                useNativeDriver: true,
                velocity: velocityY,
            }).start();
            return;
        }

        if (translationY > ((this.viewHeight / 2) * -1) && numberOfPointers === 0) {
            this.show();
        } else {
            this.hide();
        }
    };

    onTapHandlerStateChange = (event) => {
        const { state } = event.nativeEvent;

        switch (state) {
            case 2:
                clearTimeout(this.timer);
                break;
            case 4:
                this.autohide();
                this.props.onPress(this.state.dataNoti);
                break;
            default:
                break;
        }
    };

    handleOnLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        this.viewHeight = height;
        if (!this.onLayoutHasBeenInvoked) {
            this.onLayoutHasBeenInvoked = true;
            this.translateY.setValue((height + navBarOffset + this.offset * 2) * -1);
        }
    };

    renderOwnComponent() {
        const { textColor, text } = this.props;
        return <Text allowFontScaling={true} style={[IOStyle.text, { color: textColor }]}>{text}</Text>;
    }
}
