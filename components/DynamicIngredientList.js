import React, { useState, useEffect } from 'react';
import {TextInput, StyleSheet, Text, View, FlatList} from "react-native";
import i18n from "i18n-js";

/**
 * Dynamic ingredient list which allows the user to add as many items as they want
 */
export default function DynamicIngredientList({recipeId, loadItems, onUpdateItems}) {
    const [items, setItems] = useState([{key: "0", quantity: undefined, unit: undefined, value: ""}]);
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
            tmpItems.push({key: row.step.toString(), quantity: row.quantity, unit: row.unit, value: row.value})
        }
        tmpItems.sort((a, b) => {
            if (a.step < b.step) return -1
            if (a.step > b.step) return 1
            return 0
        })
        tmpItems.push({key: tmpItems.length.toString(), quantity: undefined, unit: undefined, value: ''})
        refreshParentItems(tmpItems)
        setItems(tmpItems)
    }

    const onLoadItemsError = (t, err) => {
        console.log("Failed to load items with:", err)
    }

    const updateQuantity = (i, newQuantity) => {
        const newItems = [...items]
        newItems[i].quantity = newQuantity
        updateItems(newItems)
    }

    const updateUnit = (i, newUnit) => {
        const newItems = [...items]
        newItems[i].unit = newUnit
        updateItems(newItems)
    }

    const updateValue = (i, newValue) => {
        const newItems = [...items]
        newItems[i].value = newValue
        updateItems(newItems)
    }

    const updateItems = (newItems) => {
        if (newItems[newItems.length - 1].value !== '') {
            newItems.push({key: newItems.length.toString(), value: ''})
        } else {
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
        onUpdateItems(newItems.filter(it => it.value !== '').map((it, index) => {return {quantity: it.quantity, unit: it.unit, value: it.value, step: index}}))
    }

    return (
        <FlatList
            data={items}
            renderItem={({item, index, separators}) => (
                <View style={styles.itemContainer} key={item.key}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <TextInput
                        style={styles.item}
                        value={item.quantity}
                        onChangeText={text => updateQuantity(item.key, text)}
                        placeholder={i18n.t('quantity')}
                    />
                    <TextInput
                        style={styles.item}
                        value={item.unit}
                        onChangeText={text => updateUnit(item.key, text)}
                        placeholder={i18n.t('unit')}
                    />
                    <TextInput
                        style={styles.item}
                        value={item.value}
                        onChangeText={text => updateValue(item.key, text)}
                        placeholder={i18n.t('ingredient')}
                    />
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        width: "30%",
        margin: 5
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
