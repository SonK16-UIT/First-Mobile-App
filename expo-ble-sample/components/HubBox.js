import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/authContext';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';
import { AntDesign, Feather } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MenuItem } from './CustomMenuItems';
import theme from '../theme';

const HubBox = ({ item, onDelete, onNavigate }) => {
  const { countDevicesByHubId } = useAuth();
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    const fetchDeviceCount = async () => {
      const result = await countDevicesByHubId(item.id);
      if (result.success) {
        setDeviceCount(result.count);
      }
    };

    fetchDeviceCount();
  }, [item.id, countDevicesByHubId]);

  const handleEdit = () => {
    onNavigate(item.id);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <View style={styles.box}>
      <Menu>
        <MenuTrigger>
            <View style={styles.boxContent}>
                <Text style={styles.title}>{item.name || "Thiết bị"}</Text>
                <Text style={styles.deviceCount}>{deviceCount} Thiết bị</Text>
            </View>
        </MenuTrigger>

        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 10,
              borderCurve: 'continuous',
              marginTop: -60,
              marginLeft: -10,
              backgroundColor: 'white',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 0 },
              width: 160,
            },
          }}
        >
          <MenuItem icon={<Feather name="edit" size={hp(2.5)} color="#737373" />}  action={handleEdit} text="Chỉnh sửa" />
          <Divider />
          <MenuItem icon={<AntDesign name="delete" size={hp(2.5)} color="#737373" />}  action={handleDelete} text="Xóa" />
        </MenuOptions>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '48%', // Fixed width for each box
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2B2F3A',
    margin: 5,
  },
  boxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  deviceCount: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 5,
  },
  menuButton: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'flex-end',
  },
});

export default HubBox;

const Divider = ()=>{
    return(
        <View className="p-[1px] w-full bg-neutral-200" />
    )
}