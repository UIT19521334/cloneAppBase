// Import libraries
import React, { useEffect, useRef, useState } from 'react';
import { TouchableHighlight, Modal, View, TouchableOpacity, Text, BackHandler } from 'react-native';
import { useDispatch } from 'react-redux';
import Contacts from 'react-native-contacts';
import Toast from 'react-native-root-toast';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Button, Input, CheckBox, FooterTab } from 'native-base';
// Import components
import { Body, Content, Header, Left, ListItem, Right, SectionView, SpaceS, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { getIcon, getLabel, widthResponse } from '../../utils/commons/commons';
import { PARAMS_ACTION_SHEET, PARAMS_ALERT } from '../../utils/Models/models';
import { showAlert } from '../../redux/actions/alert';
import { showActionSheet } from '../../redux/actions/actionSheet';
import Global from '../../Global';
import styles from './styles';

const ToolScreen = ({ route, navigation }) => {
    const [actionsSyncContacts, setActionsSyncContacts] = useState([
        {
            label: getLabel('tools.btn_sync_up'),
            icon: 'sync-alt'
        },
        {
            label: getLabel('tools.btn_sync_down'),
            icon: 'sync-alt'
        }
    ]);

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

    const showActionsSyncContacts = () => {
        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('common.label_option'),
            indexSelected: -1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actionsSyncContacts,
            onSelected: (index) => {
                if (index == 0) {
                    navigation.navigate('SyncContactsUp')

                }
                else {
                    navigation.navigate('SyncContactsDown')

                }
            }
        }
        dispatch(showActionSheet(params));
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
                        {getLabel('tools.title')}
                    </Title>
                </Body>
                <Right>

                </Right>
            </Header>
            <Content>
                <SpaceS />
                <SectionView
                    noPaddingHorizontal
                    noPaddingVertical
                >
                    {
                        Global.serverUrl?.includes('dev.cloudpro.vn') ? null : (
                            <ListItem
                                icon={'sync-alt'}
                                divider={true}
                                title={getLabel('tools.title_sync_device_contacts')}
                                style={{
                                    paddingHorizontal: 20
                                }}
                                onPress={() => {
                                    showActionsSyncContacts();
                                }}
                            />
                        )
                    }

                    {
                        (Global.checkVersionCRMExist('7.1.0.20220322.1200') && Global.packageFeatures?.EventManagement != '0') ? (
                            <ListItem
                                title={getLabel('scanCode.title_scan_code')}
                                icon={getIcon('QRCode')}
                                // isIconMenu
                                onPress={() => { navigation.navigate('ScanBarCode') }}
                                style={{
                                    paddingHorizontal: 20
                                }}
                                titleStyle={styles.titleStyle}
                            />
                        )
                            : null
                    }


                </SectionView>
            </Content>
        </>
    )
}
export default ToolScreen;
