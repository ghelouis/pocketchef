import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RecipesScreen from './screens/RecipesScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import RecipeScreen from './screens/RecipeScreen';
import EditRecipeScreen from './screens/EditRecipeScreen';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import frLangFile from './languages/fr.json'
import enLangFile from './languages/en.json'
import {initDB} from "./utils/database";
import {createRecipesDir} from "./utils/images";

i18n.translations = {
  en: enLangFile,
  fr: frLangFile
};
i18n.locale = Localization.locale;
i18n.fallbacks = true;

const Stack = createStackNavigator();

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  const onInitComplete = () => {
    console.log("DB init successful")
    createRecipesDir()
    setLoadingComplete(true)
  }
  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    initDB(onInitComplete)
  }, [])

  if (!isLoadingComplete) {
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
                options={{ title: i18n.t('recipes') }}
            />
            <Stack.Screen
                name="AddRecipe"
                component={AddRecipeScreen}
                options={{ title: i18n.t('addRecipe') }}
            />
            <Stack.Screen
                name="Recipe"
                component={RecipeScreen}
            />
            <Stack.Screen
                name="EditRecipe"
                component={EditRecipeScreen}
                options={{ title: i18n.t('editRecipe') }}
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