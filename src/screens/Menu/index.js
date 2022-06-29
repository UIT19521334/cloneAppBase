/**
 * @file    : Menu/index.js
 * @author  : Manh Le
 * @date    : 2021-04-13
 * @purpose : create menu sidebar
 * @member  : Manh Le, Khiem ha
*/

import AsyncStorage from '@react-native-community/async-storage';
import remoteConfig from '@react-native-firebase/remote-config';
import React, { useState } from 'react';
import { DeviceEventEmitter, Dimensions, ScrollView, Text, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
//Import component
import Collapsible from '../../components/Collapsible';
import { Container, Content, ListItem, SectionView, SpaceS } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import Global from '../../Global';
import { showAlert } from '../../redux/actions/alert';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getIcon, getIconModule, getLabel, heightDevice, navigateTo } from '../../utils/commons/commons';
import { PARAMS_ALERT } from '../../utils/Models/models';
import styles from './styles';


const MenuScreen = ({ navigation }) => {

    const [showMore, setShowMore] = useState(false)
    const [spinValue, setSpinValue] = useState(new Animated.Value(0))
    const dispatch = useDispatch();

    const rotate = () => {
        // First set up animation 
        Animated.timing(
            spinValue,
            {
                toValue: showMore ? 0 : 1,
                duration: 200,
                easing: Easing.ease,
                useNativeDriver: true  // To make use of native driver for performance
            }
        ).start();
    }

    let spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['-90deg', '90deg']
    })
    const [userData, setUserData] = React.useState(Global.getUser(Global.user.id))
    const [loading, setLoading] = React.useState(false);
    const [configFeature, setConfigFeature] = React.useState({});


    const logOut = () => {
        setLoading(true);

        var params = {
            RequestAction: 'Logout',
        };

        Global.removeDeviceId(() => {
            //call api logout when remove device id successfully
            Global.callAPI(null, params, data => {

                setLoading(false);
                // navigation.closeDrawer()
                Global.exitApp();
                Toast.show(getLabel('sidebar.logout_success_msg'));
            }, error => {
                setLoading(false);
                Toast.show(getLabel('sidebar.logout_error_msg'));
            });
        });

    }
    const componentMounted = React.useRef(true);

    React.useEffect(() => {
        if (componentMounted.current) {
            remoteConfig()
            .setConfigSettings({
                minimumFetchIntervalMillis: 0,
            })
            .then(() => {
                remoteConfig()
                    .fetchAndActivate()
                    .then(fetchedRemotely => {
                        if (!fetchedRemotely) {
                            const config_feature = remoteConfig().getValue('config_feature');
                            console.log('config_feature', config_feature);
                            if (config_feature.asString()) {
                                const config = JSON.parse(config_feature.asString());
                                setConfigFeature(config);

                                AsyncStorage.setItem('config_feature', config_feature.asString(), () => {

                                });
                            }
                        } else {
                            AsyncStorage.getItem('config_feature')
                                .then((value) => {
                                    if (value) {
                                        const config = JSON.parse(value);
                                        setConfigFeature(config);
                                    }
                                })
                                .catch((err) => {

                                })
                        }
                    })
                    .catch((err) => {
                        console.log('Error: ', err);
                    })
            })
            .catch((err) => {
                console.log('Error: ', err);
            })
        }

        return () => {
            componentMounted.current = false;
        }
    }, [])

    return (
        <SafeAreaView
            edges={['right', 'top', 'left']}
            style={{ height: heightDevice }}>
            <Container>
                <SectionView
                    noBorderTopWidth
                    noPaddingHorizontal
                    style={{ marginBottom: 0 }}
                >
                    <ListItem
                        divider={false}
                        thumbnailDefault={!Global.user?.avatar}
                        thumbnailUri={Global.user?.avatar}
                        title={Global.user?.name}
                        subTitle={Global.user?.email1}
                        titleStyle={{ fontSize: 20, fontWeight: '700' }}
                        style={{
                            paddingHorizontal: 20
                        }}
                        onPress={() => { navigateTo('Profile'); }}
                        noArrowRight={true}
                    />
                </SectionView>
                <Content>
                    <ScrollView>
                        <View style={{ height: 8 }} />
                        <SectionView
                            noPaddingHorizontal
                            noBorderBottomWidth
                            noPaddingVertical
                        >
                            {
                                Global.getPermissionModule('Leads', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_leads')}
                                        icon={getIconModule('Leads')}
                                        isIconMenu
                                        badgeCount={Global.counters.leads_count ? parseInt(Global.counters.leads_count) : 0}
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('LeadList') }}
                                    />
                                ) : null
                            }

                            {
                                Global.getPermissionModule('Contacts', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_contacts')}
                                        icon={getIconModule('Contacts')}
                                        isIconMenu
                                        badgeCount={Global.counters.contacts_count ? parseInt(Global.counters.contacts_count) : 0}
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('ContactList') }}
                                    />
                                ) : null
                            }
                            {
                                Global.getPermissionModule('Accounts', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_organizations')}
                                        icon={getIconModule('Accounts')}
                                        isIconMenu
                                        badgeCount={Global.counters.accounts_count ? parseInt(Global.counters.accounts_count) : 0}
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('OrganizationList') }}
                                    />
                                ) : null
                            }
                            {
                                Global.getPermissionModule('Potentials', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_opportunities')}
                                        icon={getIconModule('Potentials')}
                                        isIconMenu
                                        badgeCount={Global.counters.opportunities_count ? parseInt(Global.counters.opportunities_count) : 0}
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('OpportunityList') }}
                                    />
                                ) : null
                            }

                            {
                                Global.getPermissionModule('HelpDesk', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_tickets')}
                                        icon={getIconModule('HelpDesk')}
                                        badgeCount={Global.counters.tickets_count ? parseInt(Global.counters.tickets_count) : 0}
                                        isIconMenu
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('TicketList') }}
                                    />
                                ) : null
                            }
                            {/* {
                                Global.getPermissionModule('Report', null) ? ( */}
                            <ListItem
                                title={getLabel('common.title_report')}
                                icon={getIconModule('Report')}
                                isIconMenu
                                style={{
                                    paddingHorizontal: 20
                                }}
                                titleStyle={styles.titleStyle}
                                onPress={() => { navigateTo('ReportList') }}
                            />
                            {/* ) : null
                            } */}

                            {
                                Global.getPermissionModule('Faq', null) ? (
                                    <ListItem
                                        title={getLabel('common.title_faq')}
                                        icon={getIconModule('Faq')}
                                        isIconMenu
                                        style={{
                                            paddingHorizontal: 20
                                        }}
                                        titleStyle={styles.titleStyle}
                                        onPress={() => { navigateTo('FaqList') }}
                                        divider={(Global.isActiveFeature('document') || Global.isVersionCRMNew)}
                                    />
                                ) : null
                            }
                        </SectionView>

                        {
                            (Global.isActiveFeature('document') || Global.isVersionCRMNew) ?
                                (
                                    <SectionView
                                        noBorderTopWidth
                                        noPaddingHorizontal
                                        noPaddingVertical
                                    >
                                        <Collapsible
                                            wrapperStyle={styles.wrapperCollapsibleList}
                                            buttonContent={
                                                <View style={styles.collapseButton}>
                                                    <Text allowFontScaling={true} style={styles.collapseText}>{!showMore ? getLabel('common.btn_show_less') : getLabel('common.btn_show_more')}</Text>
                                                    <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: !showMore ? -10 : -0 }}>
                                                        <Icon name='angle-right' style={[styles.collapseIcon]} />
                                                    </Animated.View>
                                                </View>
                                            }
                                            maxHeight={54 * 3}
                                            buttonPosition={'bottom'}
                                            onToggle={(collapsed) => { setShowMore(collapsed); rotate() }}
                                        >
                                            <ListItem
                                                title={getLabel('common.title_related_document')}
                                                icon={'folder'}
                                                isIconMenu
                                                style={{
                                                    paddingHorizontal: 20
                                                }}
                                                titleStyle={styles.titleStyle}
                                                onPress={() => { navigateTo('DocumentListModule') }}
                                            />

                                            {/* <ListItem
                                    title={getLabel('common.title_report')}
                                    icon={getIconModule('Report')}
                                    style={{
                                        paddingHorizontal: 20
                                    }}
                                    titleStyle={styles.titleStyle}
                                    onPress={() => { navigateTo('ReportList') }}
                                />

                                <ListItem
                                    title={getLabel('common.title_faq')}
                                    icon={getIconModule('Faq')}
                                    style={{
                                        paddingHorizontal: 20
                                    }}
                                    titleStyle={styles.titleStyle}
                                    onPress={() => { navigateTo('FaqList') }}
                                /> */}

                                            {/* <ListItem
                                                title={getLabel('scanCode.title_scan_code')}
                                                icon={getIcon('QRCode')}
                                                isIconMenu
                                                onPress={() => { navigateTo('ScanBarCode') }}
                                                style={{
                                                    paddingHorizontal: 20
                                                }}
                                                titleStyle={styles.titleStyle}
                                            /> */}
                                        </Collapsible>
                                    </SectionView>

                                )
                                : null
                        }

                        <SpaceS />
                        <SectionView
                            noPaddingHorizontal
                            noPaddingVertical
                        >

                            <ListItem
                                title={getLabel('common.title_tools')}
                                icon={getIcon('Tool')}
                                isIconMenu
                                style={{
                                    paddingHorizontal: 20,
                                }}
                                titleStyle={styles.titleStyle}
                                onPress={() => { navigateTo('Tool') }}
                            />

                            <ListItem
                                title={getLabel('common.title_settings')}
                                icon={getIcon('Setting')}
                                isIconMenu
                                style={{
                                    paddingHorizontal: 20
                                }}
                                titleStyle={styles.titleStyle}
                                onPress={() => { navigateTo('Setting') }}
                            />
                            {/* <View style={{ height: 3 }} /> */}
                            <ListItem
                                title={getLabel('common.title_about_us')}
                                icon={getIcon('Profile')}
                                isIconMenu
                                style={{
                                    paddingHorizontal: 20
                                }}
                                titleStyle={styles.titleStyle}
                                onPress={() => { navigateTo('About') }}
                                divider={false}
                            />
                        </SectionView>

                        <SpaceS />
                        <SectionView
                            noPaddingHorizontal
                            noPaddingVertical
                        >
                            <ListItem
                                title={getLabel('setting.label_sign_out')}
                                icon={'sign-out-alt'}
                                iconColor={Colors.functional.dangerous}
                                isIconMenu
                                style={{
                                    paddingHorizontal: 20
                                }}
                                noArrowRight={true}
                                divider={false}
                                titleStyle={{
                                    color: Colors.functional.dangerous,
                                    ...styles.titleStyle
                                }}
                                onPress={() => {
                                    navigation.closeDrawer();
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
                                                    // logOut()
                                                    DeviceEventEmitter.emit('Application.Logout');
                                                }
                                            }
                                        ]
                                    }

                                    dispatch(showAlert?.(params));
                                }}
                            />
                        </SectionView>

                    </ScrollView>
                </Content>

            </Container>

            <IndicatorLoading loading={loading} />
        </SafeAreaView>
    );

}

export default MenuScreen;

