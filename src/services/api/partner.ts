import { api } from "@/services/api/client";
import type { BackendHealth, PartnerBooking, PartnerNotification } from "@/types";

export interface HotelSummary {
  _id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  roomsAvailable: number;
  status?: string;
}

export interface RideSummary {
  _id: string;
  vehicleModel: string;
  routeFrom: string;
  routeTo: string;
  seatsAvailable: number;
  pricePerSeat: number;
  driverOnline?: boolean;
  status?: string;
}

export const partnerApi = {
  async getBackendHealth() {
    const response = await api.get<BackendHealth>("/health");
    return response.data;
  },
  async getMyHotels() {
    const response = await api.get<{ data: HotelSummary[] }>("/hotel/my-hotels");
    return response.data.data || [];
  },
  async getMyRides() {
    const response = await api.get<{ data: RideSummary[] }>("/transport/my-rides");
    return response.data.data || [];
  },
  async getIncomingBookings() {
    const response = await api.get<{ data: PartnerBooking[] }>("/user/partner/incoming");
    return response.data.data || [];
  },
  async updateIncomingBookingStatus(bookingId: string, status: "confirmed" | "declined") {
    const response = await api.post("/user/bookings/update-status", { bookingId, status });
    return response.data;
  },
  async updateRideAvailability(rideId: string, driverOnline: boolean) {
    const response = await api.patch(`/transport/update/${rideId}`, { driverOnline });
    return response.data?.data;
  },
  async getOwnerHotelsForInventory() {
    const response = await api.get<{ data: HotelSummary[] }>("/inventory/owner/hotels");
    return response.data.data || [];
  },
  async getInventory(hotelId: string, startDate?: string, endDate?: string) {
    const response = await api.get(`/inventory/${hotelId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
  async getNotifications() {
    const response = await api.get<{ data: PartnerNotification[]; unreadCount: number }>("/notifications");
    return response.data;
  },
  async markNotificationsRead(ids?: string[]) {
    const response = await api.patch("/notifications/read", { ids });
    return response.data;
  },
};
