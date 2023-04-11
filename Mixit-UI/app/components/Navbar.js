import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';

function Navbar({ navigation, state }) {
  return (
    <View style={styles.navbar}>
      {/* Home button */}
      <TouchableOpacity
        style={[
          styles.navButton,
          state.index === 0 && styles.activeNavButton
        ]}
        onPress={() => navigation.navigate('Home')}
      >
        <Image source={require('../assets/home.png')} style={styles.navIcon}/>
        <Text style={[styles.navButtonText, state.index === 0 && styles.activeNavButtonText]}>Home</Text>
      </TouchableOpacity>

      {/* Profile button */}
      <TouchableOpacity
        style={[
          styles.navButton,
          state.index === 1 && styles.activeNavButton
        ]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image source={require('../assets/profile-placeholder.png')} style={styles.navIcon}/>
        <Text style={[styles.navButtonText, state.index === 1 && styles.activeNavButtonText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#1B1B1B',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  navButtonText: {
    color: '#dbdbdb',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  activeNavButton: {
    backgroundColor: '#1DA1F2',
  },
  activeNavButtonText: {
    color: '#fff',
  },
  navIcon: {
    width: 20,
    height: 20,
    tintColor: '#dbdbdb',
  },
});

export default Navbar;
