import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import { widthDevice } from '../../utils/commons/commons';

const styles = StyleSheet.create({
	headerRight: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flex: 1
	},
	tabs: {
		maxHeight: 40,
		backgroundColor: Colors.white.white1
	},
	scrollTabs: {
		maxHeight: 40,
		backgroundColor: Colors.white.white1,
		borderBottomWidth: 0
	},
	tab: {
		backgroundColor: Colors.white.white1,
		minWidth: 40,
		maxHeight: 40,
		paddingLeft: 8,
		paddingRight: 8,
	},
	tabActive: {
		backgroundColor: Colors.white.white1,
		minWidth: 10,
		maxHeight: 40,
		paddingLeft: 8,
		paddingRight: 8,
	},
	textTabActive: {
		color: Colors.functional.primary,
		fontSize: 14,
		fontWeight: 'bold',
		marginHorizontal: 0,
		marginLeft: 0,
		marginRight: 0,
	},
	textTab: {
		color: Colors.black.black1,
		fontSize: 14
	},
	underLine: {
		height: 2,
		backgroundColor: Colors.functional.primary,
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
})

export default styles;