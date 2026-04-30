import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { BrandHero } from "@/components/ui/BrandHero";
import { KpiCard } from "@/components/ui/KpiCard";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { partnerApi } from "@/services/api/partner";
import { useAppStore } from "@/store/useAppStore";
import type { ApprovalState } from "@/types";

export function PartnerHomeScreen({ navigation }: any) {
  const user = useAppStore((state) => state.authUser);
  const localProperties = useAppStore((state) => state.localProperties);
  const [hotelCount, setHotelCount] = useState(0);
  const [rideCount, setRideCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [syncLabel, setSyncLabel] = useState("Ready");
  const [approval, setApproval] = useState<ApprovalState | null>(null);

  const loadDashboard = async () => {
    setSyncLabel("Loading");
    try {
      const [hotels, rides, bookings, approvalData] = await Promise.all([
        partnerApi.getMyHotels(),
        partnerApi.getMyRides(),
        partnerApi.getIncomingBookings(),
        partnerApi.getPartnerStatus().catch(() => null),
      ]);
      setHotelCount(hotels.length);
      setRideCount(rides.length);
      setBookingCount(bookings.length);
      setPendingCount(bookings.filter((item) => item.status === "pending").length);
      setEarnings(bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0));
      setApproval(approvalData);
      setSyncLabel("Ready");
    } catch {
      setSyncLabel("Offline");
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setSyncLabel("Loading");
      try {
        const [hotels, rides, bookings, approvalData] = await Promise.all([
          partnerApi.getMyHotels(),
          partnerApi.getMyRides(),
          partnerApi.getIncomingBookings(),
          partnerApi.getPartnerStatus().catch(() => null),
        ]);

        if (!active) return;
        setHotelCount(hotels.length);
        setRideCount(rides.length);
        setBookingCount(bookings.length);
        setPendingCount(bookings.filter((item) => item.status === "pending").length);
        setEarnings(bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0));
        setApproval(approvalData);
        setSyncLabel("Ready");
      } catch {
        if (!active) return;
        setSyncLabel("Offline");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen onRefresh={loadDashboard} refreshing={syncLabel === "Loading"}>
      <BrandHero
        eyebrow="Partner home"
        title={`Welcome${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        accent="."
        subtitle="Everything important is here. Add listings, manage bookings, and track today's business."
      />

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Bookings" value={String(bookingCount)} hint="All requests" />
        <KpiCard label="Earnings" value={`Rs ${earnings}`} hint="Confirmed total" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Pending" value={String(pendingCount)} hint="Need action" />
        <KpiCard label="Verify" value={approval?.approvalStatus || user?.approvalStatus || "pending"} hint="Account status" />
      </View>

      <SectionCard title="Quick actions" subtitle="Use these large buttons to run your business fast.">
        <View style={styles.grid}>
          <Pressable style={[styles.actionTile, styles.primaryTile]} onPress={() => navigation.navigate("HotelManagement")}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="office-building-plus-outline" size={24} color="#08110E" />
            </View>
            <Text style={styles.primaryTitle}>Add Hotel</Text>
            <Text style={styles.primaryText}>Add a new hotel or stay listing.</Text>
          </Pressable>

          <Pressable style={[styles.actionTile, styles.primaryTile]} onPress={() => navigation.navigate("RideManagement")}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="car-multiple" size={24} color="#08110E" />
            </View>
            <Text style={styles.primaryTitle}>Add Fleet</Text>
            <Text style={styles.primaryText}>Add a car, taxi, or route for bookings.</Text>
          </Pressable>

          <Pressable style={[styles.actionTile, styles.primaryTile]} onPress={() => navigation.navigate("PropertyManagement")}>
            <View style={styles.iconWrap}>
              <Feather name="map-pin" size={24} color="#08110E" />
            </View>
            <Text style={styles.primaryTitle}>Add Property</Text>
            <Text style={styles.primaryText}>Add a land, homestay, or local property listing.</Text>
          </Pressable>

          <Pressable style={[styles.actionTile, styles.primaryTile]} onPress={() => navigation.navigate("OperationsCenter")}>
            <View style={styles.iconWrap}>
              <Feather name="briefcase" size={24} color="#08110E" />
            </View>
            <Text style={styles.primaryTitle}>Manage Business</Text>
            <Text style={styles.primaryText}>Open verification, payouts, reviews, and business settings.</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="Business snapshot" subtitle="A quick view of what is active in your partner account.">
        <View style={styles.grid}>
          <Pressable style={styles.secondaryTile} onPress={() => navigation.navigate("BookingManagement")}>
            <Feather name="calendar" size={20} color="#FDBA74" />
            <Text style={styles.secondaryTitle}>Manage Bookings</Text>
            <Text style={styles.secondaryText}>{pendingCount} booking requests need action right now.</Text>
          </Pressable>

          <Pressable style={styles.secondaryTile} onPress={() => navigation.navigate("HotelManagement")}>
            <Feather name="home" size={20} color="#FDBA74" />
            <Text style={styles.secondaryTitle}>Manage Stays</Text>
            <Text style={styles.secondaryText}>{hotelCount} hotel listings ready to manage.</Text>
          </Pressable>

          <Pressable style={styles.secondaryTile} onPress={() => navigation.navigate("RideManagement")}>
            <Feather name="truck" size={20} color="#FDBA74" />
            <Text style={styles.secondaryTitle}>Manage Vehicles</Text>
            <Text style={styles.secondaryText}>{rideCount} fleet listings ready to manage.</Text>
          </Pressable>

          <Pressable style={styles.secondaryTile} onPress={() => navigation.navigate("PropertyManagement")}>
            <Feather name="layout" size={20} color="#FDBA74" />
            <Text style={styles.secondaryTitle}>Manage Properties</Text>
            <Text style={styles.secondaryText}>{localProperties.filter((item) => item.status !== "archived").length} property listings saved in the app.</Text>
          </Pressable>

          <Pressable style={styles.secondaryTile} onPress={() => navigation.navigate("Wallet")}>
            <Feather name="credit-card" size={20} color="#FDBA74" />
            <Text style={styles.secondaryTitle}>Wallet</Text>
            <Text style={styles.secondaryText}>Check earnings, pending payout, and payout history.</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="How it works" subtitle="Simple things should feel super easy.">
        <View style={styles.steps}>
          <Text style={styles.step}>1. Add a hotel, fleet, or property.</Text>
          <Text style={styles.step}>2. Fill in the form and save your listing.</Text>
          <Text style={styles.step}>3. Open Manage Bookings or Wallet to handle requests and money.</Text>
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  actionTile: {
    borderRadius: 24,
    padding: 18,
  },
  primaryTile: {
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.35)",
    backgroundColor: "rgba(249,115,22,0.16)",
  },
  iconWrap: {
    marginBottom: 12,
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDBA74",
  },
  primaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  primaryText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 21,
  },
  secondaryTile: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 18,
  },
  secondaryTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  secondaryText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 21,
  },
  steps: {
    gap: 12,
  },
  step: {
    color: "#F8FAFC",
    fontSize: 14,
    lineHeight: 22,
  },
});
