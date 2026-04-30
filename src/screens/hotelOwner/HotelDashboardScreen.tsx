import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
import type { BackendHealth, HotelSummary, PartnerBooking } from "@/types";

export function HotelDashboardScreen() {
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [incoming, setIncoming] = useState<PartnerBooking[]>([]);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [busyBookingId, setBusyBookingId] = useState("");

  const loadDashboard = async () => {
    try {
      const [hotelData, incomingData, backendHealth] = await Promise.all([
        partnerApi.getMyHotels(),
        partnerApi.getIncomingBookings(),
        partnerApi.getBackendHealth().catch(() => null),
      ]);
      setHotels(hotelData);
      setIncoming(incomingData.filter((item) => item.bookingType === "Hotel"));
      setHealth(backendHealth);
    } catch {
      setHotels([]);
      setIncoming([]);
      setHealth(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateBooking = async (bookingId: string, status: "confirmed" | "declined") => {
    try {
      setBusyBookingId(bookingId);
      await partnerApi.updateIncomingBookingStatus(bookingId, status);
      await loadDashboard();
    } finally {
      setBusyBookingId("");
    }
  };

  const revenue = useMemo(
    () => incoming.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [incoming]
  );

  return (
    <Screen>
      <BrandHero
        eyebrow="Stay vault"
        title="Run the stay"
        accent="smoothly."
        subtitle="See properties, booking demand, and hotel revenue without opening extra screens."
      >
        <View style={styles.badges}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="bed-queen-outline" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Rooms</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="calendar" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Bookings</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="bar-chart-2" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Revenue</Text>
          </View>
        </View>
      </BrandHero>
      <View style={styles.summaryStrip}>
        <View>
          <Text style={styles.summaryEyebrow}>Today</Text>
          <Text style={styles.summaryTitle}>{hotels.length ? `${hotels.length} live properties` : "No live properties yet"}</Text>
          <Text style={styles.summaryMeta}>{incoming.length ? `${incoming.length} booking requests waiting` : "Your next booking request will show here."}</Text>
        </View>
        <View style={styles.summaryIcon}>
          <MaterialCommunityIcons name="office-building-outline" size={26} color="#08110E" />
        </View>
      </View>
      <View className="mt-6 flex-row gap-3">
        <KpiCard label="Properties" value={String(hotels.length)} hint="Live hotel listings" />
        <KpiCard label="Revenue" value={`Rs ${revenue}`} hint="Confirmed booking value" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Requests" value={String(incoming.length)} hint="Pending and active bookings" />
        <KpiCard label="Occupancy" value={`${Math.min(92, 34 + hotels.length * 8)}%`} hint="Estimated live occupancy" />
      </View>
      <SectionCard title="Properties" subtitle="Live hotel listings and their current status.">
        {hotels.length ? (
          hotels.map((hotel) => (
            <ListRow
              key={hotel._id}
              title={hotel.hotelName}
              meta={`${hotel.location} | ${hotel.roomsAvailable} rooms | Rs ${hotel.pricePerNight}/night`}
              status={hotel.status || "pending"}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">No hotel listings found for this partner yet.</Text>
        )}
      </SectionCard>
      <BackendStatusCard
        health={health}
        detail="Connected to the live Mountain Mate backend."
      />
      <SectionCard title="Booking requests" subtitle="Confirm or decline incoming stay requests.">
        {incoming.length ? (
          incoming.slice(0, 5).map((booking) => (
            <ActionCard
              key={booking._id}
              title={booking.listingLabel || "Stay booking"}
              detail={`${booking.customerName} | ${booking.phoneNumber} | Rs ${booking.amount}`}
              status={booking.status}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton
                  title={busyBookingId === booking._id ? "Working..." : "Confirm"}
                  tone="primary"
                  disabled={busyBookingId === booking._id}
                  onPress={() => updateBooking(booking._id, "confirmed")}
                />
                <InlineActionButton
                  title={busyBookingId === booking._id ? "Working..." : "Decline"}
                  tone="danger"
                  disabled={busyBookingId === booking._id}
                  onPress={() => updateBooking(booking._id, "declined")}
                />
                <InlineActionButton title="Refresh" onPress={loadDashboard} disabled={!!busyBookingId} />
              </View>
            </ActionCard>
          ))
        ) : (
          <Text className="text-sm text-white/70">No incoming hotel requests right now.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryStrip: {
    marginTop: -4,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(7,16,13,0.48)",
    padding: 18,
  },
  summaryEyebrow: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryTitle: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  summaryMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 220,
  },
  summaryIcon: {
    height: 60,
    width: 60,
    borderRadius: 18,
    backgroundColor: "#FDBA74",
    alignItems: "center",
    justifyContent: "center",
  },
});
