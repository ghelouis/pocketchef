import React, { useState } from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'

/**
 * Screen displaying a specific recipe
 */
export default function RecipeScreen({ route, navigation }) {
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

    const onDeleteSuccess = () => {
        console.log("Delete recipe success!")
        navigation.navigate('Recipes')
    }

    const onDeleteError = (err) => {
        console.log("Delete recipe error: ", err)
    }

    const onDelete = () => {
        Alert.alert('',
            'Supprimer la recette?',
            [
                {text: 'OK', onPress: () => DB.deleteRecipe(recipeId, onDeleteSuccess, onDeleteError)}
            ],
            {cancelable: true}
        )
    }

    DB.getRecipe(recipeId, onSuccess, onError)

    return (
        <View style={styles.main}>
            <ScrollView>
                <Text style={styles.header}>Title</Text>
                <Text style={styles.details}>{title}</Text>
                <Text style={styles.header}>Ingredients</Text>
                <Text style={styles.details}>{ingredients}</Text>
                <Text style={styles.header}>Instructions</Text>
                <Text style={styles.details}>{instructions}</Text>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <FontAwesome.Button
                    style={styles.button}
                    iconStyle={styles.icon}
                    name="trash"
                    backgroundColor="red"
                    onPress={onDelete}
                    accessibilityLabel="Delete recipe"
                />
                <FontAwesome.Button
                    style={styles.button}
                    iconStyle={styles.icon}
                    name="pencil"
                    //onPress={() => navigation.navigate('AddRecipe')}
                    accessibilityLabel="Edit recipe"
                />
            </View>
        </View>
    );
}

RecipeScreen.navigationOptions = {
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
        flexDirection: 'row',
        justifyContent: "space-evenly",
        marginTop: 10,
        marginBottom: 5,
    },
    button: {
        justifyContent:"center",
        width: "60%",
        alignSelf: "center",
    },
    icon: {
        marginRight: 0
    }
});

