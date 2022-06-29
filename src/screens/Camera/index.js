// Import libraries
import React, { useEffect, useRef, useState } from 'react';
import {
    BackHandler, SafeAreaView,

    StyleSheet,
    TouchableOpacity, View
} from 'react-native';
import { RNCamera } from 'react-native-camera';
// Import components
import { Body, Header, Left, Right, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import RippleEffectButton from '../../components/RippleEffectButton';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getIcon, getLabel } from '../../utils/commons/commons';

const Camera = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [cameraType, setCameraType] = useState(route?.params?.cameraType == 'front' ? 'front' : 'back')
    const [dataCheckIn, setDataCheckIn] = useState(route?.params?.data ? route?.params?.data : {});
    const cameraRef = useRef(null);
    console.log('dataCheckIn: ', dataCheckIn);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                goBack();
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    const goBack = () => {
        if (route?.params?.prevScene == 'TabCheckIn' || route?.params?.prevScene == 'ActivityForm') {
            navigation.goBack();
        }
        else if (route?.params?.prevScene == 'CheckIn') {
            navigation.replace('CheckIn', { data: dataCheckIn, prevScene: route?.params?.checkInForm, onReLoadData: route?.params?.onReLoadData });
        }
        else if (route?.params?.prevScene == 'Calendar') {
            navigation.navigate('Calendar');
        }
        else if (route?.params?.prevScene == 'ActivityView') {
            if (route?.params?.parentScene == 'Calendar') {
                navigation.replace('ActivityView', { activity: dataCheckIn, prevScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });
            } else {
                navigation.replace('ActivityView', { activity: dataCheckIn });
            }
        }
        else {
            navigation.replace('ActivityView', { activity: dataCheckIn });
        }
    }

    const takePicture = () => {
        setLoading(true);
        const options = { quality: 1, width: 720, forceUpOrientation: true, fixOrientation: true }
        cameraRef.current.takePictureAsync(options)
            .then((data) => {
                setLoading(false);
                console.log(data.uri);
                if (route.params?.type == 'check_in') {
                    if (route.params?.cameraType == 'both') {
                        console.log('===BOTH===');
                        if (cameraType == 'front') {
                            console.log('===FRONT===');
                            let tmpData = { ...dataCheckIn };
                            tmpData.checkin_salesman_image = data.uri;
                            setDataCheckIn(tmpData);
                            if (route?.params?.prevScene == 'TabCheckIn') {
                                navigation.replace('ActivityForm', { prevScene: route?.params?.prevScene, dataCheckIn: tmpData, activity: { activitytype: 'Meeting' } });
                            }
                            else if (route?.params?.prevScene == 'ActivityView') {
                                if (route?.params?.parentScene == 'Calendar') {
                                    navigation.replace('CheckIn', { data: tmpData, prevScene: route?.params?.prevScene, parentScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });
                                } else {
                                    navigation.replace('CheckIn', { data: tmpData, prevScene: route?.params?.prevScene });
                                }
                            }
                            else {
                                navigation.replace('CheckIn', { data: tmpData, prevScene: route?.params?.prevScene, onReLoadData: route?.params?.onReLoadData });
                            }
                        }
                        else {
                            console.log('==BACK===');
                            let tmpData = { ...dataCheckIn };
                            tmpData.checkin_customer_image = data.uri;
                            setDataCheckIn(tmpData);
                            setCameraType('front');
                        }
                    }
                    else if (route.params?.cameraType == 'front') {
                        console.log('===FRONT===');
                        let tmpData = { ...dataCheckIn };
                        tmpData.checkin_salesman_image = data.uri;
                        setDataCheckIn(tmpData);
                        if (route?.params?.prevScene == 'ActivityForm') {
                            setTimeout(() => {
                                navigation.replace('ActivityForm', { prevScene: 'CheckInCamera', dataCheckIn: tmpData, activity: route?.params?.activity })
                            }, 400);
                        }
                        else {
                            navigation.replace('CheckIn', { data: tmpData, prevScene: route?.params?.prevScene, onReLoadData: route?.params?.onReLoadData });
                        }
                    }
                    else {
                        console.log('==BACK===');
                        let tmpData = { ...dataCheckIn };
                        tmpData.checkin_customer_image = data.uri;
                        setDataCheckIn(tmpData);
                        if (route?.params?.prevScene == 'ActivityForm') {
                            setTimeout(() => {
                                navigation.replace('ActivityForm', { prevScene: 'CheckInCamera', dataCheckIn: tmpData, activity: route?.params?.activity })
                            }, 400);
                        }
                        else {
                            navigation.replace('CheckIn', { data: tmpData, prevScene: route?.params?.prevScene, onReLoadData: route?.params?.onReLoadData });
                        }
                    }
                }
            })
            .catch((err) => {
                // console.error('error: ', err);
                setLoading(false);
            });
    }

    console.log(dataCheckIn);
    return (
        <SafeAreaView
            edges={['top', 'right', 'left']}
            style={{
                flex: 1,
                flexDirection: 'column',
            }}
        >
            <Header
                noBorder
            >
                <Left>
                    <RippleEffectButton
                        style={{
                            marginLeft: 12
                        }}
                        iconLeft={'long-arrow-left'}
                        color={Colors.black.black1}
                        size={26}
                        onPress={() => {
                            goBack();
                        }}

                    />
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{route?.params?.title || getLabel('common.title_camera')}</Title>
                </Body>
                <Right />
            </Header>
            <View style={{ flex: 1, height: null, width: null }}>
                <RNCamera
                    ref={cameraRef}
                    style={styles.camera}
                    type={cameraType == 'front' ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    barCodeTypes={[
                        RNCamera.Constants.BarCodeType.code128,
                        RNCamera.Constants.BarCodeType.code39,
                        RNCamera.Constants.BarCodeType.code39mod43,
                        RNCamera.Constants.BarCodeType.qr
                    ]}
                    onBarCodeRead={(e) => {
                        console.log('onBarCodeRead', e);
                    }}
                    captureAudio={false}
                />
                <TouchableOpacity
                    style={styles.btnCamera}
                    onPress={() => takePicture()}
                >
                    <Icon name={getIcon('Camera')} style={styles.iconCamera} />
                </TouchableOpacity>
            </View>
            <IndicatorLoading loading={loading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    camera: {
        flex: 1,
        alignItems: 'center',
    },
    btnCamera: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 45,
        backgroundColor: Colors.white.white1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        bottom: 30,
        alignSelf: 'center'
    },
    iconCamera: {
        fontSize: 40,
        color: Colors.brand.brand1
    }
});

export default Camera;