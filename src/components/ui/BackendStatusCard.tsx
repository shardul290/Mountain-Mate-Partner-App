import { Text } from "react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import type { BackendHealth } from "@/types";

interface BackendStatusCardProps {
  health: BackendHealth | null;
  detail: string;
}

export function BackendStatusCard({ health, detail }: BackendStatusCardProps) {
  const status = health?.status === "UP" ? "Live" : "Check";

  return (
    <ActionCard
      title="Backend status"
      detail={detail}
      status={status}
    >
      <Text className="text-sm leading-6 text-white/70">
        API health: {health?.status || "unknown"} {health?.timestamp ? `| ${new Date(health.timestamp).toLocaleString()}` : ""}
      </Text>
    </ActionCard>
  );
}
