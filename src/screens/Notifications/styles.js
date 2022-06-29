import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
    collapseButton: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white.white2,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.white.white5
    },
    badgeView: {
        marginLeft: 4,
        backgroundColor: Colors.functional.dangerous,
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4
    },
    // collapseButton: {
    //     height: 35,
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     paddingHorizontal: 20

    // },
    collapseText: {
        fontSize: 18,
        color: Colors.functional.primary
    },
    collapseIcon: {
        paddingLeft: 10,
        fontSize: 28,
        color: Colors.black.black2,
        color: Colors.functional.primary
    },
    wrapperCollapsibleList: {
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#FFF",
    },
    collapsibleItem: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#CCC",
        padding: 10
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
    }
})

export default styles;