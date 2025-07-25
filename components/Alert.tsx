import {
  CircleAlert as AlertCircle,
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle2,
  Info,
  X,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  duration?: number;
  showIcon?: boolean;
}

const getAlertConfig = (type: AlertType) => {
  switch (type) {
    case "success":
      return {
        icon: CheckCircle2,
        backgroundColor: "#065f46",
        textColor: "#10b981",
        borderColor: "#10b981",
      };
    case "error":
      return {
        icon: AlertCircle,
        backgroundColor: "#7f1d1d",
        textColor: "#ef4444",
        borderColor: "#ef4444",
      };
    case "info":
      return {
        icon: Info,
        backgroundColor: "#1e3a8a",
        textColor: "#3b82f6",
        borderColor: "#3b82f6",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        backgroundColor: "#92400e",
        textColor: "#f59e0b",
        borderColor: "#f59e0b",
      };
  }
};

export function Alert({
  type,
  message,
  onClose,
  duration = 5000,
  showIcon = true,
}: AlertProps) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  }, []);

  const config = getAlertConfig(type);
  const Icon = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {showIcon && (
        <Icon size={24} color={config.textColor} style={styles.icon} />
      )}
      <Text style={[styles.message, { color: config.textColor }]}>
        {message}
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={20} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 99999,
    zIndex: 999999,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    marginLeft: 12,
  },
});
