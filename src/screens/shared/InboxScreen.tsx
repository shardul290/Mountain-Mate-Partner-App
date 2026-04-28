import { useEffect, useMemo, useState } from "react";
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
import type { ChatThread, PartnerNotification } from "@/types";

export function InboxScreen() {
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [customerThreads, setCustomerThreads] = useState<ChatThread[]>([]);
  const [adminThreads, setAdminThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedThreadType, setSelectedThreadType] = useState<"customer" | "admin">("customer");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setBusy(true);
    try {
      const [notificationData, customerData, adminData] = await Promise.all([
        partnerApi.getNotifications(),
        partnerApi.getCustomerThreads(),
        partnerApi.getAdminThreads(),
      ]);
      setNotifications(notificationData.data || []);
      setCustomerThreads(customerData);
      setAdminThreads(adminData);
    } catch {
      Alert.alert("Sync issue", "Inbox data could not be loaded from the backend.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const combinedThreads = useMemo(
    () => [
      ...customerThreads.map((thread) => ({ ...thread, threadType: "customer" as const })),
      ...adminThreads.map((thread) => ({ ...thread, threadType: "admin" as const })),
    ],
    [adminThreads, customerThreads]
  );

  const selectedThread = combinedThreads.find((thread) => thread._id === selectedThreadId) || combinedThreads[0] || null;

  const markAllNotificationsRead = async () => {
    setBusy(true);
    try {
      await partnerApi.markNotificationsRead(notifications.map((item) => item._id));
      await loadData();
    } catch {
      Alert.alert("Update failed", "Notifications could not be marked as read.");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    const threadId = selectedThread?._id;
    const body = message.trim();
    if (!threadId || !body) {
      Alert.alert("Missing message", "Choose a thread and enter a message.");
      return;
    }

    setBusy(true);
    try {
      if ((selectedThread?.threadType || selectedThreadType) === "admin") {
        await partnerApi.sendAdminMessage(threadId, body);
      } else {
        await partnerApi.sendCustomerMessage(threadId, body);
      }
      setMessage("");
      await loadData();
    } catch {
      Alert.alert("Send failed", "The message could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <BrandHero
        eyebrow="Inbox"
        title="Notifications,"
        accent="customer chat, admin chat."
        subtitle="This is the shared communication layer for alerts, ride or booking conversations, and admin escalation."
      >
        <View className="flex-row flex-wrap gap-2">
          <SignalPill label="Push-ready alerts" />
          <SignalPill label="Customer chat" />
          <SignalPill label="Admin support" />
        </View>
      </BrandHero>

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Alerts" value={String(notifications.length)} hint="Backend notifications" />
        <KpiCard label="Threads" value={String(combinedThreads.length)} hint="Customer + admin" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Unread" value={String(notifications.filter((item) => !item.read).length)} hint="Needs attention" />
        <KpiCard label="Mode" value={busy ? "Syncing" : "Ready"} hint="Inbox state" />
      </View>

      <SectionCard title="Notifications" subtitle="Booking, ride, approval, and admin alerts from the backend">
        <View className="mb-4 flex-row flex-wrap gap-2">
          <InlineActionButton title="Mark all read" tone="primary" onPress={markAllNotificationsRead} disabled={busy || !notifications.length} />
          <InlineActionButton title="Refresh" onPress={loadData} disabled={busy} />
        </View>
        {notifications.length ? (
          notifications.map((item) => (
            <ListRow key={item._id} title={item.title} meta={`${item.message} | ${item.createdAt}`} status={item.read ? "read" : "new"} />
          ))
        ) : (
          <Text className="text-sm text-white/70">No notifications available yet.</Text>
        )}
      </SectionCard>

      <SectionCard title="Conversation threads" subtitle="Choose a customer or admin thread before sending a message">
        {combinedThreads.length ? (
          combinedThreads.map((thread) => (
            <ActionCard
              key={thread._id}
              title={thread.title}
              detail={`${thread.participantLabel} | ${thread.messages.length} messages`}
              status={thread.threadType}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton
                  title="Open thread"
                  tone="primary"
                  onPress={() => {
                    setSelectedThreadId(thread._id);
                    setSelectedThreadType(thread.threadType);
                  }}
                />
              </View>
            </ActionCard>
          ))
        ) : (
          <Text className="text-sm text-white/70">No chat threads returned yet from customer or admin endpoints.</Text>
        )}
      </SectionCard>

      <SectionCard title="Messages" subtitle="Reply to a customer or admin support thread from the partner app">
        <Text className="mb-3 text-sm text-white/70">Selected thread: {selectedThread?.title || "None"}</Text>
        {selectedThread?.messages?.length ? (
          selectedThread.messages.map((item) => (
            <ActionCard
              key={item._id}
              title={`${item.senderName} (${item.senderType})`}
              detail={`${item.body} | ${item.createdAt}`}
            />
          ))
        ) : (
          <Text className="text-sm text-white/70">No messages loaded for the selected thread yet.</Text>
        )}
        <View className="mt-4">
          <TextField label="Reply" value={message} onChangeText={setMessage} placeholder="Type your reply here" multiline />
          <InlineActionButton title="Send message" tone="primary" onPress={sendMessage} disabled={busy} />
        </View>
      </SectionCard>
    </Screen>
  );
}
