import { Content } from 'native-base'
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View, ActivityIndicator } from 'react-native'
import { Body, Header, IconRight, Left, NBText, NText, Right } from '../../components/CustomComponentView'
import { Colors } from '../../themes/colors/Colors'
import { Icon } from '../../themes/Icons/CustomIcon'
import { getIcon } from '../../utils/commons/commons'
import WebView from 'react-native-webview';

export default function RMWebView({ route, navigation }) {
    const webViewRef = React.useRef<WebView>(null);
    const [loading, setLoading] = React.useState(false);
    return (
        <>
            <Header>
                <Left>
                    <TouchableHighlight
                        activeOpacity={.3}
                        underlayColor={Colors.black.black5}
                        style={{ marginLeft: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name={getIcon('Back')} style={{ color: Colors.black.black1, fontSize: 18 }} />
                    </TouchableHighlight>
                </Left>
                <Body
                    style={{ flexDirection: 'row' }}
                >
                    <NText style={{ fontWeight: 'bold', textAlign: 'center' }} numberOfLines={2}>{route?.params?.title}</NText>
                    {loading ? <ActivityIndicator size='small' color={Colors.functional.primary} style={{transform: [{scale: 0.7}]}} /> : null}
                </Body>
                <Right style={{ flex: undefined }}>
                    <IconRight
                        onPress={() => { webViewRef.current.reload() }}
                    >
                        <Icon name={'sync-alt'} style={{ fontSize: 18 }} />
                    </IconRight>
                </Right>

            </Header>
            <WebView
                ref={webViewRef}
                style={{ flex: 1 }}
                source={route?.params?.htmlString ? { html: route?.params?.htmlString } : { uri: route?.params?.link || '' }}
                onLoadStart={() => {
                    setLoading(true)
                }}
                onLoadEnd={() => {
                    setLoading(false)
                }}
                renderLoading={() => (
                    <ActivityIndicator size='small' color={Colors.functional.primary} />
                )}
            />
        </>
    )
}

const styles = StyleSheet.create({})
