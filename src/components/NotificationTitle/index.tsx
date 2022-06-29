import React from 'react'
import { StyleSheet, Text, TextStyle, View } from 'react-native'
import HightLightText from '@sanar/react-native-highlight-text'
import HTML from "react-native-render-html";

import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { widthResponse } from '../../utils/commons/commons';
var DomParser = require('react-native-html-parser').DOMParser

type NotificationTitleProps = {
	body: String | string | any,
	style: TextStyle,
	type: String
}

export default function NotificationTitle({ type = '', body = '', style = {} }: NotificationTitleProps) {
	const [textValue, setTextValue] = React.useState('');
	const [wordHighLight, setWordHighLight] = React.useState([]);

	const handleParseHtmlDisplay = (text: string) => {
		console.log('Title Text: ', text);

		let decodeText = '';
		try {
			decodeText = decodeURIComponent(text);
		} catch (error) {
		}

		text = decodeText || text;

		let html = text;
		let regex = /\<+[a-zA-Z0-9\=\"\s]+\>+[^<]+\<\/+[a-zA-Z0-9]+\>/gi;
		const value = html.match(regex)

		let searchWord = [...wordHighLight];
		const listWord = [];

		value && value.length > 0 && value.forEach((word) => {
			const resWord = Global.parseHtmlToString(word, '');
			if (resWord.includes('http:') || resWord.includes('https:')) {

			}
			else {
				listWord.push(resWord.replace(/\[/g, '"').replace(/\]/g, '"'))
				console.log('parsed word: ', resWord.replace(/\[/g, '').replace(/\]/g, '"'));

			}
		})
		console.log('parsed: ', Global.parseHtmlToString(text, '').replace(/\[/g, '').replace(/\]/g, '"'));

		searchWord = searchWord.concat(listWord);
		setWordHighLight(searchWord);
		setTextValue(Global.parseHtmlToString(text, '').replace(/\[/g, '"').replace(/\]/g, '"'));
	}

	React.useEffect(() => {

		// handleParseHtmlDisplay(body)
		return () => {

		}
	}, [body])

	return (
		<View
			style={{ ...style }}
		>
			<HTML
				source={{ html: body }}
				contentWidth={widthResponse * .8}
			/>
			{/* <HightLightText
                allowFontScaling={true}
                style={{...style}}
				highlightStyle={{ color: Colors.black.black1, fontWeight: 'bold', fontSize: 14 }}
				searchWords={[...wordHighLight]}
				textToHighlight={textValue}
			/> */}
		</View>
	)
}

const styles = StyleSheet.create({})
