import React, { Fragment } from 'react';
import { Animated, View } from 'react-native';
import {
  PanGestureHandler,
  ForceTouchGestureHandler,
  TapGestureHandler
} from 'react-native-gesture-handler';
import { NotificationBase } from './NotificationBase';
import { IOStyle } from './iOStyle';
import { Util } from '../Util';
import { Blur } from '../RNInAppMessage/Blur';
import NotificationCustom from '../../../../components/NotificationCustom';

const ForceTouchHandler = ForceTouchGestureHandler.forceTouchAvailable ? ForceTouchGestureHandler : View;

export class Notification extends NotificationBase {

  static defaultProps = {
    blurAmount: 7,
    duration: 2000,
    showKnob: true,
    onPress: () => null,
    textColor: '#000',
    autohide: true,
    blurType: 'light',
    hideStatusBar: true,
    useForceTouch: false,
  };

  offset = Util.isIphoneX() ? 42 : (this.props.hideStatusBar ? 8 : 22);

  render() {
    const {
      textColor,
      customComponent,
      blurAmount,
      blurType,
      onPress,
      style,
      useForceTouch,
      showKnob,
      onForceTouchGestureEvent,
      onForceTouchHandlerStateChange,
    } = this.props;

    const animatedStyle = [
      IOStyle.notification,
      {
        top: this.offset,
        transform: [{ translateY: this.translateY }],
      },
      IOStyle.mainStyle,
    ];

    const border = style ? style.borderRadius : 14;
    return (
      <Fragment>
        <PanGestureHandler
          onHandlerStateChange={this.onHandlerStateChange}
          onGestureEvent={this.onGestureEvent}>

          <Animated.View
            onLayout={this.handleOnLayout}
            style={animatedStyle}>

            <Animated.View
              style={[IOStyle.innerContainer, style]}>

              <TapGestureHandler
                style={IOStyle.container}
                onHandlerStateChange={this.onTapHandlerStateChange}>

                <View>
                  <Blur
                    style={[IOStyle.absolute, { borderRadius: border || 14 }]}
                    blurType={blurType}
                    blurAmount={blurAmount}
                  />
                  <ForceTouchHandler
                    minForce={0.2}
                    enabled={useForceTouch}
                    onGestureEvent={onForceTouchGestureEvent}
                    onHandlerStateChange={onForceTouchHandlerStateChange}>
                    <View style={IOStyle.content}>
                      {customComponent ? customComponent?.(this.props) : <NotificationCustom notification={this.state.dataNoti} />}
                      {showKnob && <View style={[IOStyle.knob, { backgroundColor: textColor }]} />}
                    </View>
                  </ForceTouchHandler>
                </View>

              </TapGestureHandler>

            </Animated.View>

          </Animated.View>

        </PanGestureHandler>
      </Fragment>
    );
  }
}
