/**
 * @file    : HightLightText/index.js
 * @author  : Manh Le, Khiem ha
 * @date    : 2021-03-15
 * @purpose : Create high light text used for render item comment
*/

import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { findAll, FindAllArgs } from 'highlight-words-core';

interface HighlightTextProps extends FindAllArgs, TextProps {
    highlightStyle?: TextStyle;
    highlightComponent?: React.ComponentType<TextProps>;
    textComponent?: React.ComponentType<TextProps>;
}

export default function HightLightText({
    autoEscape,
    caseSensitive,
    sanitize,
    searchWords,
    textToHighlight,
    highlightStyle,
    highlightComponent,
    textComponent,
    ...props
}: HighlightTextProps) {
    const chunks = findAll({
        autoEscape,
        caseSensitive,
        sanitize,
        searchWords,
        textToHighlight,
    });
    const Text = textComponent || RNText;
    const Highlight = highlightComponent || RNText;

    return (
        <Text {...props} >
            
            {chunks.map((chunk, index) => {
                const text = textToHighlight.substr(
                    chunk.start,
                    chunk.end - chunk.start
                );
                
                return chunk.highlight ? (
                    <Highlight key={`chunk-${index}`} style={highlightStyle}>
                        {'@' + text.split('@')[1]}
                    </Highlight>
                ) : (
                    text
                );
            })}
        </Text>
    );
}