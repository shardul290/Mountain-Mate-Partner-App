import { Text } from "react-native";

import { BrandHero } from "@/components/ui/BrandHero";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";

export function SupportScreen() {
  return (
    <Screen>
      <BrandHero
        eyebrow="Human support"
        title="Mountain"
        accent="support."
        subtitle="The same support direction from your website now carries into the partner side for approvals, payouts, and booking escalation."
      />
      <SectionCard title="Admin support chat" subtitle="Backend route exists; mobile chat UI can sit on top next">
        <ListRow title="KYC verification help" meta="Upload issues, approval timelines, and compliance questions." status="Priority" />
        <ListRow title="Payout assistance" meta="Bank account validation, settlement delays, and wallet support." />
        <ListRow title="Booking escalation" meta="Resolve guest, driver, or lead conflicts quickly." />
      </SectionCard>
    </Screen>
  );
}
