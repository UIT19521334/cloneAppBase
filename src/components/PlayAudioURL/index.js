import React, { Component } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Button,
    Dimensions,
    Modal,
    TouchableHighlight,
    Alert,
    TouchableOpacity
} from 'react-native'
import SoundPlayer from 'react-native-sound-player'
import { Icon } from 'native-base';
import { Icon as IconCustom } from '../../themes/Icons/CustomIcon'
import { Colors } from '../../themes/colors/Colors';
import { widthDevice } from '../../utils/commons/commons';
// const PlayAudioURL = ({ hasOpenModal = false, url = '', onClose = null }) => {

class PlayAudioURL extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openModal: false,
            isPlaying: false,
            isPause: false,
            currentSeek: 0,
            duration: 0,
            statePlaying: 'NONE',
            loadingFilePath: true,
        }
    }

    hideModal = () => (
        this.setState({ openModal: false }, () => {
            this.props.onClose?.();
        })
    );

    playAudio() {
        if (this.props.url) {
            this.loadAudioUrl(this.props.url)
        }
        else {
            Alert.alert('Không tìm thấy file Audio')
        }
    }

    loadAudioUrl = (url: String) => {
        try {
            SoundPlayer.loadUrl(url);
        } catch (e) {
        }
    }

    getInfo = async () => { // You need the keyword `async`
        try {
            const info = await SoundPlayer.getInfo() // Also, you need to await this because it is async
            this.setState({ duration: parseInt(info.duration), isPlaying: true }, () => {
                SoundPlayer.play();
                this.startCounter();
            })
        } catch (e) {
        }
    }

    startCounter() {
        this.intervalTimer = setInterval(() => {
            this.setState({ currentSeek: this.state.currentSeek + 1 })
        }, 1000);
    }

    stopCounter() {
        clearInterval(this.intervalTimer)
    }

    componentDidMount() {
        SoundPlayer.setVolume(1);

        this._onFinishedLoadingURLSubscription = SoundPlayer.addEventListener('FinishedLoadingURL', ({ success, url }) => {
            this.setState({ loadingFilePath: false }, () => {
                this.getInfo()
            });
        })

        this._onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', ({ success }) => {
            this.setState({ currentSeek: 0, isPlaying: false, isPause: false }, () => {
                SoundPlayer.stop();
                this.stopCounter();
            })
        })

    }

    componentWillUnmount() {
        this._onFinishedLoadingURLSubscription.remove();
        this._onFinishedPlayingSubscription.remove();
        clearInterval(this.intervalTimer);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.hasOpenModal) {
            this.setState({ openModal: true })
        }
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
        let minutes = this.pad(parseInt(duration / 60));
        let seconds = this.pad(duration % 60);

        return minutes + ':' + seconds;

    }

    render() {

        return (
            <Modal
                visible={this.state.openModal}
                transparent={true}
            >

                <View
                    style={{
                        backgroundColor: '#333',
                        flex: 1,
                        opacity: .3
                    }}
                />

                <View
                    style={{
                        backgroundColor: '#fff',
                        width: widthDevice,
                        height: 200
                    }}
                >
                    <View style={{
                        alignItems: 'flex-end'
                    }}
                    >
                        <TouchableHighlight
                            underlayColor={'#f5f5f5'}
                            activeOpacity={.3}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 30 / 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: 6
                            }}
                            onPress={() => {
                                this.setState({ currentSeek: 0, isPlaying: false, isPause: false }, () => {
                                    SoundPlayer.stop();
                                    this.stopCounter();
                                    this.hideModal()

                                })
                            }}
                        >
                            <IconCustom name='times' size={18} />
                        </TouchableHighlight>
                    </View>


                    <View
                        style={{
                            width: widthDevice,
                            height: 80,
                            paddingHorizontal: 28,
                            alignItems: 'center'
                        }}
                    >
                        {/* <View
                                style={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    height: 40,
                                    flexDirection: 'row'
                                }}
                            >
                                <Text  allowFontScaling={true} >{this.state.currentSeek}</Text>
                                <Text  allowFontScaling={true} >{this.state.duration}</Text>
                            </View> */}
                        {/* <Slider
                                value={this.state.currentSeek}
                                minimumValue={0}
                                maximumValue={this.state.duration}
                                minimumTrackTintColor="#d0d0d0"
                                maximumTrackTintColor="#000000"
                                step={1}
                                onSlidingStart={(value) => {

                                    this.setState({
                                        currentSeek: value,
                                        isPause: true,
                                        isPlaying: false
                                    }, () => {
                                        SoundPlayer.pause();
                                        SoundPlayer.seek(value);
                                        this.stopCounter();
                                    })
                                }}
                                onSlidingComplete={(value) => {

                                    this.setState({
                                        currentSeek: value,
                                        isPause: false,
                                        isPlaying: true
                                    }, () => {
                                        SoundPlayer.seek(value);
                                        SoundPlayer.resume();
                                        this.startCounter();
                                    })
                                }}
                            /> */}

                        <Text  allowFontScaling={true} >Thời gian: {this.timerString(this.state.currentSeek)}</Text>
                    </View>

                    <View
                        style={{
                            width: widthDevice,
                            height: 50,
                            paddingHorizontal: 28,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {
                            !this.state.isPlaying && !this.state.isPause ?
                                (
                                    <TouchableOpacity onPress={() => this.playAudio()}>
                                        <Icon name='play-circle' type={'FontAwesome5'} style={{ color: Colors.black.black3, fontSize: 36 }} />
                                    </TouchableOpacity>
                                )
                                : null
                        }
                        {
                            this.state.isPlaying ?
                                (
                                    <TouchableOpacity onPress={() => {
                                        this.setState({
                                            isPlaying: false,
                                            isPause: true,
                                        }, () => {
                                            SoundPlayer.pause();
                                            this.stopCounter();
                                        })
                                    }} >
                                        <Icon name='pause-circle' type={'FontAwesome5'} style={{ color: Colors.black.black3, fontSize: 36 }} />
                                    </TouchableOpacity>

                                )
                                : null
                        }

                        {
                            this.state.isPause ? (
                                <TouchableOpacity onPress={() => {
                                    this.setState({
                                        isPlaying: true,
                                        isPause: false,
                                    }, () => {
                                        SoundPlayer.resume();
                                        this.startCounter();
                                    })
                                }}>
                                    <Icon name='play-circle' type={'FontAwesome5'} style={{ color: Colors.black.black3, fontSize: 36 }} />
                                </TouchableOpacity>

                            ) : null
                        }

                    </View>
                </View>
            </Modal >
        )
    }

}

export default PlayAudioURL;

const styles = StyleSheet.create({})
