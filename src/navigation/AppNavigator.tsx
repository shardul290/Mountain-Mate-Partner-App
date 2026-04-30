import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { RideManagementScreen } from "@/screens/driver/RideManagementScreen";
import { HotelManagementScreen } from "@/screens/hotelOwner/HotelManagementScreen";
import { PropertyManagementScreen } from "@/screens/propertyOwner/PropertyManagementScreen";
import { BookingManagementScreen } from "@/screens/shared/BookingManagementScreen";
import { InboxScreen } from "@/screens/shared/InboxScreen";
import { LoginScreen } from "@/screens/shared/LoginScreen";
import { OnboardingScreen } from "@/screens/shared/OnboardingScreen";
import { OperationsCenterScreen } from "@/screens/shared/OperationsCenterScreen";
import { PartnerHomeScreen } from "@/screens/shared/PartnerHomeScreen";
import { ProfileScreen } from "@/screens/shared/ProfileScreen";
import { RoleSelectionScreen } from "@/screens/shared/RoleSelectionScreen";
import { SettingsScreen } from "@/screens/shared/SettingsScreen";
import { SignupScreen } from "@/screens/shared/SignupScreen";
import { SplashScreen } from "@/screens/shared/SplashScreen";
import { SupportScreen } from "@/screens/shared/SupportScreen";
import { WalletScreen } from "@/screens/shared/WalletScreen";
import { useAppStore } from "@/store/useAppStore";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        component={PartnerHomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Alerts"
        component={InboxScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="bell" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Manage"
        component={RoleManagementScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }}
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
          <Stack.Screen name="BookingManagement" component={BookingManagementScreen} />
          <Stack.Screen name="HotelManagement" component={HotelManagementScreen} />
          <Stack.Screen name="RideManagement" component={RideManagementScreen} />
          <Stack.Screen name="PropertyManagement" component={PropertyManagementScreen} />
          <Stack.Screen name="OperationsCenter" component={OperationsCenterScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
