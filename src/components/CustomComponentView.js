import { Input, Item, Label } from 'native-base';
import React, { Component, useRef, useState } from 'react';
import {
    FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet, Switch, Text,
    TextStyle, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View,
    ViewStyle
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Menu, { MenuItem } from 'react-native-material-menu';
import Animated, { Easing } from 'react-native-reanimated';
import TimeAgo from 'react-native-timeago';
import styled from 'styled-components';
import Global from '../Global';
import { Colors } from '../themes/colors/Colors';
import { Icon } from '../themes/Icons/CustomIcon';
import { Box } from '../themes/themes';
import { getLabel, widthResponse, normalize } from '../utils/commons/commons';
import { ListItemProps } from '../utils/Models/models';
import ModalSelect from './ModalSelect';
import NotificationTitle from './NotificationTitle';
import SegmentedControl from './SegmentedControl';
import CurrencyInput, { formatNumber } from 'react-native-currency-input';

//Component View
export const Header = styled.View`
    min-height: 52px;
    flex-direction: row;
    background-color: ${props => {
        if (props.transparent) {
            return 'transparent';
        }

        return '#fff'
    }}; 
    border-bottom-width: ${props => props.noBorder ? `0px` : `0.3px`};
    border-bottom-color: #b2b2b2;
`

export const HeaderTransparent = styled.View`
    min-height: 52px;
    flex-direction: row;
    background-color: #fff;
    opacity: 0.95;
    border-bottom-width: ${props => props.noBorder ? `0px` : `0.3px`};
    border-bottom-color: #b2b2b2;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 10;
`

export const LargeHeader = styled.View`
    min-height: 64px;
    flex-direction: row;
    background-color: #fff;
    border-bottom-color: #b2b2b2;
    border-bottom-width: 0.2px;
    flex-direction: column;
`
export const Left = styled.View`
    flex: 3;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
`
export const Right = styled.View`
    flex: 3;
    align-items: center;
    justify-content: flex-end;
    flex-direction: row
`

export const Body = styled.View`
    flex: 6;
    align-items: center;
    justify-content: center;
    padding-vertical: 10px;
`

export const BoxCustom = styled.View`
    ${props => {
        if (props.width) {
            return `width: ${props.width}px`;

        }

    }}
    ${props => {
        if (props.height) {
            return `height: ${props.height}px`;
        }
    }}
    ${props => {
        if (props.center) {
            return `justify-content: center; align-items: center`;
        }

        return null;
    }}
    ${props => {
        if (props.justifyContent) {
            return `justify-content: ${props.justifyContent};`;
        }

        return null;
    }}
    ${props => {
        if (props.alignItems) {
            return `align-items: ${props.alignItems}`;
        }

        return null;
    }}
    ${props => {
        if (props.row) {
            return `flex-direction: row;`;
        }

        return null;
    }}
    ${props => {
        if (props.coloumn) {
            return `flex-direction: coloumn;`;
        }

        return null;
    }}
    ${props => {
        if (props.padding) {
            return `padding: ${props.padding}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.paddingVertical) {
            return `padding-vertical: ${props.paddingVertical}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.paddingHorizontal) {
            return `padding-horizontal: ${props.paddingHorizontal}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.transparent) {
            return `background-color: transparent;`
        }
        return `background-color: #fff;`
    }}
    ${props => {
        let borderRadius = '';

        if (props.rouned) {
            borderRadius += `border-radius: 100px;`
        }

        if (props.radiusBottom) {
            borderRadius += `border-bottom-right-radius: ${props.radiusBottom}px;`
            borderRadius += `border-bottom-left-radius: ${props.radiusBottom}px;`
        }

        if (props.radiusTop) {
            borderRadius += `border-top-right-radius: ${props.radiusTop}px;`
            borderRadius += `border-top-left-radius: ${props.radiusTop}px;`
        }

        if (props.radiusRight) {
            borderRadius += `border-bottom-right-radius: ${props.radiusRight}px;`
            borderRadius += `border-top-right-radius: ${props.radiusRight}px;`
        }

        if (props.radiusLeft) {
            borderRadius += `border-top-left-radius: ${props.radiusLeft}px;`
            borderRadius += `border-bottom-left-radius: ${props.radiusBottom}px;`
        }

        return borderRadius;
    }}
    ${props => {
        let borderWidth = '';

        if (props.border) {
            borderWidth += `border-width: ${props.border}px;`;
            borderWidth += `border-color: ${Colors.white.white5};`;
        }

        if (props.borderTopWidth) {
            borderWidth += `border-top-width: ${props.borderTopWidth}px;`;
            borderWidth += `border-top-color: ${Colors.white.white5};`;
        }

        if (props.borderBottomWidth) {
            borderWidth += `border-bottom-width: ${props.borderBottomWidth}px;`;
            borderWidth += `border-bottom-color: ${Colors.white.white5};`;
        }

        if (props.borderRightWidth) {
            borderWidth += `border-right-width: ${props.borderRightWidth}px;`;
            borderWidth += `border-right-color: ${Colors.white.white5};`;
        }

        if (props.borderLeftWidth) {
            borderWidth += `border-left-width: ${props.borderLeftWidth}px;`;
            borderWidth += `border-left-color: ${Colors.white.white5};`;
        }

        return borderWidth;
    }}
    ${props => {
        if (props.flex) {
            return `flex: ${props.flex};`;
        }

        return '';
    }}
    ${props => {
        if (props.shadow) {
            return `box-shadow: 0px 1px 3px #b2b2b2;`;
        }
    }}
`

export const BoxButton = styled.TouchableOpacity`
    ${props => {
        if (props.width) {
            return `width: ${props.width}px`;

        }

    }}
    ${props => {
        if (props.height) {
            return `height: ${props.height}px`;
        }
    }}
    ${props => {
        if (props.center) {
            return `justify-content: center; align-items: center`;
        }

        return null;
    }}
    ${props => {
        if (props.justifyContent) {
            return `justify-content: ${props.justifyContent};`;
        }

        return null;
    }}
    ${props => {
        if (props.alignItems) {
            return `align-items: ${props.alignItems}`;
        }

        return null;
    }}
    ${props => {
        if (props.row) {
            return `flex-direction: row;`;
        }

        return null;
    }}
    ${props => {
        if (props.coloumn) {
            return `flex-direction: coloumn;`;
        }

        return null;
    }}
    ${props => {
        if (props.padding) {
            return `padding: ${props.padding}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.paddingVertical) {
            return `padding-vertical: ${props.paddingVertical}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.paddingHorizontal) {
            return `padding-horizontal: ${props.paddingHorizontal}px;`;
        }

        return null;
    }}
    ${props => {
        if (props.transparent) {
            return `background-color: transparent;`
        }
        return `background-color: #fff;`
    }}
    ${props => {
        let borderRadius = '';

        if (props.rouned) {
            borderRadius += `border-radius: 100px;`
        }

        if (props.borderRadius) {
            borderRadius += `border-radius: ${props.borderRadius}px;`
        }

        if (props.radiusBottom) {
            borderRadius += `border-bottom-right-radius: ${props.radiusBottom}px;`
            borderRadius += `border-bottom-left-radius: ${props.radiusBottom}px;`
        }

        if (props.radiusTop) {
            borderRadius += `border-top-right-radius: ${props.radiusTop}px;`
            borderRadius += `border-top-left-radius: ${props.radiusTop}px;`
        }

        if (props.radiusRight) {
            borderRadius += `border-bottom-right-radius: ${props.radiusRight}px;`
            borderRadius += `border-top-right-radius: ${props.radiusRight}px;`
        }

        if (props.radiusLeft) {
            borderRadius += `border-top-left-radius: ${props.radiusLeft}px;`
            borderRadius += `border-bottom-left-radius: ${props.radiusLeft}px;`
        }

        return borderRadius;
    }}
    ${props => {
        let borderWidth = '';

        if (props.border) {
            borderWidth += `border-width: ${props.border}px;`;
            borderWidth += `border-color: ${Colors.white.white5};`;
        }

        if (props.borderTopWidth) {
            borderWidth += `border-top-width: ${props.borderTopWidth}px;`;
            borderWidth += `border-top-color: ${Colors.white.white5};`;
        }

        if (props.borderBottomWidth) {
            borderWidth += `border-bottom-width: ${props.borderBottomWidth}px;`;
            borderWidth += `border-bottom-color: ${Colors.white.white5};`;
        }

        if (props.borderRightWidth) {
            borderWidth += `border-right-width: ${props.borderRightWidth}px;`;
            borderWidth += `border-right-color: ${Colors.white.white5};`;
        }

        if (props.borderLeftWidth) {
            borderWidth += `border-left-width: ${props.borderLeftWidth}px;`;
            borderWidth += `border-left-color: ${Colors.white.white5};`;
        }

        return borderWidth;
    }}
    ${props => {
        if (props.flex) {
            return `flex: ${props.flex};`;
        }

        return '';
    }}
`

export const SpaceS = styled.View`
    padding: 5px;
`
export const SpaceM = styled.View`
    padding: 8px;
`
export const SpaceL = styled.View`
    padding: 12px;
`
export const SpaceHS = styled.View`
    padding-horizontal: 5px;
`
export const SpaceHM = styled.View`
    padding-horizontal: 8px;
`
export const SpaceHL = styled.View`
    padding-horizontal: 12px;
`

export const Title = styled.Text`
    font-size: ${props => props.fontSize || 18}px;
    font-weight: ${props => props.fontWeight || 600};
    color: ${props => props.color || '#333333'};
`

export const IconRight = styled.TouchableOpacity`
    align-items: flex-end;
    justify-content: center;
    margin-right: 20px;
`

export const IconViewLeft = styled.TouchableOpacity`
    padding-right: 10px
`

export const Container = styled.View`
    flex: 1;
`

export const ContentView = styled.View`
    flex: 1;
    background-color: ${props => props.background};
    border-bottom-color: #e2e2e2;
    border-bottom-width: 0.2px;
    border-top-color: #e2e2e2;
    border-top-width: 0.5px;
`

ContentView.defaultProps = {
    background: Colors.white.white2
}

export const ContentScrollView = styled.ScrollView`
    flex: 1;
    background-color: ${props => props.background};
    border-bottom-color: #e2e2e2;
    border-bottom-width: 0.2px;
    border-top-color: #e2e2e2;
    border-top-width: 0.5px;
`

ContentScrollView.defaultProps = {
    background: Colors.white.white2
}

export const SectionView = styled.View`
    padding-horizontal: ${props => props.noPaddingHorizontal ? 0 : 20}px;
    padding-vertical: ${props => props.noPaddingVertical ? 0 : 10}px;
    background-color: #fff;
    ${props => {
        if (props.noBorderTopWidth) {
            return '0px';
        }
        else {
            return `border-top-width: 0.5px`;
        }
    }};
    ${props => {
        if (props.noBorderBottomWidth) {
            return '0px';
        }
        else {
            return `border-bottom-width: 0.5px`;
        }
    }};
    border-color: #e2e2e2;
`
SectionView.defaultProps = {
    noBorderBottomWidth: false,
    noBorderTopWidth: false
}

export const ItemViewOpacity = styled.TouchableOpacity`
    background-color: #fff;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    min-height: 52px;
`

export const ItemViewHighLight = styled.TouchableHighlight`
    background-color: #fff;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    min-height: 52px;
`

export const ItemView = styled.View`
    flex-direction: ${props => props.row || props.column || 'column'};
    padding-vertical: 4px;
`

export const Divider = styled.View`
    max-height: ${StyleSheet.hairlineWidth}px;
    height: ${StyleSheet.hairlineWidth}px;
    background-color: ${Colors.black.black4};
`

export const ItemContentView = styled.View`
    flex: 1;
    flex-direction: row;
`

export const ItemIconView = styled.View`
    align-items: flex-start;
    justify-content: center;
    width: 44px;
`

export const ItemBodyView = styled.View`
    flex: 1;
    align-items: flex-start;
    justify-content: center;
`

export const Thumbnail = styled.Image`
    width: 44px;
    height: 44px;
    border-radius: 27px;
`

export const ThumbnailView = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 27px;
    margin-right: 16px;
    box-shadow: 0px 1px 3px #b2b2b2;
`

export const ImageViewRounded = styled.TouchableOpacity`
    width: ${props => props.height || 54}px;
    height: ${props => props.height || 54}px;
    border-radius: ${props => props.height ? (props.height / 2) : (54 / 2)}px;
    box-shadow: 0px 1px 3px #b2b2b2;
`

export const InputGroup = styled.View`
    flex: 1;
    padding-horizontal: 12px;
    padding-top: 18px;
    background-color: #fff
`

export const InputTitle = styled.Text`
    font-size: 17px;
    color: #5a5a5a;
    padding-left: 5px;
`

export const IconSearchView = styled.TouchableOpacity`
    height: 40px;
    width: 40px;
    border-width: 0.5px;
    border-color: #b2b2b2;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
`

export const ButtonIconView = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
    padding-right: 10px;
`

export const ButtonIconHighlight = styled.TouchableHighlight`
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 18px;
`

export const LBText = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${props => props.color || Colors.black.black1};
`

export const LText = styled.Text`
    font-size: 16px;
    color: ${props => props.color || Colors.black.black1};
`

export const NBText = styled.Text`
    font-size: 14px;
    font-weight: bold;
    color: ${props => props.color || Colors.black.black1};
`

export const NText = styled.Text`
    font-size: 14px;
    color: ${props => props.color || Colors.black.black1};
`

export const SBText = styled.Text`
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.color || Colors.black.black1};
`

export const SText = styled.Text`
    font-size: 12px;
    color: ${props => props.color || Colors.black.black1};
`

export const TabContent = styled.View`
    flex: 1;
    height: 100%;
    backgroundColor: ${Colors.white.white1};
`

export const InputMultiPickList = styled.View`
    border-bottom-color: ${Colors.white.white5};
    border-bottom-width: 1px;
    flex: 1;
    width: 100%;
    min-height: 40px;
    padding: 2px;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
`

export const ItemMultiPickList = styled.View`
    padding: 8px;
    background-color: #eaf4fa;
    margin: 5px;
    border-radius: 4px;
    flex-direction: row;
`

export const ItemAddMultiPickList = styled.TouchableOpacity`
    width: 30px;
    height: 30px;
    margin: 5px;
    border-radius: 4px;
    background-color: ${Colors.functional.primary};
    justify-content: center;
    align-items: center;
`

export const ItemListViewContent = styled.View`
    padding-vertical: 10px;
    min-height: 80px;
    border-top-color: ${Colors.black.black3};
    border-top-width: ${StyleSheet.hairlineWidth}px;
    background-color: ${Colors.white.white1}
`

// Component
export const Content = ({ style = {}, enableScroll = true, contentOffset = 0, children = null }) => {

    if (enableScroll) {
        return (
            <KeyboardAwareScrollView
                scrollEnabled={false}
                contentContainerStyle={{ flex: 1 }}
                keyboardShouldPersistTaps='always'
                style={[{ flex: 1, backgroundColor: Colors.white.white1 }]}
            >
                <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                    {
                        enableScroll ?
                            (
                                <ContentScrollView keyboardShouldPersistTaps='always' style={style || {}}
                                    contentInset={{
                                        top: contentOffset,
                                    }}
                                    contentOffset={{
                                        y: -contentOffset,
                                    }}
                                >
                                    {children}
                                </ContentScrollView>
                            )
                            :
                            (
                                <ContentView style={style || {}}>
                                    {children}
                                </ContentView>
                            )
                    }

                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        )
    }
    else {
        return (
            <KeyboardAvoidingView
                style={[{ flex: 1, backgroundColor: Colors.white.white1 }]}
            >
                <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
                    <ContentView style={style || {}}>
                        {children}
                    </ContentView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        )
    }


}

export const TagOutLine = ({ color = Colors.black.black3, label, padding, paddingVertical = 0, paddingHorizontal = 4, textStyle, style }) => {
    return (
        <View
            style={[{
                borderWidth: 1,
                borderColor: Colors.black.black4,
                padding: padding,
                paddingVertical: paddingVertical,
                paddingHorizontal: paddingHorizontal,
                borderRadius: 4,
                marginLeft: 4,

            }, style]}
        >
            <SText allowFontScaling={true} color={color} style={[textStyle, { textAlign: 'center' }]}>{(label || typeof label === 'number') ? label : ''}</SText>
        </View>
    );
}

export const BooleanItem = ({ style, title, titleStyle, subTitle, subTitleStyle, selected = false, onChange }) => {
    return (
        <View style={[style]}>
            <ItemContentView>
                <ItemBodyView>
                    <Text allowFontScaling={true}
                        numberOfLines={2}
                        style={[{ fontSize: 14, color: Colors.black.black1 }, titleStyle || {}]}
                    >
                        {title || ''}
                    </Text>
                    {
                        subTitle ?
                            (
                                <Text allowFontScaling={true}
                                    numberOfLines={3}
                                    style={[{ fontSize: 11, color: Colors.black.black3 }, subTitleStyle || {}]}
                                >
                                    {subTitle || ''}
                                </Text>
                            )
                            : null
                    }
                </ItemBodyView>
                <Switch
                    trackColor={{ false: "#767577", true: Colors.functional.primary }}
                    thumbColor={Colors.white.white1}
                    ios_backgroundColor="#767577"
                    style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                    value={selected}
                    onValueChange={() => onChange?.()}
                />
            </ItemContentView>
        </View>
    )
}

export const ListItem = ({
    style = null,
    icon = null,
    iconStyle = null,
    iconColor = null,
    iconBorder = false,
    thumbnail = null,
    thumbnailDefault = null,
    thumbnailUri = null,
    title = null,
    numberOfLinesTitle = undefined,
    titleStyle = null,
    badgeCount = null,
    subTitle = null,
    subTitleStyle = null,
    noArrowRight = null,
    divider = true,
    selectedText = '',
    optionSelected = {},
    selectedTextStyle = {},
    onSelected = undefined,
    optionsSelect = [],
    dividerStyle = { marginRight: 12 },
    onPress = null,
    isFocused = false,
    isIconMenu = false,
    iconRight = '',
    onPressIconRight = null
}: ListItemProps) => {
    return (
        <>
            <ItemViewHighLight
                activeOpacity={0.3}
                underlayColor={Colors.white.white2}
                style={[{ paddingVertical: 8 }, isFocused ? { backgroundColor: Colors.white.white2, borderLeftWidth: 4, borderLeftColor: Colors.brand.brand1 } : {}, style || {}]}
                onPress={() => { onPress?.(); }}
                disabled={selectedText}
                >
                <>
                    <ItemContentView>
                        {
                            thumbnail ?
                                (
                                    <ThumbnailView>
                                        <Thumbnail
                                            source={thumbnail} />
                                    </ThumbnailView>
                                )
                                : null
                        }

                        {
                            thumbnailUri ?
                                (
                                    <ThumbnailView>
                                        <Thumbnail
                                            source={{ uri: thumbnailUri }} />
                                    </ThumbnailView>
                                )
                                : null
                        }
                        {
                            thumbnailDefault ?
                                (
                                    <ThumbnailView>
                                        <Thumbnail
                                            source={require('../assets/images/avatar.jpg')} />
                                    </ThumbnailView>
                                )
                                : null
                        }
                        {
                            icon ?
                                (
                                    <ItemIconView style={iconBorder ? { minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.black.black4, justifyContent: 'center', alignItems: 'center' } : isIconMenu ? {justifyContent: 'center', alignItems: 'center',marginLeft: -12} : {}} >
                                        <Icon name={icon || ''} color={isFocused ? Colors.brand.brand1 : iconColor || Colors.black.black1} style={[{ fontSize: 22 }, iconStyle]} />
                                    </ItemIconView>
                                )
                                : null
                        }
                        {
                            thumbnail || icon || thumbnailDefault || thumbnailUri ? <SpaceHS /> : null
                        }
                        
                        <ItemBodyView>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text allowFontScaling={true}
                                    numberOfLines={numberOfLinesTitle || 2}
                                    style={[{ fontSize: 18, color: Colors.black.black1 }, isFocused ? { color: Colors.brand.brand1 } : {}, titleStyle || {}]}
                                >
                                    {title || ''}
                                </Text>
                                <View style={{ paddingHorizontal: 2 }} />
                                {(badgeCount || parseInt(badgeCount) === 0) ? <TagOutLine color={Colors.functional.primary} label={parseInt(badgeCount)} /> : undefined}
                            </View>
                            {
                                subTitle ?
                                    (
                                        <Text allowFontScaling={true}
                                            numberOfLines={3}
                                            style={[{ fontSize: 13, color: Colors.black.black3 }, subTitleStyle || {}]}
                                        >
                                            {subTitle || ''}
                                        </Text>
                                    )
                                    : null
                            }
                        </ItemBodyView>
                    </ItemContentView>
                    {
                        selectedText ? (
                            <>
                                <ModalSelect
                                    presentType='device'
                                    options={optionsSelect || []}
                                    value={optionSelected || {}}
                                    customView={() => {
                                        return (
                                            <Text allowFontScaling={true} style={[{ color: Colors.black.black3 }, selectedTextStyle]}>{selectedText}</Text>
                                        )
                                    }}
                                    onSelected={(value) => {
                                        onSelected?.(value)
                                    }}
                                />

                            </>
                        ) : null
                    }
                    {
                        noArrowRight ? null :
                            iconRight ? (
                                <Icon name={iconRight} style={[{ paddingLeft: 10, fontSize: 24, color: Colors.functional.primary }, , isFocused ? { color: Colors.brand.brand1 } : {}]} onPress={() => onPressIconRight?.()} />
                            ) : (
                                <Icon name='angle-right' style={[{ paddingLeft: 10, fontSize: 28, color: Colors.black.black4 }, , isFocused ? { color: Colors.brand.brand1 } : {}]} />
                            )
                    }


                </>
            </ItemViewHighLight>
            {
                !divider ? null : <Divider style={[{ flex: 1, marginLeft: thumbnail ? 61 : (icon ? 49 : 10) }, dividerStyle]} />
            }

        </>
    )
}


type ItemType = 'LEADS' | 'CONTACTS' | 'ORGANIZATIONS' | 'OPPORTUNITIES' | 'SALESORDER' | 'TICKETS' | 'TASK' | 'MEETING' | 'CALL' | 'COMMENT';

type ListItemNotificationProps = {
    style: ViewStyle,
    type: ItemType,
    title: String,
    titleStyle: TextStyle,
    subTitle: String,
    subTitleStyle: TextStyle,
    divider: Boolean,
    unRead: Boolean,
    quickActionTitle: String,
    onQuickAction: () => void,
    onPress: () => void
}

export const ListItemNotification = ({ style, type, title, titleStyle = {}, subTitle, subTitleStyle, divider = true, unRead = true, quickActionTitle, onQuickAction, onPress }: ListItemNotificationProps) => {
    let icon = '';
    switch (type) {
        case 'LEADS':
            icon = 'user';
            break;
        case 'CONTACTS':
            icon = 'user-tie';
            break;
        case 'POTENTIALS':
            icon = 'sack';
            break;
        case 'ACCOUNTS':
            icon = 'building';
            break;
        case 'INVOICE':
            icon = 'file-invoice-dollar';
            break;
        case 'TICKETS':
            icon = 'file-exclamation';
            break;
        case 'TASK':
            icon = 'tasks';
            break;
        case 'CALL':
            icon = 'phone';
            break;
        case 'MEETING':
            icon = 'users';
            break;
        case 'CALENDAR':
            icon = 'calendar';
            break;
        case 'COMMENT':
            icon = 'comment';
            break;
        case 'HelpDesk'.toUpperCase():
            icon = 'file-exclamation';
            break;
        case 'CPEMPLOYEE':
            icon = 'map-marker-check';
            break;
        default:
            icon = 'question';
            break;
    }

    return (
        <>
            <ItemViewHighLight 
                activeOpacity={1}
                underlayColor={unRead ? '#e6f2fe' : Colors.white.white4}
                style={[{ paddingVertical: 8, backgroundColor:Colors.white.white1 }, style || {}]}
                onPress={() => { onPress?.(); }}>
                <ItemContentView style={{ alignItems: 'center' }}>
                    {
                        icon ?
                            (
                                <ItemIconView style={{ width: 38, height: 38, borderRadius: 19, borderColor: Colors.black.black2, borderWidth: .5, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 }}>
                                    <Icon name={icon || ''} style={{ fontSize: 18, color: Colors.black.black2 }} />
                                </ItemIconView>
                            )
                            : null
                    }
                    <ItemBodyView style={{ paddingRight: 12 }}>
                        <NotificationTitle
                            body={title.toString() || ''}
                            type={type}
                            style={{
                                fontWeight: 'normal',
                                fontSize: 14,
                                color: Colors.black.black1,
                                opacity: unRead ? 1 : 0.6,
                                marginRight: 20,
                                ...titleStyle
                            }}
                        />

                        {
                            subTitle ?
                                (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, width: '100%' }}>
                                        <TimeAgo
                                            time={subTitle || ''}
                                            interval={20000}
                                            style={[{ fontSize: 13, color: Colors.black.black3, maxWidth: widthResponse / 2 }, subTitleStyle || {}]}
                                        />
                                        {
                                            quickActionTitle != '' ? (
                                                <TouchableOpacity
                                                    onPress={() => onQuickAction?.()}
                                                    style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                                                >
                                                    <NText allowFontScaling={true} color={Colors.functional.dangerous}>{quickActionTitle || ''}</NText>
                                                </TouchableOpacity>
                                            ) : null
                                        }
                                    </View>
                                )
                                : null
                        }

                        {
                            unRead ? 
                            (
                                <View
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 6/2,
                                        backgroundColor: Colors.functional.dangerous,
                                        position: 'absolute',
                                        right: 16,
                                        top: 10
                                    }}
                                />
                            )
                            : null
                        }
                    </ItemBodyView>
                </ItemContentView>

            </ItemViewHighLight>
            {
                !divider ? null : <Divider style={{ flex: 1 }} />
            }

        </>
    )
}

export const InputItem = ({ isEdit, isMultiline = false, selectTextOnFocus = true, numPrecision = Global.user?.no_of_currency_decimals, value, title, onValueChange, keyboardType, inputType = 'text', isSecure = false, placeholder, groupInputStyle, inputStyle, style, required = 0, autoFocus, error = false, success = false, isSubmitted = false, isWord = true, stacked = false }) => {
    const [paddingLabel, setPaddingLabel] = React.useState(isMultiline ? 6 : 0);
    const [isValid, setValid] = React.useState(true);
    let separator = Global.user?.currency_decimal_separator || '.';
    let delimiter = Global.user?.currency_grouping_separator || ',';
    let precision = numPrecision || 0

    const handleChangeCurrency = (text) => {
        let textWithoutPrefixAndSufix = text || '0';

        const isNegativeValue = textWithoutPrefixAndSufix.includes('-');

        const textNumericValue = textWithoutPrefixAndSufix.replace(/\D+/g, '');

        const numberValue = Number(textNumericValue) * (isNegativeValue ? -1 : 1);

        const zerosOnValue = textNumericValue.replace(/[^0]/g, '').length;
        let newValue: number | null;

        if (!textNumericValue || (!numberValue && zerosOnValue === precision)) {
            // Allow to clean the value instead of beign 0
            newValue = 0;
        } else {
            newValue = numberValue / 10 ** precision;
        }
        onValueChange && onValueChange(newValue);
    }

    const handleChangeNumber = (value: string) => {
        let regex = new RegExp('\\' + delimiter, 'g');
        let newValue = (value || '0').replace(regex, '');
        if (Global.validateOnlyNumber(newValue)) {
            onValueChange && onValueChange(parseFloat(newValue).toFixed(0));
        }
        else {
            return;
        }

    }

    return (
        <InputGroup style={style}>
            <Item
                floatingLabel={!stacked}
                stackedLabel={stacked}
                style={[{
                    borderBottomColor: !isValid || (isSubmitted && required == 1 && !value) ? Colors.functional.dangerous : (success ? Colors.functional.primary : Colors.black.black4),
                    
                },
                    groupInputStyle]}>
                <Label
                    allowFontScaling={true}
                    style={{
                        paddingLeft: paddingLabel,
                        fontSize: 14,
                        color: !isValid || (isSubmitted && required == 1 && !value) ? Colors.functional.dangerous : (success ? Colors.functional.primary : Colors.black.black1)
                    }}>
                    {title || ''} <SText allowFontScaling={true} color={Colors.functional.dangerous}>{required == 1 ? '*' : ''}</SText>
                </Label>
                <Input
                    style={[{ color: Colors.black.black1 }, inputStyle]}
                    autoFocus={autoFocus || false}
                    showSoftInputOnFocus={true}
                    selectTextOnFocus={selectTextOnFocus}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    placeholderTextColor={'red'}
                    disabled={!isEdit}
                    value={value}
                    textAlignVertical='top'
                    autoCapitalize={inputType != 'email' ? 'sentences' : 'none'}
                    secureTextEntry={isSecure}
                    multiline={isMultiline}
                    clearButtonMode='while-editing'
                    allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                    onChangeText={(textChange) => {
                        if (inputType == 'text') {
                            onValueChange?.(textChange);
                        }
                        else if (inputType == 'currency') {

                            handleChangeNumber(textChange)
                        }
                        else if (inputType == 'email') { // check type email is valid
                            if (Global.validateEmail(textChange)) {
                                setValid(true);
                                onValueChange?.(textChange);
                            }
                            else {
                                setValid(false);
                                onValueChange?.(textChange);
                            }
                        }
                        else {
                            onValueChange?.(textChange);
                        }
                    }}
                    onFocus={() => { setPaddingLabel(0) }}
                    onBlur={() => { isMultiline ? setPaddingLabel(6) : setPaddingLabel(0) }}
                />
            </Item>
        </InputGroup>
    )
}

export const SearchInput = ({
    borderColor = Colors.black.black4,
    backgroundColor = Colors.white.white1,
    keyboardType = null,
    placeholder = '',
    value,
    onValueChange,
    onSearch = null,
    isClearText = true,
    onClearText,
    autoFocus = false
}) => {
    return (
        <Body style={{ flexDirection: 'row', paddingHorizontal: 12 }}>

            <View style={{
                flex: 1,
                height: 40,
                borderWidth: 0.5,
                borderColor: borderColor,
                borderRadius: 6,
                flexDirection: 'row',
                backgroundColor: backgroundColor
            }}>
                <Input
                    style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 8,
                    }}
                    autoFocus={autoFocus}
                    showSoftInputOnFocus={true}
                    selectTextOnFocus={true}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.black.black3}
                    value={value}
                    onChangeText={(value) => { onValueChange?.(value); }}
                    onSubmitEditing={() => {
                        Keyboard.dismiss();
                        onSearch?.();
                    }}
                    allowFontScaling={true}
                />
                {
                    (isClearText && value) ? (
                        <ButtonIconView onPress={() => { onClearText?.() }}>
                            <Icon name='times-circle' style={{ fontSize: 16, color: Colors.black.black3 }} />
                        </ButtonIconView>
                    ) : null
                }

            </View>
            <View style={{ padding: 4 }} />
            <IconSearchView onPress={() => { Keyboard.dismiss(); onSearch?.(); }}>
                <Icon name='search' style={{ fontSize: 18, fontWeight: '600', color: Colors.functional.primary }} />
            </IconSearchView>
        </Body>
    )
}

export class SegmentView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tabIndex: this.props.initIndex || 0,
            preTabIndex: 0,
            animTransition: new Animated.Value(0)
        }
    }

    componentDidMount() {
        this.handleTabsChange(this.state.tabIndex);
    }

    handleTabsChange = index => {
        this.setState({ tabIndex: index }, () => {
            Animated.timing(
                this.state.animTransition,
                {
                    toValue: -(index * widthResponse),
                    duration: 200,
                    easing: Easing.ease,
                    useNativeDriver: true
                }
            ).start(() => {
                this.props.onChangeTab?.(index);
            });
        });
    }

    render() {
        const { tabs, children } = this.props
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white.white1 }}>
                <SegmentedControl
                    tabs={tabs}
                    currentIndex={this.state.tabIndex}
                    onChange={(index) => this.handleTabsChange(index)}
                    activeTextColor={Colors.black.black1}
                    textColor={Colors.black.black2}
                    segmentedControlBackgroundColor={'#f0f0f0'}
                    paddingVertical={8}
                />
                <Divider style={{ width: widthResponse }} />
                <Animated.View
                    style={{
                        flex: 1,
                        width: widthResponse,
                        flexDirection: 'row',
                        backgroundColor: Colors.white.white4,
                        transform: [{ translateX: this.state.animTransition }]
                    }}
                >
                    {children}
                </Animated.View>
            </View>
        )
    }
}

// export class MultiplePickList extends Component {
//     state = {
//         selectedList: ['item 1', 'item 2']
//     }

//     showMenu = () => this.menuRef.show();


//     render() {
//         return (
//             <InputGroup style={{ width: '100%', paddingTop: 12, paddingHorizontal: 0 }}>
//                 <NText allowFontScaling={true} >Title</NText>
//                 <InputMultiPickList >
//                     {
//                         this.state.selectedList.map((item, idx) => {
//                             return (
//                                 <ItemMultiPickList key={idx}>
//                                     <ButtonIconView>
//                                         <Icon name='times' style={{ color: Colors.functional.primary, fontSize: 14 }} />
//                                     </ButtonIconView>
//                                     <SBText allowFontScaling={true}  numberOfLines={1} style={{ color: Colors.functional.primary, maxWidth: width * 0.8 }}>{item}</SBText>
//                                 </ItemMultiPickList>
//                             )
//                         })
//                     }
//                     <Menu
//                         style={{
//                         }}
//                         ref={(menu) => this.menuRef = menu}
//                         button={
//                             <ItemAddMultiPickList
//                                 onPress={() => {
//                                     this.showMenu();
//                                     // setTimeout(() => {
//                                     //     this.inputSearch?.focus();
//                                     // }, 300);
//                                 }}
//                             >
//                                 <Icon name='plus' style={{ color: Colors.white.white1 }} />
//                             </ItemAddMultiPickList>
//                         }
//                     >
//                         <View style={{ backgroundColor: Colors.white.white2, flex: 1, height: 40, flexDirection: 'row', paddingHorizontal: 8 }}>
//                             <Input style={{ flex: 1, height: 40 }} ref={(input) => this.inputSearch = input?.wrappedInstance} />
//                             <TouchableOpacity style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center' }}>
//                                 <Icon name='search' style={{ fontSize: 17 }} />
//                             </TouchableOpacity>

//                         </View>
//                         <ScrollView style={{ maxHeight: 200 }}>
//                             <MenuItem>Option 1</MenuItem>
//                             <MenuDivider />
//                             <MenuItem>Option 12</MenuItem>
//                             <MenuDivider />
//                             <MenuItem>Option 13</MenuItem>
//                             <MenuDivider />
//                             <MenuItem>Option 14</MenuItem>
//                             <MenuDivider />
//                             <MenuItem>Option 10</MenuItem>
//                             <MenuDivider />
//                             <MenuItem>Option 2</MenuItem>
//                             <MenuDivider />
//                         </ScrollView>
//                     </Menu>
//                 </InputMultiPickList>
//             </InputGroup>
//         )
//     }
// }

export const MenuFilterList = ({ value, options = [], onSelected }) => {
    const [isScrollToIndex, setScrollToIndex] = useState(false)
    const menu = useRef();
    const flatListRef = useRef(null);

    const showMenu = () => {
        menu.current.show();
        setScrollToIndex(true);
    };

    const setInitialIndex = () => {
        let currentIndex = options.findIndex((option, index) => option.key == value.key)
        return currentIndex;
    }

    // useEffect(() => {
    //     if (flatListRef.current) {
    //         flatListRef.current.scrollToIndex({ index: setInitialIndex(), animated: true, });
    //     }
    // }, [flatListRef, isScrollToIndex])

    const hideMenu = () => {
        menu.current.hide()
        setScrollToIndex(false)
    };

    return (
        <TouchableHighlight
            activeOpacity={.3}
            underlayColor={Colors.white.white2}
            onPress={showMenu}
            style={{ paddingVertical: 6, paddingHorizontal: 8 }}
        >
            <>
                <NBText allowFontScaling={true} >{value?.label || ''}  <Icon name='angle-down' style={{ fontSize: 16, fontWeight: '800' }} /></NBText>
                <Menu
                    ref={menu}
                    style={{ marginTop: -18, }}
                    button={
                        <></>
                    }
                    animationDuration={0}
                >
                    <MenuItem style={{ height: 35, minWidth: 150 }}>
                        <View style={{ borderBottomColor: Colors.black.black3, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 8, flexDirection: 'row' }} >
                            <Icon name='list-alt' color={Colors.functional.primary} />
                            <SpaceHS />
                            <NBText allowFontScaling={true} color={Colors.functional.primary}>{value?.label || ''}</NBText>
                        </View>
                    </MenuItem>
                    <Divider />
                    <FlatList
                        ref={flatListRef}
                        data={options}
                        style={{ maxHeight: 400 }}
                        renderItem={({ item, index }) => {
                            if (index == options.length - 1) {
                                setTimeout(() => {
                                    flatListRef.current.scrollToIndex({ index: setInitialIndex(), animated: true, });
                                }, 300)
                            }

                            return (
                                <MenuItem
                                    key={index}
                                    style={item?.key === value?.key ? { backgroundColor: Colors.white.white2 } : {}}
                                    onPress={() => { onSelected?.(item); hideMenu() }}>
                                    <NText allowFontScaling={true} color={item?.key === value?.key ? Colors.functional.primary : Colors.black.black1}>{item?.label}</NText>
                                    {
                                        item?.key === value?.key ?
                                            (
                                                <>
                                                    <SpaceHL />
                                                    <Icon name='check' color={Colors.functional.primary} />
                                                </>
                                            )
                                            : null
                                    }

                                </MenuItem>
                            )
                        }}
                    />
                    {/* <ScrollView
                        style={{ maxHeight: 400 }}
                        ref={scrollViewRef}
                    >
                        {
                            options?.map((item, idx) => {
                                return (
                                    
                                )
                            })
                        }
                    </ScrollView> */}

                </Menu>

            </>
        </TouchableHighlight>
    )
}

export const SectionFilterList = ({ value, options = {}, onSelected }) => {
    const menu = useRef();

    const flatListRef = useRef(null);

    const showMenu = () => {
        menu.current.show();
    };

    const setInitialIndex = () => {
        let currentIndex = options.findIndex((option, index) => option.key == value.key)
        return currentIndex;
    }

    // useEffect(() => {
    //     if (flatListRef.current) {
    //         flatListRef.current.scrollToIndex({ index: setInitialIndex(), animated: true, });
    //     }
    // }, [flatListRef, isScrollToIndex])

    const hideMenu = () => {
        menu.current.hide()
    };

    const Item = ({ data }) => {
        <TouchableOpacity
            style={data?.cv_id === value?.cv_id ? { backgroundColor: Colors.white.white2 } : {}}
            onPress={() => { onSelected?.(data); hideMenu(); }}
        >
            <NText allowFontScaling={true} color={data?.cv_id === value?.cv_id ? Colors.functional.primary : Colors.black.black1}>{data}</NText>
            {
                data?.cv_id === value?.cv_id ?
                    (
                        <>
                            <SpaceHL />
                            <Icon name='check' color={Colors.functional.primary} />
                        </>
                    )
                    : null
            }
        </TouchableOpacity>
    }

    return (
        <TouchableHighlight
            activeOpacity={.3}
            underlayColor={Colors.white.white2}
            onPress={showMenu}
            style={{ paddingVertical: 6, paddingHorizontal: 8, flex: 1 }}
        >
            <>
                <Box flexDirection='row'>
                    <NBText allowFontScaling={true} numberOfLines={1} ellipsizeMode='tail'>{value?.viewname || ''}</NBText>
                    <SpaceHS />
                    <Icon name='angle-down' style={{ fontSize: 16, fontWeight: '800' }} />
                </Box>
                <Menu
                    ref={menu}
                    style={{ marginTop: -18, }}
                    button={
                        <></>
                    }
                    animationDuration={0}
                >
                    <MenuItem style={{ height: 35, minWidth: 150 }}>
                        <View style={{ borderBottomColor: Colors.black.black3, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 8, flexDirection: 'row' }} >
                            <Icon name='list-alt' color={Colors.functional.primary} />
                            <SpaceHS />
                            <NBText allowFontScaling={true} numberOfLines={1} ellipsizeMode='tail' color={Colors.functional.primary}>{value?.viewname || ''}</NBText>
                        </View>
                    </MenuItem>
                    <Divider />
                    {
                        Object.keys(options)?.map((option, indexCustomView) => {
                            if (options[option]?.length > 0) {
                                return (
                                    <ScrollView style={{ maxHeight: 400 }} key={indexCustomView}>
                                        <MenuItem
                                            key={indexCustomView}
                                            style={{ backgroundColor: Colors.white.white3 }}
                                        >
                                            <NBText allowFontScaling={true} >{option == 'mine' ? getLabel('common.label_mine') : getLabel('common.label_shared')}</NBText>
                                        </MenuItem>
                                        <FlatList
                                            ref={flatListRef}
                                            data={options[option]}
                                            style={{}}
                                            renderItem={({ item, index }) => {
                                                return (
                                                    <MenuItem
                                                        key={index}
                                                        style={item?.cv_id === value?.cv_id ? { backgroundColor: Colors.white.white2 } : {}}
                                                        onPress={() => { onSelected?.(item); hideMenu() }}>
                                                        <NText allowFontScaling={true} color={item?.cv_id === value?.cv_id ? Colors.functional.primary : Colors.black.black1}>{item?.viewname}</NText>
                                                        {
                                                            item?.cv_id === value?.cv_id ?
                                                                (
                                                                    <>
                                                                        <SpaceHL />
                                                                        <Icon name='check' color={Colors.functional.primary} />
                                                                    </>
                                                                )
                                                                : null
                                                        }

                                                    </MenuItem>
                                                )
                                            }}
                                        />
                                    </ScrollView>
                                )
                            }
                        })
                    }

                </Menu>

            </>
        </TouchableHighlight>
    )
}


