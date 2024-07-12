import { View, Text, Platform } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { blurhash } from '../utils/common'
import { Image } from 'expo-image';
import { useAuth } from '../context/authContext';

import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';
import { AntDesign, Feather } from '@expo/vector-icons';
import { MenuItem } from './CustomMenuItems';
import { useRouter } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

const ios = Platform.OS=='ios';
export default function HomeHeader2({title}) {
    const router = useRouter();
    const {user,logout} = useAuth();
    const {top} = useSafeAreaInsets();
    const handleProfile = ()=>{
        router.replace('home')
    }

    const handleLogout = async ()=>{
        await logout();
    }
  return (
    <View style={{paddingTop: ios? top:top+10}} className="flex-row justify-between px-5 bg-red-400 pb-6 rounded-b-3xl shadow">
        <View>
            <Text style={{fontSize: hp(3)}} className="font-medium text-white">{title}</Text>
        </View> 
        <View>
        <Menu>
            <MenuTrigger customStyles={{
                triggerWrapper:{
                    //trigger wrapper styles
                }
            }}>
                <Image
                style={{height: hp(4.3), aspectRatio: 1, borderRadius: 100}}
                source={require('../assets/images/1200px-Font_Awesome_5_solid_user-circle.svg.png')}
                placeholder={blurhash}
                transition={500}
                />
            </MenuTrigger>
            <MenuOptions
                customStyles={{
                    optionsContainer:{
                        borderRadius: 10,
                        borderCurve: 'continuous',
                        marginTop: 25,
                        marginLeft: -20,
                        backgroundColor: 'white',
                        shadowOpacity: 0.2,
                        shadowOffset: {width: 0, height: 0},
                        width: 160
                    }
                }}
            >
                <MenuItem
                action={handleProfile}
                value={null}
                text="Trang chủ"
                icon={<AntDesign name="home" size={hp(2.5)} color="#737373" />} 
                />
                <Divider />
                <MenuItem
                action={handleLogout}
                value={null}
                text="Đăng xuất"
                icon={<AntDesign name="logout" size={hp(2.5)} color="#737373" />} 
                />
            </MenuOptions>
        </Menu>
        </View>
    </View>
  )
}

const Divider = ()=>{
    return(
        <View className="p-[1px] w-full bg-neutral-200" />
    )
}