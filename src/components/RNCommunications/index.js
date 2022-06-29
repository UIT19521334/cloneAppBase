/**
 * @file    : RNCommunications/index.js
 * @author  : Manh Le
 * @date    : 2022-06-21
 * @purpose : Custom Native module Communications fix error on the android devices
 * */

'use strict';

import React from 'react';
import ReactNative, { Platform } from 'react-native';
import Communications from 'react-native-communications';

const isHtmlString = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const isCorrectType = function (expected, actual) {
    return Object.prototype.toString.call(actual).slice(8, -1) === expected;
};

const getValidArgumentsFromArray = function (array, type) {
    var validValues = [];
    array.forEach(function (value) {
        if (isCorrectType(type, value)) {
            validValues.push(value);
        }
    });

    return validValues;
};

const phoneCallHandle = function (phoneNumber, prompt) {
    if (arguments.length !== 2) {
        console.log("Error!", 'You must supply exactly 2 arguments');
        return;
    }
    if (!isCorrectType('String', phoneNumber)) {
        console.log('Error!', 'The phone number must be provided as a String value');
        return;
    }

    if (!isCorrectType('Boolean', prompt)) {
        console.log('Error!', 'The prompt parameter must be a Boolean');
        return;
    }
    if (ReactNative.Platform.OS == 'android') {
        ReactNative.NativeModules?.CommunicationsModule?.phoneCall(phoneNumber)
            .then((res) => {
                console.log(res);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    else if (ReactNative.Platform.OS == 'ios') {
        ReactNative.NativeModules?.CommunicationsHelper?.phoneCall(phoneNumber, prompt || false)
    }
}

const textSMS = function (phoneNumber = null, body = null) {
    if (arguments.length > 2) {
        console.log("Error!", 'You supplied too many arguments. You can either supply 0 or 1 or 2');
        return;
    }

    if (phoneNumber) {
        if (!isCorrectType('String', phoneNumber)) {
            console.log('the phone number should be provided as a string. It was provided as '
                + Object.prototype.toString.call(phoneNumber).slice(8, -1)
                + ',ignoring the value provided');
        }
    }

    if (body) {
        if (isCorrectType('String', body)) {
            // for some strange reason android seems to have issues with ampersands in the body unless it is encoded twice!
            // iOS only needs encoding once
            if (Platform.OS === 'android') body = encodeURIComponent(body);
            body = `${encodeURIComponent(body)}`;
        } else {
            console.log('the body should be provided as a string. It was provided as '
                + Object.prototype.toString.call(body).slice(8, -1)
                + ',ignoring the value provided');
        }
    }

    if (ReactNative.Platform.OS == 'android') {
        ReactNative.NativeModules?.CommunicationsModule?.text(phoneNumber, body)
            ?.then((res) => {
                console.log(res);
            })
            ?.catch((error) => {
                console.log(error);
            });
    }
    else if (ReactNative.Platform.OS == 'ios') {
        ReactNative.NativeModules?.CommunicationsHelper?.text(phoneNumber, body)
    }


}

const textWithoutEncodingSMS = function (phoneNumber = null, body = null) {
    if (arguments.length > 2) {
        console.log("Error!", 'You supplied too many arguments. You can either supply 0 or 1 or 2');
        return;
    }

    if (phoneNumber) {
        if (!isCorrectType('String', phoneNumber)) {
            console.log('the phone number should be provided as a string. It was provided as '
                + Object.prototype.toString.call(phoneNumber).slice(8, -1)
                + ',ignoring the value provided');
        }
    }

    if (body) {
        if (!isCorrectType('String', body)) {
            console.log('the body should be provided as a string. It was provided as '
                + Object.prototype.toString.call(body).slice(8, -1)
                + ',ignoring the value provided');
        }
    }

    if (ReactNative.Platform.OS == 'android') {
        ReactNative.NativeModules?.CommunicationsModule?.text(phoneNumber, body)
            ?.then((res) => {
                console.log(res);
            })
            ?.catch((error) => {
                console.log(error);
            });
    }
    else if (ReactNative.Platform.OS == 'ios') {
        ReactNative.NativeModules?.CommunicationsHelper?.text(phoneNumber, body)
    }
}

const emailHandler = function (to, cc, bcc, subject, body) {
    let argLength = arguments.length;
    console.log('arguments', arguments);
    console.log('argLength', argLength);

    switch (argLength) {
        case 0:
            if (ReactNative.Platform.OS == 'android') {
                ReactNative.NativeModules?.CommunicationsModule?.email(null, null, null, "", "")
                    ?.then((res) => {
                        console.log(res);
                    })
                    ?.catch((error) => {
                        console.log(error);
                    });
            }
            else if (ReactNative.Platform.OS == 'ios') {
                ReactNative.NativeModules?.CommunicationsHelper?.email([], [], [], "", "", false);
            }

            return;
        case 5:
            break;
        default:
            console.log('you must supply either 0 or 5 arguments. You supplied ' + argLength);
            return;
    }

    // check the first argument
    if (arguments[0] && isCorrectType('Array', arguments[0])) {
        let validAddresses = getValidArgumentsFromArray(arguments[0], 'String');

        if (validAddresses.length > 0) {
            to = validAddresses
        }
    }
    else if (arguments[0]) {
        throw ('Error: The first argument must an array value!');
    }
    else if (!arguments[0]) {
        if (ReactNative.Platform.OS == 'android') {
            ReactNative.NativeModules?.CommunicationsModule?.email(null, null, null, "", "")
                ?.then((res) => {
                    console.log(res);
                })
                ?.catch((error) => {
                    console.log(error);
                });
        }
        else if (ReactNative.Platform.OS == 'ios') {
            ReactNative.NativeModules?.CommunicationsHelper?.email([], [], [], "", "", false);
        }

        return;
    }

    // check the seconds argument
    if (arguments[1] && isCorrectType('Array', arguments[1])) {
        let validAddresses = getValidArgumentsFromArray(arguments[1], 'String');

        if (validAddresses.length > 0) {
            cc = validAddresses
        }
    }
    else if (arguments[1]) {
        throw ('Error: The seconds argument must an array value!');
    }

    // check the third argument
    if (arguments[2] && isCorrectType('Array', arguments[2])) {
        let validAddresses = getValidArgumentsFromArray(arguments[2], 'String');

        if (validAddresses.length > 0) {
            bcc = validAddresses
        }
    }
    else if (arguments[2]) {
        throw ('Error: The third argument must an array value!');
    }

    // check the four argument
    if (arguments[3] && !isCorrectType('String', arguments[3])) {
        throw ('Error: The four argument must a String value!');
    }

    // check the five argument
    if (arguments[4] && !isCorrectType('String', arguments[4])) {
        throw ('Error: The five argument must a String value!');
    }

    if (ReactNative.Platform.OS == 'android') {
        ReactNative.NativeModules?.CommunicationsModule?.email(to, cc, bcc, subject || '', body || '')
            ?.then((res) => {
                console.log(res);
            })
            ?.catch((error) => {
                console.log(error);
            });
    }
    else if (ReactNative.Platform.OS == 'ios') {
        ReactNative.NativeModules?.CommunicationsHelper?.email(to || [], cc || [], bcc || [], subject || '', body || '', false);
    }
}

class RNCommunications {
    static phoneCall = (phoneNumber, prompt) => {
        phoneCallHandle(phoneNumber, prompt);
    }

    static text = (phoneNumber, body) => {
        textSMS(phoneNumber, body);
    }

    static textWithoutEncoding = (phoneNumber = null, body = null) => {
        textWithoutEncodingSMS(phoneNumber, body);
    }

    static web = (address = null) => {
        Communications.web(address);
    }

    static email = (to, cc, bcc, subject, body) => {
        try {
            emailHandler(to, cc, bcc, subject, body);
        } catch (error) {
            console.log('Error Send mail: ', error);
        }

    };
}

export default RNCommunications;