import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionCard } from "@/components/ui/ActionCard";
import { BackendStatusCard } from "@/components/ui/BackendStatusCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { SignalPill } from "@/components/ui/SignalPill";
import { partnerApi } from "@/services/api/partner";
import { useAppStore } from "@/store/useAppStore";
import type { BackendHealth, PartnerBooking, RideSummary } from "@/types";

export function DriverDashboardScreen() {
  const [rides, setRides] = useState<RideSummary[]>([]);
  const [incoming, setIncoming] = useState<PartnerBooking[]>([]);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [busyRideId, setBusyRideId] = useState("");
  const [busyBookingId, setBusyBookingId] = useState("");
  const liveAvailable = useAppStore((state) => state.liveAvailable);
  const setLiveAvailable = useAppStore((state) => state.setLiveAvailable);

  const loadDashboard = async () => {
    try {
      const [rideData, incomingData, backendHealth] = await Promise.all([
        partnerApi.getMyRides(),
        partnerApi.getIncomingBookings(),
        partnerApi.getBackendHealth().catch(() => null),
      ]);
      setRides(rideData);
      setIncoming(incomingData.filter((item) => item.bookingType === "Transport"));
      setHealth(backendHealth);
      if (rideData.length > 0) {
        setLiveAvailable(rideData.some((item) => item.driverOnline !== false));
      }
    } catch {
      setRides([]);
      setIncoming([]);
      setHealth(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const toggleFirstRide = async () => {
    const targetRide = rides[0];
    if (!targetRide?._id) {
      return;
    }

    try {
      setBusyRideId(targetRide._id);
      const nextValue = !(targetRide.driverOnline !== false);
      await partnerApi.updateRideAvailability(targetRide._id, nextValue);
      await loadDashboard();
    } finally {
      setBusyRideId("");
    }
  };

  const updateBooking = async (bookingId: string, status: "confirmed" | "declined") => {
    try {
      setBusyBookingId(bookingId);
      await partnerApi.updateIncomingBookingStatus(bookingId, status);
      await loadDashboard();
    } finally {
      setBusyBookingId("");
    }
  };

  const earnings = useMemo(
    () => incoming.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [incoming]
  );

  return (
    <Screen>
      <BrandHero
        eyebrow="Captain mode"
        title="Go online,"
        accent="pick faster."
        subtitle="See ride demand, switch availability, and respond to requests in a few taps."
      >
        <View style={styles.heroActions}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="steering" size={16} color="#FDBA74" />
            <Text style={styles.heroBadgeText}>Captain flow</Text>
          </View>
          <View style={styles.heroBadge}>
            <Feather name="zap" size={16} color="#FDBA74" />
            <Text style={styles.heroBadgeText}>Fast actions</Text>
          </View>
        </View>
      </BrandHero>
      <Pressable
        onPress={toggleFirstRide}
        style={[styles.liveToggle, liveAvailable ? styles.liveToggleOn : styles.liveToggleOff]}
      >
        <View>
          <Text style={styles.liveEyebrow}>Availability</Text>
          <Text style={styles.liveTitle}>{busyRideId ? "Updating..." : liveAvailable ? "You are online" : "You are offline"}</Text>
          <Text style={styles.liveMeta}>{liveAvailable ? "New ride requests can reach you now." : "Tap once to start receiving requests."}</Text>
        </View>
        <View style={[styles.statusOrb, liveAvailable ? styles.statusOrbOn : styles.statusOrbOff]}>
          <Feather name={liveAvailable ? "navigation" : "pause"} size={22} color="#08110E" />
        </View>
      </Pressable>
      <View className="mt-6 flex-row gap-3">
        <KpiCard label="Vehicles" value={String(rides.length)} hint="Registered ride products" />
        <KpiCard label="Earnings" value={`Rs ${earnings}`} hint="Confirmed ride revenue" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Requests" value={String(incoming.length)} hint="Ride inquiries and bookings" />
        <KpiCard label="Status" value={liveAvailable ? "Live" : "Paused"} hint="Availability toggle" />
      </View>
      <SectionCard title="Your fleet" subtitle="Quick look at active vehicles and routes.">
        {rides.length ? (
          rides.map((ride) => (
            <ListRow
              key={ride._id}
              title={ride.vehicleModel}
              meta={`${ride.routeFrom} to ${ride.routeTo} | ${ride.seatsAvailable} seats | Rs ${ride.pricePerSeat}/seat`}
              status={ride.status || "pending"}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">No driver listings found yet.</Text>
        )}
      </SectionCard>
      <BackendStatusCard
        health={health}
        detail="Connected to the live Mountain Mate backend."
      />
      <SectionCard title="New requests" subtitle="Accept or reject incoming rides quickly.">
        {incoming.length ? (
          incoming.slice(0, 5).map((booking) => (
            <ActionCard
              key={booking._id}
              title={booking.listingLabel || "Ride booking"}
              detail={`${booking.customerName} | ${booking.phoneNumber} | Rs ${booking.amount}`}
              status={booking.status}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton
                  title={busyBookingId === booking._id ? "Working..." : "Accept"}
                  tone="primary"
                  disabled={busyBookingId === booking._id}
                  onPress={() => updateBooking(booking._id, "confirmed")}
                />
                <InlineActionButton
                  title={busyBookingId === booking._id ? "Working..." : "Reject"}
                  tone="danger"
                  disabled={busyBookingId === booking._id}
                  onPress={() => updateBooking(booking._id, "declined")}
                />
                <InlineActionButton title="Refresh" onPress={loadDashboard} disabled={!!busyBookingId} />
              </View>
            </ActionCard>
          ))
        ) : (
          <Text className="text-sm text-white/70">No incoming ride requests right now.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  heroBadgeText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  liveToggle: {
    marginTop: -4,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  liveToggleOn: {
    borderColor: "rgba(74,222,128,0.30)",
    backgroundColor: "rgba(74,222,128,0.14)",
  },
  liveToggleOff: {
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  liveEyebrow: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  liveTitle: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  liveMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 220,
  },
  statusOrb: {
    height: 58,
    width: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOrbOn: {
    backgroundColor: "#86EFAC",
  },
  statusOrbOff: {
    backgroundColor: "#CBD5E1",
  },
});
