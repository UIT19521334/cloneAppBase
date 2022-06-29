/**
 * @file    : commons.js
 * @author  : Manh Le
 * @date    : 2021-08-15
 * @purpose : define func general or constant use in app
 * @member  : Manh Le
*/

import analytics from '@react-native-firebase/analytics';
import React from 'react';
import { DeviceEventEmitter, Dimensions, Linking, NativeModules } from 'react-native';
import RNSimpleCrypto from "react-native-simple-crypto";
import moment from 'moment-timezone';
import { PixelRatio, Platform } from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import Communication from 'react-native-communications';
import { isIphoneX as checkIphoneX } from 'react-native-iphone-x-helper';
import Global from '../../Global';
import { displayMessageWarning } from '../../redux/actions/messagePopup';
import { PARAMS_MESSAGE } from '../../utils/Models/models';
import I18n from '../i18n';
import Orientation from 'react-native-orientation'
import RNCommunications from '../../components/RNCommunications';

export const isIphoneX = checkIphoneX();

export const getLabel = (keyName, params = {}) => I18n.t(keyName, { locale: Global.locale || "vn_vn", ...params });

export const getLabelWithGlobalInstance = (keyName, locale, params = {}) => I18n.t(keyName, { locale: locale || "vn_vn", ...params });

export const AuthContext = React.createContext({});

export const LangueContext = React.createContext({});

export const HEADER_HEIGHT = isIphoneX ? 52 : 64;

export const FOOTER_HEIGHT = isIphoneX ? (64 + 34) : 64;

export const formatDateTime = (date: String) => {
    if (!date) {
        return '';
    }

    return moment(date).format('DD-MM-YYYY HH:mm:ss')
}

export const formatTime = (date: String) => {
    if (!date) {
        return '';
    }

    return moment(date).format('HH:mm')
}

export const callHandler = (phones: Array<String>, recordId?: any, dispatch) => {
    console.log('Phone list: ', phones);
    if (phones.length === 0) {
        let paramsMessage: PARAMS_MESSAGE = {
            title: '',
            message: getLabel('common.label_msg_no_phone_number')
        }

        dispatch(displayMessageWarning(paramsMessage));

        return;
    }

    if (phones.length === 1) {
        console.log('Has trigger call phone');

        Global.makeCallSoftPhone(phones[0], (recordId || ''), dispatch)
    }
    else {
        phones.push(getLabel('common.btn_cancel'));
        let cancelIndex = phones.length - 1 || 0

        ActionSheet.showActionSheetWithOptions(
            {
                title: getLabel('common.label_title_option_select_phone'),
                options: phones,
                destructiveButtonIndex: 0,
                cancelButtonIndex: cancelIndex
            },
            (indexSelected) => {
                if (indexSelected != cancelIndex) {
                    Global.makeCallSoftPhone(phones[indexSelected], (recordId || ''), dispatch)
                }
            }
        )
    }
}

export const SMSHandler = (phones: Array<String>, dispatch) => {
    
    if (phones.length === 0) {
        let paramsMessage: PARAMS_MESSAGE = {
            title: '',
            message: getLabel('common.label_msg_no_phone_number')
        }

        dispatch(displayMessageWarning(paramsMessage));
        return;
    }

    if (phones.length === 1) {
        RNCommunications.text(phones[0], "")
    }
    else {
        phones.push(getLabel('common.btn_cancel'));
        let cancelIndex = phones.length - 1 || 0

        ActionSheet.showActionSheetWithOptions(
            {
                title: getLabel('common.label_title_option_select_phone'),
                options: phones,
                destructiveButtonIndex: 0,
                cancelButtonIndex: cancelIndex
            },
            (indexSelected) => {
                if (indexSelected != cancelIndex) {
                    RNCommunications.text(phones[indexSelected], "")
                }
            }
        );
    }
}

export const sendEmailHandler = (email: Array<String>, dispatch, navigation: any) => {
    if (email.length === 0) {
        setTimeout(() => {
            let paramsMessage: PARAMS_MESSAGE = {
                title: '',
                message: getLabel('common.label_msg_no_email')
            }

            dispatch(displayMessageWarning(paramsMessage));
        }, 500);

        return;
    }

    if (email.length === 1) {
        if (navigation) {
            navigation?.goBack();

            setTimeout(() => {
                RNCommunications.email(email, null, null, null, null);
            }, 400);
        }
        else {
            RNCommunications.email(email, null, null, null, null);
        }
    } 
    else {
        email.push(getLabel('common.btn_cancel'));

        let cancelIndex = email.length - 1 || 0;

        ActionSheet.showActionSheetWithOptions(
            {
                title: getLabel('common.label_title_option_select_email'),
                options: email,
                destructiveButtonIndex: 0,
                cancelButtonIndex: cancelIndex
            },
            (indexSelected) => {
                if (indexSelected != cancelIndex) {
                    if (navigation) {
                        navigation?.goBack();

                        setTimeout(() => {
                            RNCommunications.email([email[indexSelected]], null, null, null, null);
                        }, 400);
                    }
                    else {
                        RNCommunications.email([email[indexSelected]], null, null, null, null);
                    }
                    
                }
            }
        );
    }
}

export const showOnMapHandler = (address: String, dispatch) => {
    if (!address) {
        setTimeout(() => {
            let paramsMessage: PARAMS_MESSAGE = {
                title: '',
                message: getLabel('common.label_msg_no_address')
            }

            dispatch(displayMessageWarning(paramsMessage));
        }, 500);

        return;
    }

    var data = {
        'name': 'Show location',
        'address': address,
        'url': 'https://www.google.com/maps/search/' + encodeURIComponent(address),
        'map': 1
    };

    Linking.openURL(data.url)
        .catch(err => {
            console.error('An error occurred', err)
        });
}

global.bound = Dimensions.get('window');

function getWidth() {
    if (Orientation.getInitialOrientation() == 'PORTRAIT') {
        return global.bound.width; 
    }
    
    return global.bound.height; 
}

function getHeight() {
    if (Orientation.getInitialOrientation() == 'PORTRAIT') {
        return global.bound.height; 
    }

    return global.bound.width; 
}

function getWindowSize() {
    if (Orientation.getInitialOrientation() == 'PORTRAIT') {
        return {
            width: global.bound.width,
            height: global.bound.height,
        }; 
    }

    return {
        height: global.bound.width,
        width: global.bound.height,
    }; 
}

export let windowSize = getWindowSize();

export let widthDevice = getWidth();

export let heightDevice = getHeight();

export let widthResponse = widthDevice >= 768 ? widthDevice * .7 : widthDevice;

export const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const OptionsDay = () => {
    let res = Array.from(Array(32).keys()).map((item, index) => {
        let day = {
            key: item.toString(),
            label: item.toString(),
        };

        return day;
    });

    return res;
}

export const OptionsHour = () => {
    let res = Array.from(Array(24).keys()).map((item, index) => {
        let day = {
            key: item.toString(),
            label: item.toString(),
        };

        return day;
    });

    return res;
}

export const OptionsMinute = () => {
    let res = Array.from(Array(60).keys()).map((item, index) => {
        let day = {
            key: item.toString(),
            label: item.toString(),
        };

        return day;
    });

    return res;
}

export const OptionsRecurring = () => {
    let res = Array.from(Array(14).keys()).map((item, index) => {
        let day = {
            key: (item + 1).toString(),
            label: (item + 1).toString(),
        };

        return day;
    });

    return res;
}

export const OptionsRecurringType = () => {
    let res = [
        {
            "value": "Daily",
            "color": "",
            "assigned": "1",
            "key": "Daily",
            "label": "Hàng ngày"
        },
        {
            "value": "Weekly",
            "color": "",
            "assigned": "1",
            "key": "Weekly",
            "label": "Hàng tuần"
        },
        {
            "value": "Monthly",
            "color": "",
            "assigned": "1",
            "key": "Monthly",
            "label": "Hàng tháng"
        },
        {
            "value": "Yearly",
            "color": "",
            "assigned": "1",
            "key": "Yearly",
            "label": "Hàng năm"
        }
    ];

    return res;
}

export type ModuleName = 'Leads' | 'Contacts' | 'Accounts' | 'Potentials' | 'HelpDesk' | 'SalesOrder' | 'Faq' | 'Call' | 'Meeting' | 'Task' | 'Report' | 'Products' | 'Services';

export type FeatureName = 'EditView' | 'Delete' | 'DetailView' | 'CreateView'

export const iconModules = {
    'Leads': 'user',
    'Contacts': 'user-tie',
    'Accounts': 'building',
    'Potentials': 'sack',
    'HelpDesk': 'file-exclamation',
    'SalesOrder': 'file-invoice-dollar',
    'Faq': 'question-circle',
    'Call': 'phone-alt',
    'Meeting': 'users',
    'Task': 'tasks',
    'Report': 'chart-pie-alt',
    'Products': 'box',
    'Services': 'toolbox'
}

export const getIconModule = (module: ModuleName) => {
    return iconModules[module];
}

type IconTypeName = 'Call' | 'SMS' | 'Location' | 'Follow' | 'More' | 'Mail' | 'Zalo' | 'Edit' | 'Duplicate' | 'Delete'
    | 'Convert' | 'QRCode' | 'Tool' | 'Setting' | 'Profile' | 'Calendar' | 'Time' | 'Search' | 'Notification' | 'Status' | 'Back'
    | 'Menu' | 'QuickCreate' | 'Camera' | 'ShowMore' | 'ShowLess' | 'Close' | 'Filter' | 'Add' | 'CheckIn';

export const iconNames = {
    'Call': 'phone-alt',
    'SMS': 'sms',
    'Location': 'location-arrow',
    'Follow': 'star',
    'More': 'ellipsis-h-alt',
    'Mail': 'envelope',
    'Zalo': 'comment',
    'Edit': 'pen',
    'Duplicate': 'clone',
    'Delete': 'trash-alt',
    'Convert': 'share',
    'QRCode': 'qrcode',
    'Tool': 'toolbox',
    'Setting': 'cog',
    'Profile': 'users',
    'Calendar': 'calendar',
    'Time': 'clock',
    'Search': 'search',
    'Notification': 'bell',
    'Status': 'flag',
    'Back': 'long-arrow-left',
    'Menu': 'bars',
    'QuickCreate': 'plus-circle',
    'Camera': 'camera',
    'ShowMore': 'angle-down',
    'ShowLess': 'angle-up',
    'Close': 'times',
    'Filter': 'filter',
    'Add': 'plus-circle',
    'CheckIn': 'map-marker-check',
}

export const getIcon = (iconType: IconTypeName) => {
    return iconNames[iconType];
}

export const optionsMenu = () => [
    {
        key: 'Leads',
        label: getLabel('common.title_leads'),
        icon: getIconModule('Leads'),
        borderTop: 4,
        module: 'Leads'
    },
    {
        key: 'Contacts',
        label: getLabel('common.title_contacts'),
        icon: getIconModule('Contacts'),
        module: 'Contacts'
    },
    {
        key: 'Organizations',
        label: getLabel('common.title_organizations'),
        icon: getIconModule('Accounts'),
        module: 'Accounts'
    },
    {
        key: 'Opportunities',
        label: getLabel('common.title_opportunities'),
        icon: getIconModule('Potentials'),
        module: 'Potentials'
    },
    {
        key: 'Tickets',
        label: getLabel('common.title_tickets'),
        icon: getIconModule('HelpDesk'),
        borderBottom: Platform.OS == 'ios' ? 4 : 0,
        module: 'HelpDesk'
    },
    {
        isDivider: true
    },
    {
        key: 'Call',
        label: getLabel('common.title_event_call'),
        icon: getIconModule('Call'),
        borderTop: Platform.OS == 'ios' ? 4 : 0,
        module: 'Call'
    },
    {
        key: 'Meeting',
        label: getLabel('common.title_event_meeting'),
        icon: getIconModule('Meeting'),
        module: 'Meeting'
    },
    {
        key: 'Task',
        label: getLabel('common.title_event_task'),
        icon: getIconModule('Task'),
        borderBottom: 4,
        module: 'Task'
    },
];

export const OptionsPeriod = () => [
    {
        key: 'date',
        label: getLabel('common.label_today'),
        label_previous: getLabel('common.label_yesterday'),
    },
    {
        key: 'week',
        label: getLabel('common.label_this_week'),
        label_previous: getLabel('common.label_previous_week'),
    },
    {
        key: 'month',
        label: getLabel('common.label_this_month'),
        label_previous: getLabel('common.label_previous_month'),
    },
    {
        key: 'quarter',
        label: getLabel('common.label_this_quarter'),
        label_previous: getLabel('common.label_previous_quarter'),
    },
    {
        key: 'year',
        label: getLabel('common.label_this_year'),
        label_previous: getLabel('common.label_previous_year'),
    },
];

export const ParentTypeList = (isNewVersion) => {
    if (isNewVersion) {
        return [
            {
                key: 'Potentials',
                label: getLabel('common.title_opportunities')
            },
            {
                key: 'HelpDesk',
                label: getLabel('common.title_tickets')
            },
        ];
    }
    else {
        return [
            {
                key: 'Accounts',
                label: getLabel('common.title_organizations')
            },
            {
                key: 'Leads',
                label: getLabel('common.title_leads')
            },
            {
                key: 'Contacts',
                label: getLabel('common.title_contacts')
            },
            {
                key: 'Potentials',
                label: getLabel('common.title_opportunities')
            },
            {
                key: 'HelpDesk',
                label: getLabel('common.title_tickets')
            },
        ];
    }
}

export const getParentName = (parentId) => {
    if (!parentId) {
        return '';
    }

    let indexResult = ParentTypeList(false).findIndex((parentType, index) => parentType.key == parentId);
    
    if (indexResult != -1) {
        return ParentTypeList(false)?.[indexResult]?.label
    }
    else {
        return '';
    }
}

export const fieldList = {
    'Leads': [
        'salutationtype',
        'firstname',
        'lastname',
        'company',
        'designation',
        'phone',
        'leadsource',
        'mobile',
        'industry',
        'fax',
        'email',
        'secondaryemail',
        'annualrevenue',
        'noofemployees',
        'website',
        'leadstatus',
        'rating',
        'emailoptout',
        'lane',
        'pobox',
        'state',
        'city',
        'code',
        'country',
        'description'
    ],
    'Contacts': [
        'salutationtype',
        'firstname',
        'lastname',
        'birthday',
        'account_id',
        'title',
        'department',
        'contacts_type',
        'leadsource',
        'phone',
        'mobile',
        'homephone',
        'otherphone',
        'fax',
        'email',
        'secondaryemail',
        'assistant',
        'assistantphone',
        'contact_id',
        'emailoptout',
        'reference',
        'donotcall',
        'notify_owner',
        'rating',
        'mailingstreet',
        'otherstreet',
        'mailingcity',
        'othercity',
        'mailingstate',
        'otherstate',
        'mailingzip',
        'otherzip',
        'mailingcountry',
        'othercountry',
        'mailingpobox',
        'otherpobox',
        'description'
    ],
    'Accounts': [
        'accountname',
        'website',
        'phone',
        'tickersymbol',
        'fax',
        'account_id',
        'otherphone',
        'email1',
        'email2',
        'ownership',
        'industry',
        'rating',
        'accounttype',
        'siccode',
        'accounts_company_size',
        'annual_revenue',
        'emailoptout',
        'bill_street',
        'ship_street',
        'bill_city',
        'ship_city',
        'bill_state',
        'ship_state',
        'bill_country',
        'ship_country',
        'description'
    ],
    'Potentials': [
        'potentialname',
        'related_to',
        'contact_id',
        'amount',
        'closingdate',
        'opportunity_type',
        'leadsource',
        'sales_stage',
        'probability',
        'nextstep',
        'forecast_amount',
        'rating',
        'potentialresult',
        'description'
    ],
    'HelpDesk': [
        'ticket_title',
        'contact_id',
        'parent_id',
        'product_id',
        'service_id',
        'ticketpriorities',
        'ticketstatus',
        'ticketcategories',
        'hours',
        'days',
        'description',
        'solution'
    ],
    'Calendar': [
        'subject',
        'date_start',
        'time_start',
        'due_date',
        'taskstatus',
        'taskpriority',
        'parent_id',
        'sendnotification',
        'location',
        'reminder_time',
        'description'
    ],
    'Events': [
        'subject',
        'date_start',
        'time_start',
        'due_date',
        'time_end',
        'activitytype',
        'eventstatus',
        'taskpriority',
        'visibility',
        'sendnotification',
        'location',
        'events_call_direction',
        'missed_call',
        'events_call_purpose',
        'events_call_result',
        'reminder_time',
        'description'
    ]
}

export const getFieldList = (module) => {
    return fieldList[module];
}

export const navigateTo = (screen: string, params: Object) => DeviceEventEmitter.emit('Application.navigateTo', { screen, params });

export const getHeightContent = heightDevice - HEADER_HEIGHT - FOOTER_HEIGHT;

//crypto
export const toHex = RNSimpleCrypto.utils.convertArrayBufferToHex;

export const toUtf8 = RNSimpleCrypto.utils.convertArrayBufferToUtf8;

export const toArrayBuffer = RNSimpleCrypto.utils.convertHexToArrayBuffer;

export const encrypt = async (message, key, iv) => {
    const messageArrayBuffer = RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(message);

    const cipherTextArrayBuffer = await RNSimpleCrypto.AES.encrypt(
        messageArrayBuffer,
        key,
        iv
    );

    return toHex(cipherTextArrayBuffer)
}

export const decrypt = async (encryptMessage, key, iv) => {
    const decryptedArrayBuffer = await RNSimpleCrypto.AES.decrypt(
        toArrayBuffer(encryptMessage),
        toArrayBuffer(key),
        toArrayBuffer(iv)
    );

    return toUtf8(decryptedArrayBuffer);
}

const scale = widthResponse / 320;

export function normalize(size) {
    const newSize = size * scale

    if (Platform.OS === 'ios') {
        return size;
    } 
    else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

export const logScreenView = (screen_name: string) => {
    if (screen_name) {
        analytics().logScreenView({
            screen_name: screen_name,
            screen_class: screen_name
        })
            .then((res) => {
                console.log('logScreenView success: ', res);
            })
            .catch(err => {
                console.log('logScreenView error: ', err);
            });
    }

}

export const QuickActionsApp = () => {
    const actions = [
        {
            type: "checkin", // Required
            title: getLabel('common.tab_check_in'), // Optional, if empty, `type` will be used instead
            subtitle: "",
            icon: "mapmarkercheck", // Icons instructions below
            userInfo: {
                url: "cloudprocrm://checkin" // Provide any custom data like deep linking URL
            }
        }
    ];

    if (Global.getPermissionModule('Call', 'CreateView')) {
        actions.push({
            type: "add_call", // Required
            title: getLabel('common.title_event_call'), // Optional, if empty, `type` will be used instead
            subtitle: "",
            icon: "phone", // Icons instructions below
            userInfo: {
                url: "cloudprocrm://call" // Provide any custom data like deep linking URL
            }
        });
    }

    if (Global.getPermissionModule('Meeting', 'CreateView')) {
        actions.push({
            type: "add_meeting", // Required
            title: getLabel('common.title_event_meeting'), // Optional, if empty, `type` will be used instead
            subtitle: "",
            icon: "users", // Icons instructions below
            userInfo: {
                url: "cloudprocrm://meeting" // Provide any custom data like deep linking URL
            }
        });
    }

    if (Global.getPermissionModule('Task', 'CreateView')) {
        actions.push({
            type: "add_task", // Required
            title: getLabel('common.title_event_task'), // Optional, if empty, `type` will be used instead
            subtitle: "",
            icon: "tasks", // Icons instructions below
            userInfo: {
                url: "cloudprocrm://task" // Provide any custom data like deep linking URL
            }
        });
    }

    return actions;
} 