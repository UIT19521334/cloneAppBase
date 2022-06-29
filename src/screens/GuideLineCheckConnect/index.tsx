import { Container, Header, Body, Title } from 'native-base'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { getLabel } from '../../utils/commons/commons'

export default function GuideLineCheckConnect() {
    return (
        <Container>
            <Header>
                <Body>
                <Title>
                    {getLabel('common.title_guide_line')}
                </Title>
                </Body>
            </Header>
        </Container>
    )
}

const styles = StyleSheet.create({

})
