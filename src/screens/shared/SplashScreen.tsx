import { Text, View } from "react-native";

import { Screen } from "@/components/ui/Screen";

export function SplashScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xs uppercase tracking-[4px] text-white/65">Uttarakhand Partner Network</Text>
        <Text className="mt-4 text-center text-4xl font-bold text-white">Mountain Mate</Text>
        <Text className="mt-2 text-center text-lg text-white/80">Partner App</Text>
      </View>
    </Screen>
  );
}
