import React, { Component, PureComponent, Children } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    ImageBackground
} from 'react-native';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import styles from './styles'
import KeyboardView from '../../components/KeyboardView'
import variables from '../../../native-base-theme/variables/commonColor'
import { Icon } from 'native-base';
import { heightDevice, isIphoneX, widthDevice } from '../../utils/commons/commons';
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

export const maxWidthActually = width > 736 ? 620 : width;
export const maxHeightActually = height < 844 ? 844 : height;
export const defineHeight64px = 64 / 844;
const defaultFontSize = maxWidthActually * .044;
const largeFontSize = maxWidthActually * .056;

class SoftPhoneUI extends PureComponent<SoftPhoneProps> {

    state = {
        duration: 0,
        countTimeSting: '00:00',
        hasStart: false,
        showKeyBoard: false
    }

    // Check langue ======================
    showState = () => {
        switch (this.props.stateData?.state.toUpperCase()) {
            case 'INCOMING CALL':
                return !this.props.stateData.isVideoCall ? (this.props?.locale == 'vn_vn' ? 'Có cuộc gọi đến' : 'Incoming audio call') : (this.props?.locale == 'vn_vn' ? 'Có cuộc gọi video đến' : 'Incoming video call');
            case 'CALLING':
                return this.props.stateData.direction === 'OUTBOUND' ? (this.props?.locale == 'vn_vn' ? 'Đang kết nối với ' : 'Connecting to ') + this.props.stateData?.customer.name : (this.props?.locale == 'vn_vn' ? 'Có cuộc gọi đến' : 'Incoming audio call');
            case 'RINGING':
                return this.props?.locale == 'vn_vn' ? 'Đang đổ chuông' : 'Ringing';
            case 'ANSWERED':
                this.countTimer()
                return this.state.countTimeSting;
            case 'BUSY':
                clearInterval(this.intervalCounter)
                return this.props.stateData?.customer.name + (this.props?.locale == 'vn_vn' ? ' đang bận' : ' is busy');
            case 'ENDED':
                clearInterval(this.intervalCounter)
                return this.props?.locale == 'vn_vn' ? 'Kết thúc' : 'End call';
            case 'HANGUP':
                clearInterval(this.intervalCounter)
                return this.props?.locale == 'vn_vn' ? 'Kết thúc' : 'End call';
            default:
                return this.props.stateData?.state;
        }
    };

    pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    timerString(duration) {
        let minutes = this.pad(parseInt(duration / 60));
        let seconds = this.pad(duration % 60);

        return minutes + ':' + seconds;

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

    componentDidMount() {
        console.log('LOG.user CAll DATA:', this.props.stateData);
    }

    render() {
        console.log('LOG.Customer Data: ', this.props.stateData);
        return (
            <ImageBackground
                source={require('../../assets/images/bg.jpg')}
                style={{ width: width, height: height }}
            >
                <View style={[styles.container, {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: '#7f7f7f',
                    width: width,
                    height: height,
                    opacity: .5
                }]} />

                <View style={styles.container}>
                    {
                        this.props.stateData.isVideoCall && this.props.isAnswered ? (
                            <>
                                {this.props.children}
                                <TouchableOpacity
                                    onPress={this.props.switchCameraHandler}
                                    style={styles.camera}>
                                    <Image
                                        source={require('../../assets/images/camera_switch.png')}
                                        style={styles.switchCamera}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.userId}>{this.props.stateData?.customer?.name}</Text>
                                <Text style={styles.callState}>{this.props.stateData?.customer?.phone_number}</Text>
                                <Text style={styles.callState}>{this.props.stateData?.state}</Text>
                            </>
                        ) : (
                            <>
                                {
                                    this.props.stateData?.customer?.name && !this.props.isAnswered ? <Text style={[styles.userId, { fontSize: largeFontSize, color: '#fff', marginTop: isIphoneX ? 42 : 12 }]}>{this.props.stateData?.customer?.name || this.props.stateData?.customer?.phone_number || (this.props?.locale == 'vn_vn' ? 'Không xác định' : 'Unknown')}</Text> : null
                                }
                                {
                                    this.props.stateData?.customer?.company_name && !this.props.isAnswered ? <Text style={[styles.callState, { marginTop: 15, fontSize: defaultFontSize }]}>{this.props.stateData?.customer?.company_name}</Text> : null
                                }

                                <Image
                                    source={this.props.stateData?.customer?.image}
                                    style={[
                                        styles.avatar,
                                        {
                                            width: maxHeightActually * .11,
                                            height: maxHeightActually * .11,
                                            borderRadius: (maxHeightActually * .11) / 2,
                                        },
                                        this.props.isAnswered ? { marginBottom: 10, marginTop: isIphoneX ? 42 : 12 } : {}
                                    ]}
                                />

                                {
                                    this.props.stateData?.customer?.phone_number && !this.props.isAnswered ? (
                                        <Text style={[styles.callState, { marginBottom: 8, fontSize: defaultFontSize }]}>
                                            {this.props.stateData?.customer?.phone_number}
                                        </Text>
                                    ) : null

                                }

                                {
                                    this.props.stateData?.customer?.name && this.props.isAnswered ?
                                        <Text style={[styles.userId, { marginTop: 0, fontSize: largeFontSize }]}>
                                            {this.props.stateData?.customer?.name}
                                        </Text>
                                        : null

                                }

                                <Text style={[styles.callState, { marginTop: 14, marginBottom: 12, fontSize: defaultFontSize }]}>{this.showState()}</Text>
                            </>
                        )
                    }

                    {this.props.isAnswered ? null : (
                        <View style={styles.callActionContainer}>

                            <View style={[styles.callGroupActionContainer, { marginBottom: 12 }]}>
                                {
                                    this.props.hasTransferButton ?
                                        (
                                            <TouchableOpacity
                                                style={{ flex: 1, alignItems: "center" }}
                                                onPress={() => {
                                                    console.log('transferButtonClicked');
                                                    this.props.transferButtonClicked();
                                                }}>
                                                <MaterialIcons name="phone-forwarded" size={22} />
                                                <Text
                                                    style={{ color: 'white', marginTop: 12 }}
                                                >
                                                    {this.props?.locale == 'vn_vn' ? 'Chuyển hướng' : 'Transfer'}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                        : null
                                }

                                {
                                    (this.props.hasMuteButton && this.props.stateData.direction === 'INBOUND') ?
                                        (
                                            <TouchableOpacity
                                                style={{ flex: 1, alignItems: "center" }}
                                                onPress={() => {
                                                    console.log('muteButtonClicked');
                                                    this.props.muteButtonClicked();
                                                }}>
                                                <MaterialCommunityIcons name={this.props.hasMute ? "bell-off" : "bell"} size={22} color={'#fff'} />
                                                <Text
                                                    style={{ color: 'white', marginTop: 12 }}
                                                >
                                                    {this.props?.locale == 'vn_vn' ? ' Im lặng' : 'Silent'}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                        :
                                        null
                                }
                            </View>

                            <View style={[styles.callGroupActionContainer, { marginTop: 12 }]}>
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center" }}
                                    onPress={() => {
                                        if (this.props.stateData.direction === 'INBOUND') {
                                            this.props.rejectButtonClicked?.();
                                        } else {
                                            this.props.hangupButtonClicked?.();
                                        }

                                    }}
                                >
                                    <Image
                                        source={require('../../assets/images/end_call.png')}
                                        style={styles.button}
                                    />
                                </TouchableOpacity>

                                {
                                    this.props.stateData.direction === 'INBOUND' ?
                                        (
                                            <TouchableOpacity
                                                style={{ flex: 1, alignItems: "center" }}
                                                invisible
                                                onPress={this.props.answerButtonClicked}>
                                                <Image
                                                    source={require('../../assets/images/accept_call.png')}
                                                    style={styles.button}
                                                />
                                            </TouchableOpacity>
                                        )
                                        : null
                                }

                            </View>


                        </View>
                    )}

                    {!this.props.isAnswered ? null :
                        (
                            <>
                                <View
                                    style={{
                                        minHeight: height < 698 ? 70 : 100,
                                        width: width,
                                        marginTop: 0,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => { this.props.muteButtonClicked?.() }}
                                        >
                                            <View
                                                style={{
                                                    width: maxHeightActually * defineHeight64px,
                                                    height: maxHeightActually * defineHeight64px,
                                                    borderRadius: maxHeightActually * defineHeight64px / 2,
                                                    borderWidth: 1,
                                                    borderColor: '#fff',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Image
                                                    source={this.props.hasMute ? muteImg : muteImg_selected}
                                                    style={{
                                                        width: maxHeightActually * defineHeight64px - 2,
                                                        height: maxHeightActually * defineHeight64px - 2,
                                                        borderRadius: maxHeightActually * defineHeight64px / 2,
                                                        resizeMode: 'contain',
                                                    }}
                                                />
                                            </View>
                                            <Text
                                                style={{ color: '#fff', marginTop: 6, fontSize: defaultFontSize }}
                                            >
                                                {this.props?.locale == 'vn_vn' ? 'Tắt tiếng' : 'Mute'}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={{ width: height < 698 ? 30 : 40 }} />

                                        <TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => { this.props.speakerPhoneButtonClicked?.() }}
                                        >
                                            <View
                                                style={{
                                                    width: maxHeightActually * defineHeight64px,
                                                    height: maxHeightActually * defineHeight64px,
                                                    borderRadius: maxHeightActually * defineHeight64px / 2,
                                                    borderWidth: 1,
                                                    borderColor: '#fff',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Image
                                                    source={this.props.isSpeaker ? volumeImg_selected : volumeImg}
                                                    style={{
                                                        width: maxHeightActually * defineHeight64px - 2,
                                                        height: maxHeightActually * defineHeight64px - 2,
                                                        borderRadius: maxHeightActually * defineHeight64px / 2,
                                                        resizeMode: 'contain',
                                                    }} />
                                            </View>

                                            <Text
                                                style={{ color: '#fff', marginTop: 6, fontSize: defaultFontSize }}
                                            >
                                                {this.props?.locale == 'vn_vn' ? 'Loa ngoài' : 'Speaker'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ height: height < 698 ? 30 : 40 }} />

                                    <View
                                        style={{
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => { this.props.transferButtonClicked?.() }}
                                        >
                                            <View
                                                style={{
                                                    width: maxHeightActually * defineHeight64px,
                                                    height: maxHeightActually * defineHeight64px,
                                                    borderRadius: maxHeightActually * defineHeight64px / 2,
                                                    borderWidth: 1,
                                                    borderColor: '#fff',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Image
                                                    source={transferImg}
                                                    style={{
                                                        width: maxHeightActually * defineHeight64px - 2,
                                                        height: maxHeightActually * defineHeight64px - 2,
                                                        borderRadius: maxHeightActually * defineHeight64px / 2,
                                                        resizeMode: 'contain',
                                                    }} />
                                            </View>
                                            <Text style={{ color: '#fff', marginTop: 6, fontSize: defaultFontSize }}>{this.props?.locale == 'vn_vn' ? 'Chuyển' : 'Transfer'}</Text>

                                        </TouchableOpacity>

                                        <View style={{ width: height < 698 ? 30 : 40 }} />

                                        {/* <TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => { this.props.callLogButtonClicked?.() }}
                                        >
                                            <Image source={callLogImg} style={{ width: height < 698 ? 65 : 80, height: height < 698 ? 65 : 80 }} />
                                            <Text style={{ color: '#fff', marginTop: height < 698 ? 4 : 10 }}>Thông tin</Text>

                                        </TouchableOpacity> */}
                                        <TouchableOpacity
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',

                                            }}
                                            onPress={() => { this.setState({ showKeyBoard: true }) }}
                                        >
                                            <View
                                                style={{
                                                    width: maxHeightActually * defineHeight64px,
                                                    height: maxHeightActually * defineHeight64px,
                                                    borderRadius: maxHeightActually * defineHeight64px / 2,
                                                    borderWidth: 1,
                                                    borderColor: '#fff',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    paddingTop: 5,
                                                    backgroundColor: 'rgb(75,75,75)'
                                                }}
                                            >
                                                <Icon
                                                    name='dial-pad'
                                                    type='Entypo'
                                                    style={{
                                                        fontSize: maxWidthActually * 0.08,
                                                        color: '#fff'
                                                    }}
                                                />
                                            </View>
                                            <Text style={{ color: '#fff', marginTop: 6, fontSize: defaultFontSize }}>
                                                {this.props?.locale == 'vn_vn' ? ' Bàn phím' : 'Keyboard'}
                                            </Text>
                                        </TouchableOpacity>

                                    </View>

                                </View>

                                <View style={styles.buttonEnd}>
                                    <TouchableOpacity

                                        onPress={() => {
                                            console.log('end button');
                                            this.props.hangupButtonClicked?.();
                                        }}>
                                        <Image
                                            source={require('../../assets/images/end_call.png')}
                                            style={styles.button}
                                        />
                                    </TouchableOpacity>

                                </View>
                            </>
                        )
                    }

                </View>
                
                {
                    this.state.showKeyBoard ?
                        (
                            <KeyboardView
                                onClose={() => this.setState({ showKeyBoard: false })}
                                dtmf={this.props.dtmf}
                                pressDTMF={(dtmf) => this.props.sendDTMF?.(dtmf)}
                            />
                        )
                        : null
                }
            </ImageBackground>
        );
    }

    renderMuteImage = () => {
        var imgSource = this.props.isMute ? muteImg_selected : muteImg;
        return <Image style={styles.button} source={imgSource} resizeMode='stretch' />;
    };

    renderSpeakerImage = () => {
        var imgSource = this.props.isSpeaker ? speakerImg_selected : speakerImg;
        console.log("this.props.isSpeaker: " + this.props.isSpeaker);
        return <Image style={styles.button} source={imgSource} resizeMode='stretch' />;
    };

    renderVideoImage = () => {
        var imgSource = this.props.enableVideo ? videoEnableImg : videoDisableImg;
        return <Image style={styles.button} source={imgSource} resizeMode='stretch' />;
    };
    renderForwardImage = () => {
        var imgSource = this.props.enableVideo ? transferImg : transferImg_selected;
        return <Image style={styles.button} source={imgSource} resizeMode='stretch' />;
    };
}

interface SoftPhoneProps {
    hasMuteButton: bool;
    hasTransferButton: bool;
    hasSpeakerPhoneButton: bool;
    hasDeclineButton: bool;
    hasEndButton: bool;
    hasAcceptButton: bool;
    hasMute: bool;
    hasTransfer: bool;
    hasSpeakerPhone: bool;
    hasReceivedRemoteStream: bool;
    hasReceivedLocalStream: bool;
    hasSwitchCamera: bool;
    enableVideo: bool;
    muteButtonClicked: Function;
    transferButtonClicked: Function;
    speakerPhoneButtonClicked: Function;
    callLogButtonClicked: Function;
    saveCallLogClicked: Function;
    rejectButtonClicked: Function;
    hangupButtonClicked: Function;
    answerButtonClicked: Function;
    switchCameraButtonClicked: Function;
    enableVideoButtonClicked: Function;
    isAnswered: bool;
    callId: string;
    stateData: {
        direction: string, //'INBOUND', 'OUTBOUND'
        state: string, //'CALLING', 'RINGING', 'ANSWERED', 'HANGUP'
        isVideoCall: bool,
        customer: {
            id: string,
            name: string,
            phone_number: string,
            company_name: string,
            image: string,
        }
    };
    dtmf: String;
    sendDTMF: (dtmf: string) => void;
    locale: String;
}

export default SoftPhoneUI;
