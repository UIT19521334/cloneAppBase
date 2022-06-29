import { Icon, Text } from 'native-base';
import React, { Component } from 'react';
import { Animated, Dimensions, TouchableOpacity, View } from 'react-native';
import { windowSize } from '../../utils/commons/commons';
import styles from './styles';


const {width, height} =  windowSize;
const maxHeightItem = 135;

export class Row extends Component {
  	constructor(props) {
    	super(props);
    	this._active = new Animated.Value(0);
    	this._style = {
    	};
  	}

  	componentWillReceiveProps(nextProps) {
  	}

  	render() {
		const { data } = this.props;
		return (
			<View
				style={[
					styles.row,
					{ alignSelf: 'center' }
				]}
			>
				<Text  
				allowFontScaling={true} 
					ellipsizeMode='tail'
					numberOfLines={1}
					style={styles.textOwner}>
					{data.name +(data.email ? ` (${data.email})` : '')}
				</Text>
				<View style={{ flexDirection: 'row', right: 10, position: 'absolute' }}>
					<TouchableOpacity onPress={this.props.removeItem}>
						<Icon
							name='md-close-circle'
							style={styles.iconOwner}
						/>
					</TouchableOpacity>
				</View>
			  </View>
		);
  	}
}
