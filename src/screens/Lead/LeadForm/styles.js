import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../themes/colors/Colors';

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
})

export default styles;