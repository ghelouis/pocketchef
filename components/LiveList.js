import React, { useState, useEffect } from 'react';
import {TextInput, StyleSheet, Text, View, FlatList} from "react-native";

/**
 * Dynamic list which allows the user to add as many items as they want
 */
export default function LiveList({recipeId, loadItems, onUpdateItems}) {
    const [items, setItems] = useState([{key: "0", value: ""}]);
    useEffect(() => {
        if (loadItems) {
            loadItems(recipeId, onLoadItemsSuccess, onLoadItemsError)
        }
    }, [])

    const onLoadItemsSuccess = (tx, results) => {
        const len = results.rows.length
        const tmpItems = []
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i)
            tmpItems.push({key: i.toString(), value: row.value})
        }
        tmpItems.push({key: tmpItems.length.toString(), value: ''})
        setItems(tmpItems)
    }

    const onLoadItemsError = (t, err) => {
        console.log("Failed to load items with:", err)
    }

    const updateItems = (i, newValue) => {
        const newItems = [...items]
        newItems[i] = {key: i, value: newValue}
        if (newItems[newItems.length - 1].value !== '') {
            newItems.push({key: newItems.length.toString(), value: ''})
        } else {
            let j = newItems.length - 1
            while (j > 0 && newItems[j].value === '' && newItems[j - 1].value === '') {
                newItems.pop()
                j--
            }
        }
        onUpdateItems(newItems.filter(it => it.value !== '').map(it => it.value))
        setItems(newItems)
    }

    return (
        <FlatList
            data={items}
            renderItem={({item, index, separators}) => (
                <View style={styles.itemContainer} key={item.key}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <TextInput
                        style={styles.item}
                        value={item.value}
                        onChangeText={text => updateItems(item.key, text)}
                    />
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    main: {
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 5
    },
    bullet: {
        margin: 5
    },
    item: {
        borderWidth: 1,
        borderRadius: 3,
        padding: 3,
        width: "70%",
        borderColor: 'lightgrey'
    }
})
