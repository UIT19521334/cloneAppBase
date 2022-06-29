import AsyncStorage from '@react-native-community/async-storage';
import React, { Component } from 'react';
import { DeviceEventEmitter, Platform, StyleSheet } from 'react-native';
import Global from '../../Global';
import SoftPhoneEvents from '../SoftPhoneEvents';
import StringeeModule from './StringeeModule';
import StringeeForAndroidModule from './StringeeForAndroidModule';

class SoftPhoneModule extends Component {

  state = {
    isInitialStringee: false,
    softPhoneToken: {}
  }

  componentDidMount() {

    AsyncStorage.getItem(SoftPhoneEvents.EVENT_INITIAL_STRINGEE_SOFT_PHONE, (error, data) => {
      console.error('EVENT_INITIAL_STRINGEE_SOFT_PHONE', data);
      const softPhoneToken = JSON.parse(data || '{}');
      if (data && Object.keys(softPhoneToken).length > 0) {
        Global.hasApplyOtherStringeeCall = true;
        this.setState({ softPhoneToken: JSON.parse(data) }, () => {
          this.setState({ isInitialStringee: true });
        });
      }
      else {
        this.subscriberSoftPhone = DeviceEventEmitter.addListener(SoftPhoneEvents.EVENT_INITIAL_SOFT_PHONE, this.checkCallCenterIntegration.bind(this));
      }
    });
  }

  componentWillUnmount() {
    this.subscriberSoftPhone && this.subscriberSoftPhone.remove();
  }

  /// MARK: - ACTION HANDLER
  // =================================== Check has config call center integration =================================
  checkCallCenterIntegration(softPhoneToken) {
    if (Global.packageFeatures?.CallCenterIntegration === '1' && softPhoneToken) {
      Global.softPhoneToken = softPhoneToken;
      Global.hasApplyOtherStringeeCall = true;
      if (softPhoneToken?.gateway === 'Stringee') {
        this.setState({ softPhoneToken: softPhoneToken }, () => {
          this.setState({ isInitialStringee: true });
        });
      }
      else {
        // handle integration with other softphone  
      }
    }
  }

  render() {
    return (
      <>
        {/* Inital stringee */}
        {
          this.state.isInitialStringee ? (
            <>
              {
                Platform.OS == 'ios' ? (
                  <StringeeModule softPhoneToken={this.state.softPhoneToken} />
                )
                  :
                  (
                    <StringeeForAndroidModule softPhoneToken={this.state.softPhoneToken} />
                  )
              }
            </>
          )
            : null
        }

      </>
    )
  }
}

export default SoftPhoneModule;

const styles = StyleSheet.create({})