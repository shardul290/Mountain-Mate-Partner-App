import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { partnerApi } from "@/services/api/partner";
import type { PartnerBooking } from "@/types";

type FilterMode = "all" | "pending" | "hotel" | "transport";

const filters: { key: FilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "hotel", label: "Stays" },
  { key: "transport", label: "Rides" },
];

export function BookingManagementScreen() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [busyId, setBusyId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const result = await partnerApi.getIncomingBookings();
      setBookings(result);
    } catch {
      setMessage({ tone: "error", text: "Bookings could not be loaded right now." });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleBookings = useMemo(() => {
    if (filter === "pending") return bookings.filter((item) => item.status === "pending");
    if (filter === "hotel") return bookings.filter((item) => item.bookingType === "Hotel");
    if (filter === "transport") return bookings.filter((item) => item.bookingType === "Transport");
    return bookings;
  }, [bookings, filter]);

  const totalEarnings = bookings
    .filter((item) => item.status === "confirmed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const updateBooking = async (bookingId: string, status: "confirmed" | "declined" | "cancelled") => {
    setBusyId(bookingId);
    setMessage(null);
    try {
      if (status === "cancelled") {
        await partnerApi.cancelBooking(bookingId, "Cancelled from booking manager");
      } else {
        await partnerApi.updateIncomingBookingStatus(bookingId, status);
      }
      setMessage({ tone: "success", text: `Booking marked as ${status}.` });
      await loadData();
    } catch {
      Alert.alert("Update failed", "This booking could not be updated.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <Screen onRefresh={loadData} refreshing={refreshing}>
      <BrandHero
        eyebrow="Booking center"
        title="Manage all"
        accent="bookings."
        subtitle="See stay and ride requests in one place. Confirm them quickly and keep your day moving."
      />

      {message ? <FeedbackBanner tone={message.tone} message={message.text} /> : null}

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Total" value={String(bookings.length)} hint="All booking requests" />
        <KpiCard label="Pending" value={String(bookings.filter((item) => item.status === "pending").length)} hint="Need action now" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Confirmed" value={String(bookings.filter((item) => item.status === "confirmed").length)} hint="Accepted bookings" />
        <KpiCard label="Earnings" value={`Rs ${totalEarnings}`} hint="Confirmed total" />
      </View>

      <SectionCard title="Filters" subtitle="Pick the type of bookings you want to see.">
        <View style={styles.filterRow}>
          {filters.map((item) => {
            const active = item.key === filter;
            return (
              <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filterChip, active ? styles.filterChipActive : null]}>
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Requests" subtitle="Open the app once and handle all partner bookings from here.">
        {visibleBookings.length ? (
          visibleBookings.map((booking) => (
            <ActionCard
              key={booking._id}
              title={booking.listingLabel || (booking.bookingType === "Hotel" ? "Stay booking" : "Ride booking")}
              detail={`${booking.customerName} | ${booking.phoneNumber} | Rs ${booking.amount}${booking.pickupLabel ? ` | ${booking.pickupLabel}` : ""}${booking.dropLabel ? ` to ${booking.dropLabel}` : ""}${booking.startDate ? ` | ${booking.startDate}` : booking.date ? ` | ${booking.date}` : ""}`}
              status={booking.status}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title={busyId === booking._id ? "Working..." : "Confirm"} tone="primary" onPress={() => updateBooking(booking._id, "confirmed")} disabled={!!busyId} />
                <InlineActionButton title={busyId === booking._id ? "Working..." : "Decline"} tone="danger" onPress={() => updateBooking(booking._id, "declined")} disabled={!!busyId} />
                <InlineActionButton title={busyId === booking._id ? "Working..." : "Cancel"} onPress={() => updateBooking(booking._id, "cancelled")} disabled={!!busyId} />
              </View>
            </ActionCard>
          ))
        ) : (
          <EmptyState title="No bookings here" message="New stay and ride requests will show up here." icon="calendar" />
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    borderColor: "rgba(249,115,22,0.34)",
    backgroundColor: "rgba(249,115,22,0.18)",
  },
  filterText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFEDD5",
  },
});
