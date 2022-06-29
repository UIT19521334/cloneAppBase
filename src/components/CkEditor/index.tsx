/**
 * @file    : CKEditor/index.js
 * @author  : Manh Le
 * @date    : 2021-04-13
 * @purpose : component UI intergation CkEditor
*/

import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import HTML from 'react-native-render-html';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CKEDITOR from '../../package/react-native-ckeditor';
import { Colors } from "../../themes/colors/Colors";
import { Box, Text } from "../../themes/themes";
import { getLabel, heightDevice, widthDevice } from "../../utils/commons/commons";

interface CKEditorModalRef {
    show(): void;
}

const isHtmlString = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

type CKEditorModalProps = {
    content: string,
    label: string,
    onValueChange: (value: string) => void
}

const CKEditorModal = forwardRef(({ content, label, onValueChange }: CKEditorModalProps, ref) => {
    const ckEditorRef = useRef<Modalize>(null);
    const [contentValue, setContentValue] = useState(content);
    const insets = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
        show: () => {
            ckEditorRef.current?.open?.();
        }
    }));

    React.useEffect(() => {
        setContentValue(content);

        return () => { }
    }, [content]);

    return (
        <>
            <Box
                width={widthDevice}
                marginTop={'l'}
            >
                <Box
                    paddingLeft='l'
                    paddingVertical='l'
                >
                    <Text color={'black2'}>{label}</Text>
                </Box>

                <Box
                    width={widthDevice}
                    minHeight={44}
                    paddingHorizontal='l'
                >
                    <TouchableOpacity
                        onPress={() => {
                            ckEditorRef.current?.open?.();
                        }}
                    >
                        <Box
                            flex={1}
                            paddingBottom={'m'}
                            paddingLeft='m'
                            borderBottomColor='black4'
                            borderBottomWidth={0.7}
                            minHeight={44}
                        >
                            {
                                content ? (
                                    <HTML
                                        source={{ html: isHtmlString(content || '') ? (content || '') : (content || '').toString().replace(/\n/g, "<br/>") }}
                                    />
                                )
                                    : (
                                        <Text
                                            color={'black3'}
                                            fontSize={14}
                                        >
                                            {label}
                                        </Text>
                                    )
                            }

                        </Box>
                    </TouchableOpacity>
                </Box>
            </Box>

            <Portal>
                <Modalize
                    ref={ckEditorRef}
                    adjustToContentHeight
                    panGestureEnabled={false}
                    scrollViewProps={{
                        scrollEnabled: false
                    }}
                >
                    <Box
                        height={heightDevice * 0.9}
                        paddingTop={'l'}
                    >
                        <CKEDITOR
                            content={contentValue || ''}
                            onChange={(value) => {
                                setContentValue(value);
                            }}
                        />
                        <Box
                            height={64}
                            flexDirection='row'
                            justifyContent={'center'}
                            alignItems='center'
                            paddingHorizontal={'l'}
                            paddingVertical='l'
                        >
                            <TouchableOpacity
                                onPress={() => ckEditorRef.current?.close?.()}
                                style={{
                                    maxWidth: 80,
                                    flex: 1,
                                    height: '100%',
                                    marginVertical: 4,
                                    backgroundColor: 'rgba(255, 229, 229, 1)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 6
                                }}
                            >
                                <Text
                                    color={'dangerous'}
                                    fontWeight='bold'
                                    fontSize={16}
                                >
                                    {getLabel('common.btn_cancel')}
                                </Text>
                            </TouchableOpacity>

                            <Box width={12} />

                            <TouchableOpacity
                                onPress={() => {
                                    onValueChange?.(contentValue);
                                    ckEditorRef.current?.close?.()
                                }}
                                style={{
                                    maxWidth: 80,
                                    flex: 1,
                                    height: '100%',
                                    marginVertical: 4,
                                    backgroundColor: Colors.functional.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 6
                                }}
                            >
                                <Text
                                    color='white1'
                                    fontWeight='bold'
                                >
                                    {getLabel('common.btn_save')}
                                </Text>
                            </TouchableOpacity>
                        </Box>
                    </Box>

                    <Box height={insets.bottom} />
                </Modalize>
            </Portal>
        </>
    )
});

export {
    CKEditorModal,
    CKEditorModalRef
};