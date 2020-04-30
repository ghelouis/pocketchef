import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RecipesScreen from './screens/RecipesScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import DB from './database/Database'

const Stack = createStackNavigator();

DB.init()

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();
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
