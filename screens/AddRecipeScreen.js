import React, { useState } from 'react';
import {TextInput, View, StyleSheet, Text, AsyncStorage, Alert} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
//import { openDatabase } from 'react-native-sqlite-storage';
//var db = openDatabase({name: 'PocketChefDatabase.db'});


export default function AddRecipeScreen() {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');


        /*saveRecipe() {
            const id = uuidv4();
            db.transaction(function (tx) {
                tx.executeSql(
                    'INSERT INTO recipes(id, title, ingredients, instructions) VALUES (?,?,?,?)',
                    [id, this.state.title, this.state.ingredients, this.state.instructions],
                    (tx, results) => {
                        console.log('Save title results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                            Alert.alert(
                                'Success',
                                'Recipe saved successfully',
                                [
                                    {
                                        text: 'Ok'
                                    },
                                ],
                                {cancelable: false}
                            );
                        } else {
                            alert('Failed to save recipe');
                        }
                    }
                );

            });
        }*/

        return (
            <View>
                    <Text>Title</Text>
                    <TextInput
                        placeholder="Title"
                        onChangeText={title => setTitle(title)}
                        defaultValue={title}
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
            </View>
        );
}

AddRecipeScreen.navigationOptions = {
  header: null,
};
const styles = StyleSheet.create({
});

