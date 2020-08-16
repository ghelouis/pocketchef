import {StyleSheet, Text, View, Button} from "react-native";
import React, {useEffect, useState} from "react";

export default function NumberPerson({min, leftText, rightText, onUpdate, loadValue, recipeId}) {
    const [nbPerson, setNbPerson] = useState(1);
    useEffect(() => {
        if (loadValue) {
            loadValue(recipeId, onLoadValueSuccess, onLoadValueError)
        }
    }, [])

    const onLoadValueSuccess = (tx, results) => {
        const currentNbPerson = results.rows.item(0).nb_person
        setNbPerson(currentNbPerson)
        onUpdate(currentNbPerson)
    }

    const onLoadValueError = (t, err) => {
        console.log("Failed to load number input value with:", err)
    }

    const increase = () => {
        const newNbPerson = nbPerson + 1
        onUpdate(newNbPerson)
        setNbPerson(newNbPerson)
    }

    const decrease = () => {
        if (nbPerson > min) {
            const newNbPerson = nbPerson - 1
            onUpdate(newNbPerson)
            setNbPerson(newNbPerson)
        }
    }

    return (
        <View style={styles.main}>
            <Text style={styles.text}>{leftText} </Text>
            <Button
                title={'-'}
                onPress={decrease}
                disabled={nbPerson < 2}
                style={styles.button}
            />
            <Text> {nbPerson} </Text>
            <Button
                title={'+'}
                onPress={increase}
                style={styles.button}
            />
            <Text style={styles.text}> {rightText}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flexDirection: 'row',
        margin: 5,
        alignItems: 'center'
    },
    button: {
    }
})