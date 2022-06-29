import { StyleSheet } from 'react-native'
import { widthResponse, heightDevice } from '../../../utils/commons/commons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: null,
        height: null,
    },
    icon: {
        fontSize: 30,
        lineHeight: 32,
        paddingHorizontal: 10,
    },
    searchBox: {
        backgroundColor: 'transparent',
        height: null,
        padding: 10,
        margin: 0,
        borderBottomWidth: 1,
        borderColor: '#e2e2e2'
    },
    input: {
        borderRadius: 20,
        paddingLeft: 20,
        padding: 5,
        backgroundColor: '#fff',
        height: 35,
        color: '#000',
        borderColor: '#b7b9b6',
        borderWidth: 1,
        marginTop: 5,
        fontSize: 14
    },
    iconSearch: {
        color: '#333333',
        marginLeft: 10
    },
    listView: {
        height: heightDevice - 175,
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
    listItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#e2e2e2',
        flexDirection: 'row'
    },
    titleReport: {
        fontSize: 14,
        color: '#333333'
    },
    subText: {
        marginTop: 5,
        fontSize: 12,
        color: '#989898'
    },
    viewIconModule: {
        paddingRight: 10,
    },
    iconModule: {
        fontSize: 20,
        color: '#333333'
    },
    viewIconRight: {
        alignItems: 'center',
        position: 'absolute',
        right: 10,
        alignSelf: 'center'
    },
    iconRight: {
        fontSize: 20,
        color: '#858585'
    },
    dropdown: {
        width: null,
        justifyContent: 'center',
    },
    filterDropdown: {
        flexDirection: 'row',
        height: 30,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginRight: 10
    },
    dropdownItem: {
        position: 'absolute',
        padding: 5,
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 3,
        justifyContent: 'center',
        backgroundColor: '#fff',
        width: widthResponse - 20,
        alignSelf: 'center',
        ...Platform.select({
            android: {
                elevation: 15,
            },
            ios: {
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            }
        }),
        // height: (heightDevice - variable.toolbarHeight - variable.footerHeight) * 2 / 3
    },
    list: {
        // height: (height - variable.toolbarHeight - variable.footerHeight - 91)
    },
    textDropdown: {
        marginVertical: 8,
        marginHorizontal: 6,
        fontSize: 12,
        textAlign: 'left',
        textAlignVertical: 'center'
    },
    iconDropDown: {
        fontSize: 20,
        color: '#333333',
        position: 'absolute',
        right: 10,
        alignSelf: 'center'
    },
    txtFolderReport: {
        color: '#333333',
        fontSize: 15,
        marginRight: 10
    }  
})

export default styles;