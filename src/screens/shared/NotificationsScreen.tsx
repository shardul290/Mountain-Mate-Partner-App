import { useEffect, useState } from "react";
import { Text } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { partnerApi } from "@/services/api/partner";
import type { PartnerNotification } from "@/types";

export function NotificationsScreen() {
  const [items, setItems] = useState<PartnerNotification[]>([]);

  useEffect(() => {
    partnerApi.getNotifications().then((res) => setItems(res.data || [])).catch(() => setItems([]));
  }, []);

  return (
    <Screen>
      <BrandHero
        eyebrow="Live signal feed"
        title="Alerts"
        accent="and updates."
        subtitle="New booking requests, ride demand, admin alerts, and operational follow-ups will show up here."
      />
      <SectionCard title="Live updates" subtitle="Bookings, rides, inquiries, and admin alerts">
        {items.length ? (
          items.map((item) => <ListRow key={item._id} title={item.title} meta={item.message} status={item.read ? "read" : "new"} />)
        ) : (
          <Text className="text-sm text-white/70">No notifications yet.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}
