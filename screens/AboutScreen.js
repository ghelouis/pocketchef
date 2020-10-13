import React from "react";
import {ScrollView, StyleSheet, Text} from 'react-native';
import Constants from 'expo-constants';
import i18n from 'i18n-js';
import * as Linking from 'expo-linking';

/**
 * Display information about this app
 */
export default function AboutScreen() {
    const email = "pocketchef@ghelouis.fr"
    const license = "GPLv3"
    const sourceCodeUrl = "https://github.com/ghelouis/pocketchef"

    return (
        <ScrollView>
            <Text style={styles.header}>{Constants.manifest.name}</Text>
            <Text style={styles.subHeader}>v{Constants.manifest.version}</Text>
            <Text style={styles.content}>{i18n.t('about.authorDescription')}</Text>
            <Text style={styles.content}>{i18n.t('about.contactDescription')}
                <Text style={styles.link} onPress={() => Linking.openURL("mailto:" + email)}>: {email}</Text>
            </Text>
            <Text style={styles.content}>License: {license}</Text>
            <Text style={styles.content}>{i18n.t('about.sourceCode')}
                <Text style={styles.link} onPress={() => Linking.openURL(sourceCodeUrl)}>: {sourceCodeUrl}</Text>
            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 18
    },
    subHeader: {
        textAlign: 'center',
        marginBottom: 8,
    },
    content: {
        textAlign: 'center',
        margin: 10
    },
    link: {
        color: 'blue'
    }
})