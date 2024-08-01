import React from 'react';
import { Stack } from 'expo-router';

export default function ConnectLayout() {
  return (
    <Stack>
      <Stack.Screen name="rasp" options={{ headerShown: false }}/>
      <Stack.Screen name="modal" options={{ 
        title: "wifi",
        headerShown: false 
        }} />
    </Stack>
  );
}
