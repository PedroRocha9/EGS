import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useState } from 'react';

function Add({ url }) {
    const [adImage, setAdImage] = useState("");
    const [adRedirect, setAdRedirect] = useState("");

    useEffect(() => {
        fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then((responseJson) => {
            setAdImage(responseJson.ad_creative);
            console.log(responseJson.ad_creative);
            //check if the key ad_redirect exists
            if (responseJson.hasOwnProperty('ad_redirect')) {
                setAdRedirect(responseJson.ad_redirect);
                console.log(responseJson.ad_redirect);
            }
        })
        .catch((error) => {
            console.error(error);
        });     
    }, []);

    const openUrl = (url) => {
        if(url != "") {
            Linking.openURL(url);
        }
    }

    if(adImage == "") {
        return null;
    }

    return (
        <TouchableOpacity onPress={() => openUrl(adRedirect)}>
            <View style={styles.container}>
                <Text style={styles.adtext}>Ad</Text>
                <Image source={{ uri: adImage }} style={styles.image} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: 200,
        width: '100%',
        borderRadius: 10,
    },
    image: {
        flex:1,
        height: null,
        resizeMode: 'contain',
        width: null,
    },
    adtext: {
        color: 'black',
        fontSize:20,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor:'gray'
    }
});

export default Add;