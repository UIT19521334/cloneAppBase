import { StyleSheet } from 'react-native'
import { widthResponse, heightDevice } from '../../utils/commons/commons';
import variable from '../../../native-base-theme/variables/commonColor';

const styles = StyleSheet.create({
    container: {
		flex: 1,
		width: null,
		height: null,
	},
	icon: {
		fontSize: 30,
		lineHeight: 32,
		paddingHorizontal: 10
	},
	searchBox: {
		backgroundColor: '#42ABEB',
		flexDirection: 'row',
		height: null,
		padding: 8,
		margin: 0,
	},
	input: {
		borderRadius: 15,
		paddingLeft: 20,
		padding: 5,
		backgroundColor: '#fff',
		height: 30,
		color: '#000',
		borderColor: '#b7b9b6',
		borderWidth: 1,
	},
	iconSearch: {
		color: '#fff',
		marginLeft: 10
	},
    listView: {
        height: heightDevice - 175,
    },
	left: {
		flex: 7,
	},
	right: {
		flex: 3,
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	iconFavorite: {
		color: '#18191a',
	},
	swipeRowBack: {
		minHeight: 60,
		alignItems: 'center',
		backgroundColor: '#5b686f',
		flex: 5,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
	},
	editBtn: {
		backgroundColor: '#297fb8',
		right: 0,
        width: 100
	},
	deleteBtn: {
		backgroundColor: '#d13f4a',
		right: 0,
        width: 100
	},
	moreBtn: {
		backgroundColor: '#2aa876',
		right: 0,
        width: 100
	},
    swipeBtn: {
		alignItems: 'center',
        top: 0,
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
	},
    swipeBtnText: {
        alignSelf: 'stretch',
        textAlign: 'center',
        color: 'white',
		fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
    },
	bookBtn: {
		backgroundColor: '#e7be27',
		right: 0,
        width: 100
	},
	btnClose: {
		position: 'absolute',
		top: variable.isIphoneX && Platform.OS == 'ios' ? 24 : 10,
		right: 0,
		padding: 5,
		zIndex: 1000,
		marginTop: 10
	},
	modal: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		position: 'absolute',
		height: heightDevice
	},
	modalHeader: {
		height: variable.toolbarHeight,
		paddingTop: variable.statusBarHeight > 0 ? variable.statusBarHeight + 5 : 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1187D0'
	},
	modalTitle: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 14,
	},
	viewItemContact: {
		flexDirection: 'row', 
		padding: 10
	},
	viewCheckBox: {
		alignSelf: 'center', 
		justifyContent: 'center', 
		marginLeft: 10
	},
	viewContentContact: {
		alignSelf: 'center', 
		justifyContent: 'center', 
		marginLeft: 20 
	},
	textNameContact: {
		fontSize: 14,
	},
	textSubContentContact: {
		fontSize: 12,
		fontStyle: 'italic'
	},
	footer: {
    	flex: 1,
    	flexDirection: 'row',
    	width: widthResponse,
    	borderWidth: 0,
    	alignSelf: 'stretch',
    	justifyContent: 'flex-start',
    	backgroundColor: '#ebebeb',
	},
	titleContactsList: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1187D0'
	},
	unDoView: {
		height: variable.footerHeight,
		paddingHorizontal: 20,
		justifyContent: 'space-between',
		flexDirection: 'row',
		backgroundColor: '#212121',
		position: 'absolute',
		bottom: 0,
		alignItems: 'center',
		opacity: 0.9
	},
	txtUndo: {
		fontSize: 14,
		color: '#ffffff'
	},
	txtButtonUndo: {
		fontWeight: 'bold',
	}
})

export default styles;