import React from 'react';
import { StyleSheet, TouchableOpacity, Text, TextInput, View, Image } from 'react-native';

function Tweet({ user, text, imageUrl }) {
  return (
    <View style={styles.tweet}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user}</Text>
        <Image source={require('../assets/profile-placeholder.png')} style={styles.avatar}/>
      </View>
      <View style={styles.tweetContent}>
        <Text style={styles.text}>{text}</Text>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image}/>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Dislike</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Home(props) {
  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
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

      {/* Tweets */}
      <View style={styles.tweets}>
        <Tweet user="@johndoe" text="Just had the best pizza ever 🍕😍" imageUrl="https://picsum.photos/400/300"/>
        <View style={styles.separator}/>
        <Tweet user="@janedoe" text="Can't wait for the weekend!" />
        <View style={styles.separator}/>
        <Tweet user="@jack" text="Excited to announce the launch of our new app! 🎉📱" imageUrl="https://picsum.photos/400/300"/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBDB',
  },
  topBar: {
    backgroundColor: '#1B1B1B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
  },
  search: {
    width: 30,
    height: 30,
    tintColor: '#dbdbdb',
  },
  logo: {
    width: 100,
    height: 100,
    tintColor: '#dbdbdb',
  },
  notifications: {
    width: 30,
    height: 30,
    tintColor: '#dbdbdb',
  },
  tweets: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  tweet: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    },
    username: {
    fontWeight: 'bold',
    fontSize: 16,
    },
    tweetContent: {
    marginBottom: 10,
    },
    text: {
    fontSize: 16,
    },
    image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
    },
    actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    },
    actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#DBDBDB',
    marginHorizontal: 5,
    },
    actionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    },
    separator: {
    height: 10,
    },
    });
    
    export default Home;