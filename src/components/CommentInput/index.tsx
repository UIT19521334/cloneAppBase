/**
 * @file    : CommentInput/index.js
 * @author  : Khiem ha
 * @date    : 2021-01-26
 * @purpose : create UI for the input comment
*/

import React, { FC } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { MentionInput, MentionSuggestionsProps } from 'react-native-controlled-mentions';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { SpaceHS } from '../CustomComponentView';

type CommentInputProps = {
    comment: String | string | any,
    inputProps: TextInputProps,
    onCommentChange: (value: string) => void
}

const renderSuggestions: FC<MentionSuggestionsProps> = ({ keyword, onSuggestionPress }) => {
    const suggestions = [...(Global.mentions || [])];

    if (keyword == null) {
        return null;
    }

    return (
        <ScrollView
            style={{
                maxHeight: 150,
                minHeight: 150,
                backgroundColor: Colors.white.white2,
                borderRadius: 6
                , ...styles.shadow
            }}
            keyboardShouldPersistTaps={'always'}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={true}
        >
            {suggestions
                .filter(one => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
                .map(one => (
                    <TouchableOpacity
                        key={one.id}
                        onPress={() => onSuggestionPress?.(one)}

                        style={{
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            source={{
                                uri: one.avatar
                            }}
                            style={{
                                height: 35,
                                width: 35,
                                resizeMode: 'stretch',
                                borderRadius: 35 / 2,
                                backgroundColor: '#fff'
                            }}
                        />

                        <SpaceHS />

                        <Text
                        >
                            {one.name}
                        </Text>
                    </TouchableOpacity>
                ))
            }
        </ScrollView>
    );
}

export default function CommentInput({ comment = '', inputProps = {}, onCommentChange = undefined }: CommentInputProps) {
    const [textValueEdit, setTextValueEdit] = React.useState('');

    React.useEffect(() => {
        setTextValueEdit(comment || '');
        
        return () => {}
    }, [comment]);

    return (
        <MentionInput
            value={textValueEdit}
            {...inputProps}
            partTypes={[
                {
                    trigger: '@', // Should be a single character like '@' or '#'
                    renderSuggestions,
                    textStyle: { fontWeight: 'bold', color: Colors.functional.primary }, // The mention style in the input
                    isBottomMentionSuggestionsRender: true,
                    isInsertSpaceAfterMention: true,
                    pattern: /(?<original>@\[(?<name>([^[]+))]\((?<id>([w+:\d\w-]+))\))/
                },
            ]}
            onChange={(value) => {
                onCommentChange?.(value)
            }}
        />
    )
}

const styles = StyleSheet.create({
    shadow: {
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: Colors.black.black1,
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.30,
                shadowRadius: 1.41,
            }
        }),
    }
});