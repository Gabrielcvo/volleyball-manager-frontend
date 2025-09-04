import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
    >
      <Tabs.Screen name="index" options={{ title: "Grupos" }} />
      {/* <Tabs.Screen name="ranking" options={{ title: "Ranking" }} /> */}
      {/* <Tabs.Screen name="profile" options={{ title: "Perfil" }} /> */}
      <Tabs.Screen name="settings" options={{ title: "Configurações" }} />
    </Tabs>
  );
}
