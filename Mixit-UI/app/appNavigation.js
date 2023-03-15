import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from './sections/WelcomeScreen';

const { Navigator, Screen } = createStackNavigator();

const AppNavigator = () => (
    <NavigationContainer>
        <Navigator headerMode="none" initialRouteName='WelcomeScreen'>
            <Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Screen name="Login" component={Login} />
        </Navigator>
    </NavigationContainer>
)

export default AppNavigator;