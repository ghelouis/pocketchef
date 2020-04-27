import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RecipesScreen from './screens/RecipesScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';

const Stack = createStackNavigator();

import { openDatabase } from "expo-sqlite";
const db = openDatabase("PocketChefDB.db");
db.transaction(tx => {
  // TODO: add NOT NULL to all
  // TODO: add first screen with no nav to enter name 'Chef's name: '
  // TODO: display Chef's name constantly on app *chef-hat* <name> -> clicking on it allows to change name or log in as someone else?
  tx.executeSql('CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT)');
  tx.executeSql('CREATE TABLE IF NOT EXISTS recipes(id TEXT PRIMARY KEY, title TEXT, ingredients TEXT, instructions TEXT, userId TEXT, FOREIGN KEY(userId) REFERENCES users(id))')
});

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
                name="Recipes"
                component={RecipesScreen}
                options={{ title: 'Recipes' }}
            />
            <Stack.Screen
                name="AddRecipe"
                component={AddRecipeScreen}
                options={{ title: 'Add recipe' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
