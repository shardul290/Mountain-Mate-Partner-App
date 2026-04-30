import { Text } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";

export function SupportScreen() {
  return (
    <Screen>
      <BrandHero
        eyebrow="Support"
        title="Help for your"
        accent="partner account."
        subtitle="Get help with approval, payouts, bookings, and account issues."
      />
      <SectionCard title="Help topics" subtitle="These are the common things partners need help with.">
        <ListRow title="Approval help" meta="Questions about KYC, document upload, and approval status." status="Help" />
        <ListRow title="Payout help" meta="Bank details, payment delays, and wallet support." />
        <ListRow title="Booking help" meta="Issues with guest, stay, or ride bookings." />
      </SectionCard>
    </Screen>
  );
}
