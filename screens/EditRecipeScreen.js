import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button, ScrollView} from 'react-native';
import DB from '../database/Database'
import i18n from 'i18n-js';
import ImageView from "react-native-image-viewing";
import {SliderBox} from "react-native-image-slider-box";
import FS from "../fs/FS";
import * as ImagePicker from "expo-image-picker";
import {FontAwesome} from "@expo/vector-icons";


/**
 * Edit an existing recipe
 */
export default function EditRecipeScreen({ route, navigation }) {
    const { recipeId } = route.params;
    useEffect(() => {
        DB.getRecipe(recipeId, onSuccess, onError)
    }, [recipeId])
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [images, setImages] = useState([]);
    useEffect(() => updateDeleteImageButtonBackgroundColor())
    const [currentImageIndex, setCurrentImageIndex] = useState([]);
    useEffect(() => {
        loadImages()
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

    const onUpdate = () => {
        Alert.alert('',
            i18n.t('updateSuccess'),
            [
                {text: 'OK', onPress: () => navigation.navigate('Recipe', { recipeId: recipeId })}
            ],
            {cancelable: false}
        )
    }

    const onUpdateError = () => {
        console.log("Error updating recipe:", err)
    }

    const updateRecipe = () => {
        FS.updateMainImages(recipeId, images.map(o => o.uri)).then(() => {
                DB.updateRecipe(recipeId, title, ingredients, instructions, onUpdate, onUpdateError)
            }
        ).catch((err) => {
            console.log("Update recipe: failed to save images to file system:")
            console.log(err)
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
        } catch (E) {
            console.log("Pick image error:");
            console.log(E);
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

    return (
        <View style={styles.main}>
            <ScrollView>
                <Text style={styles.header}>{i18n.t('title')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={t => setTitle(t)}
                    value={title}
                />
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
                        accessibilityLabel="Pick image"
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
                <Text style={styles.header}>{i18n.t('ingredients')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={ingredients => setIngredients(ingredients)}
                    multiline={true}
                    value={ingredients}
                />
                <Text style={styles.header}>{i18n.t('instructions')}</Text>
                <TextInput
                    style={styles.details}
                    onChangeText={instructions => setInstructions(instructions)}
                    multiline={true}
                    value={instructions}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={updateRecipe}
                    title={i18n.t('update')}
                    accessibilityLabel="Update"
                    disabled={!title || !ingredients || !instructions}
                />
            </View>
            <ImageView
                images={images}
                imageIndex={imageViewerModalState.imgIndex}
                visible={imageViewerModalState.isVisible}
                onRequestClose={() => setImageViewerModalState({imgIndex: 0, isVisible: false})}
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
        justifyContent: "center",
        width: "80%",
        marginLeft: "10%",
        marginTop: 10,
        marginBottom: 10,
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
    }
});

