import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native';
import i18n from "i18n-js";
import {getRecipesFromDB} from "../utils/database";
import {getAllImages} from "../utils/images";
import IconButton from "../components/IconButton";
import {importRecipe} from "../utils/import";
import {FontAwesome5} from "@expo/vector-icons";

/**
 * List all recipes
 */
export default function RecipesScreen({ navigation }) {
    const [recipes, setRecipes] = useState([])
    useEffect(() => {
        navigation.addListener('focus', () => {
            getRecipesFromDB(onSuccess, onError);
        });
        getRecipesFromDB(onSuccess, onError)
    }, [])

    const onSuccess = (tx, results) => {
        getAllImages().then((idToImg) => {
            const tmpData = []
            const len = results.rows.length
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i)
                tmpData.push({
                    key: row.id,
                    title: row.title,
                    nbPerson: row.nb_person,
                    notes: row.notes,
                    uri: idToImg.get(row.id)
                })
            }
            setRecipes(tmpData.sort((a, b) => {
                if (a.title < b.title) return -1
                if (a.title > b.title) return 1
                return 0
            }))
        }).catch((err) => {
            console.log("Error getting miniature images:", err)
        })
    }

    const onError = (err) => {
        console.log("Error retrieving recipes:", err)
        return false
    }

    const onImportRecipeSuccess = () => {
        getRecipesFromDB(onSuccess, onError);
    }

    return (
        <View style={styles.main}>
            <FlatList
                data={recipes}
                renderItem={({item, index, separators}) => (
                    <TouchableHighlight
                        key={item.key}
                        onPress={() => navigation.navigate('Recipe', {
                            recipeId: item.key,
                            title: item.title,
                            nbPerson: item.nbPerson,
                            notes: item.notes
                        })}
                        onShowUnderlay={separators.highlight}
                        onHideUnderlay={separators.unhighlight}>
                        <View style={styles.itemContainer}>
                            {item.uri ?
                                <Image
                                    source={{uri: item.uri}}
                                    resizeMode={'contain'}
                                    style={styles.image}
                                /> :
                                <View style={styles.imageIconContainer}>
                                    <FontAwesome5 style={styles.imageIcon} name="image"/>
                                </View>
                            }
                            <View
                                style={index === recipes.length - 1 ? styles.itemWrapper : styles.itemWrapperWithBottomBorder}>
                                <Text style={styles.item}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                )}
            />
            <View style={styles.buttonContainer}>
                <IconButton
                    name={i18n.t('import')}
                    onPress={() => importRecipe(onImportRecipeSuccess)}
                    icon={"file-import"}
                />
                <IconButton
                    name={i18n.t('new')}
                    onPress={() => navigation.navigate('AddRecipe')}
                    icon={"plus"}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    image: {
        width: 50,
        height: 50,
        margin: 5,
        borderRadius: 3
    },
    imageIconContainer: {
        width: 50,
        height: 50,
        margin: 5,
        borderRadius: 3,
        justifyContent: 'center',
        alignContent: 'center'
    },
    imageIcon: {
        alignSelf: "center",
        fontSize: 25,
        color: '#b9b9b9'
    },
    item: {
        fontSize: 20
    },
    itemWrapper: {
        height: '100%',
        margin: 10,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    itemWrapperWithBottomBorder: {
        borderBottomColor: 'gainsboro',
        borderBottomWidth: 0.5,
        height: '100%',
        margin: 10,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly"
    }
});

