import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from "react-native";
import { FontAwesome } from '@expo/vector-icons';

export default function IconButton({name, onPress, icon, disabled = false}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={styles.button}>
            <View>
                <FontAwesome style={disabled ? styles.iconDisabled : styles.icon} name={icon}/>
                <Text style={disabled ? styles.textDisabled : styles.text}>{name}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        borderRadius: 3,
        flex: 1
    },
    icon: {
        fontSize: 25,
        color: '#454545',
        alignSelf: "center"
    },
    text: {
        fontSize: 12,
        color: '#454545',
        alignSelf: "center"
    },
    iconDisabled: {
        fontSize: 25,
        color: 'grey',
        alignSelf: "center"
    },
    textDisabled: {
        fontSize: 12,
        color: 'grey',
        alignSelf: "center"
    }
})
