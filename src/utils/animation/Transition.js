/**
 * @file    : TransitionView.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Custom animation transition base on View
 * @member  : Manh Le
*/

import React, { Component, PureComponent } from 'react';
import * as Animatable from 'react-native-animatable';

export const TransitionView = ({ transitionDuration = 1000, position = 1, ...rest }) => {
    return (
        <Animatable.View
            animation="fadeIn"
            duration={transitionDuration}
            delay={position ? (position * transitionDuration) / 5 : 0}
            useNativeDriver
            {...rest}
        >
        </Animatable.View>
    );
}