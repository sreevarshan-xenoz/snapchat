import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getFirebaseDb } from '../../config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendsLocations, setFriendsLocations] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.user);
  const db = getFirebaseDb();

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);

        // Update user's location in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          location: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            lastUpdated: new Date().toISOString(),
          },
        });

        // Set up real-time location updates
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 10, // Update if moved 10 meters
          },
          (newLocation) => {
            setLocation(newLocation);
            updateDoc(doc(db, 'users', user.uid), {
              location: {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                lastUpdated: new Date().toISOString(),
              },
            });
          }
        );

        // Fetch friends' locations
        const friendsIds = friends.map((friend) => friend.uid);
        if (friendsIds.length > 0) {
          const usersQuery = query(
            collection(db, 'users'),
            where('uid', 'in', friendsIds)
          );

          const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const locations = [];
            snapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.location) {
                locations.push({
                  uid: userData.uid,
                  username: userData.username,
                  photoURL: userData.photoURL,
                  location: userData.location,
                });
              }
            });
            setFriendsLocations(locations);
            setLoading(false);
          });

          return () => {
            locationSubscription.remove();
            unsubscribe();
          };
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error setting up location:', error);
        setErrorMsg('Failed to get location');
        setLoading(false);
      }
    })();
  }, [db, user.uid, friends]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFC00" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#FFFC00" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setErrorMsg(null);
            setLoading(true);
            // Retry location permission
            Location.requestForegroundPermissionsAsync();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {friendsLocations.map((friend) => (
            <Marker
              key={friend.uid}
              coordinate={{
                latitude: friend.location.latitude,
                longitude: friend.location.longitude,
              }}
              title={friend.username}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={
                    friend.photoURL
                      ? { uri: friend.photoURL }
                      : require('../../../assets/default-avatar.png')
                  }
                  style={styles.markerImage}
                />
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to get your location</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFC00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  markerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

export default MapScreen; 