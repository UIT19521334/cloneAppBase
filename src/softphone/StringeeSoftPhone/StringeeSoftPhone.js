import { CheckBox, Content, Icon, Input } from 'native-base';
import React, { Component } from 'react';
import { Alert } from 'react-native';
import {
    AppState, DeviceEventEmitter,
    Dimensions, FlatList,
    ImageBackground, Modal,
    PermissionsAndroid, Platform,
    SafeAreaView, StyleSheet, Text, TouchableOpacity,
    Vibration, View
} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import Toast from 'react-native-root-toast';
import uuid from 'react-native-uuid';
import VoipPushNotification from 'react-native-voip-push-notification';
import { each } from "underscore";
import Config from '../../Config.json';
import { getLabelWithGlobalInstance, heightDevice, widthDevice } from '../../utils/commons/commons';
import I18n from '../../utils/i18n/index';
import SoftPhoneCallLog from '../SoftPhoneCallLog';
import QuickCreateCustomer from '../SoftPhoneCallLog/QuickCreateCustomer';
import SoftPhoneUI from '../SoftPhoneUI';
import IncomingCallAndroid from '../IncomingCallAndroid';
import AsyncStorage from '@react-native-community/async-storage';
const width = widthDevice;
const height = heightDevice;
const options = {
    ios: {
        appName: Config.appName,
        includesCallsInRecents: false,
        maximumCallGroups: 1,
        maximumCallsPerCallGroup: 1
    },
    android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
    },
};

const checkAndroidPermissions = () =>
    new Promise((resolve, reject) => {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ])
            .then(result => {
                const permissionsError = {};
                permissionsError.permissionsDenied = [];
                each(result, (permissionValue, permissionType) => {
                    if (permissionValue === "denied") {
                        permissionsError.permissionsDenied.push(permissionType);
                        permissionsError.type = "Permissions error";
                    }
                });
                if (permissionsError.permissionsDenied.length > 0) {
                    reject(permissionsError);
                } else {
                    resolve();
                }
            })
            .catch(error => {
                reject(error);
            });
    });

// { context, canShowSoftPhone, stringeeCall, direction, callInfo, dismissView, globalInstance }
export class StringeeSoftPhone extends Component {

    constructor(props) {
        super(props);

        DeviceEventEmitter.addListener('Stringee.HandleChangeSignalingState', ({ data }) => {
            this._handleChangeSignalingState(data);
        })

        DeviceEventEmitter.addListener('Stringee.HandleCChangeMediaState', ({ data }) => {
            this._callDidChangeMediaState(data);
        })

        DeviceEventEmitter.addListener('Stringee.HandleReceiveLocalStream', ({ data }) => {
            this._callDidReceiveLocalStream(data);
        })

        DeviceEventEmitter.addListener('Stringee.HandleReceiveRemoteStream', ({ data }) => {
            this._callDidReceiveRemoteStream(data);
        })

        DeviceEventEmitter.addListener('Stringee.HandleOnAnotherDevice', ({ data }) => {
            const { callId, code, description } = data;
            if (code == 2 || code == 3 || code == 4) {
                this._endCallAction();
                if (Platform.OS === 'android') {
                    IncomingCallAndroid.dismiss();
                    IncomingCallAndroid.dismissAnswer();
                }
                this.props.globalInstance.stopRingStone();
            }
        })

        if (Platform.OS === 'ios') {
            RNCallKeep.setup(options);
            VoipPushNotification.registerVoipToken();


            VoipPushNotification.addEventListener('register', (token) => {
                this.setState({ pushToken: token })
                this.props.stringeeClient.registerPush(
                    token,
                    true, // isProduction: false: In development, true: In Production.
                    true, // (iOS) isVoip: true: Voip PushNotification. Stringee supports this push notification.
                    (status, code, message) => {
                        console.log('Stringee register VOIP1: ' + message);
                        this.setState({ registeredToken: status });
                        AsyncStorage.multiSet([
                            ["isPushTokenRegistered", "true"],
                            ["deviceToken", token]
                        ]);
                    },
                );
            });

            VoipPushNotification.addEventListener('notification', (notification) => {
                const callKitUUID = notification.getData().uuid;
                const callSerial = notification.getData().serial;
                const callId = notification.getData().callId;
                console.log('Notification CallSerial 1: ' + callSerial + ' callId: ' + callId + ' callKitUUID: ' + callKitUUID);
                // Neu call da duoc xu ly roi thi end callkit vua show
                if (this.state.callKitUUID != callKitUUID) {
                    RNCallKeep.endCall(callKitUUID);
                }
            });

            RNCallKeep.addEventListener('didDisplayIncomingCall', ({ error, callUUID, handle, localizedCallerName, hasVideo, fromPushKit, payload }) => {
                // Call back khi show callkit cho incoming call thanh cong, end fakeCall da show o day
                console.log('END FAKE CALL, UUID: ' + callUUID + ' fakeCallIds: ');
                if (this.state.callKitUUID != callUUID) {
                    RNCallKeep.endCall(callUUID);
                }

                // if (AppState.currentState === 'active') {
                //     RNCallKeep.endAllCalls()
                // }
            });

            RNCallKeep.addEventListener('didActivateAudioSession', (data) => {
                console.log('LOG.didActivateAudioSession', data);
                this.setState({ isActivateAudioSession: true }, () => {
                    // this._answerCallAction();
                })
            });

            RNCallKeep.addEventListener(
                'didReceiveStartCallAction',
                ({ handle, callUUID, name }) => { },
            );

            RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
                console.log('LOG.didPerformSetMutedCallAction: ', muted);
                if (muted != this.state.hasMute) {
                    this._muteAction()
                }
            });

            RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
                console.log('LOG.call KIT UUID: ', callUUID);
                this._answerCallAction();
            });

            RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
                console.log('LOG.endCall', callUUID);
                //  && AppState.currentState != 'active'
                if (this.state.callKitUUID === callUUID) {
                    // StringeeCall van chua duoc end thi can end
                    if (this.state.isAnswered) {
                        console.log('LOG.Hangup access');
                        this.props.stringeeCall.hangup(
                            this.state.currentCallId,
                            (status, code, message) => {
                                console.log('hangup success callkeep:', message, status, code);
                                RNCallKeep.endAllCalls()
                                this.setState({ isShowCallLog: true, isShowSoftPhone: true, hasActionAnsweredOnBackground: false })
                            }
                        );
                    } else {
                        console.log('LOG.reject access');
                        this.props.stringeeCall.reject(
                            this.state.currentCallId,
                            (status, code, message) => {
                                console.log('reject success callkeep :', message, status, code);
                                RNCallKeep.endAllCalls()

                                this.setState({ isShowSoftPhone: true, isShowCallLog: true, hasActionAnsweredOnBackground: false });
                            }
                        );
                    }
                }

            });

            AppState.removeEventListener('change', (state) => {
                console.log('LOG.appState removeEventListener: ', state);
            })

        }
    }

    state = {
        toggleSilent: true,
        direction: this.props.direction || 'Outbound',
        loadingSaveCallLog: false,
        isShowSoftPhone: false,
        isShowCallLog: false,
        isShowModalProduct: false,
        isShowRepeat: false,
        isShowInfoCustomer: false,
        canCreateNewCustomer: false,
        hasCallLogTemp: false,
        // State Softphone
        callState: '',
        currentCallId: '',
        hasReceivedLocalStream: false,
        hasReceivedRemoteStream: false,
        hasMute: true,
        hasSpeaker: false,
        isAnswered: false,
        customerData: {},
        metadata: {},
        callPurpose: {},
        callPurposeOther: '',
        callInBoundPurpose: {},
        callInboundPurposeOther: '',
        startTime: '',
        endTime: '',
        subject: '',
        description: '',
        visibility: 'PUBLIC',
        resultCall: {},
        recallTime: {},
        recallMoment: {},
        recallTimeOther: new Date(),
        recallDateOther: {},
        isOtherRecall: false,
        newCustomer: {
            salutationtype: '',
            firstname: '',
            lastname: '',
            mobile: '',
            email: '',
            assigned_user_id: 'Users:' + this.props.globalInstance.user.id,
            company: '',
            lane: '',
            city: '',
            state: '',
            country: '',
            description: ''
        },
        dtmf: ''
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        console.log('LOG.PROPS DATA: ',);
        if (nextProps.hasOtherCallIncoming) {
            // this.saveCallLog(true);
        }
    }

    componentDidMount() {
        this.setState({ direction: this.props.direction });

        if (this.props.showCallLogWhenHandleFromBackground) {
            console.log('LOG.Data from background: ', this.props.callInfo);
            this.getDataReceiver(
                this.props.callInfo?.from?.number?.toString().replace('btncall_', ''),
                null,
                'INBOUND',
                () => { }
            );
            this.setState({
                isShowSoftPhone: true,
                isShowModalProduct: false,
                currentCallId: this.props.callInfo?.callId || '',
                hasActionAnsweredOnBackground: false,
                endTime: new Date(),
                currentCalling: false,
                startTime: this.props.callInfo?.startCallTime || new Date(),
                endTime: this.props.callInfo?.endCallTime || new Date(),
            }, () => {
                this.setState({ isShowCallLog: true })
            })
        }
        else {
            if (this.props.direction === 'INBOUND') {
                if (Platform.OS === 'android') {
                    checkAndroidPermissions()
                        .then(() => {
                            if (this.state.isShowCallLog) {
                                this.setState({
                                    isShowCallLog: false,
                                    isShowSoftPhone: true,
                                    isShowModalProduct: false
                                }, () => {
                                    this.initIncomingCall(this.props.callInfo);
                                })

                            } else {
                                this.initIncomingCall(this.props.callInfo);
                            }

                        })
                        .catch(error => {
                            alert("You must grant permissions to make a call " + error);
                        });

                    this.getDataReceiver(
                        this.props.callInfo?.fromAlias?.toString().replace('btncall_', ''),
                        null,
                        'INBOUND',
                        () => { }
                    );
                } else {
                    this.getDataReceiver(
                        this.props.callInfo?.fromAlias?.toString().replace('btncall_', ''),
                        null,
                        'INBOUND',
                        () => {
                            if (AppState.currentState === 'active') {
                                if (this.state.isShowCallLog) {
                                    this.setState({
                                        isShowCallLog: false,
                                        isShowSoftPhone: true,
                                        isShowModalProduct: false
                                    }, () => {
                                        this.initIncomingCall(this.props.callInfo);
                                    })

                                } else {
                                    this.initIncomingCall(this.props.callInfo);
                                }
                            } else {
                                if (this.state.isShowCallLog) {
                                    this.setState({
                                        isShowCallLog: false,
                                        isShowSoftPhone: false,
                                        isShowModalProduct: false
                                    }, () => {
                                        this.initIncomingCall(this.props.callInfo);
                                    })

                                } else {
                                    this.initIncomingCall(this.props.callInfo);
                                }
                            }
                        }
                    );


                }
            }
            else {
                checkAndroidPermissions()
                    .then(() => {
                        this.setState({
                            isShowSoftPhone: true,
                            currentCallId: this.props.callInfo?.callId
                        })
                    })
                    .catch(error => {
                        alert("You must grant permissions to make a call " + error);
                    });
                this.getDataReceiver(
                    this.props.callInfo?.to?.toString().replace('btncall_', ''),
                    this.props.callInfo?.userId || '',
                    'OUTBOUND',
                    () => { }
                );
            }

            AppState.addEventListener('change', (state) => {
                console.log('LOG.AppState Change: ', state);
                if (this.state.hasActionAnsweredOnBackground && state === 'active') {
                    this.setState({ isShowSoftPhone: true })
                }
            })
        }
    }

    componentWillUnmount() {
        console.log('LOG.has access componentWillUnmount: ');

        DeviceEventEmitter.removeListener('Stringee.HandleChangeSignalingState', () => {
            console.log('LOG. Has remove HandleChangeSignalingState');
        })
        DeviceEventEmitter.removeListener('Stringee.HandleCChangeMediaState', () => {
            console.log('LOG. Has remove HandleCChangeMediaState');
        })
        DeviceEventEmitter.removeListener('Stringee.HandleReceiveLocalStream', () => {
            console.log('LOG. Has remove HandleReceiveLocalStream');
        })
        DeviceEventEmitter.removeListener('Stringee.HandleReceiveRemoteStream', () => {
            console.log('LOG. Has remove HandleReceiveRemoteStream');
        })
        DeviceEventEmitter.removeListener('Stringee.HandleOnAnotherDevice', () => {
            console.log('LOG. Has remove HandleOnAnotherDevice');
        })

        RNCallKeep.removeEventListener('answerCall');
        RNCallKeep.removeEventListener('endCall');
        RNCallKeep.removeEventListener('didActivateAudioSession');
        RNCallKeep.removeEventListener('didReceiveStartCallAction');
        RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
        RNCallKeep.removeEventListener('didDisplayIncomingCall');

        VoipPushNotification.removeEventListener('notification', () => {
            console.log('Has Remove VoipPushNotification.removeEventListener');
        });
    }

    _handleChangeSignalingState = ({ callId, code, reason, sipCode, sipReason }) => {
        console.log('_handleChangeSignalingState: callId-' + callId + 'code-' + code + ' reason-' + reason + ' sipCode-' + sipCode + ' sipReason-' + sipReason);
        switch (code) {
            case 0:
                //State Calling
                this.setState({ callState: 'CALLING' })
                break;
            case 1:
                //State Ringing
                this.setState({ callState: 'RINGING' })
                break;
            case 2:
                //State Starting
                if (this.props.direction === 'OUTBOUND') {
                    this.setState({ callState: 'ANSWERED', isAnswered: true, startTime: new Date() }, () => {
                        this.props.globalInstance.stopRingStone();
                        Vibration.cancel();
                    })
                }
                else {
                    this.setState({ callState: 'ANSWERED', isAnswered: true }, () => {
                        this.props.globalInstance.stopRingStone();
                        Vibration.cancel();
                    })
                }

                break;
            case 3:
                //state Busy
                this.setState({ callState: 'HANGUP', endTime: new Date(), isAnswered: false, currentCalling: false, }, () => {
                    this.props.globalInstance.stopRingStone();
                    Vibration.cancel();
                    this._endCallAction();
                });

                break;
            case 4:
                //state Ended
                this.setState({ callState: 'HANGUP', endTime: new Date(), isAnswered: false, currentCalling: false, }, () => {
                    this.props.globalInstance.stopRingStone();
                    Vibration.cancel();
                    this._endCallAction();
                })
                break;
        }
    }

    // Invoked when the call media state changes
    _callDidChangeMediaState = ({ callId, code, description }) => {
        console.log('_callDidChangeMediaState: callId-' + callId + 'code-' + code + ' description-' + description);
        switch (code) {
            case 0:
                // Connected
                // this.setState({ mediaConnected: true });
                if (this.props.direction === 'INBOUND') {
                    this.setState({
                        isActivateAudioSession: true,
                        callState: 'ANSWERED',
                        isAnswered: true
                    }, () => {
                        this.props.globalInstance.stopRingStone();
                        Vibration.cancel();
                    })
                }
                else {
                    this.setState({
                        isActivateAudioSession: true,
                    }, () => {
                        this.props.globalInstance.stopRingStone();
                        Vibration.cancel();
                    })
                }

                // if (this.props.softPhoneState.answered) {
                // 	this.props.changeCallState('Started')
                // }
                break;
            case 1:
                // Disconnected
                break;
            default:
                break;
        }

    }

    // Invoked when the local stream is available    
    _callDidReceiveLocalStream = ({ callId }) => {
        console.log('_callDidReceiveLocalStream ' + callId);
        this.setState({ hasReceivedLocalStream: true });
    }

    // Invoked when the remote stream is available
    _callDidReceiveRemoteStream = ({ callId }) => {
        console.log('_callDidReceiveRemoteStream ' + callId);
        this.setState({ hasReceivedRemoteStream: true });
    }

    _endCallAction = () => {
        RNCallKeep.endAllCalls();
        if (Platform.OS === 'android') {
            IncomingCallAndroid.dismiss();
            IncomingCallAndroid.dismissAnswer();
        }
        this.setState({
            isShowCallLog: true,
            isShowSoftPhone: true,
            isShowModalProduct: false,
            isAnswered: false,
            currentCalling: false,
            hasActionAnsweredOnBackground: false
        }, () => {
            // this.props.dismissView?.();
        })
    }

    _sendDTMF = (dtmf) => {
        this.props.stringeeCall.sendDTMF(
            this.state.currentCallId,
            dtmf,
            (status, code, message) => {
                console.log(`_sendDTMF: status - ${status}, code - ${code}, message - ${message}`);
                if (status) {
                    this.setState({ dtmf: this.state.dtmf + dtmf })
                }
                else {
                    Alert.alert('', message)
                }
            },
        );
    }

    _muteAction = () => {
        this.props.stringeeCall.mute(
            this.state.currentCallId,
            this.state.hasMute,
            (status, code, message) => {
                this.setState({ hasMute: !this.state.hasMute })
                // if (this.state.currentCallId != '') {
                //     RNCallKeep.setMutedCall(this.state.currentCallKitId, this.state.isMute);
                // }
            },
        );
    };

    _speakerAction = () => {
        this.props.stringeeCall.setSpeakerphoneOn(
            this.state.currentCallId,
            !this.state.hasSpeaker,
            (status, code, message) => {
                this.setState({ hasSpeaker: !this.state.hasSpeaker })
            },
        );
    }

    _answerCallAction = () => {
        if (Platform.OS === 'ios') {
            // if (AppState.currentState === 'inactive' || AppState.currentState === 'background') {
            // if (this.state.isActivateAudioSession) {
            this.props.stringeeCall.answer(
                this.state.currentCallId,
                (status, code, message) => {
                    console.log('call did answer ios ' + status + ' - message: ' + message + ' - with callId: ' + this.state.currentCallId);
                    if (status) {
                        // Sucess
                        this.setState({
                            isAnswered: true,
                            startTime: new Date(),
                            hasActionAnsweredOnBackground: true
                        }, () => {
                            this.props.globalInstance.stopRingStone();
                            Vibration.cancel();
                        })

                    } else {
                        // Fail
                        this.setState({
                            isShowCallLog: false,
                            isShowSoftPhone: false,
                            isShowModalProduct: false,
                            isAnswered: false
                        }, () => {
                            this.props.globalInstance.stopRingStone();
                            Vibration.cancel();
                            RNCallKeep.endAllCalls();
                            this.props.dismissView?.();
                        })

                    }
                },
            );
            // }
            // }
            // else {
            // if (this.state.isActivateAudioSession) {
            // this.props.stringeeCall.answer(
            //     this.state.currentCallId,
            //     (status, code, message) => {
            //         console.log('call did answer ios 2 ' + status + ' - message: ' + message + ' - with callId: ' + this.state.currentCallId);
            //         if (status) {
            //             // Sucess
            //             this.setState({ isAnswered: true, startTime: new Date(), hasActionAnsweredOnBackground: true }, () => {
            //                 this.props.globalInstance.stopRingStone();
            //                 Vibration.cancel();
            //                 RNCallKeep.endAllCalls();
            //             })
            //         } else {
            //             // Fail
            //             this.setState({
            //                 isShowCallLog: false,
            //                 isShowSoftPhone: false,
            //                 isShowModalProduct: false,
            //                 isAnswered: false
            //             }, () => {
            //                 this.props.globalInstance.stopRingStone();
            //                 Vibration.cancel();
            //                 RNCallKeep.endAllCalls();
            //                 this.props.dismissView?.();
            //             })
            //         }
            //     },
            // );
            // }
            // }

        }
        else {
            this.props.stringeeCall.answer(
                this.state.currentCallId,
                (status, code, message) => {
                    // this.props.answerCall()

                    console.log('call did answer ' + status + ' - message: ' + message + ' - with callId: ' + this.state.currentCallId);
                    if (status) {
                        // Sucess
                        this.setState({ isAnswered: true, startTime: new Date() })
                    } else {
                        // Fail
                        this.setState({
                            isShowCallLog: false,
                            isShowSoftPhone: false,
                            isShowModalProduct: false,
                            isAnswered: false
                        }, () => {
                            this.props.globalInstance.stopRingStone();
                            Vibration.cancel();
                            RNCallKeep.endAllCalls();
                            this.props.dismissView?.();
                        })
                    }
                },
            );
        }

    };

    initIncomingCall = ({ callId, from, to, fromAlias, toAlias, callType, isVideoCall }) => {
        console.log('LOG.StringeeCallAnswer: ', this.props.stringeeCall.initAnswer);
        this.props.stringeeCall.initAnswer(callId, (status, code, message) => {
            console.log('initAnswer', message, status, code, callId);
            if (status) {
                // Sucess  && AppState.currentState != 'active'
                if (Platform.OS === 'ios') {
                    this.setState({
                        currentCallId: callId
                    }, () => {

                        var callKitUUID = uuid.v1();
                        this.setState({ callKitUUID: callKitUUID })
                        console.log('LOG.CALLKITUUID CURRENT: ', callKitUUID, (this.state.customerData && Object.keys(this.state.customerData).length > 0), this.state.customerData);
                        RNCallKeep.displayIncomingCall(
                            callKitUUID,
                            Config.appName,
                            (this.state.customerData && Object.keys(this.state.customerData).length > 0) ? `${this.state.customerData?.salutationtype ? ((this.props.globalInstance.getEnumLabel(this.state.customerData?.record_module, 'salutationtype', this.state.customerData?.salutationtype) || '') + ' ') : ''}${this.state.customerData?.full_name}` : this.props.globalInstance.checkPhoneHasCode(fromAlias.replace('btncall_', '')),
                            'generic',
                            false,
                        )
                    })
                }
                else {
                    this.setState({
                        isShowSoftPhone: true,
                        currentCallId: callId,
                        callState: 'INCOMING CALL'
                    }, () => {
                        this.props.globalInstance.playRingStone();
                        Vibration.vibrate([0, 500, 500], true);
                    })
                }

            } 
            else {
                // Fail
                this.setState({
                    isShowCallLog: false,
                    isShowSoftPhone: false,
                    isShowModalProduct: false,
                    isAnswered: false
                }, () => {
                    this.props.globalInstance.stopRingStone();
                    Vibration.cancel();
                    RNCallKeep.endAllCalls();
                    this.props.dismissView?.();
                })
            }
        });
    }

    getDataReceiver = (from, userId, direction, callback) => {
        var params = {
            RequestAction: 'GetDataForCallLog',
            Data: {
                customer_id: userId || '',
                customer_number: from,
                direction: direction || 'Outbound'
            }
        }
        // Call api
        this.props.globalInstance.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                console.log('DATA CUSTOMER:', data);
                this.setState({
                    customerData: data.customer_data,
                    metadata: data.metadata,
                    canCreateNewCustomer: !data.customer_data || Object.keys(data.customer_data).length === 0
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

    saveNewCustomer(customer, module) {

        let params = {
            'RequestAction': module === 'Leads' ? 'SaveLead' : 'SaveContact',
            'Data': customer
        }

        this.props.globalInstance.callAPI(null, params, (data) => {
            if (parseInt(data.success) === 1) {
                console.log('DATA CUSTOMER:', data);
                this.setState({ shouldUpdateFromNewCustomer: true })
                this.getDataReceiver(
                    customer.mobile,
                    null,
                    this.state.direction,
                    () => { }
                );
            }
            else {
                Toast.show(I18n.t('common.msg_no_results_found', { locale: globalInstance.locale }));
            }

        },
            error => {
                this.setState({
                    isShowCallLog: false,
                    isShowSoftPhone: false,
                    isShowModalProduct: false,
                    isAnswered: false
                }, () => {
                    this.props.dismissView?.();
                })
                console.log('Error', error);
            })
    }

    saveCallLog(paramsData, hasOtherCallIncoming) {
        let params = {
            'RequestAction': 'SaveCallLog',
            'Data': paramsData
        }

        this.setState({ loadingSaveCallLog: true })

        if (hasOtherCallIncoming) {
            setTimeout(() => {
                this.setState({
                    isShowModalProduct: false,
                    isAnswered: false,
                    loadingSaveCallLog: false,
                    hasCallLogTemp: false,
                }, () => {
                    setTimeout(() => {
                        this.props.dismissView?.();
                        this.props.globalInstance.callFromActivity = false;
                        this.props.globalInstance.callFromActivityData = null;
                        DeviceEventEmitter.emit('SoftPhone.CompleteSaveCallLog', { hasSave: true })
                    }, 700);
                })
            }, 1000);
        }

        this.props.globalInstance.callAPI(null, params, (data) => {
            console.log('LOG.DATA SAVE CAllLog: ', data);
            if (!hasOtherCallIncoming) {
                this.setState({
                    isShowCallLog: false,
                    isShowSoftPhone: false,
                    isShowModalProduct: false,
                    isAnswered: false,
                    loadingSaveCallLog: false,
                    hasCallLogTemp: false,
                }, () => {
                    this.props.dismissView?.();
                    // Check langue ==================
                    Toast.show('Lưu thông tin cuộc gọi thành công.')
                    this.props.globalInstance.callFromActivity = false;
                    this.props.globalInstance.callFromActivityData = null;
                })
            }

        },
            error => {
                if (!hasOtherCallIncoming) {
                    this.setState({
                        loadingSaveCallLog: false,
                        isShowCallLog: false,
                        isShowSoftPhone: false,
                        isShowModalProduct: false,
                        currentCalling: false,
                        isAnswered: false
                    }, () => {
                        this.props.dismissView?.();
                        this.props.globalInstance.callFromActivity = false;
                        this.props.globalInstance.callFromActivityData = null;
                    })
                }
                console.log('Error', error);
            })


    }

    render() {
        const phoneNumber = this.props.direction === 'INBOUND' ? this.props.globalInstance.checkPhoneHasCode(this.props.callInfo?.fromAlias?.toString().replace('btncall_', '')) : this.props.globalInstance.checkPhoneHasCode(this.props.callInfo?.to?.toString().replace('btncall_', ''));
        if (this.state.isShowSoftPhone) {
            const avatar = this.state.customerData?.customer_avatar ? { uri: this.state.customerData?.customer_avatar } : require('../../assets/images/avatar.jpg');
            const firstShow = this.state.canCreateNewCustomer;

            return (
                <Modal
                    visible={this.state.isShowSoftPhone}
                    presentationStyle='fullScreen'
                >
                    <>
                        <SoftPhoneUI
                            globalInstance={this.props.globalInstance}
                            callId={this.props.callInfo?.callId}
                            hasAcceptButton={true}
                            hasDeclineButton={true}
                            hasTransferButton={false}
                            hasMuteButton={true}
                            isSpeaker={this.state.hasSpeaker}
                            hasMute={this.state.isAnswered ? this.state.hasMute : this.state.toggleSilent}
                            rejectButtonClicked={() => {

                                this.props.stringeeCall.reject(
                                    this.state.currentCallId,
                                    (status, code, message) => {
                                        console.log('reject success :', message, status, code);
                                        if (status) {
                                            RNCallKeep.endAllCalls();

                                            this.setState({ isShowSoftPhone: true, isShowCallLog: true, hasActionAnsweredOnBackground: false, endTime: new Date(), currentCalling: false, }, () => {
                                                this.props.globalInstance.stopRingStone();
                                                Vibration.cancel();
                                            });
                                        } else {
                                            RNCallKeep.endAllCalls();
                                            this.setState({
                                                isShowCallLog: false,
                                                isShowSoftPhone: false,
                                                isShowModalProduct: false,
                                                isAnswered: false,
                                                currentCalling: false,
                                                hasActionAnsweredOnBackground: false
                                            }, () => {
                                                this.props.globalInstance.stopRingStone();
                                                Vibration.cancel();
                                                this.props.dismissView?.();
                                            })
                                        }
                                    }
                                );
                            }}
                            answerButtonClicked={() => {
                                console.log('answerButtonClicked');
                                this._answerCallAction();
                            }}
                            muteButtonClicked={() => {
                                if (this.state.isAnswered) {
                                    this._muteAction();

                                } else {
                                    if (this.state.toggleSilent) {
                                        this.props.globalInstance.setSilent(0);
                                        this.setState({ toggleSilent: false });
                                    } else {
                                        this.props.globalInstance.setSilent(1);
                                        this.setState({ toggleSilent: true });
                                    }
                                }
                            }}
                            transferButtonClicked={() => {
                                Alert.alert(
                                    '',
                                    'Tính năng chuyển đang phát triển. Vui lòng thử lại sau!',
                                    [
                                        {
                                            text: getLabelWithGlobalInstance('softPhone.btn_agree', this.props.globalInstance.locale),
                                            'style': 'cancel',
                                        }
                                    ]
                                )
                            }}
                            hangupButtonClicked={() => {
                                try {
                                    this.props.stringeeCall.hangup(
                                        this.state.currentCallId,
                                        (status, code, message) => {

                                            console.log('hangup success :', message, status, code);
                                            if (status) {
                                                RNCallKeep.endAllCalls();

                                                this.setState({
                                                    isShowCallLog: true,
                                                    isShowSoftPhone: true,
                                                    hasActionAnsweredOnBackground: false,
                                                    endTime: new Date(),
                                                    currentCalling: false,
                                                }
                                                    , () => {
                                                        Vibration.cancel();
                                                        this.props.globalInstance.stopRingStone();
                                                    })
                                            } else {
                                                RNCallKeep.endAllCalls();

                                                this.setState({
                                                    isShowCallLog: false,
                                                    isShowSoftPhone: true,
                                                    isShowModalProduct: false,
                                                    isAnswered: false,
                                                    hasActionAnsweredOnBackground: false,
                                                    currentCalling: false,
                                                }, () => {
                                                    this.props.globalInstance.stopRingStone();
                                                    Vibration.cancel();
                                                    this.props.dismissView?.();
                                                })
                                            }
                                        }
                                    );
                                } catch (error) {
                                    console.log('hangup Click :', this.state.currentCallId);
                                }

                            }}
                            speakerPhoneButtonClicked={() => { this._speakerAction() }}
                            callLogButtonClicked={() => {
                                this.setState({
                                    isShowSoftPhone: true,
                                    isShowCallLog: true,
                                    currentCalling: true,
                                    hasCallLogTemp: true
                                })
                            }}
                            isAnswered={this.state.isAnswered}
                            stateData={{
                                direction: this.props.direction,
                                state: this.state.callState,
                                isVideoCall: false,
                                customer: {
                                    company_name: this.state.customerData?.account_id_display || this.state.customerData?.company || '',
                                    id: this.state.customerData?.id || '',
                                    name: (this.state.customerData && Object.keys(this.state.customerData).length > 0) ? `${this.state.customerData?.salutationtype ? ((this.props.globalInstance.getEnumLabel(this.state.customerData?.record_module, 'salutationtype', this.state.customerData?.salutationtype) || '') + ' ') : ''}${this.state.customerData?.full_name || this.state.customerData?.accountname}` : 'Không xác định',
                                    phone_number: phoneNumber,
                                    image: this.state.customerData?.customer_avatar ? { uri: this.state.customerData?.customer_avatar } : require('../../assets/images/avatar.jpg')
                                }
                            }}
                            dtmf={this.state.dtmf}
                            sendDTMF={(dtmf) => {
                                this._sendDTMF(dtmf);
                            }}
                            locale={this.props.globalInstance?.locale || 'vn_vn'}
                        />
                        {
                            (this.state.isShowCallLog) ?
                                (
                                    <>
                                        <Modal
                                            visible={this.state.isShowCallLog}
                                            presentationStyle='fullScreen'
                                        >
                                            <ImageBackground
                                                source={require('../../assets/images/bg.jpg')}
                                                style={{ width: '100%', height: '100%' }}
                                            >
                                                <View style={[styles.container, {
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    backgroundColor: '#333',
                                                    width: width,
                                                    height: height,
                                                    opacity: .8
                                                }]} />

                                                {
                                                    this.state.isShowCreateCustomer ?
                                                        (
                                                            <QuickCreateCustomer
                                                                globalInstance={this.props.globalInstance}
                                                                phoneNumber={this.props.callInfo?.fromAlias?.toString().replace('btncall_', '') || this.props.callInfo?.to?.toString().replace('btncall_', '')}
                                                                onDismissCreate={() => {
                                                                    this.setState({
                                                                        isShowCallLog: true,
                                                                        isShowCreateCustomer: false
                                                                    })
                                                                }}
                                                                onCreateNewCustomer={(customer, module) => {
                                                                    console.log('LOG. New Customer: ', customer, module);
                                                                    this.setState({
                                                                        isShowCallLog: true,
                                                                        isShowCreateCustomer: false
                                                                    }, () => {
                                                                        this.saveNewCustomer(customer, module);
                                                                    })

                                                                }}
                                                            />
                                                        )
                                                        : (

                                                            <SoftPhoneCallLog
                                                                callId={this.state.currentCallId}
                                                                callLogData={{}}
                                                                currentCalling={this.state.currentCalling}
                                                                metaData={this.state.metadata}
                                                                phoneNumber={this.props.callInfo?.fromAlias?.toString().replace('btncall_', '') || this.props.callInfo?.from?.number?.toString().replace('btncall_', '') || this.props.callInfo?.to?.toString().replace('btncall_', '')}
                                                                customerData={this.state.customerData}
                                                                globalInstance={this.props.globalInstance}
                                                                direction={this.props.direction}
                                                                startTime={this.state.startTime}
                                                                endTime={this.state.endTime}
                                                                hasCallLogTemp={this.state.hasCallLogTemp}
                                                                shouldUpdateFromNewCustomer={this.state.shouldUpdateFromNewCustomer}
                                                                context={this}
                                                            />
                                                        )
                                                }
                                            </ImageBackground>
                                        </Modal>
                                    </>
                                )
                                : null
                        }
                    </>

                </Modal>
            )
        }


        else if (this.state.isShowModalProduct) {
            return (
                <Modal
                    visible={this.state.isShowModalProduct}
                    presentationStyle='fullScreen'
                    style={{ ...StyleSheet.absoluteFillObject }}
                >
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#d0d0d0' }}>
                        <View style={{ height: 40, alignItems: 'center', justifyContent: 'center', width: width, paddingHorizontal: 22, paddingVertical: 5 }}>
                            <View
                                style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', alignItems: 'center', borderRadius: 4 }}
                            >
                                <Input
                                    style={{ borderBottomWidth: 0 }}
                                    placeholder={'Nhập ít nhất 3 ký tự'}
                                    clearButtonMode='while-editing'
                                    clearTextOnFocus={true}
                                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                />
                                <TouchableOpacity
                                    style={{ height: 30, backgroundColor: '#e0e0e0', width: 50, alignItems: 'center', justifyContent: 'center', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                                >
                                    <Icon name='search' style={{ color: '#333', fontSize: 16 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Content style={{ backgroundColor: '#fff' }} scrollEnabled={false}>
                            <FlatList
                                data={[{ key: 'key 1', label: 'item 1' }, { key: 'key 2', label: 'item 2' }]}
                                renderItem={({ item, index, separators }) => {
                                    return (
                                        <TouchableOpacity
                                            style={{ height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 0.7, borderBottomColor: '#333' }}
                                        >
                                            <CheckBox checked={true} />
                                            <View style={{ width: 16 }} />
                                            <Text allowFontScaling={true} >{item.label}</Text>
                                        </TouchableOpacity>
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </Content>
                        <View style={{ minHeight: 50, alignItems: 'center', justifyContent: 'center', width: width }}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 5,
                                    paddingHorizontal: 12,
                                    backgroundColor: '#169bd5',
                                    borderRadius: 4
                                }}
                                onPress={() => {
                                    this.setState({ isShowCallLog: true, isShowModalProduct: false })
                                }}>
                                <Text allowFontScaling={true} style={styles.txtWhite}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Modal>
            )
        }
        else {
            return null;
        }
    }

}

const styles = StyleSheet.create({
    userInfoContent: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    formCallLog: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    actionsBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 60,
        paddingHorizontal: 12
    },
    avatarContent: {
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 84 / 2,
        borderColor: '#fff',
        borderWidth: 2,
        resizeMode: 'cover',
        shadowColor: "#e0e0e0",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.53,
        shadowRadius: 13.97,
        elevation: 3
    },
    profileContent: {
        flex: 1,
        paddingLeft: 14
    },
    txtCompanyName: {
        color: '#fff'
    },
    txtPhoneNumber: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        paddingVertical: 10
    },
    txtName: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 20
    },
    txtWhite: {
        color: '#fff'
    },
    txtHeading: {
        fontWeight: '700',
        fontSize: 16
    },
    dropdownItem: {
        width: 150,
        position: 'absolute',
        padding: 5,
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 2,
        justifyContent: 'center',
        marginTop: -18
    },
})
