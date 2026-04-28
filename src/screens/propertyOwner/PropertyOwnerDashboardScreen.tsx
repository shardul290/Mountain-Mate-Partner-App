import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { BackendStatusCard } from "@/components/ui/BackendStatusCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { SignalPill } from "@/components/ui/SignalPill";
import { partnerApi } from "@/services/api/partner";
import type { BackendHealth, PartnerBooking } from "@/types";

export function PropertyOwnerDashboardScreen() {
  const [properties, setProperties] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<PartnerBooking[]>([]);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  useEffect(() => {
    Promise.all([
      partnerApi.getMyHotels().catch(() => []),
      partnerApi.getIncomingBookings().catch(() => []),
      partnerApi.getBackendHealth().catch(() => null),
    ]).then(([hotelData, incomingData, backendHealth]) => {
      setProperties(hotelData);
      setIncoming((incomingData as PartnerBooking[]).filter((item) => item.bookingType === "Hotel"));
      setHealth(backendHealth as BackendHealth | null);
    });
  }, []);

  return (
    <Screen>
      <BrandHero
        eyebrow="Property lead desk"
        title="Turn interest"
        accent="into visits."
        subtitle="Visually aligned with the web brand, but this role still needs dedicated backend models for full lead and inquiry operations."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Homestay growth" />
          <SignalPill label="Lead pipeline" />
          <SignalPill label="Inquiry conversion" />
        </View>
      </BrandHero>
      <View className="mt-6 flex-row gap-3">
        <KpiCard label="Properties" value={String(properties.length)} hint="Current hotel/homestay records from live backend" />
        <KpiCard label="Leads" value={String(incoming.length)} hint="Current partner booking demand as interim lead signal" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Revenue" value={`Rs ${incoming.reduce((sum, item) => sum + Number(item.amount || 0), 0)}`} hint="Interim total from current incoming stay demand" />
        <KpiCard label="Response" value="< 15m" hint="Target first-response SLA" />
      </View>
      <SectionCard title="Managed properties" subtitle="Using live hotel/homestay records from your existing backend as the first working property-owner view">
        {properties.length ? (
          properties.map((property) => (
            <ListRow
              key={property._id}
              title={property.hotelName}
              meta={`${property.location} | ${property.roomsAvailable} rooms | Rs ${property.pricePerNight}/night`}
              status={property.status || "pending"}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">No properties linked to this account yet.</Text>
        )}
      </SectionCard>
      <BackendStatusCard
        health={health}
        detail="This role is connected to the same backend foundation, but it is currently reusing hotel data until dedicated property-owner APIs are built."
      />
      <ActionCard
        title="What still needs backend work"
        detail="Land listing workflows, inquiry chat, property lead assignment, and dedicated owner analytics are not in the backend yet. Right now this screen reuses live stay data so the role stays functional instead of empty."
        status="Partial"
      />
    </Screen>
  );
}
