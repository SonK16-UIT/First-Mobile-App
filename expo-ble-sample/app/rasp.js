import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Switch, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import HomeHeader2 from '../components/HomeHeader2';
import { useAuth } from '../context/authContext';

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

  const handleUpdateWifi = async () => {
    const result = await updateWifiSSID(id, ssid, password);
    if (result.success) {
      setShowWifiModal(false);
      setShowScanModal(true);
      // setSsid('');
      // setPassword('');
    } else {
      console.error('Failed to update WiFi settings:', result.msg);
    }
  };

  const handleScanDevices = async () => {
    const commandResult = await updateCommand(id, 'scanning');
    if (commandResult.success) {
      const scanResult = await getScannedWithRaspID(id);
      if (scanResult.success) {
        console.log('Scanned devices:', scanResult.data); // Log scanned devices
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
    console.log("Connecting to device:", device);
    const connectResult = await connectToDevice(id, device.addr, device.name);
    if (connectResult.success) {
      console.log('Connected to device:', device);
      // Additional actions upon successful connection, if needed
    } else {
      console.error('Error connecting to device:', connectResult.msg);
    }
  };

    const fetchScannedDevices = async () => {
      const result = await getScannedWithRaspID(id);
      if (result.success) {
        console.log('Fetched scanned devices:', result.data); // Log fetched devices
        setScannedDevices(result.data);
      }
    };
    // fetchScannedDevices();

  useEffect(() => {
    const fetchSensorData = async () => {
      if (user && user.uid) {
        console.log('Fetching data for user:', id);
        const response = await getSensorDataByUserId(id);
        console.log('Response:', response);
        if (response.success && response.data.length > 0) {
          setSensorData(response.data);
          console.log('Sensor Data:', response.data);
        }
      }
    };

    fetchSensorData();
  }, [getSensorDataByUserId, user]);

  const toggleSwitch = async (item) => {
    const newStatus = item.status === 'ON' ? 'OFF' : 'ON';
    const result = await updateStatus(id, item.id, newStatus); // Pass the HubId and item id for updating the status
    if (result.success) {
      console.log('Status updated successfully');
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
          <TextInput
            style={styles.textInput}
            value={`${item.temperature} °C`}
            editable={false}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Nhiệt độ</Text>
            <Text style={styles.description}>Mô tả</Text>
          </View>
  
          <TextInput
            style={styles.textInput}
            value={`${item.humidity} RH`}
            editable={false}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Độ ẩm</Text>
            <Text style={styles.description}>Mô tả</Text>
          </View>
        </>
      ) : item.type === 'toggle' ? (
        <>
          <View style={styles.switchContainer}>
            <Switch
              style={styles.switch}
              onValueChange={() => toggleSwitch(item)}
              value={item.status === 'ON'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Bật tắt đèn</Text>
            <Text style={styles.description}>Mô tả</Text>
          </View>
        </>
      ) : null}
    </View>
  );

  const renderScannedDevice = ({ item }) => (
    <TouchableOpacity style={styles.deviceItem} onPress={() => handleConnectToDevice(item)}>
      <Text>Addr: {item.addr}</Text>
      <Text>Name: {item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <HomeHeader2 title="Quản lý Rasp" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity style={styles.button} onPress={() => setShowWifiModal(true)}>
          <Text style={styles.buttonText}>Thêm thiết bị</Text>
        </TouchableOpacity>

        <FlatList
          data={sensorData}
          renderItem={renderSensorItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>

      <Modal transparent={true} visible={showWifiModal} animationType="slide">
        <View style={styles.centerView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowWifiModal(false)}>
              <Text style={styles.closeButtonText}>X</Text>
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
              <Text style={styles.buttonText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={showScanModal} animationType="slide">
        <View style={styles.centerView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanModal(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanButton} onPress={handleScanDevices}>
              <Text style={styles.buttonText}>Scan thiết bị</Text>
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
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    margin: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 35,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scanButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 20,
  },
  deviceContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    width: 120,
    height: 120,
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 1,
    textAlign: 'center',
    padding: 10,
  },
  switchContainer: {
    width: 120,
    height: 120,
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], // Scale the switch to make it more visible
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
  },
  description: {
    fontFamily: 'outfit',
    color: 'gray', // Replace Colors.GRAY with 'gray'
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  containerScroll: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    gap: 10
  }
});
