import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

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
        <TouchableOpacity style={styles.actionButton} >
            <Image source={require('../assets/thumbs-up.png')}/>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Dislike</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
           {/* Share icon */}
           <Image source={require('../assets/share.png')} style={styles.share}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  tweet: {
    backgroundColor: '#2d2d2d',
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
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  tweetContent: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#fff',
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
    backgroundColor: '#2d2d2d',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2d2d2d',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  share: {
    width: 24,
    height: 24,
  },
};

export default Tweet;
