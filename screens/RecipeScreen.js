import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DB from '../database/Database'

export default function RecipeScreen({ route, navigation }) {
    const { recipeId } = route.params;
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    const onSuccess = (tx, results) => {
        console.log("TEST A")
        console.log(results)
        console.log("TEST B")
        const len = results.rows.length
        if (len < 1) {
            console.log("Error: recipe not found")
        } else {
            console.log("TEST C")
            const recipe = results.rows.item(0)
            console.log("TEST D")
            console.log(recipe)
            console.log("TEST E")
            setTitle(recipe.title)
            setIngredients(recipe.ingredients)
            setInstructions(recipe.instructions)
        }
    }

    const onError = (err) => {
        console.log("Error retrieving recipe:", err)
        return false
    }

    DB.getRecipe(recipeId, onSuccess, onError)

    return (
        <View>
            <Text>Recipe id: {recipeId}</Text>
            <Text>Recipe title:</Text>
            <Text>{title}</Text>
            <Text>Recipe ingredients:</Text>
            <Text>{ingredients}</Text>
            <Text>Recipe instructions:</Text>
            <Text>{instructions}</Text>
        </View>
    );
}

RecipeScreen.navigationOptions = {
  header: null,
};
const styles = StyleSheet.create({
});

