import React from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from "react-native";
import i18n from "i18n-js";

export default function TextButtonDuo({title, onActionPress, onCancelPress, actionDisabled = false}) {
    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity
                onPress={onCancelPress}
                style={styles.buttonLeft}>
                <View>
                    <Text style={styles.textCancel}>{i18n.t('cancel')}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onActionPress}
                disabled={actionDisabled}
                style={styles.buttonRight}>
                <View>
                    <Text style={actionDisabled ? styles.textDisabled : styles.text}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    buttonLeft: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderRightWidth: 0.5,
        borderLeftColor: 'gainsboro'
    },
    buttonRight: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderLeftWidth: 0.5,
        borderLeftColor: 'gainsboro'
    },
    text: {
        color: 'blue',
        textAlign: 'center',
        fontSize: 18
    },
    textCancel: {
        color: 'red',
        textAlign: 'center',
        fontSize: 18
    },
    textDisabled: {
        color: 'grey',
        textAlign: 'center',
        fontSize: 18
    }
})
