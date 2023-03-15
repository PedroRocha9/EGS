import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

import Login from './app/sections/Login';
import Register from './app/sections/Register';

import AppNavigator from './app/appNavigation';
import WelcomeScreen from './app/sections/WelcomeScreen';

export default function App() {
  return (
    // <NavigationContainer>
      // <AppNavigator/>
    // </NavigationContainer>
    <WelcomeScreen/>
    // <Login/>
    // <Register/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
