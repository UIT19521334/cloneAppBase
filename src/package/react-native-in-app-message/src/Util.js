import { Dimensions } from 'react-native';
import { heightDevice, widthDevice } from '../../../utils/commons/commons';

export class Util {
  static isIphoneX() {
    return (heightDevice / widthDevice) > 2.163;
  }
}
