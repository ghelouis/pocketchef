import React, { useState, useEffect } from 'react';
import {TextInput, StyleSheet, Text, View} from "react-native";

/**
 * Dynamic list which allows the user to add as many items as they want
 */
export default function DynamicList({recipeId, loadItems, onUpdateItems, multiline=false, ordered=false}) {
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
            tmpItems.push({key: row.step.toString(), value: row.value})
        }
        tmpItems.sort((a, b) => {
            if (a.step < b.step) return -1
            if (a.step > b.step) return 1
            return 0
        })
        tmpItems.push({key: tmpItems.length.toString(), value: ''})
        refreshParentItems(tmpItems)
        setItems(tmpItems)
    }

    const onLoadItemsError = (t, err) => {
        console.log("Failed to load items with:", err)
    }

    const updateItems = (i, newValue) => {
        const newItems = [...items]
        newItems[i] = {key: i, value: newValue}
        // add new item at the end if the last one is not empty
        if (newItems[newItems.length - 1].value !== '') {
            newItems.push({key: newItems.length.toString(), value: ''})
        } else {
            // remove all trailing empty items until there is only one left
            let j = newItems.length - 1
            while (j > 0 && newItems[j].value === '' && newItems[j - 1].value === '') {
                newItems.pop()
                j--
            }
        }
        refreshParentItems(newItems)
        setItems(newItems)
    }

    const refreshParentItems = (newItems) => {
        onUpdateItems(newItems.filter(it => it.value !== '').map((it, index) => {return {value: it.value, step: index}}))
    }

    const getBullet = (index) => {
        if (ordered) {
            return index + 1 + '.'
        }
        return '\u2022'
    }

    const renderList = () => {
        return items.map((item, index) => {
            return (
                <View style={styles.itemContainer} key={item.key}>
                    <Text style={styles.bullet}>{getBullet(index)}</Text>
                    <TextInput
                        style={styles.item}
                        value={item.value}
                        onChangeText={text => updateItems(item.key, text)}
                        multiline={multiline}
                    />
                </View>
            )
        })
    }

    return (
        <View>
            {renderList()}
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'center'
    },
    bullet: {
        margin: 5
    },
    item: {
        borderWidth: 1,
        borderRadius: 3,
        padding: 5,
        width: "70%",
        borderColor: 'lightgrey'
    }
})
