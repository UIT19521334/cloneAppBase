import { widthDevice } from '../../utils/commons/commons';

const React = require('react-native');

const { StyleSheet,Dimensions, Platform } = React;

export default {
    list: {
        flex: 1
  	},
  	contentContainer: {
	    width: widthDevice - 20,
        height: 'auto',
		paddingRight: 20,
        paddingLeft: 12
  	},
  	row: {
	    flexDirection: 'row',
	    alignItems: 'center',
	    flex: 1,
		marginLeft: 0,
        borderRadius: 5,
        borderWidth: 0.5,
        height: 30,
        paddingHorizontal: 10,
        marginBottom: 5,
	    ...Platform.select({
	      	ios: {
	        	width: widthDevice - 52,
	      	},
	      	android: {
	        	width: widthDevice - 52,
	        	elevation: 0,
	      	},
	    })
  	},
    iconMainOwner: {
        fontSize: 20,
        color: '#fff',
        width: 17
    },
    iconOwner: {
        fontSize: 20,
        color: '#212121',
        paddingRight: 0,
    },
    textMainOwner: {
        fontSize: 12,
        color: '#fff',
        marginLeft: 10,
        marginRight: 37
    },
    textOwner: {
        fontSize: 12,
        color: '#212121',
        marginLeft: 10,
        marginRight: 64
    },
    rowMainOwner: {
        borderColor: '#1187D0',
        backgroundColor: '#1187D0'
    },
    rowOwner: {
        borderColor: '#212121',
        backgroundColor: '#fff'
    },
    rowViewUser: {
        borderWidth: 0.5,
        borderColor: '#707070',
        padding: 10,
    },
    iconMoveUp: {
        color: '#1187D0',
        marginRight: 15,
        marginTop: 1
    },
}
