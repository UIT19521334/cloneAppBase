/**
 * @file    : styles.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : create style sheet used for a component custom UI Alert
*/

import { StyleSheet, Platform } from 'react-native'
import { isIphoneX, widthResponse, heightDevice } from '../../utils/commons/commons';
import { Colors } from '../../themes/colors/Colors';
import { systemFont, UIFontSize } from '../../utils/commons/FontSize';

const styles = StyleSheet.create({
    boxContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    backDrop: {
        height: heightDevice,
        backgroundColor: Colors.black.black1,
        opacity: .5,
        position: 'absolute'
    },
    popupContainer: {
        backgroundColor: 'transparent',
        width: widthResponse * 0.7,
        height: null
    },
    boxContent: {
        width: widthResponse * 0.7,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    footer: {
        minHeight: 35,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopColor: Colors.white.white4,
        borderTopWidth: .7,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    content: {
        backgroundColor: Colors.white.white1,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    actionGroup: {
        flex: 1,
        minHeight: 40,
        backgroundColor: 'transparent',
        marginTop: .7,
        width: widthResponse * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    action: {
        flex: 1,
        height: '100%',
        minHeight: 35,
        width: '100%',
        backgroundColor: Colors.white.white1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    actionLeft: {
        borderBottomLeftRadius: 10,
        borderRightWidth: .5,
        borderRightColor: Colors.white.white4
    },
    actionRight: {
        borderRightWidth: .5,
        borderRightColor: Colors.white.white4,
        borderBottomRightRadius: 10
    },
    actionTextCancel: {
        fontSize: systemFont(UIFontSize.DEFAULT),
        color: Colors.functional.primary
    },
    actionText: {
        fontSize: systemFont(UIFontSize.DEFAULT),
        color: Colors.functional.primary
    },
    actionTextDeleted: {
        fontSize: systemFont(UIFontSize.DEFAULT),
        color: Colors.functional.dangerous
    },
    actionBottom: {
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    header: {
        width: '100%',
        minHeight: 30,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: Colors.black.black1,
        fontSize: systemFont(UIFontSize.HEADLINE),
        fontWeight: '700',
        textAlign: 'center'
    },
    messageContent: {
        width: '100%',
        minHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8
    },
    messageContainer: {
        width: '100%',
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    message: {
        fontSize: systemFont(UIFontSize.DEFAULT),
        textAlign: 'center',
        color: Colors.black.black1
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.14,
            }
        }),
    }
})


export default styles;