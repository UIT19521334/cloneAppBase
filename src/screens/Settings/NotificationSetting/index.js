import React, { useEffect, useState } from 'react';
import { BackHandler, TouchableHighlight, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { Body, BooleanItem, Content, Header, IconRight, Left, LText, Right, SectionView, SpaceS, Title } from '../../../components/CustomComponentView';
import IndicatorLoading from '../../../components/IndicatorLoading';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { getLabel } from '../../../utils/commons/commons';

export default function NotificationSetting({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [notificationSetting, setNotificationSetting] = useState({});

    useEffect(() => {
        loadSettings();
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation.goBack();
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    const loadSettings = () => {
        setLoading(true);
        var params = {
            RequestAction: 'LoadSettings'
        };

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) === 1) {
                let config = data.user_preferences?.notification_config;

                if (!config) {
                    return;
                }
                else {
                    setNotificationSetting({
                        allowNotify: config.receive_notifications == 1 ? true : false,
                        allowNotifyTask: config.receive_assignment_notifications == 1 ? true : false,
                        allowNotifyCustomerProfileUpdate: config.receive_record_update_notifications == 1 ? true : false,
                        allowNotifyFollowingCustomerProfileUpdate: config.receive_following_record_update_notifications == 1 ? true : false,
                        allowNotifyOverdueComingTask: config.show_activity_reminders == 1 ? true : false,
                        allowNotifyCustomerBirthday: config.show_customer_birthday_reminders == 1 ? true : false
                    })
                }
            }
            else {
                Toast.show(getLabel('common.msg_connection_error'));
            }

        }, error => {
            setLoading(false);
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const saveSettings = () => {
        setLoading(true);

        var params = {
            RequestAction: 'SaveSettings',
            Data: {
                notification_config: {
                    receive_notifications: notificationSetting.allowNotify ? '1' : '0',
                    receive_assignment_notifications: notificationSetting.allowNotifyTask ? '1' : '0',
                    receive_record_update_notifications: notificationSetting.allowNotifyCustomerProfileUpdate ? '1' : '0',
                    receive_following_record_update_notifications: notificationSetting.allowNotifyFollowingCustomerProfileUpdate ? '1' : '0',
                    show_activity_reminders: notificationSetting.allowNotifyOverdueComingTask ? '1' : '0',
                    show_customer_birthday_reminders: notificationSetting.allowNotifyCustomerBirthday ? '1' : '0'
                }
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) === 1) {
                Toast.show(getLabel('setting.msg_save_setting_successfully'));
                return;
            }
            else {
                Toast.show(getLabel('common.msg_connection_error'));
            }

        }, error => {
            setLoading(false);
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const onChange = (field) => {
        let tmpNotificationSetting = { ...notificationSetting };
        tmpNotificationSetting[field] = !tmpNotificationSetting[field];
        setNotificationSetting(tmpNotificationSetting);
    }

    return (
        <>
            <Header
            >
                <Left>
                    <TouchableHighlight
                        activeOpacity={0.2}
                        underlayColor={Colors.white.white2}
                        style={{ marginLeft: 12 }}
                        onPress={() => {
                            navigation.goBack()
                        }}
                    >
                        <LText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LText>
                    </TouchableHighlight>
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{getLabel('common.title_modal_notification_setting')}</Title>
                </Body>
                <Right>
                    <IconRight
                        onPress={() => { saveSettings() }}
                    >
                        <LText allowFontScaling={true}  color={Colors.functional.primary}>{getLabel('common.btn_save')}</LText>
                    </IconRight>
                </Right>
            </Header>
            <Content>
                <SpaceS />
                <View
                    style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.white.white1 }}
                >
                    <BooleanItem
                        style={{ flex: 1 }}
                        title={getLabel('notification.label_allow_notify')}
                        selected={notificationSetting.allowNotify}
                        onChange={() => {
                            onChange('allowNotify')
                        }}
                    />
                </View>
                {
                    notificationSetting.allowNotify && (
                        <>
                            <SpaceS />
                            <SectionView noBorderBottomWidth noBorderTopWidth>
                                <BooleanItem
                                    style={{ flex: 1 }}
                                    title={getLabel('notification.label_allow_notify_task')}
                                    selected={notificationSetting.allowNotifyTask}
                                    onChange={() => {
                                        onChange('allowNotifyTask')
                                    }}
                                />
                            </SectionView>
                            <SpaceS />
                            <SectionView noBorderBottomWidth noBorderTopWidth>
                                <BooleanItem
                                    style={{ flex: 1 }}
                                    title={getLabel('notification.label_allow_notify_customer_profile_update')}
                                    selected={notificationSetting.allowNotifyCustomerProfileUpdate}
                                    onChange={() => {
                                        onChange('allowNotifyCustomerProfileUpdate')
                                    }}
                                />
                            </SectionView>
                            <SpaceS />
                            <SectionView noBorderBottomWidth noBorderTopWidth>
                                <BooleanItem
                                    style={{ flex: 1 }}
                                    title={getLabel('notification.label_allow_notify_following_customer_profile_update')}
                                    selected={notificationSetting.allowNotifyFollowingCustomerProfileUpdate}
                                    onChange={() => {
                                        onChange('allowNotifyFollowingCustomerProfileUpdate')
                                    }}
                                />
                            </SectionView>
                            <SpaceS />
                            <SectionView noBorderBottomWidth noBorderTopWidth>
                                <BooleanItem
                                    style={{ flex: 1 }}
                                    title={getLabel('notification.label_allow_notify_overdue_coming_task')}
                                    selected={notificationSetting.allowNotifyOverdueComingTask}
                                    onChange={() => {
                                        onChange('allowNotifyOverdueComingTask')
                                    }}
                                />
                            </SectionView>

                            <SpaceS />
                            <SectionView noBorderBottomWidth noBorderTopWidth>
                                <BooleanItem
                                    style={{ flex: 1 }}
                                    title={getLabel('notification.label_allow_notify_customer_birthday')}
                                    selected={notificationSetting.allowNotifyCustomerBirthday}
                                    onChange={() => {
                                        onChange('allowNotifyCustomerBirthday')
                                    }}
                                />
                            </SectionView>
                        </>
                    )
                }
            </Content>
            <IndicatorLoading loading={loading} />
        </>
    )
}