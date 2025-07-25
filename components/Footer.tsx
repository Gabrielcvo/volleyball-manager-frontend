import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TabItem {
  name: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

const tabs: TabItem[] = [
  {
    name: "games",
    title: "Jogos",
    icon: "sports-volleyball",
    route: "/(tabs)/games",
  },
  {
    name: "profile",
    title: "Perfil",
    icon: "person",
    route: "/(tabs)/profile",
  },
  {
    name: "settings",
    title: "Configurações",
    icon: "settings",
    route: "/(tabs)/settings",
  },
];

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const isTabActive = (route: string) => {
    return pathname === route || pathname.startsWith(route);
  };

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.route);

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.route)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isActive ? "#2D6BFF" : "#A0A4AB"}
            />
            <Text style={[styles.tabTitle, isActive && styles.tabTitleActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#181B20",
    borderTopWidth: 1,
    borderTopColor: "#23262B",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 34 : 8,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabTitle: {
    fontSize: 12,
    color: "#A0A4AB",
    marginTop: 4,
    fontWeight: "500",
  },
  tabTitleActive: {
    color: "#2D6BFF",
    fontWeight: "600",
  },
});
