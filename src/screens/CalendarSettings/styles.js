import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
    userFeedView: { 
		paddingVertical: 10, 
		flexDirection: 'row', 
		alignItems: 'center',
		borderColor: Colors.black.black3,
		borderBottomWidth: 0.5,
		justifyContent: 'space-between'
	},
	iconRemoveUserFeed: {
        color: Colors.black.black1,
        fontSize: 18
	},
	iconViewUserFeed: {
        color: Colors.brand.brand1,
        fontSize: 18
	},
	userFeedText: {
		fontSize: 14,
		color: Colors.black.black2,
    },
    iconTag: {
		fontSize: 20,
		color: '#1187D0'
	},
	tagView: { 
		flexDirection: 'row', 
		paddingHorizontal: 10,
		alignItems: 'center'
	},
	tagItemView: { 
		marginLeft: 10,
		borderWidth: 0.5,
		borderColor: '#1187D0',
		borderRadius: 5,
		padding: 4,
		flexDirection: 'row',
		marginBottom: 5
	},
	tagItemText: {
		color: Colors.brand.brand1
	},
	iconRemoveTag: {
		fontSize: 16,
		color: Colors.brand.brand1,
		paddingRight: 0,
		paddingHorizontal: 5
	},
})

export default styles;