import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity} from 'react-native';


// interface WelcomeScreenProps {
//     navigation: any;
// }


// function WelcomeScreen(props: WelcomeScreenProps) {
function WelcomeScreen(props) {

    // const toLogin = () => {
    //     props.navigation.navigate("Login");
    // }

    return (
        <View style={styles.container}>
           
           <Image 
                source={require('../assets/mixit_x.png')}
                style={styles.logo}
           />

            <Text style={styles.welcomePhrase}>
                Welcome!
            </Text>

            {/* Image of mixit.png */}
            <Image
                source={require('../assets/mixit_square.png')}
                style={styles.mixitFullLogo}
            />

            {/* Founders names */}
            <Text style={styles.founders}>
                By: Pedro Rocha, André Clérigo, João Amaral e João Viegas
            </Text>

            <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => console.log('Login button pressed')}
                // onPress={toLogin}
                >
                <Text style={styles.loginText}>
                    Login
                </Text>
            </TouchableOpacity>
                
            <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => console.log('Register button pressed')}
                >
                <Text style={styles.registerText}>
                    Register
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2D2D2D',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    logo: {
        width: 100,
        height: 100,
        position: 'absolute',
        top: 80,
    },
    welcomePhrase: {
        fontSize: 20,
        color: '#D9D9D9',
        fontWeight: 'bold',
        position: 'absolute',
        top: 200,
    },
    mixitFullLogo: {
        width: 300,
        height: 300,
        position: 'absolute',
        top: 250,
    },
    founders: {
        fontSize: 12,
        color: '#D9D9D9',
        fontWeight: 'bold',
        position: 'absolute',
        top: 460,
    },
    loginButton: {
        width: '100%',
        height: 70,
        backgroundColor: '#004E64',
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    loginText: {
        fontSize: 20,
        color: '#D9D9D9',
        // TODO
        // textAlign: 'center',
        // Correct this!!!!!!!!!!!!!
        paddingHorizontal: 22,
        fontWeight: 'bold',
        position: 'absolute',
        top: 20,
        left: 150,
    },
    registerButton: {
        width: '100%',
        height: 70,
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#B9383A',
    },
    registerText: {
        fontSize: 20,
        color: '#D9D9D9',
        // TODO
        // textAlign: 'center',
        // Correct this!!!!!!!!!!!!!
        paddingHorizontal: 12,
        fontWeight: 'bold',
        position: 'absolute',
        top: 20,
        left: 150,
    },
})


export default WelcomeScreen;
