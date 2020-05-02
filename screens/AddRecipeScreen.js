import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button, ScrollView} from 'react-native';
import DB from '../database/Database'
import i18n from 'i18n-js';


/**
 * Screen for creating a new recipe
 */
export default function AddRecipeScreen({ navigation }) {
    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        // waiting for this issue to be resolved: https://github.com/uuidjs/uuid/issues/375
        // (should be good enough for now - from https://stackoverflow.com/a/2117523)
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        setId(id)
    }, [])

    const onSaveRecipe = () => {
        Alert.alert('',
            i18n.t('saveSuccess'),
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipes')}
            ],
            {cancelable: false}
        )
    }

    const saveRecipe = () => {
        DB.saveRecipe(id, title, ingredients, instructions, onSaveRecipe)
    }

    return (
        <View style={styles.main}>
            <ScrollView>
                <Text style={styles.header}>{i18n.t('title')}</Text>
                <TextInput
                    style={styles.details}
                    placeholder={i18n.t('title')}
                    onChangeText={title => setTitle(title)}
                />
                <Text style={styles.header}>{i18n.t('ingredients')}</Text>
                <TextInput
                    style={styles.details}
                    placeholder={i18n.t('ingredients')}
                    onChangeText={ingredients => setIngredients(ingredients)}
                    multiline={true}
                />
                <Text style={styles.header}>{i18n.t('instructions')}</Text>
                <TextInput
                    style={styles.details}
                    placeholder={i18n.t('instructions')}
                    onChangeText={instructions => setInstructions(instructions)}
                    multiline={true}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={saveRecipe}
                    title={i18n.t('save')}
                    accessibilityLabel="Save"
                    disabled={!title || !ingredients || !instructions}
                />
            </View>
        </View>
    );
}

AddRecipeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    header: {
        fontSize: 22,
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20
    },
    details: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonContainer: {
        justifyContent: "center",
        width: "80%",
        marginLeft: "10%",
        marginTop: 10,
        marginBottom: 10,
    }
});

