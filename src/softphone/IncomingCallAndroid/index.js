import React, { Component } from 'react'
import { Text, View, NativeModules, DeviceEventEmitter } from 'react-native'
import Global from '../../Global'
const { IncomingCallCustom } = NativeModules;

export interface IncomingCallAndroidOptions {
    callUUID: string,
    fromAlias: string,
    avatar: string,
    infoText: string,
    companyName: string,
    timeOutEndCall: number 
}

type IncomingCallEvents = {
    answer: (payload) => {},
    endCall: (payload) => {},
    toggleMute: (response: {isMute: boolean}) => {},
    toggleSpeaker: (response: {isSpeaker: boolean}) => {}
}

const IncomingCallActionEvents = {
    answer: 'answerCallNative',
    endCall: 'endCallNative',
    toggleMute: 'changeStateMute',
    toggleSpeaker: 'changeStateSpeaker'
}

export const IncomingCallAction = {
    ANSWER_CALL: 'answerCallNative',
    END_CALL: 'endCallNative',
    SET_MUTE: 'changeStateMute',
    SET_SPEAKER: 'changeStateSpeaker'
}

export default class IncomingCallAndroid extends Component {

    static registerEventIncomingCall(events: IncomingCallEvents){
        if (typeof events != "object") {
            return;
        }

        Object.keys(events).forEach((e) => {
            const event = DeviceEventEmitter.addListener(IncomingCallActionEvents[e], events[e]);
            Global.subscriptions.push(event)
        })
    }
    
    static display = (options : IncomingCallAndroidOptions) => {
        return IncomingCallCustom.display(
            options.callUUID,
            options.fromAlias,
            options.avatar,
            options.infoText,
            options.companyName,
            options.timeOutEndCall
        )
    }
    
    static display1 = (options : IncomingCallAndroidOptions) => {
        return IncomingCallCustom.display1(
            options.callUUID,
            options.fromAlias,
            options.avatar,
            options.infoText,
            options.companyName,
            options.timeOutEndCall
        )
    }

    static setCallScreenActive = (uuid: string) => {
        return IncomingCallCustom.setCallActive(uuid);
    }

    static dismiss = () => {
        return IncomingCallCustom.dismiss();
    }

    static dismissAnswer = () => {
        return IncomingCallCustom.dismissAnswer();
    }
    
    static backToForeground = () => {
        return IncomingCallCustom.backToForeground();
    }

    static backToMyApp = () => {
        return IncomingCallCustom.backToMyApp();
    }

    static openAppFromHeadlessMode = (uuid) => {
        return IncomingCallCustom.openAppFromHeadlessMode(uuid);
    }

    static setMute = (isMute: 'ON' | 'OFF') => {
        return IncomingCallCustom.setMute(isMute);
    }

    static setSpeaker = (isSpeaker: 'ON' | 'OFF') => {
        return IncomingCallCustom.setSpeaker(isSpeaker);
    }

    render() {
        return null;
    }
}
