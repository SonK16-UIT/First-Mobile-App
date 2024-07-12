import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useAuth } from '../../context/authContext';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const ios = Platform.OS === 'ios';

export default function Home() {
  const { user, activateHub, activeError, getRaspDataByUserId, DeleteActivation, createHub } = useAuth();
  const { top } = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [devices, setDevices] = useState([]);
  const navigation = useNavigation();

  const handleActivateCode = async () => {
    await activateHub(code, user.uid);
    if (!activeError) {
      setTimeout(() => {
        setShowModal(false);
        fetchData(); // Fetch data again to update the list
      }, 1000); // 1 second delay
    }
  };

  const handleDelete = async (raspId) => {
    const result = await DeleteActivation(raspId);
    if (result.success) {
      fetchData(); // Refresh the list after deletion
    }
  };

  const fetchData = async () => {
    if (user && user.uid) {
      try {
        console.log("Fetching data for user:", user.uid);
        const result = await getRaspDataByUserId(user.uid);
        if (result.success) {
          console.log("Fetched device data:", result.data);
          setDevices(result.data);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
      }
    } else {
      console.log("User is not loaded yet");
    }
  };

  useEffect(() => {
    console.log("User state changed:", user);
    if (user) {
      fetchData();
    }
  }, [user]);

  const renderItem = ({ item }) => (
    <View style={styles.box}>
      <TouchableOpacity onPress={() => navigation.navigate('rasp', { id: item.id })}>
        <Text style={styles.title}>Rasp ID: {item.id}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleDelete(item.id)}>
        <Text style={styles.buttonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: ios ? top : top + 10 }}>
      <View style={styles.main}>
        <Modal transparent={true} visible={showModal} animationType="slide">
          <View style={styles.centerView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã"
                value={code}
                onChangeText={setCode}
              />
              {activeError && <Text style={styles.errorText}>{activeError}</Text>}
              <TouchableOpacity style={styles.button} onPress={handleActivateCode}>
                <Text style={styles.buttonText}>Kích hoạt code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
            <Text style={styles.buttonText}>Thêm hub</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  buttonView: {
    justifyContent: 'flex-start',
    padding: 20,
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
    width: wp('80%'),
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  box: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
