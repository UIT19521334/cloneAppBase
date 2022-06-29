/**
 * @file    : AlertPopup.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : component custom UI Alert
*/

import React, { Component } from 'react';
import { Modal, Text, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
//Component
import { hideAlert } from '../../redux/actions/alert';
import { Colors } from '../../themes/colors/Colors';
import { Box } from '../../themes/themes';
import { widthDevice } from '../../utils/commons/commons';
import { SpaceS } from '../CustomComponentView';
import styles from './styles';

class AlertPopup extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        // get props action from the Redux
        const { hideAlert, alertState } = this.props;

        if (alertState.isShow) {
            return (
                <Modal
                    visible={alertState.isShow}
                    transparent={true}
                    animationType='fade'
                >
                    <Box
                        style={[
                            styles.boxContainer,
                            {
                                backgroundColor: 'transparent'
                            }
                        ]}
                    >
                        <Box
                            width={widthDevice}
                            style={styles.backDrop}

                        />

                        <Box
                            style={styles.boxContent}
                        >
                            <Box
                                style={[
                                    styles.messageContainer
                                ]}
                            >
                                <SpaceS />

                                {/* Start: Render title Alert */}
                                {
                                    alertState.title ?
                                        (
                                            <Box
                                                style={[
                                                    styles.header
                                                ]}
                                            >
                                                <Text
                                                    allowFontScaling={true}
                                                    style={[
                                                        styles.title
                                                    ]}
                                                >
                                                    {alertState.title}
                                                </Text>
                                            </Box>
                                        )
                                        : null
                                }
                                {/* End: Render title Alert */}

                                {/* Start: Render body message Alert */}
                                <Box
                                    style={[
                                        styles.messageContent
                                    ]}
                                >
                                    <Text
                                        allowFontScaling={true}
                                        style={[styles.message]}
                                    >
                                        {alertState.message}
                                    </Text>
                                </Box>
                                {/* End: Render body message Alert */}

                                <SpaceS />
                            </Box>

                            {/* Start: Render actions Alert */}
                            <Box
                                style={[
                                    styles.footer,
                                    {
                                        flexDirection: alertState.actions?.length > 2 ? 'column' : 'row',
                                    }
                                ]}
                            >
                                {/* Has below 3 actions */}
                                {

                                    (alertState.actions?.length < 3) && alertState.actions?.map((action, idx) => {
                                        let actionsStyle = (idx === 0)
                                            ? styles.actionLeft
                                            : styles.actionRight;
                                        let borderRightStyle = alertState.actions?.length == 1 ? { borderBottomRightRadius: 10 } : {};
                                        let textStyle = action.isCancel ? styles.actionTextCancel : (action.isHighLight ? styles.actionTextDeleted : styles.actionText);

                                        return (
                                            <TouchableHighlight
                                                key={idx}
                                                activeOpacity={0.3}
                                                underlayColor={Colors.white.white3}
                                                style={[
                                                    styles.action,
                                                    actionsStyle,
                                                    borderRightStyle
                                                ]}
                                                onPress={() => {
                                                    if (action?.isCancel) {
                                                        hideAlert?.();
                                                    }
                                                    else {
                                                        hideAlert?.();
                                                        setTimeout(() => {
                                                            action.onPress?.();
                                                        }, 500);
                                                    }
                                                }}
                                            >
                                                <Text
                                                    allowFontScaling={true}
                                                    style={[
                                                        textStyle,
                                                        action?.textStyle
                                                    ]}
                                                >
                                                    {action?.label || ''}
                                                </Text>
                                            </TouchableHighlight>
                                        );
                                    })
                                }

                                {/* Has above 3 actions */}
                                {
                                    (alertState.actions?.length > 2) && alertState.actions?.map((action, idx) => {
                                        let actionsStyle = (idx === alertState.actions?.length - 1)
                                            ? styles.actionBottom
                                            : {
                                                borderBottomWidth: .7,
                                                borderBottomColor: Colors.white.white4,
                                            };
                                        let textStyle = action.isCancel ? styles.actionTextCancel : (action.isHighLight ? styles.actionTextDeleted : styles.actionText);

                                        return (
                                            <TouchableHighlight
                                                activeOpacity={0.3}
                                                underlayColor={Colors.white.white3}
                                                style={[
                                                    styles.action,
                                                    actionsStyle
                                                ]}
                                                onPress={() => {
                                                    if (action?.isCancel) {
                                                        hideAlert?.();
                                                    }
                                                    else {
                                                        hideAlert?.();
                                                        setTimeout(() => {
                                                            action.onPress?.();
                                                        }, 500);
                                                    }
                                                }}
                                            >
                                                <Text
                                                    allowFontScaling={true}
                                                    style={[
                                                        textStyle,
                                                        action?.textStyle
                                                    ]}
                                                >
                                                    {action?.label || ''}
                                                </Text>
                                            </TouchableHighlight>
                                        );
                                    })
                                }
                            </Box>
                            {/* End: Render actions Alert */}
                        </Box>
                    </Box>
                </Modal >
            )
        } else {
            return null;
        }

    }
}

function bindAction(dispatch) {
    return {
        hideAlert: () => dispatch(hideAlert()),
    };
}

const mapStateToProps = state => ({
    alertState: state.alert,
});

export default connect(mapStateToProps, bindAction)(AlertPopup);