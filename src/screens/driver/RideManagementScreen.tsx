import { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { SignalPill } from "@/components/ui/SignalPill";
import { TextField } from "@/components/ui/TextField";
import { partnerApi } from "@/services/api/partner";
import type { PartnerBooking, RideDraft, RideSummary, TripLedgerEntry } from "@/types";

const defaultRideForm = {
  vehicleModel: "",
  vehicleNumber: "",
  routeFrom: "",
  routeTo: "",
  seatsAvailable: "",
  pricePerSeat: "",
  pickupLat: "",
  pickupLng: "",
  dropLat: "",
  dropLng: "",
};

export function RideManagementScreen() {
  const [rides, setRides] = useState<RideSummary[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [tripHistory, setTripHistory] = useState<TripLedgerEntry[]>([]);
  const [ledger, setLedger] = useState<TripLedgerEntry[]>([]);
  const [editingRideId, setEditingRideId] = useState("");
  const [form, setForm] = useState(defaultRideForm);
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setBusy(true);
    try {
      const [rideData, incoming, trips, earnings] = await Promise.all([
        partnerApi.getMyRides(),
        partnerApi.getIncomingBookings(),
        partnerApi.getTripHistory(),
        partnerApi.getEarningsLedger(),
      ]);
      setRides(rideData);
      setBookings(incoming.filter((item) => item.bookingType === "Transport"));
      setTripHistory(trips);
      setLedger(earnings);
    } catch {
      Alert.alert("Sync issue", "We could not refresh the ride workspace from the backend.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingRideId("");
    setForm(defaultRideForm);
  };

  const hydrateRide = (ride: RideSummary) => {
    setEditingRideId(ride._id);
    setForm({
      vehicleModel: ride.vehicleModel || "",
      vehicleNumber: ride.vehicleNumber || "",
      routeFrom: ride.routeFrom || "",
      routeTo: ride.routeTo || "",
      seatsAvailable: String(ride.seatsAvailable || ""),
      pricePerSeat: String(ride.pricePerSeat || ""),
      pickupLat: ride.pickupLat ? String(ride.pickupLat) : "",
      pickupLng: ride.pickupLng ? String(ride.pickupLng) : "",
      dropLat: ride.dropLat ? String(ride.dropLat) : "",
      dropLng: ride.dropLng ? String(ride.dropLng) : "",
    });
  };

  const submitRide = async () => {
    const payload: RideDraft = {
      vehicleModel: form.vehicleModel.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      routeFrom: form.routeFrom.trim(),
      routeTo: form.routeTo.trim(),
      seatsAvailable: Number(form.seatsAvailable || 0),
      pricePerSeat: Number(form.pricePerSeat || 0),
      pickupLat: form.pickupLat ? Number(form.pickupLat) : undefined,
      pickupLng: form.pickupLng ? Number(form.pickupLng) : undefined,
      dropLat: form.dropLat ? Number(form.dropLat) : undefined,
      dropLng: form.dropLng ? Number(form.dropLng) : undefined,
      driverOnline: true,
    };

    if (!payload.vehicleModel || !payload.routeFrom || !payload.routeTo) {
      Alert.alert("Missing details", "Vehicle, route from, and route to are required.");
      return;
    }

    setBusy(true);
    try {
      if (editingRideId) {
        await partnerApi.updateRide(editingRideId, payload);
      } else {
        await partnerApi.createRide(payload);
      }
      resetForm();
      await loadData();
    } catch {
      Alert.alert("Save failed", "The ride could not be saved to the backend.");
    } finally {
      setBusy(false);
    }
  };

  const updateSeatAndPrice = async (ride: RideSummary) => {
    setBusy(true);
    try {
      await partnerApi.updateRide(ride._id, {
        seatsAvailable: Number(form.seatsAvailable || ride.seatsAvailable || 0),
        pricePerSeat: Number(form.pricePerSeat || ride.pricePerSeat || 0),
      });
      await loadData();
    } catch {
      Alert.alert("Update failed", "Seat or pricing changes could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const projectedEarnings = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [bookings]
  );

  return (
    <Screen>
      <BrandHero
        eyebrow="Ride workspace"
        title="Control fleet,"
        accent="routes, and earnings."
        subtitle="Drivers can add rides, edit routes, manage seats and pricing, and monitor trip history from one operational desk."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Add rides" />
          <SignalPill label="Trip history" />
          <SignalPill label="Multi-vehicle control" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Vehicles" value={String(rides.length)} hint="Registered ride listings" />
        <KpiCard label="Bookings" value={String(bookings.length)} hint="Transport requests" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Revenue" value={`Rs ${projectedEarnings}`} hint="Confirmed trip earnings" />
        <KpiCard label="Ledger" value={String(ledger.length)} hint="Payout or trip entries" />
      </View>

      <SectionCard title="Ride form" subtitle="Create or edit a vehicle listing, route, seat count, and route coordinates">
        <TextField label="Vehicle model" value={form.vehicleModel} onChangeText={(value) => setForm((current) => ({ ...current, vehicleModel: value }))} placeholder="Innova Crysta" />
        <TextField label="Vehicle number" value={form.vehicleNumber} onChangeText={(value) => setForm((current) => ({ ...current, vehicleNumber: value }))} placeholder="UK07 AB 1234" autoCapitalize="characters" />
        <TextField label="Route from" value={form.routeFrom} onChangeText={(value) => setForm((current) => ({ ...current, routeFrom: value }))} placeholder="Dehradun" />
        <TextField label="Route to" value={form.routeTo} onChangeText={(value) => setForm((current) => ({ ...current, routeTo: value }))} placeholder="Mussoorie" />
        <TextField label="Seats available" value={form.seatsAvailable} onChangeText={(value) => setForm((current) => ({ ...current, seatsAvailable: value }))} placeholder="4" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Price per seat" value={form.pricePerSeat} onChangeText={(value) => setForm((current) => ({ ...current, pricePerSeat: value }))} placeholder="850" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Pickup latitude" value={form.pickupLat} onChangeText={(value) => setForm((current) => ({ ...current, pickupLat: value }))} placeholder="30.3165" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Pickup longitude" value={form.pickupLng} onChangeText={(value) => setForm((current) => ({ ...current, pickupLng: value }))} placeholder="78.0322" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Drop latitude" value={form.dropLat} onChangeText={(value) => setForm((current) => ({ ...current, dropLat: value }))} placeholder="30.4598" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Drop longitude" value={form.dropLng} onChangeText={(value) => setForm((current) => ({ ...current, dropLng: value }))} placeholder="78.0664" keyboardType="numeric" autoCapitalize="none" />
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Reset form" onPress={resetForm} disabled={busy} />
        </View>
        <View className="mt-4">
          <PrimaryButton title={editingRideId ? "Update ride" : "Add ride"} onPress={submitRide} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Manage rides" subtitle="Edit routes, switch between vehicles, and update seat or price instantly">
        {rides.length ? (
          rides.map((ride) => (
            <ActionCard
              key={ride._id}
              title={ride.vehicleModel}
              detail={`${ride.routeFrom} to ${ride.routeTo} | ${ride.seatsAvailable} seats | Rs ${ride.pricePerSeat}/seat`}
              status={ride.driverOnline === false ? "offline" : ride.status || "live"}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Edit" onPress={() => hydrateRide(ride)} />
                <InlineActionButton title="Quick seat/price sync" tone="primary" onPress={() => updateSeatAndPrice(ride)} disabled={busy} />
              </View>
            </ActionCard>
          ))
        ) : (
          <Text className="text-sm text-white/70">No vehicles listed yet. Add your first ride above.</Text>
        )}
      </SectionCard>

      <SectionCard title="Trip history" subtitle="Completed or captured trip records from the backend">
        {tripHistory.length ? (
          tripHistory.map((entry) => (
            <ListRow key={entry._id} title={entry.label} meta={`Rs ${entry.amount} | ${entry.createdAt}`} status={entry.status} />
          ))
        ) : (
          <Text className="text-sm text-white/70">Trip history will appear here as the backend exposes partner trip records.</Text>
        )}
      </SectionCard>

      <SectionCard title="Earnings ledger" subtitle="Settlement and earnings visibility for each ride partner">
        {ledger.length ? (
          ledger.map((entry) => (
            <ListRow key={entry._id} title={entry.label} meta={`Rs ${entry.amount} | ${entry.createdAt}`} status={entry.status} />
          ))
        ) : (
          <Text className="text-sm text-white/70">Ledger data is ready for backend payout endpoints and will show up here once available.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}
