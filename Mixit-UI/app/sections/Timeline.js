import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Tweet from '../components/Tweet';
import Navbar from '../components/Navbar';

function Timeline({ navigation, state }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.tweets}>
        <Tweet user="@johndoe" text="Just had the best pizza ever 🍕😍" imageUrl="https://picsum.photos/400/300"/>
        <View style={styles.separator}/>
        <Tweet user="@janedoe" text="Can't wait for the weekend!" />
        <View style={styles.separator}/>
        <Tweet user="@jack" text="Excited to announce the launch of our new app! 🎉📱" imageUrl="https://picsum.photos/400/300"/>
        <View style={styles.separator}/>
        <Tweet user="@jack" text="Is it friday already?" />
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
});

export default Timeline;
