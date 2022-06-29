/**
 * @file    : DeviceUiInfo.js
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : define constant DeviceUi
 * @member  : Manh Le
*/

import { Platform, PixelRatio, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { isIphoneX } from 'react-native-iphone-x-helper'
const { width, height } = Dimensions.get("window");
export default class DeviceUiInfo {
  static platform = Platform.OS;  //gives the device platform iOS or Android
  static screenSize = { width, height };  //gives the width & height of device
  static screenSizeWithPixelRatio = { width: width * PixelRatio.get(), height: height * PixelRatio.get() }; //calculate the width & height based on device pixel ratio
  static guidelineBaseWidth = 350; //standard width which will be used as base for calculating the scale.
  static guidelineBaseHeight = 680; //standard height which will be used as base for calculating the scale.
  static isIphoneX = isIphoneX() //check if device is iPhoneX
  static isTablet = DeviceInfo.isTablet() //check if device is Tablet
  static appVersion = DeviceInfo.getVersion();  //gives app version
  static fontScale = PixelRatio.getFontScale()  //gives font scale based on pixel ratio
  
  static getPlatform() {
    return this.platform
  }

  static getScreenSize() {
    return this.screenSize
  }

  static getScreenSizeWithPixelRatio() {
    return this.screenSizeWithPixelRatio
  }

  static isIphoneX() {
    return this.isIphoneX
  }

  static scale(size) {
    return this.screenSize.width / this.guidelineBaseWidth * size;
  }

  static verticalScale(size) {
    return (this.screenSize.height) / this.guidelineBaseHeight * size;
  }

  static moderateScale(size, factor = 0.5) {
    return size + (this.scale(size) - size) * factor;
  }
  
  static actualScale(size) {
    const inputSize = DeviceUiInfo.moderateScale(size)
    return inputSize / this.fontScale
  }
}