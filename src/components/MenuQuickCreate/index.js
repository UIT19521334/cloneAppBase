/**
 * @file    : MenuQuickCreate/index.js
 * @author  : Manh Le
 * @date    : 2021-01-26
 * @purpose : Custom UI menu (material style)
*/

import React, { useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Menu, { MenuItem } from 'react-native-material-menu';
import Global from '../../Global';
import { Colors } from '../../themes/colors/Colors';
import { Icon } from '../../themes/Icons/CustomIcon';
import { optionsMenu } from '../../utils/commons/commons';

export default function MenuQuickCreate({ title, icon, onSelected }) {
    const menu = useRef();

    const hideMenu = (item) => {
        menu.current.hide();
        onSelected?.(item);
    }

    const showMenu = () => menu.current.show();

    return (
        <Menu
            style={{
                backgroundColor: 'transparent',
                marginTop: 28
            }}
            ref={menu}
            button={
                icon ?
                    (
                        <TouchableOpacity
                            style={{
                                padding: 6,
                                paddingHorizontal: 0
                            }}
                            onPress={showMenu}
                        >
                            <Icon
                                onPress={showMenu}
                                name={icon || 'plus-circle'}
                                style={{ fontSize: 20 }}
                            />
                        </TouchableOpacity>
                    )
                    :
                    (
                        <Text
                            allowFontScaling={true}
                            onPress={showMenu}
                            style={{
                                fontSize: 20
                            }}
                        >
                            {title || ''}
                        </Text>
                    )
            }
            animationDuration={0}
        >
            {
                optionsMenu().map((itemMenu, index) => {
                    if (itemMenu?.isDivider) {
                        return <MenuItem
                            key={index}
                            style={[
                                {
                                    height: 5
                                },
                                Platform.select({
                                    'android': {
                                        backgroundColor:
                                            Colors.white.white2
                                    }
                                })
                            ]}
                        />
                    }
                    else if (itemMenu.module != 'Call' && itemMenu.module != 'Meeting' && itemMenu.module != 'Task' && !Global.getPermissionModule(itemMenu.module, 'CreateView')) {
                        return null;
                    }
                    else {
                        return (
                            <MenuItem
                                key={itemMenu.key}
                                style={{
                                    backgroundColor: Colors.white.white1,
                                    borderTopLeftRadius: itemMenu.borderTop || 0,
                                    borderTopRightRadius: itemMenu.borderTop || 0,
                                    borderBottomLeftRadius: itemMenu.borderBottom || 0,
                                    borderBottomRightRadius: itemMenu.borderBottom || 0,
                                }}
                                onPress={() => hideMenu(itemMenu)}
                            >
                                <Icon name={itemMenu.icon} style={{ fontSize: 16 }} />   {itemMenu.label}
                            </MenuItem>
                        )
                    }
                })
            }
        </Menu>
    )
}