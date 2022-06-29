import { DeviceEventEmitter, AppState, Platform, NativeModules } from "react-native";
import RNCallKeep from "react-native-callkeep";
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-community/async-storage';
import IncomingCall from 'react-native-incoming-call';
import IncomingCallAndroid from '../IncomingCallAndroid'

export const ClientEventHandlers = {
    onConnect: ({ userId }) => {
        console.log('_clientDidConnect - ' + userId);

        DeviceEventEmitter.emit('Stringee.DidConnected', { userId: userId });
    },
    onDisConnect: () => {
        console.log('_clientDidDisConnect');
        // DeviceEventEmitter.emit('Stringee.RequestAccessNewToken');
    },
    onFailWithError: () => {
        console.log('_clientDidFailWithError');
    },
    onRequestAccessToken: () => {
        console.log("_clientRequestAccessToken");
        DeviceEventEmitter.emit('Stringee.RequestAccessNewToken');
    },
    onIncomingCall: (params) => {
        const { callId, from, to, fromAlias, toAlias, callType, isVideoCall } = params;
        console.log("IncomingCallId-" + callId + ' from-' + from + ' to-' + to + ' fromAlias-' + fromAlias + ' toAlias-' + toAlias + ' isVideoCall-' + isVideoCall + 'callType-' + callType);

        if (Platform.OS === 'ios') {
            DeviceEventEmitter.emit('Stringee.initCall', { data: params, direction: 'INBOUND' });
        }
        else {
            if (AppState.currentState === 'background') {
                console.log('Current state', AppState.currentState);

                // NativeModules.DetectLockScreen.isLockScreen().then((state) => {
                //     if (state === 'UNLOCK') {
                //         RNCallKeep.backToForeground();
                //         DeviceEventEmitter.emit('Stringee.initCall', { data: params, direction: 'INBOUND' });
                //     }
                //     else {
                //         // DeviceEventEmitter.emit('Stringee.initCall', { data: params, direction: 'INBOUND' });
                //         DeviceEventEmitter.emit('Stringee.initCallBackGround', { data: params, direction: 'INBOUND' });
                //     }
                // })
                DeviceEventEmitter.emit('Stringee.initCallBackGround', { data: params, direction: 'INBOUND' });

            }
            else {
                DeviceEventEmitter.emit('Stringee.initCall', { data: params, direction: 'INBOUND' });
            }
        }


    },
};

export const CallEventHandlers = {
    onChangeSignalingState: (params) => {
        const { callId, code, reason, sipCode, sipReason } = params
        console.log('onChangeSignalingState: callId-' + callId + 'code-' + code + ' reason-' + reason + ' sipCode-' + sipCode + ' sipReason-' + sipReason);
        if (code == 4) {
            RNCallKeep.endAllCalls();
            if (Platform.OS === 'android' && AppState.currentState === 'background') {
                IncomingCallAndroid.dismiss();
                IncomingCallAndroid.dismissAnswer();
                IncomingCallAndroid.backToForeground();
                const paramsData = {
                    callId: callId || ''
                }
                DeviceEventEmitter.emit('SoftPhone.AndroidClientEndCallOnBackground', paramsData)
            }
        }
        DeviceEventEmitter.emit('Stringee.HandleChangeSignalingState', { data: params });
    },
    onChangeMediaState: (params) => {
        const { callId, code, description } = params;
        console.log('onChangeMediaState: callId-' + callId + 'code-' + code + ' description-' + description);
        DeviceEventEmitter.emit('Stringee.HandleCChangeMediaState', { data: params });
    },
    onReceiveLocalStream: (params) => {
        const { callId } = params;
        console.log('_callDidReceiveLocalStream ' + callId);
        DeviceEventEmitter.emit('Stringee.HandleReceiveLocalStream', { data: params });
    },
    onReceiveRemoteStream: (params) => {
        const { callId } = params;
        console.log('_callDidReceiveRemoteStream ' + callId);
        DeviceEventEmitter.emit('Stringee.HandleReceiveRemoteStream', { data: params });
    },
    onReceiveDtmfDigit: (params) => {
        const { callId, dtmf } = params;
        console.log('_didReceiveDtmfDigit ' + callId + "***" + dtmf);
    },
    onReceiveCallInfo: (params) => {
        const { callId, data } = params;
        console.log('_didReceiveCallInfo ' + callId + "***" + data);
    },
    onHandleOnAnotherDevice: (params) => {
        const { callId, code, description } = params;
        console.log('_didHandleOnAnotherDevice ' + callId + "***" + code + "***" + description);
        if (code == 2 || code == 3 || code == 4) {
            // Answered || Busy || End
            RNCallKeep.endAllCalls();
            if (Platform.OS === 'android') {
                IncomingCallAndroid.dismiss();
                IncomingCallAndroid.dismissAnswer();
            }
        }
        DeviceEventEmitter.emit('Stringee.HandleOnAnotherDevice', { data: params });

    }
}