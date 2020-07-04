import React, { useState, useEffect } from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import StaticList from '../components/StaticList'
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
            loadRecipe()
            loadImages()
        });
        loadRecipe()
        loadImages()
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const [ingredients, setIngredients] = useState([])
    const [instructions, setInstructions] = useState('')
    const [utensils, setUtensils] = useState([])

    const loadImages = () => {
        FS.loadMainImages(recipeId).then((res) => {
            setImages(res.map(u => ({key: u, uri: FS.mainImagesDir(recipeId) + '/' + u})))
        }).catch((err) => {
            console.log("Error retrieving images for recipe " + recipeId + ": " + err)
        })
    }

    const loadRecipe = () => {
        DB.getRecipe(recipeId, onLoadRecipeSuccess, onLoadRecipeError)
        DB.getUtensils(recipeId, onLoadUtensilsSuccess, onLoadUtensilsError)
        DB.getIngredients(recipeId, onLoadIngredientsSuccess, onLoadIngredientsError)
    }

    const onLoadRecipeSuccess = (tx, results) => {
        if (results.rows.length < 1) {
            console.log("Error: recipe not found")
        } else {
            const recipe = results.rows.item(0)
            setTitle(recipe.title)
            setInstructions(recipe.instructions)
        }
    }

    const onLoadUtensilsSuccess = (tx, results) => {
        const len = results.rows.length
        const tmp = []
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                tmp.push(results.rows.item(i))
            }
        }
        setUtensils(tmp)
    }

    const onLoadIngredientsSuccess = (tx, results) => {
        const len = results.rows.length
        const tmp = []
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                tmp.push(results.rows.item(i))
            }
        }
        setIngredients(tmp)
    }

    const onLoadRecipeError = (tx, err) => {
        console.log("Error retrieving recipe " + recipeId + ":", err)
    }

    const onLoadUtensilsError = (tx, err) => {
        console.log("Error retrieving utensils for recipe " + recipeId + ":", err)
    }

    const onLoadIngredientsError = (tx, err) => {
        console.log("Error retrieving ingredients for recipe " + recipeId + ":", err)
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
                {ingredients.length > 0 ? <Text style={styles.header}>{i18n.t('ingredients')}</Text> : null}
                {ingredients.length > 0 ? <StaticList items={ingredients}/> : null}
                {instructions ? <Text style={styles.header}>{i18n.t('instructions')}</Text> : null}
                {instructions ? <Text style={styles.details}>{instructions}</Text> : null}
                {utensils.length > 0 ? <Text style={styles.header}>{i18n.t('utensils')}</Text> : null}
                {utensils.length > 0 ? <StaticList items={utensils}/> : null}
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

