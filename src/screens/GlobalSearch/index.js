// Import libraries
import { Content } from 'native-base';
import React, { Component } from 'react';
import { BackHandler, FlatList, Image, Keyboard, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { connect } from 'react-redux';
// Import components
import Collapsible from '../../components/Collapsible';
import {
    Body, Header, IconRight,
    ItemListViewContent, LargeHeader, Left,
    LText,
    NBText, NText, Right,
    SearchInput, SpaceHS, SText, Title
} from '../../components/CustomComponentView';
import IndicatorLoading from '../../components/IndicatorLoading';
import MenuQuickCreate from '../../components/MenuQuickCreate';
import Global from '../../Global';
import * as messagePopup from '../../redux/actions/messagePopup';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { getIcon, getLabel, widthDevice } from '../../utils/commons/commons';
import { PARAMS_MESSAGE } from '../../utils/Models/models';
import styles from './styles';
const LeadItem = ({ data, onPress, onToggleFavorite }) => {
    return (
        <TouchableHighlight
            underlayColor={Colors.white.white3}
            activeOpacity={0.1}
            onPress={() => { onPress?.() }}
        >

            <ItemListViewContent
            >
                <View
                    style={[styles.lineItem]}
                >
                    <View style={{ flex: 1 }}>
                        <LText allowFontScaling={true} numberOfLines={1}>{data?.name}</LText>
                    </View>
                    {/* <TouchableOpacity style={[styles.btnStar]} onPress={() => onToggleFavorite?.()}>
                        <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                    </TouchableOpacity> */}
                </View>

                {/* <View
                    style={[styles.lineItem]}
                >
                    <Icon name={getIcon('Status')} />

                    <SpaceHS />
                    <View style={{ flex: 1 }}>
                        <NText allowFontScaling={true} numberOfLines={1}>{data.leadstatus}</NText>
                    </View>
                </View> */}

                <View
                    style={[styles.lineItem]}
                >
                    <View style={styles.ownerContent}>
                        <View style={styles.avatarContent}>
                            <Image source={require('../../assets/images/avatar.jpg')} resizeMode='cover' style={styles.avatar} />
                        </View>

                        <SpaceHS />
                        <View style={{ flex: 1 }}>
                            <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                        </View>
                    </View>
                    <View style={styles.time}>
                        <SText allowFontScaling={true} color={Colors.black.black2}>{Global.formatDate(data.createdtime)}</SText>
                    </View>
                </View>
            </ItemListViewContent>
        </TouchableHighlight>

    )
}

const ContactItem = ({ data, onPress, onToggleFavorite }) => {

    return (
        <TouchableHighlight
            underlayColor={Colors.white.white3}
            activeOpacity={0.1}
            onPress={() => { onPress?.() }}
        >

            <ItemListViewContent
            >
                <View
                    style={[styles.lineItem]}
                >
                    <View style={{ flex: 1 }}>
                        <LText allowFontScaling={true} numberOfLines={1}>{data?.name}</LText>
                    </View>
                    {/* <TouchableOpacity style={[styles.btnStar]} onPress={() => onToggleFavorite?.()}>
                        <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                    </TouchableOpacity> */}
                </View>

                {/* <View
                    style={[styles.lineItem]}
                >
                    <Icon name={getIconModule('Accounts')} />

                    <SpaceHS />
                    <View style={{ flex: 1 }}>
                        <NText allowFontScaling={true} numberOfLines={1}>{data.accountname}</NText>
                    </View>
                </View> */}

                <View
                    style={[styles.lineItem]}
                >
                    <View style={styles.ownerContent}>
                        <View style={styles.avatarContent}>
                            <Image source={require('../../assets/images/avatar.jpg')} resizeMode='cover' style={styles.avatar} />
                        </View>

                        <SpaceHS />
                        <View style={{ flex: 1 }}>
                            <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                        </View>
                    </View>
                    <View style={styles.time}>
                        <SText allowFontScaling={true} color={Colors.black.black2}>{Global.formatDate(data.createdtime)}</SText>
                    </View>
                </View>
            </ItemListViewContent>
        </TouchableHighlight>

    )
}

const OrganizationItem = ({ data, onPress, onToggleFavorite }) => {
    return (
        <TouchableHighlight
            underlayColor={Colors.white.white3}
            activeOpacity={0.1}
            onPress={() => { onPress?.() }}
        >

            <ItemListViewContent
            >
                <View
                    style={[styles.lineItem]}
                >
                    <View style={{ flex: 1 }}>
                        <LText allowFontScaling={true} numberOfLines={1}>{data.name}</LText>
                    </View>
                    {/* <TouchableOpacity style={[styles.btnStar]} onPress={() => onToggleFavorite?.()}>
                        <AntDesignIcon name={(data?.starred === '0' || !data?.starred) ? 'staro' : 'star'} style={[styles.iconStar, (data.item?.starred === '0' || !data.item?.starred) ? {} : { color: Colors.yellow.yellow1 }]} />
                    </TouchableOpacity> */}
                </View>

                <View
                    style={[styles.lineItem]}
                >
                    <View style={styles.ownerContent}>
                        <View style={styles.avatarContent}>
                            <Image source={require('../../assets/images/avatar.jpg')} resizeMode='cover' style={styles.avatar} />
                        </View>

                        <SpaceHS />
                        <View style={{ flex: 1 }}>
                            <NText allowFontScaling={true} numberOfLines={1} color={Colors.black.black2}>{data?.assigned_owners ? Global.getAssignedOwnersName(data?.assigned_owners) : ''}</NText>
                        </View>
                    </View>
                    <View style={styles.time}>
                        <SText allowFontScaling={true} color={Colors.black.black2}>{Global.formatDate(data.createdtime)}</SText>
                    </View>
                </View>
            </ItemListViewContent>
        </TouchableHighlight>

    )
}
class GlobalSearch extends Component {

    state = {
        keyword: '',
        recordList: [],
        loading: false,
        collapseLead: true,
        collapseContact: true,
        collapseOrganization: true,
        showResult: []
    }

    componentDidMount() {
        // this.unsubscribeBlur = this.props?.navigation?.addListener('blur', () => {
        // Reset data when unmount screen 
        this.setState({
            keyword: '',
            recordList: [],
            loading: false,
            collapseLead: true,
            collapseContact: true,
            collapseOrganization: true,
            showResult: []
        })
        // });

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
        // this.unsubscribeBlur();
    }

    search() {
        let keyword = this.state.keyword?.trim();
        if (keyword == '') {
            let paramsMessage: PARAMS_MESSAGE = {
                title: '',
                message: getLabel('globalSearch.keyword_empty_msg')
            }
            this.props.displayMessageWarning(paramsMessage)
            return;
        }

        if (this.state.keyword?.trim()?.length < Global.validationConfig?.global_search_keyword_min_length) {
            let paramsMessage: PARAMS_MESSAGE = {
                title: '',
                message: getLabel('globalSearch.keyword_invalid_min_height_msg', { minLength: Global.validationConfig?.global_search_keyword_min_length })
            }
            this.props.displayMessageWarning(paramsMessage)
            return;
        }

        this.setState({
            recordList: [],
            collapseLead: true,
            collapseContact: true,
            collapseOrganization: true,
            showResult: []
        })

        // Do request
        this.setState({ loading: true });

        var params = {
            RequestAction: 'GlobalSearch',
            Params: {
                keyword: keyword
            }

        };

        // Call api
        Global.callAPI(this, params, data => {
            console.log('Data search: ', JSON.stringify(data));
            if (parseInt(data?.success) != 1) {

                let paramsMessage: PARAMS_MESSAGE = {
                    title: '',
                    message: getLabel('common.msg_no_results_found')
                }
                this.props.displayMessageWarning(paramsMessage)
                return;
            }

            this.setState({ recordList: data.entry_list });
        }, error => {
            let paramsMessage: PARAMS_MESSAGE = {
                title: '',
                message: getLabel('common.msg_connection_error')
            }
            this.props.displayMessageError(paramsMessage);
        });
    }

    showDetails(data, module) {
        // Check permissions access view detail
        // if (data.assigned_user_id != Global.user.id) {
        // 	Toast.show(I18n.t('globalSearch.not_authorized_to_access_msg', {locale: Global.locale}));
        // 	return;
        // }

        switch (module) {
            case 'Accounts':
                this.props?.navigation.navigate('OrganizationView', { account: data, prevScene: 'GlobalSearch' });
                break;
            case 'Contacts':
                this.props?.navigation.navigate('ContactView', { contact: data, prevScene: 'GlobalSearch' });
                break;
            case 'Leads':
                this.props?.navigation.navigate('LeadView', { lead: data, prevScene: 'GlobalSearch' });
                break;
            case 'Potentials':
                this.props?.navigation.navigate('OpportunityView', { opportunity: data, prevScene: 'GlobalSearch' });
                break;
            case 'Calendar':
                this.props?.navigation.navigate('ActivityView', { activity: data, prevScene: 'GlobalSearch' });
                break;
            case 'HelpDesk':
                this.props?.navigation.navigate(Global.getTicketViewLabel(), { ticket: data, prevScene: 'GlobalSearch' });
                break;
            case 'Faq':
                this.props?.navigation.navigate('FaqView', { faq: data, prevScene: 'GlobalSearch' });
                break;
            default:
                alert(getLabel('global_search.not_seen_info_in_app_msg'));
                break;
        }
    }

    onToggleFavorite(module, data, indexSelected) {
        this.setState({ loading: true });

        var params = {
            RequestAction: 'SaveStar',
            Params: {
                module: module,
                starred: (data.starred == 0) ? 1 : 0
            }
        };

        switch (module) {
            case 'Accounts':
                params.Params.id = data?.accountid || data?.id;
                break;
            case 'Contacts':
                params.Params.id = data?.contactid || data?.id;
                break;
            case 'Leads':
                params.Params.id = data?.leadid || data?.id;
                break;
            case 'Potentials':
                params.Params.id = data?.potentialid || data?.id;
                break;
        }

        Global.callAPI(null, params, data => {
            if (parseInt(data.success) != 1) {
                Toast.show(getLabel('common.save_error_msg'));
                return;
            }



            if (indexSelected != -1) {
                let recordList = this.state.recordList;
                console.log('recordList', indexSelected, recordList[module].records?.[indexSelected]);
                // recordList[module].records?.[indexSelected].starred = (recordList?.[module]?.records?.[indexSelected].starred == 0) ? 1 : 0;

                // this.setState({recordList: recordList})
            }
            this.setState({ loading: false });
        }, error => {
            this.setState({ loading: false });
            Toast.show(getLabel('common.msg_connection_error'));
        });
    }

    viewAll(module){
        switch (module) {
            case 'Accounts':
                this.props?.navigation.navigate('ModalOrganizationList', { keyword: this.state.keyword, prevScene: 'GlobalSearch' });
                break;
            case 'Contacts':
                this.props?.navigation.navigate('ModalContactList', { keyword: this.state.keyword, prevScene: 'GlobalSearch' });
                break;
            case 'Leads':
                this.props?.navigation.navigate('ModalLeadList', { keyword: this.state.keyword, prevScene: 'GlobalSearch' });
                break;
            default:
                alert(getLabel('global_search.not_seen_info_in_app_msg'));
                break;
        }
    }

    render() {
        const { navigation } = this.props;
        const { keyword } = this.state;

        const MAX_HEIGHT_CONTACT = 115 * 2;
        return (
            <>
                <LargeHeader>
                    <Header noBorder>
                        <Left>
                            <TouchableHighlight
                                activeOpacity={.3}
                                underlayColor={Colors.black.black5}
                                style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                                onPress={() => { Keyboard.dismiss(); navigation.openDrawer() }}
                            >
                                <Icon name={getIcon('Menu')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                            </TouchableHighlight>
                        </Left>
                        <Body>
                            <Title allowFontScaling={true} >
                                {getLabel('common.title_global_search')}
                            </Title>
                        </Body>
                        <Right>
                            <IconRight>
                                <MenuQuickCreate
                                    icon={getIcon('QuickCreate')}
                                    onSelected={(itemSelected) => {
                                        switch (itemSelected.key) {
                                            case 'Leads':
                                                navigation.navigate('LeadForm')
                                                break;
                                            case 'Contacts':
                                                navigation.navigate('ContactForm')
                                                break;
                                            case 'Organizations':
                                                navigation.navigate('OrganizationForm')
                                                break;
                                            case 'Opportunities':
                                                navigation.navigate('OpportunityForm', { opportunity: { probability: 0 } })
                                                break;
                                            case 'Tickets':
                                                navigation.navigate(Global.getTicketFormLabel())
                                                break;
                                            case 'Call':
                                                navigation.navigate('ActivityForm')
                                                break;
                                            case 'Meeting':
                                                navigation.navigate('ActivityForm')
                                                break;
                                            case 'Task':
                                                navigation.navigate('ActivityForm')
                                                break;

                                            default:
                                                break;
                                        }
                                    }}
                                />
                            </IconRight>
                        </Right>
                    </Header>
                    <Header noBorder>
                        <SearchInput
                            autoFocus={true}
                            placeholder={getLabel('common.keyword_input_place_holder')}
                            value={keyword}
                            onValueChange={(value) => this.setState({ keyword: value })}
                            onSearch={() => this.search()}
                            isClearText={true}
                            onClearText={() => this.setState({ keyword: '' })}
                        />
                    </Header>
                </LargeHeader>

                <Content>
                    <Box paddingVertical='m' />
                    {
                        Object.keys(this.state.recordList)?.length > 0 && Object.keys(this.state.recordList).map((module, moduleIndex) => {
                            let title = '';
                            let totalCount = this.state.recordList?.[module]?.total_count;
                            let data = this.state.recordList?.[module]?.records;
                            let body = [];
                            switch (module) {
                                case 'Accounts':
                                    title = getLabel('common.title_organizations');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item, index }) => {
                                                return (
                                                    <OrganizationItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'Contacts':
                                    title = getLabel('common.title_contacts');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <ContactItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'Leads':
                                    title = getLabel('common.title_leads');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <LeadItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'Potentials':
                                    title = getLabel('common.title_opportunities');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <OrganizationItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'HelpDesk':
                                    title = getLabel('common.title_tickets');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <OrganizationItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'Faq':
                                    title = getLabel('common.title_faq');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <OrganizationItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                                case 'SalesOrder':
                                    title = getLabel('common.title_sales_order');
                                    body = (
                                        <FlatList
                                            style={{ maxHeight: MAX_HEIGHT_CONTACT }}
                                            nestedScrollEnabled={true}
                                            extraData={this.state}
                                            data={data}
                                            renderItem={({ item }) => {
                                                return (
                                                    <OrganizationItem
                                                        data={item}
                                                        onPress={() => this.showDetails(item, module)}
                                                    />
                                                );
                                            }}
                                            keyExtractor={(item, idx) => idx.toString()}
                                            ListFooterComponent={parseInt(totalCount || 0) < 5 ? null :
                                                <Box
                                                    width={widthDevice}
                                                    minHeight={40}
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    marginVertical='m'
                                                    backgroundColor='white1'
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            paddingHorizontal: 32,
                                                            paddingVertical: 20,
                                                            borderRadius: 8
                                                        }}
                                                        onPress={() => this.viewAll(module)}
                                                    >
                                                        <NText
                                                            style={{
                                                                color: Colors.functional.primary
                                                            }}
                                                        >
                                                            {getLabel('common.btn_view_all')}
                                                        </NText>

                                                    </TouchableOpacity>
                                                </Box>
                                            }
                                        />
                                    )
                                    break;
                            }

                            if (title != '' && totalCount > 0) {
                                return (
                                    <Box key={moduleIndex.toString()}>
                                        <Box paddingVertical='m' />
                                        <Collapsible
                                            buttonPosition='top'
                                            buttonContent={
                                                <View style={styles.collapseButton}>
                                                    <Box flexDirection='row'>
                                                        <NBText allowFontScaling={true} >{title}</NBText>
                                                        <View style={styles.badgeView}>
                                                            <SText allowFontScaling={true} color={Colors.white.white1}>{totalCount}</SText>
                                                        </View>
                                                    </Box>
                                                    <NText allowFontScaling={true} color={Colors.functional.primary}>
                                                        {this.state.recordList?.[module]?.isHidden ? getLabel('notification.btn_show') : getLabel('notification.btn_hide')}
                                                    </NText>
                                                </View>
                                            }
                                            onToggle={(collapsed) => {
                                                this.state.recordList[module].isHidden = collapsed;
                                                this.setState({ recordList: this.state.recordList })
                                            }}
                                            isShow={!this.state.recordList?.[module]?.isHidden}
                                            maxHeight={MAX_HEIGHT_CONTACT}
                                        >
                                            {body}
                                        </Collapsible>
                                    </Box>
                                )
                            }
                        })
                    }
                </Content>
                <IndicatorLoading loading={this.state.loading} />
            </>
        )
    }

}

const mapStateToProps = () => ({

})

const mapDispatchToProps = (dispatch, props) => {
    return {
        displayMessageWarning: (message) => dispatch(messagePopup.displayMessageWarning(message)),
        displayMessageSuccess: (message) => dispatch(messagePopup.displayMessageSuccess(message)),
        displayMessageError: (message) => dispatch(messagePopup.displayMessageError(message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalSearch)