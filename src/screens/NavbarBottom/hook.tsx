import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import { getLabel, logScreenView } from '../../utils/commons/commons';
import Geolocation from '@react-native-community/geolocation';
import Global from '../../Global';
import { useDispatch, useSelector } from 'react-redux'
import { displayMessageError } from '../../redux/actions/messagePopup'
import { HomeState, PARAMS_MESSAGE } from '../../utils/Models/models';
import { check, PERMISSIONS, request, RESULTS, openSettings } from 'react-native-permissions';
import { initLeads, setLoaded, setReload } from '../../redux/actions/leadAction';
export default function useHook() {
    
    const [routes, setRoutes] = React.useState([
        {
            key: 'Home',
            title: getLabel('common.tab_home'),
            icon: 'home'
        },
        {
            key: 'Calendars',
            title: getLabel('common.tab_calendar'),
            icon: 'calendar'
        },
        {
            key: 'CheckIn',
            title: getLabel('common.title_check_in'),
            icon: 'map-marker-check'
        },
        {
            key: 'Notifications',
            title: getLabel('common.tab_notifications'),
            icon: 'bell'
        },
        {
            key: 'GlobalSearch',
            title: getLabel('common.tab_search'),
            icon: 'search'
        },
    ]);

    const [indexSelected, setIndexSelected] = React.useState(0);
    const navigation = useNavigation();
    const [loading, setLoading] = React.useState(false);
    const [hasPushHomeScreen, setPushHomeScreen] = React.useState(false);
    const [gpsLocation, setGpsLocation] = React.useState({});
    const dispatch = useDispatch();
    const _onSelectTab = (index: number) => {
        switch (index) {
            case 0:
                logScreenView('HomeScene');
                if (hasPushHomeScreen) {
                    navigation.push('Home');
                    setPushHomeScreen(true);
                } else {
                    navigation.navigate('Home');
                }
                DeviceEventEmitter.emit('User.FocusHomeScreen')
                setIndexSelected(index);
                break;
            case 1:
                logScreenView('Calendar');
                navigation.navigate('Calendar');
                setIndexSelected(index);
                break;
            case 2:
                logScreenView('QuickCheckIn');
                Global.checkPermissionLocation(() => {
                    navigation.navigate('Camera', { cameraType: 'both', type: 'check_in', data: {}, prevScene: 'TabCheckIn', title: getLabel('common.title_check_in') })
                    Global.getInformationLocationCheckIn(null);
                })
                break;
            case 3:
                logScreenView('Notifications');
                navigation.navigate('Notifications');
                setIndexSelected(index);
                break;
            case 4:
                logScreenView('Global Search');
                navigation.navigate('GlobalSearch');
                setIndexSelected(index);
                break;
        }
    }

    const updateLangue = () => {
        setRoutes([
            {
                key: 'Home',
                title: getLabel('common.tab_home'),
                icon: 'home'
            },
            {
                key: 'Calendars',
                title: getLabel('common.tab_calendar'),
                icon: 'calendar'
            },
            {
                key: 'CheckIn',
                title: getLabel('common.title_check_in'),
                icon: 'map-marker-check'
            },
            {
                key: 'Notifications',
                title: getLabel('common.tab_notifications'),
                icon: 'bell'
            },
            {
                key: 'GlobalSearch',
                title: getLabel('common.tab_search'),
                icon: 'search'
            },
        ])
    }

    const resetCache = () => {
        //Reset lead
        dispatch(initLeads());
    }

    React.useEffect(() => {
        let subscriptionNavigateEvent = DeviceEventEmitter.addListener('Application.navigateTo', ({ screen, params }) => {
            logScreenView(screen)
            setIndexSelected(-1);
            navigation.navigate(screen, params);
        });

        let subscriptionChangeTapEvent = DeviceEventEmitter.addListener('Application.ChangeTab', ({ number }) => {
            _onSelectTab(number);
        });

        let subscriptionChangeLangue = DeviceEventEmitter.addListener('Application.ChangeLangue', () => {
            updateLangue()
        });

        return () => {
            subscriptionNavigateEvent.remove();
            subscriptionChangeTapEvent.remove();
            subscriptionChangeLangue.remove();
        }
    }, []);

    return ({
        routes,
        loading,
        indexSelected,
        setIndexSelected,
        _onSelectTab
    })
}
