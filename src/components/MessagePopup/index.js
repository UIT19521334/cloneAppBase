/**
 * @file    : MessagePopup/index.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Create custom message popup UI
*/

import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { connect } from 'react-redux';
import { hiddenMessage } from '../../redux/actions/messagePopup';
import { Colors } from '../../themes/colors/Colors';
//Import Component
import { Icon } from '../../themes/Icons/CustomIcon';
import { getLabel, isIphoneX, widthDevice } from '../../utils/commons/commons';
import { MessageTemplateProps } from '../../utils/Models/models';
import { SpaceL, SpaceS } from '../CustomComponentView';

class MessageTemplate extends Component<MessageTemplateProps, null>{

    constructor(props) {
        super(props);
        this.timeOutHidden = null;

        this.state = {
            animTransition: new Animated.Value(-380),
        }
    }

    componentDidUpdate() {

        if (this.props.messageData.type === 'NONE') {
            this.hiddenMessage();
        }
        else {
            this.showMessage();
        }
    }

    showMessage = () => {
        Animated.timing(
            this.state.animTransition,
            {
                toValue: 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
            }
        )
            .start(({ }) => {
                this.timeOutHidden = setTimeout(() => {
                    if (this.props.messageData.type != 'NONE') {
                        this.props.onClose?.();
                    }
                }, 3000);
            });
    }

    hiddenMessage = () => {
        Animated.timing(
            this.state.animTransition, {
            toValue: -380,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true
        }).start();
    }

    render() {
        const transformStyle = {
            transform: [{
                translateY: this.state.animTransition,
            }]
        }

        let title = '';
        const messageData = this.props.messageData;

        if (messageData?.title && messageData.title != '') {
            title = messageData.title;
        }
        else {
            if (messageData?.type == 'SUCCESS') {
                title = getLabel('common.label_success');
            }
            else if (messageData?.type == 'ERROR') {
                title = getLabel('common.label_error');
            }
            else if (messageData?.type == 'WARING') {
                title = getLabel('common.label_warning');
            }
        }

        return (
            <Animated.View
                onTouchEnd={() => {
                    clearTimeout(this.timeOutHidden);
                    this.props.onClose?.();
                }}
                style={[
                    styles.notificationContainer,
                    styles.shadow,
                    transformStyle
                ]}
            >

                <SpaceL />

                <View>
                    {
                        messageData.icon ? (
                            <Icon
                                name={messageData.icon}
                                style={{
                                    fontSize: 28,
                                    color: messageData.color,
                                    alignSelf: 'center'
                                }}
                            />
                        ) : null
                    }
                </View>

                <View
                    style={{
                        flex: 1
                    }}
                >
                    {
                        messageData?.title || title != '' ? (
                            <>
                                <Text
                                    allowFontScaling={true}
                                    numberOfLines={1}
                                    style={{
                                        color: messageData?.color || '#333',
                                        paddingHorizontal: 20,
                                        fontSize: 16
                                    }}
                                >
                                    {title}
                                </Text>

                                <SpaceS />
                            </>
                        ) : null
                    }

                    <Text
                        allowFontScaling={true}
                        numberOfLines={3}
                        style={{
                            color: Colors.black.black1,
                            paddingHorizontal: 20,
                            fontSize: 14
                        }}
                    >
                        {messageData.message}
                    </Text>
                </View>
            </Animated.View>
        );
    }
}

class MessagePopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            animation: new Animated.Value(-380),
        }
    }

    render() {
        const { messagePopupState, hiddenMessage } = this.props;

        return (
            <MessageTemplate
                messageData={{
                    type: messagePopupState.type,
                    message: messagePopupState.message,
                    icon: messagePopupState.icon,
                    color: messagePopupState.color
                }}
                onClose={() => hiddenMessage()}
            >
            </MessageTemplate>
        )
    }
}

function bindAction(dispatch) {
    return {
        hiddenMessage: () => dispatch(hiddenMessage()),
    };
}

const mapStateToProps = state => ({
    messagePopupState: state.messagePopup,
});

export default connect(mapStateToProps, bindAction)(MessagePopup);

const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        width: widthDevice * .8,
        height: null,
        left: widthDevice * .1,
        top: isIphoneX ? (34 + 10) : 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14
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
});