import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'
import FS from "../fs/FS";
import {SliderBox} from "react-native-image-slider-box";

/**
 * List all recipes
 */
export default function RecipesScreen({ navigation }) {
    const [data, setData] = useState([])
    useEffect(() => {
        navigation.addListener('focus', () => {
            DB.getRecipes(onSuccess, onError);
        });
        DB.getRecipes(onSuccess, onError)
    }, [])

    const onSuccess = (tx, results) => {
        FS.getAllImages().then((idToImg) => {
            const tmpData = []
            const len = results.rows.length
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i)
                tmpData.push({key: row.id, title: row.title, uri: idToImg.get(row.id)})
            }
            setData(tmpData)
        }).catch((err) => {
            console.log("Error getting miniature images:", err)
        })
    }

    const onError = (err) => {
        console.log("Error retrieving recipes:", err)
        return false
    }

    return (
        <View style={styles.main}>
            <FlatList
                data={data}
                renderItem={({item, index, separators}) => (
                    <TouchableHighlight
                        key={item.key}
                        onPress={() => navigation.navigate('Recipe', { recipeId: item.key })}
                        onShowUnderlay={separators.highlight}
                        onHideUnderlay={separators.unhighlight}>
                        <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'white'}}>
                            <Image
                                source={{uri: item.uri}}
                                resizeMode={'contain'}
                                style={{width: 40, height: 40, margin: 5}}
                            />
                            <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
                                <Text style={styles.item}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                )}
            />
            <View style={styles.buttonContainer}>
                <FontAwesome.Button
                    iconStyle={styles.icon}
                    style={styles.button}
                    name="plus"
                    onPress={() => navigation.navigate('AddRecipe')}
                    accessibilityLabel="Add recipe"
                />
            </View>
        </View>
    );
}

RecipesScreen.navigationOptions = {
  header: null,
};
const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    item: {
        margin: 5,
        fontSize: 25
    },
    buttonContainer: {
        justifyContent: "center",
        width: "80%",
        marginLeft: "10%",
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        justifyContent:"center"
    },
    icon: {
        marginRight: 0
    }
});

