import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { FormStepHeader } from "@/components/ui/FormStepHeader";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { TextField } from "@/components/ui/TextField";
import { partnerApi } from "@/services/api/partner";
import { useAppStore } from "@/store/useAppStore";
import type { PartnerBooking, RideDraft, RideSummary, TripLedgerEntry } from "@/types";

const stepMeta = [
  {
    title: "Basic details",
    subtitle: "Add the vehicle name, number, and route.",
  },
  {
    title: "Route details",
    subtitle: "Add pickup and drop points for better trip control.",
  },
  {
    title: "Pricing",
    subtitle: "Set seat count and seat price.",
  },
  {
    title: "Submit",
    subtitle: "Check the details and save the fleet listing.",
  },
] as const;

export function RideManagementScreen() {
  const rideDraft = useAppStore((state) => state.rideDraft);
  const saveRideDraft = useAppStore((state) => state.saveRideDraft);
  const clearRideDraft = useAppStore((state) => state.clearRideDraft);
  const archivedRideIds = useAppStore((state) => state.archivedRideIds);
  const archiveRide = useAppStore((state) => state.archiveRide);
  const restoreRide = useAppStore((state) => state.restoreRide);

  const [rides, setRides] = useState<RideSummary[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [tripHistory, setTripHistory] = useState<TripLedgerEntry[]>([]);
  const [ledger, setLedger] = useState<TripLedgerEntry[]>([]);
  const [editingRideId, setEditingRideId] = useState("");
  const [form, setForm] = useState(rideDraft);
  const [busy, setBusy] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visibleRides = rides.filter((item) => !archivedRideIds.includes(item._id));

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };
      saveRideDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  };

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
      setMessage({ tone: "error", text: "Ride data could not be refreshed right now." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.vehicleModel.trim()) nextErrors.vehicleModel = "Vehicle model is required.";
      if (!form.vehicleNumber.trim()) nextErrors.vehicleNumber = "Vehicle number is required.";
      if (!form.routeFrom.trim()) nextErrors.routeFrom = "Starting place is required.";
      if (!form.routeTo.trim()) nextErrors.routeTo = "Destination is required.";
    }

    if (step === 2) {
      if (!form.pickupLat.trim()) nextErrors.pickupLat = "Pickup latitude is required.";
      if (!form.pickupLng.trim()) nextErrors.pickupLng = "Pickup longitude is required.";
      if (!form.dropLat.trim()) nextErrors.dropLat = "Drop latitude is required.";
      if (!form.dropLng.trim()) nextErrors.dropLng = "Drop longitude is required.";
    }

    if (step === 3) {
      if (!form.seatsAvailable.trim()) nextErrors.seatsAvailable = "Seats available is required.";
      if (!form.pricePerSeat.trim()) nextErrors.pricePerSeat = "Price per seat is required.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setEditingRideId("");
    setCurrentStep(1);
    setErrors({});
    clearRideDraft();
    setForm({
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
    });
  };

  const hydrateRide = (ride: RideSummary) => {
    const nextDraft = {
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
    };
    setEditingRideId(ride._id);
    setCurrentStep(1);
    setErrors({});
    setForm(nextDraft);
    saveRideDraft(nextDraft);
    setMessage({ tone: "info", text: "Fleet details loaded. Update the steps and save again." });
  };

  const saveDraft = () => {
    saveRideDraft(form);
    setMessage({ tone: "info", text: "Fleet draft saved on this device." });
  };

  const submitRide = async () => {
    if (![1, 2, 3].every((step) => validateStep(step))) {
      setCurrentStep(1);
      setMessage({ tone: "error", text: "Please complete the required fleet details first." });
      return;
    }

    const payload: RideDraft = {
      vehicleModel: form.vehicleModel.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      routeFrom: form.routeFrom.trim(),
      routeTo: form.routeTo.trim(),
      seatsAvailable: Number(form.seatsAvailable || 0),
      pricePerSeat: Number(form.pricePerSeat || 0),
      pickupLat: Number(form.pickupLat || 0),
      pickupLng: Number(form.pickupLng || 0),
      dropLat: Number(form.dropLat || 0),
      dropLng: Number(form.dropLng || 0),
      driverOnline: true,
    };

    setBusy(true);
    setMessage(null);
    try {
      if (editingRideId) {
        await partnerApi.updateRide(editingRideId, payload);
      } else {
        await partnerApi.createRide(payload);
      }
      resetForm();
      setMessage({ tone: "success", text: editingRideId ? "Fleet listing updated successfully." : "Fleet listing added successfully." });
      await loadData();
    } catch {
      setMessage({ tone: "error", text: "The fleet listing could not be saved to the backend." });
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
      setMessage({ tone: "success", text: "Seat count and price updated." });
      await loadData();
    } catch {
      setMessage({ tone: "error", text: "Seat or pricing changes could not be saved." });
    } finally {
      setBusy(false);
    }
  };

  const projectedEarnings = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [bookings]
  );

  const currentStepMeta = stepMeta[currentStep - 1];

  return (
    <Screen onRefresh={loadData} refreshing={busy}>
      <BrandHero
        eyebrow="Fleet management"
        title="Add fleet and"
        accent="manage rides."
        subtitle="This flow keeps vehicle setup short, clear, and easy to use."
      >
        <View style={styles.badges}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="car-multiple" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Simple form</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="map-pin" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Route details</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="save" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Draft save</Text>
          </View>
        </View>
      </BrandHero>

      {message ? <FeedbackBanner tone={message.tone} message={message.text} /> : null}

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Fleet" value={String(visibleRides.length)} hint="Active vehicles" />
        <KpiCard label="Bookings" value={String(bookings.length)} hint="Ride requests" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Earnings" value={`Rs ${projectedEarnings}`} hint="Confirmed total" />
        <KpiCard label="Ledger" value={String(ledger.length)} hint="Trip or payout entries" />
      </View>

      <SectionCard title="Add fleet" subtitle="Move step by step and save when you are ready.">
        <FormStepHeader currentStep={currentStep} totalSteps={4} title={currentStepMeta.title} subtitle={currentStepMeta.subtitle} />

        {currentStep === 1 ? (
          <>
            <TextField label="Vehicle model" value={form.vehicleModel} onChangeText={(value) => updateForm("vehicleModel", value)} placeholder="Innova Crysta" required error={errors.vehicleModel} />
            <TextField label="Vehicle number" value={form.vehicleNumber} onChangeText={(value) => updateForm("vehicleNumber", value)} placeholder="UK07 AB 1234" autoCapitalize="characters" required error={errors.vehicleNumber} />
            <TextField label="Route from" value={form.routeFrom} onChangeText={(value) => updateForm("routeFrom", value)} placeholder="Dehradun" required error={errors.routeFrom} />
            <TextField label="Route to" value={form.routeTo} onChangeText={(value) => updateForm("routeTo", value)} placeholder="Mussoorie" required error={errors.routeTo} />
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <TextField label="Pickup latitude" value={form.pickupLat} onChangeText={(value) => updateForm("pickupLat", value)} placeholder="30.3165" keyboardType="numeric" autoCapitalize="none" required error={errors.pickupLat} />
            <TextField label="Pickup longitude" value={form.pickupLng} onChangeText={(value) => updateForm("pickupLng", value)} placeholder="78.0322" keyboardType="numeric" autoCapitalize="none" required error={errors.pickupLng} />
            <TextField label="Drop latitude" value={form.dropLat} onChangeText={(value) => updateForm("dropLat", value)} placeholder="30.4598" keyboardType="numeric" autoCapitalize="none" required error={errors.dropLat} />
            <TextField label="Drop longitude" value={form.dropLng} onChangeText={(value) => updateForm("dropLng", value)} placeholder="78.0664" keyboardType="numeric" autoCapitalize="none" required error={errors.dropLng} />
            <FeedbackBanner tone="info" message="Vehicle photo upload is not connected yet, so this step focuses on route setup." />
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <TextField label="Seats available" value={form.seatsAvailable} onChangeText={(value) => updateForm("seatsAvailable", value)} placeholder="4" keyboardType="numeric" autoCapitalize="none" required error={errors.seatsAvailable} />
            <TextField label="Price per seat" value={form.pricePerSeat} onChangeText={(value) => updateForm("pricePerSeat", value)} placeholder="850" keyboardType="numeric" autoCapitalize="none" required error={errors.pricePerSeat} />
            <FeedbackBanner tone="info" message="You can change seats and price later from Manage Rides below." />
          </>
        ) : null}

        {currentStep === 4 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{form.vehicleModel || "New fleet listing"}</Text>
            <Text style={styles.summaryLine}>Vehicle number: {form.vehicleNumber || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Route: {form.routeFrom || "Start"} to {form.routeTo || "End"}</Text>
            <Text style={styles.summaryLine}>Seats: {form.seatsAvailable || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Price per seat: {form.pricePerSeat ? `Rs ${form.pricePerSeat}` : "Not added yet"}</Text>
            <Text style={styles.summaryHint}>If everything looks right, save the fleet listing now.</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          {currentStep > 1 ? <PrimaryButton title="Back" onPress={() => setCurrentStep((step) => step - 1)} variant="ghost" /> : null}
          {currentStep < 4 ? (
            <PrimaryButton
              title="Next"
              onPress={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep((step) => step + 1);
                }
              }}
            />
          ) : (
            <PrimaryButton title={editingRideId ? "Update fleet" : "Save fleet"} onPress={submitRide} loading={busy} />
          )}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <InlineActionButton title="Save draft" onPress={saveDraft} disabled={busy} />
          <InlineActionButton title="Clear form" onPress={resetForm} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Manage rides" subtitle="Edit active fleet listings or archive them from this app.">
        {visibleRides.length ? (
          visibleRides.map((ride) => (
            <ActionCard
              key={ride._id}
              title={ride.vehicleModel}
              detail={`${ride.routeFrom} to ${ride.routeTo} | ${ride.seatsAvailable} seats | Rs ${ride.pricePerSeat}/seat`}
              status={ride.driverOnline === false ? "offline" : ride.status || "live"}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Edit" onPress={() => hydrateRide(ride)} />
                <InlineActionButton title="Update seats and price" tone="primary" onPress={() => updateSeatAndPrice(ride)} disabled={busy} />
                <InlineActionButton
                  title="Archive"
                  onPress={() => {
                    archiveRide(ride._id);
                    setMessage({ tone: "info", text: "Fleet listing archived in the app. Backend delete is not enabled yet." });
                  }}
                />
              </View>
            </ActionCard>
          ))
        ) : (
          <EmptyState title="No active fleet" message="Add your first vehicle listing above to start getting ride bookings." icon="truck" />
        )}

        {archivedRideIds.length ? (
          <View className="mt-4">
            <Text className="mb-3 text-xs font-black uppercase tracking-[2px] text-white/55">Archived in app</Text>
            {rides
              .filter((item) => archivedRideIds.includes(item._id))
              .map((ride) => (
                <ActionCard key={`archived-${ride._id}`} title={ride.vehicleModel} detail={`${ride.routeFrom} to ${ride.routeTo}`} status="archived">
                  <InlineActionButton title="Restore" onPress={() => restoreRide(ride._id)} />
                </ActionCard>
              ))}
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Trip history" subtitle="Recent trip records and completed rides.">
        {tripHistory.length ? (
          tripHistory.map((entry) => <ListRow key={entry._id} title={entry.label} meta={`Rs ${entry.amount} | ${entry.createdAt}`} status={entry.status} />)
        ) : (
          <EmptyState title="No trip history yet" message="Completed ride records will appear here." icon="clock" />
        )}
      </SectionCard>

      <SectionCard title="Earnings" subtitle="Track ride income and payout records.">
        {ledger.length ? (
          ledger.map((entry) => <ListRow key={entry._id} title={entry.label} meta={`Rs ${entry.amount} | ${entry.createdAt}`} status={entry.status} />)
        ) : (
          <EmptyState title="No earnings records yet" message="Trip income and payout records will appear here." icon="credit-card" />
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
  footerRow: {
    marginTop: 4,
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLine: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryHint: {
    marginTop: 12,
    color: "#FDBA74",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
