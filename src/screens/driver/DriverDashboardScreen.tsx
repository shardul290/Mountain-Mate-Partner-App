import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
        eyebrow="Fleet republish"
        title="Keep rides"
        accent="moving."
        subtitle="Track route status, new requests, and live driver availability."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Live route control" />
          <SignalPill label="Driver verification" />
          <SignalPill label="Ride availability" />
        </View>
      </BrandHero>
      <View className="mt-6 flex-row gap-3">
        <KpiCard label="Vehicles" value={String(rides.length)} hint="Registered ride products" />
        <KpiCard label="Earnings" value={`Rs ${earnings}`} hint="Confirmed ride revenue" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Requests" value={String(incoming.length)} hint="Ride inquiries and bookings" />
        <KpiCard label="Status" value={liveAvailable ? "Live" : "Paused"} hint="Availability toggle" />
      </View>
      <SectionCard title="Availability" subtitle="Turn ride requests on or off for your active vehicle.">
        <Pressable
          onPress={toggleFirstRide}
          className={`rounded-3xl border px-4 py-4 ${liveAvailable ? "border-green-300 bg-green-400/15" : "border-white/15 bg-white/10"}`}
        >
          <Text className="text-base font-semibold text-white">
            {busyRideId ? "Updating availability..." : liveAvailable ? "Accepting new requests" : "Temporarily offline"}
          </Text>
        </Pressable>
      </SectionCard>
      <SectionCard title="Ride listings" subtitle="Your active routes and seat inventory.">
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
      <SectionCard title="Ride requests" subtitle="Accept or decline incoming ride bookings.">
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
