/**
 * @file    : GoolgePlaceAutoComplete/hook.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Create UI the feature auto-complete
*/

import React from 'react';
import {
    Platform, StyleSheet, Text, TextInput,
    TextInputProps, TextStyle, View,
    ViewStyle
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Colors } from '../../themes/colors/Colors';
import useHook from './hook';

// define props type
type TermAddress = {
    offset: Number,
    value: String,
}

type ItemAddress = {
    description: String,
    terms: Array<TermAddress | Object>,
    types: Array<String>,
}

type ItemProps = {
    item: ItemAddress | any,
    index: number
}

type ResultSelected = {
    address: String,
    state: String,
    city: String,
    country: String,
    longitude: any,
    latitude: any,
}

type GooglePlaceAutoCompleteProps = {
    style?: ViewStyle,
    inputStyle?: TextStyle,
    inputProps?: TextInputProps,
    renderListItem?: ({ item, index }: ItemProps) => React.ReactElement,
    title: String,
    required: String | Number,
    value: string,
    selectedChange?: (value: ResultSelected) => void,
    onChangeText?: (value: String) => void
}

export default function GooglePlaceAutoComplete({
    style = {},
    inputStyle = {},
    inputProps = {},
    renderListItem = undefined,
    title = '',
    required = 0,
    value = '',
    selectedChange = undefined,
    onChangeText = undefined
}: GooglePlaceAutoCompleteProps) {

    const {
        hasFocus,
        searchResults,
        isShowingResults,
        isSelected,
        searchLocation,
        errorString,
        _renderListItem,
        _onBlur,
        _onFocus,
        inputRef
    } = useHook();

    React.useEffect(() => {
        if (value && !isSelected && hasFocus) {
            searchLocation(value);
        }
        else {
            _onBlur()
        }

        return () => { }
    }, [value]);

    return (
        <View
            style={{
                ...styles.container,
                ...style
            }}
        >
            <Text
                allowFontScaling={true}
                style={{
                    fontSize: 14,
                    color: Colors.black.black1,
                    opacity: 0.7
                }}
            >
                {title || ''} {required == 1 ? <Text allowFontScaling={true} style={{ color: 'red' }}>*</Text> : null}
            </Text>

            <View
                style={{
                    flexDirection: 'row',
                    paddingTop: 6
                }}
            >
                <TextInput
                    ref={inputRef}
                    {...inputProps}
                    style={{
                        flex: 1,
                        ...styles.searchInput,
                        ...inputStyle
                    }}
                    scrollEnabled={true}
                    multiline={false}
                    returnKeyType='search'
                    allowFontScaling={true}
                    clearButtonMode='while-editing'
                    value={value}
                    onChangeText={(value) => onChangeText?.(value)}
                    onBlur={_onBlur}
                    onFocus={() => _onFocus?.(value)}
                />
            </View>

            {
                isShowingResults ?
                    (
                        <View
                            style={{
                                ...styles.contentListView
                            }}
                        >
                            <ScrollView
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps='always'
                                keyboardDismissMode='none'
                                style={{ ...styles.contentListView }}
                            >
                                {
                                    errorString ? (
                                        <View
                                            style={{
                                                padding: 12
                                            }}
                                        >
                                            <Text>
                                                {errorString}
                                            </Text>
                                        </View>
                                    )
                                        : null
                                }

                                {
                                    searchResults && searchResults.map((item, idx) => {
                                        if (renderListItem) {
                                            return renderListItem({ item: item, index: idx });
                                        }
                                        else {
                                            return _renderListItem({ item: item, index: idx, itemStyle: { ...styles.itemValue }, onSelectedChange: selectedChange });
                                        }
                                    })
                                }
                            </ScrollView>
                        </View>
                    )
                    : null
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 4
    },
    contentListView: {
        marginTop: 5,
        maxHeight: 200,
        backgroundColor: Colors.white.white1,
        borderRadius: 4,
        ...Platform.select({
            android: {
                elevation: 3,
            },
            ios: {
                marginHorizontal: 12,
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 1,
                    height: 2,
                },
                shadowOpacity: 0.45,
                shadowRadius: 3.14,
            }
        }),
    },
    searchInput: {
        minHeight: 48,
        maxHeight: 48,
        textAlignVertical: 'center',
        paddingLeft: 6,
        color: Colors.black.black1,
        fontSize: 14,
        borderBottomColor: Colors.black.black4,
        borderBottomWidth: .8,
    },
    itemValue: {
        minHeight: 30,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 12,

    }
});