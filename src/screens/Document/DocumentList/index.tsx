import { useNavigation, useRoute } from '@react-navigation/native';
import { Content, ListItem, Icon as NativeBaseIcon } from 'native-base';
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, Image, FlatList, Linking, PermissionsAndroid, Platform, InteractionManager } from 'react-native'
import { Header, ItemListViewContent, LBText, Left, NBText, NText, SectionView, SpaceHS, SText } from '../../../components/CustomComponentView'
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign';

import { getIcon, getIconModule, getLabel, widthResponse } from '../../../utils/commons/commons';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux'
import FileViewer from 'react-native-file-viewer';
import Toast from 'react-native-root-toast';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Share from 'react-native-share';
import { PARAMS_ACTION_SHEET } from '../../../utils/Models/models';
import { showActionSheet } from '../../../redux/actions/actionSheet';
export default function DocumentList() {
    const navigation = useNavigation();
    const route = useRoute();
    const [documents, setDocuments] = React.useState([]);
    const [isReadyRender, setReadyRender] = React.useState(false);
    const [actionsMore, setActionsMore] = React.useState([
        {
            label: getLabel('document.btn_view'),
            icon: 'eye',
            key: 'edit'
        },
        {
            label: getLabel('document.btn_download'),
            icon: 'download',
            key: 'mail'
        },
        {
            label: getLabel('common.label_menu_send_email'),
            icon: getIcon('Mail'),
            key: 'duplicate'
        }

    ]);
    const dispatch = useDispatch()

    React.useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setReadyRender(true);
            setTimeout(() => {
                const documentList = route?.params?.documentList || [];
                let res = [];
                if (documentList && documentList.length > 0) {
                    res = documentList.map((doc) => {
                        const itemTemp = { ...doc };
                        checkExisted(doc?.smownerid + '-' + doc?.filename)
                            .then((value) => {
                                // const localFile = `${RNFS.DocumentDirectoryPath}/${doc?.smownerid + '-' + doc?.filename}`;

                                // Share.open({
                                //     title: doc?.filename,
                                //     url: localFile,
                                //     saveToFiles: true
                                // })
                                //     .then((value) => {
                                //         console.error('Response: ', value);
                                //     })
                                //     .catch((err) => {
                                //         console.error('Error: ', err);
                                //     });
                                itemTemp.isDownload = value;
                            })
                            .catch(() => {
                                itemTemp.isDownload = false;
                            })
                        console.log('checkExisted Value: ', itemTemp);
                        return itemTemp
                    });
                    setDocuments(res)
                }
                else {
                    setDocuments([]);
                }
            }, 500);
        });

        return () => {
        }
    }, []);

    const requestExternalStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            return granted;
        } catch (err) {
            // console.error('Failed to request permission ', err);
            return null;
        }
    };

    const downloadFile = async (url: string, name: string, indexSelected: number) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;
        console.log('File path: ', localFile);
        if (await RNFS.exists(localFile)) {
            console.log('File exists');
            FileViewer.open(localFile)
            return;
        }
        const options = {
            fromUrl: url,
            toFile: localFile,
            begin: (res) => {

            },
            progress: (res) => {

            }
        };

        if (Platform.OS == 'android') {
            requestExternalStoragePermission()
                .then((res) => {
                    if (res == 'granted') {
                        RNFS.downloadFile(options).promise
                            .then(() => FileViewer.open(localFile))
                            .then(() => {
                                // success
                                Toast.show(getLabel('common.msg_download_successful'));
                                const docsTemp = [...documents];
                                docsTemp[indexSelected].isDownload = true;
                                setDocuments(docsTemp);
                            })
                            .catch(error => {
                                // error
                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            });
                    }
                    else {
                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                    }
                })
                .catch(() => {
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                })
        } else {
            RNFS.downloadFile(options).promise
                .then(() => {
                    Share.open({
                        title: name,
                        url: localFile,
                        saveToFiles: true
                    })
                        .then(res => {
                            console.log('save success');
                        })
                        .catch(err => {
                            console.log('save err: ', err);
                        });
                })
                .then(() => FileViewer.open(localFile))
                .then(() => {
                    // success
                    Toast.show(getLabel('common.msg_download_successful'));
                    const docsTemp = [...documents];
                    docsTemp[indexSelected].isDownload = true;
                    setDocuments(docsTemp);
                })
                .catch(error => {
                    // error
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                });
        }


    }

    const checkExisted = async (fileName: string) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        return await RNFS.exists(localFile);
    }

    const remakeURL = (url: string, type: string) => {
        console.log('URL from type: ', type);

        if (type == 'url') {
            return url;
        }
        return `${url}&client=Mobile&token=${Global.token}`
    }

    const shareFile = async (url, name, indexSelected: number) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;
        console.log('File path: ', localFile);
        if (await RNFS.exists(localFile)) {
            console.log('File exists');
            Share.open({
                'filename': name,
                'title': name,
                'url': Platform.OS == 'android' ? `file://${localFile}` : localFile,
            })
            return;
        }
        const options = {
            fromUrl: url,
            toFile: localFile
        };

        if (Platform.OS == 'android') {
            requestExternalStoragePermission()
                .then((res) => {
                    if (res == 'granted') {
                        RNFS.downloadFile(options).promise
                            .then(() => {
                                Share.open({
                                    'filename': name,
                                    'title': name,
                                    'url': Platform.OS == 'android' ? `file://${localFile}` : localFile,
                                })
                            })
                            .then(() => {
                                // success
                                Toast.show(getLabel('common.msg_download_successful'));
                                const docsTemp = [...documents];
                                docsTemp[indexSelected].isDownload = true;
                                setDocuments(docsTemp);
                            })
                            .catch(error => {
                                // error
                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            });
                    }
                    else {
                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                    }
                })
                .catch(() => {
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                })
        } else {
            RNFS.downloadFile(options).promise
                .then(() => {
                    Share.open({
                        'filename': name,
                        'title': name,
                        'url': Platform.OS == 'android' ? `file://${localFile}` : localFile,
                    })
                })
                .then(() => {
                    // success
                    Toast.show(getLabel('common.msg_download_successful'));
                    const docsTemp = [...documents];
                    docsTemp[indexSelected].isDownload = true;
                    setDocuments(docsTemp);
                })
                .catch(error => {
                    // error
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                });
        }
    }

    const sendMailAttachFile = async (url, name, indexSelected: number) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;
        console.log('File path: ', localFile);
        if (await RNFS.exists(localFile)) {
            console.log('File exists');
            const shareOptions = {
                title: name,
                message: '',
                url: Platform.OS == 'android' ? `file://${localFile}` : localFile,
                social: Share.Social.EMAIL,
                filename: name, // only for base64 file in Android
            };

            Share.shareSingle(shareOptions)
            return;
        }
        const options = {
            fromUrl: url,
            toFile: localFile
        };

        if (Platform.OS == 'android') {
            requestExternalStoragePermission()
                .then((res) => {
                    if (res == 'granted') {
                        RNFS.downloadFile(options).promise
                            .then(() => {
                                const shareOptions = {
                                    title: name,
                                    message: '',
                                    url: Platform.OS == 'android' ? `file://${localFile}` : localFile,
                                    social: Share.Social.EMAIL,
                                    filename: name, // only for base64 file in Android
                                };

                                Share.shareSingle(shareOptions)
                            })
                            .then(() => {
                                // success
                                Toast.show(getLabel('common.msg_download_successful'));
                                const docsTemp = [...documents];
                                docsTemp[indexSelected].isDownload = true;
                                setDocuments(docsTemp);
                            })
                            .catch(error => {
                                // error
                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            });
                    }
                    else {
                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                    }
                })
                .catch(() => {
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                })
        } else {
            RNFS.downloadFile(options).promise
                .then(() => {

                    const shareOptions = {
                        title: name,
                        message: '',
                        url: Platform.OS == 'android' ? `file://${localFile}` : localFile,
                        social: Share.Social.EMAIL,
                        filename: name, // only for base64 file in Android
                    };

                    Share.shareSingle(shareOptions)
                })
                .then(() => {
                    // success
                    Toast.show(getLabel('common.msg_download_successful'));
                    const docsTemp = [...documents];
                    docsTemp[indexSelected].isDownload = true;
                    setDocuments(docsTemp);
                })
                .catch(error => {
                    // error
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                });
        }
    }

    const showActions = (data, indexRecord) => {
        const actions = [...actionsMore]
        if (data?.isDownload) {
            actions.splice(1, 1);
        }

        const params: PARAMS_ACTION_SHEET = {
            title: getLabel('common.label_option'),
            indexSelected: -1,
            selectedColor: 'red',
            backgroundSelectedColor: Colors.white.white1,
            options: actions,
            onSelected: (index) => {
                switch (index) {
                    case 0:
                        // View file
                        if (data?.file_type == 'url') {
                            navigation.navigate('RMWebView', { link: remakeURL(data?.file_url, data?.file_type), title: data?.title || '' })
                        } else {
                            downloadFile(remakeURL(data?.file_url, data?.file_type), data?.filename, indexRecord)
                        }
                        break;
                    case 1:
                        // Download
                        if (data?.isDownload) {
                            sendMailAttachFile(remakeURL(data?.file_url, data?.file_type), data?.filename, indexRecord);
                        }
                        else {
                            downloadFile(remakeURL(data?.file_url, data?.file_type), data?.filename, indexRecord)
                        }
                        break;
                    case 2:
                        // Send mail
                        sendMailAttachFile(remakeURL(data?.file_url, data?.file_type), data?.filename, indexRecord);

                        break;
                    default:
                        break;
                }
            }
        }

        dispatch(showActionSheet?.(params));
    }

    const renderHiddenRow = (item, index) => {
        return (
            <View style={[styles.rowHidden]}>
                <View style={styles.actionsHidden}>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => {
                                shareFile(remakeURL(item?.file_url, item?.file_type), item?.filename, index)
                            }}
                        >
                            <NativeBaseIcon
                                name={Platform.OS == 'android' ? 'share-alternative' : 'share-outline'}
                                type={Platform.OS == 'android' ? 'Entypo' : 'Ionicons'}
                                style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                    <View style={styles.actionHiddenContent}>
                        <TouchableHighlight
                            style={styles.action}
                            activeOpacity={.3}
                            underlayColor={Colors.black.black4}
                            onPress={() => {
                                showActions(item, index)

                                // checkExisted(item?.filename)
                                //     .then((value) => {
                                //     })
                                //     .catch((err) => {
                                //         console.log('Error: ', err);
                                //         showActions(item, index)
                                //     })
                            }
                            }
                        >
                            <Icon name={getIcon('More')} style={styles.iconAction} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }

    const _updateItemSelected = (indexSelected, dataChange) => {
        const docsTemp = [...documents];
        docsTemp[indexSelected].starred = (docsTemp[indexSelected].starred == 0) ? 1 : 0;
        setDocuments(docsTemp);
    }

    const toggleFavorite = (data, indexSelected) => {

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Documents',
                id: data.notesid || data?.id || '',
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }
            console.log('');

            if (indexSelected != -1) {
                const docsTemp = [...documents];
                docsTemp[indexSelected].starred = (docsTemp[indexSelected].starred == 0) ? 1 : 0;
                setDocuments(docsTemp);
            }
        }, error => {
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    return (
        <>
            <Header>
                <Left style={{ minWidth: '70%' }}>
                    <TouchableHighlight
                        activeOpacity={.3}
                        underlayColor={Colors.black.black5}
                        style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name={getIcon('Back')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                    </TouchableHighlight>
                    <NBText allowFontScaling={true} >{route.params?.parent || ''}</NBText>
                </Left>

            </Header>

            <Content scrollEnabled={false}>
                <SwipeListView
                    useFlatList={true}
                    data={documents}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={(data, index) => {
                        const item = data.item;
                        return (
                            <SwipeRow
                                disableRightSwipe={true}
                                disableLeftSwipe={false}
                                leftOpenValue={0}
                                rightOpenValue={(- (widthResponse / 2 + 15))}
                            >
                                {renderHiddenRow(data.item, data.index)}
                                <TouchableHighlight
                                    underlayColor={Colors.white.white3}
                                    activeOpacity={0.1}
                                    onPress={() => {
                                        if (!Global.isActiveFeature('document')) {
                                            const params = {
                                                document: data.item,
                                                prevScene: 'DocumentList',
                                                indexSelected: data.index,
                                                onUpdateItemSelected: _updateItemSelected
                                            }
                                            console.log('Params pass: ', params);
                                            navigation.navigate('DocumentView', params)
                                        } else {
                                            if (item?.file_type == 'url') {
                                                navigation.navigate('RMWebView', { link: remakeURL(item?.file_url, item?.file_type), title: item?.title || '' })
                                            } else {
                                                downloadFile(remakeURL(item?.file_url, item?.file_type), item?.filename, data.index);
                                            }
                                        }

                                    }}
                                >
                                    <ItemListViewContent
                                        style={{
                                            borderTopWidth: 0,
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                            borderBottomColor: Colors.white.white5
                                        }}
                                    >
                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <LBText allowFontScaling={true} numberOfLines={2}>
                                                    {item?.title}
                                                </LBText>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.btnStar]}
                                                onPress={() => { toggleFavorite(data.item, data.index) }}
                                            >
                                                <AntDesignIcon
                                                    name={(data.item?.starred === '0' || !data.item?.starred) ? 'staro' : 'star'}
                                                    style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <SText numberOfLines={1}>{getLabel('common.label_file_type')}: <SText style={{ fontWeight: 'bold', color: Colors.functional.warning }}>{item?.file_type == 'url' ? 'LINK' : (item?.filename ? item?.filename?.split('.')?.reverse()?.[0]?.toUpperCase() : 'FILE')}</SText></SText>
                                            </View>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(item.smownerid).avatar) }}
                                                        resizeMode='stretch'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{item?.assigned_owners ? (Global.getAssignedOwnersName(item.assigned_owners) || '') : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true} color={Colors.black.black2}>{item?.createdtime ? Global.formatDate(item.createdtime) : ''}</SText>
                                            </View>
                                        </View>
                                    </ItemListViewContent>
                                </TouchableHighlight>
                            </SwipeRow>
                        )
                    }}
                    onRowOpen={(rowKey, rowMap) => {
                        setTimeout(() => {
                            rowMap[rowKey] && rowMap[rowKey].closeRow();
                        }, 4000)
                    }}
                />
            </Content>

        </>
    )
}

const styles = StyleSheet.create({
    lineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        paddingHorizontal: 12
    },
    ownerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatarContent: {
        backgroundColor: Colors.white.white2,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25 / 2,
        marginLeft: -5
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 25 / 2,
        resizeMode: 'cover'
    },
    time: {
        flex: 1,
        maxWidth: 100,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    btnStar: {
        flex: 1,
        maxWidth: 28,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStar: {
        fontSize: 20,
        color: Colors.black.black1
    },
    rowHidden: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: Colors.white.white4
    },
    actionsHidden: {
        flex: 1,
        maxWidth: widthResponse * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    actionHiddenContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    action: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 23 },
    iconAction: { fontSize: 28, color: Colors.functional.primary }
})
