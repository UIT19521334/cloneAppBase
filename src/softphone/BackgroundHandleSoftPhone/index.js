import AsyncStorage from "@react-native-community/async-storage";
import moment from 'moment-timezone';
import RNCallKeep from "react-native-callkeep";
import uuid from 'react-native-uuid';
import Global from "../../Global";
import IncomingCallAndroid, { IncomingCallAction } from "../IncomingCallAndroid";
import SyncCall from "../Models/SyncCall";
import { StringeeCallCustom, StringeeClientCustom } from "../StringeeModules";

class BackgroundHandleSoftPhone {
    syncCall;
    currentIncomingData;

    constructor(incomingData) {
        this.currentIncomingData = incomingData;
        this.syncCall = new SyncCall();
        StringeeClientCustom.init();
        StringeeClientCustom.registerClientEventHandlers({
            onConnect: (response) => {
                console.log(`StringeeClientCustom connected with userId: ${response.userId}`);
                AsyncStorage.setItem('StringeeNativeConnected', response.userId)
                    .catch((err) => console.log('Cannot save state stringee native'));
                Global.hasCreateEventCall = false;
                this.registerCallEventHandlers();
                // this.initIncomingCall(this.currentIncomingData?.callId, false, this.currentIncomingData?.from?.number, this.currentIncomingData?.from?.alias);
            },
            onDisConnect: (response) => {
                console.log(`StringeeClientCustom onDisConnect with userId: ${response.userId}`);
            },
            onFailWithError: (response) => {
                console.log(`StringeeClientCustom onFailWithError with ${response.code} - ${response.message}`);
            },
            onRequestAccessToken: (response) => {
                console.log(`StringeeClientCustom onRequestAccessToken`);
            },
            onIncomingCall: async (response) => {
                console.log(`StringeeClientCustom onIncomingCall with: userId:${response.userId} - ${response.from} - ${response.to} - ${response.fromAlias} - ${response.toAlias} - ${response.callType} - ${response.isVideoCall} - ${response.customDataFromYourServer}`);
                Global.dataCallBackground = response;
                var newSyncCall = new SyncCall();
                var callKitUUID = uuid.v4();
                if (!this.syncCall?.callkitId) {
                    Global.callKitUUID = callKitUUID;
                }
                newSyncCall.callkitId = callKitUUID;
                newSyncCall.callId = response.callId;
                newSyncCall.phoneNumber = response.from?.toString()?.replace('btncall_', '');
                newSyncCall.receivedStringeeCall = true;
                newSyncCall.isVideoCall = response.isVideoCall;
                newSyncCall.direction = 'Inbound';
                this.syncCall = newSyncCall;

                console.log('>>>>>>>>>>>> get Default avatar from background: ', Global.getImageUrl(''));
                Global.serverUrl = await AsyncStorage.getItem('serverUrl');
                Global.token = await AsyncStorage.getItem('token');
                console.log(' Tocken login: ', Global.token);
                StringeeCallCustom.initAnswer(response.callId,
                    (status, code, message) => {
                        if (status) {
                            console.log('Stringee call custom init answer succesfully!');
                            // IncomingCallAndroid.display({
                            //     callUUID: callKitUUID,
                            //     fromAlias: Global.checkPhoneHasCode(response.fromAlias.replace('btncall_', '')),
                            //     avatar: Global.getImageUrl(''),
                            //     infoText: Global.appName,
                            //     companyName: '',
                            //     timeOutEndCall: 20000
                            // });

                            Global.getDataCaller(response.from?.toString()?.replace('btncall_', ''),
                                (data) => {
                                    const dataUser = data?.customer_data || {};
                                    console.log('Stringee Native get Data user call: ', dataUser);
                                    const username = (dataUser && Object.keys(dataUser).length > 0) ? `${dataUser?.label}` : Global.checkPhoneHasCode(response.fromAlias?.replace('btncall_', ''))

                                    var newSyncCall = this.syncCall || new SyncCall();
                                    newSyncCall.canCreateNewCustomer = !dataUser || Object.keys(dataUser).length === 0;
                                    newSyncCall.customerData = dataUser || {};
                                    newSyncCall.metadata = data?.metadata;
                                    newSyncCall.customerId = dataUser?.id || '';
                                    newSyncCall.record_module = dataUser?.record_module || '';
                                    newSyncCall.companyName = dataUser?.account_id_display || dataUser?.company || dataUser?.account_name || '';
                                    newSyncCall.customerName = username;
                                    newSyncCall.avatar = dataUser?.customer_avatar

                                    this.syncCall = newSyncCall;

                                    IncomingCallAndroid.display({
                                        callUUID: callKitUUID,
                                        fromAlias: username,
                                        avatar: Global.getImageUrl(dataUser?.customer_avatar || ''),
                                        infoText: Global.appName,
                                        companyName: dataUser?.company || dataUser?.account_id_display || dataUser?.account_name || '',
                                        timeOutEndCall: 20000
                                    })
                                },
                                () => {
                                    IncomingCallAndroid.display({
                                        callUUID: callKitUUID,
                                        fromAlias: Global.checkPhoneHasCode(response.fromAlias.replace('btncall_', '')),
                                        avatar: Global.getImageUrl(''),
                                        infoText: Global.appName,
                                        companyName: '',
                                        timeOutEndCall: 20000
                                    });
                                });

                        } else {
                            console.log(`Stringee call custom init answer Failure width code: ${code} - meggase: ${message}`);
                            var newSyncCall = this.syncCall || new SyncCall();
                            const today = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                            newSyncCall.startTime = today;
                            newSyncCall.endTime = today;
                            newSyncCall.answered = false;
                            newSyncCall.endedCallkit = false;
                            newSyncCall.endedStringeeCall = false;
                            this.syncCall = newSyncCall;
                            Global.dataCallBackground = {};
                        }
                    });
            },
            onIncomingCall2: (response) => {
                console.log(`StringeeClientCustom onIncomingCall2 with: userId:${response.userId} - ${response.from} - ${response.to} - ${response.fromAlias} - ${response.toAlias} - ${response.callType} - ${response.isVideoCall} - ${response.customDataFromYourServer}`);
            },
            onCustomMessage: (response) => {
                console.log(`StringeeClientCustom onCustomMessage with ${response.from} - ${response.data}`);
            }
        });
    }

    registerCallEventHandlers() {
        StringeeCallCustom.registerCallEventHandlers({
            onChangeSignalingState: (response) => {
                console.log(`Stringee call custom onChangeSignalingState ${response.callId} - ${response.code} - ${response.reason} - ${response.sipCode} - ${response.sipReason}`);

                if (this.syncCall) {
                    var newSyncCall = this.syncCall || new SyncCall();
                    newSyncCall.callCode = response.code;

                    // Neu la cuoc goi ra vaf code la 2 --> set lai time start
                    if (`${response.code}` == '2' && newSyncCall?.direction?.toUpperCase() == 'OUTBOUND') {
                        newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                        newSyncCall.calling = true;
                    }

                    // Neu la end hoac reject call thi cap nhat trang thai endedStringeeCall cho sync call
                    if (`${response.code}` == '3' || `${response.code}` == '4') {
                        newSyncCall.endedStringeeCall = true;
                        newSyncCall.isShowCallLog = true;
                        newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                        newSyncCall.calling = false;
                        newSyncCall.endedStringeeCall = true;
                        newSyncCall.endedCallkit = true;
                    }

                    this.syncCall = newSyncCall;
                }

                switch (`${response.code}`) {
                    case '3':
                        // Rejected
                        IncomingCallAndroid.dismiss;
                        IncomingCallAndroid.dismissAnswer();
                        break;
                    case '4':
                        // Ended

                        if (this.syncCall?.answered) {
                            IncomingCallAndroid.dismiss;
                            IncomingCallAndroid.dismissAnswer();
                            AsyncStorage.setItem('SoftPhone.AndroidHandledOnBackground', JSON.stringify(this.syncCall || {}), (err) => {
                                console.log('Save call log to cache!');
                            })
                            IncomingCallAndroid.backToMyApp();
                        }
                        else {
                            this.syncCall = {};
                        }
                        break;
                }

            },
            onChangeMediaState: ({ callId, code, description }) => {
                console.log(`Stringee call custom onChangeMediaState ${callId} - ${code} - ${description}`);

                if (code == 0) {
                    var newSyncCall = this.syncCall || new SyncCall();
                    newSyncCall.answered = true;
                    newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                    newSyncCall.calling = true;
                    this.syncCall = newSyncCall;
                }

            },
            onReceiveLocalStream: ({ callId }) => {
                console.log(`Stringee call custom onReceiveLocalStream ${callId}`);
                const newSyncCall = this.syncCall || new SyncCall();
                newSyncCall.hasReceiveLocalStream = true;
                this.syncCall = newSyncCall;
            },
            onReceiveRemoteStream: ({ callId }) => {
                console.log(`Stringee call custom onReceiveRemoteStream ${callId}`);
                const newSyncCall = this.syncCall || new SyncCall();
                newSyncCall.hasReceivedRemoteStream = true;
                this.syncCall = newSyncCall;
            },
            onReceiveCallInfo: ({ callId, data }) => {
                console.log(`Stringee call custom onReceiveCallInfo ${callId} - ${data}`);
            },
            onHandleOnAnotherDevice: ({ callId, code, description }) => {
                console.log(`Stringee call custom onHandleOnAnotherDevice ${callId} - ${code} - ${description}`);
                // Cuộc gọi đã được answer, reject hoặc end ở máy khác thì cần kết thúc ở đây
                if (`${code}` == "2" || `${code}` == "3" || `${code}` == "4") {
                    IncomingCallAndroid.dismiss();
                    IncomingCallAndroid.dismissAnswer();
                }
            },
        });

        IncomingCallAndroid.registerEventIncomingCall({
            answer: (payload) => {
                console.log('LOG.RNCallKeep answerCall :', payload?.uuid, JSON.stringify(this.syncCall));

                if (this.syncCall && this.syncCall?.callId) {
                    StringeeCallCustom.answer(
                        this.syncCall?.callId,
                        (status, code, message) => {
                            console.log('call did answer ' + status + ' - message: ' + message);
                            const today = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                            if (status) {
                                var newSyncCall = this.syncCall || new SyncCall();
                                newSyncCall.answered = true;
                                newSyncCall.startTime = today;
                                newSyncCall.callkitId = payload?.uuid;
                                this.syncCall = newSyncCall;

                                IncomingCallAndroid.setCallScreenActive(payload.uuid);
                                StringeeCallCustom?.setSpeakerphoneOn(
                                    this.syncCall?.callId,
                                    false,
                                    (status, code, message) => {
                                        console.log(">>>>>>>_callDidChangeMediaState: ", message, status, code,);
                                    },
                                );
                                RNCallKeep.endAllCalls();
                            }
                            else {
                                IncomingCallAndroid.dismiss()
                                var newSyncCall = this.syncCall || new SyncCall();
                                newSyncCall.endedCallkit = true;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.endTime = today;
                                newSyncCall.startTime = today;
                                newSyncCall.answered = false;
                                this.syncCall = newSyncCall;
                                RNCallKeep.endAllCalls();
                            }
                        }
                    );
                }
                // else {
                //     IncomingCallAndroid.dismiss()
                //     var newSyncCall = this.syncCall || new SyncCall();
                //     newSyncCall.endedCallkit = true;
                //     newSyncCall.endedStringeeCall = true;
                //     newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                //     newSyncCall.startTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                //     newSyncCall.answered = false;
                //     this.syncCall = newSyncCall;
                // }
            },
            toggleMute: ({ isMute }) => {
                console.log('Stringee custtom Mute changes: ', isMute);
                StringeeCallCustom.mute(
                    this.syncCall?.callId || Global.dataCallBackground?.callId,
                    !isMute,
                    (status, code, message) => {
                        console.log('Background: stringe muted is ', isMute);
                        if (status) {
                            IncomingCallAndroid.setMute(isMute ? 'ON' : 'OFF');
                        }
                    }
                )
            },
            toggleSpeaker: ({ isSpeaker }) => {
                StringeeCallCustom.setSpeakerphoneOn(
                    this.syncCall?.callId || Global.dataCallBackground?.callId,
                    isSpeaker,
                    (status, code, message) => {
                        if (status) {
                            IncomingCallAndroid.setSpeaker(isSpeaker ? 'ON' : 'OFF');
                        }
                    },
                );
            },
            endCall: (payload) => {
                console.log('Stringee custtom endCall', payload, Global.callKitUUID, JSON.stringify(this.syncCall));
                if (this.syncCall && this.syncCall?.callId && (this.syncCall?.callkitId == payload?.uuid || Global.callKitUUID == payload?.uuid)) {
                    if (this.syncCall?.answered) {
                        console.log('HANGUP CALL KHI END CALLKIT');
                        StringeeCallCustom.hangup(
                            this.syncCall?.callId,
                            (status, code, message) => {
                                console.log('stringeeCall.hangup: ' + message);
                                var newSyncCall = this.syncCall;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.isShowCallLog = true;
                                newSyncCall.callkitId = Global.callKitUUID
                                newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                                newSyncCall.calling = false;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.endedCallkit = true;
                                newSyncCall.answered = false;
                                this.syncCall = newSyncCall;
                                console.log(IncomingCallAction.END_CALL + ' hangup', JSON.stringify(newSyncCall));

                                AsyncStorage.setItem('SoftPhone.AndroidHandledOnBackground', JSON.stringify(newSyncCall), (err) => {
                                    console.log('Save call log to cache!');
                                })

                                Global.isAnswered = false;
                                Global.dataCallBackground = {};

                                if (status) {
                                    // Sucess
                                    IncomingCallAndroid.backToMyApp();
                                    IncomingCallAndroid.dismissAnswer();

                                } else {
                                    // Fail
                                    IncomingCallAndroid.backToMyApp();
                                    IncomingCallAndroid.dismissAnswer();
                                }
                            },
                        );
                    }
                    else {
                        StringeeCallCustom.reject(
                            this.syncCall?.callId,
                            (status, code, message) => {
                                console.log('stringeeCall.reject: ' + message);
                                if (status) {
                                    // Sucess
                                    IncomingCallAndroid.backToMyApp();
                                    IncomingCallAndroid.dismiss();
                                } else {
                                    // Fail
                                    IncomingCallAndroid.backToMyApp();
                                    IncomingCallAndroid.dismiss();
                                }

                                var newSyncCall = this.syncCall;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.isShowCallLog = true;
                                newSyncCall.callkitId = Global.callKitUUID
                                newSyncCall.startTime = newSyncCall.startTime || moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                                newSyncCall.endTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                                newSyncCall.calling = false;
                                newSyncCall.rejected = true;
                                newSyncCall.answered = false;
                                newSyncCall.endedStringeeCall = true;
                                newSyncCall.endedCallkit = true;
                                this.syncCall = newSyncCall;

                                console.log(IncomingCallAction.END_CALL + ' reject', JSON.stringify(newSyncCall));

                                Global.isAnswered = false;
                                Global.dataCallBackground = {};
                            },
                        );
                    }
                }
                else {
                    IncomingCallAndroid.dismiss();
                    IncomingCallAndroid.dismissAnswer();
                }
            }
        })
    }

    connect(accessToken) {
        StringeeClientCustom.connect(accessToken);
    }
}

export default BackgroundHandleSoftPhone;