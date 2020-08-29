import React, { useState, useEffect } from 'react';
import {Alert, StyleSheet, Text, View, ScrollView} from 'react-native';
import StaticList from '../components/StaticList'
import DB from '../database/Database'
import FS from '../fs/FS'
import i18n from 'i18n-js';
import {SliderBox} from "react-native-image-slider-box";
import ImageView from "react-native-image-viewing";
import Header from "../components/Header";
import NumberPerson from "../components/NumberPerson";
import {exportRecipe} from "../utils/export";
import IconButton from "../components/IconButton";

/**
 * Display a single recipe
 */
export default function RecipeScreen({ route, navigation }) {
    const {title, recipeId} = route.params
    navigation.setOptions({title: title})
    const [images, setImages] = useState([])
    useEffect(() => {
        navigation.addListener('focus', () => {
            loadRecipe()
            loadImages()
        });
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const [nbPerson, setNbPerson] = useState(1);
    const [originalNbPerson, setOriginalNbPerson] = useState(undefined);
    const [ingredients, setIngredients] = useState([])
    const [originalIngredients, setOriginalIngredients] = useState([])
    const [instructions, setInstructions] = useState([])
    const [utensils, setUtensils] = useState([])
    const [notes, setNotes] = useState('')

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
        DB.getInstructions(recipeId, onLoadInstructionsSuccess, onLoadInstructionsError)
    }

    const onLoadRecipeSuccess = (tx, results) => {
        if (results.rows.length < 1) {
            console.log("Error: recipe not found")
        } else {
            const recipe = results.rows.item(0)
            setNotes(recipe.notes)
        }
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

    const buildIngredientListItem = (item) => {
        const quantity = item.quantity ? item.quantity + ' ' : ''
        const unit = item.unit ? item.unit + ' ' : ''
        const value = item.value ? item.value : ''
        return {
            key: item.step.toString(),
            value: quantity + unit + value
        }
    }

    const buildSimpleListItem = (item) => {
        return {
            key: item.step.toString(),
            value: item.value
        }
    }

    const onLoadIngredientsSuccess = (tx, results) => {
        setIngredients(orderListResult(results, buildIngredientListItem))
        const len = results.rows.length
        const tmp = []
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                tmp.push(results.rows.item(i))
            }
        }
        setOriginalIngredients(tmp)
    }

    const onLoadInstructionsSuccess = (tx, results) => {
        setInstructions(orderListResult(results, buildSimpleListItem))
    }

    const onLoadUtensilsSuccess = (tx, results) => {
        setUtensils(orderListResult(results, buildSimpleListItem))
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

    const onNbPersonUpdate = (newNbPerson) => {
        setNbPerson(newNbPerson)
        if (originalNbPerson === undefined) {
            setOriginalNbPerson(newNbPerson)
        } else {
            updateIngredientsWithRatio(newNbPerson / originalNbPerson)
        }
    }

    const updateIngredientsWithRatio = (ratio) => {
        const newIngreds = JSON.parse(JSON.stringify(originalIngredients)).map(i => {
            if (i.quantity) {
                const newQuantity = i.quantity * ratio
                if (!isNaN(newQuantity)) {
                    i.quantity = Number(newQuantity.toFixed(2))
                }
            }
            return i
        })
        setIngredients(newIngreds.map(buildIngredientListItem))
    }

    const exportTheRecipe = () => {
        const recipe = {
            id: recipeId,
            title: title,
            nbPerson: originalNbPerson,
            ingredients: ingredients,
            instructions: instructions,
            utensils: utensils,
            notes: notes
        }
        exportRecipe(recipe)
            .then((target) =>
                Alert.alert('', i18n.t('exportSuccess') + target))
            .catch((error) =>
                Alert.alert('', i18n.t('exportFailure') + error))
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
                    min={1}
                    leftText={i18n.t('for')}
                    rightText={nbPerson === 1 ? i18n.t('person') : i18n.t('people')}
                    onUpdate={onNbPersonUpdate}
                    loadValue={DB.getNbPerson}
                    recipeId={recipeId}
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
                    onPress={() => exportTheRecipe()}
                    icon={"download"}
                />
                <IconButton
                    name={i18n.t('delete')}
                    onPress={onDelete}
                    icon={"trash"}
                />
                <IconButton
                    name={i18n.t('edit')}
                    onPress={() => navigation.navigate('EditRecipe', {recipeId: recipeId})}
                    icon={"pencil"}
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