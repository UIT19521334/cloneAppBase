import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/colors/Colors';

const styles = StyleSheet.create({
    collapseButton: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20

    },
    collapseText: {
        fontSize: 16,
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
    titleStyle: {
        fontSize: 16
    }
})

export default styles;