// Import libraries
import React, { useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-root-toast';
import { ActionSheet, Container, Content, Icon as NBIcon } from 'native-base';

// Import Components
import { Header, Left, SpaceM, Body, Title, Right } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import RippleEffectButton from '../../components/RippleEffectButton';
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import I18n from '../../utils/i18n';
import Global from '../../Global';
import TipProvider, { Tip, showTip, closeTip, showTipTour } from 'react-native-tip'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage';

export default function ForgotPassword() {
    const navigation = useNavigation();
    const [userName, setUserName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const serverUrlRef = React.useRef(null);
    const [server, setServer] = React.useState('');
    const [prefixURL, setPrefixURL] = React.useState('https://');
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation.goBack();
                return true;
            }
        );

        const unsubscribe = navigation.addListener('focus', () => {
            AsyncStorage.getItem('serverUrl', (err, result) => {
                if (err) {
                    console.log('Getting local Server URL error', err);
                    return;
                }

                var url = result;

                if (url) {
                    if (url.includes('https://')) {
                        setPrefixURL('https://')
                        setServer(url.replace('https://', ''));
                    }
                    else if (url.includes('http://')) {
                        setPrefixURL('http://')
                        setServer(url.replace('http://', ''))
                    }
                    else {
                        setServer(url)
                    }
                }
            });
        })

        return () => {
            unsubscribe();
            backHandler.remove();
        }
    }, []);

    const resetPassword = () => {
        // Validate
        if (userName.trim() == '') {
            Alert.alert(I18n.t('login.user_name_empty_msg', { locale: Global.locale || "vn_vn" }));
            return;
        }

        if (email.trim() == '') {
            Alert.alert(I18n.t('login.email_empty_msg', { locale: Global.locale || "vn_vn" }));
            return;
        }

        if (!Global.validateEmail(email)) {
            Alert.alert(I18n.t('common.msg_email_invalid', { locale: Global.locale || "vn_vn" }));
            return;
        }

        if (server.trim() != '' && !Global.validateUrl(prefixURL.trim() + server.trim())) {
            setTimeout(() => {
                showTip('protocol', 300, {
                    title: getLabel('guidelines.title_protocal'),
                    body: getLabel('guidelines.msg_server_url_incorrect'),
                    dismissable: true
                })
            }, 500);

            return;
        }

        if (Global.getServiceUrl('serverUrl') != (prefixURL.trim() + server.trim()) && server.trim() != '') {
            Global.updateServerUrl(prefixURL.trim() + server.trim());
        }

        // Do request
        setLoading(true);

        // Check server url is available
        Global.checkServerUrl(prefixURL.trim() + server.trim(),
            () => {
                if (Global.getServiceUrl('serverUrl') != (prefixURL.trim() + server.trim()) && server.trim() != '') {
                    Global.updateServerUrl(prefixURL.trim() + server.trim());
                }
                console.log('Server url is available', prefixURL.trim() + server.trim());

                var params = {
                    RequestAction: 'ResetPassword',
                    Params: {
                        username: userName,
                        email: email
                    }
                };

                // Call api
                Global.callAPI(null, params, (data) => {
                    setLoading(false);
                    if (parseInt(data.success) != 1) {
                        if (data.message == 'USER_NOT_EXIST' || data.message == 'USER_NOT_FOUND') {
                            Toast.show(I18n.t('login.user_name_not_exits_msg', { locale: Global.locale || "vn_vn" }));
                            return;
                        }
                        else if (data.message == 'USER_INACTIVE') {
                            Toast.show(I18n.t('login.user_name_inactive_msg', { locale: Global.locale || "vn_vn" }));
                            return;
                        }
                    }
                    else {
                        setTimeout(() => {
                            Alert.alert(
                                Global.appName,
                                I18n.t('login.send_email_confirm_change_password_msg', { locale: Global.locale || "vn_vn" }),
                                [{
                                    text: 'OK',
                                    style: 'default',
                                    onPress: () => {
                                        navigation.navigate('Login');
                                    },
                                }]
                            )
                        }, 1000);
                        
                    }
                }, error => {
                    setLoading(false);
                    Toast.show(I18n.t('login.change_password_error_msg', { locale: Global.locale || "vn_vn" }));
                });

            }, () => {
                setLoading(false);

                setTimeout(() => {
                    showTip('protocol', 300, {
                        title: getLabel('guidelines.title_protocal'),
                        body: getLabel('guidelines.msg_server_url_incorrect'),
                        dismissable: true
                    })
                }, 500);
            });

    }

    return (
        <SafeAreaView
            edges={['top', 'right', 'left']}
            style={{ flex: 1, backgroundColor: Colors.white.white1 }}
        >
            <Header noBorder>
                <Left>
                    <RippleEffectButton
                        style={{
                            marginLeft: 12
                        }}
                        iconLeft={'long-arrow-left'}
                        color={Colors.black.black1}
                        size={26}
                        onPress={() => {
                            navigation.goBack()
                        }}

                    />
                </Left>
                <Body>
                    <Title allowFontScaling={true} >
                        {getLabel('common.title_forgot_password')}
                    </Title>
                </Body>
                <Right />
            </Header>
            <Content style={{ flex: 1, backgroundColor: Colors.white.white1 }}>
                <Box
                    width={widthResponse}
                    height={heightDevice * .3}
                    paddingHorizontal='l'
                    alignItems='center'
                    justifyContent='center'
                >
                    <Image
                        source={require('../../assets/images/logocrm.png')}
                        resizeMode='contain'
                        style={{ width: '80%', height: '80%' }}
                    />
                </Box>
                <Box
                    flex={1}
                    alignItems='center'
                >
                    {/* User name */}
                    <Box
                        width={widthResponse * 0.85}
                        height={44}
                        borderRadius={4}
                        borderWidth={StyleSheet.hairlineWidth}
                        borderColor='black2'
                    >
                        <TextInput
                            placeholder={getLabel('login.placeholder_user_name')}
                            value={userName}
                            onChangeText={(value) => { setUserName(value) }}
                            autoCapitalize={'none'}
                            style={{
                                flex: 1,
                                paddingHorizontal: 8
                            }}
                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                        />
                    </Box>

                    {/* Email */}
                    <SpaceM />
                    <Box
                        width={widthResponse * 0.85}
                        height={44}
                        borderRadius={4}
                        borderWidth={StyleSheet.hairlineWidth}
                        borderColor='black2'
                        flexDirection='row'
                    >
                        <TextInput
                            placeholder={getLabel('login.placeholder_email')}
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                            }}
                            autoCapitalize={'none'}
                            style={{
                                flex: 1,
                                paddingHorizontal: 8
                            }}
                            keyboardType='email-address'
                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                        />

                    </Box>

                    <SpaceM />
                    <Box
                        width={widthDevice * 0.85}
                        height={44}
                        borderRadius={4}
                        flexDirection='row'
                        alignItems='center'
                    >
                        <Tip
                            id='protocol'
                            title={getLabel('guidelines.title_protocal')}
                            body={getLabel('common.label_protocal_guildeline')}
                            pulseColor={Colors.white.white1}
                            showItemPulseAnimation
                            active={true}
                            dismissable={false}
                            onPressItem={() => { }}
                            style={{
                                backgroundColor: '#fff',
                                height: 44,
                                width: 82,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 8,
                                    height: 44,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    backgroundColor: Colors.white.white1,
                                    borderTopLeftRadius: 4,
                                    borderBottomLeftRadius: 4,
                                    paddingTop: 2,
                                    width: 82,
                                    borderWidth: 0.6,
                                    borderColor: Colors.black.black3,
                                }}
                                onPress={() => {
                                    if (prefixURL == 'https://') {
                                        setPrefixURL('http://')
                                    }
                                    else {
                                        setPrefixURL('https://')
                                    }
                                }}
                            >
                                {
                                    prefixURL == 'https://' ?
                                        (
                                            <NBIcon
                                                name='lock'
                                                type='FontAwesome'
                                                style={{
                                                    fontSize: 14,
                                                    color: Colors.black.black2
                                                }}
                                            />
                                        )
                                        :
                                        (
                                            <NBIcon
                                                name='warning'
                                                type='FontAwesome'
                                                style={{
                                                    fontSize: 16,
                                                    color: Colors.black.black2
                                                }}
                                            />
                                        )
                                }
                                <Box
                                >

                                    <Text
                                        fontWeight='bold'
                                        color='black2'
                                        marginLeft='m'

                                    >
                                        {prefixURL}
                                    </Text>
                                </Box>

                            </TouchableOpacity>
                        </Tip>

                        <Box
                            flex={1}
                            style={{
                                width: '100%',
                            }}
                        >
                            <Tip
                                id='inputURL'
                                title={'Server CRM'}
                                body={getLabel('common.label_server_url_guildeline')}
                                pulseColor={Colors.white.white1}
                                showItemPulseAnimation
                                active={true}
                                dismissable={false}
                                onPressItem={() => { }}
                                style={{
                                    backgroundColor: '#fff',
                                    flex: 1,
                                    maxHeight: 44,
                                    borderTopRightRadius: 4,
                                    borderBottomRightRadius: 4,
                                }}
                            >
                                <TextInput
                                    ref={serverUrlRef}
                                    placeholder={getLabel('login.placeholder_url')}
                                    value={server}
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(value) => {
                                        setServer(value.replace('https://', '').replace('http://', ''))
                                    }}
                                    style={{
                                        flex: 1,
                                        maxHeight: 44,
                                        width: widthDevice * 0.85 - 82,
                                        paddingHorizontal: 8,
                                        borderTopRightRadius: 4,
                                        borderBottomRightRadius: 4,
                                        backgroundColor: '#fff',
                                        borderWidth: 0.7,
                                        borderColor: Colors.black.black3,
                                        borderLeftWidth: 0
                                    }}
                                    returnKeyType='go'
                                    onSubmitEditing={() => {
                                        resetPassword();
                                    }}
                                />
                            </Tip>
                        </Box>
                    </Box>

                    <Box
                        width={widthDevice * 0.85}
                        alignItems='flex-end'
                        justifyContent='flex-end'
                        paddingVertical='m'
                        paddingRight='l'
                    >
                        <Text
                            fontSize={11}
                            color='black3'
                            fontStyle='italic'
                        >
                            {getLabel('common.example_label')} crm.cloudpro.vn
                        </Text>
                    </Box>

                    {/* Button reset */}
                    <SpaceM />
                    <TouchableOpacity onPress={() => resetPassword()}>
                        <Box
                            width={widthResponse * 0.85}
                            height={36}
                            borderRadius={4}
                            backgroundColor='primary'
                            alignItems='center'
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} color='white1'>{getLabel('login.btn_reset_password')}</Text>
                        </Box>
                    </TouchableOpacity>
                </Box>
            </Content>
            <IndicatorLoading loading={loading} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({})
