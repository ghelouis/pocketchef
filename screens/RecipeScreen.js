import React, { useState, useEffect } from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'
import FS from '../fs/FS'
import i18n from 'i18n-js';
import {SliderBox} from "react-native-image-slider-box";
import ImageView from "react-native-image-viewing";

/**
 * Display a recipe
 */
export default function RecipeScreen({ route, navigation }) {
    const { recipeId } = route.params
    const [title, setTitle] = useState('')
    const [images, setImages] = useState([])
    useEffect(() => {
        navigation.addListener('focus', () => {
            DB.getRecipe(recipeId, onSuccess, onError)
            loadImages()
        });
        DB.getRecipe(recipeId, onSuccess, onError)
        loadImages()
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const [ingredients, setIngredients] = useState('')
    const [instructions, setInstructions] = useState('')

    const loadImages = () => {
        FS.loadMainImages(recipeId).then((res) => {
            setImages(res.map(u => ({key: u, uri: FS.mainImagesDir(recipeId) + '/' + u})))
        }).catch((err) => {
            console.log("Error retrieving images for recipe " + recipeId + ": " + err)
        })
    }

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
        console.log("Error retrieving recipe " + recipeId + ":", err)
        return false
    }

    const onDeleteSuccess = () => {
        navigation.navigate('Recipes')
    }

    const onDeleteError = (err) => {
        console.log("Delete recipe error: ", err)
    }

    const onDelete = () => {
        Alert.alert('',
            i18n.t('deleteRecipe'),
            [
                {
                    text: 'OK', onPress: () => {
                        FS.deleteAllImages(recipeId).then(() => {
                            DB.deleteRecipe(recipeId, onDeleteSuccess, onDeleteError)
                        })
                    }
                }
            ],
            {cancelable: true}
        )
    }

    return (
        <View style={styles.main}>
            <ScrollView>
                <Text style={styles.title}>{title}</Text>
                <SliderBox
                    images={images}
                    resizeMode={'contain'}
                    onCurrentImagePressed={index => setImageViewerModalState({imgIndex: index, isVisible: true})}
                />
                {ingredients ? <Text style={styles.header}>{i18n.t('ingredients')}</Text> : null}
                {ingredients ? <Text style={styles.details}>{ingredients}</Text> : null}
                {instructions ? <Text style={styles.header}>{i18n.t('instructions')}</Text> : null}
                {instructions ? <Text style={styles.details}>{instructions}</Text> : null}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <FontAwesome.Button
                    style={styles.button}
                    iconStyle={styles.icon}
                    backgroundColor="#F44336"
                    name="trash"
                    onPress={onDelete}
                    accessibilityLabel="Delete recipe"
                />
                <FontAwesome.Button
                    style={styles.button}
                    iconStyle={styles.icon}
                    backgroundColor="#2196F3"
                    name="pencil"
                    onPress={() => navigation.navigate('EditRecipe', { recipeId: recipeId})}
                    accessibilityLabel="Edit recipe"
                />
            </View>
            <ImageView
                images={images}
                imageIndex={imageViewerModalState.imgIndex}
                visible={imageViewerModalState.isVisible}
                onRequestClose={() => setImageViewerModalState({imgIndex: 0, isVisible: false})}
            />
        </View>
    )
}

RecipeScreen.navigationOptions = {
  header: null,
}
const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    title: {
        fontSize: 28,
        textAlign: 'center',
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10
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
})

