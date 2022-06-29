/**
 * @file    : CommentView/index.js
 * @author  : Khiem Ha
 * @date    : 2021-01-26
 * @purpose : create UI for the record item comment
*/

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../themes/colors/Colors';
import HightLightText from '../HightLightText';

type CommentViewProps = {
    commentContent: String | string | any,
    type: 'parent' | 'child'
}

export default function CommentView({ commentContent = '', type = 'parent' }: CommentViewProps) {
    const [textValue, setTextValue] = React.useState('');
    const [wordHighLight, setWordHighLight] = React.useState([]);

    const handleParseHtmlDisplay = (text: string) => {
        let html = text;
        let regex = /(?<original>@\[(?<name>([^[]+))]\((?<id>([w+:\d\w-]+))\))/gi;
        let searchWord = [...wordHighLight];

        const res = html.replace(regex, function () {
            const valueTemp = [...arguments]?.[[...arguments].length - 1];

            searchWord.push(`${valueTemp.id}@${valueTemp.name}`);

            return `${valueTemp.id}@${valueTemp.name}`;
        })

        setWordHighLight(searchWord);
        setTextValue(res);
    }

    React.useEffect(() => {

        handleParseHtmlDisplay(commentContent)

        return () => { }
    }, [commentContent]);

    return (
        <View>
            <HightLightText
                style={{
                    fontSize: type === 'parent' ? 14 : 12
                }}
                allowFontScaling={true}
                highlightStyle={{
                    color: Colors.functional.primary,
                    fontWeight: 'bold'
                }}
                searchWords={[...wordHighLight]}
                textToHighlight={textValue}
            />
        </View>
    )
}