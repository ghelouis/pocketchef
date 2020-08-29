import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button, ScrollView } from 'react-native';
import DB from '../database/Database'
import DynamicList from '../components/DynamicList'
import i18n from 'i18n-js';
import ImageView from "react-native-image-viewing";
import {SliderBox} from "react-native-image-slider-box";
import FS from "../fs/FS";
import * as ImagePicker from "expo-image-picker";
import {FontAwesome} from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import NumberPerson from "../components/NumberPerson";
import DynamicIngredientList from "../components/DynamicIngredientList";
import Header from "../components/Header";
import TextButtonDuo from "../components/TextButtonDuo";
import TextButton from "../components/TextButton";


/**
 * Edit an existing recipe
 */
export default function EditRecipeScreen({ route, navigation }) {
    const {recipeId} = route.params;
    useEffect(() => {
        DB.getRecipe(recipeId, onSuccess, onError)
    }, [recipeId])
    const [title, setTitle] = useState('');
    const [nbPerson, setNbPerson] = useState(1);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [utensils, setUtensils] = useState([]);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    useEffect(() => updateDeleteImageButtonBackgroundColor())
    const [currentImageIndex, setCurrentImageIndex] = useState([]);
    useEffect(() => {
        loadImages()
        getPermissionAsync()
    }, [])
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})
    const [deleteImageButtonBackgroundColor, setDeleteImageButtonBackgroundColor] = useState('#DFDFDF');
    const loadImages = () => {
        FS.loadMainImages(recipeId).then((res) => {
            setImages(res.map(u => ({key: u, uri: FS.mainImagesDir(recipeId) + '/' + u})))
        }).catch((err) => {
            console.log("Error retrieving images for recipe " + recipeId + ": " + err)
        })
    }

    const getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
            if (status !== 'granted') {
                alert(i18n.t('missingPermissionError'));
            }
        } else {
            const {status} = await Permissions.askAsync(Permissions.CAMERA);
            if (status !== 'granted') {
                alert(i18n.t('missingPermissionError'));
            }
        }
    };

    const onSuccess = (tx, results) => {
        const len = results.rows.length
        if (len < 1) {
            console.log("Error: recipe not found")
        } else {
            const recipe = results.rows.item(0)
            setTitle(recipe.title)
            setNotes(recipe.notes)
        }
    }

    const onError = (err) => {
        console.log("Error retrieving recipe:", err)
        return false
    }

    const onUpdate = () => {
        Alert.alert('',
            i18n.t('updateSuccess'),
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipe', {title: title, recipeId: recipeId})}
            ],
            {cancelable: false}
        )
    }

    const updateRecipe = () => {
        FS.updateMainImages(recipeId, images.map(o => o.uri)).then(() => {
                DB.updateRecipe(recipeId, title, nbPerson, ingredients, instructions, utensils, notes, onUpdate)
            }
        ).catch((err) => {
            console.log("Update recipe: failed to save images to file system:", err)
        })
    }

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            });
            if (!result.cancelled) {
                addImage(result.uri)
            }
        } catch (err) {
            console.log("Pick image error:", err);
        }
    }

    const takePicture = async () => {
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

    const updateDeleteImageButtonBackgroundColor = () => {
        if (images.length === 0) {
            setDeleteImageButtonBackgroundColor('#DFDFDF')
        } else {
            setDeleteImageButtonBackgroundColor('#F44336')
        }
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
                <View style={styles.picButtonContainer}>
                    <FontAwesome.Button
                        style={styles.button}
                        iconStyle={styles.icon}
                        name="image"
                        backgroundColor="#2196F3"
                        onPress={() => pickImage()}
                        accessibilityLabel="Pick an image"
                    />
                    <FontAwesome.Button
                        style={styles.button}
                        iconStyle={styles.icon}
                        backgroundColor="#2196F3"
                        name="camera"
                        onPress={() => takePicture()}
                        accessibilityLabel="Take a picture"
                    />
                    <FontAwesome.Button
                        style={styles.button}
                        iconStyle={styles.icon}
                        name="trash"
                        backgroundColor={deleteImageButtonBackgroundColor}
                        onPress={deleteCurrentImage}
                        accessibilityLabel="Delete current image"
                        disabled={images.length < 1}
                    />
                </View>
                <NumberPerson
                    min={1}
                    leftText={i18n.t('for')}
                    rightText={nbPerson === 1 ? i18n.t('person') : i18n.t('people')}
                    onUpdate={onNbPersonUpdate}
                    loadValue={DB.getNbPerson}
                    recipeId={recipeId}
                />
                <Header value={i18n.t('ingredients')}/>
                <DynamicIngredientList
                    recipeId={recipeId}
                    loadItems={DB.getIngredients}
                    onUpdateItems={onIngredientsUpdate}
                />
                <Header value={i18n.t('instructions')}/>
                <DynamicList
                    recipeId={recipeId}
                    loadItems={DB.getInstructions}
                    onUpdateItems={onInstructionsUpdate}
                    multiline={true}
                    ordered={true}
                />
                <Header value={i18n.t('utensils')}/>
                <DynamicList
                    recipeId={recipeId}
                    loadItems={DB.getUtensils}
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
                onCancelPress={() => navigation.navigate('Recipe', {recipeId: recipeId})}
                actionDisabled={!title}
            />
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
    title: {
        fontSize: 28,
        textAlign: 'center',
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10
    },
    picButtonContainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly",
        marginTop: 10,
        marginBottom: 5,
    },
    button: {
        justifyContent:"center",
        width: "50%",
        alignSelf: "center",
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