import { useNavigation } from '@react-navigation/native'
import { Content } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet, TextInput, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Body, Header, IconRight, Left, ListItem, Right, SpaceHL, SpaceL, SpaceM, Title } from '../../components/CustomComponentView'
import RippleEffectButton from '../../components/RippleEffectButton'
import { Colors } from '../../themes/colors/Colors'
import { Box, Text } from '../../themes/themes'
import { getIconModule, getLabel, widthDevice } from '../../utils/commons/commons'
import Slider from '@react-native-community/slider';
import { systemFont, UIFontSize } from '../../utils/commons/FontSize'

type SectionViewProps = {
    style?: ViewStyle,
    titleStyle?: TextStyle,
    btnTextStyle?: TextStyle,
    title: string,
    children?: React.ReactNode
}

const SectionView = (props: SectionViewProps) => {
    const [isOpen, setOpen] = useState(true);

    return (
        <Box style={{
            ...(props?.style || {}),
            backgroundColor: Colors.white.white1,
            marginHorizontal: 12,
            marginTop: 12,
            borderRadius: 12
        }}>
            {/* Header */}
            <Box
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
                paddingHorizontal={'l'}
                height={42}
            >
                <Text
                    fontWeight={'bold'}
                    fontSize={16}
                    color={'black1'}
                    style={{ ...(props?.titleStyle || {}) }}
                >
                    {props.title || ''}
                </Text>

                {/* <TouchableOpacity
                    style={{
                        height: 42,
                        paddingHorizontal: 12,
                        justifyContent: 'center'
                    }}
                    onPress={() => setOpen(!isOpen)}
                >
                    <Text
                        color={'primary'}
                        style={{ ...(props?.btnTextStyle || {}) }}
                    >
                        {isOpen ? getLabel('common.btn_hide') : getLabel('common.btn_show')}
                    </Text>
                </TouchableOpacity> */}
            </Box>

            {/* Body */}
            {
                isOpen ?
                    (
                        <Box>
                            {props?.children}
                        </Box>
                    )
                    : null
            }

        </Box>
    )

}

export default function Configs() {
    const navigation = useNavigation();
    const [value, setValue] = useState(0);
    const [inputHeight, setInputHeight] = useState(0);
    const [buttonHeight, setButtonHeight] = useState(0);
    const [iconMenu, setIconMenu] = useState(0);
    const [iconNavbar, setIconNavbar] = useState(0);
    const [iconItemRecord, setIconItemRecord] = useState(0);


    return (
        <SafeAreaView
            style={{
                ...styles.container
            }}
            edges={['top', 'left', 'right']}
        >
            <Header noBorder>
                <Left>
                    <RippleEffectButton
                        style={{
                            marginLeft: 12
                        }}
                        iconLeft={'long-arrow-left'}
                        color={Colors.black.black1}
                        size={26}
                        onPress={() => {
                            navigation.goBack()
                        }}

                    />
                </Left>
                <Body>
                    <Title
                        style={{
                            fontSize: systemFont(UIFontSize.TITLE) + value
                        }}
                    >
                        {getLabel('common.label_config')}
                    </Title>
                </Body>
                <Right >
                    <IconRight>
                        <TouchableOpacity onPress={() => { }}>
                            <Title allowFontScaling={true}
                                fontWeight={400}
                                fontSize={systemFont(UIFontSize.TITLE) + value}
                                color={Colors.functional.primary}>
                                {getLabel('common.btn_save')}
                            </Title>
                        </TouchableOpacity>
                    </IconRight>
                </Right>
            </Header>

            <Content style={{ ...styles.content }}>

                {/* ======================== Change font size ===================== */}
                <SectionView
                    title={getLabel('common.label_config_font_size')}
                    titleStyle={{
                        fontSize: systemFont(UIFontSize.HEADLINE) + value
                    }}
                    btnTextStyle={{
                        fontSize: systemFont(UIFontSize.DEFAULT) + value
                    }}
                >
                    <Box
                        paddingHorizontal={'l'}
                        paddingVertical='l'
                        paddingBottom='l'
                        justifyContent='center'
                        alignItems={'flex-start'}
                    >
                        <Slider
                            style={{ width: '100%' }}
                            minimumValue={-5}
                            maximumValue={10}
                            step={0.1}
                            value={value}
                            minimumTrackTintColor={Colors.functional.primary}
                            maximumTrackTintColor={Colors.black.black4}
                            thumbTintColor={Colors.functional.primary}
                            onValueChange={(valueChange) => {
                                setValue(valueChange);
                            }}
                        />

                        <Box
                            flex={1}
                            paddingTop={'m'}
                            justifyContent='center'
                            alignItems={'center'}
                        >
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                textAlign='center'
                            >
                                {getLabel('common.label_config_font_size_description')}
                            </Text>

                            <Box
                                paddingTop={'l'}
                            >
                                <Text
                                    fontSize={12}
                                    color='dangerous'
                                >
                                    {getLabel('common.label_config_font_size_ps')}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </SectionView>
                {/* ======================== Change font size ===================== */}

                {/* ======================== Change height input ===================== */}
                <SectionView
                    title={getLabel('common.label_config_form')}
                    titleStyle={{
                        fontSize: systemFont(UIFontSize.HEADLINE) + value
                    }}
                    btnTextStyle={{
                        fontSize: systemFont(UIFontSize.DEFAULT) + value
                    }}
                >

                    <Box
                        flexDirection={'row'}
                        justifyContent='space-between'
                        alignItems={'center'}
                        paddingHorizontal='l'
                    >
                        <Text
                            fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            fontWeight='normal'
                            color={'black1'}
                        >
                            {getLabel('common.label_config_input')}
                        </Text>

                        <Box
                            width={'50%'}
                            flexDirection={'row'}
                            justifyContent='space-between'
                            alignItems={'center'}
                        >
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {34}
                            </Text>
                            <Slider
                                style={{ flex: 1 }}
                                minimumValue={-10}
                                maximumValue={20}
                                step={1}
                                value={inputHeight}
                                minimumTrackTintColor={Colors.functional.primary}
                                maximumTrackTintColor={Colors.black.black4}
                                thumbTintColor={Colors.functional.primary}
                                onValueChange={(valueChange) => {
                                    setInputHeight(valueChange);
                                }}
                            />
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {64}
                            </Text>
                        </Box>
                    </Box>

                    <Box
                        paddingHorizontal={'l'}
                    >
                        <TextInput
                            placeholder={getLabel('common.label_config_input')}
                            editable={false}
                            style={{
                                fontSize: systemFont(UIFontSize.DEFAULT) + value,
                                height: 44 + inputHeight,
                                flex: 1,
                                borderWidth: 1,
                                borderColor: Colors.white.white5,
                                paddingHorizontal: 8,
                                borderRadius: 4
                            }}
                        />
                    </Box>

                    <SpaceM />

                    <Box
                        flexDirection={'row'}
                        justifyContent='space-between'
                        alignItems={'center'}
                        paddingHorizontal='l'
                    >
                        <Text
                            fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            fontWeight='normal'
                            color={'black1'}
                        >
                            {getLabel('common.label_config_button')}
                        </Text>

                        <Box
                            width={'50%'}
                            flexDirection={'row'}
                            justifyContent='space-between'
                            alignItems={'center'}
                        >
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {34}
                            </Text>
                            <Slider
                                style={{ flex: 1 }}
                                minimumValue={-10}
                                maximumValue={20}
                                step={1}
                                value={buttonHeight}
                                minimumTrackTintColor={Colors.functional.primary}
                                maximumTrackTintColor={Colors.black.black4}
                                thumbTintColor={Colors.functional.primary}
                                onValueChange={(valueChange) => {
                                    setButtonHeight(valueChange);
                                }}
                            />
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {64}
                            </Text>
                        </Box>
                    </Box>

                    <Box
                        paddingHorizontal={'l'}
                    >
                        <TouchableOpacity
                            style={{
                                height: 44 + buttonHeight,
                                flex: 1,
                                paddingHorizontal: 8,
                                borderRadius: 4,
                                backgroundColor: Colors.functional.primary,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                color={'white1'}
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            >
                                {getLabel('common.label_config_button')}
                            </Text>
                        </TouchableOpacity>

                    </Box>

                    <SpaceM />
                </SectionView>
                {/* ======================== Change height input ===================== */}

                {/* ======================== Change Icon size ===================== */}
                <SectionView
                    title={getLabel('common.label_config_icon')}
                    titleStyle={{
                        fontSize: systemFont(UIFontSize.HEADLINE) + value
                    }}
                    btnTextStyle={{
                        fontSize: systemFont(UIFontSize.DEFAULT) + value
                    }}
                >

                    <Box
                        flexDirection={'row'}
                        justifyContent='space-between'
                        alignItems={'center'}
                        paddingHorizontal='l'
                    >
                        <Text
                            fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            fontWeight='normal'
                            color={'black1'}
                        >
                            {getLabel('common.label_config_icon_menu')}
                        </Text>

                        <Box
                            width={'50%'}
                            flexDirection={'row'}
                            justifyContent='space-between'
                            alignItems={'center'}
                        >
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {10}
                            </Text>
                            <Slider
                                style={{ flex: 1 }}
                                minimumValue={-10}
                                maximumValue={20}
                                step={1}
                                value={iconMenu}
                                minimumTrackTintColor={Colors.functional.primary}
                                maximumTrackTintColor={Colors.black.black4}
                                thumbTintColor={Colors.functional.primary}
                                onValueChange={(valueChange) => {
                                    setIconMenu(valueChange);
                                }}
                            />
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {30}
                            </Text>
                        </Box>
                    </Box>

                    <Box
                        paddingHorizontal={'l'}
                        backgroundColor='white5'
                        paddingVertical={'m'}
                    >
                        <ListItem
                            title={getLabel('common.title_tickets')}
                            icon={getIconModule('HelpDesk')}
                            iconStyle={{
                                fontSize: 22 + iconMenu
                            }}
                            badgeCount={0}
                            isIconMenu
                            style={{
                                paddingHorizontal: 20
                            }}
                            titleStyle={{
                                fontSize: systemFont(UIFontSize.HEADLINE) + value
                            }}
                            onPress={() => { }}
                        />
                    </Box>

                    <SpaceM />

                    <Box
                        flexDirection={'row'}
                        justifyContent='space-between'
                        alignItems={'center'}
                        paddingHorizontal='l'
                    >
                        <Text
                            fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            fontWeight='normal'
                            color={'black1'}
                        >
                            {getLabel('common.label_config_button')}
                        </Text>

                        <Box
                            width={'50%'}
                            flexDirection={'row'}
                            justifyContent='space-between'
                            alignItems={'center'}
                        >
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {34}
                            </Text>
                            <Slider
                                style={{ flex: 1 }}
                                minimumValue={-10}
                                maximumValue={20}
                                step={1}
                                value={buttonHeight}
                                minimumTrackTintColor={Colors.functional.primary}
                                maximumTrackTintColor={Colors.black.black4}
                                thumbTintColor={Colors.functional.primary}
                                onValueChange={(valueChange) => {
                                    setButtonHeight(valueChange);
                                }}
                            />
                            <Text
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                                fontWeight='normal'
                                color={'black1'}
                            >
                                {64}
                            </Text>
                        </Box>
                    </Box>

                    <Box
                        paddingHorizontal={'l'}
                    >
                        <TouchableOpacity
                            style={{
                                height: 44 + buttonHeight,
                                flex: 1,
                                paddingHorizontal: 8,
                                borderRadius: 4,
                                backgroundColor: Colors.functional.primary,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                color={'white1'}
                                fontSize={systemFont(UIFontSize.DEFAULT) + value}
                            >
                                {getLabel('common.label_config_button')}
                            </Text>
                        </TouchableOpacity>

                    </Box>

                    <SpaceM />
                </SectionView>
                {/* ======================== Change Icon size ===================== */}
            </Content>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white.white1
    },
    content: {
        backgroundColor: Colors.white.white2
    }
})