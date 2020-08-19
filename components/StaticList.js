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
                    <Text>{getBullet(index)} {item.value}</Text>
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
        marginBottom: 5,
        marginLeft: 10,
        marginRight: 10
    }
})
