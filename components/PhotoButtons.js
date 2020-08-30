import React from 'react';
import {StyleSheet, View} from "react-native";
import i18n from 'i18n-js';
import IconButton from "./IconButton";

export default function PhotoButtons({onPickImagePress, onTakePicturePress, onDeleteCurrentImagePress, deleteCurrentImageDisabled}) {
    return (
        <View style={styles.buttonContainer}>
            <IconButton
                name={i18n.t('pickImage')}
                onPress={onPickImagePress}
                icon={"image"}
            />
            <IconButton
                name={i18n.t('takePicture')}
                onPress={onTakePicturePress}
                icon={"camera"}
            />
            <IconButton
                name={i18n.t('deleteCurrentImage')}
                onPress={onDeleteCurrentImagePress}
                icon={"trash"}
                disabled={deleteCurrentImageDisabled}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 5,
    }
})
