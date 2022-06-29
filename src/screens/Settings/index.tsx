// Import libraries
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, TouchableHighlight, BackHandler } from 'react-native'
import { useDispatch } from 'react-redux';
// Import components
import { Content, Header, Left, Right, Body, Title, SectionView, SpaceS, ListItem } from '../../components/CustomComponentView';
import styles from './styles';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getIcon, getLabel, LangueContext } from '../../utils/commons/commons';
import I18n from '../../utils/i18n';
import Global from '../../Global';
import IndicatorLoading from '../../components/IndicatorLoading';
import Toast from 'react-native-root-toast';
import { useNavigationState } from '@react-navigation/native';
import { Colors } from '../../themes/colors/Colors';
import { PARAMS_ALERT } from '../../utils/Models/models'
import { showAlert } from '../../redux/actions/alert'

const SettingsScreen = ({ route, navigation }) => {
    const [loading, setLoading] = useState(false);
    const [languageSelected, setLanguageSelected] = useState(Global.locale || "vn_vn");
    const { changeLangue } = useContext(LangueContext);

    const dispatch = useDispatch();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );
        return () => backHandler.remove();
    }, []);

    const logOut = () => {
        setLoading(true);

        var params = {
            RequestAction: 'Logout',
        };

        Global.removeDeviceId(() => {
            //call api logout when remove device id successfully
            Global.callAPI(null, params, data => {
                setLoading(false);
                Global.exitApp();
                Toast.show(I18n.t('sidebar.logout_success_msg', { locale: Global.locale || "vn_vn" }));
            }, error => {
                setLoading(false);
                Toast.show(I18n.t('sidebar.logout_error_msg', { locale: Global.locale || "vn_vn" }));
            });
        });
    }

    const saveProfile = (language) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveProfile',
            Data: {
                language: language,
            },
        };

        // Call api
        Global.callAPI(null, params, data => {
            console.log(data);

            if (parseInt(data.success) === 1) {
                Global.setUser(data.user_info);
                Global.enumList = data.enum_list;
                // Global.saveCacheEnumList();
                Global.saveCacheUserInfo();
                Global.locale = language || "vn_vn";
                changeLangue(language || "vn_vn");
                setLanguageSelected(language || "vn_vn");
                setLoading(false)
                Toast.show(getLabel('common.msg_edit_success', { module: getLabel('profile.title').toLowerCase() }));
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_edit_error', { module: getLabel('profile.title').toLowerCase() }));
        });
    }

    

    return (
        <>
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
                <Body>
                    <Title allowFontScaling={true} >
                        {getLabel('common.title_settings')}
                    </Title>
                </Body>
                <Right />
            </Header>
            <Content>
                <SpaceS />
                <SectionView
                    noPaddingHorizontal
                    noPaddingVertical
                >
                    <ListItem
                        icon={'cloud-download'}
                        noArrowRight={true}
                        divider={false}
                        title={getLabel('setting.label_check_update')}
                        style={{
                            paddingHorizontal: 20
                        }}
                        onPress={() => {
                            navigation.navigate('CheckUpdate', { title: getLabel('setting.label_check_update') })
                        }}
                    />
                </SectionView>

                <SpaceS />
                <SectionView
                    noPaddingHorizontal
                    noPaddingVertical
                >
                    <ListItem
                        icon={'key'}
                        noArrowRight={true}
                        divider={false}
                        title={getLabel('setting.label_change_password')}
                        style={{
                            paddingHorizontal: 20
                        }}
                        onPress={() => {
                            navigation.navigate('ChangePassWord', { title: getLabel('common.title_modal_change_password') })
                        }}
                    />
                </SectionView>

                <SpaceS />
                <SectionView noPaddingHorizontal>
                    {
                        Global.isVersionCRMNew ? (
                            <ListItem
                                icon='home'
                                title={getLabel('setting.label_setting_home')}
                                divider={false}
                                style={{
                                    paddingHorizontal: 20,
                                    paddingLeft: 18

                                }}
                                onPress={() => { navigation.navigate('HomeSettings') }}
                            />
                        )
                            : null
                    }

                    <ListItem
                        icon='language'
                        title={getLabel('setting.label_language')}
                        divider={false}
                        selectedText={Global.getEnumLabel('Vtiger', 'languages', languageSelected)}
                        selectedTextStyle={{}}
                        optionsSelect={[...Global.getEnum('Vtiger', 'languages')]}
                        optionSelected={Global.getEnumObject('Vtiger', 'languages', languageSelected)}
                        onSelected={(value) => {
                            saveProfile(value);
                        }}
                        style={{
                            paddingHorizontal: 20,
                        }}
                    />

                    <ListItem
                        icon='bell'
                        title={getLabel('setting.label_allow_notifications')}
                        divider={false}
                        style={{
                            paddingHorizontal: 20
                        }}
                        onPress={() => { navigation.navigate('NotificationSetting') }}
                    />

                    {/* <ListItem
                        icon='cog'
                        title={getLabel('common.label_config')}
                        divider={false}
                        style={{
                            paddingHorizontal: 20
                        }}
                        onPress={() => { navigation.navigate('Configs') }}
                    /> */}
                </SectionView>

                <SpaceS />
                <SectionView
                    noPaddingHorizontal
                    noPaddingVertical
                >
                    <ListItem
                        icon={'sign-out-alt'}
                        iconColor={Colors.functional.dangerous}
                        noArrowRight={true}
                        divider={false}
                        titleStyle={{
                            color: Colors.functional.dangerous
                        }}
                        style={{
                            paddingHorizontal: 20
                        }}
                        title={getLabel('setting.label_sign_out')}
                        onPress={() => {
                            const params: PARAMS_ALERT = {
                                title: Global.appName,
                                message: getLabel('sidebar.alert_logout_msg'),
                                actions: [
                                    {
                                        isCancel: true,
                                        label: getLabel('common.btn_cancel')
                                    },
                                    {
                                        isCancel: false,
                                        label: getLabel('common.btn_ok'),
                                        isHighLight: true,
                                        onPress: () => {
                                            logOut()
                                        }
                                    }
                                ]
                            }

                            dispatch(showAlert?.(params));
                        }}
                    />
                </SectionView>
            </Content>
            <IndicatorLoading loading={loading} />
        </>
    )
}
export default SettingsScreen;
