// Import libraries
import React, { Component } from 'react'
import {
    ActivityIndicator, Alert, Animated, BackHandler, InteractionManager, PermissionsAndroid, Platform,
    ScrollView, TouchableHighlight, TouchableOpacity, View
} from 'react-native'
import FileViewer from 'react-native-file-viewer'
import RNFS from 'react-native-fs'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-root-toast'
import Share from 'react-native-share'
import AntDesignIcon from 'react-native-vector-icons/dist/AntDesign'
import FeatherIcon from 'react-native-vector-icons/dist/Feather'
import { connect } from 'react-redux'
import { Icon as IconNativeBase } from 'native-base'
// Import components
import { HeaderSectionView, LineItemViewText, QuickActionHeader } from '../../../components/ComponentView'
import {
    Header, LargeHeader, LBText, Left,
    ListItem, Right, SectionView, SpaceHM, SpaceHS,
    SpaceL, SpaceS, SText, TabContent, TagOutLine
} from '../../../components/CustomComponentView'
import IndicatorLoading from '../../../components/IndicatorLoading'
import SegmentedControl from '../../../components/SegmentedControl'
import Global from '../../../Global'
import { showAlert } from '../../../redux/actions/alert'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import {
    formatDateTime,
    getIcon, getLabel, isIphoneX, widthResponse
} from '../../../utils/commons/commons'
import I18n from '../../../utils/i18n'
import styles from './styles'

const HEADER_HEIGHT = ((isIphoneX ? 64 : 74))
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 73 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - HEADER_HEIGHT - (isIphoneX ? 20 : 12);

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
export class DocumentView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(
                // iOS has negative initial scroll value because content inset...
                Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0,
            ),
            refreshing: false,
            tabsOption: [
                {
                    label: getLabel('common.tab_detail'),
                    isLoaded: false,
                },
                {
                    label: getLabel('common.tab_related'),
                    isLoaded: false,
                }],
            tabSelected: 0,
            animTransitionChangeTab: new Animated.Value(0),
            loadingTabOverView: false,
            loadingTabDetail: false,
            loadingTabRelated: false,
            document: {},
            metaData: {},
            isReady: false,
            loading: false,
            counters: {},
            commentList: [],
            comment: '',
            commentReply: '',
            attachment: [],
            interactionsComplete: false,
            isDownloading: false,
            downloadProgress: {
                contentLength: 0,
                bytesWritten: 0
            },
        };
    }


    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({ interactionsComplete: true });
        });
        // this.unsubscribe = this.props?.navigation?.addListener('focus', () => {
        // The screen is focused
        // Call any action

        this.handleTabsChange(this.state.tabSelected);
        const { route } = this.props;
        console.log('Params init: ', route.params);

        this.setState({ document: route?.params?.document }, () => {
            this.loadData();
        })
        // });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        // this.unsubscribe();
        this.backHandler.remove();
    }

    goBack() {
        this.props?.navigation.goBack();
    }

    loadData() {
        this.setState({ loading: true });
        let params = {
            RequestAction: 'GetDocument',
            Params: {
                id: this.state.document?.notesid || this.state.document?.id,
            }
        }

        // Call api
        Global.callAPI(this, params, data => {
            console.log('Data document: ', JSON.stringify(data));

            if (data.message == 'ACCESS_DENIED') {
                this.setState({
                    showAlertPermissionRecord: true
                });
                return;
            }

            if (parseInt(data.success) === 1) {
                this.checkExisted(data.data?.filename)
                    .then((value) => {
                        console.log('checkExisted value: ', value, data.data.counters);
                        data.data.isDownload = value;
                        this.setState({
                            document: data.data,
                            metaData: data.metadata,
                            counters: data.data.counters
                        }, () => {
                            this.setState({ isReady: true }, () => {
                                this.props.route?.params?.onUpdateItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1, data.data);
                            });
                        });
                    })
                    .catch((err) => {
                        console.log('checkExisted Has error: ', err);
                        data.data.isDownload = false;
                        this.setState({
                            document: data.data,
                            metaData: data.metadata,
                            counters: data.data.counters
                        }, () => {
                            this.setState({ isReady: true }, () => {
                                this.props.route?.params?.onUpdateItemSelected?.(parseInt(this.props.route?.params?.indexSelected || 0) >= 0 ? parseInt(this.props.route?.params?.indexSelected || 0) : -1, data.data);
                            });
                        });
                    })

            }
            else {
                Toast.show(I18n.t('common.msg_module_not_exits_error', { locale: Global.locale || "vn_vn", module: I18n.t('account.title', { locale: Global.locale || "vn_vn" }) }));
            }
        },
            error => {
                Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
            });
    }

    handleTabsChange = index => {
        this.setState({ tabSelected: index }, () => {
            Animated.timing(
                this.state.animTransitionChangeTab,
                {
                    toValue: -(index * widthResponse),
                    duration: 200,
                    useNativeDriver: true
                }
            ).start(() => {
                if (!this.state.tabsOption[index].isLoaded) {
                    this.state.tabsOption[index].isLoaded = true;
                }
            });
        });
    }

    toggleFavorite = () => {
        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: 'Documents',
                id: this.state.document?.id,
                starred: (parseInt(this.state.document?.starred || '0') == 0) ? 1 : 0
            }
        };

        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }

            this.loadData();
        }, error => {
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    requestExternalStoragePermission = async () => {
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

    downloadFile = async (url, name) => {
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
                console.log('DownloadBeginCallbackResult: ', res);

                this.setState({ isDownloading: true })
            },
            progress: (res) => {
                console.log('DownloadProgressCallbackResult: ', res);
                this.setState({ downloadProgress: res })
            }
        };

        this.setState({ isDownloading: true })
        if (Platform.OS == 'android') {
            this.requestExternalStoragePermission()
                .then((res) => {
                    if (res == 'granted') {
                        RNFS.downloadFile(options).promise
                            .then(() => FileViewer.open(localFile))
                            .then(() => {
                                // success
                                Toast.show(getLabel('common.msg_download_successful'));
                                const docsTemp = { ...this.state.document };
                                docsTemp.isDownload = true;
                                this.setState({ document: docsTemp, isDownloading: false })
                            })
                            .catch(error => {
                                // error
                                this.setState({ isDownloading: false })
                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            });
                    }
                    else {
                        this.setState({ isDownloading: false })
                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                    }
                })
                .catch(() => {
                    this.setState({ isDownloading: false })
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
                    const docsTemp = { ...this.state.document };
                    docsTemp.isDownload = true;
                    this.setState({ document: docsTemp, isDownloading: false })
                })
                .catch(error => {
                    // error
                    this.setState({ isDownloading: false })
                    Toast.show(getLabel('common.msg_download_unsuccessful'));
                });
        }
    }

    shareFile = async (url, name) => {
        if (this.state.document?.file_type == 'url') {
            Share.open({
                'filename': name,
                'title': name,
                'url': url,
            })
        }
        else {
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
            else {
                const options = {
                    fromUrl: url,
                    toFile: localFile,
                    begin: (res) => {
                        console.log('DownloadBeginCallbackResult: ', res);

                        this.setState({ isDownloading: true })
                    },
                    progress: (res) => {
                        console.log('DownloadProgressCallbackResult: ', res);
                        this.setState({ downloadProgress: res })
                    }
                };
                this.setState({ isDownloading: true })

                if (Platform.OS == 'android') {
                    this.requestExternalStoragePermission()
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
                                        const docsTemp = { ...this.state.document };
                                        docsTemp.isDownload = true;
                                        this.setState({ document: docsTemp, isDownloading: false })
                                    })
                                    .catch(error => {
                                        // error
                                        this.setState({ isDownloading: false })
                                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                                    });
                            }
                            else {
                                this.setState({ isDownloading: false })

                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            }
                        })
                        .catch(() => {
                            this.setState({ isDownloading: false })

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
                            const docsTemp = { ...this.state.document };
                            docsTemp.isDownload = true;
                            this.setState({ document: docsTemp, isDownloading: false })
                        })
                        .catch(error => {
                            // error
                            this.setState({ isDownloading: false })

                            Toast.show(getLabel('common.msg_download_unsuccessful'));
                        });
                }
            }
        }

    }

    sendMailAttachFile = async (url, name) => {
        if (this.state.document?.file_type == 'url') {
            const shareOptions = {
                title: name,
                message: '',
                url: url,
                social: Share.Social.EMAIL,
            };

            Share.shareSingle(shareOptions)
        } else {
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
            else {
                const options = {
                    fromUrl: url,
                    toFile: localFile,
                    begin: (res) => {
                        console.log('DownloadBeginCallbackResult: ', res);

                        this.setState({ isDownloading: true })
                    },
                    progress: (res) => {
                        console.log('DownloadProgressCallbackResult: ', res);
                        this.setState({ downloadProgress: res })
                    }
                };

                this.setState({ isDownloading: true })
                if (Platform.OS == 'android') {
                    this.requestExternalStoragePermission()
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
                                        const docsTemp = { ...this.state.document };
                                        docsTemp.isDownload = true;
                                        this.setState({ document: docsTemp, isDownloading: false })
                                    })
                                    .catch(error => {
                                        // error
                                        this.setState({ isDownloading: false })
                                        Toast.show(getLabel('common.msg_download_unsuccessful'));
                                    });
                            }
                            else {
                                this.setState({ isDownloading: false })
                                Toast.show(getLabel('common.msg_download_unsuccessful'));
                            }
                        })
                        .catch(() => {
                            this.setState({ isDownloading: false })
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
                            const docsTemp = { ...this.state.document };
                            docsTemp.isDownload = true;
                            this.setState({ document: docsTemp, isDownloading: false })
                        })
                        .catch(error => {
                            // error
                            this.setState({ isDownloading: false })
                            Toast.show(getLabel('common.msg_download_unsuccessful'));
                        });
                }
            }
        }

    }

    remakeURL = (url: string, type: string) => {
        console.log('URL from type: ', type);

        if (type == 'url') {
            return url;
        }
        return `${url}&client=Mobile&token=${Global.token}`
    }

    getFiledName(key) {
        let fieldName = {};

        let fieldList = this.state.metaData?.field_list;

        if (fieldList) {
            fieldName = fieldList?.[key] || {}
        }
        return fieldName;
    }

    checkExisted = async (fileName: string) => {
        const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        return await RNFS.exists(localFile);
    }

    renderTabDetail = () => {
        if (this.state.loadingTabDetail) {
            return (
                <TabContent>
                    <ActivityIndicator style={{ paddingVertical: 10 }} />
                </TabContent>
            )
        } else {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('common.title_info_base')} />

                        <LineItemViewText
                            title={this.getFiledName('notes_title').label}
                            value={this.state.document?.label}
                        />


                        <LineItemViewText
                            title={this.getFiledName('note_no').label}
                            value={this.state.document?.note_no}
                        />

                        {/* <LineItemViewText
                            title={this.getFiledName('folderid').label}
                            value={this.state.document?.folderid}
                        /> */}

                        <LineItemViewText
                            title={this.getFiledName('createdtime').label}
                            value={formatDateTime(this.state.document?.createdtime)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('createdby').label}
                            value={this.state.document?.createdby ? Global.getUser(this.state.document?.createdby).full_name : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('modifiedtime').label}
                            value={formatDateTime(this.state.document?.modifiedtime)}
                        />

                        <LineItemViewText
                            title={this.getFiledName('source').label}
                            value={this.state.document?.source}
                        />

                        <LineItemViewText
                            title={this.getFiledName('main_owner_id').label}
                            value={this.state.document?.main_owner_name}
                        />
                        <LineItemViewText
                            title={this.getFiledName('assigned_user_id').label}
                            value={this.state.document?.assigned_owners ? Global.getAssignedOwnersName(this.state.document?.assigned_owners) : ''}
                        />
                        <LineItemViewText
                            title={this.getFiledName('users_department').label}
                            value={Global.getEnumLabel('Documents', 'users_department', this.state.document?.users_department)}
                        />

                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('account.title_description_information')} />

                        <LineItemViewText
                            title={this.getFiledName('notecontent').label}
                            value={this.state.document?.notecontent}
                        />
                    </SectionView>

                    <SpaceS />
                    <SectionView noPaddingHorizontal>
                        <HeaderSectionView title={getLabel('document.title_file_information')} />

                        <LineItemViewText
                            title={this.getFiledName('filename').label}
                            value={this.state.document?.filename}
                            isLoading={this.state.isDownloading}
                            textStyle={{
                                color: Colors.functional.primary,
                            }}
                            handleOnPress={() => {
                                if (this.state.document?.file_type == 'url') {
                                    this.props.navigation.navigate('RMWebView', { link: this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), title: this.state.document?.label })
                                } else {
                                    this.downloadFile(this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), this.state.document?.filename)
                                }
                            }}
                        />
                        <LineItemViewText
                            title={this.getFiledName('filetype').label}
                            value={this.state.document?.file_type == 'url' ? 'LINK' : (this.state.document?.filename ? this.state.document?.filename?.split('.')?.reverse()?.[0]?.toUpperCase() : 'FILE')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('filestatus').label}
                            value={this.state.document?.filestatus == '1' ? getLabel('common.btn_yes') : getLabel('common.btn_no')}
                        />
                        <LineItemViewText
                            title={this.getFiledName('filesize').label}
                            value={formatBytes(parseInt(this.state.document?.filesize || '0'), 0)}
                        />
                    </SectionView>

                    <SpaceL />
                </TabContent>
            )
        }
    }

    renderTabRelated = () => {
        if (this.state.loadingTabRelated) {
            return (
                <TabContent>
                    <ActivityIndicator style={{ paddingVertical: 10 }} />
                </TabContent>
            )
        } else {
            return (
                <TabContent style={{ backgroundColor: Colors.white.white3 }}>
                    {
                        Global.getPermissionModule('Leads', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_leads')}
                                            badgeCount={this.state.counters?.leads_count ? parseInt(this.state.counters?.leads_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalLeadList', { module: 'Document', parent: this.state.document?.label, isFromDetailView: true, leadList: this.state.document?.leads_list })
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        ) : null
                    }

                    {
                        Global.getPermissionModule('Contacts', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_contacts')}
                                            badgeCount={this.state.counters?.contacts_count ? parseInt(this.state.counters?.contacts_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalContactList', { module: 'Document', parent: this.state.document?.label, isFromDetailView: true, contactList: this.state.document?.contacts_list })
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        )
                            : null
                    }

                    {
                        Global.getPermissionModule('Accounts', null) ? (
                            <>
                                <SpaceS />
                                <SectionView noPaddingHorizontal>
                                    <Box paddingHorizontal={0}>
                                        <ListItem
                                            divider={false}
                                            style={{ paddingHorizontal: 12, paddingRight: 24 }}
                                            title={getLabel('common.title_organizations')}
                                            badgeCount={this.state.counters?.accounts_count ? parseInt(this.state.counters?.accounts_count) : '0'}
                                            onPress={() => {
                                                this.props.navigation.navigate('ModalOrganizationList', { module: 'Document', parent: this.state.document?.label, isFromDetailView: true, accountList: this.state.document?.accounts_list })
                                            }}
                                        />
                                    </Box>
                                </SectionView>
                            </>
                        ) : null
                    }

                    <SpaceS />
                </TabContent>
            );
        }
    }

    render() {

        const { navigation, showAlert } = this.props;
        const { document } = this.state;
        const scrollY = Animated.add(
            this.state.scrollY,
            Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0,
        );
        const headerTranslate = scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -HEADER_SCROLL_DISTANCE],
            extrapolate: 'clamp',
        });
        if (!this.state.interactionsComplete) {
            return (
                <View
                    style={{
                        flex: 1,
                        backgroundColor: Colors.white.white1
                    }}
                >
                </View>
            )
        }

        return (
            <>
                <View style={styles.fill}>
                    <Animated.ScrollView
                        ref={(mainScroll) => this.mainScroll = mainScroll}
                        style={styles.fill}
                        scrollEventThrottle={1}
                        keyboardShouldPersistTaps='always'
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                            { useNativeDriver: true },
                        )}
                        contentInset={{
                            top: HEADER_MAX_HEIGHT,
                        }}
                        contentOffset={{
                            y: -HEADER_MAX_HEIGHT,
                        }}
                    >
                        {
                            this.state.isReady ?
                                (
                                    <KeyboardAwareScrollView
                                        style={styles.fill}
                                        enabled={true}
                                        keyboardVerticalOffset={40}
                                        keyboardShouldPersistTaps='always'
                                        behavior={Platform.OS == "ios" ? "padding" : "height"}
                                    >
                                        <View style={{ marginTop: Platform.OS == 'ios' ? 0 : HEADER_MAX_HEIGHT }}>
                                            {this.state.tabSelected === 0 && this.renderTabDetail()}
                                            {this.state.tabSelected === 1 && this.renderTabRelated()}
                                        </View>
                                    </KeyboardAwareScrollView>
                                )
                                : null
                        }
                    </Animated.ScrollView>
                    {/* Header Scroll */}
                    <Animated.View
                        style={[
                            styles.header,
                            { transform: [{ translateY: headerTranslate }] },
                        ]}
                    >
                        <View style={{ flex: 1 }} />
                        <ScrollView horizontal style={{ maxHeight: 90, flexDirection: 'row', width: widthResponse }}>
                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                disabled={this.state.document?.file_type == 'url'}
                                icon={'eye'}
                                label={getLabel('document.btn_view')}
                                onPress={() => {
                                    if (this.state.document?.file_type == 'url') {
                                        console.log('URL: ', this.remakeURL(this.state.document?.file_url, this.state.document?.file_type));
                                        this.props.navigation.navigate('RMWebView', { link: this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), title: this.state.document?.label })
                                    } else {
                                        this.downloadFile(this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), this.state.document?.filename)
                                    }
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                disabled={this.state.document?.isDownload || (this.state.document?.file_type == 'url') || false}
                                icon={'download'}
                                label={getLabel('document.btn_download')}
                                onPress={() => {
                                    this.downloadFile(this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), this.state.document?.filename)
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                iconElement={<AntDesignIcon name={(parseInt(document?.starred || '0') === 1) ? 'star' : 'staro'} style={{ fontSize: 18, color: (parseInt(document?.starred || '0') === 1) ? Colors.yellow.yellow1 : Colors.functional.primary }} />}
                                label={getLabel('common.btn_follow')}
                                onPress={() => {
                                    this.toggleFavorite()
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                // icon={'share'}
                                iconElement={
                                    <IconNativeBase
                                        name={Platform.OS == 'android' ? 'share-alternative' : 'share-outline'}
                                        type={Platform.OS == 'android' ? 'Entypo' : 'Ionicons'}
                                        style={{ fontSize: 18, color: Colors.functional.primary }}
                                    />
                                }
                                label={getLabel('document.btn_share')}
                                onPress={() => {
                                    if (this.state.document?.file_type == 'url') {
                                        Share.open({
                                            'filename': this.state.document?.filename,
                                            'title': this.state.document?.filename,
                                            'url': this.remakeURL(this.state.document?.file_url, this.state.document?.file_type),
                                        });
                                    }
                                    else {
                                        this.shareFile(this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), this.state.document?.filename)
                                    }
                                }}
                            />

                            <QuickActionHeader
                                width={widthResponse * 0.2 < 80 ? 0 : widthResponse * 0.2}
                                contentStyle={{
                                    alignItems: 'center',
                                    paddingLeft: widthResponse * 0.2 >= 80 ? 0 : 25,
                                }}
                                icon={getIcon('Mail')}
                                label={getLabel('common.label_menu_send_email')}
                                onPress={() => {
                                    if (this.state.document?.file_type == 'url') {
                                        const shareOptions = {
                                            title: this.state.document?.filename,
                                            message: '',
                                            url: this.remakeURL(this.state.document?.file_url, this.state.document?.file_type),
                                            social: Share.Social.EMAIL,
                                            filename: this.state.document?.filename, // only for base64 file in Android
                                        };

                                        Share.shareSingle(shareOptions)
                                    }
                                    else {
                                        this.sendMailAttachFile(this.remakeURL(this.state.document?.file_url, this.state.document?.file_type), this.state.document?.filename)
                                    }
                                }}
                            />

                        </ScrollView>
                        <View style={{ maxHeight: 70, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <SegmentedControl
                                tabs={[...this.state.tabsOption]}
                                onChange={(index) => this.handleTabsChange(index)}
                                currentIndex={this.state.tabSelected}
                                paddingVertical={10}
                                activeTextColor={Colors.black.black1}
                                textColor={Colors.black.black2}
                                segmentedControlBackgroundColor={'#f0f0f0'} s
                            />

                        </View>
                    </Animated.View>

                    {/* Fix header */}
                    <Animated.View
                        style={[
                            styles.bar,
                        ]}
                    >
                        <LargeHeader>
                            <Header noBorder>
                                <Left style={{ minWidth: '70%' }}>
                                    <SpaceHM />
                                    <Icon name={'file'} style={{ fontSize: 18 }} />
                                    <SpaceHS />
                                    <LBText allowFontScaling={true} numberOfLines={2}>
                                        {document?.label}
                                    </LBText>
                                </Left>
                                <Right style={{ minWidth: '30%' }}>
                                    <TouchableHighlight
                                        style={{ marginRight: 4, borderRadius: 30, height: 40, width: 40, justifyContent: 'center', alignItems: 'center' }}
                                        activeOpacity={0.3}
                                        underlayColor='#d0d0d0'
                                        onPress={() => {
                                            this.goBack();
                                        }}
                                    >
                                        <Icon name={getIcon('Close')} style={{ fontSize: 25 }} />
                                    </TouchableHighlight>
                                </Right>
                            </Header>
                            <Header noBorder style={{ minHeight: 36 }}>
                                <Left>
                                    <SpaceHM />
                                    <SText allowFontScaling={true} >Tags:</SText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {
                                            document?.tags?.length > 0 && document?.tags.map((item, index) => {
                                                return (
                                                    <TagOutLine
                                                        color={item.visibility == 'private' ? Colors.functional.primary : Colors.functional.successful}
                                                        label={item.tag}
                                                    />
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </Left>
                            </Header>
                        </LargeHeader>
                    </Animated.View>

                </View>
                <IndicatorLoading loading={this.state.loading} />

                {
                    !this.state.isDownloading ? null : (
                        <Box
                            position='absolute'
                            minWidth={widthResponse * .3}
                            height={50}
                            backgroundColor={'white2'}
                            borderWidth={1}
                            borderColor={'white5'}
                            borderRadius={6}
                            alignSelf='center'
                            bottom={40}
                            justifyContent='center'
                            paddingHorizontal={'xl'}
                        >
                            <Text
                                color='dangerous'
                                fontSize={15}
                            >
                                {getLabel('common.label_downloading')} {formatBytes(this.state.downloadProgress?.bytesWritten || 0)}
                            </Text>
                        </Box>
                    )
                }
            </>
        );
    }
}


const mapStateToProps = () => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        showAlert: (message) => dispatch(showAlert(message)),
        dispatch,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentView)


