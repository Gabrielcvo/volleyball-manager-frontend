import { Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="groups" />
      <Stack.Screen name="ranking" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
