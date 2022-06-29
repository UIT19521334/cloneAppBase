import {
    StyleSheet,
    Dimensions,
} from 'react-native';
import variables from '../../../native-base-theme/variables/commonColor'
import { heightDevice, isIphoneX, widthDevice } from '../../utils/commons/commons';
var height = heightDevice;
var width = widthDevice;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },

    callOptionContainer: {
        height: 70,
        width: 280,
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 200,
    },

    callActionContainer: {
        position: 'absolute',
        bottom: 80,
        width: width
    },
    callGroupActionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0
    },

    buttonEnd: {
        position: 'absolute',
        bottom: height < 698 ? 30 : 50,
        width: width - 30,
        alignItems: 'center',
    },

    button: {
        width: 64,
        height: 64,
    },

    userId: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: variables.isIphoneX ? 45 : 30,
    },

    callState: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    localView: {
        backgroundColor: 'grey',
        position: 'absolute',
        top: 50,
        right: 30,
        width: 100,
        height: 150,
        zIndex: 1,
    },
    remoteView: {
        backgroundColor: 'black',
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 0,
    },
    camera: {
        position: 'absolute',
        top: 40,
        left: 0,
        width: 40,
        height: 40,
        zIndex: 2,
    },
    switchCamera: {
        position: 'absolute',
        top: 10,
        left: 20,
        width: 40,
        height: 40,
        zIndex: 2,
    },
    avatar: {
        // width: height < 698 ? 80 : 110,
        // height: height < 698 ? 80 : 110,
        // borderRadius: height < 698 ? 80/2 : 110 / 2,
        marginTop: isIphoneX ? 42 : 20,
        marginBottom: 40,
        borderWidth: 1,
        resizeMode: 'cover',
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.53,
        shadowRadius: 13.97
    }
});

export default styles