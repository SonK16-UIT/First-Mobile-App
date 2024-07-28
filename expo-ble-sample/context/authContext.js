import React, { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from "../firebaseConfig";
import { ref, set, get, update, query, orderByChild, equalTo, push } from "firebase/database";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [activeError, setActiveError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Email không hợp lệ!';
      if (msg.includes('(auth/wrong-password)')) msg = 'Sai mật khẩu!';
      if (msg.includes('(auth/invalid-credential)')) msg = 'Sai mật khẩu!'
      console.error('Login error:', e);
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (e) {
      console.error('Logout error:', e);
      return { success: false, msg: e.message };
    }
  };

  const register = async (email, password, username) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, 'users/' + response.user.uid), {
        username,
        email,
      });
      return { success: true, data: response.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Email không hợp lệ!';
      if (msg.includes('(auth/email-already-in-use)')) msg = 'Email này đã dùng!';
      console.error('Error during registration:', e);
      return { success: false, msg };
    }
  };

  const activateHub = async (activeID, userID) => {
      if (!activeID || !userID) {
        throw new Error("Invalid ActivationCode or userID");
      }
  
      const hubsRef = ref(db, 'Hub');
      const hubsQuery = query(hubsRef, orderByChild('activation'), equalTo(activeID));
      const snapshot = await get(hubsQuery);
  
      if (snapshot.exists()) {
        const updatePromises = [];
        snapshot.forEach((childSnapshot) => {
          const hubKey = childSnapshot.key;
          const updatePromise = update(ref(db, `Hub/${hubKey}`), { UserID: userID });
          updatePromises.push(updatePromise);
        });
        await Promise.all(updatePromises);
        setActiveError(null);
      } else {
        setActiveError('Activation code not found');
      }
  };

  const createHub = async (activeCode, user) => {
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      
      // Create a new reference with an auto-generated ID
      const newRaspRef = push(ref(db, 'Hub'));
      
      // Set the data with the new structure
      await set(newRaspRef, {
        activation: activeCode,
        UserID: user.uid,
        chosen_device: {
          addr: "",
          name: ""
        },
        command: "idle",
        password: "",
        scanned_devices: [],
        ssid: ""
      });
  
      console.log('Raspberry Pi created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error creating Raspberry Pi:', error);
      return { success: false, msg: error.message };
    }
  };

  const getRaspDataByUserId = async (userId) => {
    try {
      const devicesRef = ref(db, 'Hub');
      const devicesQuery = query(devicesRef, orderByChild('UserID'), equalTo(userId));
      const devicesSnapshot = await get(devicesQuery);
  
      let devicesData = [];
      if (devicesSnapshot.exists()) {
        devicesSnapshot.forEach((childSnapshot) => {
          const deviceData = { id: childSnapshot.key, ...childSnapshot.val() };
          devicesData.push(deviceData);
        });
      } else {
        console.log('No Raspberry Pi data found for this userId');
      }
      console.log('Fetched devices data:', devicesData); // Log fetched data
      return { success: true, data: devicesData };
    } catch (e) {
      console.error('Error fetching device data:', e);
      return { success: false, msg: e.message };
    }
  };

  const countDevicesByHubId = async (hubId) => {
  try {
      const sensorRef = ref(db, 'Device');
      const sensorQuery = query(sensorRef, orderByChild('HubID'), equalTo(hubId));
      const snapshot = await get(sensorQuery);

      let deviceCount = 0;
      if (snapshot.exists()) {
        deviceCount = snapshot.size; // Count the number of matching devices
      }
      console.log(`Counted ${deviceCount} devices for HubID ${hubId}`);
      return { success: true, count: deviceCount };
    } catch (error) {
      console.error('Error counting devices:', error);
      return { success: false, msg: error.message };
    }
  };

  const DeleteActivation = async (raspId) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      const snapshot = await get(deviceRef);
  
      if (snapshot.exists()) {
        await update(deviceRef, { UserID: "" });
        console.log('Hub deactivated successfully');
        return { success: true };
      } else {
        console.log('Raspberry Pi not found');
        return { success: false, msg: 'Raspberry Pi not found' };
      }
    } catch (error) {
      console.error('Error deactivating hub:', error);
      return { success: false, msg: error.message };
    }
  };

  const fetchUsername = async () => {
    try {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const userRef = ref(db, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        return { success: true, username: userData.username };
      } else {
        return { success: false, msg: 'User data not found' };
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      return { success: false, msg: error.message };
    }
  };

  const updateWifiSSID = async (raspId, ssid, password) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      await update(deviceRef, { ssid, password });
      console.log('WiFi SSID and password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating WiFi SSID and password:', error);
      return { success: false, msg: error.message };
    }
  };

  const updateCommand = async (raspId, command) => {
    try {
      const deviceRef = ref(db, `Hub/${raspId}`);
      await update(deviceRef, { command });
      console.log('Command updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating command:', error);
      return { success: false, msg: error.message };
    }
  };
  
  const getScannedWithRaspID = async (raspId) => {
    try {
        const deviceRef = ref(db, `Hub/${raspId}/scanned_devices`);
        const snapshot = await get(deviceRef);
        let scannedDevices = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const device = childSnapshot.val();
                scannedDevices.push({
                    key: childSnapshot.key, // use key for unique identifier
                    addr: device.addr || "Unknown",
                    name: device.name || "Unnamed"
                });
            });
        }
        console.log('Fetched scanned devices:', scannedDevices);
        return { success: true, data: scannedDevices };
    } catch (error) {
        console.error('Error fetching scanned devices:', error);
        return { success: false, msg: error.message };
    }
};

const connectToDevice = async (raspId, addr, name) => {
  try {
    const raspRef = ref(db, `Hub/${raspId}`);
    await update(raspRef, {
      'chosen_device/addr': addr,
      'chosen_device/name': name,
      'command': 'connecting',
    });
    console.log('Connected to device:', { addr, name });
    return { success: true };
  } catch (error) {
    console.error('Error connecting to device:', error);
    return { success: false, msg: error.message };
  }
};
const getSensorDataByUserId = async (hubId) => {
  try {
    const sensorRef = ref(db, 'Device');
    const sensorQuery = query(sensorRef, orderByChild('HubID'), equalTo(hubId));
    const snapshot = await get(sensorQuery);

    let sensorData = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const device = { id: childSnapshot.key, ...childSnapshot.val() };
        sensorData.push(device);
      });
    }
    return { success: true, data: sensorData };
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return { success: false, msg: error.message };
  }
};

const updateStatus = async (HubId, deviceId, newStatus) => {
  try {
    const deviceRef = ref(db, `Device/${deviceId}`);
    const HubRef = ref(db, `Hub/${HubId}`);

    await update(deviceRef, {
      status: newStatus,
    });

    await update(HubRef, {
      'command': 'updating',
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, msg: error.message };
  }
};
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      activeError,
      activateHub,
      createHub,
      getRaspDataByUserId,
      DeleteActivation,
      fetchUsername,
      updateWifiSSID,
      updateCommand,
      getScannedWithRaspID,
      connectToDevice,
      getSensorDataByUserId,
      updateStatus,
      countDevicesByHubId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped inside AuthContextProvider');
  }
  return value;
};
