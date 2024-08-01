import React, { useEffect, useState } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useAuth } from "../context/authContext";
import { DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from 'expo-image';
import theme from "../theme";
import { MaterialIcons } from '@expo/vector-icons';

export default function CustomDrawerContent(props) {
    const { user, fetchUsername, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const { top, bottom } = useSafeAreaInsets();

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

    const handleLogout = async () => {
        await logout();
    }

    return (
        <View style={styles.container}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                <View style={styles.profileContainer}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: 'https://picsum.photos/seed/696/3000/2000' }}
                    />
                    <View style={{ marginBottom: 20 }} />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{username}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                </View>
                <Divider />
                <View style={styles.drawerItemList}>
                    <DrawerItemList {...props} />
                    <DrawerItem
                        label="Logout"
                        onPress={handleLogout}
                        icon={({ size }) => <MaterialIcons name="logout" color={'#A0A3BD'} size={size} style={styles.icon} />}
                        labelStyle={styles.label}
                    />
                </View>
            </DrawerContentScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.primary,
    },
    drawerContent: {
        backgroundColor: theme.primary,
    },
    profileContainer: {
        flexDirection: 'column',
        alignItems: 'left',
        padding: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 10,
    },
    userInfo: {
        justifyContent: 'center',
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
    userEmail: {
        color:theme.bgWhite(0.15),
        fontSize: 14,
    },
    drawerItemList: {
        flex: 1,
        backgroundColor: theme.primary,
        paddingTop: 10,
    },
    icon: {
        marginRight: -10, // Adjust this value as needed
    },
    label: {
        color: '#A0A3BD',
        marginLeft: -10, // Adjust this value as needed
    },
});

const Divider = () => {
    return (
        <View
            style={{
                height: 1,
                width: '91%',
                backgroundColor: '#ccc',
                alignSelf: 'center',
            }}
        />
    )
}
