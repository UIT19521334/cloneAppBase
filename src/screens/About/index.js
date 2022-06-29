import React, { useEffect, useState } from 'react';
import { Image, Linking, TouchableHighlight, Alert, Text, BackHandler, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Communications from 'react-native-communications';
import { Body, Content, Header, InputItem, ItemViewOpacity, LargeHeader, Left, NText, Right, SpaceHS } from '../../components/CustomComponentView';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getIcon, getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import Config from '../../Config.json';
import Global from '../../Global'
import { Box } from '../../themes/themes';
import { LineItemViewText } from '../../components/ComponentView';
import { Icon as NBIcon } from 'native-base';
import { View } from 'react-native-animatable';
import CkEditor from '../../package/react-native-ckeditor'
import Orientation from 'react-native-orientation';
import FileViewer from "react-native-file-viewer";
import RNFS from 'react-native-fs';
import moment from 'moment-timezone';
import RNCommunications from '../../components/RNCommunications';

const AboutScreen = ({ navigation }) => {

    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (counter >= 10) {
            RNFS.readDir(RNFS.DocumentDirectoryPath)
                .then((res) => {
                    console.log('>>>>>>>RNFS: ', res);

                    res?.map((path) => {
                        if (path.name == 'hydraLog.txt') {
                            // RNFS.unlink(path.path)
                            FileViewer.open(path.path)
                                .then(() => {

                                })
                                .catch((err) => {
                                    console.log("Error red file", error);
                                })
                        }
                    })

                })
                .catch((error) => {
                    console.log(">>>>>>>>>> Error RNFS: ", error);
                })
        }

        return () => {}
    }, [counter])

    return (
        <>
            <LargeHeader>
                <Header noBorder>
                    <Left>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{
                                marginLeft: 10,
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 40
                            }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Icon
                                name={getIcon('Menu')}
                                style={{
                                    color: Colors.black.black1,
                                    fontSize: 18
                                }}
                            />
                        </TouchableHighlight>
                    </Left>
                    <Right>

                    </Right>
                </Header>
                <Header noBorder>
                    <Body>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                let num = counter
                                setCounter(num + 1);
                            }}
                        >
                            <Image
                                source={require('../../assets/images/logocrm.png')}
                                resizeMode='contain'
                                style={{ maxWidth: widthResponse * 0.8 }}

                            />
                        </TouchableWithoutFeedback>
                    </Body>
                </Header>
            </LargeHeader>

            <Content style={{ backgroundColor: 'white' }}>
                <LineItemViewText
                    title={getLabel('about.designed_by_label')}
                    value={'OnlineCRM'}
                />
                <LineItemViewText
                    title={getLabel('about.website_label')}
                    value={'https://onlinecrm.vn'}
                    textStyle={{ color: Colors.functional.primary, fontStyle: 'italic' }}
                    handleOnPress={() => {
                        Linking.openURL('https://onlinecrm.vn');
                    }}
                />
                <LineItemViewText
                    title={getLabel('about.hotline_label')}
                    value={'1900 29 29 90'}
                    textStyle={{ color: Colors.functional.primary, fontStyle: 'italic' }}
                    handleOnPress={() => {
                        RNCommunications.phoneCall('1900292990', true);
                    }}
                />
                <LineItemViewText
                    title={getLabel('about.version_label')}
                    value={Platform.OS === 'android' ? Config.appVersion.android : Config.appVersion.ios}
                />
                <LineItemViewText
                    title={getLabel('about.server_url_label')}
                    value={Global.getServiceUrl('serverUrl')}
                />

                <Box
                    backgroundColor='white1'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <TouchableOpacity
                        style={{
                            paddingLeft: 20,
                            backgroundColor: Colors.white.white2,
                            alignSelf: 'flex-start',
                            height: 36,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 20
                        }}
                        onPress={() => {
                            navigation.navigate('RMWebView', { link: 'https://onlinecrm.vn/chinh-sach-bao-mat-thong-tin#2-su-dung-thong-tin-ca-nhan', title: getLabel('about.btn_privacy') })
                        }}
                    >
                        <NBIcon name={'privacy-tip'} type='MaterialIcons' style={{ fontSize: 16, color: Colors.functional.primary }} />
                        <View style={{ width: 4 }} />
                        <NText allowFontScaling={true} color={Colors.functional.primary}>
                            {getLabel('about.btn_privacy')}
                        </NText>
                    </TouchableOpacity>
                </Box>

                <Box
                    backgroundColor='white1'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <TouchableOpacity
                        style={{
                            paddingLeft: 20,
                            backgroundColor: Colors.white.white2,
                            alignSelf: 'flex-start',
                            height: 36,
                            paddingHorizontal: 12,
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            borderRadius: 20
                        }}
                        onPress={() => {
                            Alert.alert(getLabel('about.device_info_label'), Global.userAgent)
                        }}
                    >
                        <NText allowFontScaling={true} color={Colors.functional.primary}>
                            <Icon name={'exclamation-circle'} style={{ fontSize: 15 }} /> {getLabel('about.device_info_label')}
                        </NText>
                    </TouchableOpacity>
                </Box>
                <Box
                    backgroundColor='white1'
                    paddingVertical='l'
                    paddingHorizontal='l'
                >
                    <TouchableOpacity
                        style={{
                            paddingLeft: 20,
                            backgroundColor: Colors.white.white2,
                            alignSelf: 'flex-start',
                            height: 36,
                            paddingHorizontal: 12,
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            borderRadius: 20
                        }}
                        onPress={() => {
                            Linking.openURL('https://docs.onlinecrm.vn/crm-tieu-chuan/mobile-app');
                        }}
                    >
                        <NText allowFontScaling={true} color={Colors.functional.primary}>
                            <Icon name={'exclamation-circle'} style={{ fontSize: 15 }} /> {getLabel('about.user_guide_label')}
                        </NText>
                    </TouchableOpacity>
                </Box>
            </Content>

        </>
    )
}
export default AboutScreen;

