import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { partnerApi } from "@/services/api/partner";
import type { PartnerAnalyticsOverview, PayoutRecord, WalletSummary } from "@/types";

export function WalletScreen({ navigation }: any) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [analytics, setAnalytics] = useState<PartnerAnalyticsOverview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  const loadData = async () => {
    setBusy(true);
    try {
      const [walletData, payoutData, analyticsData] = await Promise.all([
        partnerApi.getWallet(),
        partnerApi.getPayouts(),
        partnerApi.getAnalyticsOverview(),
      ]);
      setWallet(walletData);
      setPayouts(payoutData);
      setAnalytics(analyticsData);
    } catch {
      setMessage({ tone: "error", text: "Wallet data could not be loaded right now." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latestPayout = useMemo(() => payouts[0] || null, [payouts]);

  return (
    <Screen onRefresh={loadData} refreshing={busy}>
      <BrandHero
        eyebrow="Wallet"
        title="Track earnings"
        accent="simply."
        subtitle="See total earnings, pending payout, and bank setup in one clear place."
      />

      {message ? <FeedbackBanner tone={message.tone} message={message.text} /> : null}

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Balance" value={`Rs ${wallet?.balance || 0}`} hint="Available now" />
        <KpiCard label="Pending" value={`Rs ${wallet?.pendingPayout || 0}`} hint="Next payout" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Revenue" value={`Rs ${analytics?.totalRevenue || 0}`} hint="All time total" />
        <KpiCard label="Bookings" value={String(analytics?.totalBookings || 0)} hint="Business activity" />
      </View>

      <SectionCard title="Wallet summary" subtitle="A quick view of your business money.">
        {wallet ? (
          <>
            <ListRow title="Available balance" meta={`Rs ${wallet.balance}`} status={wallet.currency} />
            <ListRow title="Pending payout" meta={`Rs ${wallet.pendingPayout}`} />
            <ListRow title="Last payout amount" meta={`Rs ${wallet.lastPayoutAmount}`} />
          </>
        ) : (
          <EmptyState title="Wallet not ready" message="Wallet numbers will show up here when the backend payout module responds." icon="credit-card" />
        )}
      </SectionCard>

      <SectionCard title="Payout history" subtitle="See what was paid and what is still pending.">
        {payouts.length ? (
          payouts.map((payout) => (
            <ListRow
              key={payout._id}
              title={`Rs ${payout.amount}`}
              meta={`${payout.reference || "No reference"} | ${payout.paidAt || payout.scheduledAt || "Pending date"}`}
              status={payout.status}
            />
          ))
        ) : (
          <EmptyState title="No payout history yet" message="Payout records will appear here after settlements start." icon="clock" />
        )}
      </SectionCard>

      <SectionCard title="Next action" subtitle="What partners usually need to do next.">
        <ActionCard
          title={latestPayout ? "Payout history available" : "Finish bank setup"}
          detail={
            latestPayout
              ? "Review your recent payout records and keep your bank details updated."
              : "Open verification and add bank details so future payouts can be sent correctly."
          }
          status={latestPayout ? latestPayout.status : "action needed"}
        >
          <View style={styles.actions}>
            <InlineActionButton title="Open verification" tone="primary" onPress={() => navigation.navigate("OperationsCenter")} />
            <InlineActionButton
              title="Withdraw"
              onPress={() => setMessage({ tone: "info", text: "Withdraw flow is ready for backend support when payouts are enabled." })}
            />
          </View>
        </ActionCard>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
