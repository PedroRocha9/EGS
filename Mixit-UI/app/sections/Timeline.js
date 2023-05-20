import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import  Icon  from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';

import Tweet from '../components/Tweet';
import Navbar from '../components/Navbar';
import Add from '../components/Add';

function Timeline({ navigation, state }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="person" size={30} style={styles.profile}/>
      </TouchableOpacity>
      <ScrollView style={styles.tweets}>
        <Tweet user="@johndoe" text="Just had the best pizza ever 🍕😍" imageUrl="https://picsum.photos/400/300"/>
        <View style={styles.separator}/>
        <Tweet user="@janedoe" text="Can't wait for the weekend!" />
        <View style={styles.separator}/>
        <Add  url="http://192.168.31.206:5000/v1/ads?publisher_id=3"/>
        <View style={styles.separator}/>
        <Tweet user="@jack" text="Excited to announce the launch of our new app! 🎉📱" imageUrl="https://picsum.photos/400/300"/>
        <View style={styles.separator}/>
        <Tweet user="@jack" text="Is it friday already?" />
        <View style={styles.separator}/>
        <Add  url="http://192.168.31.206:5000/v1/ads?publisher_id=3"/>
      </ScrollView>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  tweets: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  separator: {
    height: 10,
  },
  profile: {
    marginTop: '3%',
    marginLeft: '90%',
    color: '#E5E9F0',
  },
  webviewContainer: {
    height: 300, // Fixed height for the WebView container
    marginTop: 10,
  },
});

export default Timeline;
