// Import libraries
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, TouchableOpacity } from 'react-native';
import Toast from 'react-native-root-toast';
// Import components
import { Body, ContentScrollView, Header, IconViewLeft, InputItem, LBText, Left, Right, Title } from '../../../components/CustomComponentView';
import IndicatorLoading from '../../../components/IndicatorLoading';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { getLabel } from '../../../utils/commons/commons';
import I18n from '../../../utils/i18n';

export default function ChangePassword({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation.goBack();
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    const changePassword = () => {
        // Check empty new password
        if (newPassword.trim() === '') {
            Alert.alert(I18n.t('changePassword.new_password_empty_msg', { locale: Global.locale || "vn_vn" }));
            return;
        }

        // Check empty confirm password
        if (confirmPassword.trim() === '') {
            Alert.alert(I18n.t('changePassword.confirm_password_empty_msg', { locale: Global.locale || "vn_vn" }));
            return false;
        }

        // Check match new password and confirm password
        if (newPassword.trim() != confirmPassword.trim()) {
            Alert.alert(I18n.t('changePassword.password_match_error_msg', { locale: Global.locale || "vn_vn" }));
            return;
        }

        // Check new password over or enough 6 character
        if (newPassword.trim().length < 6) {
            Alert.alert(I18n.t('changePassword.new_password_invalid_msg', { locale: Global.locale || "vn_vn" }));
            return;
        }

        // Do request
        setLoading(true);

        var params = {
            RequestAction: 'ChangePassword',
            Params: {
                new_password: newPassword
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) === 1) {
                // Clear credentials
                AsyncStorage.removeItem('token', (err) => {
                    console.log('Token cleared');
                });

                // set enter value empty
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigation.goBack();
                Toast.show(I18n.t('changePassword.change_password_success_msg', { locale: Global.locale || "vn_vn" }));
            }
            else {
                Toast.show(I18n.t('changePassword.check_current_password_error_msg', { locale: Global.locale || "vn_vn" }));
            }
        }, error => {
            setLoading(false);
            Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
        });
    }

    return (
        <>
            <Header
            >
                <Left>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ marginLeft: 10, paddingHorizontal: 12, paddingVertical: 8 }}
                    >
                        <LBText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LBText>
                    </TouchableOpacity>
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_modal_change_password')}</Title>
                </Body>
                <Right>
                    <IconViewLeft
                        style={{ paddingRight: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 12 }}
                        onPress={() => changePassword()}
                    >
                        <LBText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_save')}</LBText>
                    </IconViewLeft>
                </Right>
            </Header>
            <ContentScrollView>
                {/* <InputItem
                    title={getLabel('setting.label_current_password')}
                    placeholder=''
                    value={currentPassword}
                    onValueChange={(value) => setCurrentPassword(value)}
                    isEdit={true}
                    isSecure={true}
                /> */}
                <InputItem
                    title={getLabel('setting.label_new_password')}
                    placeholder=''
                    value={newPassword}
                    onValueChange={(value) => setNewPassword(value)}
                    isEdit={true}
                    isSecure={true}
                />
                <InputItem
                    title={getLabel('setting.label_confirm_password')}
                    placeholder=''
                    value={confirmPassword}
                    onValueChange={(value) => setConfirmPassword(value)}
                    isEdit={true}
                    isSecure={true}
                />
            </ContentScrollView>
            <IndicatorLoading loading={loading} />
        </>
    )
}

