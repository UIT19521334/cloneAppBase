import { Dimensions, ImageBackground, Platform, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { PureComponent, useEffect, useState } from 'react'
import Global from '../../Global';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import SyncCall from '../Models/SyncCall';
import { Icon } from 'native-base';
import KeyboardView from '../../components/KeyboardView';
import CallLog from './CallLog';
import { heightDevice, widthDevice } from '../../utils/commons/commons';

var height = heightDevice;
var width = widthDevice;

const muteImg = require('../../assets/images/mute.png');
const muteImg_selected = require('../../assets/images/mute_selected.png');

const speakerImg = require('../../assets/images/speaker.png');
const speakerImg_selected = require('../../assets/images/speaker_selected.png');

const transferImg = require('../../assets/images/transfer.png');
const transferImg_selected = require('../../assets/images/transfer_selected.png');

const volumeImg = require('../../assets/images/volum.png');
const volumeImg_selected = require('../../assets/images/volum_selected.png');

const callLogImg = require('../../assets/images/calllog.png');
const callLogImg_selected = require('../../assets/images/calllog_selected.png');

const videoDisableImg = require('../../assets/images/video_disable.png');
const videoEnableImg = require('../../assets/images/video_enable.png');

const endCall = require('../../assets/images/end_call.png');
const answerCall = require('../../assets/images/accept_call.png');

interface StringeeCallViewProps {
    isMute: Boolean;
    isSpeaker: Boolean;
    direction: 'INBOUND' | 'OUTBOUND';
    callState: String;
    isAnswer: Boolean;
    hasLocalStream: Boolean;
    hasRemoteStream: Boolean;
    isVideoCall: Boolean;
    syncCall: SyncCall;
    endCallHandler: Function;
    answerCallHandler: Function;
    rejectCallHandler: Function;
    speakerChangeHandler: Function;
    muteChangeHandler: Function;
    sendDTMF: Function;
    onSaveLogToCache: Function;
    onSaveCallLog: Function;
    onCreateNewCustomer: Function;
    loadingSaveCallLog: Boolean;
    metaData: Object;
}

const unknownLabel = (Global.locale  || "vn_vn") == 'vn_vn' ? 'Không xác định' : 'Unknown';

class StringeeCallView extends PureComponent<StringeeCallViewProps, null, null> {

    state = {
        duration: 0,
        countTimeSting: '00:00',
        hasStart: false,
        showKeyBoard: false,
        isSilent: false,
        showCallLog: false,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        StatusBar.setHidden(true);
    }

    componentWillUnmount() {
        if (Platform.OS == 'ios') {
            StatusBar.setHidden(false);
        }
    }

    renderHeaderNotAnswer() {
        const props = this.props;
        return (
            <View
                style={{
                    padding: 12,
                    paddingTop: 16
                }}
            >
                <Text
                    style={{
                        ...styles.callName
                    }}
                >
                    {props.syncCall?.customerName || props.syncCall?.phoneNumber || unknownLabel}
                </Text>

                <View style={{ paddingVertical: 14 }} />

                <Text
                    style={{
                        ...styles.companyName
                    }}
                >
                    {props.syncCall?.companyName || unknownLabel}
                </Text>
            </View>
        )
    }

    pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    timerString(duration) {
        var date = new Date(0);
        date.setSeconds(duration);

        return date.toISOString().substring(14, 19);
    }

    countTimer() {
        if (!this.state.hasStart) {
            this.setState({ hasStart: true }, () => {
                this.intervalCounter = setInterval(() => {
                    let duration = this.state.duration;
                    let countTimeSting = this.timerString(duration + 1);
                    this.setState({ duration: duration + 1, countTimeSting: countTimeSting });
                }, 1000);
            })
        }
    }

    showState = () => {
        switch (this.props.callState?.toUpperCase()) {
            case 'Incoming Call'.toUpperCase():
                return !this.props.isVideoCall ? ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Có cuộc gọi đến' : 'Incoming audio call') : ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Có cuộc gọi video đến' : 'Incoming video call');

            case 'Outgoing Call'.toUpperCase():
                return ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang kết nối với ' : 'Connecting to ') + (this.props.syncCall?.customerData?.full_name || this.props.syncCall?.phoneNumber);

            case 'Calling'.toUpperCase():
                return ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang kết nối với ' : 'Connecting to ') + (this.props.syncCall?.customerData?.full_name || this.props.syncCall?.phoneNumber);

            case 'RINGING':
                return (Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang đổ chuông' : 'Ringing';

            case 'Started'.toUpperCase():
                if (this.props.direction == 'INBOUND') {
                    this.countTimer()
                    return this.state.countTimeSting;
                }
                else {
                    return ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Đã kết nối với ' : 'Connected to ') + (this.props.syncCall?.customerData?.full_name || this.props.syncCall?.phoneNumber);
                }

            case 'Starting'.toUpperCase():
                this.countTimer()
                return this.state.countTimeSting;

            case 'ANSWERED':
                this.countTimer()
                return this.state.countTimeSting;

            case 'BUSY':
                this.intervalCounter && (this.intervalCounter)
                return this.props.syncCall?.customerData?.full_name ? + (this.props.syncCall?.customerData?.full_name + ((Global.locale  || "vn_vn") == 'vn_vn' ? ' đang bận' : ' is busy')) : ((Global.locale  || "vn_vn") == 'vn_vn' ? 'Đang bận' : 'busing');

            case 'ENDED':
                this.intervalCounter && clearInterval(this.intervalCounter)
                return (Global.locale  || "vn_vn") == 'vn_vn' ? 'Kết thúc' : 'End call';

            case 'HANGUP':
                this.intervalCounter && clearInterval(this.intervalCounter)
                return (Global.locale  || "vn_vn") == 'vn_vn' ? 'Kết thúc' : 'End call';

            default:
                return this.props.callState;
        }
    };

    renderAvatar() {
        return (
            <View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: this.props.isAnswer ? 22 : 0
                }}
            >

                <Image
                    source={{ uri: Global.getImageUrl(this.props.syncCall?.avatar) }}
                    style={{
                        width: height * .11 < 75 ? 75 : (height * .11),
                        height: height * .11 < 75 ? 75 : (height * .11),
                        borderRadius: (height * .11 < 75 ? 75 : (height * .11)) / 2,
                        resizeMode: Platform.OS == 'ios' ? 'stretch' : 'cover',
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        shadowColor: '#e2e2e2',
                        shadowOffset: {
                            width: 0,
                            height: 10,
                        },
                        shadowOpacity: 0.53,
                        shadowRadius: 13.97,
                    }}
                />

                <View style={{ paddingVertical: 12 }}>
                    <Text
                        style={{
                            ...styles.callName,
                            fontSize: 22
                        }}
                    >
                        {this.props.syncCall?.phoneNumber || unknownLabel}
                    </Text>
                </View>
            </View>
        )
    }

    renderCallStatus() {
        return (
            <View style={{ paddingBottom: 12 }}>
                <Text style={{ ...styles.callStatus }}>
                    {this.showState()}
                </Text>
            </View>
        )
    }

    renderFooterActionNotAnswer() {
        const props: StringeeCallViewProps = this.props
        return (
            <View
                style={{
                    ...styles.footerContent,
                    paddingBottom: height * 0.1
                }}
            >
                <TouchableOpacity onPress={props.direction == 'INBOUND' && !props.isAnswer ? props.rejectCallHandler : props.endCallHandler}>
                    <ImageBackground
                        source={endCall}
                        style={{
                            height: 70,
                            aspectRatio: 1
                        }}
                    />
                </TouchableOpacity>

                {
                    props.direction == 'INBOUND' && !props.isAnswer ? (
                        <>
                            <View style={{ flex: 1 }} />

                            <TouchableOpacity onPress={props.answerCallHandler}>
                                <ImageBackground
                                    source={answerCall}
                                    style={{
                                        height: 70,
                                        aspectRatio: 1
                                    }}
                                />
                            </TouchableOpacity>
                        </>
                    )
                        : null
                }

            </View>
        )
    }

    renderQuickActionsNotAnswer() {
        if (Platform.OS == 'ios') {
            return null;
        }
        return (
            <View style={{
                ...styles.footerContent
            }}>
                {/* action sound ringing */}
                <TouchableOpacity
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 70,
                        aspectRatio: 1,
                    }}
                    onPress={() => {
                        this.setState({ isSilent: !this.state.isSilent })
                    }}
                >
                    <MaterialCommunityIcons name={this.state.isSilent ? "bell-off" : "bell"} size={22} color={'#fff'} />
                    <Text
                        style={{ color: 'white', marginTop: 12 }}
                    >
                        {(Global.locale  || "vn_vn") == 'vn_vn' ? ' Im lặng' : 'Silent'}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderQuickActions() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    paddingTop: 8
                }}
            >

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={this.props.muteChangeHandler}>
                        <ImageBackground
                            source={this.props.isMute ? muteImg_selected : muteImg}
                            style={{
                                aspectRatio: 1,
                                height: height * 0.1 < 70 ? 70 : (height * 0.1),
                                backgroundColor: 'rgba(77, 81, 84, .7)',
                                borderRadius: (height * 0.1 < 70 ? 70 : (height * 0.1)) / 2
                            }}
                            resizeMode='stretch'
                        />
                    </TouchableOpacity>

                    <View style={{ paddingHorizontal: width * 0.07 }} />

                    <TouchableOpacity onPress={this.props.speakerChangeHandler}>
                        <ImageBackground
                            source={this.props.isSpeaker ? volumeImg_selected : volumeImg}
                            style={{
                                aspectRatio: 1,
                                height: height * 0.1 < 70 ? 70 : (height * 0.1),
                                backgroundColor: 'rgba(77, 81, 84, .7)',
                                borderRadius: (height * 0.1 < 70 ? 70 : (height * 0.1)) / 2
                            }}
                            resizeMode='stretch'
                        />
                    </TouchableOpacity>
                </View>

                <View style={{ paddingVertical: 20 }} />

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ showKeyBoard: !this.state.showKeyBoard })
                        }}
                    >
                        <View
                            style={{
                                aspectRatio: 1,
                                height: height * 0.1 < 70 ? 70 : (height * 0.1),
                                backgroundColor: 'rgba(77, 81, 84, .8)',
                                borderRadius: (height * 0.1 < 70 ? 70 : (height * 0.1)) / 2,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Icon
                                name='dial-pad'
                                type='Entypo'
                                style={{
                                    fontSize: width * 0.09,
                                    color: '#fff'
                                }}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={{ paddingHorizontal: width * 0.07 }} />

                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ showCallLog: !this.state.showCallLog })
                        }}
                    >
                        <ImageBackground
                            source={callLogImg}
                            style={{
                                aspectRatio: 1,
                                height: height * 0.1 < 70 ? 70 : (height * 0.1),
                                backgroundColor: 'rgba(77, 81, 84, .7)',
                                borderRadius: (height * 0.1 < 70 ? 70 : (height * 0.1)) / 2
                            }}
                            resizeMode='stretch'
                        />
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    render() {
        const props: StringeeCallViewProps = this.props;
        return (
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                blurRadius={5}
                style={{
                    flex: 1
                }}
            >
                <StatusBar hidden={true} />
                <SafeAreaView
                    style={{ flex: 1 }}
                >
                    {/* header */}
                    {!props.isAnswer && this.renderHeaderNotAnswer()}

                    {/* body */}
                    <View style={{ flex: 1 }}>

                        {this.renderAvatar()}

                        {this.renderCallStatus()}

                        {props.isAnswer && this.renderQuickActions()}
                    </View>

                    {/* Quick action */}
                    {props.direction == 'INBOUND' && this.renderQuickActionsNotAnswer()}

                    {/* footer */}
                    {this.renderFooterActionNotAnswer()}

                </SafeAreaView>

                {
                    this.state.showKeyBoard ?
                        (
                            <KeyboardView
                                onClose={() => this.setState({ showKeyBoard: false })}
                                pressDTMF={(dtmf) => this.props.sendDTMF?.(dtmf)}
                            />
                        )
                        : null
                }

                {
                    this.state.showCallLog || props.syncCall?.isShowCallLog ?
                        (
                            <CallLog
                                syncCall={this.props.syncCall}
                                metaData={{ ...(this.props?.syncCall?.metadata) }}
                                onSaveLog={(data, hasOtherCallIncoming) => {
                                    console.log('<><><><> onSaveLog Data call log: ', data);
                                    this.props.onSaveCallLog?.(data, hasOtherCallIncoming);
                                }}
                                onSaveLogToCache={(data) => {
                                    console.log('<><><><> onSaveLogToCache Data call log: ', data);
                                    this.setState({ showCallLog: false });
                                    this.props.onSaveLogToCache?.(data);
                                }}
                                hasCreateNewCustomer={!this.props.syncCall?.customerData || Object.keys(this.props.syncCall?.customerData).length == 0}
                                loadingSaveCallLog={props?.loadingSaveCallLog}
                                onCreateNewCustomer={props.onCreateNewCustomer}
                            />
                        )
                        : null
                }

            </ImageBackground>
        )
    }
}

export default StringeeCallView;

const styles = StyleSheet.create({
    callName: {
        color: '#ffffff',
        fontSize: 26,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    companyName: {
        color: '#ffffff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500'
    },
    callStatus: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500'
    },
    footerContent: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 28,
        paddingHorizontal: width * 0.1
    }
})