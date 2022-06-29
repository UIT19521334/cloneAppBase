import React from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import IndicatorLoading from '../../components/IndicatorLoading';

const webapp = require('./index.html');

// fix https://github.com/facebook/react-native/issues/10865
const patchPostMessageJsCode = `(function() {
  window.postMessage = function(data) {
window.ReactNativeWebView.postMessage(data);
};
})()`;

// const patchPostMessageFunction = function() {
//   var originalPostMessage = window.postMessage;

//   var patchedPostMessage = function(message, targetOrigin, transfer) { 
//     originalPostMessage(message, targetOrigin, transfer);
//   };

//   patchedPostMessage.toString = function() { 
//     return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
//   };

//   window.postMessage = patchedPostMessage;
// };

// const patchPostMessageJsCode = '(' + String(patchPostMessageFunction) + ')();';

class CKEditor extends React.Component {
  state = {
    webViewNotLoaded: true,
    loading: false,
  };

  onError = error => {
    Alert.alert('WebView onError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]);
  };

  renderError = error => {
    Alert.alert('WebView renderError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]);
  };

  createWebViewRef = webview => {
    this.webview = webview;
  };

  postMessage = payload => {
    // only send message when webview is loaded
    if (this.webview) {
      console.log(`WebViewEditor: sending message ${payload}`);
      this.webview.postMessage(payload);
    }
  };

  handleMessage = event => {
    console.log('event', event);
    let msgData;
    try {
      msgData = event.nativeEvent.data;
      console.log('msgData', msgData);
      this.props.onChange(msgData);
    } catch (err) {
      console.warn(err);
      return;
    }
  };

  onWebViewLoaded = () => {
    console.log('Webview loaded: ', this.props.content);
    this.setState({ webViewNotLoaded: false, loading: false });
    this.postMessage('MobileMessage:' + this.props.content);

  };

  showLoadingIndicator = () => {
    return (
      <View style={styles.activityOverlayStyle}>
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" animating={this.state.webViewNotLoaded} color="green" />
        </View>
      </View>
    );
  };

  render() {
    return (
      <>
        <WebView
          ref={this.createWebViewRef}
          injectedJavaScript={patchPostMessageJsCode}
          style={{ flex: 1}}
          scrollEnabled={false}
          source={Platform.OS == 'android' ? { uri: 'file:///android_asset/www/index.html' } : webapp}
          scalesPageToFit={false}
          onError={this.onError}
          renderError={this.renderError}
          originWhitelist={['*']}
          javaScriptEnabled
          onLoadStart={(e) => {
            console.log('Load start: ');
            this.setState({loading: true});
          }}
          onLoadEnd={this.onWebViewLoaded}
          onMessage={this.handleMessage}
          renderLoading={this.showLoadingIndicator()}
          mixedContentMode="always"
        />
         <IndicatorLoading loading={this.state.loading}/>
        
      </>
    );
  }
}

const styles = StyleSheet.create({
  activityOverlayStyle: {
    ...StyleSheet.absoluteFillObject,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 0
  },
  activityIndicatorContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  }
});

export default CKEditor;
