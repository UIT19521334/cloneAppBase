import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

const NotificationBadge = () => {
    const notificationState = useSelector(state => state.notification)
    if (notificationState?.unRead) {
        return (
            <View
                style={{
                    backgroundColor: 'red',
                    position: 'absolute',
                    elevation: 3,
                    zIndex: 5,
                    right: 0,
                    top: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 12/2
                }}
            />
        );
    } else {
        return null;
    }
}

export default NotificationBadge;


const styles = StyleSheet.create({})

