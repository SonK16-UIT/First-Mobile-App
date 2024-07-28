import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuth } from '../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile() {
  const { user, fetchUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsername = async () => {
      const response = await fetchUsername();
      if (response.success) {
        setUsername(response.username);
      } else {
        setError(response.msg);
      }
    };
    loadUsername();
  }, []);

  return (
    <LinearGradient
      colors={['#1F233A', '#1F233A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.profileContainer}>
        <Image
          style={styles.userImg}
          source={{ uri: 'https://picsum.photos/seed/696/3000/2000' }}
        />
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userLocation}>{user.email}</Text>
            <Text style={styles.userDescription}></Text>
          </>
        )}
        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>1</Text>
            <Text style={styles.userInfoSubTitle}>Số hub</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>2</Text>
            <Text style={styles.userInfoSubTitle}>Số thiết bị</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  userImg: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userLocation: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  userDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfoSubTitle: {
    fontSize: 16,
    color: '#ccc',
  },
});
