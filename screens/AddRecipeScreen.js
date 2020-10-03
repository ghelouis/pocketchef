import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Alert, ScrollView } from 'react-native';
import DynamicList from '../components/DynamicList'
import DynamicIngredientList from "../components/DynamicIngredientList";
import NumberPerson from "../components/NumberPerson";
import i18n from 'i18n-js';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { SliderBox } from "react-native-image-slider-box";
import ImageView from "react-native-image-viewing";
import Header from "../components/Header";
import TextButtonDuo from "../components/TextButtonDuo";
import PhotoButtons from "../components/PhotoButtons";
import {saveMainImages} from "../utils/images";
import {saveRecipeToDB} from "../utils/database";


/**
 * Create a new recipe
 */
export default function AddRecipeScreen({ navigation }) {
    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    useEffect(() => {
        // waiting for this issue to be resolved: https://github.com/uuidjs/uuid/issues/375
        // (should be good enough for now - from https://stackoverflow.com/a/2117523)
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        setId(id)
    }, [])
    const [nbPerson, setNbPerson] = useState(1);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [utensils, setUtensils] = useState([]);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState([]);
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})

    const onSaveRecipe = () => {
        Alert.alert('',
            i18n.t('saveSuccess'),
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipes')}
            ],
            {cancelable: false}
        )
    }

    const onSaveRecipeError = (err) => {
        console.log("Failed to save recipe " + id + " (" + title + ") with: ", err)
        alert("Failed to save recipe " + title + " with: " + err)
    }

    const saveRecipe = () => {
        saveMainImages(id, images).then(() => {
                saveRecipeToDB(id, title, nbPerson, ingredients, instructions, utensils, notes, onSaveRecipe, onSaveRecipeError)
            }
        ).catch((err) => {
            console.log("Add Recipe: Save images to file system error:", err)
        })
    }

    const pickImage = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert(i18n.t('missingPermissionError'));
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
            });
            if (!result.cancelled) {
                addImage(result.uri)
            }
        } catch (E) {
            console.log("Pick image error:");
            console.log(E);
        }
    }

    const takePicture = async () => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
            alert(i18n.t('missingPermissionError'));
        } else {
            await takeThePicture()
        }
    }

    const takeThePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            });
            if (!result.cancelled) {
                addImage(result.uri)
            }
        } catch (E) {
            console.log("Take picture error:");
            console.log(E);
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

    const onInstructionsUpdate = (newInstructions) => {
        setInstructions(newInstructions)
    }

    const onUtensilsUpdate = (newUtensils) => {
        setUtensils(newUtensils)
    }

    const onIngredientsUpdate = (newIngredients) => {
        setIngredients(newIngredients)
    }

    const onNbPersonUpdate = (newNbPerson) => {
        setNbPerson(newNbPerson)
    }

    return (
        <View style={styles.main}>
            <TextInput
                style={styles.title}
                placeholder={i18n.t('title')}
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
                <DynamicIngredientList
                    onUpdateItems={onIngredientsUpdate}
                />
                <Header value={i18n.t('instructions')}/>
                <DynamicList
                    recipeId={id}
                    loadItems={undefined}
                    onUpdateItems={onInstructionsUpdate}
                    multiline={true}
                    ordered={true}
                />
                <Header value={i18n.t('utensils')}/>
                <DynamicList
                    recipeId={id}
                    loadItems={undefined}
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
                title={i18n.t('save')}
                onActionPress={saveRecipe}
                onCancelPress={() => navigation.navigate('Recipes')}
                actionDisabled={!title}
            />
        </View>
    );
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
});