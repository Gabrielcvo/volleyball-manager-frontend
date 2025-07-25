import { Theme } from "@/constants/Colors";
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

type TabRoute = "/(tabs)/games" | "/(tabs)/profile" | "/(tabs)/settings";

interface TabItem {
  name: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: TabRoute;
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

  const isTabActive = (route: TabRoute) => {
    return pathname === route || pathname.startsWith(route);
  };

  const handleTabPress = (route: TabRoute) => {
    router.push(route);
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
              color={isActive ? Theme.colors.active : Theme.colors.inactive}
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
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 34 : Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.sm,
  },
  tabTitle: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.text.secondary,
    marginTop: 4,
    fontWeight: "500",
  },
  tabTitleActive: {
    color: Theme.colors.active,
    fontWeight: "600",
  },
});
