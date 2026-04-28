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
}

export interface BackendHealth {
  success: boolean;
  status: string;
  message: string;
  timestamp?: string;
}
