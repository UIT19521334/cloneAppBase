import { StyleSheet } from 'react-native'
import { Colors } from '../../themes/colors/Colors';
import { widthResponse, heightDevice } from '../../utils/commons/commons';

const styles = StyleSheet.create({
    headerCalendarView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 0.3,
        borderColor: Colors.black.black3,
        borderRadius: 6,
        paddingHorizontal: 10,
        marginTop: 10,
        backgroundColor: Colors.white.white2,
        marginLeft: 10,
        marginRight: 10
    },
    txtButtonShowHide: {
        fontSize: 12,
        color: Colors.brand.brand1
    },
    iconButtonShowHide: {
        fontSize: 14,
        color: Colors.brand.brand1,
        marginRight: 10
    },
    btnShowHide: {
        paddingHorizontal: 8,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btnStar: {
        flex: 1,
        maxWidth: 28,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStar: {
        fontSize: 16
    },
    rowHidden: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: Colors.white.white4
    },
    actionsHidden: {
        flex: 1,
        maxWidth: widthResponse * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    actionHiddenContent: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    action: {
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 23
    },
    iconAction: {
        fontSize: 24,
        color: Colors.functional.primary
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