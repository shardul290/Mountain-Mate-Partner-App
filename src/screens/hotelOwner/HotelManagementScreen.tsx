import { useEffect, useMemo, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
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
import type { HotelDraft, HotelSummary, InventoryDay, PartnerBooking } from "@/types";

const stepMeta = [
  {
    title: "Basic details",
    subtitle: "Add the hotel name, place, and a short description.",
  },
  {
    title: "Photos",
    subtitle: "Add at least one photo link or pick a hotel photo.",
  },
  {
    title: "Pricing",
    subtitle: "Set room count and your starting price.",
  },
  {
    title: "Submit",
    subtitle: "Check the details and save the listing.",
  },
] as const;

const defaultInventoryForm = {
  date: new Date().toISOString().slice(0, 10),
  totalRooms: "",
  bookedRooms: "",
  price: "",
};

export function HotelManagementScreen() {
  const hotelDraft = useAppStore((state) => state.hotelDraft);
  const saveHotelDraft = useAppStore((state) => state.saveHotelDraft);
  const clearHotelDraft = useAppStore((state) => state.clearHotelDraft);
  const archivedHotelIds = useAppStore((state) => state.archivedHotelIds);
  const archiveHotel = useAppStore((state) => state.archiveHotel);
  const restoreHotel = useAppStore((state) => state.restoreHotel);

  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [inventory, setInventory] = useState<InventoryDay[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [editingHotelId, setEditingHotelId] = useState("");
  const [hotelForm, setHotelForm] = useState(hotelDraft);
  const [inventoryForm, setInventoryForm] = useState(defaultInventoryForm);
  const [busy, setBusy] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visibleHotels = hotels.filter((item) => !archivedHotelIds.includes(item._id));
  const selectedHotel = visibleHotels.find((item) => item._id === selectedHotelId) || visibleHotels[0] || null;

  const updateHotelForm = (field: keyof typeof hotelForm, value: string) => {
    setHotelForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };
      saveHotelDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const loadData = async () => {
    setBusy(true);
    try {
      const [hotelData, incoming] = await Promise.all([partnerApi.getMyHotels(), partnerApi.getIncomingBookings()]);
      setHotels(hotelData);
      setBookings(incoming.filter((item) => item.bookingType === "Hotel"));
      const nextHotelId = selectedHotelId || hotelData.find((item) => !archivedHotelIds.includes(item._id))?._id || "";
      setSelectedHotelId(nextHotelId);
      if (nextHotelId) {
        const inventoryData = await partnerApi.getInventory(nextHotelId);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } else {
        setInventory([]);
      }
    } catch {
      setMessage({ tone: "error", text: "Hotel data could not be refreshed right now." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return;
    partnerApi
      .getInventory(selectedHotelId)
      .then((result) => setInventory(Array.isArray(result) ? result : []))
      .catch(() => setInventory([]));
  }, [selectedHotelId]);

  useEffect(() => {
    if (!selectedHotel) return;
    setInventoryForm((current) => ({
      ...current,
      totalRooms: current.totalRooms || String(selectedHotel.roomsAvailable || ""),
      price: current.price || String(selectedHotel.pricePerNight || ""),
    }));
  }, [selectedHotel?._id]);

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!hotelForm.hotelName.trim()) nextErrors.hotelName = "Hotel name is required.";
      if (!hotelForm.location.trim()) nextErrors.location = "Location is required.";
      if (!hotelForm.description.trim()) nextErrors.description = "Add a short hotel description.";
    }

    if (step === 2) {
      if (!hotelForm.photoUrls.trim()) nextErrors.photoUrls = "Add at least one photo link or picked image.";
    }

    if (step === 3) {
      if (!hotelForm.pricePerNight.trim()) nextErrors.pricePerNight = "Price per night is required.";
      if (!hotelForm.roomsAvailable.trim()) nextErrors.roomsAvailable = "Rooms available is required.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const resetHotelForm = () => {
    setEditingHotelId("");
    setCurrentStep(1);
    setErrors({});
    clearHotelDraft();
    setHotelForm({
      hotelName: "",
      location: "",
      description: "",
      pricePerNight: "",
      roomsAvailable: "",
      roomTypes: "",
      photoUrls: "",
    });
  };

  const hydrateHotelForm = (hotel: HotelSummary) => {
    const nextDraft = {
      hotelName: hotel.hotelName || "",
      location: hotel.location || "",
      description: hotel.description || "",
      pricePerNight: String(hotel.pricePerNight || ""),
      roomsAvailable: String(hotel.roomsAvailable || ""),
      roomTypes: (hotel.roomTypes || []).join(", "),
      photoUrls: (hotel.photoUrls || []).join(", "),
    };
    setEditingHotelId(hotel._id);
    setSelectedHotelId(hotel._id);
    setCurrentStep(1);
    setErrors({});
    setHotelForm(nextDraft);
    saveHotelDraft(nextDraft);
    setMessage({ tone: "info", text: "Hotel details loaded. Update the steps and save again." });
  };

  const saveDraft = () => {
    saveHotelDraft(hotelForm);
    setMessage({ tone: "info", text: "Draft saved on this device." });
  };

  const submitHotel = async () => {
    if (![1, 2, 3].every((step) => validateStep(step))) {
      setCurrentStep(1);
      setMessage({ tone: "error", text: "Please complete the required hotel details first." });
      return;
    }

    const payload: HotelDraft = {
      hotelName: hotelForm.hotelName.trim(),
      location: hotelForm.location.trim(),
      description: hotelForm.description.trim(),
      pricePerNight: Number(hotelForm.pricePerNight || 0),
      roomsAvailable: Number(hotelForm.roomsAvailable || 0),
      roomTypes: hotelForm.roomTypes.split(",").map((item) => item.trim()).filter(Boolean),
      photoUrls: hotelForm.photoUrls.split(",").map((item) => item.trim()).filter(Boolean),
    };

    setBusy(true);
    setMessage(null);
    try {
      if (editingHotelId) {
        await partnerApi.updateHotel(editingHotelId, payload);
      } else {
        await partnerApi.createHotel(payload);
      }
      resetHotelForm();
      setMessage({ tone: "success", text: editingHotelId ? "Hotel updated successfully." : "Hotel added successfully." });
      await loadData();
    } catch {
      setMessage({ tone: "error", text: "The hotel could not be saved to the backend." });
    } finally {
      setBusy(false);
    }
  };

  const submitInventory = async () => {
    const hotelId = selectedHotel?._id;
    if (!hotelId) {
      setMessage({ tone: "info", text: "Choose a hotel first to update room availability." });
      return;
    }

    setBusy(true);
    try {
      await partnerApi.updateInventory({
        hotelId,
        date: inventoryForm.date,
        totalRooms: Number(inventoryForm.totalRooms || selectedHotel.roomsAvailable || 0),
        bookedRooms: Number(inventoryForm.bookedRooms || 0),
        price: Number(inventoryForm.price || selectedHotel.pricePerNight || 0),
      });
      setInventoryForm(defaultInventoryForm);
      const refreshed = await partnerApi.getInventory(hotelId);
      setInventory(Array.isArray(refreshed) ? refreshed : []);
      setMessage({ tone: "success", text: "Room availability updated." });
    } catch {
      setMessage({ tone: "error", text: "Room availability could not be saved." });
    } finally {
      setBusy(false);
    }
  };

  const updateBooking = async (bookingId: string, status: "confirmed" | "declined" | "cancelled") => {
    setBusy(true);
    try {
      if (status === "cancelled") {
        await partnerApi.cancelBooking(bookingId, "Cancelled from stay manager");
      } else {
        await partnerApi.updateIncomingBookingStatus(bookingId, status);
      }
      setMessage({ tone: "success", text: `Booking marked as ${status}.` });
      await loadData();
    } catch {
      setMessage({ tone: "error", text: "Booking status could not be updated." });
    } finally {
      setBusy(false);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      updateHotelForm("photoUrls", hotelForm.photoUrls ? `${hotelForm.photoUrls}, ${result.assets[0].uri}` : result.assets[0].uri);
    }
  };

  const projectedRevenue = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [bookings]
  );

  const currentStepMeta = stepMeta[currentStep - 1];

  return (
    <Screen onRefresh={loadData} refreshing={busy}>
      <BrandHero
        eyebrow="Stay management"
        title="Add hotel and"
        accent="manage stays."
        subtitle="This flow keeps hotel setup short, clear, and easy to follow."
      >
        <View style={styles.badges}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="office-building-plus-outline" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Simple form</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="save" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Draft save</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="calendar" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Manage rooms</Text>
          </View>
        </View>
      </BrandHero>

      {message ? <FeedbackBanner tone={message.tone} message={message.text} /> : null}

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Hotels" value={String(visibleHotels.length)} hint="Active hotel listings" />
        <KpiCard label="Earnings" value={`Rs ${projectedRevenue}`} hint="Confirmed stay total" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Bookings" value={String(bookings.length)} hint="Stay requests" />
        <KpiCard label="Pending" value={String(bookings.filter((item) => item.status === "pending").length)} hint="Need action" />
      </View>

      <SectionCard title="Add hotel" subtitle="Move step by step and save when you are ready.">
        <FormStepHeader currentStep={currentStep} totalSteps={4} title={currentStepMeta.title} subtitle={currentStepMeta.subtitle} />

        {currentStep === 1 ? (
          <>
            <TextField label="Hotel name" value={hotelForm.hotelName} onChangeText={(value) => updateHotelForm("hotelName", value)} placeholder="Mountain View Retreat" required error={errors.hotelName} />
            <TextField label="Location" value={hotelForm.location} onChangeText={(value) => updateHotelForm("location", value)} placeholder="Mussoorie, Uttarakhand" required error={errors.location} />
            <TextField label="Description" value={hotelForm.description} onChangeText={(value) => updateHotelForm("description", value)} placeholder="Family stay with valley-facing rooms" multiline required error={errors.description} helperText="Keep it short and simple." />
            <TextField label="Room types" value={hotelForm.roomTypes} onChangeText={(value) => updateHotelForm("roomTypes", value)} placeholder="Deluxe, Family Suite, Cottage" helperText="Optional. Separate room types with commas." />
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <TextField label="Photos" value={hotelForm.photoUrls} onChangeText={(value) => updateHotelForm("photoUrls", value)} placeholder="Paste image links or pick a photo" multiline autoCapitalize="none" required error={errors.photoUrls} helperText="Add one or more photo links separated by commas." />
            <View className="mb-4 flex-row flex-wrap gap-2">
              <InlineActionButton title="Pick photo" tone="primary" onPress={pickPhoto} disabled={busy} />
              <InlineActionButton title="Save draft" onPress={saveDraft} disabled={busy} />
            </View>
            {hotelForm.photoUrls ? (
              <View className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <Text className="mb-3 text-xs font-black uppercase tracking-[2px] text-white/60">Photo preview</Text>
                <Image source={{ uri: hotelForm.photoUrls.split(",")[0].trim() }} style={{ height: 180, borderRadius: 18 }} resizeMode="cover" />
              </View>
            ) : (
              <EmptyState title="No photo yet" message="Add a hotel photo to build trust with customers." icon="image" />
            )}
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <TextField label="Price per night" value={hotelForm.pricePerNight} onChangeText={(value) => updateHotelForm("pricePerNight", value)} placeholder="4500" keyboardType="numeric" autoCapitalize="none" required error={errors.pricePerNight} />
            <TextField label="Rooms available" value={hotelForm.roomsAvailable} onChangeText={(value) => updateHotelForm("roomsAvailable", value)} placeholder="12" keyboardType="numeric" autoCapitalize="none" required error={errors.roomsAvailable} />
            <FeedbackBanner tone="info" message="You can change room price and room count later from Manage Rooms below." />
          </>
        ) : null}

        {currentStep === 4 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{hotelForm.hotelName || "New hotel"}</Text>
            <Text style={styles.summaryLine}>Location: {hotelForm.location || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Price: {hotelForm.pricePerNight ? `Rs ${hotelForm.pricePerNight}` : "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Rooms: {hotelForm.roomsAvailable || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Photos: {hotelForm.photoUrls ? hotelForm.photoUrls.split(",").filter(Boolean).length : 0}</Text>
            <Text style={styles.summaryHint}>If everything looks good, save your hotel now.</Text>
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
            <PrimaryButton title={editingHotelId ? "Update hotel" : "Save hotel"} onPress={submitHotel} loading={busy} />
          )}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <InlineActionButton title="Save draft" onPress={saveDraft} disabled={busy} />
          <InlineActionButton title="Clear form" onPress={resetHotelForm} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Manage stays" subtitle="Edit active hotels or archive them from this app.">
        {visibleHotels.length ? (
          visibleHotels.map((hotel) => (
            <ActionCard
              key={hotel._id}
              title={hotel.hotelName}
              detail={`${hotel.location} | ${hotel.roomsAvailable} rooms | Rs ${hotel.pricePerNight}/night`}
              status={hotel.status || "live"}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Edit" onPress={() => hydrateHotelForm(hotel)} />
                <InlineActionButton title="Manage rooms" tone="primary" onPress={() => setSelectedHotelId(hotel._id)} />
                <InlineActionButton
                  title="Archive"
                  onPress={() => {
                    archiveHotel(hotel._id);
                    if (selectedHotelId === hotel._id) {
                      setSelectedHotelId("");
                    }
                    setMessage({ tone: "info", text: "Hotel archived in the app. Backend delete is not enabled yet." });
                  }}
                />
              </View>
            </ActionCard>
          ))
        ) : (
          <EmptyState title="No active hotels" message="Add your first hotel listing above to start getting stay bookings." icon="home" />
        )}

        {archivedHotelIds.length ? (
          <View className="mt-4">
            <Text className="mb-3 text-xs font-black uppercase tracking-[2px] text-white/55">Archived in app</Text>
            {hotels
              .filter((item) => archivedHotelIds.includes(item._id))
              .map((hotel) => (
                <ActionCard key={`archived-${hotel._id}`} title={hotel.hotelName} detail={`${hotel.location} | Rs ${hotel.pricePerNight}/night`} status="archived">
                  <InlineActionButton title="Restore" onPress={() => restoreHotel(hotel._id)} />
                </ActionCard>
              ))}
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Manage rooms" subtitle="Update room count and room price for the selected hotel.">
        <Text className="mb-3 text-sm text-white/70">Selected hotel: {selectedHotel?.hotelName || "None selected"}</Text>
        <TextField label="Date" value={inventoryForm.date} onChangeText={(value) => setInventoryForm((current) => ({ ...current, date: value }))} placeholder="2026-04-30" autoCapitalize="none" required />
        <TextField label="Total rooms" value={inventoryForm.totalRooms} onChangeText={(value) => setInventoryForm((current) => ({ ...current, totalRooms: value }))} placeholder={String(selectedHotel?.roomsAvailable || 8)} keyboardType="numeric" autoCapitalize="none" required />
        <TextField label="Booked rooms" value={inventoryForm.bookedRooms} onChangeText={(value) => setInventoryForm((current) => ({ ...current, bookedRooms: value }))} placeholder="1" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Price per night" value={inventoryForm.price} onChangeText={(value) => setInventoryForm((current) => ({ ...current, price: value }))} placeholder={String(selectedHotel?.pricePerNight || 5200)} keyboardType="numeric" autoCapitalize="none" required />
        <PrimaryButton title="Save room details" onPress={submitInventory} disabled={!selectedHotel} loading={busy} />
        <View className="mt-4">
          {inventory.length ? (
            inventory.slice(0, 7).map((item) => (
              <ListRow
                key={`${item.date}-${item.availableRooms}`}
                title={item.date}
                meta={`Available ${item.availableRooms} | Booked ${item.bookedRooms || 0} | Total ${item.totalRooms || 0} | Rs ${item.price || item.pricePerNight || 0}`}
                status="rooms"
              />
            ))
          ) : (
            <EmptyState title="No room updates yet" message="Save room details and they will appear here." icon="calendar" />
          )}
        </View>
      </SectionCard>

      <SectionCard title="Stay bookings" subtitle="Confirm or decline incoming stay requests.">
        {bookings.length ? (
          bookings.map((booking) => (
            <ActionCard
              key={booking._id}
              title={booking.listingLabel || selectedHotel?.hotelName || "Stay booking"}
              detail={`${booking.customerName} | ${booking.phoneNumber} | Rs ${booking.amount} | ${booking.startDate || booking.date || "Date not set"}`}
              status={booking.status}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Confirm" tone="primary" onPress={() => updateBooking(booking._id, "confirmed")} disabled={busy} />
                <InlineActionButton title="Decline" tone="danger" onPress={() => updateBooking(booking._id, "declined")} disabled={busy} />
                <InlineActionButton title="Cancel" onPress={() => updateBooking(booking._id, "cancelled")} disabled={busy} />
              </View>
            </ActionCard>
          ))
        ) : (
          <EmptyState title="No stay bookings" message="New stay requests will appear here when customers book your hotel." icon="briefcase" />
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
