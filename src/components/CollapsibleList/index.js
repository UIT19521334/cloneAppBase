/**
 * @file    : CollapsibleList.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : create UI collapsible for list view
*/

import React, { Component } from 'react';
import {
    LayoutAnimation, Platform, TouchableOpacity, UIManager, View
} from 'react-native';
import CollapsibleListProps from '../../utils/Models/models';

export default class CollapsibleList extends Component<CollapsibleListProps, null> {
    constructor(props) {
        super(props);

        if (
            Platform.OS === 'android' &&
            UIManager.setLayoutAnimationEnabledExperimental
        ) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }

        this.animationConfig = {
            duration: 700,
            update: {
                type: 'spring',
                springDamping: 0.7,
                property: 'scaleXY',
            },
        };

        this.state = {
            minHeight: 0,
            currentHeight: null,
            collapsed: false,
            initialized: false,
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(() => {
            if (this.props.isShow) {
                this.toggle();
            }
        }, 300);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    setMinHeight = (event) => {
        const { height: minHeight } = event.nativeEvent.layout;

        this.setState({ minHeight }, () => {
            this.setState({
                initialized: true,
                currentHeight: minHeight
            });
        });
    }

    toggle = () => {
        const { minHeight, collapsed } = this.state;
        const { onToggle, animationConfig } = this.props;
        let nextHeight;

        if (collapsed) {
            nextHeight = minHeight;
        }
        else {
            nextHeight = null;
        }

        LayoutAnimation.configureNext({
            ...this.animationConfig,
            ...animationConfig,
        });

        this.setState({
            currentHeight:
                nextHeight,
            collapsed: !collapsed
        }, () => {
            if (onToggle) {
                onToggle(this.state.collapsed);
            }
        });
    }

    renderButton = () => {
        const {
            numberOfVisibleItems,
            buttonContent,
            children
        } = this.props

        if (numberOfVisibleItems > React.Children.count(children)) return null

        return (
            <View>
                <TouchableOpacity
                    onPress={this.toggle}
                    activeOpacity={0.8}
                >
                    {buttonContent}
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { initialized, currentHeight } = this.state;
        const {
            numberOfVisibleItems,
            buttonPosition = 'bottom',
            wrapperStyle,
            children,
        } = this.props;

        return (
            <View
                style={wrapperStyle}
            >
                {buttonPosition === 'top' && this.renderButton()}

                <View
                    style={{
                        overflow: 'hidden',
                        height: currentHeight
                    }}
                >
                    <View
                        style={{
                            flex: 1
                        }}
                        onLayout={this.setMinHeight}
                    >
                        {React.Children.toArray(children).slice(0, numberOfVisibleItems)}
                    </View>

                    {initialized && (
                        <View>
                            {React.Children.toArray(children)
                                .slice(numberOfVisibleItems)
                                .map((item, index) => (
                                    <View
                                        key={index}
                                    >
                                        {item}
                                    </View>
                                ))}
                        </View>
                    )}
                </View>

                {buttonPosition === 'bottom' && this.renderButton()}
            </View>
        );
    }
}