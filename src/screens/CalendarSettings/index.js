import React, { Component } from 'react';
import { BackHandler, ScrollView, Switch, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { connect } from 'react-redux';
//import component
import { Body, Content, Header, IconRight, LBText, Left, LText, NBText, Right, SpaceHS, SpaceM, SpaceS, Title } from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import ModalSelect from '../../components/ModalSelect';
import MultipleSelect from '../../components/MultipleSelect';
import Global from '../../Global';
import { showAlert } from '../../redux/actions/alert';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { getIcon, getLabel, widthResponse } from '../../utils/commons/commons';
import ColorPicker from './ColorPicker';
import styles from './styles';

class CalendarSettingScreen extends Component {
    constructor(props) {
        super(props);
        this.indexItemSelectColor = 0;
        this.userList = [];
        Object.keys(Global.userList).map((key) => {
            if (key != Global.user.id) {
                console.log(key);
                this.userList.push({ ...Global.userList[key] })
                // return {...Global.userList[key]};
            }
        });
        this.state = {
            loading: false,
            displayActivityTypeList: [],
            userFeedList: [{
                id: Global.user?.id,
                email: Global.user?.email1,
                name: Global.user?.name,
                checked: true,
                color: '#1187D0'
            }],
            colorPickerModalVisible: false,
            recents: [],
            color: Colors.black.black1
        }
    }

    componentDidMount() {
        this.getCalendarSettings();
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation?.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    getCalendarSettings() {
        this.setState({ loading: true });
        var params = {
            RequestAction: 'GetCalendarSettings'
        };

        // Call api
        Global.callAPI(null, params, data => {
            if (parseInt(data.success) === 1) {
                let displayActivityTypeList = [];
                let userFeedList = [...this.state.userFeedList];
                data.calendar_settings?.shared_calendar_activity_types?.length > 0 && data.calendar_settings?.shared_calendar_activity_types.map((activitytype, index) => {
                    displayActivityTypeList.push({
                        key: activitytype,
                        label: Global.getEnumLabel('Events', 'activitytype', activitytype)
                    });
                });

                data.calendar_settings?.calendar_feeds && Object.keys(data.calendar_settings?.calendar_feeds)?.length > 0 && Object.keys(data.calendar_settings?.calendar_feeds).map((userId, index) => {
                    if (userId != Global.user?.id) {
                        let user = {
                            id: data.calendar_settings?.calendar_feeds[userId]?.id,
                            name: data.calendar_settings?.calendar_feeds[userId]?.name,
                            checked: data.calendar_settings?.calendar_feeds[userId]?.visible == 1 ? true : false,
                            color: data.calendar_settings?.calendar_feeds[userId]?.color,
                        }

                        userFeedList.push(user);
                    }
                    else {
                        this.state.userFeedList[0].color = data.calendar_settings?.calendar_feeds[userId]?.color;
                        this.state.userFeedList[0].checked = data.calendar_settings?.calendar_feeds[userId]?.visible == 1 ? true : false;
                        this.setState({ userFeedList: this.state.userFeedList });
                    }
                });

                this.setState({
                    hideCompletedCalendarEvents: data.calendar_settings?.hidecompletedevents == 1 ? true : false,
                    displayActivityTypeList,
                    userFeedList,
                    loading: false
                });
            }
            else {
                this.setState({ loading: false });
                Toast.show(getLabel('common.msg_connection_error'));
            }
        }, error => {
            this.setState({ loading: false });
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    saveCalendarSettings() {
        if (this.state.displayActivityTypeList?.length <= 0) {
            alert(getLabel('calendar.msg_shared_calendar_activity_types_empty'));
            return;
        }

        this.setState({ loading: true });
        let displayActivityTypeList = [];
        let userFeedList = [];
        this.state.displayActivityTypeList.length > 0 && this.state.displayActivityTypeList.map((activitytype) => {
            displayActivityTypeList.push(activitytype.key);
        });

        this.state.userFeedList.length > 0 && this.state.userFeedList.map((user) => {
            let tmpUser = {
                id: user.id,
                color: user.color,
                visible: user.checked ? 1 : 0
            }

            userFeedList.push(tmpUser);
        })

        var params = {
            RequestAction: 'SaveCalendarSettings',
            Data: {
                hidecompletedevents: this.state.hideCompletedCalendarEvents ? 1 : 0,
                shared_calendar_activity_types: displayActivityTypeList,
                calendar_feeds: userFeedList
            }
        };

        // Call api
        Global.callAPI(this, params, data => {
            if (parseInt(data.success) === 1) {
                this.setState({
                    userFeedList: [{
                        id: Global.user?.id,
                        email: Global.user?.email1,
                        name: Global.user?.name,
                        checked: true,
                        color: '#1187D0'
                    }]
                });
                this.props.route?.params?.onReLoadData?.();
                Toast.show(
                    getLabel('calendar.msg_save_calendar_settings_successfully'),
                    {
                        duration: Toast.durations.SHORT,
                        delay: 0,
                        animation: false,
                        hideOnPress: true,
                        onHidden: () => {
                            
                        }
                    }
                );
                this.props.navigation.goBack();
            }
            else {
                Toast.show(getLabel('common.msg_connection_error'));
            }
        }, error => {
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    getActivityTypeList() {
        let activityTypeList = [...Global.getEnum('Calendar', 'activitytype')];
        let result = [];
        if (this.state.displayActivityTypeList?.length == 0) {
            result = [...activityTypeList];
        }
        else if (activityTypeList.length == this.state.displayActivityTypeList.length) {
            result = [];
        }
        else {
            activityTypeList.map((activityType, index) => {
                if (this.state.displayActivityTypeList.findIndex((item) => item.key == activityType.key) == -1) {
                    result.push(activityType)
                }
            })
        }

        return result;
    }

    renderColorPickerModal() {
        return (
            <ColorPicker
                visible={this.state.colorPickerModalVisible}
                color={this.state.color}
                returnMode={'hex'}
                onCancel={() => this.setState({ colorPickerModalVisible: false })}
                onOk={(colorHex) => {
                    console.log('SELECT COLOR')
                    this.state.userFeedList[this.indexItemSelectColor].color = colorHex;
                    this.setState({
                        colorPickerModalVisible: false,
                        userFeedList: this.state.userFeedList
                    });
                    this.setState({
                        recents: [
                            colorHex,
                            ...this.state.recents.filter(c => c !== colorHex).slice(0, 4)
                        ]
                    });
                }}
                swatches={this.state.recents}
                swatchesLabel={getLabel('calendar.label_recent')}
                okLabel={getLabel('common.btn_select')}
                cancelLabel={getLabel('common.btn_cancel')}
            />
        );
    }

    render() {
        const { navigation, showAlert } = this.props;
        return (
            <>
                <Header
                    style={{
                        width: widthResponse
                    }}
                >
                    <Left>
                        <TouchableHighlight
                            activeOpacity={0.2}
                            underlayColor={Colors.white.white2}
                            style={{ marginLeft: 12 }}
                            onPress={() => {
                                navigation.goBack()
                            }}
                        >
                            <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_cancel')}</LText>
                        </TouchableHighlight>
                    </Left>
                    <Body>
                        <Title allowFontScaling={true} >{getLabel('calendar.title_calendar_settings')}</Title>
                    </Body>
                    <Right>
                        <IconRight
                            onPress={() => { this.saveCalendarSettings() }}
                        >
                            <LText allowFontScaling={true} color={Colors.functional.primary}>{getLabel('common.btn_save')}</LText>
                        </IconRight>
                    </Right>
                </Header>
                <Content>
                    <ScrollView>
                        <SpaceM />
                        <Box
                            padding='l'
                            backgroundColor='white1'
                        >
                            <LBText allowFontScaling={true} style={{ color: Colors.brand.brand1 }}>{getLabel('calendar.label_display_options')}</LBText>
                            <SpaceS />
                            <Box
                                flexDirection='row'
                                justifyContent='space-between'
                                alignItems='center'
                            >
                                <NBText allowFontScaling={true} >{getLabel('calendar.label_hide_completed_calendar_events')}</NBText>
                                <Switch
                                    trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                    thumbColor={Colors.white.white1}
                                    ios_backgroundColor="#767577"
                                    style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                    value={this.state.hideCompletedCalendarEvents}
                                    onValueChange={() => {
                                        this.setState({ hideCompletedCalendarEvents: !this.state.hideCompletedCalendarEvents })
                                    }}
                                />
                            </Box>

                        </Box>
                        <SpaceM />
                        <Box
                            padding='l'
                            backgroundColor='white1'
                        >
                            <LBText allowFontScaling={true} style={{ color: Colors.brand.brand1 }}>{getLabel('calendar.tab_shared_calendar')}</LBText>
                            <SpaceS />
                            <Box>
                                <Box
                                    flexDirection='row'
                                    justifyContent='space-between'
                                >
                                    <NBText allowFontScaling={true} >{getLabel('calendar.label_shared_calendar_display_activity_types')}</NBText>
                                    <SpaceHS />

                                </Box>
                                <SpaceS />
                                <ModalSelect
                                    style={{ alignSelf: 'flex-start' }}
                                    options={this.getActivityTypeList()}
                                    value={{}}
                                    onSelected={(value) => {
                                        this.state.displayActivityTypeList.push(value);
                                        this.setState({ displayActivityTypeList: this.state.displayActivityTypeList });
                                    }}
                                />
                                <SpaceS />
                                <Box
                                // borderWidth={0.5}
                                // borderColor='black3'
                                >
                                    <View style={styles.tagView}>
                                        <Icon
                                            name='tag'
                                            style={styles.iconTag}
                                        />
                                        <View style={{ flexWrap: 'wrap', flexDirection: 'row', flex: 1 }}>
                                            {
                                                this.state.displayActivityTypeList?.length > 0 && this.state.displayActivityTypeList.map((item, index) => {
                                                    return (
                                                        <TouchableOpacity
                                                            style={styles.tagItemView}
                                                            onPress={() => {
                                                                this.state.displayActivityTypeList.splice(index, 1);
                                                                this.setState({ displayActivityTypeList: this.state.displayActivityTypeList })
                                                            }}
                                                        >
                                                            <Text allowFontScaling={true} style={styles.tagItemText}>
                                                                {item.label}
                                                            </Text>
                                                            <View>
                                                                <Icon
                                                                    name={getIcon('Close')}
                                                                    style={styles.iconRemoveTag}
                                                                />
                                                            </View>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    </View>
                                </Box>
                            </Box>
                            <SpaceM />
                            <Box>
                                <NBText allowFontScaling={true} >{getLabel('calendar.label_add_new_user_feed')}</NBText>
                                <SpaceS />
                                <Box
                                    borderWidth={0.5}
                                    borderColor='black3'
                                >
                                    <MultipleSelect
                                        data={this.userList}
                                        value={this.state.userFeedList}
                                        mode='user'
                                        labelSearch={getLabel('calendar.label_user_feed')}
                                        selectItem={(itemList) => {
                                            let userFeedList = itemList;
                                            userFeedList[(userFeedList.length - 1)].checked = true;
                                            userFeedList[(userFeedList.length - 1)].color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

                                            this.setState({ userFeedList })
                                        }}
                                    />
                                </Box>
                            </Box>
                            <SpaceM />
                            <Box>
                                <NBText allowFontScaling={true} >{getLabel('calendar.label_added_calendars')}</NBText>
                                <Box padding='l'>
                                    {
                                        this.state.userFeedList?.length > 0 && this.state.userFeedList.map((item, index) => {
                                            return (
                                                <View
                                                    style={[
                                                        styles.userFeedView,
                                                        {
                                                            borderTopWidth: index == 0 ? 0.5 : 0
                                                        }
                                                    ]}
                                                >
                                                    <Text allowFontScaling={true} style={styles.userFeedText}>
                                                        {item.name}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        {
                                                            item.id != Global.user?.id && (
                                                                <TouchableOpacity
                                                                    style={{ marginRight: 16 }}
                                                                    onPress={() => {
                                                                        let userFeedList = [...this.state.userFeedList];
                                                                        userFeedList.splice(index, 1);
                                                                        this.setState({ userFeedList });
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        name='trash-alt'
                                                                        style={styles.iconRemoveUserFeed}
                                                                    />
                                                                </TouchableOpacity>
                                                            )
                                                        }
                                                        <TouchableOpacity
                                                            style={{ width: 20, height: 20, borderRadius: 45, marginRight: 16, backgroundColor: item.color ? item.color : '#000' }}
                                                            onPress={() => {
                                                                if (Platform.OS == 'ios') {
                                                                    this.indexItemSelectColor = index;
                                                                    setTimeout(() => {
                                                                        this.setState({
                                                                            color: item.color,
                                                                            colorPickerModalVisible: true
                                                                        });
                                                                    }, 500);
                                                                }
                                                                else {
                                                                    this.indexItemSelectColor = index;
                                                                    this.setState({
                                                                        color: item.color,
                                                                        colorPickerModalVisible: true
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <TouchableOpacity
                                                            style={{ width: 30 }}
                                                            onPress={() => {
                                                                let userFeedList = [...this.state.userFeedList];
                                                                userFeedList[index].checked = item.checked ? false : true;
                                                                this.setState({ userFeedList });
                                                            }}
                                                        >
                                                            <Icon
                                                                name={item.checked ? 'eye' : 'eye-slash'}
                                                                style={[styles.iconViewUserFeed, { color: item.checked ? Colors.brand.brand1 : Colors.black.black3 }]}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </ScrollView>
                </Content>
                {this.renderColorPickerModal()}
                <IndicatorLoading loading={this.state.loading} />
            </>
        );
    }
}


function bindAction(dispatch) {
    return {
        showAlert: (params) => {
            return dispatch(showAlert(params));
        }
    };
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, bindAction)(CalendarSettingScreen);
