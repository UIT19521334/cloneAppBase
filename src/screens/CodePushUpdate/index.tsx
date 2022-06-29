/**
 * @file        : CodePushUpdate.tsx
 * @author      : Manh Le
 * @date        : 2022-05-30
 * @purpose     : Check if this app has code update
 * @member      : Manh Le
 * */ 

import { Alert, Image, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Portal } from 'react-native-portalize'
import { getLabel, heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons'
import CodePush, { SyncOptions } from 'react-native-code-push';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';

export default function CodePushUpdate() {
    const [downloading, setDownloading] = React.useState(false);
    const [installing, setInstalling] = React.useState(false);
    const [progress, setProgress] = React.useState(null);
    const [syncMessage, setSyncMessage] = React.useState(getLabel('common.msg_checking_new_app'));

    React.useEffect(() => {
        checkUpdateCodePush();

        return () => { }
    }, []);

    const checkUpdateCodePush = () => {
        try {
            CodePush.checkForUpdate()
                .then((status) => {
                    if (status) {

                        const syncOption: SyncOptions = {
                            installMode: CodePush.InstallMode.IMMEDIATE,
                            updateDialog: {
                                title: getLabel('common.title_update_new_path_version'),
                                optionalUpdateMessage: getLabel('common.msg_update_new_path_version', { version: Global.appVersion, appSize: Global.formatBytes(status.packageSize || 0) }),
                                optionalIgnoreButtonLabel: getLabel('common.btn_stay'),
                                optionalInstallButtonLabel: getLabel('common.btn_download'),
                            }
                        }

                        CodePush.sync(
                            syncOption,
                            codePushStatusDidChange,
                            codePushDownloadDidProgress
                        )
                    }
                })
                .catch((err) => {
                    console.log('Check update codepush error: ', err);

                })
        } catch (error) {

        }
    }

    const codePushStatusDidChange = (syncStatus) => {
        switch (syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                setSyncMessage(getLabel('common.msg_checking_new_app'));
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                setDownloading(true);
                setSyncMessage(getLabel('common.msg_downloading_path_update'));

                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                setSyncMessage(getLabel('common.msg_awaiting_user_action'));
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                setSyncMessage(getLabel('common.msg_installing_path_update'));
                setInstalling(true);
                break;
            case CodePush.SyncStatus.UP_TO_DATE:
                setSyncMessage('App up to date.');
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
                setSyncMessage('Cập nhật được huỷ bởi người dùng.');
                setInstalling(false);
                setDownloading(false);
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                setSyncMessage(getLabel('common.msg_installed_path_update'));
                setInstalling(false);
                setDownloading(false);
                Alert.alert(
                    getLabel('common.msg_installed_path_update'),
                    getLabel('common.msg_restart_app'),
                    [
                        {
                            text: getLabel('common.btn_restart'),
                            style: 'destructive',
                            onPress: () => {
                                CodePush.allowRestart();
                            }
                        }
                    ]);
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                setSyncMessage('An unknown error occurred.');
                setInstalling(false);
                setDownloading(false);
                break;
        }
    }

    const codePushDownloadDidProgress = (progress) => {
        setProgress(progress);
    }

    if (!downloading) {
        return null
    }

    return (
        <>
            <Portal>
                <View
                    style={{ ...styles.modalContainer }}
                >
                    <View style={{ ...styles.modalContent }}>
                        <View style={{ ...styles.modalHeader }}>
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderColor: Colors.black.black5,
                                    borderRadius: 8,
                                    padding: 3
                                }}
                            >
                                <Image
                                    source={require('../../assets/images/logocrm.png')}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 8,

                                    }}
                                    resizeMethod='auto'
                                    resizeMode='contain'
                                />
                            </View>

                            <View style={{ width: 12 }} />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 17,
                                        fontWeight: 'bold',
                                    }}
                                    numberOfLines={2}
                                >
                                    {Global.appName}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 'normal',
                                        color: Colors.black.black3
                                    }}
                                    numberOfLines={1}
                                >
                                    {Global.appVersion}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={{
                                color: '#E50019',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            {syncMessage}
                        </Text>

                        <Text
                            style={{
                                color: '#E50019',
                                marginTop: 12
                            }}
                        >
                            { getLabel('common.msg_process_download') }: {Global.formatBytes(progress?.receivedBytes || 0)}/{Global.formatBytes(progress?.totalBytes || 0)}
                        </Text>

                    </View>


                </View>
            </Portal>
        </>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: widthDevice,
        height: heightDevice,
        top: 0,
        left: 0,
        zIndex: Number.MAX_SAFE_INTEGER,
        backgroundColor: 'rgba(0, 0, 0, .4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        width: widthResponse - 32,
        minHeight: 120,
        paddingVertical: 24,
        borderRadius: 12,
        zIndex: 1000,
        elevation: 10,
        ...Platform.select({
            android: {
                elevation: 10,
            },
            ios: {
                shadowColor: "#e0e0e0",
                shadowOffset: {
                    width: 1,
                    height: 1,
                },
                shadowOpacity: 1,
                shadowRadius: 4.14,
            }
        })
    },
    modalHeader: {
        width: widthResponse - 32,
        flexDirection: 'row',
        marginBottom: 30,
        alignItems: 'center',
        paddingHorizontal: 12
    }
})