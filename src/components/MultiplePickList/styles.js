import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
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
	},
	btnSearch: {
		width: 30,
		height: 30,
		backgroundColor: Colors.white.white1
	},
	lstView: {
		height: 'auto',
		maxHeight: 174,
		paddingVertical: 4
	},
	fullWidth: {
		width: '100%'
	}
});

export default styles;