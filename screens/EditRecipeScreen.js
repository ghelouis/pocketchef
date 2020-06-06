import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button, ScrollView} from 'react-native';
import DB from '../database/Database'
import i18n from 'i18n-js';


/**
 * Screen for editing an existing recipe
 */
export default function EditRecipeScreen({ route, navigation }) {
    const { recipeId } = route.params;
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    const onSuccess = (tx, results) => {
        const len = results.rows.length
        if (len < 1) {
            console.log("Error: recipe not found")
        } else {
            const recipe = results.rows.item(0)
            setTitle(recipe.title)
            setIngredients(recipe.ingredients)
            setInstructions(recipe.instructions)
        }
    }

    const onError = (err) => {
        console.log("Error retrieving recipe:", err)
        return false
    }

    useEffect(() => {
        DB.getRecipe(recipeId, onSuccess, onError)
    }, [recipeId])

    const onUpdate = () => {
        Alert.alert('',
            i18n.t('updateSuccess'),
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipe', { recipeId: recipeId })}
            ],
            {cancelable: false}
        )
    }

    const onUpdateError = () => {
        console.log("Error updating recipe:", err)
    }

    const updateRecipe = () => {
        DB.updateRecipe(recipeId, title, ingredients, instructions, onUpdate, onUpdateError)
    }

    return (
        <View style={styles.main}>
            <ScrollView>
                <Text style={styles.header}>{i18n.t('title')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={t => setTitle(t)}
                    value={title}
                />
                <Text style={styles.header}>{i18n.t('ingredients')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={ingredients => setIngredients(ingredients)}
                    multiline={true}
                    value={ingredients}
                />
                <Text style={styles.header}>{i18n.t('instructions')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={instructions => setInstructions(instructions)}
                    multiline={true}
                    value={instructions}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={updateRecipe}
                    title={i18n.t('update')}
                    accessibilityLabel="Update"
                    disabled={!title || !ingredients || !instructions}
                />
            </View>
        </View>
    );
}

EditRecipeScreen.navigationOptions = {
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

