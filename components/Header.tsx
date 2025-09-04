import { Theme } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
}

export function Header({
  title,
  showBackButton = false,
  rightElement,
  onBackPress,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-between px-10 py-4 bg-[#1A1D21] border-b border-[#2A2D31] min-h-12">
      <View className="flex-1 items-start">
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            className="p-2 rounded-md"
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={Theme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-2 items-center">
        <Text className="text-2xl font-bold text-white text-center">
          {title}
        </Text>
      </View>

      <View className="flex-1 items-end">{rightElement}</View>
    </View>
  );
}
