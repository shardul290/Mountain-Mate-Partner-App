import { api } from "@/services/api/client";
import type {
  ApprovalState,
  AvailabilitySchedule,
  BackendHealth,
  BankDetails,
  ChatThread,
  ComplaintItem,
  HotelDraft,
  HotelSummary,
  InventoryDay,
  NearbyRequest,
  PartnerAnalyticsOverview,
  PartnerBooking,
  PartnerNotification,
  PayoutRecord,
  PropertyLead,
  ReviewItem,
  RideDraft,
  RideSummary,
  TrackingSnapshot,
  TripLedgerEntry,
  VerificationDoc,
  WalletSummary,
} from "@/types";

const unwrap = <T>(payload: any, fallback: T): T => payload?.data ?? payload?.result ?? payload ?? fallback;

const safeRead = async <T>(request: Promise<any>, fallback: T): Promise<T> => {
  try {
    const response = await request;
    return unwrap<T>(response.data, fallback);
  } catch {
    return fallback;
  }
};

const normalizeAnalytics = (input?: Partial<PartnerAnalyticsOverview>): PartnerAnalyticsOverview => ({
  totalRevenue: Number(input?.totalRevenue || 0),
  totalBookings: Number(input?.totalBookings || 0),
  occupancyRate: Number(input?.occupancyRate || 0),
  conversionRate: Number(input?.conversionRate || 0),
  avgRating: Number(input?.avgRating || 0),
  activeListings: Number(input?.activeListings || 0),
});

export const partnerApi = {
  async getBackendHealth() {
    const response = await api.get<BackendHealth>("/health");
    return response.data;
  },
  async getMyHotels() {
    return safeRead<HotelSummary[]>(api.get("/hotel/my-hotels"), []);
  },
  async createHotel(payload: HotelDraft) {
    const response = await api.post("/hotel/add", payload);
    return unwrap<HotelSummary | null>(response.data, null);
  },
  async updateHotel(hotelId: string, payload: Partial<HotelDraft>) {
    const response = await api.patch(`/hotel/update/${hotelId}`, payload);
    return unwrap<HotelSummary | null>(response.data, null);
  },
  async getMyRides() {
    return safeRead<RideSummary[]>(api.get("/transport/my-rides"), []);
  },
  async createRide(payload: RideDraft) {
    const response = await api.post("/transport/add", payload);
    return unwrap<RideSummary | null>(response.data, null);
  },
  async updateRide(rideId: string, payload: Partial<RideDraft>) {
    const response = await api.patch(`/transport/update/${rideId}`, payload);
    return unwrap<RideSummary | null>(response.data, null);
  },
  async getIncomingBookings() {
    return safeRead<PartnerBooking[]>(api.get("/user/partner/incoming"), []);
  },
  async updateIncomingBookingStatus(bookingId: string, status: "confirmed" | "declined" | "cancelled") {
    const response = await api.post("/user/bookings/update-status", { bookingId, status });
    return response.data;
  },
  async cancelBooking(bookingId: string, reason?: string) {
    const response = await api.post("/user/bookings/update-status", {
      bookingId,
      status: "cancelled",
      reason,
    });
    return response.data;
  },
  async updateRideAvailability(rideId: string, driverOnline: boolean) {
    const response = await api.patch(`/transport/update/${rideId}`, { driverOnline });
    return unwrap<RideSummary | null>(response.data, null);
  },
  async getOwnerHotelsForInventory() {
    return safeRead<HotelSummary[]>(api.get("/inventory/owner/hotels"), []);
  },
  async getInventory(hotelId: string, startDate?: string, endDate?: string) {
    return safeRead<InventoryDay[]>(
      api.get(`/inventory/${hotelId}`, {
        params: { startDate, endDate },
      }),
      []
    );
  },
  async updateInventory(payload: {
    hotelId: string;
    date: string;
    totalRooms: number;
    bookedRooms?: number;
    price?: number;
  }) {
    const response = await api.post("/inventory/update", {
      hotelId: payload.hotelId,
      dates: [payload.date],
      totalRooms: payload.totalRooms,
      bookedRooms: payload.bookedRooms ?? 0,
      price: payload.price ?? 0,
    });
    return unwrap<InventoryDay | null>(response.data, null);
  },
  async getNotifications() {
    const response = await api.get<{ data: PartnerNotification[]; unreadCount: number }>("/notifications");
    return response.data;
  },
  async markNotificationsRead(ids?: string[]) {
    const response = await api.patch("/notifications/read", { ids });
    return response.data;
  },
  async getPartnerStatus() {
    return safeRead<ApprovalState>(
      api.get("/partner/status"),
      {
        approvalStatus: "pending",
        canResubmit: true,
      }
    );
  },
  async submitVerification(payload: {
    businessName: string;
    gstNumber?: string;
    docs: VerificationDoc[];
    bankDetails: BankDetails;
  }) {
    const response = await api.post("/partner/verification", payload);
    return unwrap(response.data, {});
  },
  async resubmitVerification(payload: { docs: VerificationDoc[] }) {
    const response = await api.post("/partner/verification/resubmit", payload);
    return unwrap(response.data, {});
  },
  async getAnalyticsOverview() {
    const result = await safeRead<Partial<PartnerAnalyticsOverview>>(api.get("/partner/analytics/overview"), {});
    return normalizeAnalytics(result);
  },
  async getWallet() {
    return safeRead<WalletSummary>(api.get("/partner/wallet"), {
      balance: 0,
      pendingPayout: 0,
      lastPayoutAmount: 0,
      currency: "INR",
    });
  },
  async getPayouts() {
    return safeRead<PayoutRecord[]>(api.get("/partner/payouts"), []);
  },
  async getReviews() {
    return safeRead<ReviewItem[]>(api.get("/partner/reviews"), []);
  },
  async getComplaints() {
    return safeRead<ComplaintItem[]>(api.get("/partner/complaints"), []);
  },
  async getPropertyLeads() {
    return safeRead<PropertyLead[]>(api.get("/partner/property/leads"), []);
  },
  async getCustomerThreads() {
    return safeRead<ChatThread[]>(api.get("/partner/chat/customer"), []);
  },
  async sendCustomerMessage(threadId: string, body: string) {
    const response = await api.post("/partner/chat/customer", { threadId, body });
    return unwrap(response.data, {});
  },
  async getAdminThreads() {
    return safeRead<ChatThread[]>(api.get("/support/threads"), []);
  },
  async sendAdminMessage(threadId: string, body: string) {
    const response = await api.post("/support/messages", { threadId, body });
    return unwrap(response.data, {});
  },
  async registerDevice(token: string) {
    const response = await api.post("/partner/devices/register", { token });
    return unwrap(response.data, {});
  },
  async getTripHistory() {
    return safeRead<TripLedgerEntry[]>(api.get("/partner/trips"), []);
  },
  async getEarningsLedger() {
    return safeRead<TripLedgerEntry[]>(api.get("/partner/earnings"), []);
  },
  async getTrackingSnapshot(rideId: string) {
    return safeRead<TrackingSnapshot | null>(api.get(`/transport/tracking/${rideId}`), null);
  },
  async updateLiveLocation(payload: {
    rideId: string;
    lat: number;
    lng: number;
    pickupLat?: number;
    pickupLng?: number;
    dropLat?: number;
    dropLng?: number;
  }) {
    const response = await api.post("/transport/live-location", payload);
    return unwrap(response.data, {});
  },
  async getNearbyRequests(params?: { lat?: number; lng?: number }) {
    return safeRead<NearbyRequest[]>(api.get("/transport/nearby-requests", { params }), []);
  },
  async shareTripStatus(payload: { rideId: string; emergencyContact: string; shareUrl?: string }) {
    const response = await api.post("/transport/share-trip", payload);
    return unwrap(response.data, {});
  },
  async raiseSos(payload: { rideId: string; lat?: number; lng?: number; note?: string }) {
    const response = await api.post("/transport/sos", payload);
    return unwrap(response.data, {});
  },
  async getAvailabilitySchedule() {
    return safeRead<AvailabilitySchedule>(api.get("/partner/availability"), {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startTime: "06:00",
      endTime: "22:00",
    });
  },
  async updateAvailabilitySchedule(payload: AvailabilitySchedule) {
    const response = await api.post("/partner/availability", payload);
    return unwrap<AvailabilitySchedule>(response.data, payload);
  },
};
