import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../../themes/colors/Colors';


const styles = StyleSheet.create({
    centerElement: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    shadow: {
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                shadowColor: Colors.white.white1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.14,
            }
        }),
    }
})

export default styles;