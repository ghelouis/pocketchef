import React from 'react';
import {StyleSheet, Text, View} from "react-native";

/**
 * Read-only bulleted or numbered list.
 */
export default function StaticList({items, ordered=false}) {

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
                    <Text style={styles.item}>{item.value}</Text>
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
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 5
    },
    bullet: {
        margin: 5
    },
    item: {
        padding: 3,
        width: "90%"
    }
})
