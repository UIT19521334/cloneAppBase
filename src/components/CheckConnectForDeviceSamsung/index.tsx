/**
 * @file    : CheckConnectForDeviceSamsung.js
 * @author  : Manh Le
 * @date    : 2021-06-01
 * @purpose : component check connection on Android device
*/

import NetInfo from "@react-native-community/netinfo";
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../themes/colors/Colors';
import { getLabel, widthDevice } from '../../utils/commons/commons';

const CheckConnectForDeviceSamsung = () => {
	const [isConnected, setConnected] = React.useState(true);
	const [isShow, setShow] = React.useState(false);
	const [isStarted, setStarted] = React.useState(false);

	const areaInset = useSafeAreaInsets();
	let timeOutOpenNetWork = null;

	React.useEffect(() => {

		NetInfo.fetch().then(state => {
			setConnected(state.type.toLocaleLowerCase() != 'none');
		});

		const unsubscribe = NetInfo.addEventListener(state => {
			setConnected(state.type.toLocaleLowerCase() != 'none');
			setStarted(true);
		});

		return () => {
			unsubscribe();
		}
	}, []);

	React.useEffect(() => {
		if (isStarted) {
			if (isConnected) {
				timeOutOpenNetWork = setTimeout(() => {
					setShow(false);
					clearTimeout(timeOutOpenNetWork);
				}, 5000);
			}
			else {
				setShow(true);
			}
		}

		return () => { }
	}, [isConnected, isStarted]);

	if (!isShow) {
		return false;
	}

	return (
		<Pressable
			style={{
				position: 'absolute',
				width: widthDevice,
				height: 52 + areaInset.top,
				paddingTop: areaInset.top,
				backgroundColor: !isConnected ? Colors.functional.dangerous : Colors.functional.successful,
				justifyContent: 'center',
				alignItems: 'center',
				paddingBottom: 4,
				top: 0,
			}}
			onPress={() => {
				if (isShow && isConnected) {
					setShow(false);
					timeOutOpenNetWork && clearTimeout(timeOutOpenNetWork);
				}
			}}
		>
			<Text
				style={{
					color: Colors.white.white1,
					fontSize: 16
				}}
			>
				{!isConnected ? getLabel('common.not_connect_label') : getLabel('common.connected_label')}
			</Text>
		</Pressable>
	)
}

export default React.memo(CheckConnectForDeviceSamsung);