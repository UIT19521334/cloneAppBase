// Import libraries
import React, { Component } from 'react';
import { BackHandler, DeviceEventEmitter, FlatList, RefreshControl, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import Toast from 'react-native-root-toast';
// Import components
import { Content, Header, LargeHeader, Left, MenuFilterList, Right, SearchInput } from '../../../components/CustomComponentView';
import IndicatorLoading from '../../../components/IndicatorLoading';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { getIcon, getIconModule, getLabel, logScreenView } from '../../../utils/commons/commons';
import I18n from '../../../utils/i18n';
import styles from './styles';

export default class ReportList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            refreshing: false,
            paging: {},
            reportList: [],
            reportKeyWord: '',
            folderList: [],
            folder: {},
            isOnline: Global.isOnline,
            iconDropDownFolder: 'ios-arrow-forward'
        }
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('NetworkStatusChanged', (status) => {
            console.log('Connection status', status);
            this.setState({ isOnline: status.isOnline });
        });

        BackgroundTimer.setTimeout(() => {
            this.getReportList('first_load');
        }, Global.loadingDelay);

        // Go back to Home when user click android back button
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });


    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener('NetworkStatusChanged');
        this.backHandler.remove();
    }

    refresh() {
        this.getReportList('refresh');
    }

    loadMore() {
        if (this.state.paging && this.state.paging.next_offset) {
            this.getReportList('load_more');
        }
    }

    getReportList(type) {
        // Do request
        if (type == 'refresh') {
            this.setState({ loading: false });
            this.setState({ refreshing: true });
        }
        else {
            this.setState({ loading: true });
            this.setState({ refreshing: false });
        }
        var offset = 0;

        if (type == 'load_more') {
            if (this.state.paging.next_offset) {
                offset = this.state.paging.next_offset;
            }
        }

        var params = {
            RequestAction: 'GetReportList',
            Params: {
                folder_id: this.state.folder?.key ? this.state.folder?.key : 'All',
                keyword: this.state.reportKeyWord,
                paging: {
                    order_by: '',
                    offset: offset,
                    max_results: 20
                }
            }
        };

        Global.callAPI(this, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(I18n.t('common.msg_no_results_found', { locale: Global.locale || "vn_vn" }));
                return;
            }

            // Reload accounts
            var list = data.entry_list;

            if (type == 'load_more') {
                list = this.state.reportList.concat(list);
            }

            let folder = this.state.folder;
            if (!folder.key) {
                data?.enum_list?.folder_list?.map((item, index) => {
                    if (item.id == 'All') {
                        folder = {
                            key: item?.id,
                            label: item?.text
                        };
                    }
                })
            }

            this.setState({
                reportList: list,
                paging: data.paging,
                folderList: data?.enum_list?.folder_list?.map((folder, index) => {
                    return {
                        key: folder?.id,
                        label: folder?.text
                    }
                }),
                folder: folder
            });
        }, error => {
            Toast.show(I18n.t('common.msg_connection_error', { locale: Global.locale || "vn_vn" }));
        });
    }

    render() {
        return (
            <>
                <LargeHeader>
                    <Header noBorder>
                        <Left style={{ minWidth: '70%' }}>
                            <TouchableHighlight
                                activeOpacity={.3}
                                underlayColor={Colors.black.black5}
                                style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                                onPress={() => this.props.navigation.openDrawer()}
                            >
                                <Icon name={getIcon("Menu")} style={{ color: Colors.black.black1, fontSize: 18 }} />
                            </TouchableHighlight>
                            <MenuFilterList
                                value={this.state.folder}
                                options={this.state.folderList}
                                onSelected={(value) => {
                                    this.setState({ folder: value }, () => this.getReportList())
                                }}
                            />
                        </Left>

                        <Right style={{  }}>
                        </Right>
                    </Header>
                    <Header noBorder>
                        <SearchInput
                            autoFocus={false}
                            value={this.state.reportKeyWord}
                            onValueChange={(value) => this.setState({ reportKeyWord: value })}
                            isClearText={true}
                            onClearText={() => this.setState({ reportKeyWord: '' })}
                            backgroundColor={Colors.white.white3}
                            placeholder={getLabel('report.type_report_name_label')}
                            onSearch={() => {
                                this.getReportList()
                            }}
                        />
                    </Header>
                </LargeHeader>

                <Content enableScroll={false}>
                    <FlatList
                        style={{ flex: 1 }}
                        data={this.state.reportList}
                        extraData={this.state}
                        disableVirtualization={false}
                        nest
                        renderItem={({ item, index, separators }) =>
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() => {logScreenView('ViewDetailReport'); this.props.navigation?.navigate('ReportView', { data: item })}}
                            >
                                <View style={styles.viewIconModule}>
                                    <Icon
                                        name={getIconModule('Report')}
                                        style={styles.iconModule}
                                    />
                                </View>
                                <View>
                                    <Text  allowFontScaling={true}  style={styles.titleReport}>
                                        {item.name}
                                    </Text>
                                    <Text  allowFontScaling={true}  style={styles.subText}>
                                        {
                                            I18n.t('report.folder_name_label', {
                                                locale: Global.locale || "vn_vn",
                                                folderName: item.folder_name
                                            })
                                        }
                                    </Text>
                                    <Text  allowFontScaling={true}  style={styles.subText}>
                                        {
                                            I18n.t('report.primary_module_label', {
                                                locale: Global.locale || "vn_vn",
                                                primaryModule: item.primary_module
                                            })
                                        }
                                    </Text>
                                </View>
                                <View style={styles.viewIconRight}>
                                    <Icon
                                        name='angle-right'
                                        style={styles.iconRight}
                                    />
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item, index) => index.toString()}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.refresh()}
                                tintColor='#309ed8'
                                colors={['#309ed8', '#25add0', '#15c2c5']}
                                progressBackgroundColor='#fff'
                            />
                        }
                        onEndReachedThreshold={0.5}
                        onEndReached={({ distanceFromEnd }) => {
                            this.loadMore();
                            console.log('distanceFromEnd: ', distanceFromEnd)
                        }}
                    />

                </Content>
                <IndicatorLoading loading={this.state.loading} />

            </>
        );
    }
}
