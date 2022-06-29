import { Content } from 'native-base';
import React from 'react'
import { DeviceEventEmitter, StyleSheet, TouchableHighlight, View } from 'react-native'
import { Body, BooleanItem, Header, IconRight, IconViewLeft, LBText, Left, ListItem, LText, Right, SpaceS, Title } from '../../components/CustomComponentView';
import Global from '../../Global'
import { Colors } from '../../themes/colors/Colors';
import { Box, Text } from '../../themes/themes';
import { getLabel } from '../../utils/commons/commons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from '../../themes/Icons/CustomIcon';
import AsyncStorage from '@react-native-community/async-storage';
import IndicatorLoading from '../../components/IndicatorLoading';
import Toast from 'react-native-root-toast';

export default function HomeSettings() {
    const [config, setConfig] = React.useState({});
    const [isRender, setRender] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const route = useRoute();
    const navigation = useNavigation();
    React.useEffect(() => {

        const subscriber = navigation.addListener('focus', () => {
            AsyncStorage.getItem('homeSettings', (err, res) => {
                if (err) {
                    return;
                }

                if (res) {
                    const homeSettings = JSON.parse(res)
                    console.log('homeSettings', res);

                    setConfig({ ...homeSettings });
                    setTimeout(() => {
                        setRender(true)
                    }, 500);
                }
            })
        })

        return () => {
            subscriber()
        }
    }, []);

    React.useEffect(() => {
        console.log('homeSettings', config);

    }, [config])

    const saveSettings = () => {
        const params = {
            RequestAction: 'SaveProfile',
            Data: {
                home_screen_config: config
            }
        }
        setLoading(true);
        Global.callAPI(null, params, data => {
            setLoading(false);
            if (parseInt(data.success) === 1) {
                Global.setUser(data?.user_info);
                Global.saveHomeSetting(data?.home_screen_config)
                setTimeout(() => {
                    Global.saveCacheUserInfo();
                    if (route.params?.preScene == 'HomeScene') {
                        DeviceEventEmitter.emit('User.FocusHomeScreen')
                        navigation.goBack()
                    } else {
                        navigation.goBack()
                    }
                }, 500)
                Toast.show(getLabel('common.msg_edit_success', { module: getLabel('setting.label_setting_home').toLowerCase() }));

            }
            else {
                setLoading(false)
                Toast.show(getLabel('common.msg_edit_error', { module: getLabel('setting.label_setting_home').toLowerCase() }));
            }

        },
            err => {
                setLoading(false);
                Toast.show(getLabel('common.msg_connection_error'));

            }
        )

    }

    return (
        <>
            <IndicatorLoading loading={loading} />
            <Header
            >
                <Left>
                    <TouchableHighlight
                        activeOpacity={0.2}
                        underlayColor={Colors.white.white2}
                        style={{ marginLeft: 12 }}
                        onPress={() => {
                            if (route.params?.preScene == 'HomeScene') {
                                DeviceEventEmitter.emit('User.FocusHomeScreen')
                                navigation.goBack()
                            } else {
                                navigation.goBack()
                            }
                        }}
                    >
                        {/* <Icon
                            name='long-arrow-left'
                            size={22}
                        /> */}
                        <LBText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LBText>
                    </TouchableHighlight>
                </Left>
                <Body>
                    <Title allowFontScaling={true} >{getLabel('setting.label_setting_home')}</Title>
                </Body>
                <Right>
                    <IconViewLeft
                        style={{ paddingRight: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 12 }}
                        onPress={() => saveSettings()}
                    >
                        <LBText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_save')}</LBText>
                    </IconViewLeft>
                </Right>
            </Header>

            {
                !isRender ? null : (
                    <Content>

                        <Box
                            paddingHorizontal='l'
                            paddingVertical='l'
                        >
                            <Text
                                fontWeight='bold'
                                color='black2'
                            >
                                {getLabel('common.title_performance')}
                            </Text>
                        </Box>

                        <Box
                            backgroundColor='white1'
                            paddingHorizontal='l'
                            paddingLeft='xl'
                            paddingVertical='m'
                        >
                            {
                                Global.getPermissionModule('SalesOrder', null) ? (
                                    <BooleanItem
                                        title={getLabel('home.label_tab_sales')}
                                        selected={config?.performance?.sales == '1'}
                                        onChange={() => {
                                            const configTemp = { ...config };
                                            configTemp.performance.sales = config?.performance?.sales == '1' ? '0' : '1';
                                            setConfig(configTemp);
                                            // Global.homeSettings = configTemp;
                                        }}
                                    />
                                ) : null
                            }

                            {
                                Global.getPermissionModule('Leads', null) ? (
                                    <>
                                        <SpaceS />

                                        <BooleanItem
                                            title={getLabel('home.label_tab_new_lead')}
                                            selected={config?.performance?.new_lead == '1'}
                                            onChange={() => {
                                                const configTemp = { ...config };
                                                configTemp.performance.new_lead = config?.performance?.new_lead == '1' ? '0' : '1';
                                                setConfig(configTemp);
                                                // Global.homeSettings = configTemp;
                                            }}
                                        />
                                    </>
                                ) : null
                            }

                            {
                                Global.getPermissionModule('SalesOrder', null) ? (
                                    <>
                                        <SpaceS />

                                        <BooleanItem
                                            title={getLabel('home.label_tab_deal_won')}
                                            selected={config?.performance?.deal_won == '1'}
                                            onChange={() => {
                                                const configTemp = { ...config };
                                                configTemp.performance.deal_won = config?.performance?.deal_won == '1' ? '0' : '1';
                                                setConfig(configTemp);
                                                // Global.homeSettings = configTemp;
                                            }}
                                        />
                                    </>
                                )
                                    : null
                            }
                            {
                                Global.getPermissionModule('SalesOrder', null) ? (
                                    <>
                                        <SpaceS />

                                        <BooleanItem
                                            title={getLabel('home.label_tab_deal_size')}
                                            selected={config?.performance?.deal_size == '1'}
                                            onChange={() => {
                                                const configTemp = { ...config };
                                                configTemp.performance.deal_size = config?.performance?.deal_size == '1' ? '0' : '1';
                                                setConfig(configTemp);
                                                // Global.homeSettings = configTemp;
                                            }}
                                        />
                                    </>
                                )
                                    : null
                            }

                            {
                                Global.getPermissionModule('Leads', null) ? (
                                    <>
                                        <SpaceS />

                                        <BooleanItem
                                            title={getLabel('home.label_tab_conversion_rate')}
                                            selected={config?.performance?.conversion_rate == '1'}
                                            onChange={() => {
                                                const configTemp = { ...config };
                                                configTemp.performance.conversion_rate = config?.performance?.conversion_rate == '1' ? '0' : '1';
                                                setConfig(configTemp);
                                                // Global.homeSettings = configTemp;
                                            }}
                                        />
                                    </>
                                ) : null
                            }

                            {
                                Global.isVersionCRMNew ? (
                                    <Box paddingRight='m'>
                                        <ListItem
                                            title={getLabel('home_settings.filter_by_label')}
                                            divider={false}
                                            selectedText={config?.performance?.filter_by == 'all' ? getLabel('tools.all_label') : getLabel('tools.mine_label')}
                                            selectedTextStyle={{}}
                                            optionSelected={config?.performance?.filter_by == 'all' ? {
                                                key: 'all',
                                                label: getLabel('tools.all_label'),
                                                value: 'all'
                                            } : {
                                                key: 'mine',
                                                label: getLabel('tools.mine_label'),
                                                value: 'mine'
                                            }}
                                            optionsSelect={[{
                                                key: 'all',
                                                label: getLabel('tools.all_label'),
                                                value: 'all'
                                            }, {
                                                key: 'mine',
                                                label: getLabel('tools.mine_label'),
                                                value: 'mine'
                                            }]}
                                            onSelected={(value) => {
                                                const configTemp = { ...config };
                                                configTemp.performance.filter_by = value;
                                                setConfig(configTemp);
                                            }}
                                            titleStyle={{
                                                fontSize: 15
                                            }}
                                        />
                                    </Box>

                                ) : null
                            }
                        </Box>

                        <Box
                            paddingHorizontal='l'
                            paddingVertical='l'
                        >
                            <Text
                                fontWeight='bold'
                                color='black2'
                            >
                                {getLabel('common.title_upcoming_activities')}
                            </Text>
                        </Box>

                        <Box
                            backgroundColor='white1'
                            paddingHorizontal='l'
                            paddingLeft='xl'
                            paddingVertical='m'
                        >
                            <BooleanItem
                                title={getLabel('common.title_upcoming_activities')}
                                selected={config?.incoming_activity == '1'}
                                onChange={() => {
                                    const configTemp = { ...config };
                                    configTemp.incoming_activity = config.incoming_activity == '1' ? '0' : '1';
                                    setConfig(configTemp);
                                    // Global.homeSettings = configTemp;
                                }}
                            />
                        </Box>


                        {
                            Global.isVersionCRMNew ? (
                                <>
                                    <Box
                                        paddingHorizontal='l'
                                        paddingVertical='l'
                                    >
                                        <Text
                                            fontWeight='bold'
                                            color='black2'
                                        >
                                            {getLabel('common.title_ticket_open')}
                                        </Text>
                                    </Box>

                                    <Box
                                        backgroundColor='white1'
                                        paddingHorizontal='l'
                                        paddingLeft='xl'
                                        paddingVertical='m'
                                    >
                                        <BooleanItem
                                            title={'Hiện ' + getLabel('common.title_ticket_open').toLowerCase()}
                                            selected={config?.ticket_open?.is_show == '1'}
                                            onChange={() => {
                                                const configTemp = { ...config };
                                                configTemp.ticket_open.is_show = config?.ticket_open?.is_show == '1' ? '0' : '1';
                                                setConfig(configTemp);
                                            }}
                                        />

                                        <Box paddingRight='m'>
                                            <ListItem
                                                title={getLabel('home_settings.create_time')}
                                                divider={false}
                                                selectedText={config?.ticket_open?.create_time == 'DESC' ? getLabel('home_settings.desc_label') : getLabel('home_settings.asc_label')}
                                                selectedTextStyle={{}}
                                                optionSelected={config?.ticket_open?.create_time == 'DESC' ? {
                                                    key: 'DESC',
                                                    label: getLabel('home_settings.desc_label'),
                                                    value: 'DESC'
                                                } : {
                                                    key: 'ASC',
                                                    label: getLabel('home_settings.asc_label'),
                                                    value: 'ASC'
                                                }}
                                                optionsSelect={[{
                                                    key: 'DESC',
                                                    label: getLabel('home_settings.desc_label'),
                                                    value: 'DESC'
                                                }, {
                                                    key: 'ASC',
                                                    label: getLabel('home_settings.asc_label'),
                                                    value: 'ASC'
                                                }]}
                                                onSelected={(value) => {
                                                    const configTemp = { ...config };
                                                    configTemp.ticket_open.filter_by = value;
                                                    setConfig(configTemp);
                                                    // Global.homeSettings = configTemp;
                                                }}
                                                titleStyle={{
                                                    fontSize: 15
                                                }}
                                            />
                                        </Box>

                                        <Box paddingRight='m'>
                                            <ListItem
                                                title={getLabel('home_settings.priority_label')}
                                                divider={false}
                                                selectedText={config?.ticket_open?.priority == 'DESC' ? getLabel('home_settings.desc_label') : getLabel('home_settings.asc_label')}
                                                selectedTextStyle={{}}
                                                optionSelected={config?.ticket_open?.priority == 'DESC' ? {
                                                    key: 'DESC',
                                                    label: getLabel('home_settings.desc_label'),
                                                    value: 'DESC'
                                                } : {
                                                    key: 'ASC',
                                                    label: getLabel('home_settings.asc_label'),
                                                    value: 'ASC'
                                                }}
                                                optionsSelect={[{
                                                    key: 'DESC',
                                                    label: getLabel('home_settings.desc_label'),
                                                    value: 'DESC'
                                                }, {
                                                    key: 'ASC',
                                                    label: getLabel('home_settings.asc_label'),
                                                    value: 'ASC'
                                                }]}
                                                onSelected={(value) => {
                                                    const configTemp = { ...config };
                                                    configTemp.ticket_open.priority = value;
                                                    setConfig(configTemp);
                                                    // Global.homeSettings = configTemp;
                                                }}
                                                titleStyle={{
                                                    fontSize: 15
                                                }}
                                            />
                                        </Box>

                                        <Box paddingRight='m'>
                                            <ListItem
                                                title={getLabel('home_settings.filter_by_label')}
                                                divider={false}
                                                selectedText={config?.ticket_open?.filter_by == 'all' ? getLabel('tools.all_label') : getLabel('tools.mine_label')}
                                                selectedTextStyle={{}}
                                                optionSelected={config?.ticket_open?.filter_by == 'all' ? {
                                                    key: 'all',
                                                    label: getLabel('tools.all_label'),
                                                    value: 'all'
                                                } : {
                                                    key: 'mine',
                                                    label: getLabel('tools.mine_label'),
                                                    value: 'mine'
                                                }}
                                                optionsSelect={[{
                                                    key: 'all',
                                                    label: getLabel('tools.all_label'),
                                                    value: 'all'
                                                }, {
                                                    key: 'mine',
                                                    label: getLabel('tools.mine_label'),
                                                    value: 'mine'
                                                }]}
                                                onSelected={(value) => {
                                                    const configTemp = { ...config };
                                                    configTemp.ticket_open.filter_by = value;
                                                    setConfig(configTemp);
                                                    // Global.homeSettings = configTemp;
                                                }}
                                                titleStyle={{
                                                    fontSize: 15
                                                }}
                                            />
                                        </Box>

                                    </Box>
                                </>
                            )
                                : null
                        }

                    </Content>

                )
            }
        </>
    )
}

const styles = StyleSheet.create({})
