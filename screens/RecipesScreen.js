import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DB from '../database/Database'

/**
 * List all recipes
 */
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
        console.log("Error retrieving recipes:", err)
        return false
    }

    DB.getRecipes(onSuccess, onError)

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
                        <View style={{backgroundColor: 'white'}}>
                            <Text style={styles.item}>{item.title}</Text>
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

