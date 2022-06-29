import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../../themes/colors/Colors';

const HEADER_MAX_HEIGHT = 215;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white.white1,
        overflow: 'hidden',
        height: HEADER_MAX_HEIGHT,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.black.black5
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        height: HEADER_MAX_HEIGHT,
        resizeMode: 'cover',
    },
    bar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    scrollViewContent: {
        // iOS uses content inset, which acts like padding.
        paddingTop: Platform.OS !== 'ios' ? HEADER_MAX_HEIGHT : 0,
    },
    row: {
        height: 40,
        margin: 16,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    commnetContent: {
        borderColor: Colors.black.black5,
        borderWidth: 1,
        padding: 5,
        borderRadius: 6
    },
    comment: {
        height: 60,
        justifyContent: "flex-start"
    },
    boxAvatar: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        borderWidth: 2,
        borderColor: Colors.white.white1,
        resizeMode: 'cover'
    },
    shadow: {
        shadowColor: Colors.black.black2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        
        elevation: 6
    }
})

export default styles;