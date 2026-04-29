export type PartnerRole = "hotelOwner" | "driver" | "propertyOwner";
export type ThemeMode = "light" | "dark";
export type AppLanguage = "en" | "hi";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  partnerRole: PartnerRole;
  approvalStatus: ApprovalStatus;
  avatarUrl?: string;
}

export interface MetricCardData {
  label: string;
  value: string;
  hint: string;
}

export interface PartnerNotification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
}

export interface PartnerBooking {
  _id: string;
  bookingType: "Hotel" | "Transport";
  listingLabel: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  paymentStatus: string;
  amount: number;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  pickupLabel?: string;
  dropLabel?: string;
}

export interface BackendHealth {
  success: boolean;
  status: string;
  message: string;
  timestamp?: string;
}

export interface HotelSummary {
  _id: string;
  hotelName: string;
  location: string;
  description?: string;
  pricePerNight: number;
  roomsAvailable: number;
  status?: string;
  roomTypes?: string[];
  photoUrls?: string[];
}

export interface RideSummary {
  _id: string;
  vehicleModel: string;
  vehicleNumber?: string;
  routeFrom: string;
  routeTo: string;
  seatsAvailable: number;
  pricePerSeat: number;
  driverOnline?: boolean;
  status?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}

export interface PropertyLead {
  _id: string;
  title: string;
  customerName: string;
  budget?: number;
  message?: string;
  status: string;
  location?: string;
}

export interface InventoryDay {
  date: string;
  totalRooms?: number;
  bookedRooms?: number;
  availableRooms: number;
  blockedRooms?: number;
  soldRooms?: number;
  price?: number;
  pricePerNight?: number;
  isSoldOut?: boolean;
}

export interface TripLedgerEntry {
  _id: string;
  rideId?: string;
  label: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface PartnerAnalyticsOverview {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  conversionRate: number;
  avgRating: number;
  activeListings: number;
}

export interface WalletSummary {
  balance: number;
  pendingPayout: number;
  lastPayoutAmount: number;
  currency: string;
}

export interface PayoutRecord {
  _id: string;
  amount: number;
  status: string;
  scheduledAt?: string;
  paidAt?: string;
  reference?: string;
}

export interface ReviewItem {
  _id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  listingLabel?: string;
}

export interface ComplaintItem {
  _id: string;
  title: string;
  detail: string;
  status: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  body: string;
  senderName: string;
  senderType: "partner" | "customer" | "admin";
  createdAt: string;
}

export interface ChatThread {
  _id: string;
  title: string;
  participantLabel: string;
  threadType: "customer" | "admin";
  messages: ChatMessage[];
}

export interface ApprovalState {
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  canResubmit: boolean;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface VerificationDoc {
  type: string;
  label: string;
  url: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

export interface AvailabilitySchedule {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface TrackingSnapshot {
  rideId: string;
  lat?: number;
  lng?: number;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  status?: string;
  updatedAt?: string;
}

export interface NearbyRequest {
  _id: string;
  customerName: string;
  pickupLabel: string;
  dropLabel: string;
  distanceKm?: number;
  etaMinutes?: number;
  amount?: number;
  status?: string;
}

export interface HotelDraft {
  hotelName: string;
  location: string;
  description?: string;
  pricePerNight: number;
  roomsAvailable: number;
  roomTypes: string[];
  photoUrls: string[];
}

export interface RideDraft {
  vehicleModel: string;
  vehicleNumber?: string;
  routeFrom: string;
  routeTo: string;
  seatsAvailable: number;
  pricePerSeat: number;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  driverOnline?: boolean;
}
