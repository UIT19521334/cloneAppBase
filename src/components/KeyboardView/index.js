/**
 * @file    : KeyboardView/index.js
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : Create UI keyboard use in Soft Phone Call Screen
*/

import { Icon } from 'native-base'
import React, { PureComponent } from 'react'
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native'
import { heightDevice, widthDevice } from '../../utils/commons/commons'

// define props type
interface KeyboardViewProps {
    pressDTMF: (dtmf: string) => void;
    dtmf: String;
    onClose: () => void
}

export default class KeyboardView extends PureComponent<KeyboardViewProps> {
    state = {
        keyPressed: ''
    }

    onKeyPress(key) {
        Vibration.vibrate([10]);

        this.setState({ keyPressed: this.state.keyPressed + key }, () => {
            this.props.pressDTMF?.(key);
        });
    }

    render() {
        return (
            <View
                style={{
                    ...styles.container
                }}
            >
                <View style={{
                    ...styles.backdrop
                }}
                    onTouchEnd={() => this.props.onClose?.()}

                />

                <View
                    style={{
                        ...styles.content
                    }}
                >
                    <View
                        style={{
                            ...styles.headerContent
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 30 / 2,
                                backgroundColor: '#e0e0e0',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onPress={() => this.props.onClose?.()}
                        >
                            <Icon
                                name='close'
                                color='#333'
                                size={widthDevice * .4}
                            />
                        </TouchableOpacity>
                    </View>

                    <View
                        style={styles.inputContent}
                    >
                        <Text style={{ ...styles.input }}>
                            {this.state.keyPressed || ''}
                        </Text>
                    </View>

                    <View
                        style={{ ...styles.row }}
                    >
                        <Numpad
                            pad="1"
                            onPress={() => { this.onKeyPress("1") }}
                        />

                        <Numpad
                            pad="2"
                            onPress={() => { this.onKeyPress("2") }}
                        />

                        <Numpad
                            pad="3"
                            onPress={() => { this.onKeyPress("3") }} /
                        >
                    </View>

                    <View
                        style={{ ...styles.row }}
                    >
                        <Numpad
                            pad="4"
                            onPress={() => { this.onKeyPress("4") }}
                        />

                        <Numpad
                            pad="5"
                            onPress={() => { this.onKeyPress("5") }}
                        />

                        <Numpad
                            pad="6"
                            onPress={() => { this.onKeyPress("6") }}
                        />
                    </View>

                    <View
                        style={{ ...styles.row }}
                    >
                        <Numpad
                            pad="7"
                            onPress={() => { this.onKeyPress("7") }}
                        />

                        <Numpad
                            pad="8"
                            onPress={() => { this.onKeyPress("8") }}
                        />

                        <Numpad
                            pad="9"
                            onPress={() => { this.onKeyPress("9") }}
                        />
                    </View>

                    <View
                        style={{ ...styles.row }}
                    >
                        <Numpad
                            pad="0"
                            onPress={() => { this.onKeyPress("0") }}
                        />
                    </View>
                </View>
            </View>
        )
    }
}


const Numpad = ({ pad, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ ...styles.numpad }}
        >
            <Text
                style={{ ...styles.pad }}
            >
                {pad}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: widthDevice,
        height: heightDevice,
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: Number.MAX_SAFE_INTEGER
    },
    backdrop: {
        flex: 4,
        backgroundColor: '#333',
        opacity: .2
    },
    content: {
        // flex: 6,
        backgroundColor: '#fff',
        borderTopColor: '#d0d0d0',
        borderTopWidth: 1,
        paddingBottom: 20
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexDirection: 'row',
        paddingVertical: 12
    },
    pad: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff'
    },
    numpad: {
        width: widthDevice * 0.17,
        height: widthDevice * 0.17,
        borderRadius: widthDevice * 0.17,
        backgroundColor: '#a0a0a0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputContent: {
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        fontSize: widthDevice * 0.065,
        fontWeight: 'bold',
        color: '#333'
    },
    headerContent: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 12,
        paddingTop: 8
    }


})
