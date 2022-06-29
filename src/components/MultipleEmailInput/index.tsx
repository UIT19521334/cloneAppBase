/**
 * @file    : MultipleEmailInput/index.js
 * @author  : Manh Le
 * @date    : 2022-04-13
 * @purpose : Create UI select multiple email
*/

import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getLabel } from '../../utils/commons/commons';

type MultipleEmailInputProps = {
    label: string,
    required?: string | number,
    value: string,
    onValueChange: ((value: string) => void) | undefined,
    isSubmitted?: boolean
}

export default function MultipleEmailInput({
    label,
    required = 0,
    value = '',
    onValueChange = undefined,
    isSubmitted = false
}: MultipleEmailInputProps) {

    const [emails, setEmails] = useState<Array<string>>([]);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (value) {
            let mails = value.split(" |##| ");
            setEmails(mails);
        }
        else {
            setEmails([]);
        }

        return () => { }
    }, [value]);

    return (
        <View
            style={{
                ...styles.container
            }}
        >
            {/* Title */}
            <Text
                style={{
                    ...styles.label
                }}
            >
                {label} <Text style={{ color: 'red' }}>{required == 1 ? "*" : ""}</Text>
            </Text>
            {/* Title */}


            {/* Email selected list */}
            <View
                style={{
                    ...styles.resultView
                }}
            >
                {
                    emails.map((mail, index) => {
                        return (
                            <View
                                key={index}
                                style={{
                                    ...styles.itemContent
                                }}
                            >
                                <Text
                                    style={{
                                        ...styles.itemText
                                    }}
                                >
                                    {mail}
                                </Text>

                                <TouchableOpacity
                                    style={{ ...styles.btn_remove }}
                                    onPress={() => {
                                        let mails = [...emails];
                                        mails.splice(index, 1);
                                        onValueChange?.(mails.join(' |##| '));
                                    }}
                                >
                                    <Icon name='times' color={Colors.white.white1} />
                                </TouchableOpacity>

                            </View>
                        )
                    })
                }
            </View>
            {/* Email selected list */}

            {/* input new Email */}
            <View
                style={{
                    ...styles.inputContent,
                    borderBottomColor: (required == 1 && isSubmitted && !value) ? Colors.functional.dangerous : Colors.black.black2,
                }}
            >
                <TextInput
                    placeholder={label}
                    style={{
                        ...styles.input
                    }}
                    autoCapitalize={'none'}
                    clearButtonMode='while-editing'
                    keyboardType='email-address'
                    value={email}
                    onChangeText={setEmail}
                    onSubmitEditing={() => {
                        if (Global.validateEmail(email)) {
                            let res = [...emails];
                            res.push(email);
                            onValueChange?.(res.join(' |##| '));
                            setEmail('');
                        }
                        else {
                            Alert.alert(
                                getLabel('notification.title'),
                                getLabel('ticket.msg_invalid_email')
                            )
                        }
                    }}
                />

                {/* Button add email to selected list*/}
                <TouchableOpacity
                    style={{ ...styles.btn_add }}
                    onPress={() => {
                        if (Global.validateEmail(email)) {
                            let res = [...emails];
                            res.push(email);
                            onValueChange?.(res.join(' |##| '));
                            setEmail('');
                        }
                        else {
                            Alert.alert(
                                getLabel('notification.title'),
                                getLabel('Email không hợp lệ!. Vui lòng nhập lại.')
                            )
                        }
                    }}
                >
                    <Text
                        style={{
                            ...styles.btn_add_text
                        }}
                    >
                        {getLabel('common.btn_add_email')}
                    </Text>
                </TouchableOpacity>
            </View>
            {/* input new Email */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 80,
        paddingHorizontal: 12,
        paddingTop: 16,
        paddingBottom: 16
    },
    label: {
        color: Colors.black.black1,
        marginBottom: 4
    },
    input: {
        height: 44,
        paddingLeft: 6,
        flex: 1
    },

    inputContent: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btn_add: {
        height: 44,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btn_add_text: {
        fontSize: 12,
        color: Colors.functional.primary
    },
    resultView: {
        paddingVertical: 4,
    },
    itemContent: {
        paddingLeft: 12,
        borderRadius: 4,
        backgroundColor: Colors.functional.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 4
    },
    itemText: {
        fontSize: 14,
        color: Colors.white.white1,
        flex: 1
    },
    btn_remove: {
        paddingHorizontal: 12,
        paddingVertical: 12
    }

})