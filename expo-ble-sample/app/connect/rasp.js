import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/authContext';
import { AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Rasp() {
  const route = useRoute();
  const { id } = route.params;
  const router = useRouter();
  const { getSensorDataByUserId, user, updateStatus, fetchHubName } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [toggles, setToggles] = useState([]);
  const [raspName, setRaspName] = useState('');

  useEffect(() => {
    const fetchHubAndSensorData = async () => {
      if (user && user.uid) {
        // Fetch Hub Name
        const hubNameResult = await fetchHubName(id);
        if (hubNameResult.success) {
          setRaspName(hubNameResult.name);
        } else {
          console.error('Failed to fetch hub name:', hubNameResult.msg);
        }

        // Fetch Sensor Data
        const response = await getSensorDataByUserId(id);
        if (response.success && response.data.length > 0) {
          const sensorList = response.data.filter(device => device.type === 'sensor');
          const toggleList = response.data.filter(device => device.type === 'toggle');
          setSensors(sensorList);
          setToggles(toggleList);
        }
      }
    };

    fetchHubAndSensorData();
  }, [getSensorDataByUserId, user, id, fetchHubName]);

  const toggleSwitch = async (item) => {
    const newStatus = item.status === 'ON' ? 'OFF' : 'ON';
    const result = await updateStatus(id, item.id, newStatus);
    if (result.success) {
      setToggles(prevState =>
        prevState.map(device =>
          device.id === item.id ? { ...device, status: newStatus } : device
        )
      );
    } else {
      console.error('Failed to update status:', result.msg);
    }
  };

  const renderSensorItem = ({ item }) => (
    <View style={styles.sensorRow}>
      <View style={styles.sensorBox}>
        <Feather name="thermometer" size={30} color="white" />
        <Text style={{ color: 'white', fontSize: 14 }}>Temperature</Text>
        <View style={styles.sensorTextContainer}>
          <Text style={styles.sensorLabel}>{item.name}</Text>
          <Text style={styles.sensorValue}>{item.temperature}°C</Text>
        </View>
      </View>
      <View style={styles.sensorBox}>
        <Feather name="droplet" size={30} color="white" />
        <Text style={{ color: 'white', fontSize: 14 }}>Humidity</Text>
        <View style={styles.sensorTextContainer}>
          <Text style={styles.sensorLabel}>{item.name}</Text>
          <Text style={styles.sensorValue}>{item.humidity}%</Text>
        </View>
      </View>
    </View>
  );

  const renderToggleItem = ({ item }) => (
    <View style={styles.deviceContainer}>
      <View style={styles.switchBox}>
        <FontAwesome name="lightbulb-o" size={48} color={item.status === 'ON' ? "white" : "black"} />
        <View style={styles.sensorTextContainer}>
          <Text style={styles.sensorLabel}>{item.name}</Text>
          <Switch
            onValueChange={() => toggleSwitch(item)}
            value={item.status === 'ON'}
          />
          {/* <Text style={styles.sensorValue}>{item.status}</Text> */}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('home')}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{raspName}</Text>
      </View>
      <FlatList
        data={sensors}
        renderItem={renderSensorItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={1}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />
      <FlatList
        data={toggles}
        renderItem={renderToggleItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />
      <Link href={{ pathname: "/connect/modal", params: { id } }} style={styles.floatingButton}>
        <LinearGradient colors={['#F3B28E', '#F8757C']} style={styles.floatingButtonGradient}>
          <View style={styles.floatingButtonOverlay}>
            <AntDesign name="plus" size={30} color="white" />
          </View>
        </LinearGradient>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
  },
  sensorTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1F233A',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  deviceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
    paddingLeft: 22,
    marginVertical: 10,
  },
  sensorBox: {
    backgroundColor: '#2B2F3A',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '45%',
    marginVertical: 10,
  },
  switchBox: {
    backgroundColor: '#2B2F3A',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  sensorValue: {
    color: 'white',
    fontSize: 16,
    paddingLeft: 5,
    marginVertical: 10,
  },
  sensorLabel: {
    color: 'gray',
    fontSize: 12,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  floatingButtonGradient: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  floatingButtonOverlay: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flatListContent: {
    paddingBottom: 80,
  },
});
