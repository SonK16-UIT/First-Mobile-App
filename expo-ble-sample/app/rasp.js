import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Switch } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


export default function Rasp() {
  const route = useRoute();
  const { id } = route.params;
  const { updateWifiSSID, updateCommand, getScannedWithRaspID, getSensorDataByUserId, user, updateStatus, connectToDevice } = useAuth();

  const [showWifiModal, setShowWifiModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [scannedDevices, setScannedDevices] = useState([]);
  const [sensorData, setSensorData] = useState([]);

  const router = useRouter();

  const handleChevron = () => {
    router.replace('home');
  };

  const handleUpdateWifi = async () => {
    const result = await updateWifiSSID(id, ssid, password);
    if (result.success) {
      setShowWifiModal(false);
      setShowScanModal(true);
    } else {
      console.error('Failed to update WiFi settings:', result.msg);
    }
  };

  const handleScanDevices = async () => {
    const commandResult = await updateCommand(id, 'scanning');
    if (commandResult.success) {
      const scanResult = await getScannedWithRaspID(id);
      if (scanResult.success) {
        setScannedDevices(scanResult.data);
        fetchScannedDevices();
      } else {
        console.error('Failed to fetch scanned devices:', scanResult.msg);
      }
    } else {
      console.error('Failed to update command:', commandResult.msg);
    }
  };

  const handleConnectToDevice = async (device) => {
    const connectResult = await connectToDevice(id, device.addr, device.name);
    if (connectResult.success) {
      console.log('Connected to device:', device);
    } else {
      console.error('Error connecting to device:', connectResult.msg);
    }
  };

  const fetchScannedDevices = async () => {
    const result = await getScannedWithRaspID(id);
    if (result.success) {
      setScannedDevices(result.data);
    }
  };

  useEffect(() => {
    const fetchSensorData = async () => {
      if (user && user.uid) {
        const response = await getSensorDataByUserId(id);
        if (response.success && response.data.length > 0) {
          setSensorData(response.data);
        }
      }
    };

    fetchSensorData();
  }, [getSensorDataByUserId, user]);

  const toggleSwitch = async (item) => {
    const newStatus = item.status === 'ON' ? 'OFF' : 'ON';
    const result = await updateStatus(id, item.id, newStatus);
    if (result.success) {
      setSensorData(prevState =>
        prevState.map(device =>
          device.id === item.id ? { ...device, status: newStatus } : device
        )
      );
    } else {
      console.error('Failed to update status:', result.msg);
    }
  };

  const renderSensorItem = ({ item }) => (
    <View style={styles.deviceContainer}>
      {item.type === 'sensor' ? (
        <>
          <View style={styles.sensorBox}>
            <Feather name="thermometer" size={30} color="white" />
            <Text style={styles.sensorValue}>{item.temperature}°C</Text>
            <Text style={styles.sensorLabel}>Temperature</Text>
          </View>
          <View style={styles.sensorBox}>
            <Feather name="droplet" size={30} color="white" />
            <Text style={styles.sensorValue}>{item.humidity}%</Text>
            <Text style={styles.sensorLabel}>Humidity</Text>
          </View>
        </>
      ) : (
        <View style={styles.switchBox}>
          <Text style={styles.sensorLabel}>{item.name}</Text>
          <Switch
            onValueChange={() => toggleSwitch(item)}
            value={item.status === 'ON'}
          />
          <Text style={styles.sensorValue}>{item.status}</Text>
        </View>
      )}
    </View>
  );

  const renderScannedDevice = ({ item }) => (
    <TouchableOpacity style={styles.deviceItem} onPress={() => handleConnectToDevice(item)}>
      <Text style={styles.deviceText}>Addr: {item.addr}</Text>
      <Text style={styles.deviceText}>Name: {item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChevron}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bedroom</Text>
      </View>
      <FlatList
        data={sensorData}
        renderItem={renderSensorItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
      />


      <TouchableOpacity style={styles.floatingButton} onPress={() => setShowWifiModal(true)}>
          <LinearGradient
            colors={['#F3B28E', '#F8757C']}
            style={styles.floatingButtonGradient}
          >
            <View style={styles.floatingButtonOverlay}>
              <AntDesign name="plus" size={30} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

      <Modal transparent={true} visible={showWifiModal} animationType="slide">
        <View style={styles.centerView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowWifiModal(false)}>
              <AntDesign name="close" size={25} color="white" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="SSID"
              value={ssid}
              onChangeText={setSsid}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdateWifi}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={showScanModal} animationType="slide">
        <View style={styles.centerView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanModal(false)}>
              <AntDesign name="close" size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanDevices}>
              <Text style={styles.buttonText}>Scan Devices</Text>
            </TouchableOpacity>
            <FlatList
              data={scannedDevices}
              renderItem={renderScannedDevice}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1F233A',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  deviceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
    marginVertical: 10,
  },
  sensorBox: {
    backgroundColor: '#2B2F3A',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
    marginVertical: 10,
  },
  sensorLabel: {
    color: 'gray',
    fontSize: 14,
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
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#2B2F3A',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
    color: 'white',
  },
  modalButton: {
    backgroundColor: '#F8757C',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#F8757C',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceText: {
    color: 'white',
  },
});
