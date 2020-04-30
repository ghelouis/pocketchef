import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'

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

    DB.getRecipes(onSuccess, onError)

    return (
        <View style={styles.main}>
            <FlatList
                data={data}
                renderItem={({item}) => <Text style={styles.item}>{item.title}</Text>}
            />
            <View style={styles.buttonContainer}>
                <FontAwesome.Button
                    style={styles.button}
                    name="plus"
                    onPress={() => navigation.navigate('AddRecipe')}
                    accessibilityLabel="Add recipe"
                /></View>
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
        width: "70%",
        marginLeft: "15%",
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        justifyContent:"center"
    },
});

