import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { SignalPill } from "@/components/ui/SignalPill";
import { TextField } from "@/components/ui/TextField";
import { partnerApi } from "@/services/api/partner";
import type { HotelSummary, PropertyLead } from "@/types";

export function PropertyManagementScreen() {
  const [properties, setProperties] = useState<HotelSummary[]>([]);
  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setBusy(true);
    try {
      const [hotelFallback, liveLeads] = await Promise.all([partnerApi.getMyHotels(), partnerApi.getPropertyLeads()]);
      setProperties(hotelFallback);
      setLeads(liveLeads);
    } catch {
      Alert.alert("Sync issue", "We could not refresh property data from the backend.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProperties = properties.filter((item) =>
    `${item.hotelName} ${item.location}`.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <Screen>
      <BrandHero
        eyebrow="Property workspace"
        title="Manage inventory"
        accent="and leads."
        subtitle="Property partners get a multi-listing console with search, lead visibility, and a base workflow ready for dedicated property APIs."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Lead pipeline" />
          <SignalPill label="Search listings" />
          <SignalPill label="Multi-property view" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Properties" value={String(properties.length)} hint="Partner-linked listings" />
        <KpiCard label="Leads" value={String(leads.length)} hint="Buyer or renter demand" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Filtered" value={String(filteredProperties.length)} hint="Search results" />
        <KpiCard label="Mode" value={busy ? "Syncing" : "Ready"} hint="Workspace state" />
      </View>

      <SectionCard title="Property search" subtitle="Quickly jump between multiple managed properties">
        <TextField label="Search property or area" value={filter} onChangeText={setFilter} placeholder="Search by title or location" />
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Refresh" tone="primary" onPress={loadData} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Managed properties" subtitle="Current live property dataset available to the partner account">
        {filteredProperties.length ? (
          filteredProperties.map((property) => (
            <ListRow
              key={property._id}
              title={property.hotelName}
              meta={`${property.location} | ${property.roomsAvailable} units | Rs ${property.pricePerNight}/night`}
              status={property.status || "live"}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">No property records match the current filter.</Text>
        )}
      </SectionCard>

      <SectionCard title="Lead inbox" subtitle="Dedicated property leads will appear here as your backend grows">
        {leads.length ? (
          leads.map((lead) => (
            <ActionCard
              key={lead._id}
              title={lead.title}
              detail={`${lead.customerName}${lead.location ? ` | ${lead.location}` : ""}${lead.budget ? ` | Budget Rs ${lead.budget}` : ""}${lead.message ? ` | ${lead.message}` : ""}`}
              status={lead.status}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">
            No dedicated property leads were returned yet. This module is connected and ready for the backend lead system.
          </Text>
        )}
      </SectionCard>
    </Screen>
  );
}
