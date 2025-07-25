import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface ScreenLayoutProps {
  title: string;
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  headerRightElement?: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  onBackPress?: () => void;
}

export function ScreenLayout({
  title,
  children,
  showHeader = true,
  showFooter = true,
  showBackButton = false,
  headerRightElement,
  scrollable = false,
  keyboardAvoiding = false,
  onBackPress,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  const layout = (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showHeader && (
        <Header
          title={title}
          showBackButton={showBackButton}
          rightElement={headerRightElement}
          onBackPress={onBackPress}
        />
      )}

      {content}

      {showFooter && <Footer />}
    </View>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {layout}
      </KeyboardAvoidingView>
    );
  }

  return layout;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#181B20",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});
