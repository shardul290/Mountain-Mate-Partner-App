import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  AppLanguage,
  AuthUser,
  HotelFormDraft,
  LocalPropertyListing,
  PartnerRole,
  PropertyFormDraft,
  RideFormDraft,
  ThemeMode,
} from "@/types";

const defaultHotelDraft: HotelFormDraft = {
  hotelName: "",
  location: "",
  description: "",
  pricePerNight: "",
  roomsAvailable: "",
  roomTypes: "",
  photoUrls: "",
};

const defaultRideDraft: RideFormDraft = {
  vehicleModel: "",
  vehicleNumber: "",
  routeFrom: "",
  routeTo: "",
  seatsAvailable: "",
  pricePerSeat: "",
  pickupLat: "",
  pickupLng: "",
  dropLat: "",
  dropLng: "",
};

const defaultPropertyDraft: PropertyFormDraft = {
  title: "",
  location: "",
  propertyType: "",
  description: "",
  price: "",
  units: "",
  contactName: "",
  contactPhone: "",
  photoUrls: "",
};

interface AppState {
  bootstrapped: boolean;
  onboardingSeen: boolean;
  selectedRole: PartnerRole | null;
  themeMode: ThemeMode;
  language: AppLanguage;
  authUser: AuthUser | null;
  liveAvailable: boolean;
  hotelDraft: HotelFormDraft;
  rideDraft: RideFormDraft;
  propertyDraft: PropertyFormDraft;
  localProperties: LocalPropertyListing[];
  archivedHotelIds: string[];
  archivedRideIds: string[];
  leadStatuses: Record<string, "new" | "contacted" | "closed">;
  setBootstrapped: (value: boolean) => void;
  setOnboardingSeen: (value: boolean) => void;
  setSelectedRole: (role: PartnerRole | null) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setAuthUser: (user: AuthUser | null) => void;
  setLiveAvailable: (value: boolean) => void;
  saveHotelDraft: (draft: Partial<HotelFormDraft>) => void;
  clearHotelDraft: () => void;
  saveRideDraft: (draft: Partial<RideFormDraft>) => void;
  clearRideDraft: () => void;
  savePropertyDraft: (draft: Partial<PropertyFormDraft>) => void;
  clearPropertyDraft: () => void;
  upsertLocalProperty: (property: LocalPropertyListing) => void;
  deleteLocalProperty: (propertyId: string) => void;
  archiveLocalProperty: (propertyId: string) => void;
  archiveHotel: (hotelId: string) => void;
  archiveRide: (rideId: string) => void;
  restoreHotel: (hotelId: string) => void;
  restoreRide: (rideId: string) => void;
  setLeadStatus: (leadId: string, status: "new" | "contacted" | "closed") => void;
  signOutLocal: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      bootstrapped: false,
      onboardingSeen: false,
      selectedRole: null,
      themeMode: "light",
      language: "en",
      authUser: null,
      liveAvailable: true,
      hotelDraft: defaultHotelDraft,
      rideDraft: defaultRideDraft,
      propertyDraft: defaultPropertyDraft,
      localProperties: [],
      archivedHotelIds: [],
      archivedRideIds: [],
      leadStatuses: {},
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),
      setOnboardingSeen: (onboardingSeen) => set({ onboardingSeen }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setAuthUser: (authUser) => set({ authUser }),
      setLiveAvailable: (liveAvailable) => set({ liveAvailable }),
      saveHotelDraft: (draft) =>
        set((state) => ({
          hotelDraft: {
            ...state.hotelDraft,
            ...draft,
          },
        })),
      clearHotelDraft: () => set({ hotelDraft: defaultHotelDraft }),
      saveRideDraft: (draft) =>
        set((state) => ({
          rideDraft: {
            ...state.rideDraft,
            ...draft,
          },
        })),
      clearRideDraft: () => set({ rideDraft: defaultRideDraft }),
      savePropertyDraft: (draft) =>
        set((state) => ({
          propertyDraft: {
            ...state.propertyDraft,
            ...draft,
          },
        })),
      clearPropertyDraft: () => set({ propertyDraft: defaultPropertyDraft }),
      upsertLocalProperty: (property) =>
        set((state) => ({
          localProperties: state.localProperties.some((item) => item.id === property.id)
            ? state.localProperties.map((item) => (item.id === property.id ? property : item))
            : [property, ...state.localProperties],
        })),
      deleteLocalProperty: (propertyId) =>
        set((state) => ({
          localProperties: state.localProperties.filter((item) => item.id !== propertyId),
        })),
      archiveLocalProperty: (propertyId) =>
        set((state) => ({
          localProperties: state.localProperties.map((item) =>
            item.id === propertyId ? { ...item, status: "archived", updatedAt: new Date().toISOString() } : item
          ),
        })),
      archiveHotel: (hotelId) =>
        set((state) => ({
          archivedHotelIds: state.archivedHotelIds.includes(hotelId) ? state.archivedHotelIds : [...state.archivedHotelIds, hotelId],
        })),
      archiveRide: (rideId) =>
        set((state) => ({
          archivedRideIds: state.archivedRideIds.includes(rideId) ? state.archivedRideIds : [...state.archivedRideIds, rideId],
        })),
      restoreHotel: (hotelId) =>
        set((state) => ({
          archivedHotelIds: state.archivedHotelIds.filter((item) => item !== hotelId),
        })),
      restoreRide: (rideId) =>
        set((state) => ({
          archivedRideIds: state.archivedRideIds.filter((item) => item !== rideId),
        })),
      setLeadStatus: (leadId, status) =>
        set((state) => ({
          leadStatuses: {
            ...state.leadStatuses,
            [leadId]: status,
          },
        })),
      signOutLocal: () =>
        set({
          authUser: null,
          selectedRole: null,
          liveAvailable: true,
        }),
    }),
    {
      name: "mm-partner-app",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingSeen: state.onboardingSeen,
        selectedRole: state.selectedRole,
        themeMode: state.themeMode,
        language: state.language,
        liveAvailable: state.liveAvailable,
        hotelDraft: state.hotelDraft,
        rideDraft: state.rideDraft,
        propertyDraft: state.propertyDraft,
        localProperties: state.localProperties,
        archivedHotelIds: state.archivedHotelIds,
        archivedRideIds: state.archivedRideIds,
        leadStatuses: state.leadStatuses,
      }),
    }
  )
);
