import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { useAppStore } from "@/store/useAppStore";
import { DriverDashboardScreen } from "@/screens/driver/DriverDashboardScreen";
import { HotelDashboardScreen } from "@/screens/hotelOwner/HotelDashboardScreen";
import { LoginScreen } from "@/screens/shared/LoginScreen";
import { NotificationsScreen } from "@/screens/shared/NotificationsScreen";
import { OnboardingScreen } from "@/screens/shared/OnboardingScreen";
import { ProfileScreen } from "@/screens/shared/ProfileScreen";
import { PropertyOwnerDashboardScreen } from "@/screens/propertyOwner/PropertyOwnerDashboardScreen";
import { RoleSelectionScreen } from "@/screens/shared/RoleSelectionScreen";
import { SettingsScreen } from "@/screens/shared/SettingsScreen";
import { SignupScreen } from "@/screens/shared/SignupScreen";
import { SplashScreen } from "@/screens/shared/SplashScreen";
import { SupportScreen } from "@/screens/shared/SupportScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PartnerTabs() {
  const role = useAppStore((state) => state.selectedRole);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#09110E",
          borderTopColor: "rgba(255,255,255,0.12)",
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#FDBA74",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={
          role === "driver"
            ? DriverDashboardScreen
            : role === "propertyOwner"
              ? PropertyOwnerDashboardScreen
              : HotelDashboardScreen
        }
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>o</Text> }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>o</Text> }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>o</Text> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>o</Text> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const bootstrapped = useAppStore((state) => state.bootstrapped);
  const onboardingSeen = useAppStore((state) => state.onboardingSeen);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const authUser = useAppStore((state) => state.authUser);

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingSeen ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !selectedRole ? (
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      ) : !authUser ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="PartnerTabs" component={PartnerTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
