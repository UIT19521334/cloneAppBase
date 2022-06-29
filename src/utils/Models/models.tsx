/**
 * @file    : utils/events/Events.ts
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : file define props type use in app
 * @member  : Manh Le, Khiem Ha
*/

import * as ReactNative from "react-native";

//Alert popup custom
export type ACTION_ALERT = {
    label?: String,
    textStyle?: Object,
    isCancel?: Boolean,
    isHighLight?: Boolean,
    onPress?: Function
}

export type PARAMS_ALERT = {
    title?: String,
    message: String | any,
    actions?: Array<ACTION_ALERT>
}

export type AlertState = {
    isShow: Boolean,
    title: String,
    message: String | any,
    actions: Array<ACTION_ALERT>
}

//notification
export type PARAMS_NOTIFICATION = { title: string, message: string }

export type NotificationState = {
    isShow: boolean,
    title: string,
    message: string,
    icon: string,
    unRead: boolean
}


//message popup
export type PARAMS_MESSAGE = { title: string, message: string }
type PopupMessageType = 'ERROR' | 'SUCCESS' | 'WARING' | 'NONE';

export type MessageTemplateProps = {
    messageData: {
        type: PopupMessageType,
        message: string,
        icon: string,
        color: string,
    },
    onClose: () => void
}


export type PopupMessageState = {
    isShow: boolean,
    type: PopupMessageType,
    title: string,
    message: string,
    icon: string,
    color: string,
}

//Segment Control
export type SegmentControlProps = {
    tabs: Array<string | Object>,
    currentIndex: number,
    segmentedControlBackgroundColor: string,
    activeSegmentBackgroundColor: string,
    textColor: string,
    activeTextColor: string,
    paddingVertical: number,
    onChange: () => void,

}

//ActionSheet custom
type IconSelected = 'check' | 'flag' | String;

export type PARAMS_ACTION_SHEET = {
    options: Array<Object | String>,
    title: String,
    subTitle: String,
    iconSelected: IconSelected,
    backgroundSelectedColor: String,
    selectedColor: String,
    iconSelectedStyle: Object,
    indexSelected: Number,
    onSelected: (index) => void
}

export type ActionSheetState = {
    isShow: Boolean,
    options: Array<Object | String>,
    title: String,
    subTitle: String,
    iconSelected: IconSelected,
    backgroundSelectedColor: String,
    selectedColor: String,
    iconSelectedStyle: Object,
    indexSelected: Number,
    onSelected: (index) => void
}

//Collapse List
export interface CollapsibleListProps extends ReactNative.ViewProps {
    isShow: Boolean,
    /** You can override the default `animationConfig` via this prop */
    animationConfig?: ReactNative.LayoutAnimationConfig;
    buttonContent?: React.ReactNode;
    /** The possition of the button. Default value is `bottom` */
    buttonPosition?: 'top' | 'bottom';
    numberOfVisibleItems?: number;
    onToggle?: (collapsed: boolean) => void;
    wrapperStyle?: ReactNative.ViewStyle;
}

// Sales order 
type ModuleRelated = 'Products' | 'Contacts' | 'Users' | 'Leads' | 'Accounts' | 'Potentials' | 'HelpDesk' | 'Products' | 'Services';
export type RelatedModalProps = {
    module: ModuleRelated,
    selected: ReactNative.StyleProp<Array<object | string | number | any> | object | string | number | any>,
    prevScene: ReactNative.StyleProp<string>,
    fieldRelated: ReactNative.StyleProp<string>,
}

//Components
export type ListItemProps = {
    style?: ReactNative.StyleProp<ReactNative.ViewStyle>,
    icon?: ReactNative.StyleProp<String>,
    iconStyle?: ReactNative.StyleProp<ReactNative.TextStyle>,
    iconColor?: ReactNative.StyleProp<String>,
    iconBorder?: ReactNative.StyleProp<Boolean>,
    thumbnail?: ReactNative.StyleProp<any>,
    thumbnailDefault?: ReactNative.StyleProp<Boolean>,
    thumbnailUri?: ReactNative.StyleProp<String>,
    title: ReactNative.StyleProp<String>,
    numberOfLinesTitle?: ReactNative.StyleProp<Number>,
    titleStyle?: ReactNative.StyleProp<ReactNative.TextStyle>,
    badgeCount?: ReactNative.StyleProp<Number>,
    subTitle?: ReactNative.StyleProp<String>,
    subTitleStyle?: ReactNative.StyleProp<ReactNative.TextStyle>,
    noArrowRight?: ReactNative.StyleProp<Boolean>,
    divider?: ReactNative.StyleProp<Boolean>,
    isIconMenu?: ReactNative.StyleProp<Boolean>,
    dividerStyle?: ReactNative.StyleProp<ReactNative.ViewStyle>,
    selectedText?: ReactNative.StyleProp<String | Object>,
    optionSelected?: ReactNative.StyleProp<Object>,
    selectedTextStyle?: ReactNative.StyleProp<ReactNative.TextStyle>,
    optionsSelect?: ReactNative.StyleProp<Array<Object | String>>,
    onSelected?: (value: any) => void,
    onPress?: () => void,
    isFocused?: ReactNative.StyleProp<Boolean>,
    iconRight?: ReactNative.StyleProp<String>,
    onPressIconRight?: () => void
}

//Home screen
export type Period = {
    key: string,
    label: string,
    label_previous: string
}

export type HomeState = {
    filterPerformance: Period
}

//LEAD
export type LeadState = {
    reload: boolean,
    loaded: boolean,
    indexSelected: number,
    refreshing: boolean,
    loading: boolean,
    firstLoading: boolean,
    loadMore: boolean,
    paging: object,
    keyword: string,
    keywordRelated: string,
    filter: object,
    optionsFilter: Array<any>,
    leads: Array<any>,
    relatedLeads: Array<any>,
    actionsMore: Array<any>,
}

//Contact state
export type ContactState = {
    reload: boolean,
    loaded: boolean,
    indexSelected: number,
    refreshing: boolean,
    loading: boolean,
    firstLoading: boolean,
    loadMore: boolean,
    paging: object,
    keyword: string,
    keywordRelated: string,
    filter: object,
    optionsFilter: Array<any>,
    contacts: Array<any>,
    relatedContacts: Array<any>,
    actionsMore: Array<any>,
}

/*
* Model for handle open from widget app
*/
export type WidgetType = "QUICK_CREATE_ACTIVITY_WIDGET" | "INCOMING_ACTIVITY_WIDGET" | "TICKET_WAIT_PROCESS_WIDGET";

export type WidgetParams = {
    type: WidgetType,
    data: any
}