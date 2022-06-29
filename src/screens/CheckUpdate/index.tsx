import { useNavigation } from '@react-navigation/core'
import { Content } from 'native-base'
import React from 'react'
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, TouchableHighlight, View } from 'react-native'
import { Header, Left, Body, Title, Right } from '../../components/CustomComponentView'
import Global from '../../Global'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { Text, Box } from '../../themes/themes'
import { getLabel, widthDevice } from '../../utils/commons/commons'
import { useDispatch } from 'react-redux';
import fetch from 'react-native-fetch-polyfill';
import { PARAMS_ALERT } from '../../utils/Models/models'
import { showAlert } from '../../redux/actions/alert'
import Config from '../../Config.json'
import RNFetchBlob from 'react-native-fetch-blob'

export default function CheckUpdate({ }) {

    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState(getLabel('setting.msg_check_update'));
    const navigation = useNavigation();
    const dispatch = useDispatch();

    React.useEffect(() => {

        const subscriber = navigation.addListener('focus', () => {
            updateProfile(
                (data) => {
                    console.log('updateProfile: ====================================================', data);
                    Global.setUser(data?.user_info);
                    Global.saveHomeSetting(data?.home_screen_config);
                    Global.saveCacheUserInfo();

                    updateMetaData(
                        (data) => {
                            console.log('updateMetaData: ====================================================', data);
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
                            checkUpdate(false, dispatch);
                            setLoading(false)
                        },
                        () => {
                            checkUpdate(false, dispatch);
                            setLoading(false)
                        }
                    );
                },
                () => {
                    checkUpdate(false, dispatch);
                    setLoading(false)
                }
            );
        })

        return () => { subscriber() }
    }, [navigation]);

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
                console.log('Error get meta data: ', err);
                callbackError?.()

            })
    }

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
                console.log('Error get meta data: ', err);
                callbackError?.()

            })
    }

    const checkUpdate = (userAction = false, dispatch) => {
        var url = `https://crm.cloudpro.vn/app_version.json?v=${Math.random()}`;
        console.log(url);
        RNFetchBlob.config({
            trusty: true,
            timeout: 10 * 1000
        })
        .fetch('GET', url)
            .then((response) => {

                if (response?.respInfo?.status != 200 && userAction == true) {
                    return;
                }
                const versionData = JSON.parse(response?.data || '{}');
                console.log('Version data: ', versionData);
                if ((versionData.CloudPro.ios && parseInt(this.appVersionCode) < parseInt(versionData.CloudPro.ios.replace('v', '').replace('.', '').replace('.', '') || 0) && Platform.OS == 'ios')
                    || (versionData.CloudPro.android && parseInt(this.appVersionCode) < parseInt(versionData.CloudPro.android.replace('v', '').replace('.', '').replace('.', '') || 0) && Platform.OS == 'android')) {
                    const params: PARAMS_ALERT = {
                        title: getLabel('common.title_update_new_version'),
                        message: getLabel('common.msg_update_new_version'),
                        actions: [
                            {
                                isCancel: true,
                                label: getLabel('common.btn_update_later')
                            },
                            {
                                isCancel: false,
                                label: getLabel('common.btn_ok'),
                                isHighLight: true,
                                onPress: () => {
                                    let url = Platform.OS == 'ios' ? 'https://itunes.apple.com/vn/app/cloudpro-crm/id1450222444?mt=8' : 'https://play.google.com/store/apps/details?id=vn.cloudpro.salesapp';
                                    Linking.openURL(url)
                                        .catch(err => {
                                            // console.error('An error occurred', err)
                                        });
                                }
                            }
                        ]
                    }

                    dispatch(showAlert?.(params));
                    return;
                }

                if (userAction == true) {
                }
            })
            .catch((error) => {
                console.log('Fetch app version error: ', error);
                
                setMessage(getLabel('setting.msg_not_fount_new_update'))
            });
    }

    return (
        <>
            <Header>
                <Left>
                    <TouchableHighlight
                        activeOpacity={0.2}
                        underlayColor={Colors.white.white2}
                        style={{ marginLeft: 12 }}
                        onPress={() => {
                            navigation.goBack();
                        }}
                    >
                        <Icon
                            name='long-arrow-left'
                            size={22}
                        />
                    </TouchableHighlight>
                </Left>
                <Body>
                    <Title allowFontScaling={true}>{getLabel('setting.label_check_update')}</Title>
                </Body>
                <Right>

                </Right>
            </Header>

            <Content
                scrollEnabled={false}
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1
                }}>

                {
                    loading ?
                        (
                            <ActivityIndicator
                                size='small'
                                color={Colors.black.black1}
                            />
                        )
                        :
                        (
                            <Box
                                width={44}
                                height={44}
                                borderRadius={44 / 2}
                                backgroundColor='successful'
                                justifyContent='center'
                                alignItems='center'
                            >
                                <Icon
                                    name='check'
                                    size={26}
                                    color={Colors.white.white1}
                                />
                            </Box>
                        )
                }
                <Box
                    maxWidth={widthDevice * .8}
                    paddingVertical='l'
                >
                    <Text textAlign='center' color='black2'>
                        {message}
                    </Text>
                </Box>
            </Content>
        </>
    )
}