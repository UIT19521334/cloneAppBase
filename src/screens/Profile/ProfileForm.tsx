import React, { useState } from 'react';
import { BackHandler, Dimensions, Image, Keyboard, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Body, Box, Header, IconRight, ImageViewRounded, InputItem, LargeHeader, Left, Right, Title } from '../../components/CustomComponentView';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import Global from '../../Global'
import { getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import { Content } from 'native-base';
import IndicatorLoading from '../../components/IndicatorLoading';
import Toast from 'react-native-root-toast';
import ImagePicker from 'react-native-image-crop-picker';
import { Platform } from 'react-native';

export function ProfileForm({ route, navigation }) {
    const [loading, setLoading] = useState(false);
    const [avatarChanged, setAvatarChanged] = useState(false);
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagePath, setImagePath] = useState('')
    const [userInfo, setUserInfo] = useState({})
    const imageDefault = require('../../assets/images/avatar.jpg');
    const [isRendered, setRendered] = useState(false)

    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => {
            backHandler.remove();
        }
    }, [])

    React.useEffect(() => {
        setUserInfo({ ...route.params?.userData || {} });
        setImagePath(route.params?.userData?.avatar || '');
        setRendered(true)
        return () => { }
    }, [route])


    const showOptionChangeAvatar = () => {
        var options = [
            getLabel('profile.btn_take_photo_option'),
            getLabel('profile.btn_select_photo_from_album_option'),
            getLabel('common.btn_cancel')
        ];

        var DESTRUCTIVE_INDEX = 0;
        var CANCEL_INDEX = 2;

        ActionSheet.showActionSheetWithOptions({
            options: options,
            cancelButtonIndex: CANCEL_INDEX,
            destructiveButtonIndex: DESTRUCTIVE_INDEX,
            tintColor: 'blue'
        },
            (buttonIndex) => {
                if (buttonIndex == 0) {
                    takePhoto();
                }

                if (buttonIndex == 1) {
                    selectPhotoFromAlbum()
                }
            });

    }

    const takePhoto = () => {
        if (!Global.checkUserAgent()) {
            ImagePicker.openCamera({
                cropping: true,
                width: widthResponse,
                height: widthResponse,
                compressImageQuality: 0.75,
            }).then(image => {
                console.log(image.path);
                updateAvatar(image.path);
            })
            .catch((err) => {
                console.log('takePhoto error: ', err);
            });;
        }
        else {

        }
    }

    const selectPhotoFromAlbum = () => {
        ImagePicker.openPicker({
            multiple: false,
            cropping: true,
            width: 400,
            height: 400
        }).then(image => {
            updateAvatar(image.path);
        })
        .catch((err) => {
            console.log('selectPhotoFromAlbum error: ', err);
        });
    }

    const updateAvatar = (image) => {
        setImagePath(image)
        setAvatarChanged(true);
    }


    const onChangeValue = (key: string, value: any) => {
        const user = { ...userInfo };
        user[key] = value;
        setUserInfo(user)
    }

    const saveProfile = () => {
        setLoading(true)

        var params = {};
        if (avatarChanged) {
            params = {
                RequestAction: 'SaveProfile',
                Data: {
                    first_name: userInfo?.first_name,
                    last_name: userInfo?.last_name,
                    phone_work: userInfo?.phone_work,
                    phone_mobile: userInfo?.phone_mobile,
                    email1: userInfo?.email1,
                    address_street: userInfo?.address_street,
                },
                Avatar: { uri: Platform.OS === 'android' ? 'file://' + imagePath : imagePath, name: 'image.jpg', type: 'image/jpeg' },
                IsMultiPartData: 1
            };
        }
        else {
            params = {
                RequestAction: 'SaveProfile',
                Data: {
                    first_name: userInfo?.first_name,
                    last_name: userInfo?.last_name,
                    phone_work: userInfo?.phone_work,
                    phone_mobile: userInfo?.phone_mobile,
                    email1: userInfo?.email1,
                    address_street: userInfo?.address_street,
                },
            };
        }

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                Global.setUser(data.user_info);
                setAvatarChanged(false)
                setLoading(false)
                setTimeout(() => {
                    Global.saveCacheUserInfo();
                    navigation.goBack();
                }, 500)

                Toast.show(getLabel('common.msg_edit_success', { module: getLabel('profile.title').toLowerCase() }));
            }
            else {
                setLoading(false)
                Toast.show(getLabel('common.msg_edit_error', { module: getLabel('profile.title').toLowerCase() }));
            }

        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_edit_error', { module: getLabel('profile.title').toLowerCase() }));
            logOut();
        });
    }

    const logOut = () => {

		var params = {
			RequestAction: 'Logout',
		};

		Global.removeDeviceId(() => {
			//call api logout when remove device id successfully
			Global.callAPI(null, params, data => {
				Global.exitApp();
			}, error => {
			});
		});
	}

    if (!isRendered) {
        return <></>;
    }
    return (
        <>
            <LargeHeader
                
                onTouchEnd={() => { Keyboard.dismiss() }}
            >
                <Header
                   
                    noBorder>
                    <Left>
                        <TouchableOpacity
                            style={{ marginLeft: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <Title allowFontScaling={true}
                                fontWeight={400}
                                fontSize={18}
                                color={Colors.functional.primary}>
                                {getLabel('common.btn_cancel')}
                            </Title>
                        </TouchableOpacity>
                    </Left>
                    <Right>
                        <IconRight>
                            <TouchableOpacity onPress={() => { saveProfile() }}>
                                <Title allowFontScaling={true}
                                    fontWeight={400}
                                    fontSize={18}
                                    color={Colors.functional.primary}>
                                    {getLabel('common.btn_save')}
                                </Title>
                            </TouchableOpacity>
                        </IconRight>
                    </Right>
                </Header>
                <Header
                    style={{
                        width: widthResponse
                    }}
                    noBorder
                >
                    <Body>
                        <ImageViewRounded
                            width={100}
                            height={100}
                            onPress={() => { setImagePreviewVisible(true) }}
                        >
                            <Image
                                source={imagePath ? { uri: imagePath } : imageDefault}
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    borderWidth: 1,
                                    borderColor: '#f8f8f8',
                                    resizeMode: 'cover'
                                }}
                            />

                            <TouchableOpacity
                                onPress={() => { showOptionChangeAvatar(); }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: -0,
                                    zIndex: 1000,
                                    width: 35,
                                    height: 35,
                                    borderRadius: 35 / 2,
                                    backgroundColor: Colors.white.white5,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Icon name='camera' color={Colors.functional.dangerous} size={18} />
                            </TouchableOpacity>
                        </ImageViewRounded>



                    </Body>
                </Header>
            </LargeHeader>

            <Content style={{ backgroundColor: '#fff' }}>

                <InputItem
                    title={getLabel('profile.label_last_name')}
                    value={userInfo?.last_name || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('last_name', value);
                    }}
                />

                <InputItem
                    title={getLabel('profile.label_first_name')}
                    value={userInfo?.first_name || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('first_name', value);
                    }}
                />

                <InputItem
                    title={getLabel('profile.label_mobile_phone')}
                    value={userInfo?.phone_mobile || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('phone_mobile', value);
                    }}
                />
                <InputItem
                    title={getLabel('profile.label_office_phone')}
                    value={userInfo?.phone_work || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('phone_work', value);
                    }}
                />
                <InputItem
                    title={getLabel('profile.label_email')}
                    value={userInfo?.email1 || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('email1', value);
                    }}
                />

                <InputItem
                    title={getLabel('profile.label_address')}
                    value={userInfo?.address_street || ''}
                    isEdit={true}
                    onValueChange={(value) => {
                        onChangeValue('address_street', value);
                    }}
                />

            </Content>

            <IndicatorLoading loading={loading} />

            <Modal
                visible={imagePreviewVisible}
                transparent={false}
                style={{ padding: 0, width: widthDevice, height: heightDevice }}
                onRequestClose={() => { setImagePreviewVisible(false) }}>

                {
                    imagePath ?
                        (
                            <ImageViewer imageUrls={[{ url: imagePath }]} />

                        )
                        : (
                            <Box
                                flex={1}
                                backgroundColor={'black1'}
                                alignItems='center'
                                justifyContent='center'
                            >
                                <Image
                                    source={imageDefault}
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

const styles = StyleSheet.create({})
