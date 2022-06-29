/**
 * @file    : GoolgePlaceAutoComplete/hook.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Create hook handle search address for the feature auto-complete
*/

import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableOpacity } from 'react-native';
import usePlaceID from '../../hooks/usePlaceID';
import { Colors } from '../../themes/colors/Colors';

export default function useHook() {
    const [searchResults, setSearchResults] = useState([]);
    const [isShowingResults, setShowingResults] = useState(false);
    const [errorString, setErrorString] = useState(undefined);
    const [isSelected, setSelected] = useState(false);
    const [hasFocus, setFocus] = useState(false);
    const inputRef = useRef(null);

    const { searchAddress, getPlaceDetail } = usePlaceID();
    // get url request

    const buildRowsFromResults = (results) => {
        let res = [];

        res = res.map((place) => ({
            ...place,
            isPredefinedPlace: true,
        }));

        return [...res, ...results];
    };

    const searchLocation = async (inputSearch: string) => {
        if (inputSearch) {
            searchAddress(inputSearch,
                data => {
                    setErrorString(undefined);
                    if (data) {
                        setSearchResults(buildRowsFromResults(data));
                        setShowingResults(true);
                    }
                    else {
                        setSearchResults([]);
                        setShowingResults(false);
                    }
                },
                err => {
                    setErrorString(err.toString());
                    setSearchResults([]);
                    setShowingResults(true);
                });
        }
        else {
            setErrorString(undefined);
            setSearchResults([]);
            setShowingResults(false);
        }

    }

    const parseDataAddress = (address, addressComponent: any[], geoLocation, callback) => {
        let data = {
            address: address,
        };

        addressComponent?.forEach((compo) => {
            const country = compo?.types.findIndex((type) => type === 'country');
            const city = compo?.types.findIndex((type) => type === 'administrative_area_level_1');
            const state = compo?.types.findIndex((type) => type === 'administrative_area_level_2');
            const ward = compo?.types.findIndex((type) => type === 'sublocality_level_1');

            if (country != -1) {
                data.country = compo.long_name
            }
            else if (state != -1) {
                data.state = compo.long_name
            }
            else if (city != -1) {
                data.city = compo.long_name
            }
            else if (ward != -1) {
                data.ward = compo.long_name
            }
        })

        if (geoLocation?.lat && geoLocation?.lng) {
            data.longitude = geoLocation.lng;
            data.latitude = geoLocation.lat;
        }

        callback?.(data);
    }

    const onSelectedItem = (rowData, callback) => {
        Keyboard.dismiss();

        getPlaceDetail(rowData.placeID,
            data => {
                if (data) {
                    const details = data;
                    parseDataAddress(rowData?.fullAddress, details?.address_components, details?.geometry?.location, callback)

                }
                else {
                    parseDataAddress(rowData?.fullAddress, [], {}, callback)
                }
            },
            err => {
                console.warn('google places autocomplete: request fail ', err)
            })
    }

    const _renderListItem = ({ item, index, itemStyle = {}, onSelectedChange = undefined }) => {
        const divider = index != 0 ? {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.black.black3
        } : {};

        return (
            <TouchableOpacity
                key={index.toString()}
                style={{
                    ...itemStyle,
                    ...divider
                }}
                onPress={() => {
                    onSelectedItem(item, (res) => {
                        _onBlur();
                        setSelected(true);
                        onSelectedChange?.(res);
                    })

                }}
            >
                <Text
                    allowFontScaling={true}
                    numberOfLines={3}
                    style={{
                        fontSize: 12,
                        color: Colors.black.black2
                    }}
                >
                    {item?.['fullAddress'] || ''}
                </Text>
            </TouchableOpacity>
        )
    }

    const _onBlur = React.useCallback(() => {
        setShowingResults(false);
        setSelected(false);
        setSearchResults([]);
    }, []);

    const _onFocus = React.useCallback((value) => {
        setFocus(true);

        if (value) {
            setSelected(false)
            searchLocation(value);
        }
        else {
            setShowingResults(false);
            setSelected(false);
        }
    }, []);

    return ({
        hasFocus,
        searchResults,
        isShowingResults,
        isSelected,
        setShowingResults,
        errorString,
        searchLocation,
        _renderListItem,
        _onBlur,
        _onFocus,
        inputRef
    })
}