import React, { Component } from 'react';
import { BackHandler, DeviceEventEmitter, Modal, TouchableHighlight, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import IndicatorLoading from '../../../components/IndicatorLoading';
import Global from '../../../Global';
import { Colors } from '../../../themes/colors/Colors';
import { getIcon, getLabel, heightDevice, widthDevice, widthResponse } from '../../../utils/commons/commons';
import { Body, Header, IconRight, Left, LText, Right, Title } from '../../../components/CustomComponentView';
import styles from './styles';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { Box, Text } from '../../../themes/themes'
import { Content, View } from 'native-base'
import { SafeAreaView } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation';

export default class ReportView extends Component {
	constructor(props) {
		super(props);
		this.isBtnConfirmPressed = false;
		this.state = {
			loading: false,
			refreshing: false,
			source: `${Global.getServiceUrl('serverUrl')}/entrypoint.php?name=EmbeddedReportChart&record=${this.props?.route?.params?.data?.id}&token=${Global.token}`,
			isOnline: Global.isOnline,
			isLandscape: false
		}
	}

	componentDidMount() {
		Orientation.lockToPortrait();
		DeviceEventEmitter.addListener('NetworkStatusChanged', (status) => {
			console.log('Connection status', status);
			this.setState({ isOnline: status.isOnline });
		});

		// Go back to Home when user click android back button
		this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			this.props.navigation?.goBack();
			return true;
		});
	}

	componentWillUnmount() {
		DeviceEventEmitter.removeListener('NetworkStatusChanged');
		this.backHandler.remove();
		Orientation.lockToPortrait();
	}

	render() {
		console.log(this.state.source);
		return (
			<>
				{
					!this.state.isLandscape ?
						(
							<Header
								style={{
									width: widthResponse
								}}
							>
								<Left>
									<TouchableHighlight
										activeOpacity={0.2}
										underlayColor={Colors.white.white2}
										style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
										onPress={() => {
											this.props.navigation.goBack()
										}}
									>
										<Icon name={getIcon('Back')} style={{ fontSize: 24 }} />
									</TouchableHighlight>
								</Left>
								<Body>
									<Title allowFontScaling={true} >{getLabel('report.title')}</Title>
								</Body>
								<Right>
									<IconRight
										onPress={() => { this.webViewRef.reload() }}
									>
										<Icon name={'sync-alt'} style={{ fontSize: 24 }} />
									</IconRight>
								</Right>
							</Header>
						)
						: null
				}
				<SafeAreaView style={{ flex: 1, backgroundColor: Colors.white.white1 }}
					edges={['left', 'right']}

				>
					<View style={{ flex: 1 }}>
						<WebView
							ref={webViewRef => this.webViewRef = webViewRef}
							style={styles.containerWebView}
							source={{ uri: this.state.source }}
							injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
							scalesPageToFit={false}
							showsVerticalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							onLoadStart={() => {
								this.setState({
									loading: true
								});
							}}
							onLoadEnd={() => {
								this.setState({ loading: false });
							}}
							renderLoading={() => (
								<></>
							)}
						/>
					</View>
					<Box
						position='absolute'
						zIndex={Number.MAX_SAFE_INTEGER}
						bottom={this.state.isLandscape ? widthDevice * .07 : heightDevice * .07}
						right={this.state.isLandscape ? widthDevice * .07 : widthDevice * .07}
					>

						<TouchableOpacity
							activeOpacity={.7}
							onPress={() => {
								if (this.state.isLandscape) {
									this.setState({ isLandscape: false }, () => {
										Orientation.lockToPortrait();
									})
								} else {
									this.setState({ isLandscape: true }, () => {
										Orientation.lockToLandscapeRight();
									})
								}
							}}
						>
							<Box
								width={56}
								height={56}
								borderRadius={56 / 2}
								justifyContent='center'
								alignItems='center'
								style={{
									backgroundColor: 'rgba(0, 0, 0, .62)'
								}}
							>
								<Icon
									name={!this.state.isLandscape ? 'expand' : 'compress'}
									color={Colors.white.white1}
									size={22}
								/>
							</Box>

						</TouchableOpacity>
					</Box>
				</SafeAreaView>
				<IndicatorLoading loading={this.state.loading} />
			</>
		);
	}
}
