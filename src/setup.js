import { ThemeProvider } from "@shopify/restyle";
import moment from 'moment';
import { StyleProvider } from 'native-base';
import React, { Component } from 'react';
import { LogBox } from 'react-native';
import { Host } from 'react-native-portalize';
import { RootSiblingParent } from 'react-native-root-siblings';
import { Provider } from 'react-redux';
//import component
import getTheme from '../native-base-theme/components';
import variables from '../native-base-theme/variables/commonColor';
import ActionSheetCustom from './components/ActionSheetCustom';
import AlertPopup from './components/AlertPopup';
import MessagePopup from './components/MessagePopup';
import configureStore from './configureStore';
import Global from './Global';
import Navigation from './navigation/Navigation';
import { Notification } from './package/react-native-in-app-message/index';
import PermissionSetting from './screens/PermissionSetting';
import RequirePermissionAndroid from './softphone/RequirePermissionAndroid';
import SoftPhoneModule from './softphone/SoftPhoneModule';
import CodePushUpdate from './screens/CodePushUpdate';
import theme from './themes/themes';

require('moment/locale/vi');
require('moment/locale/en-au');

moment.locale(Global.locale == 'vn_vn' ? 'vi' : 'en-au');

// Disable warnings
LogBox.ignoreAllLogs(true)

class Setup extends Component {

    constructor() {
        super();

        this.state = {
            isLoading: false,
            store: configureStore(() => this.setState({ isLoading: false })),
            isReady: false
        };
    }

    UNSAFE_componentWillMount() {
        this.setState({ isReady: true });
    }

    componentDidMount() {
        Global.app = this;
    }

    render() {
        return (
            <StyleProvider style={getTheme(variables)}>
                <ThemeProvider {...{ theme }}>
                    <Provider store={this.state.store}>
                        <Host>
                            <RootSiblingParent>
                                <Navigation />
                                <MessagePopup />
                                <AlertPopup />
                                <ActionSheetCustom />
                                <PermissionSetting />
                                <SoftPhoneModule />
                                <RequirePermissionAndroid />
                                <CodePushUpdate />
                            </RootSiblingParent>
                        </Host>
                    </Provider>

                    <Notification
                        hasSound={true}
                        hideStatusBar={false}
                        duration={8000}
                        onPress={(data) => {
                            Notification.hide();
                            Global.handleNotification(data?.data, 0, undefined)
                        }}
                        playSoundNotification={() => Global.playSoundNotification()}
                    />
                </ThemeProvider>
            </StyleProvider>
        );
    }
}

export default Setup;