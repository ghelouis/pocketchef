import React from 'react';
import {StyleSheet, Text, View, FlatList} from "react-native";

/**
 * Fixed unordered list.
 */
export default function StaticList({items}) {

   return (
        <FlatList
            data={items}
            renderItem={({item, index, separators}) => (
                <View style={styles.itemContainer} key={item.key}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={styles.item}>{item.value}</Text>
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
        padding: 3,
        width: "50%"
    }
})
