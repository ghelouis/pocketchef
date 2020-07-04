import React, { useState, useEffect } from 'react';
import {TextInput, View, StyleSheet, Text, Alert, Button, ScrollView} from 'react-native';
import LiveList from '../components/LiveList'
import DB from '../database/Database'
import FS from '../fs/FS'
import i18n from 'i18n-js';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { SliderBox } from "react-native-image-slider-box";
import {FontAwesome} from "@expo/vector-icons";
import ImageView from "react-native-image-viewing";


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
        getPermissionAsync()
    }, [])
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [utensils, setUtensils] = useState([]);
    const [images, setImages] = useState([]);
    useEffect(() => updateDeleteImageButtonBackgroundColor())
    const [deleteImageButtonBackgroundColor, setDeleteImageButtonBackgroundColor] = useState('#DFDFDF');
    const [currentImageIndex, setCurrentImageIndex] = useState([]);
    const [imageViewerModalState, setImageViewerModalState] = useState({isVisible: false, imgIndex: 0})

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
        console.log("Failed to save recipe " + id + "(" + title + ") with: ", err)
    }

    const saveRecipe = () => {
        FS.saveMainImages(id, images).then(() => {
                DB.saveRecipe(id, title, ingredients, instructions, utensils, onSaveRecipe, onSaveRecipeError)
            }
        ).catch((err) => {
            console.log("Add Recipe: Save images to file system error:", err)
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

    const onUtensilsUpdate = (newUtensils) => {
        setUtensils(newUtensils)
    }

    return (
        <View style={styles.main}>
            <Text style={styles.header}>{i18n.t('title')}</Text>
            <TextInput
                style={styles.details}
                placeholder={i18n.t('title')}
                onChangeText={title => setTitle(title)}
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
            <ScrollView>
                <Text style={styles.header}>{i18n.t('ingredients')}</Text>
                <TextInput
                    style={styles.details}
                    placeholder={i18n.t('ingredients')}
                    onChangeText={ingredients => setIngredients(ingredients)}
                    multiline={true}
                />
                <Text style={styles.header}>{i18n.t('instructions')}</Text>
                <TextInput
                    style={styles.details}
                    placeholder={i18n.t('instructions')}
                    onChangeText={instructions => setInstructions(instructions)}
                    multiline={true}
                />
                <Text style={styles.header}>{i18n.t('utensils')}</Text>
                <LiveList
                    recipeId={id}
                    loadItems={undefined}
                    onUpdateItems={onUtensilsUpdate}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={saveRecipe}
                    title={i18n.t('save')}
                    accessibilityLabel="Save"
                    disabled={!title}
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

AddRecipeScreen.navigationOptions = {
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

