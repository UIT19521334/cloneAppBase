import React, { Component } from 'react'
import { Text, View, NativeModules, DeviceEventEmitter } from 'react-native'
const { RNStringeeClientCustom } = NativeModules;
import Global from '../../Global';

interface ConnectResponse {
    userId: string; 
    projectId: number; 
    isReconnecting: boolean;
}

interface DisConnectResponse {
    userId: string; 
    projectId: number; 
    isReconnecting: boolean;
}

interface ConnectionErrorResponse {
    code: number; 
    message: string; 
}

interface CustomMessageResponse {
    from: string; 
    data: string; 
}

interface IncomingResponse {
    userId: number; 
    callId: string; 
    from: string; 
    to: string; 
    fromAlias: string; 
    toAlias: string; 
    callType: number; 
    isVideoCall: boolean; 
    customDataFromYourServer: string; 
}

interface EventClientHandler {
    onConnect: (response: ConnectResponse) => void;
    onDisConnect: (response: DisConnectResponse) => void;
    onFailWithError: (response: ConnectionErrorResponse) => void;
    onRequestAccessToken: () => void;
    onIncomingCall: (response: IncomingResponse) => void;
    onIncomingCall2: (response: IncomingResponse) => void;
    onCustomMessage: (response: CustomMessageResponse) => void;
}

const EventClient = {
    onConnect: "onConnectionConnected",
    onDisConnect: "onConnectionDisconnected",
    onFailWithError: "onConnectionError",
    onRequestAccessToken: "onRequestNewToken",
    onIncomingCall: "onIncomingCall",
    onIncomingCall2: "onIncomingCall2",
    onCustomMessage: "onCustomMessage",
}

export default class StringeeClient extends Component {

    static init() {
        RNStringeeClientCustom.init();
    }

    static registerClientEventHandlers(events: EventClientHandler) {
        if (typeof events !== "object") {
            return;
        }

        Object.keys(events).forEach((eventKey) => {
            const eventStringeeClient = DeviceEventEmitter.addListener(EventClient[eventKey], events[eventKey]);
            RNStringeeClientCustom.setNativeEvent(EventClient[eventKey]);
            Global.subscriptions.push(eventStringeeClient);
        })
    }

    static unregisterClientEventHandlers() {
        console.log('Cache log events stringee: ', Global.subscriptions);
        Global.subscriptions.forEach((e) => {
            e.remove()
        });
        
        Object.keys(EventClient).forEach((e) => {
            RNStringeeClientCustom.removeNativeEvent(EventClient[e]);
        });
    }

    static connect(token: stirng) {
        RNStringeeClientCustom.connect(token);
    }


    render() {
        return null;
    }
}
