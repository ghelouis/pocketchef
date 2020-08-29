import React from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from "react-native";
import { FontAwesome } from '@expo/vector-icons';

export default function IconButton({name, onPress, icon}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}>
            <View>
                <FontAwesome style={styles.icon} name={icon}/>
                <Text style={styles.text}>{name}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        borderRadius: 3
    },
    icon: {
        color: '#454545',
        fontSize: 25,
        alignSelf: "center"
    },
    text: {
        fontSize: 12,
        color: '#454545',
        alignSelf: "center"
    }
})
