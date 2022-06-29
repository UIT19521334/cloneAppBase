import React, { useState } from 'react'
import { TouchableHighlight, Text, TouchableOpacity, Image, Modal, Dimensions, BackHandler } from 'react-native'
import { Header, Left, Right, Title, IconRight, Content, LargeHeader, Body, ImageViewRounded } from '../../components/CustomComponentView';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Colors } from '../../themes/colors/Colors';
import { getIcon, getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import Global from '../../Global'
import IndicatorLoading from '../../components/IndicatorLoading'
import Toast from 'react-native-root-toast'
import { Box } from '../../themes/themes';
import { Input, Item, Label } from 'native-base';

const InputItem = ({ title = '', value = '' }) => {
    return (
        <Box
            flex={1}
            paddingHorizontal='l'
            backgroundColor='white1'
            style={{
                paddingTop: 18
            }}
        >
            <Item
                stackedLabel
            >
                <Label
                    style={{
                        fontSize: 14,
                        color: Colors.black.black1
                    }}
                >
                    {title || ''}
                </Label>
                <Input
                    value={value}
                    disabled={true}
                />
            </Item>
        </Box>
    )
}

export function ProfileView({ navigation }) {
    const [editMode] = useState(false);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePath] = useState(require('../../assets/images/avatar.jpg'))
    const [userInfo, setUserInfo] = useState({ ...Global.user });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );

        return () => backHandler.remove();
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // loadData()
            setUserInfo({ ...Global.user })
        });
        return unsubscribe;
    }, [navigation])

    return (
        <>
            <IndicatorLoading loading={loading} />
            <LargeHeader>
                <Header noBorder>
                    <Left>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Icon name={getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>
                    </Left>
                    <Right>
                        <IconRight>
                            <TouchableOpacity onPress={() => { navigation.navigate('ProfileForm', { userData: userInfo }) }}>
                                <Title allowFontScaling={true} fontWeight={400} color={Colors.functional.primary} fontSize={18}>{getLabel('common.btn_edit')}</Title>
                            </TouchableOpacity>
                        </IconRight>
                    </Right>
                </Header>
                <Header noBorder>
                    <Body>
                        <ImageViewRounded
                            width={100}
                            height={100}
                            onPress={() => { setImagePreviewVisible(true) }}
                        >
                            <Image
                                source={userInfo?.avatar ? { uri: userInfo?.avatar } : imagePath}
                                style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#f8f8f8' }}
                                progressiveRenderingEnabled={true}
                            />
                        </ImageViewRounded>

                        {
                            userInfo?.title ?
                                (
                                    <Text allowFontScaling={true} style={{ fontSize: 13, color: Colors.black.black3, paddingVertical: 5 }}>{userInfo?.title}</Text>

                                )
                                : null
                        }

                    </Body>
                </Header>
            </LargeHeader>
            <Content style={{ backgroundColor: '#fff' }}>
                <InputItem
                    title={getLabel('profile.label_user_name')}
                    value={userInfo?.user_name || ''}
                />
                <InputItem
                    title={getLabel('profile.label_full_name')}
                    value={userInfo?.name}
                />
                <InputItem
                    title={getLabel('profile.label_mobile_phone')}
                    value={userInfo?.phone_mobile || ''}
                />
                <InputItem
                    title={getLabel('profile.label_office_phone')}
                    value={userInfo?.phone_work || ''}
                />
                <InputItem
                    title={getLabel('profile.label_email')}
                    value={userInfo?.email1 || ''}
                />
                <InputItem
                    title={getLabel('profile.label_address')}
                    value={userInfo?.address_street || ''}
                />

            </Content>

            <Modal
                visible={imagePreviewVisible}
                transparent={false}
                style={{ padding: 0, width: widthDevice, height: heightDevice }}
                onRequestClose={() => { setImagePreviewVisible(false) }}>

                {
                    userInfo?.avatar ?
                        (
                            <ImageViewer imageUrls={[{ url: userInfo?.avatar }]} />

                        )
                        : (
                            <Box
                                flex={1}
                                backgroundColor={'black1'}
                                alignItems='center'
                                justifyContent='center'
                            >
                                <Image
                                    source={imagePath}
                                    style={{
                                        resizeMode: 'center',
                                        width: widthResponse,
                                        height: heightDevice
                                    }}
                                />
                            </Box>
                        )
                }
                <TouchableOpacity
                    transparent
                    style={{ position: 'absolute', top: 30, right: 25 }}
                    onPress={() => { setImagePreviewVisible(false) }}
                >
                    <Icon style={{ color: '#fff', fontSize: 29 }} name='times-circle' />
                </TouchableOpacity>
            </Modal>
        </>
    )
}


