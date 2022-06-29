/**
 * @file    : MultipleSelect/index.js
 * @author  : Manh Le, Khiem Ha
 * @date    : 2022-01-26
 * @purpose : Create UI select multiple item
*/

// Import libraries
import { Input, Text } from 'native-base';
import React, { Component } from 'react';
import {
    Dimensions,
    FlatList, TouchableOpacity, View
} from 'react-native';
import Global from '../../Global';
import { getLabel, widthDevice } from '../../utils/commons/commons';
import { Row } from './Row';
import styles from './styles';

export default class MultipleSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedList: this.props.value,
            keyword: '',
            searchList: [],
            data: this.props.data ? this.props.data : []
        };
    }

    componentWillReceiveProps(nextProps) {
        this.state.selectedList = nextProps.value;
    }

    removeItem(item, index) {
        this.state.selectedList.splice(index, 1);

        this.setState({
            selectedList: this.state.selectedList,
            searchList: [],
            keyword: ''
        });

        if (this.props.showSelectedListDefault) {
            this.props.removeItem(this.state.selectedList)
        }
    }

    addNewItem(newItem) {
        this.setState({
            selectedList: [...this.state.selectedList, newItem],
            searchList: [],
            keyword: ''
        });

        this.props.selectItem([...this.state.selectedList, newItem]);
    }

    searchItem(keyword) {
        this.setState({ keyword: keyword });

        let results = [];

        if (keyword.trim().length < parseInt(Global.validationConfig?.autocomplete_min_length)) {
            this.setState({ searchList: [] });
            return;
        }
        else {
            let filterList;
            let regex = keyword.unUnicode().trim();
            let searchList = [];
            searchList = [...this.state.data];

            try {
                if (this.props.mode == 'user') {
                    filterList = searchList.filter((user) => user.full_name?.unUnicodeMatch(regex));

                    filterList.map((item) => {
                        item['email'] = item.email1;
                        item['name'] = item.full_name;
                    });

                    results = results.concat(filterList);

                    let tmpResults = results;

                    if (this.state.selectedList.length > 0) {
                        this.state.selectedList.map((item) => {
                            results.map((result, index) => {
                                if (result.id == item.id) {
                                    tmpResults.splice(index, 1);
                                }
                            })
                        });
                    }

                    this.setState({ searchList: tmpResults });
                }
                else {
                    filterList = searchList.filter((item) => item.key.unUnicodeMatch(regex) || item.label.unUnicodeMatch(regex));

                    filterList.map((item) => {
                        item['name'] = item.label;
                    });

                    results = results.concat(filterList);

                    let tmpResults = results;

                    if (this.state.selectedList.length > 0) {
                        this.state.selectedList.map((item) => {
                            results.map((result, index) => {
                                if (result.key == item.key) {
                                    tmpResults.splice(index, 1);
                                }
                            })
                        });
                    }

                    this.setState({ searchList: tmpResults });
                }
            } catch (e) {
            }
        }
    }

    render() {
        return (
            <View>
                {
                    this.props.showSelectedListDefault ? (
                        <View
                            style={styles.list}
                        >
                            {
                                this.state.selectedList?.length > 0 && this.state.selectedList.map((data, index) => {
                                    return (
                                        <Row
                                            data={data}
                                            removeItem={() => this.removeItem(data, index)}
                                        />
                                    );
                                })
                            }
                        </View>
                    ) : null
                }
                <View
                    style={{
                        paddingHorizontal: 10,
                        width: widthDevice - 30
                    }}
                >
                    <Input
                        placeholder={getLabel('common.user_keyword_input_place_holder')}
                        placeholderTextColor="#8B9296"
                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                        style={{
                            color: '#212121'
                        }}
                        value={this.state.keyword}
                        onChangeText={(value) => this.searchItem(value)}
                    />
                </View>
                {
                    this.state.searchList.length > 0 ? (
                        <View
                            style={{
                                padding: 10
                            }}
                        >
                            <FlatList
                                shouldComponentUpdate
                                data={this.state.searchList}
                                disableVirtualization={false}
                                keyboardShouldPersistTaps='always'
                                renderItem={({ item, index, _separators }) =>
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.rowViewUser, { marginTop: index == 0 ? 0 : 5 }]}
                                        onPress={() => this.addNewItem(item)}
                                    >
                                        <Text allowFontScaling={true} style={styles.textOwner}>{item.name + (item.email ? ` (${item.email})` : '')}</Text>
                                    </TouchableOpacity>
                                }
                                keyExtractor={(item, index) => index.toString()}
                                onEndReachedThreshold={0.5}
                            />
                        </View>
                    ) : null
                }
                {
                    !this.props.showSelectedListDefault && this.props.renderSelectedList ? this.props.renderSelectedList() : null
                }
            </View>
        );
    }
}
