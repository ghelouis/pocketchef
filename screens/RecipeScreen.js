import React, { useState, useEffect } from 'react';
import {Alert, StyleSheet, Text, View, ScrollView} from 'react-native';
import StaticList from '../components/StaticList'
import i18n from 'i18n-js';
import {SliderBox} from "react-native-image-slider-box";
import ImageView from "react-native-image-viewing";
import Header from "../components/Header";
import NumberPerson from "../components/NumberPerson";
import {exportRecipe} from "../utils/export";
import IconButton from "../components/IconButton";
import {
    deleteRecipeFromDB,
    getIngredientsFromDB,
    getInstructionsFromDB,
    getUtensilsFromDB
} from "../utils/database";
import {deleteAllImages, loadMainImages, mainImagesDir} from "../utils/images";
import {multiplyIngredient} from "../utils/ingredientMultiplier";

/**
 * Display a single recipe
 */
export default function RecipeScreen({ route, navigation }) {
    useEffect(() => {
        if (route.params?.nbPerson) {
            setDisplayNbPerson(route.params.nbPerson)
        }
        if (route.params?.title) {
            navigation.setOptions({title: title})
        }
    }, [route.params?.nbPerson, route.params?.title])
    const {recipeId, title, nbPerson, notes} = route.params
    const [images, setImages] = useState([])
    useEffect(() => {
        navigation.addListener('focus', () => {
            loadRecipe()
            loadImages()
        })
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const [displayNbPerson, setDisplayNbPerson] = useState(1)
    const [ingredients, setIngredients] = useState([])
    const [originalIngredients, setOriginalIngredients] = useState([])
    const [instructions, setInstructions] = useState([])
    const [utensils, setUtensils] = useState([])

    const loadImages = () => {
        loadMainImages(recipeId).then((res) => {
            setImages(res.map(u => ({key: u, uri: mainImagesDir(recipeId) + '/' + u})))
        }).catch((err) => {
            console.log("Error retrieving images for recipe " + recipeId + ": " + err)
        })
    }

    const loadRecipe = () => {
        getUtensilsFromDB(recipeId, onLoadUtensilsSuccess, onLoadUtensilsError)
        getIngredientsFromDB(recipeId, onLoadIngredientsSuccess, onLoadIngredientsError)
        getInstructionsFromDB(recipeId, onLoadInstructionsSuccess, onLoadInstructionsError)
    }

    const orderListResult = (results, buildListItem) => {
        const len = results.rows.length
        const tmp = []
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                tmp.push(results.rows.item(i))
            }
        }
        return tmp.sort((a, b) => {
            if (a.step < b.step) return -1
            if (a.step > b.step) return 1
            return 0
        }).map(buildListItem)
    }

    const buildSimpleListItem = (item) => {
        return {
            key: item.step.toString(),
            value: item.value
        }
    }

    const onLoadIngredientsSuccess = (tx, results) => {
        const tmp = orderListResult(results, buildSimpleListItem)
        setIngredients(tmp)
        setOriginalIngredients(tmp)
    }

    const onLoadInstructionsSuccess = (tx, results) => {
        setInstructions(orderListResult(results, buildSimpleListItem))
    }

    const onLoadUtensilsSuccess = (tx, results) => {
        setUtensils(orderListResult(results, buildSimpleListItem))
    }

    const onLoadUtensilsError = (tx, err) => {
        console.log("Error retrieving utensils for recipe " + recipeId + ":", err)
    }

    const onLoadIngredientsError = (tx, err) => {
        console.log("Error retrieving ingredients for recipe " + recipeId + ":", err)
    }

    const onLoadInstructionsError = (tx, err) => {
        console.log("Error retrieving instructions for recipe " + recipeId + ":", err)
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
                    text: i18n.t('cancel'),
                    style: "cancel"
                },
                {
                    text: 'OK', onPress: () => {
                        deleteAllImages(recipeId).then(() => {
                            deleteRecipeFromDB(recipeId, onDeleteSuccess, onDeleteError)
                        })
                    }
                }
            ],
            {cancelable: true}
        )
    }

    const onNbPersonUpdate = (newNbPerson) => {
        setDisplayNbPerson(newNbPerson)
        const ratio = newNbPerson / nbPerson
        const newIngredients = originalIngredients.map(i => ({
            key: i.key,
            value: multiplyIngredient(i.value, ratio)
        }))
        setIngredients(newIngredients)
    }

    const exportTheRecipe = async () => {
        const recipe = {
            id: recipeId,
            title: title,
            nbPerson: nbPerson,
            ingredients: ingredients,
            instructions: instructions,
            utensils: utensils,
            notes: notes
        }
        await exportRecipe(recipe)
    }

    const navigateToEdit = () => {
        const recipe = {
            id: recipeId,
            title: title,
            nbPerson: nbPerson,
            ingredients: ingredients,
            instructions: instructions,
            utensils: utensils,
            notes: notes
        }
        navigation.navigate('EditRecipe', recipe)
    }

    return (
        <View style={styles.main}>
            <ScrollView>
                <SliderBox
                    style={styles.sliderBox}
                    images={images}
                    resizeMode={'contain'}
                    onCurrentImagePressed={index => setImageViewerModalState({imgIndex: index, isVisible: true})}
                />
                <NumberPerson
                    value={displayNbPerson}
                    onValueUpdate={onNbPersonUpdate}
                />
                {ingredients.length > 0 ? <Header value={i18n.t('ingredients')}/> : null}
                {ingredients.length > 0 ? <StaticList items={ingredients}/> : null}
                {instructions.length > 0 ? <Header value={i18n.t('instructions')}/> : null}
                {instructions.length > 0 ? <StaticList items={instructions} ordered={true}/> : null}
                {utensils.length > 0 ? <Header value={i18n.t('utensils')}/> : null}
                {utensils.length > 0 ? <StaticList items={utensils}/> : null}
                {notes ? <Header value={'Notes'}/> : null}
                {notes ? <Text>{notes}</Text> : null}
                <ImageView
                    images={images}
                    imageIndex={imageViewerModalState.imgIndex}
                    visible={imageViewerModalState.isVisible}
                    onRequestClose={() => setImageViewerModalState({imgIndex: 0, isVisible: false})}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <IconButton
                    name={i18n.t('export')}
                    onPress={exportTheRecipe}
                    icon={"download"}
                />
                <IconButton
                    name={i18n.t('delete')}
                    onPress={onDelete}
                    icon={"trash"}
                />
                <IconButton
                    name={i18n.t('edit')}
                    onPress={navigateToEdit}
                    icon={"pencil-alt"}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        margin: 10
    },
    sliderBox: {
        height:150
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly"
    }
})