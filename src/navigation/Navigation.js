/**
 * @file    : Navigation.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : define route in app
 * @member  : Khiem Ha, Manh Le
*/

//Library
import NetInfo from "@react-native-community/netinfo";
import messaging from '@react-native-firebase/messaging';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Container, Text } from 'native-base';
import React from 'react';
import { Animated, DeviceEventEmitter, Linking, Platform, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { isTablet } from 'react-native-device-info';
import Toast from 'react-native-root-toast';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TipProvider from 'react-native-tip';
import { useDispatch } from 'react-redux';
import CheckConnectForDeviceSamsung from "../components/CheckConnectForDeviceSamsung";
import IndicatorLoading from '../components/IndicatorLoading';
import { ProductModal, RelatedModal } from '../components/SearchModal';
import Global from '../Global';
import { Notification as NotificationInApp } from '../package/react-native-in-app-message/index';
import { markReadNotification, markUnreadNotification } from '../redux/actions/notification';
//Import Screen
import AboutScreen from '../screens/About';
import { ActivityForm, ActivityList, ActivityView } from '../screens/Activity/Activity';
import CalendarScreen from '../screens/Calendar';
import CalendarSettingScreen from '../screens/CalendarSettings';
import Camera from '../screens/Camera';
import CheckIn from '../screens/CheckIn';
import CheckUpdate from '../screens/CheckUpdate';
import Configs from '../screens/Configs';
import { ContactForm, ContactList, ContactView } from '../screens/Contact/Contact';
import DocumentList from '../screens/Document/DocumentList';
import DocumentListModule from '../screens/Document/DocumentListModule';
import DocumentView from '../screens/Document/DocumentView';
import { FaqList, FaqView } from '../screens/Faq/Faq';
import ForgotPassword from '../screens/ForgotPassword';
import GlobalSearch from '../screens/GlobalSearch';
import GuideLineCheckConnect from '../screens/GuideLineCheckConnect';
import HomeScreen from '../screens/Home';
import HomeSettings from '../screens/HomeSettings';
import Introduction from '../screens/Introduction';
import { LeadForm, LeadList, LeadView } from '../screens/Lead/Lead';
import Login from '../screens/Login';
import MenuScreen from '../screens/Menu';
import NavbarBottom from '../screens/NavbarBottom';
import NotConnected from '../screens/NotConnection';
import NotificationScreen from '../screens/Notifications';
import { OpportunityForm, OpportunityList, OpportunityView } from '../screens/Opportunity/Opportunity';
import { OrganizationForm, OrganizationList, OrganizationView } from '../screens/Organization/Organization';
import { ProfileForm, ProfileView } from '../screens/Profile';
import { ReportList, ReportView } from '../screens/Report';
import RNWebView from '../screens/RNWebView';
import { SalesOrderForm, SalesOrderList, SalesOrderView } from '../screens/SalesOrder/SalesOrder';
import ScanBarcode from '../screens/ScanBarcode';
import SettingsScreen from '../screens/Settings';
import ChangePassWord from '../screens/Settings/ChangePassword';
import NotificationSetting from '../screens/Settings/NotificationSetting';
import SyncContactsDown from '../screens/SyncContactsDown';
import SyncContactsUp from '../screens/SyncContactsUp';
import { TicketForm, TicketFormForPMS, TicketFormNewVersion, TicketList, TicketView, TicketViewForPMS, TicketViewNewVersion } from '../screens/Ticket/Ticket';
import ToolScreen from '../screens/Tool';
import WhatIsNewScreen from '../screens/WhatIsNewScreen';
import { Colors } from '../themes/colors/Colors';
import { Icon } from '../themes/Icons/CustomIcon';
import { AuthContext, getLabel, LangueContext, widthDevice } from '../utils/commons/commons';
import EVENTS from '../utils/events/Events';
import { WidgetParams } from '../utils/Models/models';

//constant
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// this component check connect
const CheckConnection = () => {
    const [isConnected, setConnected] = React.useState(true)
    const [isShow, setShow] = React.useState(false)
    const [isStarted, setStarted] = React.useState(false)
    const [anim, setAnim] = React.useState(new Animated.Value(0));
    const areaInset = useSafeAreaInsets();
    let timeOutOpenNetWork = null;

    React.useEffect(() => {
        NetInfo.fetch().then(state => {
            setConnected(state.type.toLocaleLowerCase() != 'none');
        });

        const unsubscribe = NetInfo.addEventListener(state => {
            setConnected(state.type.toLocaleLowerCase() != 'none');
            setShow(state.type.toLocaleLowerCase() == 'none');
            setStarted(true);
        });

        return () => {
            unsubscribe();
            timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
        }
    }, []);

    React.useEffect(() => {
        if (isStarted) {
            if (isShow) {
                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                
                Animated.timing(anim, {
                    useNativeDriver: true,
                    toValue: 1,
                    duration: 600
                }).start();
            } 
            else {
                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                
                Global.checkNetworkStatusAsync((response) => {
                    if (response) {
                        timeOutOpenNetWork = setTimeout(() => {
                            Animated.timing(anim, {
                                useNativeDriver: true,
                                toValue: 0,
                                duration: 600
                            })
                            .start(() => {
                                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                            });

                        }, 5000);
                    }
                    else {
                        timeOutOpenNetWork = setTimeout(() => {
                            Animated.timing(anim, {
                                useNativeDriver: true,
                                toValue: 0,
                                duration: 600
                            })
                            .start(() => {
                                timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
                            });

                        }, 5000);
                    }
                });
            }
        }

        return () => { }
    }, [isShow, isStarted])

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: widthDevice,
                height: 22 + areaInset.top,
                backgroundColor: !isConnected ? Colors.functional.dangerous : Colors.functional.successful,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 4,
                top: 0,
                transform: [
                    {
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [- (22 + areaInset.top), 0]
                        })
                    }
                ]
            }}
        >
            <Text
                style={{
                    color: Colors.white.white1,
                    fontSize: 16
                }}
            >
                {!isConnected ? getLabel('common.not_connect_label') : getLabel('common.connected_label')}
            </Text>
        </Animated.View>
    )
}

// this stack includes screens on sidebar 
const MenuTab = () => (
    <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
            gestureDirection: 'horizontal',
            gestureEnabled: false,

        }}
        headerMode='none'
    >
        <Stack.Screen name='Home' component={HomeScreen} options={{ gestureDirection: 'vertical-inverted' }} />
        <Stack.Screen name='Calendar' component={CalendarScreen} />
        <Stack.Screen name='Notifications' component={NotificationScreen} />
        <Stack.Screen name='GlobalSearch' component={GlobalSearch} />
        <Stack.Screen name='Setting' component={SettingsScreen} />
        <Stack.Screen name='Profile' component={ProfileView} />
        <Stack.Screen name='About' component={AboutScreen} />
        <Stack.Screen name='Tool' component={ToolScreen} />
        <Stack.Screen name='LeadList' component={LeadList} />
        <Stack.Screen name='ActivityList' component={ActivityList} />
        <Stack.Screen name='ContactList' component={ContactList} />
        <Stack.Screen name='OrganizationList' component={OrganizationList} />
        <Stack.Screen name='OpportunityList' component={OpportunityList} />
        <Stack.Screen name='SalesOrderList' component={SalesOrderList} />
        <Stack.Screen name='TicketList' component={TicketList} />
        <Stack.Screen name='TicketOpenList' component={TicketList} />
        <Stack.Screen name='FaqList' component={FaqList} />
        <Stack.Screen name='ReportList' component={ReportList} />
        <Stack.Screen name='DocumentListModule' component={DocumentListModule} />
    </Stack.Navigator>
)

// this stack includes all screens
const MainStack = () => {
    const [loading, setLoading] = React.useState(false);

    // init state and handle action
    const [langueState, dispatch] = React.useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'CHANGE_LANGUE':
                    return {
                        ...prevState,
                        locale: action.locale
                    };
            }
        },
        {
            locale: Global.locale || "vn_vn",
        }
    );

    // init actions context
    const langueContext = React.useMemo(
        () => ({
            changeLangue: async locale => {
                dispatch({ type: 'CHANGE_LANGUE', locale: locale });
            },
        }),
        []
    );

    //this func has been change locale
    // And once has changed push broadcast Event change langue
    React.useEffect(() => {
        DeviceEventEmitter.emit('Application.ChangeLangue');

        return () => { };
    }, [langueState.locale])

    //func componentDidMount has add event listening action 
    React.useEffect(() => {
        const logOutEvent = DeviceEventEmitter.addListener('Application.Logout', () => {
            logOut();
        })
        return () => { logOutEvent.remove() }
    }, [])

    // func handle logout
    const logOut = () => {
        setLoading(true);

        var params = {
            RequestAction: 'Logout',
        };

        Global.removeDeviceId(() => {
            //call api logout when remove device id successfully
            Global.callAPI(null, params, data => {
                setLoading(false);
                Global.exitApp();
                Toast.show(getLabel('sidebar.logout_success_msg'));
            }, error => {
                setLoading(false);
                Toast.show(getLabel('sidebar.logout_error_msg'));
            });
        });
    }

    return (
        <LangueContext.Provider value={langueContext}>
            <SafeAreaView
                edges={['right', 'top', 'left']}
                style={{ flex: 1, backgroundColor: Colors.white.white1 }}>
                <Container>
                    <IndicatorLoading loading={loading} />

                    <Stack.Navigator
                        initialRouteName='MenuTab'
                        screenOptions={{
                            gestureEnabled: false,
                            cardOverlayEnabled: true,
                        }}
                        headerMode='none'
                    >
                        <Stack.Screen name='MenuTab' component={MenuTab} />
                    </Stack.Navigator>

                    <NavbarBottom />
                </Container>
            </SafeAreaView>
        </LangueContext.Provider>
    )
}

// this stack includes MainStack and all Modal used in the app
const RootStack = () => {
    const isLargeScreen = widthDevice >= 768;
    const configs = { headerShown: false };

    return (
        <Stack.Navigator
            initialRouteName='MainStack'
            screenOptions={({ route, navigation }) => {
                if (Platform.OS === 'ios' && !isLargeScreen && route?.name != 'ScanBarCode' && route?.name != 'Configs') {
                    return {
                        gestureEnabled: false,
                        cardOverlayEnabled: true,
                        ...TransitionPresets.ModalPresentationIOS
                    };
                }
                else {
                    return {
                        gestureEnabled: false,
                        cardOverlayEnabled: true,
                    };
                }

            }}
            mode='modal'

        >
            <Stack.Screen name='MainStack' component={MainStack} options={configs}/>
            <Stack.Screen name='Configs' component={Configs} options={configs} />
            <Stack.Screen name='ProfileForm' component={ProfileForm} options={configs} />
            <Stack.Screen name='CalendarSetting' component={CalendarSettingScreen} options={configs} />
            <Stack.Screen name='NotificationSetting' component={NotificationSetting} options={configs} />
            <Stack.Screen name='HomeSettings' component={HomeSettings} options={configs} />
            <Stack.Screen name='CheckUpdate' component={CheckUpdate} options={configs} />
            <Stack.Screen name='ChangePassWord' component={ChangePassWord} options={configs} />
            <Stack.Screen name='LeadForm' component={LeadForm} options={configs} />
            <Stack.Screen name='ContactForm' component={ContactForm} options={configs} />
            <Stack.Screen name='SalesOrderForm' component={SalesOrderForm} options={configs} />
            <Stack.Screen name='OrganizationForm' component={OrganizationForm} options={configs} />
            <Stack.Screen name='OpportunityForm' component={OpportunityForm} options={configs} />
            <Stack.Screen name='TicketForm' component={TicketForm} options={configs} />
            <Stack.Screen name='TicketFormForPMS' component={TicketFormForPMS} options={configs} />
            <Stack.Screen name='TicketFormNewVersion' component={TicketFormNewVersion} options={configs} />
            <Stack.Screen name='ActivityForm' component={ActivityForm} options={configs} />
            <Stack.Screen name='LeadView' component={LeadView} options={configs} />
            <Stack.Screen name='ActivityList' component={ActivityList} options={configs} />
            <Stack.Screen name='ActivityView' component={ActivityView} options={configs} />
            <Stack.Screen name='DocumentView' component={DocumentView} options={configs} />
            <Stack.Screen name='ContactView' component={ContactView} options={configs} />
            <Stack.Screen name='OrganizationView' component={OrganizationView} options={configs} />
            <Stack.Screen name='OpportunityView' component={OpportunityView} options={configs} />
            <Stack.Screen name='SalesOrderView' component={SalesOrderView} options={configs} />
            <Stack.Screen name='TicketView' component={TicketView} options={configs} />
            <Stack.Screen name='TicketViewForPMS' component={TicketViewForPMS} options={configs} />
            <Stack.Screen name='TicketViewNewVersion' component={TicketViewNewVersion} options={configs} />
            <Stack.Screen name='FaqView' component={FaqView} options={configs} />
            <Stack.Screen name='RelatedModal' component={RelatedModal} options={configs} />
            <Stack.Screen name='ProductModal' component={ProductModal} options={configs} />
            <Stack.Screen name='ReportView' component={ReportView} options={configs} />
            <Stack.Screen name='Camera' component={Camera} options={configs} />
            <Stack.Screen name='CheckIn' component={CheckIn} options={configs} />
            <Stack.Screen name='ModalLeadList' component={LeadList} options={configs} />
            <Stack.Screen name='ModalContactList' component={ContactList} options={configs} />
            <Stack.Screen name='ModalOrganizationList' component={OrganizationList} options={configs} />
            <Stack.Screen name='ModalOpportunityList' component={OpportunityList} options={configs} />
            <Stack.Screen name='ModalTicketList' component={TicketList} options={configs} />
            <Stack.Screen name='ModalDocumentList' component={DocumentList} options={configs} />
            <Stack.Screen name='RMWebView' component={RNWebView} options={configs} />
            <Stack.Screen name='SyncContactsUp' component={SyncContactsUp} />
            <Stack.Screen name='SyncContactsDown' component={SyncContactsDown} />
            <Stack.Screen name='WhatIsNewScreen' component={WhatIsNewScreen} options={{ header: () => null }} />
            <Stack.Screen name='ScanBarCode' component={ScanBarcode}
                options={{
                    headerBackTitle: ' ',
                    title: getLabel('scanCode.title_scan_code'),
                    headerTransparent: true,
                    headerTitleStyle: {
                        color: Colors.white.white1,
                        fontWeight: 'bold',
                        fontSize: 20
                    },
                    headerLeft: (props) => {
                        return (
                            <View
                                style={{
                                    flex: 1,
                                    marginLeft: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',

                                }}
                            >
                                <TouchableOpacity
                                    onPress={props.onPress}
                                    style={{
                                        flex: 1,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',

                                    }}
                                >
                                    <Icon
                                        name='angle-left'
                                        color={Colors.white.white1}
                                        size={36}
                                    />
                                </TouchableOpacity>

                            </View>
                        )
                    }
                }}
            />
        </Stack.Navigator>
    )
}

// this stack includes all screens without login
const AuthenticatedStack = () => {
    const dimensions = useWindowDimensions();
    const isLargeScreen = dimensions.width >= 768 && isTablet();

    // define dispatch of Redux
    const dispatch = useDispatch();

    // define actions context Authentication
    const { signOut } = React.useContext(AuthContext);

    // ComponentDidMount
    React.useEffect(() => {
        // this func will handle receive push notification from firebase
        // check data type of a notification
        // if it's equal 'CALL_EVENT' => do not any thing
        // else it's not equal 'CALL_EVENT' => push local notification
        messaging().onMessage((message) => {
            const type = message?.data?.type || '';

            if (type && type == 'CALL_EVENT') {

            } else {
                NotificationInApp.show({
                    // random id notification
                    id: 123123123 + Math.floor(Math.random() * 100) + 1,
                    title: message?.notification?.title ? message?.notification?.title : 'New notification!',
                    message: message?.notification?.body,
                    data: message
                });

                DeviceEventEmitter.emit('HasNewNotification', {notification: message.data})

                // mark has unread notification
                dispatch(markUnreadNotification());
            }
        });

        // define event mark has unread notification
        let unReadNotificationListener = DeviceEventEmitter.addListener('Application.markUnreadNotification', () => {
            dispatch(markUnreadNotification());
        });

        // define event mark all read notifications
        let readNotificationListener = DeviceEventEmitter.addListener('Application.markReadNotification', () => {
            dispatch(markReadNotification());
        });

        // define event trigger action logout
        let singOutListener = DeviceEventEmitter.addListener('Authenticate.SignOut', () => {
            signOut();
        });

        // init url open app
        Linking
            .getInitialURL()
            .then(url => handleOpenURL({ url }))
            .catch(console.error);

        // unmount screen
        return () => {
            unReadNotificationListener.remove();
            readNotificationListener.remove();
            singOutListener.remove();
        }
    }, []);

    // Handle open app from deeplink
    let scheme = 'cloudprocrmsales';
    const handleOpenURL = (event) => {
        // parsing query
        let params: WidgetParams = {};

        // check url include app scheme
        if (event.url && event.url.indexOf(scheme + '://') === 0) {
            const paramsUrl = event.url?.slice(scheme.length + 3)?.split('/');

            // this url is the handle quick actions create activity
            if (paramsUrl.length > 0 && paramsUrl[0] == 'actions') {
                params = {
                    type: 'QUICK_CREATE_ACTIVITY_WIDGET',
                    data: {
                        action: paramsUrl[1]
                    }
                }
            }
            // this url is show detail item activity selected
            else if (paramsUrl.length > 0 && paramsUrl[0] == 'incoming-activity' && paramsUrl[1]) {
                params = {
                    type: "INCOMING_ACTIVITY_WIDGET",
                    data: {
                        activityid: paramsUrl[1]
                    }
                }
            }
            // this url is show detail item ticket selected
            else if (paramsUrl.length > 0 && paramsUrl[0] == 'process-ticket' && paramsUrl[1]) {
                params = {
                    type: 'TICKET_WAIT_PROCESS_WIDGET',
                    data: {
                        ticketid: paramsUrl[1]
                    }
                }
            }
        }

        // broadcast event HANDLE_URL_OPEN_FROM_WIDGET
        DeviceEventEmitter.emit(EVENTS.HANDLE_URL_OPEN_FROM_WIDGET, { ...params });
    }

    return (
        <>
            <Drawer.Navigator
                screenOptions={{
                    swipeEnabled: false,
                }}
                drawerType={isLargeScreen ? 'permanent' : 'front'}
                drawerStyle={{ width: isLargeScreen ? '30%' : '80%' }}
                drawerContent={(navigation) => <MenuScreen {...navigation} />}
            >
                <Drawer.Screen name="Root" component={RootStack} />
            </Drawer.Navigator>

            {
                Platform.OS == 'android' ? <CheckConnectForDeviceSamsung /> : <CheckConnection />
            }
        </>
    );

}

// this stack includes all screens without login
const UnAuthenticated = () => {
    const config = { headerShown: false, };

    return (
        <Stack.Navigator
            initialRouteName='Login'
            screenOptions={config}
        >
            <Stack.Screen name="Login" component={Login} options={config} />
            <Stack.Screen name='Configs' component={Configs} options={{ ...config, gestureEnabled: false }} />
            <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={config} />
        </Stack.Navigator>
    )
}

// stack use when user has open app
const InitStack = () => {
    const options = { headerShown: false };

    return (
        <Stack.Navigator
            initialRouteName='Introduction'
            mode='modal'
        >
            <Stack.Screen name="Introduction" component={Introduction} options={options} />
            <Stack.Screen name="NotConnected" component={NotConnected} options={options} />
            <Stack.Screen name="GuideLineCheckConnect" component={GuideLineCheckConnect} options={options} />
        </Stack.Navigator>
    )
}

const Navigation = () => {

    // state authentication
    const [state, dispatch] = React.useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
                    return {
                        ...prevState,
                        userToken: action.token,
                        isLoading: false,
                    };
                case 'SIGN_IN':
                    return {
                        ...prevState,
                        isSignOut: false,
                        userToken: action.token,
                    };
                case 'SIGN_OUT':
                    return {
                        ...prevState,
                        isSignOut: true,
                        userToken: null,
                    };
            }
        },
        {
            isLoading: true,
            isSignOut: false,
            userToken: null,
        }
    );

    // actions context check authentication
    const authContext = React.useMemo(
        () => ({
            signIn: async data => {
                // In a production app, we need to send some data (usually username, password) to server and get a token
                // We will also need to handle errors if sign in failed
                // After getting token, we need to persist the token using `AsyncStorage`
                // In the example, we'll use a dummy token

                dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
            },
            signOut: () => dispatch({ type: 'SIGN_OUT' }),
            signUp: async data => {
                // In a production app, we need to send user data to server and get a token
                // We will also need to handle errors if sign up failed
                // After getting token, we need to persist the token using `AsyncStorage`
                // In the example, we'll use a dummy token

                dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
            },
            restoreToken: async (userToken) => {
                dispatch({ type: 'RESTORE_TOKEN', token: userToken });
            }
        }), []);

    // config theme for navigation
    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            notification: 'red',
        },
    };

    return (
        <AuthContext.Provider value={authContext}>

            <NavigationContainer
                theme={MyTheme}
                ref={(navRef) => { Global.navigationRef = navRef }}
            >
                <Stack.Navigator
                    mode='card'
                >
                    {state.isLoading ? (
                        // We haven't finished checking for the token yet
                        <Stack.Screen
                            name="InitStack"
                            component={InitStack}
                            options={{
                                headerShown: false
                            }}
                        />
                    ) : state.userToken == null ? (
                        // No token found, user isn't signed in
                        <Stack.Screen
                            name="UnAuthenticated"
                            component={UnAuthenticated}
                            options={{
                                headerShown: false,
                                // When logging out, a pop animation feels intuitive
                                animationTypeForReplace: state.isSignOut ? 'pop' : 'push',
                            }}
                        />
                    ) : (
                        // User is signed in
                        <Stack.Screen
                            name="AuthenticatedStack"
                            component={AuthenticatedStack}
                            options={{
                                headerShown: false,
                            }}
                        />
                    )}
                </Stack.Navigator>
            </NavigationContainer>

            {/* Init provider for Tips */}
            <TipProvider
                overlayOpacity={0.5}
                titleStyle={{
                    fontWeight: 'bold',
                    fontSize: 15,
                    marginBottom: 10
                }}

                bodyStyle={{
                    fontSize: 14
                }}
                tipContainerStyle={{
                    padding: 12,
                    borderRadius: 6,
                    maxWidth: widthDevice * .8,
                    elevation: 5,

                }}
                darkMode={false}
                nextButtonLabel={getLabel('guidelines.btn_next')}
                prevButtonLabel={getLabel('guidelines.btn_skip')}
                closeButtonLabel={getLabel('common.btn_close')}
                prevNextTextStyle={{
                    color: Colors.functional.primary
                }}
                prevNextButtonStyle={{

                }}
                onDismissTip={() => {
                    if (state.userToken) {
                        DeviceEventEmitter.emit('tip_tour_dismiss_show');
                    }
                }}
            />
        </AuthContext.Provider>
    );
}

export default Navigation;
