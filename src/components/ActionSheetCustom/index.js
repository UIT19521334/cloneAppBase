/**
 * @file    : ActionSheetCustom.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : component custom UI ActionSheet
*/

import React, { Component } from 'react';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { hideActionSheet } from '../../redux/actions/actionSheet';
//Component
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { Box } from '../../themes/themes';
import { heightDevice, widthDevice, widthResponse } from '../../utils/commons/commons';
import { ButtonIconHighlight, IconRight, ItemContentView, ItemIconView, ItemViewHighLight, LText, SpaceS, Title } from '../CustomComponentView';
import styles from './styles';
class ActionSheetCustom extends Component {
    render() {
        const { actionSheetState, hideActionSheet } = this.props;

        return (
            <Modal
                visible={actionSheetState.isShow}
                transparent={true}
                animationType='fade'
            >
                <Box style={styles.boxContainer}>
                    <Box
                        width={widthDevice}
                        style={styles.backDrop}

                    />

                    <Box
                        style={styles.boxContent}
                    >
                        <Box
                            style={styles.header}
                        >
                            <Title
                                allowFontScaling={true}
                                style={{
                                    color: Colors.black.black1
                                }}
                            >
                                {actionSheetState.title || ''}
                            </Title>

                            <ButtonIconHighlight
                                underlayColor={Colors.white.white3}
                                activeOpacity={.3}
                                onPress={() => {
                                    hideActionSheet?.();
                                }}
                            >
                                <Icon
                                    name='times'
                                    style={{
                                        fontSize: 22,
                                        fontWeight: '600'
                                    }}
                                />
                            </ButtonIconHighlight>
                        </Box>

                        <Box
                            style={styles.listAction}
                        >
                            <SpaceS />

                            <ScrollView
                                style={{
                                    maxHeight: heightDevice / 2
                                }}
                            >
                                {
                                    actionSheetState.options?.map((action, idx) => {
                                        return (
                                            <ItemViewHighLight
                                                key={idx}
                                                activeOpacity={0.2}
                                                underlayColor={Colors.white.white4}
                                                onPress={() => {
                                                    hideActionSheet?.();
                                                    setTimeout(() => {
                                                        actionSheetState.onSelected?.(idx);
                                                    }, 400);
                                                }}
                                                style={[
                                                    styles.itemView,
                                                    {
                                                        backgroundColor: (idx.toString() === actionSheetState.indexSelected?.toString()) ? (actionSheetState?.backgroundSelectedColor) : Colors.white.white1,
                                                        padding: 10
                                                    }
                                                ]}
                                            >
                                                <>
                                                    <ItemContentView
                                                        style={{
                                                            paddingHorizontal: 12
                                                        }}
                                                    >

                                                        {
                                                            action?.icon ?
                                                                (
                                                                    <ItemIconView>
                                                                        <Icon
                                                                            name={action.icon}
                                                                            style={[
                                                                                {
                                                                                    color: (idx.toString() === actionSheetState.indexSelected?.toString()) ? (actionSheetState?.selectedColor) : Colors.black.black1,
                                                                                    fontSize: 18
                                                                                },
                                                                                action?.iconStyle
                                                                            ]}
                                                                        />
                                                                    </ItemIconView>
                                                                )
                                                                : null
                                                        }
                                                        <Box
                                                            flex={1}
                                                            paddingRight='m'
                                                        >
                                                            <LText
                                                                allowFontScaling={true}
                                                                style={[
                                                                    {
                                                                        color: (idx.toString() === actionSheetState.indexSelected?.toString()) ? (actionSheetState?.selectedColor) : Colors.black.black1
                                                                    },
                                                                    action?.textStyle
                                                                ]}
                                                            >
                                                                {action.label || action.title || action.value || ''}
                                                            </LText>
                                                        </Box>
                                                    </ItemContentView>

                                                    {
                                                        idx === actionSheetState.indexSelected && actionSheetState.iconSelected ?
                                                            (
                                                                <IconRight>
                                                                    <Icon
                                                                        name={actionSheetState.iconSelected}
                                                                        style={[
                                                                            {
                                                                                color: idx === actionSheetState.indexSelected ? (actionSheetState?.selectedColor) : Colors.black.black1,
                                                                                fontWeight: '700',
                                                                                fontSize: 17
                                                                            },
                                                                            actionSheetState?.iconSelectedStyle
                                                                        ]}
                                                                    />
                                                                </IconRight>
                                                            )
                                                            : null
                                                    }
                                                </>
                                            </ItemViewHighLight>
                                        )
                                    })
                                }
                            </ScrollView>

                            <SpaceS />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        )
    }

}

function bindAction(dispatch) {
    return {
        hideActionSheet: () => dispatch(hideActionSheet()),
    };
}

const mapStateToProps = state => ({
    actionSheetState: state.actionSheet,
});

export default connect(mapStateToProps, bindAction)(ActionSheetCustom);