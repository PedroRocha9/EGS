import React from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, StatusBar} from 'react-native';
import { WebView } from 'react-native-webview';

function Profile(props) {
    return (
        <View style={styles.container}>
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

            <View style={styles.topContainer}>  
                <View style={styles.profileInfoContainer}>
                    <Image source={require('../assets/profile-placeholder.png')} style={styles.profilePic} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.nameText}>John Doe</Text>
                        <Text style={styles.handlerText}>@johndoe</Text>
                        <View style={styles.locationContainer}>
                            <Image source={require('../assets/location.png')} style={styles.locationIcon} />
                            <Text style={styles.locationText}>New York, USA</Text>
                        </View>
                    </View>
            </View>

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.webviewContainer}>
                <WebView source={{ uri: 'https://www.google.com/' }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerTopBar: {
        backgroundColor: '#1B1B1B',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: StatusBar.currentHeight,
    },
    topContainer: {
        backgroundColor: '#1B1B1B',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: "12%"
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
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 10,
    },
    profileInfo: {
        justifyContent: 'center',
    },
    nameText: {
        color: '#dbdbdb',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    handlerText: {
        color: '#dbdbdb',
        fontSize: 14,
        marginBottom: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        width: 10,
        height: 10,
        marginRight: 5,
    },
    locationText: {
        color: '#dbdbdb',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#B9383A',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    editButtonText: {
        color: '#dbdbdb',
        fontSize: 14,
        fontWeight: 'bold',
    },
    webviewContainer: {
        flex: 1,
        marginTop: 10,
    },
});

export default Profile;