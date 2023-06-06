import React, {useState} from 'react'
import { StyleSheet, TouchableOpacity, Text, TextInput, View, Image, StatusBar, Button, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';

function Login({navigation}) {

    const [showWebView, setShowWebView] = useState(false);
    const [authUrl, setAuthUrl] = useState(''); // hold url to authenticate
  
    const handleAuth = (url) => {
      setAuthUrl(url);
      setShowWebView(true);
      setTimeout(() => {
        setShowWebView(false);
      }, 5000);  // Close WebView after 5 seconds
    };
  
    const handleGoogleAuth = () => handleAuth('https://google.com/');
    const handleGithubAuth = () => handleAuth('https://github.com/');
  
    
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
                
                <TouchableOpacity style={styles.loginButton} 
                onPress={() => navigation.navigate('Home', {screen: 'Timeline'})}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.container}>
                    <TouchableOpacity style={styles.button} onPress={handleGoogleAuth}>
                        <Icon name="google" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Login with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleGithubAuth}>
                        <Icon name="github" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Login with Github</Text>
                    </TouchableOpacity>

                    <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
                        <WebView
                        source={{ uri: authUrl }} 
                        style={{ marginTop: 20 }}
                        onNavigationStateChange={({ url }) => {
                            // you can check url here to decide when to close the modal
                        }}
                        />
                        <Button title="Close" backgroundColor='#B9383A' onPress={() => setShowWebView(false)} />
                    </Modal>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.createAccountText}>I don't have an account yet!</Text>
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
    createAccountText: {
        color: '#dbdbdb',
        fontSize: 16,
        marginBottom: '10%',
        textDecorationLine: 'underline',
    },
    container:  {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#004E64',
        padding: 10,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
      },
      buttonText: {
        color: '#FFFFFF',
        marginLeft: 10,
      },
});

export default Login;
