import {StyleSheet, Text, View, Button} from "react-native";
import React from "react";
import i18n from "i18n-js";

export default function NumberPerson({value, onValueUpdate}) {

    const min = 1

    const increase = () => {
        onValueUpdate(value + 1)
    }

    const decrease = () => {
        if (value > min) {
            onValueUpdate(value - 1)
        }
    }

    return (
        <View style={styles.main}>
            <Text style={styles.text}>{i18n.t('for')} </Text>
            <Button
                title={'-'}
                onPress={decrease}
                disabled={value === min}
            />
            <Text> {value} </Text>
            <Button
                title={'+'}
                onPress={increase}
            />
            <Text style={styles.text}> {value === 1 ? i18n.t('person') : i18n.t('people')}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flexDirection: 'row',
        margin: 5,
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
})