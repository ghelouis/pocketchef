import React, { useState } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button} from 'react-native';

// TODO: create DB connection in App.js and pass it to screens?
import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");
db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT, ingredients TEXT, instructions TEXT, userId TEXT, FOREIGN KEY(userId) REFERENCES users(id))')
});


export default function AddRecipeScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    // waiting for this issue to be resolved: https://github.com/uuidjs/uuid/issues/375
    // (should be good enough for now - from https://stackoverflow.com/a/2117523)
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const onSaveRecipe = () => {
        console.log('Recipe ' + id + ' successfully saved')
        // TODO: once ok is clicked, go back to RecipesScreen page (cause the id changes if we stay here)
        Alert.alert('',
            'Recipe saved successfully',
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipes')},
            ],
            {cancelable: false}
        )
    }

    const saveRecipe = () => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                [id, title, ingredients, instructions],
                onSaveRecipe());
        });
    }

    return (
        <View>
            <Text>Title</Text>
            <TextInput
                placeholder="Title"
                onChangeText={title => setTitle(title)}
            />
            <Text>Ingredients</Text>
            <TextInput
                placeholder="Ingredients"
                onChangeText={ingredients => setIngredients(ingredients)}
                multiline={true}
            />
            <Text>Instructions</Text>
            <TextInput
                placeholder="Instructions"
                onChangeText={instructions => setInstructions(instructions)}
                multiline={true}
            />
            <Button
                onPress={saveRecipe}
                title="Save"
                accessibilityLabel="Save"
                disabled={!title || !ingredients || !instructions}
            />
        </View>
    );
}

AddRecipeScreen.navigationOptions = {
  header: null,
};
const styles = StyleSheet.create({
});

