import { Theme } from "@/constants/Colors";
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
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={Theme.colors.text.primary}
            />
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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
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
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: "bold",
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
});
