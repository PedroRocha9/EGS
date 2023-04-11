import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from './app/appNavigation';

import WelcomeScreen from './app/sections/WelcomeScreen';
import Login from './app/sections/Login';
import Register from './app/sections/Register';
import Profile from './app/sections/Profile';
import Timeline from './app/sections/Timeline';
import Search from './app/sections/Search';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />

        <Stack.Screen name="Timeline" component={Timeline} />
        <Stack.Screen name="Search" component={Search} />
        
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
    // <WelcomeScreen/>
    // <Login/>
    // <Register/>
    //<Timeline/>
    //<Profile/>
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
