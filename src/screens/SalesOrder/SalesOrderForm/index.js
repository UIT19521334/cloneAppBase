import { Input } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard, KeyboardAvoidingView, Modal, Platform, Switch,
    StyleSheet, TouchableHighlight, TouchableOpacity, View
} from 'react-native';

import Menu, { MenuItem } from 'react-native-material-menu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
    Body, Content, Header, LargeHeader, LBText, InputItem,
    Left, Right, SpaceHM, SpaceHS, SpaceS, Title, BoxButton, NBText, NText
} from '../../../components/CustomComponentView';
import ModalSelect from '../../../components/ModalSelect';
import MultiplePickList from '../../../components/MultiplePickList'
import RadioButton from '../../../components/RadioButton';
import RippleEffectButton from '../../../components/RippleEffectButton';
import { Currency, TaxMode, TaxRegion, OptionsSelect } from '../../../fakedata';
import Global from '../../../Global';
import { showAlert } from '../../../redux/actions/alert';
import { Colors } from '../../../themes/colors/Colors';
import { Icon } from '../../../themes/Icons/CustomIcon';
import { Box, Text } from '../../../themes/themes';
import { getIcon, getLabel, heightDevice, widthResponse } from '../../../utils/commons/commons';
import { PARAMS_ALERT } from '../../../utils/Models/models';
import styles from './styles';


const SectionItemProduct = ({ sectionData, onDelete, onEdit, onAddProduct, onAddService, onPress, onDeleteItem }) => {
    const menu = useRef(null);
    const showMenu = () => menu.current.show();
    const hideMenu = () => menu.current.hide();
    const [isShow, setShow] = useState(true);
    return (

        <Box backgroundColor='white1'>
            <SpaceS />
            <Box backgroundColor='white1' paddingHorizontal='l' paddingVertical='m' borderBottomColor='black4' borderBottomWidth={StyleSheet.hairlineWidth}>
                <Box flexDirection='row' justifyContent='space-between' alignItems='center' height={35}>
                    <LBText allowFontScaling={true} >{sectionData.sectionName}</LBText>
                    <TouchableOpacity
                        onPress={showMenu}
                        style={{ minHeight: 35, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
                    >
                        <Icon name={getIcon('More')} color={Colors.functional.primary} style={{ fontSize: 18 }} />
                        <Menu ref={menu}>
                            <MenuItem onPress={() => { hideMenu(); setShow(!isShow) }}><Icon name={isShow ? 'eye-slash' : 'eye'} /><SpaceHS />{isShow ? getLabel('sales_order.btn_hide') : getLabel('sales_order.btn_show')}</MenuItem>
                            <MenuItem onPress={() => { hideMenu(); onEdit?.(); }}><Icon name={'pen'} /><SpaceHS />{getLabel('sales_order.btn_edit')}</MenuItem>
                            <MenuItem onPress={() => { hideMenu(); onDelete?.(); }}><Text allowFontScaling={true} color='dangerous'><Icon name={'trash-alt'} /><SpaceHS /> {getLabel('sales_order.btn_delete')}</Text></MenuItem>
                        </Menu>
                    </TouchableOpacity>
                </Box>
                {
                    isShow ?
                        (
                            <>
                                <Box height={45} flexDirection='row' justifyContent='flex-start' alignItems='center'>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onAddProduct?.();
                                        }}
                                        style={{ height: 45, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
                                    >
                                        <Icon name='plus' color={Colors.functional.primary} />
                                        <SpaceHS />
                                        <Text allowFontScaling={true} variant='label' color='primary'>{getLabel('sales_order.btn_add_product')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onAddService?.();
                                        }}
                                        style={{ height: 45, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
                                    >
                                        <Icon name='plus' color={Colors.functional.primary} />
                                        <SpaceHS />
                                        <Text allowFontScaling={true} variant='label' color='primary'>{getLabel('sales_order.btn_add_service')}</Text>
                                    </TouchableOpacity>
                                </Box>
                            </>
                        )
                        : null
                }
            </Box>

            {
                isShow ?
                    (
                        sectionData.data?.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        onPress?.();
                                    }}
                                >
                                    <Box paddingHorizontal='l' paddingVertical='m'>
                                        <Box flexDirection='row' justifyContent='space-between' alignItems='center'>
                                            <Text allowFontScaling={true} >{item.product.productname}</Text>
                                            <RippleEffectButton
                                                iconLeft='trash-alt'
                                                size={16}
                                                color={Colors.functional.dangerous}
                                                onPress={() => { onDeleteItem?.(index); }}
                                            />
                                        </Box>
                                        <Box flexDirection='row' justifyContent='space-between' alignItems='center' paddingVertical='m'>
                                            <Text allowFontScaling={true} color='black2'>Total</Text>
                                            <Text allowFontScaling={true} color='black2'>{item.quantity} x {Global.formatNumber(parseFloat(item.sellingPrice).toFixed(2))} = {Global.formatNumber(parseFloat(item.total).toFixed(2))}</Text>
                                        </Box>
                                        <Box flexDirection='row' justifyContent='space-between' alignItems='center' paddingVertical='m'>
                                            <Text allowFontScaling={true} color='black2'>Discount (-)</Text>
                                            <Text allowFontScaling={true} color='black2'>{Global.formatNumber(parseFloat(item.totalDiscount).toFixed(2))}</Text>
                                        </Box>
                                        <Box flexDirection='row' justifyContent='space-between' alignItems='center' paddingVertical='m'>
                                            <Text allowFontScaling={true} >Net Price</Text>
                                            <Text allowFontScaling={true} fontWeight='700'>{Global.formatNumber(parseFloat(item.netPrice).toFixed(2))}</Text>
                                        </Box>
                                    </Box>
                                </TouchableOpacity>
                            )
                        })
                    )
                    : null
            }
        </Box>
    )
}

const LineItemView = ({ children, border = false }) => {
    return (
        <Box
            width={widthResponse}
            backgroundColor='white1'
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            height={40}
            paddingHorizontal='l'
            borderBottomWidth={border ? StyleSheet.hairlineWidth : 0}
            borderBottomColor='black4'
        >
            {children}
        </Box>
    )
}

const ModalCustomize = ({ children, isShow = false, title = '', titleCancel = getLabel('common.btn_cancel'), titleConfirm = getLabel('common.btn_save'), onConfirm = undefined, onCancel = undefined }) => {

    return (
        <Modal
            visible={isShow}
            transparent={true}
            animationType='fade'
        >
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : null}
                style={{
                    flex: 1,
                    backgroundColor: 'transparent'
                }}
            >
                <Box
                    style={{ backgroundColor: 'transparent' }}
                    flex={1}
                    alignItems='center'
                    justifyContent='center'
                >
                    {/* Back drop */}
                    <Box
                        width={widthResponse}
                        height={heightDevice}
                        backgroundColor='black1'
                        opacity={.5}
                        position='absolute'
                        onTouchEnd={() => { Keyboard.dismiss() }}
                    />

                    {/* Content */}
                    <Box
                        width={widthResponse * 0.8}
                        backgroundColor='white1'
                        borderRadius={8}
                        marginBottom='xl'
                        style={[styles.shadow]}
                    >

                        {/* Header */}
                        <Box
                            height={40}
                            justifyContent='center'
                            paddingHorizontal='l'
                        >
                            <Text allowFontScaling={true} fontWeight='700' fontSize={16}>{title}</Text>
                        </Box>
                        {/* Body */}
                        <Box
                            minHeight={10}
                            backgroundColor='white1'
                            borderWidth={StyleSheet.hairlineWidth}
                            borderColor='black4'
                        >

                            {children}
                        </Box>
                        {/* Footer */}
                        <Box
                            height={50}
                            flexDirection='row'
                        >
                            {/* Button Cancel */}
                            <TouchableHighlight
                                style={{
                                    flex: 1,
                                    borderBottomLeftRadius: 8
                                }}
                                activeOpacity={0.3}
                                underlayColor={Colors.white.white2}
                                onPress={() => {
                                    onCancel?.();
                                }}
                            >
                                <Box
                                    flex={1}
                                    alignItems='center'
                                    justifyContent='center'
                                    borderRightWidth={StyleSheet.hairlineWidth}
                                    borderRightColor='black4'
                                >
                                    <Text allowFontScaling={true} fontWeight='600'>{titleCancel}</Text>
                                </Box>
                            </TouchableHighlight>

                            {/* Button Save */}
                            <TouchableHighlight
                                style={{
                                    flex: 1,
                                    borderBottomRightRadius: 8
                                }}
                                activeOpacity={0.3}
                                underlayColor={Colors.white.white2}
                                onPress={() => {
                                    onCancel?.();
                                    onConfirm?.();
                                }}
                            >
                                <Box
                                    flex={1}
                                    alignItems='center'
                                    justifyContent='center'
                                    borderLeftWidth={StyleSheet.hairlineWidth}
                                    borderLeftColor='black4'
                                >
                                    <Text allowFontScaling={true} color='primary' fontWeight='600'>{titleConfirm}</Text>
                                </Box>
                            </TouchableHighlight>
                        </Box>

                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const SectionCollapseView = ({ initState, title, children }) => {
    const [isShow, setShow] = useState(initState);
    return (
        <Box
            backgroundColor='white1'
            justifyContent='space-between'
            alignItems='center'
            borderWidth={0.4}
            borderColor='white4'
        >
            <BoxButton
                row
                justifyContent='space-between'
                height={42}
                width={widthResponse}
                alignItems='center'
                paddingHorizontal={12}
                border={.4}
                onPress={() => { setShow(!isShow) }}
            >
                <NBText allowFontScaling={true} >{title}</NBText>
                <NText allowFontScaling={true} color={Colors.functional.primary}>{isShow ? getLabel('sales_order.btn_hide') : getLabel('sales_order.btn_show')}</NText>
            </BoxButton>
            {
                isShow ?
                    (
                        <>
                            { children}
                        </>
                    )
                    : null
            }

        </Box>
    );
}

export default SalesOrderForm = ({ route, navigation }) => {
    const [steps] = useState(['Item Details', 'Grand Total', 'SO Details']);
    const [currentStep, setCurrentStep] = useState(0);
    const [dataItems, setDataItems] = useState([
        {
            sectionName: 'Section 1',
            data: []
        }
    ]);
    const [total, setTotal] = useState(0);
    const [adjustmentType, setAdjustmentType] = useState('ADD')
    const [overallDiscount, setOverallDiscount] = useState(0)
    const [overallDiscountType, setOverallDiscountType] = useState('ZERO')

    const [isShowModalCustomize, setShowModalCustomize] = useState(false);
    const [isShowModalAdjustment, setShowModalAdjustment] = useState(false);
    const [isShowModalTax, setShowModalTax] = useState(false);
    const [isShowModalTaxOnCharges, setShowModalTaxOnCharges] = useState(false);
    const [isShowModalCharges, setShowModalCharges] = useState(false);
    const [isShowModalOverallDiscount, setShowModOverallDiscount] = useState(false);
    const [ownerSelectedList, setOwnerSelectedList] = useState([
        {
            id: 'Users:1234',
            name: 'Doan Quang Hai',
            mail: 'hai.doan@onlinecrm.vn',
            type: 'user'
        }
    ]);
    const [ownerOrder, setOwnerOrder] = useState([0]);

    const dispatch = useDispatch();

    useEffect(() => {
        if (route.params && route.params?.products && route.params?.preProps) {
            const pos: number = route.params.preProps?.sectionIndex;

            let lineItems = [...dataItems];
            lineItems[pos].data = route.params.products;

            setDataItems(lineItems)
        }

        return () => {
        }
    }, [route.params])

    useEffect(() => {
        let totalPrice = 0;

        dataItems.forEach((item) => {
            item.data.forEach((product) => {
                totalPrice = totalPrice + parseFloat(product.netPrice);
            })
        })

        setTotal(totalPrice);

        return () => { }
    }, [dataItems])

    const renderStepAddItems = () => {

        return (
            <>
                <Box
                    height={80}
                    backgroundColor='white1'
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Box
                        flexDirection='row'
                        justifyContent='space-between'
                        alignItems='center'
                        height={25}
                    >
                        <LBText allowFontScaling={true} >Item Details</LBText>
                        <TouchableOpacity
                            style={{
                                height: 25,
                                paddingHorizontal: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                            onPress={() => {
                                setShowModalCustomize(true);
                            }}
                        >
                            <Text allowFontScaling={true} variant='label' color='primary'>{getLabel('sales_order.btn_customize')}</Text>
                        </TouchableOpacity>
                    </Box>
                    <Box
                        height={45}
                        flexDirection='row'
                        justifyContent='flex-start'
                        alignItems='center'
                    >
                        <TouchableOpacity
                            onPress={() => {
                                let dataTemp = [...dataItems];
                                if (dataTemp.length === 0 || (dataTemp[dataTemp.length - 1].data != null && dataTemp[dataTemp.length - 1].data.length > 0)) {
                                    const section = {
                                        sectionName: `Section ${dataItems.length + 1}`,
                                        data: []
                                    }
                                    dataTemp.push(section);
                                    setDataItems(dataTemp)
                                }
                            }}
                            style={{ height: 45, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
                        >
                            <Icon
                                name='plus'
                                color={Colors.functional.primary}
                            />
                            <SpaceHS />
                            <Text allowFontScaling={true} variant='label' color='primary'>{getLabel('sales_order.btn_add_section')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                height: 45,
                                paddingHorizontal: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                        >
                            <Icon
                                name='plus'
                                color={Colors.functional.primary}
                            />
                            <SpaceHS />
                            <Text allowFontScaling={true} variant='label' color='primary'>{getLabel('sales_order.btn_add_combo_product')}</Text>
                        </TouchableOpacity>
                    </Box>
                </Box>

                <Content>

                    {
                        dataItems?.length > 0 && dataItems.map((data, indexData) => {
                            return (
                                <>
                                    <SpaceS />
                                    <SectionItemProduct
                                        key={indexData}
                                        sectionData={data}
                                        onEdit={() => { }}
                                        onDelete={() => {
                                            const lineItems = [...dataItems];
                                            lineItems.splice(indexData, 1);
                                            setDataItems(lineItems);
                                        }}
                                        onAddProduct={() => {

                                            const params = {
                                                data: {
                                                    sectionIndex: indexData,
                                                    preScreen: 'SalesOrderForm',
                                                    products: data.data
                                                }
                                            }
                                            navigation.setParams(null);
                                            navigation.navigate('ProductModal', params);

                                        }}
                                        onAddService={() => { }}
                                        onDeleteItem={(indexItem) => {
                                            const paramsAlert: PARAMS_ALERT = {
                                                title: '',
                                                message: getLabel('sales_order.label_msg_remove_item'),
                                                actions: [
                                                    {
                                                        label: getLabel('common.btn_cancel'),
                                                        isCancel: true,
                                                        textStyle: {
                                                            color: Colors.black.black1
                                                        }
                                                    },
                                                    {
                                                        label: getLabel('common.btn_remove'),
                                                        isHighLight: true,
                                                        onPress: () => {
                                                            const dataTemp = [...dataItems]
                                                            dataTemp[indexData].data.splice(indexItem, 1);
                                                            if (dataTemp[indexData].data.length === 0 && dataTemp.length > 1) {
                                                                dataTemp.splice(indexData, 1);
                                                            }
                                                            setDataItems(dataTemp);
                                                        }
                                                    }
                                                ]
                                            }
                                            dispatch(showAlert(paramsAlert));
                                        }}
                                    />
                                </>
                            )
                        })
                    }
                </Content>
                <Box
                    width={widthResponse}
                    backgroundColor='white1'
                    flexDirection='row'
                    justifyContent='space-between'
                    alignItems='center'
                    height={40}
                    paddingHorizontal='l'
                    borderBottomWidth={StyleSheet.hairlineWidth}
                    borderBottomColor='black4'
                >
                    <Text allowFontScaling={true} >{getLabel('sales_order.label_sub_total')}</Text>
                    <Text allowFontScaling={true} fontWeight='700' color='dangerous' fontSize={16}>{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                </Box>
            </>
        );
    }

    const renderStepShowGrandTotal = () => {
        return (
            <>
                <Content>
                    {/* Detail Price */}
                    <Box
                        width={widthResponse}
                        backgroundColor='white1'
                        justifyContent='space-between'
                        alignItems='center'
                        paddingVertical='m'
                    >

                        {/* Sub Total */}
                        <LineItemView>
                            <Text allowFontScaling={true} >{getLabel('sales_order.label_sub_total')}</Text>
                            <Text allowFontScaling={true} fontWeight='700' color='black1' fontSize={16}>{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Overall discount */}
                        <LineItemView>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModOverallDiscount(true)
                                }}
                                style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text allowFontScaling={true} color='primary'>{getLabel('sales_order.label_overall_discount', { percent: '' })}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={true} color='black2' >{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Charges */}
                        <LineItemView>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModalCharges(true)
                                }}
                                style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text allowFontScaling={true} color='primary'>{getLabel('sales_order.label_charges')}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={true} color='black2' >{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Pre Tax Total */}
                        <LineItemView>
                            <Text allowFontScaling={true} >{getLabel('sales_order.label_pre_tax_total')}</Text>
                            <Text allowFontScaling={true} fontWeight='700' color='black1' fontSize={16}>{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Tax */}
                        <LineItemView>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModalTax(true)
                                }}
                                style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text allowFontScaling={true} color='primary'>{getLabel('sales_order.label_tax')}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={true} color='black2' >{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Tax on Charges */}
                        <LineItemView>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModalTaxOnCharges(true)
                                }}
                                style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text allowFontScaling={true} color='primary'>{getLabel('sales_order.label_tax_on_charges')}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={true} color='black2' >{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>

                        {/* Adjustment */}
                        <LineItemView>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowModalAdjustment(true)
                                }}
                                style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Text allowFontScaling={true} color='primary'>{getLabel('sales_order.label_adjustment', { type: '(-)' })}</Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={true} color='black2' >{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                        </LineItemView>
                    </Box>

                    {/* Grand total */}
                    <SpaceS />
                    <LineItemView>
                        <Text allowFontScaling={true} >{getLabel('sales_order.label_grand_total')}</Text>
                        <Text allowFontScaling={true} fontWeight='700' color='dangerous' fontSize={16}>{Global.formatNumber(parseFloat(total).toFixed(2))}</Text>
                    </LineItemView>

                </Content>
            </>
        )
    }

    const renderStepSODetail = () => {
        return (
            <>
                <Content>
                    <SectionCollapseView
                        initState={false}
                        title={getLabel('sales_order.title_order_info')}
                    >
                        <Box
                            width={widthResponse}
                        >
                            {/* Cơ hội */}
                            <>
                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>Cơ hội</NText>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>Aute deserunt incididunt ut veniam laborum aliquip dolore veniam magna magna.</NText>
                                        </Box>
                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                // navigation.navigate('RelatedModal');
                                            }}
                                        >
                                            <Icon name='search' style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>

                                </Box>
                            </>
                            {/* Công ty */}
                            <>
                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>Công ty</NText>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>Aute deserunt incididunt ut veniam laborum aliquip dolore veniam magna magna.</NText>
                                        </Box>
                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                // navigation.navigate('RelatedModal');
                                            }}
                                        >
                                            <Icon name='search' style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>

                                </Box>
                            </>

                            {/* Người liên hệ */}
                            <>
                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>Người liên hệ</NText>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>Aute deserunt incididunt ut veniam laborum aliquip dolore veniam magna magna.</NText>
                                        </Box>
                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                // navigation.navigate('RelatedModal');
                                            }}
                                        >
                                            <Icon name='search' style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>

                                </Box>
                            </>
                            {/* Báo giá */}
                            <>
                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>Báo giá </NText>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>Aute deserunt incididunt ut veniam laborum aliquip dolore veniam magna magna.</NText>
                                        </Box>
                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                // navigation.navigate('RelatedModal');
                                            }}
                                        >
                                            <Icon name='search' style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>

                                </Box>
                            </>

                            {/* Nguồn */}
                            <>
                                <SpaceS />
                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                    <ModalSelect
                                        title='Nguồn'
                                        value='None'
                                        options={OptionsSelect}
                                    />
                                </Box>
                            </>

                            {/* Đơn vị vận chuyển */}
                            <>
                                <SpaceS />
                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                    <ModalSelect
                                        title='Đơn vị vận chuyển'
                                        value='None'
                                        options={OptionsSelect}
                                    />
                                </Box>
                            </>

                            {/* Đang chờ */}
                            <InputItem
                                isEdit={true}
                                title={'Đang chờ'}
                                inputStyle={{ fontSize: 14 }}
                            />

                            {/* Tình trạng */}
                            <>
                                <SpaceS />
                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                    <ModalSelect
                                        title='Tình trạng'
                                        value='None'
                                        options={OptionsSelect}
                                    />
                                </Box>
                            </>

                            {/* Hoa hồng sales */}
                            <InputItem
                                isEdit={true}
                                title={'Hoa hồng sales'}
                                inputStyle={{ fontSize: 14 }}
                            />

                            {/* Thuế tiêu thụ đặc biệt */}
                            <InputItem
                                isEdit={true}
                                title={'Thuế tiêu thụ đặc biệt'}
                                inputStyle={{ fontSize: 14 }}
                            />

                            {/* Giao cho */}
                            <SpaceS />
                            <MultiplePickList
                                title='Giao cho'
                                required={1}
                                order={[...ownerOrder]}
                                updateOrder={(orders) => { this.setState({ ownerOrder: orders }) }}
                                selectedList={[...ownerSelectedList]}
                                updateSelectedList={(list) => { this.setState({ ownerSelectedList: list }) }}
                            />

                            {/* Loại khách hàng */}
                            <>
                                <SpaceS />
                                <Box paddingHorizontal='l' flexDirection='row' paddingVertical='m'>
                                    <ModalSelect
                                        title='Loại khách hàng'
                                        value='None'
                                        options={OptionsSelect}
                                    />
                                </Box>
                            </>

                            {/* Chiến dịch */}
                            <>
                                <SpaceS />
                                <Box
                                    paddingHorizontal='l'
                                    paddingVertical='m'
                                >
                                    <NText allowFontScaling={true} color={Colors.black.black2} style={{ fontSize: 15 }}>Chiến dịch</NText>
                                    <Box
                                        borderBottomWidth={StyleSheet.hairlineWidth}
                                        borderBottomColor='black4'
                                        flexDirection='row'
                                        height={40}
                                        alignItems='center'
                                    >
                                        <Box flex={1} paddingHorizontal='m'>
                                            <NText allowFontScaling={true} style={{ fontSize: 15 }} numberOfLines={1}>Aute deserunt incididunt ut veniam laborum aliquip dolore veniam magna magna.</NText>
                                        </Box>
                                        <BoxButton
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={4}
                                            border={.7}
                                            style={{ width: 30, height: 30, backgroundColor: Colors.white.white1 }}
                                            onPress={() => {
                                                // navigation.navigate('RelatedModal');
                                            }}
                                        >
                                            <Icon name='search' style={{ fontSize: 14 }} />
                                        </BoxButton>
                                    </Box>

                                </Box>
                            </>

                        </Box>
                    </SectionCollapseView>
                    <SpaceS />

                    <SectionCollapseView
                        initState={false}
                        title={getLabel('sales_order.title_receiver_info')}
                    >
                        <Box
                            width={widthResponse}
                            paddingBottom='m'
                        >
                            {/* Tên người nhận */}
                            <InputItem
                                isEdit={true}
                                title={'Tên người nhận'}
                                inputStyle={{ fontSize: 14 }}
                            />

                            {/* Số điện thoại người nhận */}
                            <InputItem
                                isEdit={true}
                                title={'Số điện thoại người nhận'}
                                inputStyle={{ fontSize: 14 }}
                                keyboardType={'numeric'}
                            />
                        </Box>

                    </SectionCollapseView>

                    <SpaceS />
                    <SectionCollapseView
                        initState={true}
                        title={getLabel('sales_order.title_recurring_invoice_info')}
                    >
                        <Box
                            width={widthResponse}
                            paddingBottom='m'
                        >
                            {/* Tự động tạo theo định kỳ */}
                            <Box paddingHorizontal='l' paddingVertical='l'>

                                <Box
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <NText allowFontScaling={true} >Tự động tạo theo định kỳ</NText>
                                    <Switch
                                        trackColor={{ false: "#767577", true: Colors.functional.primary }}
                                        thumbColor={Colors.white.white1}
                                        ios_backgroundColor="#767577"
                                        style={Platform.OS == 'ios' ? { transform: [{ scaleX: 0.75 }, { scaleY: .7 }] } : {}}
                                        value={true}
                                    />
                                </Box>

                            </Box>


                        </Box>

                    </SectionCollapseView>

                    <SpaceS />
                    <SectionCollapseView
                        initState={true}
                        title={getLabel('sales_order.title_address_info')}
                    >
                        <Box
                            width={widthResponse}
                        >

                        </Box>

                    </SectionCollapseView>
                    <SpaceS />

                    <SectionCollapseView
                        initState={true}
                        title={getLabel('sales_order.title_terms_and_conditions')}
                    >
                        <Box
                            width={widthResponse}
                        >

                        </Box>

                    </SectionCollapseView>
                    <SpaceS />

                    <SectionCollapseView
                        initState={true}
                        title={getLabel('sales_order.title_description_info')}
                    >
                        <Box
                            width={widthResponse}
                        >

                        </Box>

                    </SectionCollapseView>
                    <SpaceS />


                </Content>
            </>
        )
    }

    const renderModalTaxOnCharges = () => {
        return (
            <ModalCustomize
                isShow={isShowModalTaxOnCharges}
                title={getLabel('sales_order.title_tax_on_charges')}
                onCancel={() => { setShowModalTaxOnCharges(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Box
                        flexDirection='row'
                    >
                        <Text allowFontScaling={true} >Shipping & Handling</Text>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >VAT:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >Sales:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >Service:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>
                </Box>
            </ModalCustomize>
        )
    }

    const renderModalCharges = () => {
        return (
            <ModalCustomize
                isShow={isShowModalCharges}
                title={getLabel('sales_order.title_charges')}
                onCancel={() => { setShowModalCharges(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Box
                        flexDirection='row'
                    >
                        <Text allowFontScaling={true} >Shipping & Handling</Text>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                        </Box>
                    </Box>
                </Box>
            </ModalCustomize>
        )
    }

    const renderModalTax = () => {
        return (
            <ModalCustomize
                isShow={isShowModalTax}
                title={getLabel('sales_order.title_tax')}
                onCancel={() => { setShowModalTax(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >VAT:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >Sales:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>

                    <Box
                        flexDirection='row'
                        minHeight={45}
                    >
                        <Box
                            flex={1}
                            justifyContent='center'
                        >
                            <Text allowFontScaling={true} >Service:</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={1}
                            maxWidth={60}
                            flexDirection='row'
                            alignItems='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Input
                                value={'0'}
                                keyboardType='numeric'
                                style={{ textAlign: 'right' }}
                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                            />
                            <Text allowFontScaling={true} >%</Text>
                        </Box>

                        <SpaceHS />
                        <Box
                            flex={2}
                            justifyContent='center'
                            borderBottomColor='black4'
                            borderBottomWidth={StyleSheet.hairlineWidth}
                        >
                            <Text allowFontScaling={true} textAlign='right'>{Global.formatNumber(parseFloat(0).toFixed(2))}</Text>
                        </Box>
                    </Box>
                </Box>
            </ModalCustomize>
        )
    }

    const renderModalAdjustment = () => {
        return (
            <ModalCustomize
                isShow={isShowModalAdjustment}
                title={getLabel('sales_order.title_adjustment')}
                onCancel={() => { setShowModalAdjustment(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Box
                        flexDirection='row'
                    >
                        <RadioButton
                            label='Add'
                            selected={adjustmentType === 'ADD'}
                            onSelect={() => { setAdjustmentType('ADD') }}
                        />
                        <SpaceHM />
                        <RadioButton
                            label='Deduct'
                            selected={adjustmentType === 'DEDUCT'}
                            onSelect={() => { setAdjustmentType('DEDUCT') }}
                        />
                    </Box>

                    <SpaceS />
                    <Box
                        paddingVertical='m'
                        style={{ minHeight: 45 }}
                        borderBottomColor='black4'
                        borderBottomWidth={StyleSheet.hairlineWidth}

                    >
                        <Input
                            placeholder='Enter amount'
                            keyboardType='numeric'
                            allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                        />
                    </Box>
                </Box>
            </ModalCustomize>
        )
    }

    const renderModalOverallDiscount = () => {
        return (
            <ModalCustomize
                isShow={isShowModalOverallDiscount}
                title={getLabel('sales_order.title_overall_discount', { total: Global.formatNumber(parseFloat(total).toFixed(2)) })}
                onCancel={() => { setShowModOverallDiscount(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <Box
                    >
                        <RadioButton
                            label='Zero Discount'
                            selected={overallDiscountType === 'ZERO'}
                            onSelect={() => { setOverallDiscountType('ZERO'); setOverallDiscount(0); }}
                        />
                        <SpaceS />
                        <RadioButton
                            label='% Price'
                            selected={overallDiscountType === 'PERCENT'}
                            onSelect={() => { setOverallDiscountType('PERCENT'); setOverallDiscount(0); }}
                        />
                        <SpaceS />
                        <RadioButton
                            label='Direct Price Reduction'
                            selected={overallDiscountType === 'AMOUNT'}
                            onSelect={() => { setOverallDiscountType('AMOUNT'); setOverallDiscount(0); }}
                        />
                    </Box>

                    <SpaceS />
                    {
                        overallDiscountType === 'AMOUNT' ?
                            (
                                <Box
                                    paddingVertical='m'
                                    style={{ minHeight: 45 }}
                                    borderBottomColor='black4'
                                    borderBottomWidth={StyleSheet.hairlineWidth}
                                >
                                    <Input
                                        placeholder='Enter amount'
                                        value={`${Global.formatNumber(overallDiscount)}`}
                                        selectTextOnFocus={true}
                                        keyboardType='numeric'
                                        onChangeText={(value) => {
                                            const valueChange = parseInt(value ? value.replace(/,/g, '') : '0');

                                            setOverallDiscount(valueChange)
                                        }}
                                        allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                    />
                                </Box>
                            )
                            :
                            (
                                overallDiscountType === 'PERCENT' ?
                                    (
                                        <Box
                                            paddingVertical='m'
                                            style={{ minHeight: 45 }}
                                            borderBottomColor='black4'
                                            borderBottomWidth={StyleSheet.hairlineWidth}
                                        >
                                            <Input
                                                placeholder='Enter amount'
                                                value={`${(overallDiscount)}`}
                                                selectTextOnFocus={true}
                                                keyboardType='numeric'
                                                onChangeText={(value) => {
                                                    const valueChange = parseInt(value ? value.replace(/,/g, '') : '0');
                                                    if (valueChange >= 0 && valueChange <= 100) {
                                                        setOverallDiscount(valueChange)

                                                    }
                                                }}
                                                allowFontScaling={true} // Disabled scale font size of text when change font size on device setting
                                            />
                                        </Box>
                                    )
                                    : null
                            )
                    }

                </Box>
            </ModalCustomize>
        )
    }

    const renderModalCustomize = () => {
        return (
            <ModalCustomize
                isShow={isShowModalCustomize}
                title={getLabel('sales_order.title_customize')}
                onCancel={() => { setShowModalCustomize(false) }}
            >
                <Box
                    paddingHorizontal='l'
                    paddingVertical='m'
                >
                    <ModalSelect
                        title={getLabel('sales_order.customize.label_tax_region')}
                        options={[...TaxRegion]}
                        initPositionSelect={0}
                        value={TaxRegion[0].label}
                    />
                    <SpaceS />
                    <ModalSelect
                        title={getLabel('sales_order.customize.label_currency')}
                        options={[...Currency]}
                        initPositionSelect={0}
                        value={Currency[0].label}
                    />
                    <SpaceS />
                    <ModalSelect
                        title={getLabel('sales_order.customize.label_tax_mode')}
                        options={[...TaxMode]}
                        initPositionSelect={0}
                        value={TaxMode[0].label}
                    />
                    <SpaceS />
                </Box>
            </ModalCustomize>
        )
    }

    return (
        <
            >
            <LargeHeader
               
            >
                <Header
                   
                    noBorder
                >
                    <Left>
                        <TouchableOpacity
                            onPress={() => {
                                const paramsAlert: PARAMS_ALERT = {
                                    title: getLabel('sales_order.title_confirm_leave_page'),
                                    message: getLabel('sales_order.label_msg_leave_page'),
                                    actions: [
                                        {
                                            label: getLabel('common.btn_stay'),
                                            isCancel: true,
                                            textStyle: {
                                                color: Colors.black.black1
                                            }
                                        },
                                        {
                                            label: getLabel('common.btn_leave'),
                                            isHighLight: true,
                                            onPress: () => {
                                                navigation.goBack();
                                            }
                                        }
                                    ]
                                }
                                dispatch(showAlert(paramsAlert));
                            }}
                            style={{
                                marginLeft: 12,
                                paddingVertical: 8,
                                paddingHorizontal: 16
                            }}>
                            <Text allowFontScaling={true} color='primary' variant='label2B'>{getLabel('common.btn_cancel')}</Text>
                        </TouchableOpacity>
                    </Left>
                    <Body>
                        <Title allowFontScaling={true} >Create SO</Title>
                    </Body>
                    <Right></Right>
                </Header>
                <Header
                   
                    noBorder
                >
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ width: widthResponse - 40, height: 70 }}>
                            <View style={{ alignItems: 'center' }}>
                                <View style={{ height: 2, backgroundColor: Colors.black.black4, width: widthResponse - 140, position: 'absolute', top: 13, zIndex: 10 }} />
                            </View>
                            <View style={{ flexDirection: 'row', width: '100%', position: 'absolute', zIndex: 20 }}>
                                {steps.map((label, i) =>
                                    <View key={i} style={{ alignItems: 'center', width: '33%' }}>
                                        {i > currentStep && i != currentStep && /* Not selected */
                                            <View style={{ alignItems: 'center', justifyContent: 'center', width: 30, height: 30, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.black.black4, borderRadius: 15, marginBottom: 10 }}>
                                                <Text allowFontScaling={true} style={{ fontSize: 15, color: Colors.black.black4 }}>{i + 1}</Text>
                                            </View>
                                        }
                                        {i <= currentStep && /* Selected */
                                            <View style={{ alignItems: 'center', justifyContent: 'center', width: 30, height: 30, backgroundColor: Colors.functional.primary, borderWidth: 2, borderColor: Colors.functional.primary, borderRadius: 15, marginBottom: 10 }}>
                                                <Text allowFontScaling={true} style={{ fontSize: 14, color: '#ffffff', fontWeight: '600' }}>{i + 1}</Text>
                                            </View>
                                        }
                                        <Text allowFontScaling={true} style={{ fontSize: 14, color: i <= currentStep ? Colors.functional.primary : Colors.black.black4 }}>{label}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Header>
            </LargeHeader>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
                {
                    currentStep === 0 && renderStepAddItems()
                }

                {
                    currentStep === 1 && renderStepShowGrandTotal()
                }

                {
                    currentStep === 2 && renderStepSODetail()
                }

                <Box width={widthResponse} backgroundColor='white1' flexDirection='row' borderTopColor='black4' borderTopWidth={StyleSheet.hairlineWidth}>
                    <ButtonCustomize style={{
                        height: 50, width: widthResponse / 2, justifyContent: 'center', alignItems: 'center'
                    }}
                        label={getLabel('sales_order.btn_back')}
                        disabled={!(currentStep > 0)}
                        textStyle={{}}
                        onPress={() => {
                            if (currentStep > 0) {
                                setCurrentStep(currentStep - 1)
                            }
                        }}
                    />
                    {
                        currentStep === steps.length - 1 ?
                            (
                                <ButtonCustomize style={{
                                    height: 50, width: widthResponse / 2, justifyContent: 'center', alignItems: 'center'
                                }}
                                    label={getLabel('common.btn_save')}
                                    disabled={false}
                                    textStyle={{ color: Colors.functional.primary }}
                                    onPress={() => {
                                    }}
                                />
                            )
                            :
                            (
                                <ButtonCustomize style={{
                                    height: 50, width: widthResponse / 2, justifyContent: 'center', alignItems: 'center'
                                }}
                                    label={getLabel('sales_order.btn_next')}
                                    disabled={!((currentStep + 1) < steps.length) || (dataItems.length === 0) || (!dataItems[0].data) || (dataItems[0].data.length === 0)}
                                    textStyle={{ color: Colors.functional.primary }}
                                    onPress={() => {
                                        if ((currentStep + 1) < steps.length) {
                                            setCurrentStep(currentStep + 1)
                                        }
                                    }}
                                />
                            )
                    }


                </Box>
            </SafeAreaView>
            {renderModalCustomize()}
            {renderModalAdjustment()}
            {renderModalOverallDiscount()}
            {renderModalTax()}
            {renderModalTaxOnCharges()}
            {renderModalCharges()}
        </>
    )
}

const ButtonCustomize = ({ style, label, disabled, textStyle, onPress }) => {
    return (
        <>
            <TouchableHighlight
                activeOpacity={.2}
                underlayColor={Colors.white.white2}
                disabled={disabled}
                onPress={() => {
                    onPress?.();
                }}
                style={style}>
                <Text allowFontScaling={true} variant='label2B' color='black1' opacity={disabled ? 0.5 : 1} style={textStyle}>{label || ''}</Text>
            </TouchableHighlight>
        </>
    )
}

