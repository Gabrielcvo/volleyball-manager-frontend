import { Theme } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type TabRoute =
  | "/(tabs)"
  | "/(tabs)/ranking"
  | "/(tabs)/profile"
  | "/(tabs)/settings";

interface TabItem {
  name: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: TabRoute;
}

const tabs: TabItem[] = [
  {
    name: "index",
    title: "Grupos",
    icon: "group",
    route: "/(tabs)",
  },
  // {
  //   name: "ranking",
  //   title: "Ranking",
  //   icon: "leaderboard",
  //   route: "/(tabs)/ranking",
  // },
  // {
  //   name: "profile",
  //   title: "Perfil",
  //   icon: "person",
  //   route: "/(tabs)/profile",
  // },
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
    //pathname do grupos é apenas /(tabs)
    if (route === "/(tabs)") {
      return pathname === "/";
    }

    return `${"/(tabs)"}${pathname}` === route || pathname.startsWith(route);
  };

  const handleTabPress = (route: TabRoute) => {
    router.push(route);
  };

  return (
    <View
      className={`flex-row bg-[#1A1D21] border-t border-[#2A2D31] pt-2 ${Platform.OS === "ios" ? "pb-8" : "pb-3"}`}
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(tab.route);

        // console.log(isActive);

        return (
          <TouchableOpacity
            key={tab.name}
            className={`flex-1 items-center justify-center py-1 mx-2 ${isActive ? "bg-[#2D6BFF]/20 rounded" : ""}`}
            onPress={() => handleTabPress(tab.route)}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isActive ? Theme.colors.active : Theme.colors.inactive}
            />
            <Text
              className={`text-xs mt-1 font-medium ${isActive ? "text-[#2D6BFF] font-semibold" : "text-[#A0A4AB]"}`}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
