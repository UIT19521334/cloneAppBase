import { Input } from 'native-base'
import React from 'react'
import { StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Global from '../../../Global'
import { Colors } from '../../../themes/colors/Colors'
import { Icon } from '../../../themes/Icons/CustomIcon'
import { Box, Text } from '../../../themes/themes'
import { getLabel, widthResponse } from '../../../utils/commons/commons'
import { RelatedModalProps } from '../../../utils/Models/models'
import { BoxButton, Content, Header, Left, NText, Right, SpaceHS, SpaceL, SpaceS, Title } from '../../CustomComponentView'
import ModalSelect from '../../ModalSelect'

const discountOptions = [
    {
        key: 'none',
        label: 'Zero Discount',
    },
    {
        key: 'percent',
        label: '% Price',
    },
    {
        key: 'amount',
        label: 'Direct  Price Reduction'
    },
]

type SaveType = 'SAVE' | 'SAVE AND CREATE';

export default function ({ route, navigation }) {

    const [productsTemp, setProductsTemp] = React.useState<Array<any>>([]);
    const [propsConfig, setPropsConfig] = React.useState(null);

    const [quantity, setQuantity] = React.useState(1);
    const [sellingPrice, setSellingPrice] = React.useState('0');
    const [product, setProduct] = React.useState(null);
    const [total, setTotal] = React.useState(0);
    const [netPrice, setNetPrice] = React.useState(0);
    const [isShowDiscount, setShowDiscount] = React.useState(false);
    const [isShowTax, setShowTax] = React.useState(false);
    const [discountSelected, setDiscountSelected] = React.useState(discountOptions[0]);
    const [discountPercent, setDiscountPercent] = React.useState(0);
    const [discountAmount, setDiscountAmount] = React.useState(0);
    const [totalDiscount, setTotalDiscount] = React.useState(0);


    React.useEffect(() => {
        setPropsConfig(route.params?.data || null);
        setProductsTemp(route.params?.data?.products || [])
    }, [])

    React.useEffect(() => {

        if (route.params && route.params.initRoute) {
            setPropsConfig(route.params.initRoute);
        }

        if (route.params && route.params.productSelected) {
            setProduct(route.params.productSelected);
        }


        return () => {
        }
    }, [route.params])

    React.useEffect(() => {

        if (product) {
            setSellingPrice(product?.unit_price);

            const total = parseInt(product?.unit_price) * quantity;
            setTotal(total);
            let totalDiscountTemp = 0;
            totalDiscountTemp = discountSelected.key === 'percent' ? ((discountPercent / 100) * total) : (discountSelected.key === 'amount' ? discountAmount : 0);
            setTotalDiscount(totalDiscountTemp);

            const netPrice = total - totalDiscountTemp
            setNetPrice(netPrice);
        }

        return () => {
        }
    }, [product, quantity, discountAmount, discountPercent])


    const goBack = (productList: Array<any>) => {

        if (productList.length > 0) {
            
            const params = {
                preProps: propsConfig,
                products: productList
            }
            navigation.navigate(propsConfig.prevScene, params)
        } else {
            navigation.goBack();
        }
    }

    const onSave = (type: SaveType) => {
        let newProduct = {
            product: product,
            quantity: quantity,
            discountAmount: discountAmount,
            discountPercent: discountPercent,
            total: total,
            netPrice: netPrice,
            totalDiscount: totalDiscount,
            sellingPrice: sellingPrice
        };

        const products = [...productsTemp];
        products.push(newProduct)

        setProductsTemp(products);

        if (type === 'SAVE') {
            goBack(products);
        }

    }

    return (
        <>
            <Header
            >
                <Left style={{ paddingLeft: 12 }}>
                    <Icon name='box' style={{ fontSize: 18 }} />
                    <SpaceHS />
                    <Title allowFontScaling={true} >{getLabel('sales_order.title_add_product')}</Title>
                </Left>
                <Right>
                    <TouchableHighlight
                        activeOpacity={.2}
                        underlayColor={Colors.white.white2}
                        style={
                            styles.btnClose
                        }
                        onPress={() => goBack(productsTemp)}
                    >
                        <Icon name='times' style={{ fontSize: 20 }} />
                    </TouchableHighlight>
                </Right>
            </Header>
            <Content enableScroll={true} style={{ backgroundColor: Colors.white.white1 }}>
                {/* Information Product */}
                <Box paddingHorizontal='l' paddingVertical='l'>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{getLabel('sales_order.title_item_info')}</Text>
                </Box>

                {/* Select Product */}
                <SpaceS />
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <NText allowFontScaling={true}  color={Colors.black.black2} style={{ fontSize: 15 }}>{getLabel('sales_order.label_product_name')}</NText>
                    <Box
                        borderBottomWidth={StyleSheet.hairlineWidth}
                        borderBottomColor='black4'
                        flexDirection='row'
                        height={40}
                        alignItems='center'
                    >
                        <Box flex={1} paddingHorizontal='m'>
                            <NText allowFontScaling={true}  style={{ fontSize: 15 }} numberOfLines={1}>{product && product.productname || ''}</NText>
                        </Box>
                        <BoxButton
                            alignItems='center'
                            justifyContent='center'
                            borderRadius={4}
                            border={.7}
                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                            onPress={() => {
                                const params: RelatedModalProps = {
                                    module: 'Products',
                                    selected: null,
                                    prevScene: 'ProductModal'
                                }
                                navigation.navigate('RelatedModal', params);
                            }}
                        >
                            <Icon name='search' style={{ fontSize: 14 }} />
                        </BoxButton>
                    </Box>
                </Box>

                {/* Enter Quantity */}
                <SpaceS />
                <Box paddingVertical='m' paddingHorizontal='l' flexDirection='row'>
                    <Box flex={1} borderBottomWidth={StyleSheet.hairlineWidth} borderBottomColor='black4'>
                        <Text  allowFontScaling={true}  color='black2'>{getLabel('sales_order.label_quantity')}</Text>
                        <Box flexDirection='row' alignItems='center'>
                            <Input
                                value={`${quantity}`}
                                selectTextOnFocus={true}
                                keyboardType='numeric'
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                onChangeText={(value) => { setQuantity(parseInt(value || '0')) }}
                            />

                            <Box height={30} flexDirection='row' >
                                <TouchableHighlight
                                    activeOpacity={.3}
                                    underlayColor={Colors.white.white2}
                                    style={{ borderRadius: 30 / 2 }}
                                    onPress={() => {
                                        setQuantity(quantity + 1);
                                    }}
                                >
                                    <Box
                                        width={30}
                                        height={30}
                                        borderRadius={30 / 2}
                                        justifyContent='center'
                                        alignItems='center'
                                    >
                                        <Icon name='plus' color={Colors.functional.primary} style={{ fontSize: 16 }} />
                                    </Box>
                                </TouchableHighlight>
                                <SpaceHS />
                                <TouchableHighlight
                                    activeOpacity={.3}
                                    underlayColor={Colors.white.white2}
                                    style={{ borderRadius: 30 / 2 }}
                                    onPress={() => {
                                        if (quantity > 0) {
                                            setQuantity(quantity - 1)
                                        }
                                    }}
                                >
                                    <Box
                                        width={30}
                                        height={30}
                                        borderRadius={30 / 2}
                                        justifyContent='center'
                                        alignItems='center'
                                    >
                                        <Icon name='minus' color={Colors.functional.primary} style={{ fontSize: 16 }} />
                                    </Box>
                                </TouchableHighlight>
                            </Box>

                        </Box>
                    </Box>

                    <SpaceHS />

                    <Box flex={1} borderBottomWidth={StyleSheet.hairlineWidth} borderBottomColor='black4'>
                        <Text  allowFontScaling={true}  color='black2'>{getLabel('sales_order.label_selling_price')}</Text>
                        <Box flexDirection='row' alignItems='center'>
                            <Input
                                value={`${Global.formatNumber(parseFloat(sellingPrice).toFixed(2))}`}
                                selectTextOnFocus={true}
                                keyboardType='numeric'
                                disabled={true}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <TouchableHighlight
                                activeOpacity={.3}
                                underlayColor={Colors.white.white2}
                                onPress={() => { }}
                            >
                                <Box
                                    height={30}
                                    width={30}
                                    borderColor='black4'
                                    borderWidth={StyleSheet.hairlineWidth}
                                    borderRadius={4}
                                    justifyContent='center'
                                    alignItems='center'
                                >
                                    <Icon name='book' color={Colors.functional.primary} />
                                </Box>
                            </TouchableHighlight>
                        </Box>

                    </Box>
                </Box>

                {/* Display total before tax */}
                <SpaceS />
                <Box paddingVertical='m' paddingHorizontal='l' flexDirection='row' justifyContent='space-between' alignItems='center' height={40}>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{getLabel('sales_order.label_total')}</Text>
                    <Text  allowFontScaling={true} >{Global.formatNumber(total.toFixed(2))}</Text>
                </Box>

                {/* Discount */}
                <SpaceS />
                <Box paddingVertical='m' paddingHorizontal='l' flexDirection='row' justifyContent='space-between' alignItems='center' height={40}>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{getLabel('sales_order.label_discount')}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setShowDiscount(!isShowDiscount)
                        }}
                        style={{
                            width: 60,
                            height: 40,
                            alignItems: 'flex-end',
                            justifyContent: 'center'
                        }}
                    >
                        <Text  allowFontScaling={true}  color='primary'>{isShowDiscount ? getLabel('sales_order.btn_hide') : getLabel('sales_order.btn_show')}</Text>
                    </TouchableOpacity>
                </Box>
                {
                    isShowDiscount ?
                        (
                            <Box paddingHorizontal='l' flexDirection='row'>
                                <ModalSelect
                                    contentStyle={{ height: 40 }}
                                    flex={2}
                                    value={discountSelected.label}
                                    options={[...discountOptions]}
                                    onSelected={(index) => {
                                        setDiscountSelected(discountOptions[index]);
                                    }}
                                />

                                <SpaceHS />

                                <Box flex={1} maxHeight={40} borderBottomColor='black4' borderBottomWidth={StyleSheet.hairlineWidth} justifyContent='space-between' alignItems='center' flexDirection='row'>
                                    <Input
                                        selectTextOnFocus={true}
                                        style={{ height: 40, textAlign: 'right' }}
                                        value={`${discountSelected.key === 'percent' ? discountPercent : (discountSelected.key === 'amount' ? Global.formatNumber(discountAmount) : '0')}`}
                                        disabled={discountSelected.key === 'none' || !product}
                                        keyboardType={'numeric'}
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                        onChangeText={(value) => {
                                            const valueChange = parseInt(value ? value.replace(/,/g, '') : '0');

                                            switch (discountSelected.key) {
                                                case 'percent':
                                                    if (valueChange >= 0 && valueChange <= 100) {
                                                        setDiscountPercent(valueChange);
                                                    }
                                                    break;
                                                case 'amount':
                                                    if (valueChange >= 0) {
                                                        setDiscountAmount(valueChange);
                                                    }
                                                    break;
                                            }

                                        }}
                                    />
                                    {
                                        discountSelected.key === 'percent' ?
                                            (
                                                <Box height={40} alignItems='center' justifyContent='center'>
                                                    <Text  allowFontScaling={true}  fontSize={16}>%</Text>
                                                </Box>
                                            )
                                            : null
                                    }
                                    {
                                        discountSelected.key === 'amount' ?
                                            (
                                                <Box height={40} alignItems='center' justifyContent='center'>
                                                    <Text  allowFontScaling={true}  fontSize={16}>₫</Text>
                                                </Box>
                                            )
                                            : null
                                    }
                                </Box>
                            </Box>
                        )
                        : null
                }
                {/* Tax */}
                <SpaceS />
                <Box paddingVertical='m' paddingHorizontal='l' flexDirection='row' justifyContent='space-between' alignItems='center' height={40}>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{getLabel('sales_order.label_tax')}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setShowTax(!isShowTax)
                        }}
                        style={{
                            width: 60,
                            height: 40,
                            alignItems: 'flex-end',
                            justifyContent: 'center'
                        }}
                    >
                        <Text  allowFontScaling={true}  color='primary'>{isShowTax ? getLabel('sales_order.btn_hide') : getLabel('sales_order.btn_show')}</Text>
                    </TouchableOpacity>
                </Box>
                {
                    isShowTax ?
                        (
                            <Box paddingHorizontal='l' flexDirection='row'>
                                <Box flex={1} justifyContent='center' alignItems='center'>
                                    <Text  allowFontScaling={true} >VAT:</Text>
                                </Box>
                                <SpaceHS />

                                <Box flex={1} maxHeight={40} borderBottomColor='black4' borderBottomWidth={StyleSheet.hairlineWidth} justifyContent='space-between' alignItems='center' flexDirection='row'>
                                    <Input
                                        selectTextOnFocus={true}
                                        style={{ height: 40, textAlign: 'right' }}
                                        value={'0'}
                                        keyboardType={'numeric'}
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                    />
                                    <Box height={40} alignItems='center' justifyContent='center' width={30}>
                                        <Text  allowFontScaling={true}  fontSize={16}>%</Text>
                                    </Box>

                                </Box>
                                <SpaceHS />

                                <Box flex={1} maxHeight={40} borderBottomColor='black4' borderBottomWidth={StyleSheet.hairlineWidth} justifyContent='space-between' alignItems='center' flexDirection='row'>
                                    <Input
                                        selectTextOnFocus={true}
                                        style={{ height: 40, textAlign: 'right' }}
                                        value={'0'}
                                        keyboardType={'numeric'}
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                    />
                                </Box>
                            </Box>
                        )
                        : null
                }
                {/* Display total after Tax */}
                <SpaceS />
                <Box paddingVertical='m' paddingHorizontal='l' flexDirection='row' justifyContent='space-between' alignItems='center' height={40}>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{getLabel('sales_order.label_net_price')}</Text>
                    <Text  allowFontScaling={true}  fontWeight='600' fontSize={16}>{Global.formatNumber(netPrice.toFixed(2))}</Text>
                </Box>

                <SpaceL />
            </Content>
            <SafeAreaView
                edges={['right', 'left', 'bottom']}
                style={{ backgroundColor: Colors.white.white1 }}
            >
                <View style={{
                    flexDirection: 'row',
                    height: 50,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: Colors.black.black5
                }}>


                    <TouchableHighlight
                        style={{
                            flex: 1,
                            width: widthResponse * 0.25,
                            alignItems: 'center',
                            justifyContent: 'center'

                        }}
                        activeOpacity={0.3}
                        underlayColor={Colors.white.white2}
                        onPress={() => goBack(productsTemp)}
                    >
                        <Text  allowFontScaling={true}  fontWeight='500' color='dangerous'>{getLabel('common.btn_cancel')}</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{
                            flex: 1,
                            width: widthResponse * 0.5,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        activeOpacity={0.3}
                        underlayColor={Colors.white.white2}
                        onPress={() => {onSave('SAVE AND CREATE')}}
                    >
                        <Text  allowFontScaling={true}  fontWeight='500' color='primary'>{getLabel('common.btn_save_and_create')}</Text>
                    </TouchableHighlight>

                    <TouchableHighlight
                        style={{
                            flex: 1,
                            width: widthResponse * 0.25,
                            alignItems: 'center',
                            justifyContent: 'center'

                        }}
                        activeOpacity={0.3}
                        underlayColor={Colors.white.white2}
                        onPress={() => {onSave('SAVE')}}
                    >
                        <Text  allowFontScaling={true}  fontWeight='500' color='primary'>{getLabel('common.btn_save')}</Text>
                    </TouchableHighlight>
                </View>
            </SafeAreaView>

        </>
    )
}

const styles = StyleSheet.create({
    btnClose: {
        width: 36,
        height: 36,
        borderRadius: 36 / 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',

    }
})
