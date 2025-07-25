import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#181B20",
    borderBottomWidth: 1,
    borderBottomColor: "#23262B",
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
