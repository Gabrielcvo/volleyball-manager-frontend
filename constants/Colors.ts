/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Brand colors
const primaryBlue = "#2D6BFF";
const primaryBlueDark = "#1a4bb8";

// Background colors
const backgroundDark = "#181B20";
const surfaceDark = "#23262B";

// Text colors
const textPrimary = "#fff";
const textSecondary = "#A0A4AB";
const textDisabled = "#666";

// Status colors
const successColor = "#28a745";
const errorColor = "#dc3545";
const warningColor = "#f59e0b";
const infoColor = "#3b82f6";

// Border colors
const borderColor = "#23262B";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// App-specific theme colors
export const Theme = {
  colors: {
    // Primary
    primary: primaryBlue,
    primaryDark: primaryBlueDark,

    // Backgrounds
    background: backgroundDark,
    surface: surfaceDark,

    // Text
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textDisabled,
    },

    // Status
    status: {
      success: successColor,
      error: errorColor,
      warning: warningColor,
      info: infoColor,
    },

    // UI Elements
    border: borderColor,

    // States
    active: primaryBlue,
    inactive: textSecondary,
  },

  // Common spacing values
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Common border radius values
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 24,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
};
