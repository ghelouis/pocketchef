import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, Button } from 'react-native';

import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");

export default function RecipesScreen({ navigation }) {

    const [data, setData] = useState([])

    const onSuccess = (tx, results) => {
        const tmpData = []
        const len = results.rows.length
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i)
            tmpData.push({key: row.id, title: row.title})
        }
        setData(tmpData)
    }

    const onError = (err) => {
        console.log("onError: ", err)
        return false
    }

    db.transaction(tx => {
        tx.executeSql('SELECT id, title FROM recipes', [], onSuccess, onError)
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={({item}) => <Text style={styles.item}>{item.title}</Text>}
            />
            <Button
                onPress={() => navigation.navigate('AddRecipe')}
                title="Add recipe"
                accessibilityLabel="Add recipe"
            />
        </View>
    );
}

RecipesScreen.navigationOptions = {
  header: null,
};
const styles = StyleSheet.create({
});

