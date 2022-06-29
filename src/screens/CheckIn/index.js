// Import libraries
import { Content } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler, DeviceEventEmitter, Image, SafeAreaView,
    StyleSheet,
    TouchableHighlight, TouchableOpacity
} from 'react-native';
import Toast from 'react-native-root-toast';
import { LineItemViewText } from '../../components/ComponentView';
// Import components
import { Body, Header, IconRight, Left, LText, NText, Right, SpaceS, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { getIcon, getLabel, widthResponse } from '../../utils/commons/commons';

const CheckIn = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [dataCheckIn, setDataCheckIn] = useState(route?.params?.data ? route?.params?.data : {});
    const [isLoadingGetAddress, setLoadingGetAddress] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                goBack();
                return true;
            }
        );

        setLoadingGetAddress(Global.isProcessingGetAddressCheckIn);

        let inforCheckIn = { ...(route?.params?.data ? route?.params?.data : {}) }
        if (Global.dataCheckIn && Object.keys(Global.dataCheckIn).length > 0) {
            inforCheckIn.checkin_address = Global.dataCheckIn?.checkin_address;
            inforCheckIn.checkin_longitude = Global.dataCheckIn?.checkin_longitude;
            inforCheckIn.checkin_latitude = Global.dataCheckIn?.checkin_latitude;
        }
        setDataCheckIn(inforCheckIn);

        let subscriptionGetAddressCheckIn = DeviceEventEmitter.addListener('Feature.CheckIn', () => {
            setLoadingGetAddress(false);
            let inforCheckIn = { ...(dataCheckIn) }
            if (Global.dataCheckIn && Object.keys(dataCheckIn).length > 0) {
                inforCheckIn.checkin_address = Global?.dataCheckIn?.checkin_address;
                inforCheckIn.checkin_longitude = Global?.dataCheckIn?.checkin_longitude;
                inforCheckIn.checkin_latitude = Global?.dataCheckIn?.checkin_latitude;
            }
            setDataCheckIn(inforCheckIn)
        })

        return () => {
            backHandler.remove();
            subscriptionGetAddressCheckIn.remove()
        }
    }, []);

    const goBack = () => {
        if (route?.params?.prevScene == 'ActivityView') {
            if (route?.params?.parentScene == 'Calendar') {
                navigation.replace('ActivityView', { activity: dataCheckIn, prevScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });
            }
            else {
                navigation.replace('ActivityView', { activity: dataCheckIn });
            }
        }
        else {
            route?.params?.onReLoadData?.();
            navigation.navigate('Calendar');
        }
    }

    const checkIn = () => {
        // Do request
        setLoading(true);

        var params = {
            RequestAction: 'Checkin',
            Data: {
                id: dataCheckIn.id,
                latitude: dataCheckIn.checkin_latitude,
                longitude: dataCheckIn.checkin_longitude,
                address: dataCheckIn.checkin_address
            },
            CustomerPicture: { uri: dataCheckIn.checkin_customer_image, name: 'customer_picture.jpg', type: 'image/jpeg' },
            SalesmanPicture: { uri: dataCheckIn.checkin_salesman_image, name: 'sale_picture.jpg', type: 'image/jpeg' },
            IsMultiPartData: 1
        };

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('checkIn.msg_check_in_error'));
                return;
            }
            Toast.show(
                getLabel('checkIn.msg_check_in_success'),
                {
                    duration: Toast.durations.SHORT,
                    delay: 0,
                    animation: false,
                    hideOnPress: true,
                    onHidden: () => {
                        // Update counters triggered
                        Global.updateCounters();
                        // Go to page
                        if (route?.params?.prevScene == 'ActivityView') {
                            if (route?.params?.parentScene == 'Calendar') {
                                navigation.replace('ActivityView', { activity: dataCheckIn, prevScene: 'Calendar', onReLoadData: route?.params?.onReLoadData });
                            }
                            else {
                                route?.params?.onReLoadData?.();
                                navigation.replace('ActivityView', { activity: dataCheckIn });
                            }
                        }
                        else {
                            route?.params?.onReLoadData?.();
                            navigation.navigate('Calendar');
                        }
                        // if (this.props.prevScene == 'ActivityView') {
                        // 	Actions.ActivityView({data: data});
                        // }
                        // else {
                        // 	Actions.Calendars();
                        // }
                    }
                }
            );
        },
            error => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
            });
    }

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
                    <TouchableHighlight
                        activeOpacity={0.2}
                        underlayColor={Colors.white.white2}
                        style={{ marginLeft: 12 }}
                        onPress={() => {
                            goBack();
                        }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LText>
                    </TouchableHighlight>
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_check_in')}</Title>
                </Body>
                <Right>
                    <IconRight
                        onPress={() => { checkIn() }}
                    >
                        <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_check_in')}</LText>
                    </IconRight>
                </Right>
            </Header>
            <Content>
                <Box
                    backgroundColor='white1'
                >
                    <LineItemViewText
                        title={getLabel('activity.label_check_in_address')}
                        value={dataCheckIn?.checkin_address || ''}
                        RenderRightButton={() => {
                            if (!isLoadingGetAddress && dataCheckIn && dataCheckIn?.checkin_address) {
                                return null;
                            }

                            return (
                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={.7}
                                    onPress={() => {
                                        if (!isLoadingGetAddress) {
                                            Global.getInformationLocationCheckIn(null);
                                            setLoadingGetAddress(true);
                                            setTimeout(() => {
                                                setLoadingGetAddress(false)
                                            }, 10000)
                                        }
                                    }}
                                    style={{
                                        borderRadius: 30
                                    }}
                                >
                                    <Box
                                        width={30}
                                        height={30}
                                        borderRadius={30 / 2}
                                        borderWidth={.6}
                                        borderColor='white4'
                                        justifyContent='center'
                                        alignItems='center'
                                    >
                                        {
                                            isLoadingGetAddress ? (
                                                <ActivityIndicator color={Colors.functional.primary} size={'small'} />
                                            )
                                                : (
                                                    <Icon name={getIcon('CheckIn')} size={16} color={Colors.functional.primary} />
                                                )
                                        }
                                        {/* <Icon name={getIcon('CheckIn')} size={16} color={Colors.functional.primary}/> */}
                                    </Box>
                                </TouchableHighlight>
                            )
                        }}
                    />
                    <SpaceS />
                    <LineItemViewText
                        title={getLabel('activity.label_check_in_time')}
                        value={Global.formatDateTime(new Date())}
                    />
                    <SpaceS />
                    <Box paddingHorizontal='l' paddingVertical='m' flexDirection='row'>
                        <Box flex={1} alignItems='center' paddingHorizontal='l' >
                            <NText allowFontScaling={true} color={Colors.black.black3} style={{ textAlign: 'center' }}>
                                {getLabel('activity.label_check_in_salesman_image')}
                            </NText>
                        </Box>
                        <Box flex={1} alignItems='center' paddingHorizontal='l' >
                            <NText allowFontScaling={true} color={Colors.black.black3} style={{ textAlign: 'center' }}>
                                {getLabel('activity.label_check_in_customer_image')}
                            </NText>
                        </Box>
                    </Box>
                    <SpaceS />
                    <Box paddingHorizontal='l' paddingVertical='m' flexDirection='row' style={{ paddingBottom: 30 }}>
                        <Box flex={1} alignItems='center' >
                            <Image
                                source={{ uri: dataCheckIn.checkin_salesman_image }}
                                style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                            />
                            <TouchableOpacity
                                style={styles.btnCamera}
                                onPress={() => navigation.replace('Camera', { cameraType: 'front', type: 'check_in', data: dataCheckIn, prevScene: 'CheckIn', checkInForm: route?.params?.prevScene, onReLoadData: route?.params?.onReLoadData, title: getLabel('common.title_check_in') })}
                            >
                                <Icon name={getIcon('Camera')} style={styles.camera} />
                            </TouchableOpacity>
                        </Box>
                        <Box flex={1} alignItems='center' >
                            <Image
                                source={{ uri: dataCheckIn.checkin_customer_image }}
                                style={{ width: widthResponse / 2 - 40, height: widthResponse / 2 - 40 }}
                            />
                            <TouchableOpacity
                                style={styles.btnCamera}
                                onPress={() => navigation.replace('Camera', { cameraType: 'back', type: 'check_in', data: dataCheckIn, prevScene: 'CheckIn', checkInForm: route?.params?.prevScene, onReLoadData: route?.params?.onReLoadData, title: getLabel('common.title_check_in') })}
                            >
                                <Icon name={getIcon('Camera')} style={styles.camera} />
                            </TouchableOpacity>
                        </Box>
                    </Box>
                </Box>
            </Content>
            <IndicatorLoading loading={loading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    btnCamera: {
        position: 'absolute',
        bottom: -20,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white.white2,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: Colors.white.white4,
        width: 40,
        height: 40
    },
    camera: {
        color: Colors.brand.brand1,
        fontSize: 24
    }
});

export default CheckIn;