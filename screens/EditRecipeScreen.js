import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Alert, ScrollView } from 'react-native';
import DynamicList from '../components/DynamicList'
import i18n from 'i18n-js';
import ImageView from "react-native-image-viewing";
import {SliderBox} from "react-native-image-slider-box";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import NumberPerson from "../components/NumberPerson";
import Header from "../components/Header";
import TextButtonDuo from "../components/TextButtonDuo";
import PhotoButtons from "../components/PhotoButtons";
import Constants from "expo-constants";
import {
    getIngredientsFromDB,
    getInstructionsFromDB,
    getUtensilsFromDB,
    updateRecipeInDB
} from "../utils/database";
import {loadMainImages, mainImagesDir, updateMainImages} from "../utils/images";


/**
 * Edit an existing recipe
 */
export default function EditRecipeScreen({ route, navigation }) {
    const recipe = route.params
    useEffect(() => {
        loadRecipe()
    }, [])
    const [title, setTitle] = useState('')
    const [nbPerson, setNbPerson] = useState(1)
    const [ingredients, setIngredients] = useState([])
    const [instructions, setInstructions] = useState([])
    const [utensils, setUtensils] = useState([])
    const [notes, setNotes] = useState('')
    const [images, setImages] = useState([])
    const [currentImageIndex, setCurrentImageIndex] = useState([])
    useEffect(() => {
        loadImages()
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const loadImages = () => {
        loadMainImages(recipe.id).then((res) => {
            setImages(res.map(u => ({key: u, uri: mainImagesDir(recipe.id) + '/' + u})))
        }).catch((err) => {
            console.log("Error retrieving images for recipe " + recipe.id + ": " + err)
        })
    }

    const loadRecipe = () => {
        setTitle(recipe.title)
        setNbPerson(recipe.nbPerson)
        setNotes(recipe.notes)
    }

    const onUpdate = () => {
        Alert.alert('',
            i18n.t('updateSuccess'),
            [
                {
                    text: 'OK', onPress: () => {
                        navigation.navigate('Recipe', {
                            recipeId: recipe.id,
                            title: title,
                            nbPerson: nbPerson,
                            notes: notes
                        })
                    }
                }
            ],
            {cancelable: false}
        )
    }

    const updateRecipe = () => {
        updateMainImages(recipe.id, images.map(o => o.uri)).then(() => {
                updateRecipeInDB(recipe.id, title, nbPerson, ingredients, instructions, utensils, notes, onUpdate)
            }
        ).catch((err) => {
            console.log("Update recipe: failed to save images to file system:", err)
        })
    }

    const pickImage = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
            if (status !== 'granted') {
                alert(i18n.t('errors.missingPermission'))
            } else {
                await pickTheImage()
            }
        } else {
            await pickTheImage()
        }
    }

    const pickTheImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            })
            if (!result.cancelled) {
                addImage(result.uri)
            }
        } catch (E) {
            console.log("Pick image error:")
            console.log(E)
        }
    }

    const takePicture = async () => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            alert(i18n.t('errors.missingPermission'))
        } else {
            await takeThePicture()
        }
    }

    const takeThePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            })
            if (!result.cancelled) {
                addImage(result.uri)
            }
        } catch (E) {
            console.log("Take picture error:")
            console.log(E)
        }
    }

    const addImage = (imageURI) => {
        if (images.length === 0) {
            setImages([{key: images.length, uri: imageURI}])
        } else {
            setImages(images.concat({key: images.length, uri: imageURI}))
        }
    }

    const deleteCurrentImage = () => {
        const newImageArray = [...images]
        newImageArray.splice(currentImageIndex, 1)
        setImages(newImageArray)
    }

    const onUtensilsUpdate = (newUtensils) => {
        setUtensils(newUtensils)
    }

    const onIngredientsUpdate = (newIngredients) => {
        setIngredients(newIngredients)
    }

    const onInstructionsUpdate = (newInstructions) => {
        setInstructions(newInstructions)
    }

    const onNbPersonUpdate = (newNbPerson) => {
        setNbPerson(newNbPerson)
    }

    return (
        <View style={styles.main}>
            <TextInput
                style={styles.title}
                placeholder={i18n.t('title')}
                value={title}
                onChangeText={title => setTitle(title)}
            />
            <ScrollView>
                <SliderBox
                    images={images}
                    resizeMode={'contain'}
                    currentImageEmitter={index => setCurrentImageIndex(index)}
                    onCurrentImagePressed={index => setImageViewerModalState({imgIndex: index, isVisible: true})}
                />
                <PhotoButtons
                    onPickImagePress={pickImage}
                    onTakePicturePress={takePicture}
                    onDeleteCurrentImagePress={deleteCurrentImage}
                    deleteCurrentImageDisabled={images.length < 1}
                />
                <NumberPerson
                    value={nbPerson}
                    onValueUpdate={onNbPersonUpdate}
                />
                <Header value={i18n.t('ingredients')}/>
                <DynamicList
                    recipeId={recipe.id}
                    loadItems={getIngredientsFromDB}
                    onUpdateItems={onIngredientsUpdate}
                />
                <Header value={i18n.t('instructions')}/>
                <DynamicList
                    recipeId={recipe.id}
                    loadItems={getInstructionsFromDB}
                    onUpdateItems={onInstructionsUpdate}
                    multiline={true}
                    ordered={true}
                />
                <Header value={i18n.t('utensils')}/>
                <DynamicList
                    recipeId={recipe.id}
                    loadItems={getUtensilsFromDB}
                    onUpdateItems={onUtensilsUpdate}
                />
                <Header value={'Notes'}/>
                <TextInput
                    value={notes}
                    onChangeText={text => setNotes(text)}
                    multiline={true}
                    style={styles.notes}
                />
                <ImageView
                    images={images}
                    imageIndex={imageViewerModalState.imgIndex}
                    visible={imageViewerModalState.isVisible}
                    onRequestClose={() => setImageViewerModalState({imgIndex: 0, isVisible: false})}
                />
            </ScrollView>
            <TextButtonDuo
                title={i18n.t('update')}
                onActionPress={updateRecipe}
                onCancelPress={() => navigation.navigate('Recipe')}
                actionDisabled={!title}
            />
        </View>
    )
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
    icon: {
        marginRight: 0
    },
    notes: {
        borderWidth: 1,
        borderRadius: 3,
        margin: 5,
        padding: 5,
        borderColor: 'lightgrey'
    }
})