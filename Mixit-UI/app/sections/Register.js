import React from 'react';
import { SafeAreaView } from 'react-native';
import { StyleSheet, Text, View, Image, StatusBar } from 'react-native';



function Login(props) {
    return (
        <View style={styles.container}>
            {/* Icon for search bar */}
            <Image source={require('../assets/icons8-search-50.png')} style={styles.searchIcon}/>

            {/* Logo */}
            <Image source={require('../assets/mixit_square.png')} style={styles.logo}/>
        
            {/* Icon for notifications */}
            <Image source={require('../assets/icons8-notification-50.png')} style={styles.notificationsIcon}/>

            <View style={styles.mainAreaContainer}>
                <Text style={{color: 'white'}}>Main area</Text>
            </View>

        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        // don't let the top bar go over the status bar
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#1B1B1B',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    searchIcon: {
        width: 30,
        height: 30,
        top: 10,
        right: 10,
    },
    logo: {
        width: 100,
        height: 100,
        bottom: 10,
    },
    notificationsIcon: {
        width: 30,
        height: 30,
        top: 10,
        left: 10,
    },
    mainAreaContainer: {
        position: 'absolute',
        backgroundColor: '#2D2D2D',
    }
})

export default Login;