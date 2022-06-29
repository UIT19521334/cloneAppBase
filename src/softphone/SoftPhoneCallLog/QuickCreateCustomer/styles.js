import { StyleSheet } from 'react-native';
import { Colors } from '../../../themes/colors/Colors';

const styles = StyleSheet.create({
    inputStyle: {
        backgroundColor: Colors.white.white1, 
        borderRadius: 4, 
        borderBottomWidth: 0, 
        color: Colors.black.black1, 
        width: '100%', 
        fontSize: 14, 
        paddingLeft: 6, 
        height: 42
    }
})

export default styles;