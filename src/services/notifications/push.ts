import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

const projectId = Constants.expoConfig?.extra?.eas?.projectId;
const isExpoGo = Constants.appOwnership === "expo";
const isWeb = Platform.OS === "web";
const hasValidProjectId =
  typeof projectId === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId);

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications() {
  if (isWeb || isExpoGo || !Device.isDevice || !hasValidProjectId) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export const notificationLinking = {
  prefixes: ["mountainmatepartner://"],
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    if (isWeb || typeof Notifications.getLastNotificationResponseAsync !== "function") {
      return undefined;
    }
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification.request.content.data.url as string | undefined;
  },
  subscribe(listener: (url: string) => void) {
    const linkSubscription = Linking.addEventListener("url", ({ url }) => listener(url));
    const notificationSubscription =
      !isWeb && typeof Notifications.addNotificationResponseReceivedListener === "function"
        ? Notifications.addNotificationResponseReceivedListener((response: any) => {
            const url = response.notification.request.content.data.url;
            if (typeof url === "string") {
              listener(url);
            }
          })
        : null;

    return () => {
      linkSubscription.remove();
      notificationSubscription?.remove();
    };
  },
  config: {
    screens: {
      Inbox: "inbox",
      Live: "live",
      Ops: "ops",
    },
  },
};
