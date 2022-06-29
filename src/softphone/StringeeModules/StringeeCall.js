import React, { Component } from 'react'
import { Text, View, NativeModules, DeviceEventEmitter } from 'react-native'
const { RNStringeeCallCustom } = NativeModules;
import Global from '../../Global';
interface EventCalltHandler {
    onChangeSignalingState: (response: { callId: string, code: number, reason: string, sipCode: number, sipReason: string }) => void;
    onChangeMediaState: (response: { callId: string, code: number, description: string }) => void;
    onReceiveLocalStream: (response: { callId: string }) => void;
    onReceiveRemoteStream: (response: { callId: string }) => void;
    onReceiveCallInfo: (response: { callId: string, data: string }) => void;
    onHandleOnAnotherDevice: (response: { callId: string, code: number, description: string }) => void;
}

const EventCall = {
    onChangeSignalingState: "onSignalingStateChange",
    onChangeMediaState: "onMediaStateChange",
    onReceiveLocalStream: "onLocalStream",
    onReceiveRemoteStream: "onRemoteStream",
    onReceiveCallInfo: "onCallInfo",
    onHandleOnAnotherDevice: "onHandledOnAnotherDevice"
}

export type RNStringeeEventCallback = (
    status: boolean,
    code: int,
    message: string
) => void;

export default class StringeeCall extends Component {

    static registerCallEventHandlers(events: EventCalltHandler) {
        if (typeof events !== "object") {
            return;
        }

        Object.keys(events).forEach((eventKey) => {
            const eventStringeeCall = DeviceEventEmitter.addListener(EventCall[eventKey], events[eventKey]);
            RNStringeeCallCustom.setNativeEvent(EventCall[eventKey]);
            Global.subscriptions.push(eventStringeeCall);
        })
    }

    static makeCall(parameters: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.makeCall(parameters, callback);
    }

    static initAnswer(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.initAnswer(callId, callback);
    }

    static answer(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.answer(callId, callback);
    }

    static hangup(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.hangup(callId, callback);
    }

    static reject(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.reject(callId, callback);
    }

    static sendDTMF(callId: string, dtmf: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.sendDTMF(callId, dtmf, callback);
    }

    static sendCallInfo(
        callId: string,
        callInfo: string,
        callback: RNStringeeEventCallback
    ) {
        RNStringeeCallCustom.sendCallInfo(callId, callInfo, callback);
    }

    static getCallStats(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.getCallStats(callId, callback);
    }

    static switchCamera(callId: string, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.switchCamera(callId, callback);
    }

    static enableVideo(
        callId: string,
        enabled: boolean,
        callback: RNStringeeEventCallback
    ) {
        RNStringeeCallCustom.enableVideo(callId, enabled, callback);
    }

    static mute(callId: string, mute: boolean, callback: RNStringeeEventCallback) {
        RNStringeeCallCustom.mute(callId, mute, callback);
    }

    static setSpeakerphoneOn(
        callId: string,
        on: boolean,
        callback: RNStringeeEventCallback
    ) {
        RNStringeeCallCustom.setSpeakerphoneOn(callId, on, callback);
    }

    static resumeVideo(
        callId: string,
        callback: RNStringeeEventCallback
    ) {
        RNStringeeCallCustom.resumeVideo(callId, callback);
    }

    render() {
        return null;
    }
}
