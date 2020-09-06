import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native';
import i18n from "i18n-js";
import TextButton from "../components/TextButton";
import {getRecipesFromDB} from "../utils/database";
import {getAllImages} from "../utils/images";

/**
 * List all recipes
 */
export default function RecipesScreen({ navigation }) {
    const [data, setData] = useState([])
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
                tmpData.push({key: row.id, title: row.title, uri: idToImg.get(row.id)})
            }
            setData(tmpData.sort((a, b) => {
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

    return (
        <View style={styles.main}>
            <FlatList
                data={data}
                renderItem={({item, index, separators}) => (
                    <TouchableHighlight
                        key={item.key}
                        onPress={() => navigation.navigate('Recipe', {title: item.title, recipeId: item.key})}
                        onShowUnderlay={separators.highlight}
                        onHideUnderlay={separators.unhighlight}>
                        <View style={styles.itemContainer}>
                            <Image
                                source={{uri: item.uri}}
                                resizeMode={'contain'}
                                style={styles.image}
                            />
                            <View
                                style={index === data.length - 1 ? styles.itemWrapper : styles.itemWrapperWithBottomBorder}>
                                <Text style={styles.item}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                )}
            />
            <TextButton
                title={i18n.t('new')}
                onPress={() => navigation.navigate('AddRecipe')}
            />
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
    }
});

