import AsyncStorage from '@react-native-community/async-storage';
import { Container, Content, Icon as NBIcon } from 'native-base';
import React from 'react';
import { Alert, BackHandler, Image, Keyboard, NativeModules, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import BadgeAndroid from 'react-native-android-badge';
import PushNotification from 'react-native-push-notification';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { closeTip, showTip, showTipTour, Tip } from 'react-native-tip';
// Component
import { SpaceL, SpaceM } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import Config from '../../Config';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { AuthContext, getLabel, heightDevice, widthDevice } from '../../utils/commons/commons';
import { systemFont, UIFontSize } from '../../utils/commons/FontSize';
import I18n from '../../utils/i18n';

export default function Login({ navigation }) {
    const [loading, setLoading] = React.useState(false);
    const [userName, setUserName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isShowPassword, setShowPassword] = React.useState(false);
    const [server, setServer] = React.useState('');
    const [prefixURL, setPrefixURL] = React.useState('https://');
    const usernameRef = React.useRef(null);
    const passwordRef = React.useRef(null);
    const serverUrlRef = React.useRef(null);
    const { signIn } = React.useContext(AuthContext);

    React.useEffect(() => {
        // Init 1 time at login page
        Global.init(() => { });

        AsyncStorage.getItem('serverUrl', (err, result) => {
            if (err) {
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

        // Do nothing when user click back button
        BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        // Get data debug
        AsyncStorage.getItem('debug', (err, result) => {
            if (err) {
                return;
            }

            var debug = JSON.parse(result);
            Global.debug = debug;
        });

        AsyncStorage.getItem('showGuildLineLogin', (err, result) => {
            if (err) {
                return;
            }

            if (!result) {
                setTimeout(() => {
                    showTipTour([
                        {
                            id: 'protocol',
                            nextId: 'inputURL',
                            delay: 2000
                        },
                        {
                            id: 'inputURL',
                            prevId: 'protocol',
                            delay: 2000
                        }
                    ]);

                    AsyncStorage.setItem('showGuildLineLogin', 'hasShowGuildLineLogin');

                    setTimeout(() => {
                        closeTip();
                    }, 20000);

                }, 1000);
            }
        });

        return () => { };
    }, []);

    const validate = () => {
        // Check empty username
        if (userName.trim() === '') {
            Alert.alert(
                '',
                I18n.t('login.user_name_empty_msg', { locale: Global.locale || "vn_vn" }),
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setTimeout(() => {
                                usernameRef.current.focus();
                            }, 300)
                        }
                    }
                ]
            );

            return false;
        }

        // Check empty password
        if (password.trim() === '') {
            Alert.alert(
                '',
                I18n.t('login.password_empty_msg', { locale: Global.locale || "vn_vn" }),
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setTimeout(() => {
                                passwordRef.current.focus();
                            }, 300)
                        }
                    }
                ]
            );

            return false;
        }

        return true;
    }

    const login = () => {
        if (!validate()) {
            return;
        }

        if (server.trim() != '' && !Global.validateUrl(prefixURL.trim() + server.trim())) {
            setTimeout(() => {
                showTip(
                    'protocol',
                    300,
                    {
                        title: getLabel('guidelines.title_protocal'),
                        body: getLabel('guidelines.msg_server_url_incorrect'),
                        dismissable: true
                    }
                );
            }, 500);

            return;
        }

        if (Global.getServiceUrl('serverUrl') != (prefixURL.trim() + server.trim()) && server.trim() != '') {
            Global.updateServerUrl(prefixURL.trim() + server.trim());
        }

        setLoading(true);

        // Check server url is available
        Global.checkServerUrl(prefixURL.trim() + server.trim(),
            () => {
                if (Global.getServiceUrl('serverUrl') != (prefixURL.trim() + server.trim()) && server.trim() != '') {
                    Global.updateServerUrl(prefixURL.trim() + server.trim());
                }

                if (!Global.versionCRM) {
                    Global.checkVersionCRM(prefixURL.trim() + server.trim());
                }

                var params = {
                    RequestAction: 'Login',
                    Credentials: {
                        username: userName,
                        password: password,
                    },
                    Remember: 1
                };

                Global.callAPI(null, params, (data) => {
                    Global.token = data?.token;
                    Global.setUser(data?.user_info);
                    Global.setCounters(data?.update_counters);
                    Global.countNotification = data?.update_counters?.notifications_count?.total;
                    Global.userList = data?.metadata?.user_list;
                    Global.setGroupList(data?.metadata?.group_list);
                    Global.enumList = data?.metadata?.enum_list;
                    Global.packageFeatures = data?.metadata?.package_features;
                    Global.validationConfig = data?.metadata?.validation_config;
                    Global.mentions = Global.convertUserListToMentionList(data?.metadata?.user_list || {})
                    Global.dependenceList = data?.metadata?.dependence_list;
                    Global.modulesPermissions = data?.metadata?.modules_permissions || { isShowAll: '1' };
                    Global.saveHomeSetting(data?.home_screen_config)
                    Global.saveCacheUserInfo();

                    // Set badge icon
                    if (Platform.OS === 'ios') {
                        PushNotification.setApplicationIconBadgeNumber(parseFloat(data?.update_counters?.notifications_count?.total || 0))
                    }
                    else {
                        BadgeAndroid.setBadge(parseFloat(data?.update_counters?.notifications_count?.total || 0));
                    }

                    AsyncStorage.setItem('applicationActiveNewFlow', "active", () => { });

                    // Store credentials
                    var token = data.token;
                    AsyncStorage.setItem('token', token, () => {
                        console.log('Token Saved!');
                    });

                    const credentials = {
                        token: token,
                        url: prefixURL.trim() + server.trim() + Config.apiUrl,
                        // homeConfig: Global.getHomeSetting()
                    }

                    if ((Platform.OS == 'ios' && parseInt(Platform.Version.toString()) >= 14) || (Platform.OS == 'android')) {
                        try {
                            NativeModules.WidgetsHelper?.setCredentials?.(JSON.stringify(credentials));
                        }
                        catch (error) {
                            console.log('setCredentials Error: ', error);
                        }
                    }

                    setLoading(false);

                    const softPhoneToken = data.softphone_token;
                    setTimeout(() => {
                        if (softPhoneToken && Object.keys(softPhoneToken).length > 0) {
                            Global.setSoftPhoneToken(softPhoneToken, () => {
                                Global.initRingStone();
                                Global.launchApp();

                                signIn()
                            });
                        }
                        else {
                            // Start using the app
                            Global.launchApp();

                            signIn()
                        }
                    }, 600);
                },
                    (error) => {
                        setLoading(false)

                        // changeProtocol();
                        Toast.show(I18n.t('login.login_error_msg', { locale: Global.locale || "vn_vn" }));
                    });
            }, () => {
                setLoading(false);

                setTimeout(() => {
                    showTip(
                        'protocol',
                        300,
                        {
                            title: getLabel('guidelines.title_protocal'),
                            body: getLabel('guidelines.msg_server_url_incorrect'),
                            dismissable: true
                        }
                    );

                }, 500);
            });
    }

    // const changeProtocol = () => {
    //     if (prefixURL.search('https') != -1) {
    //         const urlChangeToHttp = prefixURL.replace('https', 'http')
    //         Global.updateServerUrl(urlChangeToHttp.trim() + server.trim());
    //         setPrefixURL(urlChangeToHttp)
    //     }
    //     else if (prefixURL.search('http') != -1) {
    //         const urlChange = prefixURL.replace('http', 'https')
    //         Global.updateServerUrl(urlChange.trim() + server.trim());
    //         setPrefixURL(urlChange)

    //     }
    // }

    return (
        <Container>
            <Content
                showsVerticalScrollIndicator={false}
            >
                <Box
                    paddingTop='xl'
                    paddingHorizontal='l'
                    alignItems='center'
                    justifyContent='center'
                    height={heightDevice * .4}
                >
                    <Image
                        source={require('../../assets/images/logocrm.png')}
                        resizeMode='contain'
                        style={{
                            width: '80%',
                            height: '80%'
                        }}
                    />
                </Box>

                <Box
                    flex={1}
                    alignItems='center'
                    minHeight={heightDevice * .6}
                >
                    {/* User name */}
                    <Box
                        width={widthDevice * 0.85}
                        height={44}
                        borderRadius={4}
                        borderWidth={0.6}
                        borderColor='black3'

                    >
                        <TextInput
                            ref={usernameRef}
                            placeholder={getLabel('login.placeholder_user_name')}
                            placeholderTextColor={Colors.black.black4}
                            value={userName}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            clearButtonMode='while-editing'
                            onChangeText={(value) => { setUserName(value) }}
                            style={{
                                flex: 1,
                                paddingHorizontal: 8,
                                fontSize: systemFont(UIFontSize.DEFAULT)
                            }}
                            returnKeyType='next'
                            onSubmitEditing={() => {
                                passwordRef.current.focus()
                            }}

                        />
                    </Box>

                    <SpaceM />

                    {/* Password */}
                    <Box
                        width={widthDevice * 0.85}
                        height={44}
                        borderRadius={4}
                        borderWidth={0.6}
                        borderColor='black3'
                        flexDirection='row'
                    >
                        <TextInput
                            ref={passwordRef}
                            placeholder={getLabel('login.placeholder_password')}
                            placeholderTextColor={Colors.black.black4}
                            value={password}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            clearButtonMode='while-editing'
                            onChangeText={(value) => {
                                setPassword(value);

                                if (!value) {
                                    setShowPassword(false)
                                }
                            }}
                            secureTextEntry={!isShowPassword}
                            style={{
                                flex: 1,
                                paddingHorizontal: 8,
                                fontSize: systemFont(UIFontSize.DEFAULT)
                            }}
                            returnKeyType='next'
                            onSubmitEditing={() => {
                                serverUrlRef.current.focus()
                            }}
                        />

                        {
                            password ?
                                (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowPassword(!isShowPassword)
                                        }}
                                        style={{
                                            height: 44,
                                            width: 50,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Text
                                            color='primary'
                                            fontSize={systemFont(UIFontSize.DEFAULT)}
                                        >
                                            {!isShowPassword ? getLabel('login.label_show') : getLabel('login.label_hide')}
                                        </Text>
                                    </TouchableOpacity>
                                )
                                : null
                        }

                    </Box>

                    <SpaceM />

                    {/* Server */}
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
                            titleStyle={{
                                fontSize: systemFont(UIFontSize.HEADLINE)
                            }}
                            bodyStyle={{
                                fontSize: systemFont(UIFontSize.DEFAULT) - 1
                            }}
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
                                                    fontSize: systemFont(UIFontSize.DEFAULT),
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
                                                    fontSize: systemFont(UIFontSize.HEADLINE),
                                                    color: Colors.black.black2
                                                }}
                                            />
                                        )
                                }

                                <Box>
                                    <Text
                                        fontWeight='bold'
                                        color='black2'
                                        marginLeft='m'
                                        fontSize={systemFont(UIFontSize.DEFAULT)}
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
                                titleStyle={{
                                    fontSize: systemFont(UIFontSize.HEADLINE)
                                }}
                                bodyStyle={{
                                    fontSize: systemFont(UIFontSize.DEFAULT) - 1
                                }}
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
                                    clearButtonMode='while-editing'
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
                                        borderLeftWidth: 0,
                                        fontSize: systemFont(UIFontSize.DEFAULT)
                                    }}
                                    returnKeyType='go'
                                    onSubmitEditing={() => {
                                        login();
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
                            fontSize={systemFont(UIFontSize.HELP_TEXT)}
                            color='black3'
                            fontStyle='italic'
                        >
                            {getLabel('common.example_label')} crm.cloudpro.vn
                        </Text>
                    </Box>

                    <SpaceM />

                    {/* Button Login */}
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            login();
                        }}
                    >
                        <Box
                            width={widthDevice * 0.85}
                            height={44}
                            borderRadius={4}
                            backgroundColor='primary'
                            alignItems='center'
                            justifyContent='center'
                        >
                            <Text
                                color='white1'
                                fontSize={systemFont(UIFontSize.DEFAULT)}
                            >
                                {getLabel('login.btn_sing_in')}
                            </Text>
                        </Box>
                    </TouchableOpacity>

                    <SpaceL />
                    <SpaceL />

                    {/* Forgot password */}
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('ForgotPassword');
                        }}
                    >

                        <Text
                            color='primary'
                            fontSize={systemFont(UIFontSize.DEFAULT)}
                        >
                            {getLabel('login.btn_forgot_your_password')}
                        </Text>
                    </TouchableOpacity>
                </Box>
            </Content>

            <SafeAreaView
                edges={['bottom', 'left', 'right']}
            >
                <Box
                    justifyContent='center'
                    alignItems='center'
                    paddingVertical='m'
                >
                    <Text
                        allowFontScaling={true}
                        fontSize={systemFont(UIFontSize.HEADLINE)}
                        color='black2'
                        style={{ ...styles.text }}
                    >
                        {`CloudPro CRM ${Global.appVersion}`}
                    </Text>
                </Box>
            </SafeAreaView>

            <IndicatorLoading
                loading={loading}
            />
        </Container>
    )
}

const styles = StyleSheet.create({
    floatingSetting: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: Number.MAX_VALUE
    },
    floatingBtn: {
        flex: 1,
        padding: 12,
    },
    text: {
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 5,
            },
            ios: {
                shadowColor: Colors.white.white1,
                shadowOffset: {
                    width: 0.5,
                    height: 0.5,
                },
                shadowOpacity: 0.95,
                shadowRadius: 3.44,
            }
        }),
    }
})
