import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { BackHandler, Image, InteractionManager, PermissionsAndroid, Platform, RefreshControl, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import Toast from 'react-native-root-toast';
import Share from 'react-native-share';
import { Icon as NativeBaseIcon } from 'native-base'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign';
import { useDispatch } from 'react-redux';
import { Content, Header, ItemListViewContent, LargeHeader, LBText, Left, NText, Right, SearchInput, SectionFilterList, SpaceHS, SText } from '../../../components/CustomComponentView';
import { LoadingList, LoadingMoreList } from '../../../components/Loading';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { Box } from '../../../themes/themes';
import { getIcon, getLabel, widthResponse } from '../../../utils/commons/commons';
import { showActionSheet } from '../../../redux/actions/actionSheet';
const actionsDefault = [
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

]
export default function DocumentListModule() {
    const navigation = useNavigation();
    const route = useRoute();
    const [documents, setDocuments] = React.useState([]);
    const [isReadyRender, setReadyRender] = React.useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [firstLoading, setFirstLoading] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [paging, setPaging] = useState({});
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState({
        cv_id: '',
        viewname: getLabel('common.label_filter_all', { module: getLabel('common.title_related_document') })
    });
    const [optionsFilter, setOptionsFilter] = useState([]);
    const [actionsMore, setActionsMore] = useState([...actionsDefault]);
    const dispatch = useDispatch()

    React.useEffect(() => {

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );

        const eventTransition = InteractionManager.runAfterInteractions(() => {
            setReadyRender(true);
            // setTimeout(() => {
            //     const documentList = route?.params?.documentList || [];
            //     let res = [];
            //     if (documentList && documentList.length > 0) {
            //         res = documentList.map((doc) => {
            //             const itemTemp = { ...doc };
            //             checkExisted(doc?.smownerid + '-' + doc?.filename)
            //                 .then((value) => {
            //                     itemTemp.isDownload = value;
            //                 })
            //                 .catch(() => {
            //                     itemTemp.isDownload = false;
            //                 })
            //             console.log('checkExisted Value: ', itemTemp);
            //             return itemTemp
            //         });
            //         setDocuments(res)
            //     }
            //     else {
            //         setDocuments([]);
            //     }
            // }, 500);
        });

        return () => {
            eventTransition.cancel();
            backHandler.remove();
        }
    }, []);

    React.useEffect(() => {
        if (isReadyRender) {
            loadData('FIRST_LOAD', filter)
        }

        return () => {
        }
    }, [isReadyRender])


    const loadData = (loadType: 'FIRST_LOAD' | 'LOAD_MORE' | 'REFRESH', customView) => {
        if (loadType === 'REFRESH') {
            setFirstLoading(false);
            setLoadMore(false);
            setRefreshing(true);
        }
        else if (loadType === 'LOAD_MORE') {
            setFirstLoading(false);
            setLoadMore(true);
            setRefreshing(false);
        }
        else {
            setFirstLoading(true);
            setLoadMore(false);
            setRefreshing(false);
        }

        let offset = 0;

        if (loadType == 'LOAD_MORE') {
            if (paging?.next_offset) {
                offset = paging.next_offset;
            }
            else {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                return;
            }
        }

        let params = {
            RequestAction: 'GetDocumentList',
            Params: {
                keyword: keyword,
                cv_id: customView.cv_id,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let list = data.entry_list;
                if (loadType == 'LOAD_MORE') {
                    list = documents.concat(list);
                }

                setOptionsFilter(data.cv_list);
                setDocuments(list);
                setLoaded(true);
                setPaging(data.paging);
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
            }
            else {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_no_results_found'));
            }
        },
            (error) => {
                setFirstLoading(false);
                setLoadMore(false);
                setRefreshing(false);
                Toast.show(getLabel('common.msg_connection_error'));
            })
    }

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

    const downloadFile = async (url, name) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;
        console.log('File path: ', localFile);
        if (await RNFS.exists(localFile)) {
            console.log('File exists');
            FileViewer.open(localFile)
            return;
        }
        const options = {
            fromUrl: url,
            toFile: localFile
        };

        if (Platform.OS == 'android') {
            this.requestExternalStoragePermission()
                .then((res) => {
                    if (res == 'granted') {
                        RNFS.downloadFile(options).promise
                            .then(() => FileViewer.open(localFile))
                            .then(() => {
                                // success
                                Toast.show('Download thành công');
                            })
                            .catch(error => {
                                // error
                                Toast.show('Download không thành công');
                            });
                    }
                    else {
                        Toast.show('Download không thành công');
                    }
                })
                .catch(() => {
                    Toast.show('Download không thành công');
                })
        } else {
            RNFS.downloadFile(options).promise
                .then(() => FileViewer.open(localFile))
                .then(() => {
                    // success
                    Toast.show('Download thành công');
                })
                .catch(error => {
                    // error
                    Toast.show('Download không thành công');
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

    const toggleFavorite = (data, indexSelected) => {
        setLoading(true)

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Documents',
                id: data.notesid,
                starred: (data.starred == 0) ? 1 : 0
            }
        };


        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            if (indexSelected != -1) {
                let docs = documents;
                docs[indexSelected].starred = (docs[indexSelected].starred == 0) ? 1 : 0;

                setDocuments(docs);
            }
            setLoading(false)
        }, error => {
            setLoading(false)
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    const shareFile = async (url, name) => {
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
                                Toast.show('Download thành công');
                            })
                            .catch(error => {
                                // error
                                Toast.show('Download không thành công');
                            });
                    }
                    else {
                        Toast.show('Download không thành công');
                    }
                })
                .catch(() => {
                    Toast.show('Download không thành công');
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
                    Toast.show('Download thành công');
                })
                .catch(error => {
                    // error
                    Toast.show('Download không thành công');
                });
        }
    }

    const sendMailAttachFile = async (url, name) => {
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
                                Toast.show('Download thành công');
                            })
                            .catch(error => {
                                // error
                                Toast.show('Download không thành công');
                            });
                    }
                    else {
                        Toast.show('Download không thành công');
                    }
                })
                .catch(() => {
                    Toast.show('Download không thành công');
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
                    Toast.show('Download thành công');
                })
                .catch(error => {
                    // error
                    Toast.show('Download không thành công');
                });
        }
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
                                if (item?.file_type == 'url') {
                                    Share.open({
                                        'filename': item?.filename,
                                        'title': item?.filename,
                                        'url': item?.file_url,
                                    });
                                } else {
                                    shareFile(remakeURL(item?.file_url, item?.file_type), item?.filename)
                                }
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
                                if (item?.file_type == 'url') {
                                    showActions(item, index, false)
                                } else {
                                    checkExisted(item?.filename)
                                        .then((value) => {
                                            showActions(item, index, value)
                                        })
                                        .catch((err) => {
                                            console.log('Error: ', err);
                                            showActions(item, index, false)
                                        });
                                }

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

    const showActions = (data, indexRecord, isDownload) => {
        const actions = [...actionsMore]
        if (isDownload || data?.file_type == 'url') {
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
                            downloadFile(remakeURL(data?.file_url, data?.file_type), data?.filename)
                        }
                        break;
                    case 1:

                        // Download
                        if (isDownload) {
                            sendMailAttachFile(remakeURL(data?.file_url, data?.file_type), data?.filename);

                        } else {
                            downloadFile(remakeURL(data?.file_url, data?.file_type), data?.filename)
                        }

                        break;
                    case 2:
                        if (data?.file_type == 'url') {
                            const shareOptions = {
                                title: data?.filename,
                                message: '',
                                url: remakeURL(data?.file_url, data?.file_type),
                                social: Share.Social.EMAIL,
                                filename: data?.filename, // only for base64 file in Android
                            };

                            Share.shareSingle(shareOptions)
                        }
                        else {
                            // Send mail
                            sendMailAttachFile(remakeURL(data?.file_url, data?.file_type), data?.filename);
                        }

                        break;
                    default:
                        break;
                }
            }
        }

        dispatch(showActionSheet?.(params));
    }

    const _updateItemSelected = (indexSelected, dataChange) => {
        let docsTemp = [...documents];

        docsTemp[indexSelected].starred = dataChange?.starred || '0';

        setDocuments(docsTemp);
    }

    return (
        <>
            <LargeHeader>
                <Header noBorder>
                    <Left style={{ minWidth: '70%' }}>
                        <TouchableHighlight
                            activeOpacity={.3}
                            underlayColor={Colors.black.black5}
                            style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Icon name={getIcon("Menu")} style={{ color: Colors.black.black1, fontSize: 18 }} />
                        </TouchableHighlight>
                        <SectionFilterList
                            value={filter}
                            options={optionsFilter}
                            onSelected={(value) => {
                                setFilter(value);
                                loadData('FIRST_LOAD', value)
                            }}
                        />
                    </Left>

                    <Right style={{ minWidth: '30%' }}>

                    </Right>
                </Header>
                <Header noBorder>
                    <SearchInput
                        autoFocus={false}
                        value={keyword}
                        onValueChange={(value) => setKeyword(value)}
                        isClearText={true}
                        onClearText={() => setKeyword('')}
                        backgroundColor={Colors.white.white3}
                        placeholder={getLabel('document.label_search_placeholder')}
                        onSearch={() => {
                            loadData('FIRST_LOAD', filter)
                        }}
                    />
                </Header>
            </LargeHeader>


            <Content enableScroll={false}>
                <LoadingList loading={firstLoading} />
                <SwipeListView
                    useFlatList={true}
                    data={documents}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={(data, index) => {
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
                                        const params = {
                                            document: data.item,
                                            prevScene: 'DocumentList',
                                            indexSelected: data.index,
                                            onUpdateItemSelected: _updateItemSelected
                                        }
                                        console.log('Params pass: ', params);
                                        navigation.navigate('DocumentView', params)
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
                                                    {data.item?.title}
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
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                <SText numberOfLines={1}>{getLabel('common.label_file_type')}: </SText>
                                                <Box
                                                    paddingVertical='s'
                                                    borderRadius={4}
                                                    borderColor='black3'
                                                    borderWidth={StyleSheet.hairlineWidth}
                                                    paddingHorizontal='l'
                                                >
                                                    <SText style={{ fontWeight: 'bold', color: Colors.functional.primary }}>{data.item?.file_type == 'url' ? 'LINK' : (data.item?.filename ? data.item?.filename?.split('.')?.reverse()?.[0]?.toUpperCase() : 'FILE')}</SText>
                                                </Box>

                                            </View>
                                        </View>

                                        <View
                                            style={[styles.lineItem]}
                                        >
                                            <View style={styles.ownerContent}>
                                                <View style={styles.avatarContent}>
                                                    <Image
                                                        source={{ uri: Global.getImageUrl(data.item?.assigned_owners?.length > 1 ? '/resources/images/default-group-avatar.png' : Global.getUser(data.item.smownerid).avatar) }}
                                                        resizeMode='stretch'
                                                        style={styles.avatar}
                                                    />
                                                </View>

                                                <SpaceHS />
                                                <View style={{ flex: 1 }}>
                                                    <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data.item?.assigned_owners ? (Global.getAssignedOwnersName(data.item.assigned_owners) || '') : ''}</NText>
                                                </View>
                                            </View>
                                            <View style={styles.time}>
                                                <SText allowFontScaling={true} color={Colors.black.black2}>{data.item?.createdtime ? Global.formatDate(data.item.createdtime) : ''}</SText>
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                loadData('REFRESH', filter)
                            }}
                            tintColor='#309ed8'
                            colors={['#309ed8', '#25add0', '#15c2c5']}
                            progressBackgroundColor='#fff'
                        />
                    }
                    onEndReachedThreshold={0.1}
                    onEndReached={() => {
                        if (paging && paging.next_offset) {
                            loadData('LOAD_MORE', filter)
                        }
                    }}
                    ListFooterComponent={<LoadingMoreList loading={loadMore} />}
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
