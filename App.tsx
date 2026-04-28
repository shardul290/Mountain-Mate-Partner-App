import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";

import { AppNavigator } from "@/navigation/AppNavigator";
import { useAppStore } from "@/store/useAppStore";
import { useBootstrapApp } from "@/hooks/useBootstrapApp";
import { notificationLinking } from "@/services/notifications/push";

export default function App() {
  useBootstrapApp();
  const themeMode = useAppStore((state) => state.themeMode);

  return (
    <NavigationContainer linking={notificationLinking} theme={themeMode === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </NavigationContainer>
  );
}
