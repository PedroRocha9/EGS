import React from 'react';
import { SafeAreaView } from 'react-native';
import { StyleSheet, TouchableOpacity, Text, TextInput, View, Image, StatusBar } from 'react-native';

function Login(props) {
    return (
        <View style={styles.containerGeneric}>
            <View style={styles.containerTopBar}>
                {/* Search */}
                <TouchableOpacity>
                    <Image source={require('../assets/search.png')} style={styles.search}/>
                </TouchableOpacity>
                {/* Logo */}
                <Image source={require('../assets/mixit_square.png')} style={styles.logo}/>
                {/* Notifications */}
                <TouchableOpacity>
                    <Image source={require('../assets/notifications.png')} style={styles.notifications}/>
                </TouchableOpacity>
            </View>

            

            <View style={styles.containerLoginArea}>
                {/* Logo image */}
                <Image source={require('../assets/mixit_x.png')} style={styles.smallLogo}/>
                <Text style={styles.loginText}>Username</Text>
                <TextInput style={styles.inputUser} placeholder="Username"/>
                <Text style={[styles.passwordText, {marginTop: 20}]}>Password</Text>
                <TextInput style={styles.inputPass} placeholder="Password" secureTextEntry={true}/>
                <TouchableOpacity style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Login</Text>

                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerGeneric: {
        backgroundColor: '#DBDBDB',
        flex: 1,
    },
    containerTopBar: {
        backgroundColor: '#1B1B1B',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: StatusBar.currentHeight,
    },
    search: {
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
    notifications: {
        width: 30,
        height: 30,
        top: 10,
        left: 10,
    },
    containerLoginArea: {
        backgroundColor: '#2D2D2D',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallLogo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },

    loginText: {
        color: '#dbdbdb',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    passwordText: {
        color: '#dbdbdb',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputUser: {
        backgroundColor: '#FFF',
        width: 300,
        height: 40,
        borderRadius: 10,
        marginBottom: 10,
        paddingLeft: 10,
        
    },
    inputPass: {
        backgroundColor: '#FFF',
        width: 300,
        height: 40,
        borderRadius: 10,
        marginBottom: 80,
        paddingLeft: 10,
    },
    loginButton: {
        backgroundColor: '#B9383A',
        width: 300,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#dbdbdb',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Login;
