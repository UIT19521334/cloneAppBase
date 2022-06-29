/**
 * @file    : styles.js
 * @author  : Manh Le
 * @date    : 2021-06-13
 * @purpose : Create style sheet for component Actions Sheet Custom
*/
import {StyleSheet} from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { heightDevice, widthResponse } from '../../utils/commons/commons';

const styles = StyleSheet.create({
    boxContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    backDrop: {
        height: heightDevice,
        backgroundColor: Colors.black.black1,
        opacity: .5,
        position: 'absolute'
    },
    boxContent: {
        width: widthResponse - 80,
        borderRadius: 10,
        backgroundColor: Colors.white.white1
    },
    header: {
        height: 54,
        backgroundColor: Colors.white.white1,
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: .7,
        borderBottomColor: Colors.black.black4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12
    },
    listAction: {
        width: '100%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    itemView: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        minHeight: 52,
    }
});

export default styles;