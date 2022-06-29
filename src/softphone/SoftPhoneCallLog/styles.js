import { Col } from 'native-base';
import { StyleSheet } from 'react-native'
import variables from '../../../native-base-theme/variables/commonColor';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
    userInfoContent: {
        flexDirection: 'row',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    formCallLog: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    actionsBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: variables.isIphoneX ? 75 : 60,
        paddingHorizontal: 12
    },
    avatarContent: {
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 84 / 2,
        resizeMode: 'cover',
        borderColor: Colors.white.white1,
        borderWidth: 2,
        shadowColor: Colors.white.white5,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.53,
        shadowRadius: 13.97,
    },
    profileContent: {
        flex: 1,
        paddingLeft: 14
    },
    txtCompanyName: {
        color: Colors.white.white1
    },
    txtPhoneNumber: {
        color: Colors.white.white1,
        fontWeight: '700',
        fontSize: 16,
        paddingVertical: 10
    },
    txtName: {
        color: Colors.white.white1,
        fontWeight: '800',
        fontSize: 20
    },
    txtWhite: {
        color: Colors.white.white1
    },
    txtHeading: {
        fontWeight: '700',
        fontSize: 16
    },
    dropdownItem: {
        width: 150,
        position: 'absolute',
        padding: 5,
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 2,
        justifyContent: 'center',
        marginTop: -18
    },
    headerMultiplePickList: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5
    },
    containMultiplePickList: {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: Colors.white.white1,
        borderRadius: 4,
        alignItems: 'center',
    },
    btnAdd: {
        backgroundColor: Colors.functional.primary,
        width: 25, height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 3,
        borderRadius: 4
    },
    iconAdd: {
        fontSize: 22,
        color: Colors.white.white1
    },
    itemPickListContain: {
        flexDirection: 'row',
        backgroundColor: Colors.black.black5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxHeight: 30,
        borderRadius: 4,
        margin: 3
    },
    btnRemoveItem: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconRemove: {
        color: '#333',
        fontSize: 18
    },
    multiplePickList: {
        minHeight: 40,
        marginVertical: 5
    },
    inputContainer: {
        minHeight: 42,
        marginVertical: 5
    },
    inputContentTitle: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 5
    },
    inputRelatedContent: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: Colors.white.white1,
        borderRadius: 4,
    },
    inputGroupContent: {
        flex: 2,
        flexDirection: 'row',
    },
    inputRelated: {
        borderBottomWidth: 0,
        paddingHorizontal: 12,
        color: Colors.black.black1,
        fontSize: 14,
        maxHeight: 42
    },
    btnSearchCompany: {
        width: 36,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d0d0d0',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4
    },
    iconSearch: {
        fontSize: 16,
        color: Colors.black.black1
    },
    rowDropdown: {
        marginVertical: 8,
        marginHorizontal: 6,
        fontSize: 12,
        textAlign: 'left',
        textAlignVertical: 'center'
    },
    dropdownView: {
        backgroundColor: Colors.white.white1,
        borderRadius: 4,
        height: 42,
        paddingHorizontal: 4,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconDropdownView: {
        color: Colors.black.black4,
        fontSize: 16
    },
    otherViewContainer: {
        flexDirection: 'row', 
        minHeight: 40, 
        marginVertical: 5
    }
})

export default styles;