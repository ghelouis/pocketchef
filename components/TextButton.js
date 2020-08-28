import React from 'react';
import {StyleSheet, Button, View} from "react-native";

export default function TextButton({title, onPress, disabled = false, color = undefined}) {
    return (
        <View style={styles.buttonContainer}>
            <Button
                title={title}
                onPress={onPress}
                disabled={disabled}
                color={color}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        marginBottom: 10,
    }
})
