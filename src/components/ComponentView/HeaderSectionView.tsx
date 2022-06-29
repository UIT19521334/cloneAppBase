import React from 'react'
import { View, Text } from 'react-native'
import { Box } from '../../themes/themes'
import { Divider, NBText, SpaceS } from '../CustomComponentView'

const HeaderSectionView = ({ title = '' }) => {
    return (
        <Box justifyContent={'center'} paddingHorizontal='l' paddingVertical='m'>
            <NBText allowFontScaling={true} >{title}</NBText>
            <SpaceS />
            <Divider />
        </Box>
    )
}

export default HeaderSectionView;