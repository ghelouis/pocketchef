import React from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from "react-native";

export default function TextButton({title, onPress, disabled = false}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={styles.buttonContainer}>
            <View>
                <Text style={disabled ? styles.textDisabled : styles.text}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        paddingTop: 10,
        paddingBottom: 10
    },
    text: {
        color: 'blue',
        textAlign: 'center',
        fontSize: 18
    },
    textDisabled: {
        color: 'grey',
        textAlign: 'center',
        fontSize: 18
    }
})
