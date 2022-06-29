import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
    collapseButton: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white.white1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.white.white5,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.white.white5,
        minHeight: 50
    },
    badgeView: {
        marginLeft: 4,
        backgroundColor: Colors.functional.dangerous,
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4
    },
    lineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        paddingHorizontal: 12
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
})

export default styles;