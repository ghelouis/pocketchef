import React from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from "react-native";
import i18n from "i18n-js";

export default function TextButtonDuo({title, onActionPress, onCancelPress, actionDisabled = false}) {
    return (
        <View style={styles.buttonsContainer}>
            <TouchableOpacity
                onPress={onCancelPress}
                style={styles.button}>
                <View>
                    <Text style={styles.textCancel}>{i18n.t('cancel')}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.separator}/>
            <TouchableOpacity
                onPress={onActionPress}
                disabled={actionDisabled}
                style={styles.button}>
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
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    button: {
        flex: 1,
        paddingTop: 15,
        paddingBottom: 15
    },
    separator: {
        borderWidth: 0.5,
        borderLeftColor: 'gainsboro',
        height: '40%'
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
