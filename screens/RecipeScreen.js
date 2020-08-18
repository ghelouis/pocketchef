import React, { useState, useEffect } from 'react';
import {Alert, StyleSheet, Text, View, ScrollView} from 'react-native';
import StaticList from '../components/StaticList'
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'
import FS from '../fs/FS'
import i18n from 'i18n-js';
import {SliderBox} from "react-native-image-slider-box";
import ImageView from "react-native-image-viewing";
import Header from "../components/Header";
import NumberPerson from "../components/NumberPerson";

/**
 * Display a single recipe
 */
export default function RecipeScreen({ route, navigation }) {
    const {recipeId} = route.params
    const [title, setTitle] = useState('')
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
            setTitle(recipe.title)
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
        return {
            key: item.step.toString(),
            value: quantity + unit + item.value
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

    return (
        <View style={styles.main}>
            <Text style={styles.title}>{title}</Text>
            <ScrollView>
                <SliderBox
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
                <ImageView
                    images={images}
                    imageIndex={imageViewerModalState.imgIndex}
                    visible={imageViewerModalState.isVisible}
                    onRequestClose={() => setImageViewerModalState({imgIndex: 0, isVisible: false})}
                />
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
                    onPress={() => navigation.navigate('EditRecipe', {recipeId: recipeId})}
                    accessibilityLabel="Edit recipe"
                />
            </View>
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

