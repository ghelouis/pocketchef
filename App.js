import * as React from 'react';
import {Platform, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
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
import AboutScreen from "./screens/AboutScreen";
import {FontAwesome5} from "@expo/vector-icons";

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
                options={({navigation}) => ({
                    title: i18n.t('recipes'),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('About')}>
                            <FontAwesome5
                                style={styles.headerButton}
                                name={"info-circle"}/>
                        </TouchableOpacity>
                    )
                })
                }
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
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: i18n.t('about.title') }}
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
  headerButton: {
    color: '#2b2b2b',
    fontSize: 20,
    marginRight: 10
  }
});