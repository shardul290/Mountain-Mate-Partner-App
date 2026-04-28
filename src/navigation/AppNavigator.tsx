import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import { DriverDashboardScreen } from "@/screens/driver/DriverDashboardScreen";
import { RideManagementScreen } from "@/screens/driver/RideManagementScreen";
import { HotelDashboardScreen } from "@/screens/hotelOwner/HotelDashboardScreen";
import { HotelManagementScreen } from "@/screens/hotelOwner/HotelManagementScreen";
import { PropertyOwnerDashboardScreen } from "@/screens/propertyOwner/PropertyOwnerDashboardScreen";
import { PropertyManagementScreen } from "@/screens/propertyOwner/PropertyManagementScreen";
import { InboxScreen } from "@/screens/shared/InboxScreen";
import { LiveOperationsScreen } from "@/screens/shared/LiveOperationsScreen";
import { LoginScreen } from "@/screens/shared/LoginScreen";
import { OnboardingScreen } from "@/screens/shared/OnboardingScreen";
import { OperationsCenterScreen } from "@/screens/shared/OperationsCenterScreen";
import { ProfileScreen } from "@/screens/shared/ProfileScreen";
import { RoleSelectionScreen } from "@/screens/shared/RoleSelectionScreen";
import { SettingsScreen } from "@/screens/shared/SettingsScreen";
import { SignupScreen } from "@/screens/shared/SignupScreen";
import { SplashScreen } from "@/screens/shared/SplashScreen";
import { useAppStore } from "@/store/useAppStore";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function RoleDashboardScreen() {
  const role = useAppStore((state) => state.selectedRole);
  if (role === "driver") return <DriverDashboardScreen />;
  if (role === "propertyOwner") return <PropertyOwnerDashboardScreen />;
  return <HotelDashboardScreen />;
}

function RoleManagementScreen() {
  const role = useAppStore((state) => state.selectedRole);
  if (role === "driver") return <RideManagementScreen />;
  if (role === "propertyOwner") return <PropertyManagementScreen />;
  return <HotelManagementScreen />;
}

function PartnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#09110E",
          borderTopColor: "rgba(255,255,255,0.12)",
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#FDBA74",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 1,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={RoleDashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>D</Text> }}
      />
      <Tab.Screen
        name="Manage"
        component={RoleManagementScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>M</Text> }}
      />
      <Tab.Screen
        name="Live"
        component={LiveOperationsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>L</Text> }}
      />
      <Tab.Screen
        name="Ops"
        component={OperationsCenterScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>O</Text> }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>I</Text> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ color }}>S</Text> }}
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
