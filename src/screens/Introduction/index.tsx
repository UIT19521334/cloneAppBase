// Import libraries
import AsyncStorage from '@react-native-community/async-storage';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Container, View } from 'native-base';
import React from 'react';
import { BackHandler, Image, StyleSheet } from 'react-native';
import Config from '../../Config.json';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { AuthContext, heightDevice, isIphoneX, widthDevice } from '../../utils/commons/commons';

export default function Introduction() {

    const { restoreToken } = React.useContext(AuthContext);
    const [loaded, setLoaded] = React.useState(false);
    const navigation = useNavigation();

    React.useEffect(() => {
        const subscribe = navigation.addListener('focus', () => {
            // Init 1 time at login page
            if (loaded) {
                init();
            }
            else {
                Global.init(() => {
                    setLoaded(true)
                    init();
                });
            }
        });

        return subscribe;
    }, [navigation, loaded]);

    const init = () => {
        newFlow();
    }

    React.useEffect(() => {
        // Do nothing when user click back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return false;
        });

        return () => { backHandler.remove() };
    }, []);

    const newFlow = () => {
        AsyncStorage.getItem('token', (err, result) => {
            if (err) {
                return;
            }

            var token = result;

            Global.token = result;

            if (token && Global.isOnline) {
                AsyncStorage.getItem('cache_user_info', (err, data) => {
                    if (err) {
                        return;
                    }

                    // check connect internet status before Login
                    var userInfo = JSON.parse(data);

                    if (userInfo && Global.isOnline) {
                        Global.modulesPermissions = userInfo?.modules_permissions || { isShowAll: '1' };
                        Global.setUser(userInfo?.user);
                        Global.setCounters(userInfo?.counters);
                        Global.countNotification = userInfo?.counters?.notifications_count?.total;
                        Global.saveHomeSetting(userInfo?.homeSettings);

                        if (userInfo?.isCacheMetaData) {
                            Global.userList = userInfo?.userList;
                            Global.groupList = userInfo?.group_list;
                            Global.enumList = userInfo?.enumList;
                            Global.packageFeatures = userInfo?.packageFeatures;
                            Global.validationConfig = userInfo?.validationConfig;
                            Global.mentions = userInfo?.mentions;
                            Global.dependenceList = userInfo?.dependenceList;
                            Global.modulesPermissions = userInfo?.modules_permissions || { isShowAll: '1' };
                            Global.versionCRM = userInfo?.crmVersionCode;

                            if (userInfo?.crmVersionCode) {
                                const verCRM = userInfo?.crmVersionCode.split('.');
                                const verCurr = Config.crmVersionCode.split('.');

                                let isCurrentNew = true;

                                const lastIndex = verCRM.length - 1
                                const nextLastIndex = verCRM.length - 2

                                if (parseInt(verCRM[nextLastIndex]) < parseInt(verCurr[nextLastIndex])) {
                                    isCurrentNew = false;
                                }
                                else if ((parseInt(verCRM[nextLastIndex]) == parseInt(verCurr[nextLastIndex])) && (parseInt(verCRM[lastIndex]) < parseInt(verCurr[lastIndex]))) {
                                    isCurrentNew = false;
                                }
                                else {
                                    isCurrentNew = true;
                                }

                                Global.isVersionCRMNew = isCurrentNew;
                            }

                            Global.getSoftPhoneToken((dataSoftPhoneToken) => {

                                if (dataSoftPhoneToken && Object.keys(dataSoftPhoneToken).length > 0) {
                                    const softPhoneToken = dataSoftPhoneToken;

                                    setTimeout(() => {
                                        if (softPhoneToken) {
                                            Global.setSoftPhoneToken(softPhoneToken, () => {
                                                Global.initRingStone();
                                            });

                                        }
                                        else {
                                            // Start using the app
                                        }
                                    }, 1000);
                                }
                            });

                            setTimeout(() => {
                                updateProfile(
                                    (data) => {
                                        Global.setUser(data?.user_info);
                                        Global.saveHomeSetting(data?.home_screen_config);
                                        Global.saveCacheUserInfo();
                                    },
                                    () => {
                                        restoreToken(null);
                                    }
                                );

                            }, 1000 * 30);

                            setTimeout(() => {
                                updateMetaData(
                                    (data) => {
                                        Global.userList = data?.metadata?.user_list;
                                        Global.setGroupList(data?.metadata?.group_list);
                                        Global.enumList = data?.metadata?.enum_list;
                                        Global.packageFeatures = data?.metadata?.package_features;
                                        Global.validationConfig = data?.metadata?.validation_config;
                                        Global.mentions = Global.convertUserListToMentionList(data?.metadata?.user_list || {})
                                        Global.dependenceList = data?.metadata?.dependence_list;
                                        Global.modulesPermissions = data?.metadata?.modules_permissions || { isShowAll: '1' };
                                        Global.saveCacheUserInfo();
                                        Global.saveMetaDataTicket();
                                    },
                                    () => {
                                        restoreToken(null);
                                    }
                                );

                            }, 1000 * 36);

                            Global.updateCounters();
                            Global.launchApp();

                            restoreToken(token);
                        }
                        else {
                            Global.getSoftPhoneToken((dataSoftPhoneToken) => {

                                if (dataSoftPhoneToken && Object.keys(dataSoftPhoneToken).length > 0) {
                                    const softPhoneToken = dataSoftPhoneToken;

                                    setTimeout(() => {
                                        if (softPhoneToken) {
                                            Global.setSoftPhoneToken(softPhoneToken, () => {
                                                Global.initRingStone();
                                            });

                                        }
                                        else {
                                            // Start using the app
                                        }
                                    }, 1000);
                                }
                            });

                            updateMetaData(
                                (data) => {
                                    Global.userList = data?.metadata?.user_list;
                                    Global.setGroupList(data?.metadata?.group_list);
                                    Global.enumList = data?.metadata?.enum_list;
                                    Global.packageFeatures = data?.metadata?.package_features;
                                    Global.validationConfig = data?.metadata?.validation_config;
                                    Global.mentions = Global.convertUserListToMentionList(data?.metadata?.user_list || {})
                                    Global.dependenceList = data?.metadata?.dependence_list;
                                    Global.modulesPermissions = data?.metadata?.modules_permissions || { isShowAll: '1' };
                                    Global.saveCacheUserInfo();
                                    Global.updateCounters();
                                    Global.launchApp();
                                    restoreToken(token);
                                },
                                () => {
                                    Global.launchApp();
                                    restoreToken(null);
                                }
                            );
                        }

                    }
                    else {
                        restoreToken(null)
                    }
                });
            }
            else if (token && !Global.isOnline) {
                navigation.navigate('NotConnected')
            }
            else if (!token && !Global.isOnline) {
                navigation.navigate('NotConnected')
            }
            else {
                restoreToken(null)
            }
        });
    }

    /**
     * this func handle reload information profile after it handle re-save to cache 
     * @param callbackSuccess is call back data if it's has response data
     * @param callbackError is call back error
     */
    const updateProfile = (callbackSuccess, callbackError) => {
        const params = {
            RequestAction: 'GetProfile'
        };

        Global.callAPI(null, params,
            data => {
                if (parseInt(data.success) === 1) {
                    callbackSuccess?.(data);
                }
                else {
                    callbackError?.();
                }
            },
            err => {
                callbackError?.()
            });
    }

    /**
     * this func handle reload information meta data after it handle re-save to cache 
     * @param callbackSuccess is call back data if it's has response data
     * @param callbackError is call back error
     */
    const updateMetaData = (callbackSuccess, callbackError) => {
        const params = {
            RequestAction: 'GetMetadata'
        };

        Global.callAPI(null, params,
            data => {
                if (parseInt(data.success) === 1) {
                    callbackSuccess?.(data);
                }
                else {
                    callbackError?.();
                }
            },
            err => {
                callbackError?.()
            });
    }

    return (
        <Container>
            <Box
                width={widthDevice}
                height={heightDevice}
                backgroundColor='white1'
                alignItems='center'
            >
                <Image
                    source={require('../../assets/images/logocrm.png')}
                    style={styles.image}
                />

                <View style={{ ...styles.loadingContent }}>
                    <Box
                        width={widthDevice}
                        height={heightDevice * .4}
                    >
                        <LottieView
                            source={require('../../assets/lottie/sync.json')}
                            colorFilters={[{
                                keypath: "cloud",
                                color: Colors.functional.primary
                            }, {
                                keypath: "phone",
                                color: Colors.functional.primary
                            }]}
                            autoPlay
                            loop
                        />
                    </Box>
                </View>

                <Text
                    allowFontScaling={true}
                    fontSize={16}
                    color='black2'
                    style={{ ...styles.text, bottom: isIphoneX ? 70 : 55 }}
                >
                    {`CloudPro CRM ${Global.appVersion}`}
                </Text>

                <Text
                    allowFontScaling={true}
                    fontSize={16}
                    color='black2'
                    style={{
                        ...styles.text,
                        bottom: isIphoneX ? 40 : 25
                    }}
                >
                    {`Designed by `}<Text allowFontScaling={true} color='dangerous' fontWeight='bold'>OnlineCRM</Text>
                </Text>
            </Box>
        </Container>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '80%',
        resizeMode: 'contain',
        position: 'absolute',
        top: heightDevice / 4
    },
    text: {
        position: 'absolute',
        bottom: 50
    },
    loadingContent: {
        width: widthDevice,
        height: heightDevice,
        paddingTop: heightDevice * .42,
    },
    loadingText: {
        color: Colors.black.black3,
        marginTop: 8,
        fontSize: 12,
        fontStyle: 'italic'
    },
})
