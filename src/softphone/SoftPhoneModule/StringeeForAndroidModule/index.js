import moment from 'moment-timezone';
import React, { Component } from 'react';
import messaging from '@react-native-firebase/messaging';
import { ActivityIndicator, Alert, AppState, DeviceEventEmitter, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import Toast from 'react-native-root-toast';
import uuid from 'react-native-uuid';
import { StringeeCall, StringeeClient } from 'stringee-react-native';
import Global from '../../../Global';
import { displayMessageError } from '../../../redux/actions/messagePopup';
import { getLabel, heightDevice, widthDevice } from '../../../utils/commons/commons';
import SyncCall from '../../Models/SyncCall';
import SoftPhoneEvents from '../../SoftPhoneEvents';
import StringeeCallView from '../../StringeeCallView';
import AsyncStorage from '@react-native-community/async-storage';
import { Portal } from 'react-native-portalize';
import { TouchableOpacity } from 'react-native-gesture-handler';
import IncomingCallAndroid, { IncomingCallAction } from "../../IncomingCallAndroid";

const width = widthDevice;
const height = heightDevice;

const options = {
    android: {
        alertTitle: getLabel('softPhone.title_request_permission_phone_account'),
        alertDescription: getLabel('softPhone.label_description_request_permission_phone_account'),
        cancelButton: getLabel('common.btn_no'),
        okButton: getLabel('common.btn_yes'),
        imageName: 'phone_account_icon',
        // Required to get audio in background when using Android 11
        foregroundService: {
            channelId: 'vn.cloudpro.salesapp',
            channelName: 'Foreground service for my app',
            notificationTitle: 'Stringee call is running on background'
        },
    }
};
const unknownLabel = (Global.locale  || "vn_vn") == 'vn_vn' ? 'Không xác định' : 'Unknown';

class StringeeModule extends Component {

    state = {
        appState: AppState.currentState,
        toUserId: '',
        currentUserId: '',
        userId: '',
        syncCall: null,
        syncCallCache: null,
        hasOtherCallIncoming: false,
        allSyncCalls: [], // luu lai tat ca cac sync da tung xu ly
        fakeCallIds: [], // luu uuid cua tat ca fake call da show
        endTimeout: null,
        loadingSaveCallLog: false,
        answeredCall: false, // da answer call cua stringee hay chua
        isActivateAudioSession: false,
        isShowCallLog: false,
        // Push notification
        pushToken: '',
        registeredToken: false,

        callState: '', // Su dung de hien thi text cho trang thai call

        showCallingView: false,
        hasReceivedLocalStream: false,
        hasReceivedRemoteStream: false,

        enableVideo: true,
        isSpeaker: false,
        isMute: false,
        stream: {
            loading: false,
            loadingText: ''
        }
    }

    constructor(props) {
        super(props)

        this.clientEventHandlers = {
            onConnect: this._clientDidConnect,
            onDisConnect: this._clientDidDisConnect,
            onFailWithError: this._clientDidFailWithError,
            onRequestAccessToken: this._clientRequestAccessToken,
            onIncomingCall: this._callIncomingCall,
        };

        this.callEventHandlers = {
            onChangeSignalingState: this._callDidChangeSignalingState,
            onChangeMediaState: this._callDidChangeMediaState,
            onReceiveLocalStream: this._callDidReceiveLocalStream,
            onReceiveRemoteStream: this._callDidReceiveRemoteStream,
            onReceiveDtmfDigit: this._didReceiveDtmfDigit,
            onReceiveCallInfo: this._didReceiveCallInfo,
            onHandleOnAnotherDevice: this._didHandleOnAnotherDevice,
        };
        AsyncStorage.getItem('RNCallKeep.setup.already', (err, res) => {
            if (err) {
                return;
            }

            if (res) {
                RNCallKeep.setup({});

                setTimeout(() => {
                    if (RNCallKeep.supportConnectionService()) {

                        RNCallKeep.hasPhoneAccount()
                            .then((value) => {
                                console.log('hasPhoneAccount: ', value);
                                if (!value) {
                                    this.setState({ showPopupRequiredPermission: true });
                                }
                            })
                            .catch((error) => console.log('Error check phone account: ', error))
                    }
                }, 1500);

            }
            else {
                RNCallKeep.setup(options);
                AsyncStorage.setItem('RNCallKeep.setup.already', 'already setup', (error) => console.log('>>>>Error', error));
            }
        })

        RNCallKeep.setAvailable(true);
        
        RNCallKeep.addEventListener(
            'didDisplayIncomingCall',
            ({
                error,
                callUUID,
                handle,
                localizedCallerName,
                hasVideo,
                fromPushKit,
                payload,
            }) => {
                console.error('>>>>>>>>>>>>>didDisplayIncomingCall: ', error,
                    callUUID,
                    handle,
                    localizedCallerName,
                    hasVideo,
                    fromPushKit,
                    payload);

                // Call back khi show callkit cho incoming call thanh cong, end fakeCall da show o day
                if (this.state.fakeCallIds.includes(callUUID)) {
                    console.log("========= XOA FAKE CALL");
                    RNCallKeep.endCall(callUUID);
                    var newFakeCallIds = this.state.fakeCallIds.filter(
                        uuid => uuid != callUUID,
                    );
                    this.setState({ fakeCallIds: newFakeCallIds });
                    console.log(
                        'END FAKE CALL, UUID: ' +
                        callUUID +
                        ' fakeCallIds: ' +
                        this.state.fakeCallIds,
                    );
                }

                this.deleteSyncCallIfNeed();
            },
        );

        RNCallKeep.addEventListener('didActivateAudioSession', data => {
            console.log('>>>>>>>>>>> didActivateAudioSession: ', data);
            // var newSyncCall: SyncCall = this.state.syncCall;
            // newSyncCall.answered = true;
            // newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            // newSyncCall.calling = true;
            // this.setState({ isActivateAudioSession: true, callState: 'Started', answeredCall: true, syncCall: newSyncCall, syncCallCache: newSyncCall });
            this.setState({ isActivateAudioSession: true });
            this.answerCallAction();
        });

        RNCallKeep.addEventListener(
            'didReceiveStartCallAction',
            ({ handle, callUUID, name }) => {
            },
        );

        RNCallKeep.addEventListener('didPerformDTMFAction', ({ digits, callUUID }) => {
            console.log('>>>>>>>>>>> didPerformDTMFAction: ', digits, callUUID);
            // khong co thong tin syncCall --> Khong the thuc hien send DTMF
            if (this.state.syncCall == null) {
                return;
            }

            // thong tin call UUID khong trung khop voi callUUID trong syncCall --> Khong the thuc hien send DTMF
            if (callUUID != this.state.syncCall?.callkitId) {
                return;
            }

            this._sendDTMF(digits);
        });

        RNCallKeep.addEventListener(
            'didPerformSetMutedCallAction',
            ({ muted, callUUID }) => {
                if (muted != this.state.isMute) {
                    this._muteAction();
                }
            },
        );

        RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
            console.error('>>>>>>>>>>: RNCallKeep answerCall ', this.state.syncCall, callUUID);

            // khong co thong tin syncCall --> Khong the answer
            if (this.state.syncCall == null) {
                return;
            }

            // thong tin call UUID khong trung khop voi callUUID trong syncCall --> Khong the thuc hien answer
            if (callUUID != this.state.syncCall?.callkitId) {
                return;
            }

            // Luu lai hanh dong answer cua nguoi dung da answer
            var newSyncCall = this.state.syncCall || new SyncCall();
            newSyncCall.answered = true;

            this.setState({
                // cacheAction: 1,
                syncCall: newSyncCall,
                syncCallCache: newSyncCall
            });

            // Answer call neu can
            this.answerCallAction();
            IncomingCallAndroid.dismissAnswer();
            IncomingCallAndroid.dismiss();
        });

        RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
            console.log('EVENT END CALLKIT, callUUID: ' + callUUID);

            // khong co syncCall nao duoc tao ra nen khong the end call
            if (this.state.syncCall == null) {
                console.log('EVENT END CALLKIT - syncCall = null');
                return;
            }

            // syncCall khong dung nen khong the end call
            if (this.state.syncCall?.callkitId == '' || callUUID != this.state.syncCall?.callkitId) {
                console.log('EVENT END CALLKIT - uuid khac, callkitId: ' + this.state.syncCall?.callkitId);
                return;
            }

            // da tien answer call from ui nen end callkit
            if (callUUID == this.state.syncCall?.callkitId && this.state.syncCall?.isAnswerFromUI) {
                return;
            }

            // Cap nhat trang thai cho syncCall
            var newSyncCall = this.state.syncCall;
            if (newSyncCall.callId != '' && newSyncCall.callCode != 3 && newSyncCall.callCode != 4) {
                newSyncCall.endedCallkit = true;
                newSyncCall.endedStringeeCall = true;
            }
            else {
                newSyncCall.rejected = true;
            }

            this.setState({
                syncCall: newSyncCall,
                syncCallCache: newSyncCall
            });

            // StringeeCall van chua duoc end thi can end
            console.log('EVENT END CALLKIT, syncCall: ' + newSyncCall + ' callId: ' + newSyncCall.callId + ' callCode: ' + newSyncCall.callCode);
            if (newSyncCall.callId != '' && newSyncCall.callCode != 3 && newSyncCall.callCode != 4) {
                if (this.state.answeredCall) {
                    console.log('HANGUP CALL KHI END CALLKIT');
                    this.refs.stringeeCall?.hangup?.(
                        newSyncCall.callId,
                        (status, code, message) => {
                            console.log('stringeeCall.hangup: ' + message);
                            if (!status) {
                                // Fail
                                this.handleFailRequest(newSyncCall.callId, newSyncCall.serial);
                            }
                            else {
                                let newSyncCall = this.state.syncCall
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.isShowCallLog = true;
                                newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                                newSyncCall.calling = false;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.endedCallkit = true;
                                this.setState({
                                    syncCall: newSyncCall
                                }, () => {
                                    this.endAllCallKit();
                                })
                            }
                        },
                    );
                } else {
                    console.log('REJECT CALL KHI END CALLKIT');
                    this.refs.stringeeCall.reject(
                        newSyncCall.callId,
                        (status, code, message) => {
                            console.log('stringeeCall.reject: ' + message);
                            if (!status) {
                                // Fail
                                this.handleFailRequest(newSyncCall.callId, newSyncCall.serial);
                            }
                        },
                    );
                }

            }

        });
    }

    /// MARK: - function handle stringee client
    // ==================================== Trigger The client connects to Stringee server ===================================
    _clientDidConnect = ({ userId }) => {
        console.log('_clientDidConnect android - ' + userId);
        this.setState({ currentUserId: userId });

        /*
              Handle cho truong hop A goi B, nhung A end call rat nhanh, B nhan duoc push nhung khong nhan duoc incoming call
              ==> Sau khi ket noi den Stringee server 3s ma chua nhan duoc cuoc goi thi xoa Callkit Call va syncCall
            **/
        this.startEndTimeout();
        this.registerTokenForStringee();
    };

    // ==================================== Trigger The client disconnects from Stringee server ===================================
    _clientDidDisConnect = () => {
        console.log('_clientDidDisConnect');
        this.stopEndTimeout();
    };

    // ==================================== Trigger The client fails to connects to Stringee server ===================================
    _clientDidFailWithError = () => {
        console.log('_clientDidFailWithError');
    };

    // ==================================== Trigger Access token is expired. A new access token is required to connect to Stringee server ===================================
    _clientRequestAccessToken = () => {
        console.log('_clientRequestAccessToken');
        Global.getSoftPhoneToken((softPhoneToken) => {
            console.log("get new Request AccessToken: ", softPhoneToken);
            if (softPhoneToken?.token) {
                this.connectToStringee(softPhoneToken?.token);
            }
        });
    };

    // ==================================== Trigger The client has incoming call from Stringee server ===================================
    _callIncomingCall = ({
        callId,
        from,
        to,
        fromAlias,
        toAlias,
        callType,
        isVideoCall,
        customDataFromYourServer,
        serial,
    }) => {

        console.log(
            'IncomingCallId-' +
            callId +
            ' from-' +
            from +
            ' to-' +
            to +
            ' fromAlias-' +
            fromAlias +
            ' toAlias-' +
            toAlias +
            ' isVideoCall-' +
            isVideoCall +
            'callType-' +
            callType +
            'serial-' +
            serial,
        );

        if (this.state.showCallingView && this.state.isShowCallLog) {
            this.setState({ syncCallCache: this.state.syncCall, hasOtherCallIncoming: true }, () => {
                DeviceEventEmitter.emit(SoftPhoneEvents.EVENT_HAS_OTHER_INCOMING_CALL, { syncCallCache: this.state.syncCall, hasOtherCallIncoming: true });
            });
        }

        setTimeout(() => {

            if (this.callProcessed(callId, serial)) {
                console.log("========== call processed ======= ==> Reject: " + callId + ", serial: " + serial);
                this.refs.stringeeCall.reject(callId, (status, code, message) => {
                    if (!status) {
                        // Fail
                        this.handleFailRequest(this.state.syncCall?.callId, this.state.syncCall?.serial);
                    }
                });
                return;
            }

            this.setState({
                userId: from,
                callState: 'Incoming Call',
            });

            // if Callkit is not show, so display this
            if (this.state.syncCall == null) {
                console.log('Call + Show new call kit');
                var newSyncCall = new SyncCall();
                newSyncCall.callId = callId;
                newSyncCall.serial = serial;
                newSyncCall.callkitId = uuid.v1();
                newSyncCall.receivedStringeeCall = true;
                newSyncCall.isVideoCall = isVideoCall;
                newSyncCall.direction = 'Inbound';

                // Callkit
                RNCallKeep.displayIncomingCall(
                    newSyncCall.callkitId,
                    Global.appName,
                    Global.checkPhoneHasCode(fromAlias.replace('btncall_', '')),
                    'generic',
                    isVideoCall,
                );

                // Call screen
                this.setState({
                    syncCall: newSyncCall,
                    syncCallCache: newSyncCall,
                    showCallingView: true,
                }, () => {
                    this.getDataReceiver(
                        fromAlias?.toString().replace('btncall_', ''),
                        null,
                        'Inbound',
                        () => {
                            if (this.state.syncCall?.callkitId != '') {
                                console.log('Call + Update UI');
                                const customerName = (!this.state.syncCall?.customerName || (this.state.syncCall?.customerName == unknownLabel)) ? fromAlias?.toString().replace('btncall_', '') : this.state.syncCall?.customerName;
                                RNCallKeep.updateDisplay(this.state.syncCall?.callkitId, customerName, Global.appName);
                            }
                        }
                    );
                });

                this.refs.stringeeCall?.initAnswer(callId, (status, code, message) => {
                    console.log(message);
                });

                this.answerCallAction();
                return;
            }

            // Cuoc goi moi toi khong phai la current sync call
            if (!this.state.syncCall?.isThisCall?.(callId, serial)) {
                console.log('INCOMING CALL -> REJECT, CUOC GOI MOI KHONG TRUNG VOI SYNC CALL');
                this.refs.stringeeCall?.reject(callId, (status, code, message) => {
                });
                return;
            }

            if (this.state.syncCall?.rejected) {
                // nguoi dung da click nut reject cuoc goi
                console.log('INCOMING CALL -> REJECT, NGUOI DUNG DA REJECT CUOC GOI');
                this.refs.stringeeCall.reject(callId, (status, code, message) => {
                    if (!status) {
                        // Fail
                        this.handleFailRequest(this.state.syncCall?.callId, this.state.syncCall?.serial);
                    }
                });
                return;
            }

            // Da show callkit => update UI
            if (this.state.syncCall?.callkitId != '') {
                console.log('Call + Update');
                RNCallKeep.updateDisplay(this.state.syncCall?.callkitId, Global.checkPhoneHasCode(fromAlias.replace('btncall_', '')), '');
                var newSyncCall = this.state.syncCall;
                newSyncCall.callId = callId;
                newSyncCall.receivedStringeeCall = true;
                newSyncCall.isVideoCall = isVideoCall;
                newSyncCall.direction = 'Inbound';

                this.setState({
                    syncCall: newSyncCall,
                    syncCallCache: newSyncCall,
                    showCallingView: true,
                }, () => {
                    this.getDataReceiver(
                        fromAlias?.toString().replace('btncall_', ''),
                        null,
                        'Inbound',
                        () => {
                            if (this.state.syncCall?.callkitId != '') {
                                console.log('Call + Update');
                                const customerName = (!this.state.syncCall?.customerName || (this.state.syncCall?.customerName == unknownLabel)) ? fromAlias?.toString().replace('btncall_', '') : this.state.syncCall?.customerName;
                                RNCallKeep.updateDisplay(this.state.syncCall?.callkitId, customerName, Global.appName);
                            }
                        }
                    );
                });

                this.refs.stringeeCall.initAnswer(callId, (status, code, message) => {
                    console.log(message);
                });

                this.answerCallAction();
                return;
            }

            // Chua show callkit thi show
            var newSyncCall = this.state.syncCall;
            newSyncCall.callId = callId;
            newSyncCall.serial = serial;
            newSyncCall.callkitId = uuid.v1();
            newSyncCall.receivedStringeeCall = true;
            newSyncCall.isVideoCall = isVideoCall;
            newSyncCall.direction = 'Inbound';

            // Callkit
            RNCallKeep.displayIncomingCall(
                newSyncCall.callkitId,
                Global.appName,
                Global.checkPhoneHasCode(fromAlias.replace('btncall_', '')),
                'generic',
                isVideoCall,
            );

            // Call screen
            this.setState({
                syncCall: newSyncCall,
                syncCallCache: newSyncCall,
                showCallingView: true,
            });

            this.refs.stringeeCall.initAnswer(callId, (status, code, message) => {
                console.log(message);
            });

            this.answerCallAction();
        }, (this.state.showCallingView && this.state.isShowCallLog) ? 1500 : 0);

    }

    /// MARK: - function handle stringee call
    // ==================================== Invoked when the call signaling state changes ===================================
    _callDidChangeSignalingState = (response) => {
        const {
            callId,
            code,
            reason,
            sipCode,
            sipReason
        } = response;
        console.error('>>>>>>>>>> _callDidChangeSignalingState response: ', response);
        if (this.state.syncCall != null) {
            var newSyncCall: SyncCall = this.state.syncCall;
            newSyncCall.callCode = code;

            // Neu la cuoc goi ra vaf code la 2 --> set lai time start
            if (`${code}` == '2' && newSyncCall?.direction.toUpperCase() == 'OUTBOUND') {
                newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                newSyncCall.calling = true;
            }

            // Neu la end hoac reject call thi cap nhat trang thai endedStringeeCall cho sync call
            if (`${code}` == '3' || `${code}` == '4') {
                newSyncCall.endedStringeeCall = true;
                newSyncCall.isShowCallLog = true;
                newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                newSyncCall.calling = false;
                newSyncCall.endedStringeeCall = true;
                newSyncCall.endedCallkit = true;
            }

            this.setState({
                callState: reason,
                syncCall: newSyncCall,
                syncCallCache: newSyncCall,
            });

            switch (`${code}`) {
                case '3':
                    // Rejected
                    this.endAllCallKit();
                    break;
                case '4':
                    // Ended
                    this.endAllCallKit();
                    break;
            }

        }
        else {
            this.setState({
                callState: reason
            });

            switch (`${code}`) {
                case '3':
                    // Rejected
                    this.endCallAndUpdateView();
                    break;
                case '4':
                    // Ended
                    this.endCallAndUpdateView();
                    break;
            }
        }
    };

    // ==================================== Invoked when the call media state changes ===================================
    _callDidChangeMediaState = ({ callId, code, description }) => {
        console.log(
            '_callDidChangeMediaState' +
            ' callId-' +
            callId +
            'code-' +
            code +
            ' description-' +
            description,
        );
        switch (code) {
            case 0:
                var newSyncCall: SyncCall = this.state.syncCall || new SyncCall();
                newSyncCall.answered = true;
                newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                newSyncCall.calling = true;
                this.setState({ callState: 'Started', answeredCall: true, syncCall: newSyncCall, syncCallCache: newSyncCall });
                break;
            case 1:
                break;
        }

        this.refs.stringeeCall?.setSpeakerphoneOn(
            callId,
            false,
            (status, code, message) => {
                console.log(">>>>>>>_callDidChangeMediaState: ", message, status, code,);
            },
        );
    };

    // ==================================== Invoked when the local stream is available ===================================
    _callDidReceiveLocalStream = ({ callId }) => {
        this.setState({ hasReceivedLocalStream: true });
    };

    // ==================================== Invoked when the remote stream is available ===================================
    _callDidReceiveRemoteStream = ({ callId }) => {
        this.setState({ hasReceivedRemoteStream: true });
    };

    // ==================================== Invoked when receives a DMTF ===================================
    _didReceiveDtmfDigit = ({ callId, dtmf }) => {
    };

    // ==================================== Invoked when receives info from other clients ===================================
    _didReceiveCallInfo = ({ callId, data }) => {
    };

    // ==================================== Invoked when the call is handled on another device ===================================
    _didHandleOnAnotherDevice = ({ callId, code, description }) => {
        console.log(
            '_didHandleOnAnotherDevice ' +
            callId +
            '***' +
            code +
            '***' +
            description,
        );

        // Cuộc gọi đã được answer, reject hoặc end ở máy khác thì cần kết thúc ở đây
        if (code == 2 || code == 3 || code == 4) {
            this.endCallAndUpdateView();
        }
    };

    ///MARK: - React native lift circle
    async componentDidMount() {
        if (this.props.softPhoneToken?.token) {
            await this.refs.stringeeClient?.connect(this.props.softPhoneToken?.token);

            AppState.addEventListener('change', this._handleAppStateChange);

            this.subscribeEventMakeCall = DeviceEventEmitter.addListener(SoftPhoneEvents.EVENT_MAKE_CALL_FROM_STRINGEE, (data) => {
                this.callButtonClick(false, data?.phoneNumber, data?.customerId, data?.dispatch);
            });

            this.subscribeEventUnregistrationPush = DeviceEventEmitter.addListener(SoftPhoneEvents.EVENT_UNREGISTER_STRINGEE_PUSH, () => {
                this.unregisterTokenForStringee();
            });

            AsyncStorage.getItem('SoftPhone.AndroidHandledOnBackground', (err, res) => {

                if (err) {
                    return;
                }

                if (res) {
                    var newSyncCall = new SyncCall();
                    newSyncCall = JSON.parse(res);
                    this.setState({
                        syncCall: newSyncCall,
                        showCallingView: true,
                        callState: 'Ended',
                        isShowCallLog: true
                    }, async () => {
                        await AsyncStorage.removeItem('SoftPhone.AndroidHandledOnBackground');
                    });
                }


            });
        }
    }

    async componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.subscribeEventMakeCall && this.subscribeEventMakeCall.remove();
        this.subscribeEventUnregistrationPush && this.subscribeEventUnregistrationPush.remove();
    }

    /// MARK: - ACTION HANDLER
    // ==================================== App state has changed ===================================
    _handleAppStateChange = nextAppState => {
        this.setState({ appState: nextAppState });
    };

    // ==================================== get ClientId connected ===================================
    getClientId() {
        if (this.refs.stringeeClient != undefined) {
            return this.refs.stringeeClient?.getId?.() || "";
        }

        return '';
    }

    // ==================================== Connect to stringee client ===================================
    async connectToStringee(accessToken) {
        await this.refs.stringeeClient?.connect?.(accessToken);
    }

    // ==================================== unregister Token For push Stringee ===================================
    registerTokenForStringee = () => {
        if (this.state.registeredToken) {
            console.log('Sent PUSH TOKEN to STRINGEE SERVER');
            return;
        }
        var thisInstance = this;

        // AsyncStorage.getItem('isPushTokenRegistered')
        //     .then((value) => {
        //         if (value !== 'true') {
        messaging()
            .getToken()
            .then((token) => {
                this.refs.stringeeClient.registerPush(
                    token,
                    true,
                    true,
                    (result, code, desc) => {
                        console.log(
                            'registerPush: \nresult-' +
                            result +
                            ' code-' +
                            code +
                            ' desc-' +
                            desc,
                        );
                        thisInstance.setState({ registeredToken: result });

                        if (result) {
                            AsyncStorage.multiSet([
                                ['isPushTokenRegistered', 'true'],
                                ['tokenRegisterStringee', token],
                            ]);
                        }
                    },
                );
            });
        // }
        // });

        messaging().onTokenRefresh(token => {
            this.refs.stringeeClient.registerPush(
                token,
                true,
                true,
                (result, code, desc) => {
                    console.log(
                        'registerPush: \nresult-' +
                        result +
                        ' code-' +
                        code +
                        ' desc-' +
                        desc,
                    );
                    if (result) {
                        thisInstance.setState({ registeredToken: result });

                        AsyncStorage.multiSet([
                            ['isPushTokenRegistered', 'true'],
                            ['tokenRegisterStringee', token],
                        ]);
                    }
                },
            );
        });

    };

    // ==================================== unregister Token For push Stringee ===================================
    unregisterTokenForStringee = () => {
        var thisInstance = this;

        AsyncStorage.getItem('isPushTokenRegistered')
            .then((value) => {
                if (value == 'true') {
                    messaging()
                        .getToken()
                        .then((token) => {
                            this.refs.stringeeClient.unregisterPush(
                                token,
                                (result, code, desc) => {
                                    console.log(
                                        'registerPush: \nresult-' +
                                        result +
                                        ' code-' +
                                        code +
                                        ' desc-' +
                                        desc,
                                    );
                                    thisInstance.setState({ registeredToken: false });
                                    if (result) {
                                        AsyncStorage.removeItem('isPushTokenRegistered');
                                        AsyncStorage.removeItem('tokenRegisterStringee');
                                    }
                                },
                            );
                        });
                }
            });

        this.refs.stringeeClient?.disconnect?.();
    };

    // ==================================== End all incoming call after 3s when this app has connected stringee without them hasn't receive incoming call ===================================
    startEndTimeout = () => {
        if (this.state.endTimeout == null || this.state.syncCall != null) {
            var endTimeout = setTimeout(() => {
                if (this.state.syncCall == null) {
                    return;
                }

                // Sau 3s tu khi connected ma chua nhan duoc call thi end call
                if (!this.state.syncCall?.receivedStringeeCall) {
                    // End callkit
                    if (this.state.syncCall?.callkitId != '') {
                        RNCallKeep.endCall(this.state.syncCall?.callkitId);
                    }
                    this.addSyncCallToCacheArray(this.state.syncCall);

                    this.setState({
                        syncCall: null,
                        syncCallCache: null
                    });
                }
            }, 5000);

            this.setState({
                endTimeout: endTimeout,
            });
        }
    };

    // ==================================== Clear all timeout event ===================================
    stopEndTimeout = () => {
        if (this.state.endTimeout != null) {
            clearTimeout(this.state.endTimeout);
            this.setState({
                endTimeout: null,
            });
        }
    };

    // ==================================== save cache Sync Call ===================================
    addSyncCallToCacheArray = sCall => {
        // Xoa call cu neu da save
        var newAllSyncCalls = this.state.allSyncCalls.filter(
            call => !(call.callId == sCall.callId && call.serial == sCall.serial),
        );

        newAllSyncCalls.push(sCall);
        this.setState({
            allSyncCalls: newAllSyncCalls,
        });
    };

    // ==================================== remove cache Sync Call ===================================
    removeSyncCallInCacheArray = (callId, serial) => {
        // Xoa call cu neu da save
        var newAllSyncCalls = this.state.allSyncCalls.filter(
            call => !(call.callId == callId && call.serial == serial),
        );

        this.setState({
            allSyncCalls: newAllSyncCalls,
        });
    };

    // ==================================== delete Sync Call from cache if need ===================================
    deleteSyncCallIfNeed = () => {
        if (this.state.syncCall == null) {
            console.log('SyncCall is deleted');
            return;
        }

        if (this.state.syncCall?.endedCallkit && this.state.syncCall?.endedStringeeCall) {
            // cache lai call da xu ly
            this.addSyncCallToCacheArray(this.state.syncCall);

            this.setState({
                syncCall: null,
                syncCallCache: null
            });
        } else {
            console.log(
                'deleteSyncCallIfNeed, endedCallkit: ' +
                this.state.syncCall?.endedCallkit +
                ' endedStringeeCall: ' +
                this.state.syncCall?.endedStringeeCall,
            );
        }
    };

    // ==================================== check current call processed yet! ===================================
    callProcessed = (callId, serial) => {
        // Xoa call cu neu da save
        var newAllSyncCalls = this.state.allSyncCalls.filter(
            call => call.callId == callId && call.serial == serial,
        );
        return newAllSyncCalls != null && newAllSyncCalls.length > 0;
    };

    // ==================================== handle Fail Request call! ===================================
    handleFailRequest = (callId, serial) => {
        var newSyncCall = this.state.syncCall;
        if (newSyncCall == null) {
            return;
        }

        if (newSyncCall.callId != callId || newSyncCall.serial != serial) {
            return;
        }

        newSyncCall.endedStringeeCall = true;
        this.setState({
            syncCall: newSyncCall,
            syncCallCache: newSyncCall,
        });
        this.endCallAndUpdateView();
    };

    // ==================================== handle end Call And Update View! ===================================
    endAllCallKit = () => {
        // End callkit call
        if (this.state.syncCall != null && this.state.syncCall?.callkitId != '') {
            RNCallKeep.endCall(this.state.syncCall?.callkitId);
            RNCallKeep.endAllCalls();
        }

        // reset trang thai va view
        this.setState({
            callState: 'Ended',
        });

        // Show call log
        this.setState({
            hasReceivedLocalStream: false,
            hasReceivedRemoteStream: false,
            isActivateAudioSession: false,
            answeredCall: false,
            enableVideo: false,
            isSpeaker: false,
            isMute: false,
            isShowCallLog: true
        });
    }

    // ==================================== handle end Call And Update View! ===================================
    endCallAndUpdateView = () => {
        // End callkit call
        if (this.state.syncCall != null && this.state.syncCall?.callkitId != '') {
            RNCallKeep.endCall(this.state.syncCall?.callkitId);
            RNCallKeep.endAllCalls();
        }

        // reset trang thai va view
        this.setState({
            callState: 'Ended',
        });

        console.error('>>>>>>>>>>deleteSyncCallIfNeed from endCallAndUpdateView');
        // Xoa sync call neu can
        this.deleteSyncCallIfNeed();

        // Show CallScreen them 0.5s de hien thi trang thai ended (Cho giong native call cua ios)
        setTimeout(() => {
            this.setState({
                showCallingView: false,
                hasReceivedLocalStream: false,
                hasReceivedRemoteStream: false,
                isActivateAudioSession: false,
                answeredCall: false,
                enableVideo: false,
                isSpeaker: false,
                isMute: false,
                isShowCallLog: false
            });
        }, 500);
    };

    // ==================================== handle out bound call! ===================================
    callButtonClick = (isVideoCall, toUserId, customer_id, dispatch) => {
        if (toUserId == '') {
            return;
        }

        this._writeOutboundCache(customer_id, toUserId, '', dispatch, () => {

            const myObj = {
                from: Global.softPhoneToken?.hotline, // caller
                to: toUserId, // callee
                isVideoCall: isVideoCall, // Cuộc gọi là video call hoặc voice call
                videoResolution: 'NORMAL', // chất lượng hình ảnh 'NORMAL' hoặc 'HD'. Mặc định là 'NORMAL'.
            };

            const parameters = JSON.stringify(myObj);
            console.log(">>>>>>>>>> make call parameters: ", parameters);

            this.refs.stringeeCall.makeCall(
                parameters,
                (status, code, message, callId) => {
                    console.log(
                        'status-' +
                        status +
                        ' code-' +
                        code +
                        ' message-' +
                        message +
                        'callId-' +
                        callId,
                    );
                    if (status) {
                        var newSyncCall = new SyncCall();
                        newSyncCall.callId = callId;
                        newSyncCall.callCode = 0;
                        newSyncCall.answered = true;
                        newSyncCall.isVideoCall = isVideoCall;
                        newSyncCall.phoneNumber = toUserId;
                        newSyncCall.direction = 'OUTBOUND';

                        this.setState({
                            syncCall: newSyncCall,
                            syncCallCache: newSyncCall,
                            userId: this.state.toUserId,
                            answeredCall: true,
                            callState: 'Outgoing Call',
                        }, () => {
                            this.getDataReceiver(toUserId, customer_id, 'Outbound', () => {
                                this.setState({
                                    showCallingView: true
                                }, () => {
                                    this._writeOutboundCache(customer_id, toUserId, callId, dispatch, () => { });
                                });
                            });
                        });
                    } else {
                        let paramsMessage = {
                            title: '',
                            message: getLabel('common.call_out_err_msg')
                        }

                        dispatch(displayMessageError(paramsMessage));
                    }
                },
            );
        });
    };

    // update infomation customer
    getDataReceiver = (phoneNumber, userId, direction, callback) => {
        var params = {
            RequestAction: 'GetDataForCallLog',
            Data: {
                customer_id: userId || '',
                customer_number: phoneNumber,
                direction: direction || 'Outbound'
            }
        }
        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                console.log('DATA CUSTOMER:', JSON.stringify(data));
                let newSyncCall: SyncCall = this.state.syncCall || new SyncCall();
                newSyncCall.canCreateNewCustomer = !data.customer_data || Object.keys(data.customer_data).length === 0;
                newSyncCall.customerData = data.customer_data || {};
                newSyncCall.metadata = data.metadata;
                newSyncCall.customerId = data?.customer_data?.id || '';
                newSyncCall.phoneNumber = phoneNumber;
                newSyncCall.record_module = data?.customer_data?.record_module || '';
                newSyncCall.companyName = data?.customer_data?.account_id_display || data?.customer_data?.company || '';
                const salutationtype = data?.customer_data?.salutationtype ? (Global.getEnumLabel(data?.customer_data?.record_module, 'salutationtype', data?.customer_data?.salutationtype) + " ") : '';
                const customerName = (data?.customer_data && Object.keys(data?.customer_data || {}).length > 0) ? (salutationtype + (data?.customer_data?.full_name || data?.customer_data?.accountname)) : unknownLabel;
                newSyncCall.customerName = customerName;
                newSyncCall.avatar = data?.customer_data?.customer_avatar
                this.setState({
                    syncCall: newSyncCall,
                    syncCallCache: newSyncCall,
                },
                    () => {
                        callback();
                    });
            }
            else {
                Toast.show(I18n.t('common.msg_no_results_found', { locale: globalInstance.locale }));
                callback();
            }
        },
            error => {
                Toast.show(I18n.t('common.msg_connection_error', { locale: globalInstance.locale }));
                callback();
            });
    };

    // ==================================== handle write out bound call to CRM server! ===================================
    async _writeOutboundCache(customer_id, customer_number, callId, dispatch, callback) {
        const paramsOutboundCache = {
            RequestAction: 'WriteOutboundCache',
            Data: {
                ext_number: Global.user?.phone_crm_extension,
                customer_id: customer_id,
                customer_number: customer_number,
                pbx_call_id: callId || ''
            }
        }

        Global.callAPI(null, paramsOutboundCache,
            (data) => {
                if (parseInt(data?.success) == 1) {
                    callback?.();
                }
                else {
                    let paramsMessage = {
                        title: '',
                        message: getLabel('common.call_out_err_msg')
                    }

                    dispatch(displayMessageError(paramsMessage));
                }
            },
            error => {
                let paramsMessage = {
                    title: '',
                    message: getLabel('common.call_out_err_msg')
                };
                dispatch(displayMessageError(paramsMessage));
            });
    }

    // ==================================== handle answer call action! ===================================
    answerCallAction = () => {
        /*
              Voi iOS, Answer StringeeCall khi thoa man cac yeu to:
              1. Da nhan duoc su kien onIncomingCall (có callId)
              2. User da click answer
              3. Chua goi ham answer cua StringeeCall lan nao
              3. AudioSession da active
            **/
        if (
            this.state.syncCall == null ||
            this.state.syncCall?.callId == '' ||
            !this.state.isActivateAudioSession ||
            !this.state.syncCall?.answered ||
            this.state.answeredCall
        ) {
            console.log(
                'Chua du dieu kien de answer call, AudioSessionActived: ' +
                this.state.isActivateAudioSession +
                ' - syncCall: ' +
                this.state.syncCall +
                ' - syncCall.callId: ' +
                this.state.syncCall?.callId +
                ' - AnsweredAction: ' +
                this.state.syncCall?.answered +
                ' - AnsweredCall: ' +
                this.state.answeredCall,
            );

            return;
        }

        this.refs.stringeeCall.answer(
            this.state.syncCall?.callId,
            (status, code, message) => {
                this.setState({ answeredCall: true });
                console.log('call did answer ' + status + ' - message: ' + message);
                if (!status) {
                    // Fail
                    this.handleFailRequest();
                }
                else {
                    RNCallKeep.setCurrentCallActive(this.state.syncCall?.callkitId);
                    this.refs.stringeeCall?.setSpeakerphoneOn(
                        this.state.syncCall?.callId,
                        false,
                        (status, code, message) => {
                            console.log(">>>>>>>_callDidChangeMediaState: ", message, status, code,);
                        },
                    );
                }
            },
        );
    };

    _answerCallActionFromUI = () => {
        /*
              Voi iOS, Answer StringeeCall khi thoa man cac yeu to:
              1. Da nhan duoc su kien onIncomingCall (có callId)
              2. User da click answer
              3. Chua goi ham answer cua StringeeCall lan nao
            **/
        if (
            this.state.syncCall == null ||
            this.state.syncCall?.callId == '' ||
            !this.state.syncCall?.answered ||
            this.state.answeredCall
        ) {
            console.log(
                'Chua du dieu kien de answer call: ' +
                ' - syncCall: ' +
                this.state.syncCall +
                ' - syncCall.callId: ' +
                this.state.syncCall?.callId +
                ' - AnsweredAction: ' +
                this.state.syncCall?.answered +
                ' - AnsweredCall: ' +
                this.state.answeredCall,
            );

            return;
        }

        const newSyncCall = this.state.syncCall;
        newSyncCall.isAnswerFromUI = true
        this.setState({
            syncCall: newSyncCall,
            syncCallCache: newSyncCall
        }, () => {
            this.refs.stringeeCall.answer(
                this.state.syncCall?.callId,
                (status, code, message) => {
                    console.log('call did answer from UI with Status ' + status + ' - message: ' + message);
                    if (!status) {
                        // Fail
                        this.handleFailRequest();
                    }
                    else {
                        RNCallKeep.endCall(this.state.syncCall?.callkitId);
                        this.refs.stringeeCall?.setSpeakerphoneOn(
                            this.state.syncCall?.callId,
                            false,
                            (status, code, message) => {
                                console.log(">>>>>>>_callDidChangeMediaState: ", message, status, code,);
                            },
                        );
                    }
                },
            );
        });
    }

    // ==================================== handle mute change action! ===================================
    _muteAction = () => {
        if (this.state.syncCall == null || this.state.syncCall?.callId == '') {
            return;
        }

        this.refs.stringeeCall?.mute(
            this.state.syncCall?.callId,
            !this.state.isMute,
            (status, code, message) => {
                this.setState({ isMute: !this.state.isMute });
                if (
                    this.state.syncCall != null &&
                    this.state.syncCall?.callkitId != ''
                ) {
                    RNCallKeep.isCallActive(this.state.syncCall?.callkitId)
                        .then((value) => {
                            if (value) {
                                RNCallKeep.setMutedCall(
                                    this.state.syncCall?.callkitId,
                                    this.state.isMute,
                                );
                            }
                        });
                }
            },
        );
    };

    // ==================================== handle speaker change action! ===================================
    _speakerAction = () => {
        if (this.state.syncCall == null || this.state.syncCall?.callId == '') {
            return;
        }

        this.refs.stringeeCall.setSpeakerphoneOn(
            this.state.syncCall?.callId,
            !this.state.isSpeaker,
            (status, code, message) => {
                this.setState({ isSpeaker: !this.state.isSpeaker });
            },
        );
    };

    // ==================================== handle press DTMF change action! ===================================
    _sendDTMF = (dtmf) => {
        console.log(`_sendDTMF: dtmf - ${dtmf}, callId - ${this.state.syncCall?.callId}`);

        if (this.state.syncCall == null || this.state.syncCall?.callId == '') {
            return;
        }

        this.refs.stringeeCall?.sendDTMF(
            this.state.syncCall?.callId,
            dtmf,
            (status, code, message) => {
                console.log(`_sendDTMF: status - ${status}, code - ${code}, message - ${message}`);
                if (status) {
                    // this.setState({ dtmf: this.state.dtmf + dtmf })
                }
                else {
                    Alert.alert('', message)
                }
            },
        );
    }

    // ==================================== handle enable video change action! ===================================
    _enableVideoAction = () => {
        if (this.state.syncCall == null || this.state.syncCall?.callId == '') {
            return;
        }

        this.refs.stringeeCall.enableVideo(
            this.state.syncCall?.callId,
            !this.state.enableVideo,
            (status, code, message) => {
                this.setState({ enableVideo: !this.state.enableVideo });
            },
        );
    };

    // ==================================== handle switch camera action! ===================================
    _switchCameraAction = () => {
        if (this.state.syncCall == null || this.state.syncCall?.callId == '') {
            return;
        }

        this.refs.stringeeCall.switchCamera(
            this.state.syncCall?.callId,
            (status, code, message) => {
                console.log(message);
            },
        );
    };

    // ==================================== handle save call log ===================================
    _saveCallLog = (hasOtherCallIncoming) => {
        const title = `${getLabel('common.undefine_label')} - ${moment(new Date()).format('DD-MM-YYYY HH:mm')}`;
        let syncCall: SyncCall = hasOtherCallIncoming ? this.state.syncCallCache : this.state.syncCall;

        let callLogParams = {
            pbx_call_id: syncCall?.callId,
            subject: syncCall?.callLogData?.subject || title,
            description: syncCall?.callLogData?.description || '',
            direction: syncCall?.direction,
            start_time: syncCall.startTime || '',
            end_time: syncCall.endTime || '',
            events_call_result: syncCall?.callLogData?.resultCall?.key || [...(syncCall?.metadata?.enum_list?.events_call_result || [])]?.[0]?.key || '',
            visibility: syncCall?.callLogData?.visibility || 'PUBLIC',
            customer_id: syncCall?.callLogData?.userInfo?.customer_id,
        };


        if (syncCall?.direction?.toUpperCase() === 'INBOUND') {
            callLogParams.events_inbound_call_purpose = syncCall?.callLogData?.callInBoundPurpose?.key || '';
            callLogParams.events_inbound_call_purpose_other = syncCall?.callLogData?.callPurposeOther || '';
        }
        else {
            callLogParams.events_call_purpose = syncCall?.callLogData?.callPurpose?.key || '';
            callLogParams.events_call_purpose_other = syncCall?.callLogData?.callPurposeOther || '';
        }

        if (syncCall?.callLogData?.resultCall?.key === 'call_result_call_back_later') {
            const call_back = {
                call_back_time_other: syncCall?.callLogData?.isOtherRecall ? 1 : 0,
            }

            if (syncCall?.callLogData?.isOtherRecall) {
                call_back.date_start = syncCall?.callLogData?.recallDateOther ? moment(syncCall?.callLogData?.recallDateOther, 'DD/MM/YYYY').format('YYYY-MM-DD') : moment(new Date()).add(1, 'day').format('YYYY-MM-DD');
                call_back.time_start = syncCall?.callLogData?.recallTimeOther?.key || ''
            }
            else {
                call_back.select_time = syncCall?.callLogData?.recallTime?.key || '';
                call_back.select_moment = syncCall?.callLogData?.recallMoment?.key || ''
            }

            callLogParams.call_back = call_back
        }

        if (syncCall?.callLogData?.resultCall?.key === 'call_result_customer_interested') {
            const userInfo = {
                customer_id: syncCall?.callLogData?.userInfo?.customer_id || '',
                customer_type: syncCall?.callLogData?.userInfo?.customer_type || '',
                account: {
                    account_id: syncCall?.customerData?.account_id || '',
                    account_name: syncCall?.customerData?.account_id_display || '',
                },
                salutationtype: syncCall?.callLogData?.userInfo?.salutationtype?.key || '',
                lastname: syncCall?.callLogData?.userInfo?.lastname || '',
                firstname: syncCall?.callLogData?.userInfo?.firstname || '',
                mobile_phone: syncCall?.callLogData?.userInfo?.mobile_phone || '',
                email: syncCall?.callLogData?.userInfo?.email || '',
            }

            if (syncCall?.callLogData?.userInfo?.accountSelected && Object.keys(syncCall?.callLogData?.userInfo?.accountSelected).length > 0) {
                const account = {
                    account_id: syncCall?.callLogData?.userInfo?.accountSelected?.accountid || '',
                    account_name: syncCall?.callLogData?.userInfo?.accountSelected?.accountname || '',
                }
                userInfo.account = account;
            }
            else {
                const account = {
                    account_id: syncCall?.customerData?.account_id || '',
                    account_name: syncCall?.customerData?.account_id_display || '',
                }

                userInfo.account = account;
            }

            let product_ids = syncCall?.callLogData?.userInfo?.productSelectedList?.map((product) => {
                return product.productid;
            })

            let service_ids = syncCall?.callLogData?.userInfo?.serviceSelectedList?.map((service) => {
                return service.serviceid;
            })

            if (syncCall?.callLogData?.userInfo?.customer_type === 'Leads') {
                userInfo.company = syncCall?.callLogData?.userInfo?.company || '';
            }

            userInfo.product_ids = product_ids || [];
            userInfo.service_ids = service_ids || [];

            if (syncCall?.callLogData) {

            }


            callLogParams.customer_data = userInfo
        }

        console.log('++++++++++++++++++++++++++++++++++LOG.CAllLOG Params DATA: \n', JSON.stringify(callLogParams));

        let params = {
            'RequestAction': 'SaveCallLog',
            'Data': callLogParams
        }

        this.setState({
            loadingSaveCallLog: true,
            stream: {
                loading: true,
                loadingText: (Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang tạo lưu...' : 'Saving...'
            }
        });

        if (hasOtherCallIncoming) {
            setTimeout(() => {
                this.setState({
                    stream: {
                        loading: false,
                        loadingText: ''
                    },
                    isShowCallLog: false,
                    answeredCall: false,
                    loadingSaveCallLog: false,
                    syncCallCache: null
                });
            }, 1000);
        }

        Global.callAPI(null, params,
            (data) => {

                if (parseInt(data.success) == 1) {
                    console.log('Save call log successful: ', data);
                    this.setState({
                        loadingSaveCallLog: false,
                        stream: {
                            loading: false,
                            loadingText: ''
                        }
                    }, () => {
                        if (!hasOtherCallIncoming) {
                            this.endCallAndUpdateView();
                            setTimeout(() => {
                                Toast.show('Lưu thông tin cuộc gọi thành công.')
                            }, 1000);
                        }
                    });
                }
                else {
                    this.setState({
                        loadingSaveCallLog: false,
                        stream: {
                            loading: false,
                            loadingText: ''
                        }
                    }, () => {
                        Alert.alert(getLabel('common.tab_notifications'), getLabel('common.msg_save_error'));
                        this.endCallAndUpdateView();
                    });
                }
            },
            error => {
                this.setState({
                    loadingSaveCallLog: false,
                    stream: {
                        loading: false,
                        loadingText: ''
                    }
                }, () => {
                    Alert.alert(getLabel('common.tab_notifications'), getLabel('common.msg_save_error'));
                    this.endCallAndUpdateView();
                });
            });

    }

    // ==================================== handle create new customer! ===================================
    saveNewCustomer(customer, module) {

        let params = {
            'RequestAction': module === 'Leads' ? 'SaveLead' : 'SaveContact',
            'Data': customer
        }
        this.setState({
            stream: {
                loading: true,
                loadingText: (Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang tạo mới khách hàng' : 'Creating new customer'
            }
        });

        Global.callAPI(null, params, (data) => {
            if (parseInt(data.success) === 1) {
                console.log('DATA CUSTOMER:', data);

                this.getDataReceiver(
                    customer.mobile,
                    null,
                    this.state.syncCall?.direction || 'Outbound',
                    () => { }
                );

                this.setState({
                    stream: {
                        loading: false,
                        loadingText: ''
                    }
                });
            }
            else {
                this.setState({
                    stream: {
                        loading: false,
                        loadingText: ''
                    }
                }, () => {
                    Alert.alert(getLabel('common.tab_notifications'), getLabel('common.msg_save_error'));
                });
            }

        },
            error => {
                this.setState({
                    stream: {
                        loading: false,
                        loadingText: ''
                    }
                }, () => {
                    Alert.alert(getLabel('common.tab_notifications'), getLabel('common.msg_save_error'));
                });
                console.log('Error', error);
            })
    }

    render() {
        return (
            <>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.showCallingView}
                    onRequestClose={() => {
                        this.endCallAndUpdateView();
                    }}
                >
                    {this.state.showCallingView && (

                        <View style={{ flex: 1, width: width, height: height }}>
                            {
                                this.state.stream?.loading ? (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            width: width,
                                            height: height,
                                            zIndex: Number.MAX_VALUE,
                                            left: 0,
                                            right: 0,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.3)'
                                        }}
                                    >

                                        <View
                                            style={{
                                                minWidth: width * 0.5,
                                                maxWidth: width * 0.7,
                                                minHeight: width * 0.5,
                                                maxHeight: width * 0.7,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: 20
                                            }}
                                        >
                                            <ActivityIndicator
                                                color={'#fff'}
                                                size='large'
                                                style={{
                                                    transform: [
                                                        {
                                                            scale: 1.2
                                                        }
                                                    ]
                                                }}
                                            />

                                            <View style={{ paddingVertical: 12 }} />

                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {
                                                    this.state.stream.loadingText
                                                }
                                            </Text>
                                        </View>

                                    </View>
                                )
                                    : null
                            }

                            <StringeeCallView
                                isMute={this.state.isMute}
                                isSpeaker={this.state.isSpeaker}
                                direction={this.state.syncCall?.direction?.toUpperCase() || 'OUTBOUND'}
                                callState={this.state.callState}
                                isShowCallLog={this.state.isShowCallLog}
                                isAnswer={
                                    this.state.syncCall != null
                                        ? this.state.syncCall?.answered
                                        : this.state.answeredCall
                                }
                                hasLocalStream={this.state.hasReceivedLocalStream}
                                hasRemoteStream={this.state.hasReceivedRemoteStream}
                                isVideoCall={false}
                                syncCall={this.state.syncCall}
                                endCallHandler={() => {
                                    if (
                                        this.state.syncCall != null &&
                                        this.state.syncCall?.callId != ''
                                    ) {
                                        this.refs.stringeeCall?.hangup?.(
                                            this.state.syncCall?.callId,
                                            (status, code, message) => {
                                                console.error('>>>>>>>>>>>> Hangup call: ', status, code, message);
                                                if (!status) {
                                                    // Fail
                                                    this.handleFailRequest(this.state.syncCall?.callId, this.state.syncCall?.serial);
                                                }
                                                else {
                                                    let newSyncCall = this.state.syncCall
                                                    newSyncCall.endedStringeeCall = true;
                                                    newSyncCall.isShowCallLog = true;
                                                    newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                                                    newSyncCall.calling = false;
                                                    newSyncCall.endedStringeeCall = true;
                                                    newSyncCall.endedCallkit = true;
                                                    this.setState({
                                                        syncCall: newSyncCall
                                                    }, () => {
                                                        this.endAllCallKit();
                                                    })
                                                }
                                            },
                                        );
                                    } else {
                                        // Update UI
                                        this.endCallAndUpdateView();
                                        console.log(
                                            'KHONG THE END CALL, syncCall: ' +
                                            this.state.syncCall +
                                            ' callId: ' +
                                            this.state.syncCall?.callId,
                                        );
                                    }
                                }}
                                answerCallHandler={() => {
                                    var newSyncCall = this.state.syncCall || new SyncCall();
                                    newSyncCall.answered = true;
                                    console.log('>>>>>>>>>> answer call from UI with syncCall: ', newSyncCall);
                                    this.setState({
                                        syncCall: newSyncCall,
                                        syncCallCache: newSyncCall
                                    });
                                    this._answerCallActionFromUI()
                                    // Gọi hàm answer của Callkit rồi xử lý luồng như khi người dùng click answer từ callkit
                                    // RNCallKeep.answerIncomingCall(newSyncCall?.callkitId);
                                }}
                                rejectCallHandler={() => {
                                    // Cap nhat trang that rejected cho syncCall
                                    var newSyncCall = this.state.syncCall || {};
                                    newSyncCall.rejected = true;

                                    this.setState({
                                        syncCall: newSyncCall,
                                        syncCallCache: newSyncCall
                                    });

                                    if (
                                        this.state.syncCall != null &&
                                        this.state.syncCall?.callId != ''
                                    ) {
                                        this.refs.stringeeCall.reject(
                                            this.state.syncCall?.callId,
                                            (status, code, message) => {
                                                if (!status) {
                                                    // Fail
                                                    this.handleFailRequest(this.state.syncCall?.callId, this.state.syncCall?.serial);
                                                }
                                            },
                                        );
                                    } else {
                                        // Update UI
                                        this.endCallAndUpdateView();
                                        console.log(
                                            'KHONG THE REJECT CALL, syncCall: ' +
                                            this.state.syncCall +
                                            ' callId: ' +
                                            this.state.syncCall?.callId,
                                        );
                                    }
                                }}
                                speakerChangeHandler={this._speakerAction}
                                muteChangeHandler={this._muteAction}
                                sendDTMF={(dtmf) => this._sendDTMF(dtmf)}
                                loadingSaveCallLog={this.state.loadingSaveCallLog}
                                onSaveLogToCache={(data) => {
                                    console.log('Data onSaveLogToCache: ', data);
                                    const newSyncCall: SyncCall = this.state.syncCall;
                                    newSyncCall.callLogData = data;
                                    this.setState({ syncCall: newSyncCall, syncCallCache: newSyncCall });
                                }}
                                onSaveCallLog={(data, hasOtherCallIncoming) => {
                                    console.log('Data onSaveCallLog: ', data);

                                    if (!hasOtherCallIncoming) {
                                        const newSyncCall: SyncCall = this.state.syncCall;
                                        newSyncCall.callLogData = data;
                                        this.setState({ syncCall: newSyncCall }, () => {
                                            this._saveCallLog(hasOtherCallIncoming);
                                        });
                                    }
                                    else {
                                        const newSyncCall: SyncCall = this.state.syncCallCache;
                                        newSyncCall.callLogData = data;
                                        this.setState({ syncCallCache: newSyncCall }, () => {
                                            this._saveCallLog(hasOtherCallIncoming);
                                        });
                                    }

                                }}
                                onCreateNewCustomer={(customer, module) => {
                                    console.log('infomation: customer', customer, module);
                                    this.saveNewCustomer(customer, module);
                                }}
                            />
                        </View>
                    )}
                </Modal>

                <View>
                    <StringeeClient
                        ref="stringeeClient"
                        eventHandlers={this.clientEventHandlers}
                    />
                    <StringeeCall
                        ref="stringeeCall"
                        clientId={this.getClientId()}
                        eventHandlers={this.callEventHandlers}
                    />
                </View>

                {
                    this.state.showPopupRequiredPermission ? (
                        <Portal>
                            <View
                                style={{
                                    position: 'absolute',
                                    zIndex: Number.MAX_VALUE,
                                    bottom: 80,
                                    width: widthDevice - 24,
                                    left: 12,
                                    minHeight: 50,
                                    backgroundColor: '#ffffff',
                                    elevation: 7,
                                    borderRadius: 12,
                                    padding: 10,
                                    borderWidth: 1,
                                    borderColor: '#008ecf'
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {getLabel('softPhone.title_request_permission_phone_account')}
                                </Text>
                                <Text>
                                    {getLabel('softPhone.label_description_request_permission_phone_account')}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end'
                                    }}
                                >

                                    <TouchableOpacity
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 4
                                        }}
                                        onPress={() => this.setState({ showPopupRequiredPermission: false })}
                                    >
                                        <Text
                                            style={{
                                                color: 'red'
                                            }}
                                        >
                                            {getLabel('common.btn_close')}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 4
                                        }}

                                        onPress={() => {
                                            this.setState({ showPopupRequiredPermission: false }, () => {
                                                RNCallKeep.hasDefaultPhoneAccount(options.android);
                                            });
                                        }}
                                    >
                                        <Text style={{ color: '#008ecf' }}>
                                            {getLabel('tools.label_open_settings')}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </Portal>
                    )
                        : null
                }
            </>
        )
    }
}

export default StringeeModule;

const styles = StyleSheet.create({})