import React, { useState } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button} from 'react-native';
import DB from '../database/Database'


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
        Alert.alert('',
            'Recipe saved successfully',
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipes')},
            ],
            {cancelable: false}
        )
    }

    const saveRecipe = () => {
        DB.saveRecipe(id, title, ingredients, instructions, onSaveRecipe)
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

