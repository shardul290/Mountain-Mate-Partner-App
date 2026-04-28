import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import * as Location from "expo-location";

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
import { useAppStore } from "@/store/useAppStore";
import type { NearbyRequest, RideSummary, TrackingSnapshot } from "@/types";
import { buildGoogleMapsDirectionsUrl, estimateEtaMinutes, haversineKm, toNumber } from "@/utils/location";

export function LiveOperationsScreen() {
  const role = useAppStore((state) => state.selectedRole);
  const [rides, setRides] = useState<RideSummary[]>([]);
  const [selectedRideId, setSelectedRideId] = useState("");
  const [snapshot, setSnapshot] = useState<TrackingSnapshot | null>(null);
  const [nearby, setNearby] = useState<NearbyRequest[]>([]);
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropLat, setDropLat] = useState("");
  const [dropLng, setDropLng] = useState("");
  const [currentLat, setCurrentLat] = useState("");
  const [currentLng, setCurrentLng] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [sosNote, setSosNote] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedRide = rides.find((ride) => ride._id === selectedRideId) || rides[0] || null;

  const loadData = async () => {
    setBusy(true);
    try {
      const rideData = await partnerApi.getMyRides();
      setRides(rideData);
      const nextRideId = selectedRideId || rideData[0]?._id || "";
      setSelectedRideId(nextRideId);
      if (nextRideId) {
        const currentSnapshot = await partnerApi.getTrackingSnapshot(nextRideId);
        setSnapshot(currentSnapshot);
        if (currentSnapshot) {
          setCurrentLat(currentSnapshot.lat ? String(currentSnapshot.lat) : "");
          setCurrentLng(currentSnapshot.lng ? String(currentSnapshot.lng) : "");
          setPickupLat(currentSnapshot.pickupLat ? String(currentSnapshot.pickupLat) : "");
          setPickupLng(currentSnapshot.pickupLng ? String(currentSnapshot.pickupLng) : "");
          setDropLat(currentSnapshot.dropLat ? String(currentSnapshot.dropLat) : "");
          setDropLng(currentSnapshot.dropLng ? String(currentSnapshot.dropLng) : "");
        }
      }
    } catch {
      if (role === "driver") {
        Alert.alert("Sync issue", "We could not load live route data from the backend.");
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pickupLatNum = toNumber(pickupLat);
  const pickupLngNum = toNumber(pickupLng);
  const dropLatNum = toNumber(dropLat);
  const dropLngNum = toNumber(dropLng);
  const currentLatNum = toNumber(currentLat);
  const currentLngNum = toNumber(currentLng);

  const routeDistanceKm = useMemo(() => {
    if (
      typeof pickupLatNum !== "number" ||
      typeof pickupLngNum !== "number" ||
      typeof dropLatNum !== "number" ||
      typeof dropLngNum !== "number"
    ) {
      return 0;
    }

    return haversineKm(pickupLatNum, pickupLngNum, dropLatNum, dropLngNum);
  }, [dropLatNum, dropLngNum, pickupLatNum, pickupLngNum]);

  const routeEtaMinutes = estimateEtaMinutes(routeDistanceKm);

  const discoverNearby = async () => {
    setBusy(true);
    try {
      const result = await partnerApi.getNearbyRequests({ lat: currentLatNum, lng: currentLngNum });
      setNearby(
        result.map((item) => ({
          ...item,
          distanceKm: item.distanceKm ?? (routeDistanceKm || undefined),
          etaMinutes: item.etaMinutes ?? (routeEtaMinutes || undefined),
        }))
      );
    } catch {
      Alert.alert("Discovery failed", "Nearby requests could not be loaded.");
    } finally {
      setBusy(false);
    }
  };

  const useDeviceLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location unavailable", "Foreground location permission was denied.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLat(String(position.coords.latitude));
      setCurrentLng(String(position.coords.longitude));
    } catch {
      const geo = (globalThis as any).navigator?.geolocation as
        | { getCurrentPosition: (success: (position: any) => void, error?: () => void, options?: any) => void }
        | undefined;
      if (!geo) {
        Alert.alert("Location unavailable", "Automatic GPS is not available here. Enter coordinates manually.");
        return;
      }

      geo.getCurrentPosition(
        (position) => {
          setCurrentLat(String(position.coords.latitude));
          setCurrentLng(String(position.coords.longitude));
        },
        () => Alert.alert("Location unavailable", "GPS access was denied or failed."),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }
  };

  const saveLiveLocation = async () => {
    if (!selectedRide?._id || typeof currentLatNum !== "number" || typeof currentLngNum !== "number") {
      Alert.alert("Missing location", "Select a ride and provide current coordinates.");
      return;
    }

    setBusy(true);
    try {
      await partnerApi.updateLiveLocation({
        rideId: selectedRide._id,
        lat: currentLatNum,
        lng: currentLngNum,
        pickupLat: pickupLatNum,
        pickupLng: pickupLngNum,
        dropLat: dropLatNum,
        dropLng: dropLngNum,
      });
      await loadData();
      Alert.alert("Location updated", "The live tracking coordinates were sent to the backend.");
    } catch {
      Alert.alert("Tracking failed", "The live location could not be synced.");
    } finally {
      setBusy(false);
    }
  };

  const openGoogleMaps = async () => {
    const url = buildGoogleMapsDirectionsUrl({
      pickupLat: pickupLatNum,
      pickupLng: pickupLngNum,
      dropLat: dropLatNum,
      dropLng: dropLngNum,
    });

    if (!url) {
      Alert.alert("Missing route", "Add pickup and drop coordinates first.");
      return;
    }

    await Linking.openURL(url);
  };

  const shareTrip = async () => {
    if (!selectedRide?._id || !emergencyContact.trim()) {
      Alert.alert("Missing details", "Add an emergency contact before sharing the trip.");
      return;
    }

    setBusy(true);
    try {
      const shareUrl = buildGoogleMapsDirectionsUrl({
        pickupLat: pickupLatNum,
        pickupLng: pickupLngNum,
        dropLat: dropLatNum,
        dropLng: dropLngNum,
      }) || undefined;
      await partnerApi.shareTripStatus({
        rideId: selectedRide._id,
        emergencyContact: emergencyContact.trim(),
        shareUrl,
      });
      Alert.alert("Trip shared", "Live trip details were sent to the backend share flow.");
    } catch {
      Alert.alert("Share failed", "Trip sharing could not be triggered.");
    } finally {
      setBusy(false);
    }
  };

  const raiseSos = async () => {
    if (!selectedRide?._id) {
      Alert.alert("No ride selected", "Select a ride before sending an SOS alert.");
      return;
    }

    setBusy(true);
    try {
      await partnerApi.raiseSos({
        rideId: selectedRide._id,
        lat: currentLatNum,
        lng: currentLngNum,
        note: sosNote.trim(),
      });
      Alert.alert("SOS triggered", "Emergency details were sent to the backend.");
    } catch {
      Alert.alert("SOS failed", "The emergency alert could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  if (role !== "driver") {
    return (
      <Screen>
        <BrandHero
          eyebrow="Live workspace"
          title="Logistics and"
          accent="tracking."
          subtitle="This live operations tab is optimized for driver partners. It stays available across roles so future maps and field logistics can grow into a shared operations layer."
        >
          <View className="flex-row flex-wrap gap-2">
            <SignalPill label="Maps-ready" />
            <SignalPill label="Shared logistics layer" />
          </View>
        </BrandHero>
        <SectionCard title="Role note" subtitle="Driver-specific ride maps, SOS, and live trip tracking are the main features here right now">
          <Text className="text-sm leading-6 text-white/70">
            Switch to a driver partner account to use live route preview, nearby request discovery, ETA calculations, trip sharing, and SOS controls.
          </Text>
        </SectionCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <BrandHero
        eyebrow="Live operations"
        title="Map, track,"
        accent="and respond."
        subtitle="This is the Rapido-style operations desk with route preview, pickup and drop coordinates, live tracking sync, ETA math, nearby request discovery, and SOS controls."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Google Maps" />
          <SignalPill label="Live tracking" />
          <SignalPill label="SOS + trip sharing" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Vehicles" value={String(rides.length)} hint="Tracking-capable rides" />
        <KpiCard label="Nearby" value={String(nearby.length)} hint="Discovered requests" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="ETA" value={`${routeEtaMinutes}m`} hint="Calculated route ETA" />
        <KpiCard label="Distance" value={`${routeDistanceKm.toFixed(1)} km`} hint="Calculated route distance" />
      </View>

      <SectionCard title="Pickup, drop, and route preview" subtitle="Enter coordinates to preview the ride route and calculate ETA">
        <Text className="mb-3 text-sm text-white/70">Selected ride: {selectedRide?.vehicleModel || "No ride selected"}</Text>
        <TextField label="Pickup latitude" value={pickupLat} onChangeText={setPickupLat} placeholder="30.3165" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Pickup longitude" value={pickupLng} onChangeText={setPickupLng} placeholder="78.0322" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Drop latitude" value={dropLat} onChangeText={setDropLat} placeholder="30.4598" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Drop longitude" value={dropLng} onChangeText={setDropLng} placeholder="78.0664" keyboardType="numeric" autoCapitalize="none" />
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Open in Google Maps" tone="primary" onPress={openGoogleMaps} />
          <InlineActionButton title="Use device GPS" onPress={useDeviceLocation} />
        </View>
      </SectionCard>

      <SectionCard title="Live driver location" subtitle="Push your current coordinates to the backend tracking layer">
        <TextField label="Current latitude" value={currentLat} onChangeText={setCurrentLat} placeholder="30.3255" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="Current longitude" value={currentLng} onChangeText={setCurrentLng} placeholder="78.0431" keyboardType="numeric" autoCapitalize="none" />
        <PrimaryButton title="Sync live location" onPress={saveLiveLocation} disabled={busy} />
        {snapshot ? <Text className="mt-3 text-sm text-white/70">Last backend snapshot: {snapshot.updatedAt || "No timestamp"} | {snapshot.status || "No status"}</Text> : null}
      </SectionCard>

      <SectionCard title="Nearby booking discovery" subtitle="Fetch nearby ride demand for the current driver location">
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Discover requests" tone="primary" onPress={discoverNearby} disabled={busy} />
        </View>
        <View className="mt-4">
          {nearby.length ? nearby.map((request) => <ListRow key={request._id} title={`${request.pickupLabel} to ${request.dropLabel}`} meta={`${request.customerName} | ${request.distanceKm || 0} km | ${request.etaMinutes || 0} min | Rs ${request.amount || 0}`} status={request.status || "new"} />) : <Text className="text-sm text-white/70">No nearby requests loaded yet.</Text>}
        </View>
      </SectionCard>

      <SectionCard title="Emergency and trip sharing" subtitle="Share active trip details or raise SOS alerts">
        <TextField label="Emergency contact" value={emergencyContact} onChangeText={setEmergencyContact} placeholder="+91 98XXXXXXXX" keyboardType="phone-pad" autoCapitalize="none" />
        <TextField label="SOS note" value={sosNote} onChangeText={setSosNote} placeholder="Describe the issue or exact risk" multiline />
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Share trip" tone="primary" onPress={shareTrip} disabled={busy} />
          <InlineActionButton title="Send SOS" tone="danger" onPress={raiseSos} disabled={busy} />
        </View>
      </SectionCard>
    </Screen>
  );
}
