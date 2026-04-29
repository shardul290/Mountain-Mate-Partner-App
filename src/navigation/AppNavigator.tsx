import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

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
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          borderTopWidth: 0,
          backgroundColor: "#08110E",
          height: 70,
          borderRadius: 24,
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 10,
          shadowColor: "#000000",
          shadowOpacity: 0.28,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 16,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 2,
        },
        tabBarActiveTintColor: "#FDBA74",
        tabBarInactiveTintColor: "rgba(255,255,255,0.48)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: -2,
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={RoleDashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Manage"
        component={RoleManagementScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="briefcase-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Live"
        component={LiveOperationsScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-path" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Ops"
        component={OperationsCenterScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} /> }}
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
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
