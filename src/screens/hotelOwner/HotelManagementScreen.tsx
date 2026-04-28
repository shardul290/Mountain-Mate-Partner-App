import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

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
import type { HotelDraft, HotelSummary, InventoryDay, PartnerBooking } from "@/types";

const defaultHotelForm = {
  hotelName: "",
  location: "",
  description: "",
  pricePerNight: "",
  roomsAvailable: "",
  roomTypes: "",
  photoUrls: "",
};

const defaultInventoryForm = {
  date: new Date().toISOString().slice(0, 10),
  availableRooms: "",
  blockedRooms: "",
  pricePerNight: "",
};

export function HotelManagementScreen() {
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [inventory, setInventory] = useState<InventoryDay[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [editingHotelId, setEditingHotelId] = useState("");
  const [hotelForm, setHotelForm] = useState(defaultHotelForm);
  const [inventoryForm, setInventoryForm] = useState(defaultInventoryForm);
  const [busy, setBusy] = useState(false);

  const selectedHotel = hotels.find((item) => item._id === selectedHotelId) || hotels[0] || null;

  const loadData = async () => {
    setBusy(true);
    try {
      const [hotelData, incoming] = await Promise.all([partnerApi.getMyHotels(), partnerApi.getIncomingBookings()]);
      setHotels(hotelData);
      setBookings(incoming.filter((item) => item.bookingType === "Hotel"));
      const nextHotelId = selectedHotelId || hotelData[0]?._id || "";
      setSelectedHotelId(nextHotelId);
      if (nextHotelId) {
        const inventoryData = await partnerApi.getInventory(nextHotelId);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } else {
        setInventory([]);
      }
    } catch {
      Alert.alert("Sync issue", "We could not refresh the hotel workspace from the backend.");
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

  const resetHotelForm = () => {
    setEditingHotelId("");
    setHotelForm(defaultHotelForm);
  };

  const hydrateHotelForm = (hotel: HotelSummary) => {
    setEditingHotelId(hotel._id);
    setSelectedHotelId(hotel._id);
    setHotelForm({
      hotelName: hotel.hotelName || "",
      location: hotel.location || "",
      description: hotel.description || "",
      pricePerNight: String(hotel.pricePerNight || ""),
      roomsAvailable: String(hotel.roomsAvailable || ""),
      roomTypes: (hotel.roomTypes || []).join(", "),
      photoUrls: (hotel.photoUrls || []).join(", "),
    });
  };

  const submitHotel = async () => {
    const payload: HotelDraft = {
      hotelName: hotelForm.hotelName.trim(),
      location: hotelForm.location.trim(),
      description: hotelForm.description.trim(),
      pricePerNight: Number(hotelForm.pricePerNight || 0),
      roomsAvailable: Number(hotelForm.roomsAvailable || 0),
      roomTypes: hotelForm.roomTypes.split(",").map((item) => item.trim()).filter(Boolean),
      photoUrls: hotelForm.photoUrls.split(",").map((item) => item.trim()).filter(Boolean),
    };

    if (!payload.hotelName || !payload.location) {
      Alert.alert("Missing details", "Hotel name and location are required.");
      return;
    }

    setBusy(true);
    try {
      if (editingHotelId) {
        await partnerApi.updateHotel(editingHotelId, payload);
      } else {
        await partnerApi.createHotel(payload);
      }
      resetHotelForm();
      await loadData();
    } catch {
      Alert.alert("Save failed", "The hotel could not be saved to the backend.");
    } finally {
      setBusy(false);
    }
  };

  const submitInventory = async () => {
    const hotelId = selectedHotel?._id;
    if (!hotelId) {
      Alert.alert("Pick a hotel", "Select a hotel before updating rooms or pricing.");
      return;
    }

    setBusy(true);
    try {
      await partnerApi.updateInventory({
        hotelId,
        date: inventoryForm.date,
        availableRooms: Number(inventoryForm.availableRooms || 0),
        blockedRooms: Number(inventoryForm.blockedRooms || 0),
        pricePerNight: Number(inventoryForm.pricePerNight || 0),
      });
      setInventoryForm(defaultInventoryForm);
      const refreshed = await partnerApi.getInventory(hotelId);
      setInventory(Array.isArray(refreshed) ? refreshed : []);
    } catch {
      Alert.alert("Inventory failed", "The room availability update did not reach the backend.");
    } finally {
      setBusy(false);
    }
  };

  const updateBooking = async (bookingId: string, status: "confirmed" | "declined" | "cancelled") => {
    setBusy(true);
    try {
      if (status === "cancelled") {
        await partnerApi.cancelBooking(bookingId, "Cancelled from partner app calendar");
      } else {
        await partnerApi.updateIncomingBookingStatus(bookingId, status);
      }
      await loadData();
    } catch {
      Alert.alert("Booking update failed", "The booking status could not be updated.");
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
      setHotelForm((current) => ({
        ...current,
        photoUrls: current.photoUrls ? `${current.photoUrls}, ${result.assets[0].uri}` : result.assets[0].uri,
      }));
    }
  };

  const projectedRevenue = useMemo(
    () => bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [bookings]
  );

  return (
    <Screen>
      <BrandHero
        eyebrow="Hotel workspace"
        title="Manage stays,"
        accent="rooms, and bookings."
        subtitle="This is the partner control room for hotel creation, editing, inventory pricing, photos, and live booking actions."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Add hotels" />
          <SignalPill label="Room calendar" />
          <SignalPill label="Multi-property control" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Hotels" value={String(hotels.length)} hint="Linked properties" />
        <KpiCard label="Revenue" value={`Rs ${projectedRevenue}`} hint="Confirmed stay revenue" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Bookings" value={String(bookings.length)} hint="Active request volume" />
        <KpiCard label="Inventory" value={String(inventory.length)} hint="Calendar entries loaded" />
      </View>

      <SectionCard title="Hotel form" subtitle="Add new hotels or edit an existing listing from the same workspace">
        <TextField label="Hotel name" value={hotelForm.hotelName} onChangeText={(value) => setHotelForm((current) => ({ ...current, hotelName: value }))} placeholder="Mountain View Retreat" />
        <TextField label="Location" value={hotelForm.location} onChangeText={(value) => setHotelForm((current) => ({ ...current, location: value }))} placeholder="Mussoorie, Uttarakhand" />
        <TextField label="Description" value={hotelForm.description} onChangeText={(value) => setHotelForm((current) => ({ ...current, description: value }))} placeholder="Family stay with valley-facing rooms" multiline />
        <TextField label="Price per night" value={hotelForm.pricePerNight} onChangeText={(value) => setHotelForm((current) => ({ ...current, pricePerNight: value }))} placeholder="4500" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Rooms available" value={hotelForm.roomsAvailable} onChangeText={(value) => setHotelForm((current) => ({ ...current, roomsAvailable: value }))} placeholder="12" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Room types" value={hotelForm.roomTypes} onChangeText={(value) => setHotelForm((current) => ({ ...current, roomTypes: value }))} placeholder="Deluxe, Family Suite, Cottage" />
        <TextField label="Photo URLs or picked images" value={hotelForm.photoUrls} onChangeText={(value) => setHotelForm((current) => ({ ...current, photoUrls: value }))} placeholder="Comma-separated image URLs or local URIs" multiline autoCapitalize="none" />
        {hotelForm.photoUrls ? (
          <View className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-3">
            <Text className="mb-3 text-xs font-black uppercase tracking-[2px] text-white/60">Photo preview</Text>
            <Image source={{ uri: hotelForm.photoUrls.split(",")[0].trim() }} style={{ height: 160, borderRadius: 18 }} resizeMode="cover" />
          </View>
        ) : null}
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Pick photo" tone="primary" onPress={pickPhoto} disabled={busy} />
          <InlineActionButton title="New form" onPress={resetHotelForm} disabled={busy} />
        </View>
        <View className="mt-4">
          <PrimaryButton title={editingHotelId ? "Update hotel" : "Add hotel"} onPress={submitHotel} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Manage hotels" subtitle="Tap any property below to load it back into the form for editing">
        {hotels.length ? (
          hotels.map((hotel) => (
            <ActionCard
              key={hotel._id}
              title={hotel.hotelName}
              detail={`${hotel.location} | ${hotel.roomsAvailable} rooms | Rs ${hotel.pricePerNight}/night`}
              status={hotel.status || "live"}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Edit" onPress={() => hydrateHotelForm(hotel)} />
                <InlineActionButton title="Use for calendar" tone="primary" onPress={() => setSelectedHotelId(hotel._id)} />
              </View>
            </ActionCard>
          ))
        ) : (
          <Text className="text-sm text-white/70">No hotels available yet. Add your first property above.</Text>
        )}
      </SectionCard>

      <SectionCard title="Rooms, pricing, and calendar" subtitle="Update daily availability, blocked rooms, and price per night">
        <Text className="mb-3 text-sm text-white/70">
          Selected property: {selectedHotel?.hotelName || "None selected"}
        </Text>
        <TextField label="Date" value={inventoryForm.date} onChangeText={(value) => setInventoryForm((current) => ({ ...current, date: value }))} placeholder="2026-04-28" autoCapitalize="none" />
        <TextField label="Available rooms" value={inventoryForm.availableRooms} onChangeText={(value) => setInventoryForm((current) => ({ ...current, availableRooms: value }))} placeholder="8" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Blocked rooms" value={inventoryForm.blockedRooms} onChangeText={(value) => setInventoryForm((current) => ({ ...current, blockedRooms: value }))} placeholder="1" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Price per night" value={inventoryForm.pricePerNight} onChangeText={(value) => setInventoryForm((current) => ({ ...current, pricePerNight: value }))} placeholder="5200" keyboardType="numeric" autoCapitalize="none" />
        <PrimaryButton title="Update availability calendar" onPress={submitInventory} disabled={busy || !selectedHotel} />
        <View className="mt-4">
          {inventory.length ? (
            inventory.slice(0, 7).map((item) => (
              <ListRow
                key={`${item.date}-${item.availableRooms}`}
                title={item.date}
                meta={`Available ${item.availableRooms} | Blocked ${item.blockedRooms || 0} | Sold ${item.soldRooms || 0} | Rs ${item.pricePerNight || 0}`}
                status="calendar"
              />
            ))
          ) : (
            <Text className="text-sm text-white/70">No inventory entries returned for this hotel yet.</Text>
          )}
        </View>
      </SectionCard>

      <SectionCard title="Booking calendar and cancellations" subtitle="Confirm, decline, or cancel partner-side hotel bookings">
        {bookings.length ? (
          bookings.map((booking) => (
            <ActionCard
              key={booking._id}
              title={booking.listingLabel || selectedHotel?.hotelName || "Stay booking"}
              detail={`${booking.customerName} | ${booking.phoneNumber} | Rs ${booking.amount} | ${booking.startDate || booking.date || "Date TBA"}${booking.endDate ? ` to ${booking.endDate}` : ""}`}
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
          <Text className="text-sm text-white/70">No hotel bookings found in the current partner inbox.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}
