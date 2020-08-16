import {StyleSheet, Text, View} from "react-native";
import React from "react";

export default function Header({value}) {
    return (
        <View style={styles.main}>
            <View style={styles.leftLine}/>
            <Text style={styles.header}>{value}</Text>
            <View style={styles.rightLine}/>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flexDirection: 'row'
    },
    leftLine: {
        backgroundColor: 'black',
        height: 1,
        flex: 1,
        alignSelf: 'center'
    },
    rightLine: {
        backgroundColor: 'black',
        height: 1,
        flex: 5,
        alignSelf: 'center'
    },
    header: {
        paddingHorizontal:5,
        fontSize: 18
    }
})
