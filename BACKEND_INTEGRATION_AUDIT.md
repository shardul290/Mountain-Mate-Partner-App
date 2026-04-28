# Backend Integration Audit

This document maps the current backend to the new mobile partner app and flags the gaps that should be filled before calling the product production-ready.

For the full app-aligned API contract, payloads, and rollout order, also use:

- `PARTNER_BACKEND_CONTRACT.md`

## Reusable today

- Auth transport:
  - Mobile should authenticate with Supabase and send the Supabase access token to the backend.
  - Backend owner routes already use `supabaseAuth`.
- Hotel owner APIs:
  - `GET /api/hotel/my-hotels`
  - `POST /api/hotel/add`
  - `PATCH /api/hotel/update/:id`
  - `DELETE /api/hotel/delete-image`
- Hotel inventory APIs:
  - `GET /api/inventory/owner/hotels`
  - `GET /api/inventory/:hotelId`
  - `POST /api/inventory/update`
- Driver APIs:
  - `GET /api/transport/my-rides`
  - `POST /api/transport/add`
  - `PATCH /api/transport/update/:id`
  - `DELETE /api/transport/delete-image`
- Partner request inbox:
  - `GET /api/user/partner/incoming`
  - `POST /api/user/bookings/update-status`
- Notifications:
  - `GET /api/notifications`
  - `PATCH /api/notifications/read`
- Support foundation:
  - `/api/support` routes exist and Socket.IO support rooms exist in the backend.

## Already present in backend domain models

- Hotel verification documents and KYC fields
- Transport verification documents and KYC fields
- Booking owner linkage via `ownerId`
- Transport live tracking socket rooms
- Supabase-backed inventory helpers

## Gaps to close

- Partner role enforcement:
  - Current owner routes require `supabaseAuth` but do not enforce role-specific access.
  - Add `requireRole("hotelOwner")`, `requireRole("driver")`, `requireRole("propertyOwner")` or equivalent policy middleware.
- Approval lifecycle:
  - Need a dedicated endpoint for partner approval state and rejection reasons.
  - Recommended: `GET /api/partner/status`.
- Property owner domain:
  - There is no dedicated property/lead/inquiry model for land or non-hotel partner inventory.
  - Recommended new modules:
    - `Property`
    - `PropertyLead`
    - `LeadMessage`
- Analytics:
  - Revenue, occupancy, conversion, and payout dashboards are not exposed as mobile-ready endpoints.
  - Recommended:
    - `GET /api/partner/analytics/overview`
    - `GET /api/partner/analytics/revenue`
    - `GET /api/partner/analytics/occupancy`
- Reviews:
  - Need owner-facing review aggregation endpoint.
  - Recommended: `GET /api/partner/reviews`.
- Wallet and payouts:
  - No partner payout ledger endpoint yet.
  - Recommended:
    - `GET /api/partner/wallet`
    - `GET /api/partner/payouts`
- Push notifications:
  - Need device token registration and trigger persistence.
  - Recommended:
    - `POST /api/partner/devices/register`
    - Event triggers on booking, ride request, lead inquiry, admin alert
- Inquiry chat for property owners:
  - Existing support chat is not the same as buyer-owner inquiry chat.
  - Add property lead threads with message history.

## Recommended backend sequencing

1. Lock role and approval metadata in Supabase `app_metadata`.
2. Add `partner/status` and `partner/analytics/overview`.
3. Add device token registration and push trigger pipeline.
4. Add property-owner lead system.
5. Add payouts and review aggregation endpoints.
