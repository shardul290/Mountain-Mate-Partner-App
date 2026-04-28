import { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

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
import { registerForPushNotifications } from "@/services/notifications/push";
import { partnerApi } from "@/services/api/partner";
import { useAppStore } from "@/store/useAppStore";
import type {
  ApprovalState,
  AvailabilitySchedule,
  BankDetails,
  ComplaintItem,
  PartnerAnalyticsOverview,
  PayoutRecord,
  ReviewItem,
  VerificationDoc,
  WalletSummary,
} from "@/types";

const defaultBankDetails: BankDetails = {
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  upiId: "",
};

export function OperationsCenterScreen() {
  const role = useAppStore((state) => state.selectedRole);
  const [analytics, setAnalytics] = useState<PartnerAnalyticsOverview | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [approval, setApproval] = useState<ApprovalState | null>(null);
  const [schedule, setSchedule] = useState<AvailabilitySchedule>({
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    startTime: "06:00",
    endTime: "22:00",
  });
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [bankDetails, setBankDetails] = useState<BankDetails>(defaultBankDetails);
  const [docLabel, setDocLabel] = useState("");
  const [docType, setDocType] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setBusy(true);
    try {
      const [analyticsData, walletData, payoutData, reviewData, complaintData, approvalData, scheduleData] = await Promise.all([
        partnerApi.getAnalyticsOverview(),
        partnerApi.getWallet(),
        partnerApi.getPayouts(),
        partnerApi.getReviews(),
        partnerApi.getComplaints(),
        partnerApi.getPartnerStatus(),
        partnerApi.getAvailabilitySchedule(),
      ]);
      setAnalytics(analyticsData);
      setWallet(walletData);
      setPayouts(payoutData);
      setReviews(reviewData);
      setComplaints(complaintData);
      setApproval(approvalData);
      setSchedule(scheduleData);
    } catch {
      Alert.alert("Sync issue", "We could not refresh operations data from the backend.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addDoc = () => {
    if (!docLabel.trim() || !docUrl.trim()) {
      Alert.alert("Missing document", "Add both a label and a URL or picked image path.");
      return;
    }

    setDocs((current) => [
      ...current,
      {
        label: docLabel.trim(),
        type: docType.trim() || "other",
        url: docUrl.trim(),
      },
    ]);
    setDocLabel("");
    setDocType("");
    setDocUrl("");
  };

  const pickDoc = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setDocUrl(result.assets[0].uri);
    }
  };

  const pickFileDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setDocUrl(result.assets[0].uri);
        if (!docLabel.trim()) {
          setDocLabel(result.assets[0].name || "Uploaded document");
        }
      }
    } catch {
      Alert.alert("Picker failed", "The document picker could not open.");
    }
  };

  const submitVerification = async () => {
    if (!businessName.trim()) {
      Alert.alert("Missing business name", "Add a business or fleet name before submitting KYC.");
      return;
    }

    setBusy(true);
    try {
      await partnerApi.submitVerification({
        businessName: businessName.trim(),
        gstNumber: gstNumber.trim(),
        docs,
        bankDetails,
      });
      await loadData();
      Alert.alert("Submitted", "Verification details were sent to the backend.");
    } catch {
      Alert.alert("Submission failed", "Verification details could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  const resubmitDocs = async () => {
    setBusy(true);
    try {
      await partnerApi.resubmitVerification({ docs });
      await loadData();
      Alert.alert("Resubmitted", "The latest documents were re-sent for review.");
    } catch {
      Alert.alert("Resubmission failed", "Documents could not be resubmitted.");
    } finally {
      setBusy(false);
    }
  };

  const saveSchedule = async () => {
    setBusy(true);
    try {
      await partnerApi.updateAvailabilitySchedule(schedule);
      await loadData();
    } catch {
      Alert.alert("Schedule failed", "Availability scheduling could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const syncPush = async () => {
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert("Push unavailable", "Push token could not be generated on this device or runtime.");
        return;
      }
      await partnerApi.registerDevice(token);
      Alert.alert("Push synced", "This device is now registered for booking and ride alerts.");
    } catch {
      Alert.alert("Push sync failed", "The device token could not be registered.");
    }
  };

  const reviewAverage = useMemo(() => {
    if (!reviews.length) return "0.0";
    const score = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;
    return score.toFixed(1);
  }, [reviews]);

  return (
    <Screen>
      <BrandHero
        eyebrow="Operations center"
        title="Handle KYC,"
        accent="money, and trust."
        subtitle="This is the partner operations core for verification, payouts, reviews, analytics, scheduling, complaints, and approval handling."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="KYC + bank details" />
          <SignalPill label="Wallet + payouts" />
          <SignalPill label="Approval control" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Revenue" value={`Rs ${analytics?.totalRevenue || 0}`} hint="Analytics overview" />
        <KpiCard label="Wallet" value={`Rs ${wallet?.balance || 0}`} hint="Available balance" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Rating" value={reviewAverage} hint="Average partner review" />
        <KpiCard label="Approval" value={approval?.approvalStatus || "pending"} hint="Current verification status" />
      </View>

      <SectionCard title="KYC and bank details" subtitle="Upload business docs, ID records, and payout details for verification">
        <TextField label="Business name" value={businessName} onChangeText={setBusinessName} placeholder={role === "driver" ? "Mountain Mate Fleet" : "Mountain Mate Hospitality"} />
        <TextField label="GST number" value={gstNumber} onChangeText={setGstNumber} placeholder="Optional" autoCapitalize="characters" />
        <TextField label="Account holder name" value={bankDetails.accountHolderName} onChangeText={(value) => setBankDetails((current) => ({ ...current, accountHolderName: value }))} placeholder="Account holder" />
        <TextField label="Account number" value={bankDetails.accountNumber} onChangeText={(value) => setBankDetails((current) => ({ ...current, accountNumber: value }))} placeholder="XXXXXXXXXXXX" keyboardType="numeric" autoCapitalize="none" />
        <TextField label="IFSC code" value={bankDetails.ifscCode} onChangeText={(value) => setBankDetails((current) => ({ ...current, ifscCode: value }))} placeholder="SBIN0000001" autoCapitalize="characters" />
        <TextField label="Bank name" value={bankDetails.bankName} onChangeText={(value) => setBankDetails((current) => ({ ...current, bankName: value }))} placeholder="State Bank of India" />
        <TextField label="UPI ID" value={bankDetails.upiId || ""} onChangeText={(value) => setBankDetails((current) => ({ ...current, upiId: value }))} placeholder="partner@upi" autoCapitalize="none" />
        <TextField label="Document label" value={docLabel} onChangeText={setDocLabel} placeholder="PAN card / hotel license / RC" />
        <TextField label="Document type" value={docType} onChangeText={setDocType} placeholder="identity / business / bank / vehicle" autoCapitalize="none" />
        <TextField label="Document URL or picked image path" value={docUrl} onChangeText={setDocUrl} placeholder="Paste URL or choose image" multiline autoCapitalize="none" />
        <View className="flex-row flex-wrap gap-2">
          <InlineActionButton title="Pick document image" onPress={pickDoc} />
          <InlineActionButton title="Pick file document" onPress={pickFileDoc} />
          <InlineActionButton title="Add document" tone="primary" onPress={addDoc} />
        </View>
        <View className="mt-4">
          {docs.length ? docs.map((doc) => <ListRow key={`${doc.type}-${doc.label}`} title={doc.label} meta={doc.url} status={doc.type} />) : <Text className="text-sm text-white/70">No verification documents queued yet.</Text>}
        </View>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <InlineActionButton title="Resubmit docs" onPress={resubmitDocs} disabled={busy || !docs.length} />
          <InlineActionButton title="Sync push alerts" tone="primary" onPress={syncPush} disabled={busy} />
        </View>
        <View className="mt-4">
          <PrimaryButton title="Submit verification" onPress={submitVerification} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Approval status and resubmission" subtitle="Partners can see exactly where they stand in the approval pipeline">
        <ActionCard
          title={`Status: ${approval?.approvalStatus || "pending"}`}
          detail={approval?.rejectionReason || "No rejection reason has been returned. Once the backend sends review notes, they appear here for resubmission guidance."}
          status={approval?.canResubmit ? "resubmit enabled" : "locked"}
        />
      </SectionCard>

      <SectionCard title="Availability scheduling" subtitle="Set when you want to receive booking or ride requests">
        <TextField label="Days" value={schedule.days.join(", ")} onChangeText={(value) => setSchedule((current) => ({ ...current, days: value.split(",").map((item) => item.trim()).filter(Boolean) }))} placeholder="Mon, Tue, Wed, Thu, Fri" />
        <TextField label="Start time" value={schedule.startTime} onChangeText={(value) => setSchedule((current) => ({ ...current, startTime: value }))} placeholder="06:00" autoCapitalize="none" />
        <TextField label="End time" value={schedule.endTime} onChangeText={(value) => setSchedule((current) => ({ ...current, endTime: value }))} placeholder="22:00" autoCapitalize="none" />
        <PrimaryButton title="Save availability schedule" onPress={saveSchedule} disabled={busy} />
      </SectionCard>

      <SectionCard title="Wallet and payouts" subtitle="Monitor available balance, pending settlement, and payout history">
        {wallet ? (
          <>
            <ListRow title="Available balance" meta={`Rs ${wallet.balance}`} status={wallet.currency} />
            <ListRow title="Pending payout" meta={`Rs ${wallet.pendingPayout}`} />
            <ListRow title="Last payout" meta={`Rs ${wallet.lastPayoutAmount}`} />
          </>
        ) : (
          <Text className="text-sm text-white/70">Wallet data will appear here when the backend payout module responds.</Text>
        )}
        <View className="mt-2">
          {payouts.length ? payouts.map((payout) => <ListRow key={payout._id} title={`Rs ${payout.amount}`} meta={`${payout.reference || "No reference"} | ${payout.paidAt || payout.scheduledAt || "Pending date"}`} status={payout.status} />) : <Text className="text-sm text-white/70">No payout records yet.</Text>}
        </View>
      </SectionCard>

      <SectionCard title="Reviews and complaints" subtitle="Stay on top of ratings, complaints, and quality issues">
        {reviews.length ? reviews.map((review) => <ActionCard key={review._id} title={`${review.authorName} | ${review.rating}/5`} detail={`${review.comment} | ${review.createdAt}${review.listingLabel ? ` | ${review.listingLabel}` : ""}`} status="review" />) : <Text className="text-sm text-white/70">No reviews returned yet.</Text>}
        <View className="mt-3">
          {complaints.length ? complaints.map((complaint) => <ActionCard key={complaint._id} title={complaint.title} detail={`${complaint.detail} | ${complaint.createdAt}`} status={complaint.status} />) : <Text className="text-sm text-white/70">No complaints returned yet.</Text>}
        </View>
      </SectionCard>
    </Screen>
  );
}
