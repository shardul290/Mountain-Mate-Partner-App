# Mountain Mate Partner Backend Contract

This document is the backend contract for the current partner mobile app in:

- `C:\Users\hp\Desktop\Mountain Mate Partner app\Mountain-Mate-Partner-App`

It translates the implemented frontend into exact backend expectations so the API and Supabase data model can be completed without guesswork.

## Current frontend modules already wired

- Hotel partner workspace
  - Add hotel
  - Edit hotel
  - Manage room inventory
  - Manage room pricing
  - Booking confirm, decline, cancel
- Ride partner workspace
  - Add ride
  - Edit ride
  - Seat and pricing management
  - Trip history
  - Earnings ledger
- Live driver operations
  - Pickup/drop coordinates
  - Google Maps route handoff
  - Live location sync
  - Nearby request discovery
  - ETA and distance calculation
  - SOS
  - Trip sharing
- Operations center
  - KYC
  - Bank details
  - Verification docs
  - Approval status
  - Rejection reason
  - Document resubmission
  - Availability scheduling
  - Wallet and payouts
  - Reviews and complaints
  - Partner analytics
- Inbox
  - Notifications
  - Customer chat
  - Admin chat

## Auth and authorization

All partner APIs should require:

- Supabase bearer token in `Authorization: Bearer <token>`
- `supabaseAuth` middleware
- role enforcement middleware

Recommended role middleware:

- `requireRole("hotelOwner")`
- `requireRole("driver")`
- `requireRole("propertyOwner")`

Recommended shared metadata in Supabase `app_metadata`:

```json
{
  "role": "hotelOwner",
  "approval_status": "pending",
  "partner_id": "mongo-or-sql-id",
  "business_name": "Mountain Mate Retreats"
}
```

Recommended `approval_status` values:

- `pending`
- `approved`
- `rejected`

## Response envelope

The frontend supports direct payloads and `{ data: ... }`, but standardizing the backend will help a lot.

Recommended success envelope:

```json
{
  "success": true,
  "data": {}
}
```

Recommended error envelope:

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

## Existing endpoints the app already uses

These should keep working exactly as they do now:

- `GET /api/health`
- `GET /api/hotel/my-hotels`
- `POST /api/hotel/add`
- `PATCH /api/hotel/update/:id`
- `GET /api/inventory/owner/hotels`
- `GET /api/inventory/:hotelId`
- `POST /api/inventory/update`
- `GET /api/transport/my-rides`
- `POST /api/transport/add`
- `PATCH /api/transport/update/:id`
- `GET /api/user/partner/incoming`
- `POST /api/user/bookings/update-status`
- `GET /api/notifications`
- `PATCH /api/notifications/read`

## New endpoints required by the current app

### 1. Partner status and verification

#### `GET /api/partner/status`

Purpose:

- show approval status
- show rejection reason
- decide whether resubmission is allowed

Response:

```json
{
  "success": true,
  "data": {
    "approvalStatus": "pending",
    "rejectionReason": "",
    "canResubmit": true,
    "submittedAt": "2026-04-28T10:00:00.000Z",
    "reviewedAt": null
  }
}
```

#### `POST /api/partner/verification`

Purpose:

- initial KYC submission
- business profile submission
- bank details submission

Request:

```json
{
  "businessName": "Mountain Mate Hospitality",
  "gstNumber": "05ABCDE1234F1Z5",
  "docs": [
    {
      "type": "identity",
      "label": "PAN Card",
      "url": "https://cdn.example.com/docs/pan.jpg"
    }
  ],
  "bankDetails": {
    "accountHolderName": "Amit Rawat",
    "accountNumber": "123456789012",
    "ifscCode": "SBIN0000123",
    "bankName": "State Bank of India",
    "upiId": "amit@upi"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "approvalStatus": "pending",
    "submittedAt": "2026-04-28T10:00:00.000Z"
  }
}
```

#### `POST /api/partner/verification/resubmit`

Purpose:

- re-upload docs after rejection

Request:

```json
{
  "docs": [
    {
      "type": "business",
      "label": "Hotel License",
      "url": "https://cdn.example.com/docs/license.pdf"
    }
  ]
}
```

### 2. Partner analytics

#### `GET /api/partner/analytics/overview`

Response:

```json
{
  "success": true,
  "data": {
    "totalRevenue": 275000,
    "totalBookings": 84,
    "occupancyRate": 71,
    "conversionRate": 23,
    "avgRating": 4.6,
    "activeListings": 9
  }
}
```

Recommended calculation:

- hotel owner:
  - revenue from confirmed hotel bookings
  - occupancy from sold vs available inventory
- driver:
  - revenue from confirmed transport bookings
  - conversion from accepted rides vs requests
- property owner:
  - conversion from leads to visits or closures

### 3. Wallet and payouts

#### `GET /api/partner/wallet`

Response:

```json
{
  "success": true,
  "data": {
    "balance": 15000,
    "pendingPayout": 4200,
    "lastPayoutAmount": 8000,
    "currency": "INR"
  }
}
```

#### `GET /api/partner/payouts`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "pay_1",
      "amount": 8000,
      "status": "paid",
      "scheduledAt": "2026-04-25T00:00:00.000Z",
      "paidAt": "2026-04-26T09:30:00.000Z",
      "reference": "MM-PAYOUT-20260426-1"
    }
  ]
}
```

### 4. Reviews and complaints

#### `GET /api/partner/reviews`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "rev_1",
      "authorName": "Riya",
      "rating": 5,
      "comment": "Very smooth ride and on-time pickup",
      "createdAt": "2026-04-27T11:00:00.000Z",
      "listingLabel": "Dehradun to Mussoorie"
    }
  ]
}
```

#### `GET /api/partner/complaints`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "cmp_1",
      "title": "Late arrival complaint",
      "detail": "Customer reported a 20 minute delay",
      "status": "open",
      "createdAt": "2026-04-27T12:00:00.000Z"
    }
  ]
}
```

### 5. Customer and admin chat

#### `GET /api/partner/chat/customer`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "thread_1",
      "title": "Ride booking chat",
      "participantLabel": "Ananya Sharma",
      "threadType": "customer",
      "messages": [
        {
          "_id": "msg_1",
          "body": "I am at the mall gate",
          "senderName": "Ananya Sharma",
          "senderType": "customer",
          "createdAt": "2026-04-27T13:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### `POST /api/partner/chat/customer`

Request:

```json
{
  "threadId": "thread_1",
  "body": "Reached in 5 minutes"
}
```

#### `GET /api/support/threads`

Purpose:

- admin support threads

#### `POST /api/support/messages`

Request:

```json
{
  "threadId": "support_1",
  "body": "Please review my payout issue"
}
```

### 6. Push device registration

#### `POST /api/partner/devices/register`

Request:

```json
{
  "token": "ExponentPushToken[...]"
}
```

Recommended DB fields:

- `partnerId`
- `userId`
- `platform`
- `expoPushToken`
- `lastSeenAt`
- `active`

### 7. Trip history and earnings ledger

#### `GET /api/partner/trips`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "trip_1",
      "rideId": "ride_1",
      "label": "Dehradun to Mussoorie",
      "amount": 2400,
      "status": "completed",
      "createdAt": "2026-04-27T09:00:00.000Z"
    }
  ]
}
```

#### `GET /api/partner/earnings`

Response shape same as trips, but ledger-oriented:

- completed ride payout lines
- hotel booking payout lines
- deductions
- adjustments

### 8. Live tracking, route ops, SOS

#### `GET /api/transport/tracking/:rideId`

Response:

```json
{
  "success": true,
  "data": {
    "rideId": "ride_1",
    "lat": 30.3255,
    "lng": 78.0431,
    "pickupLat": 30.3165,
    "pickupLng": 78.0322,
    "dropLat": 30.4598,
    "dropLng": 78.0664,
    "status": "live",
    "updatedAt": "2026-04-28T08:10:00.000Z"
  }
}
```

#### `POST /api/transport/live-location`

Request:

```json
{
  "rideId": "ride_1",
  "lat": 30.3255,
  "lng": 78.0431,
  "pickupLat": 30.3165,
  "pickupLng": 78.0322,
  "dropLat": 30.4598,
  "dropLng": 78.0664
}
```

Recommended behavior:

- persist latest coordinates
- emit Socket.IO event to customer room and admin room
- store heartbeat timestamp

#### `GET /api/transport/nearby-requests?lat=30.32&lng=78.04`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "req_1",
      "customerName": "Vikas",
      "pickupLabel": "Clock Tower",
      "dropLabel": "Mussoorie Library Chowk",
      "distanceKm": 3.8,
      "etaMinutes": 10,
      "amount": 950,
      "status": "new"
    }
  ]
}
```

Recommended logic:

- filter by open ride requests near driver coordinates
- sort by nearest first
- include ETA approximation

#### `POST /api/transport/share-trip`

Request:

```json
{
  "rideId": "ride_1",
  "emergencyContact": "+919800000000",
  "shareUrl": "https://www.google.com/maps/dir/?api=1..."
}
```

Recommended behavior:

- create trip-share log
- optionally trigger SMS/WhatsApp integration later

#### `POST /api/transport/sos`

Request:

```json
{
  "rideId": "ride_1",
  "lat": 30.3255,
  "lng": 78.0431,
  "note": "Vehicle issue on hill route"
}
```

Recommended behavior:

- create high-priority incident
- notify admin dashboard immediately
- optionally fan out to emergency contact

### 9. Availability scheduling

#### `GET /api/partner/availability`

Response:

```json
{
  "success": true,
  "data": {
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "startTime": "06:00",
    "endTime": "22:00"
  }
}
```

#### `POST /api/partner/availability`

Request:

```json
{
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "startTime": "06:00",
  "endTime": "22:00"
}
```

Use cases:

- ride partner online window
- hotel partner booking response hours
- property partner lead response schedule

### 10. Property partner leads

#### `GET /api/partner/property/leads`

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "lead_1",
      "title": "Homestay lease inquiry",
      "customerName": "Sarthak",
      "budget": 1800000,
      "message": "Looking for a 6-room property near Mussoorie",
      "status": "new",
      "location": "Mussoorie"
    }
  ]
}
```

## Existing endpoint payload expectations

To match the new frontend better, align your current endpoints to these fields.

### `POST /api/hotel/add`

Request:

```json
{
  "hotelName": "Mountain View Retreat",
  "location": "Mussoorie",
  "description": "Family stay with valley-facing rooms",
  "pricePerNight": 4500,
  "roomsAvailable": 12,
  "roomTypes": ["Deluxe", "Suite"],
  "photoUrls": ["https://cdn.example.com/1.jpg"]
}
```

### `PATCH /api/hotel/update/:id`

Request:

```json
{
  "hotelName": "Updated name",
  "location": "Updated location",
  "description": "Updated description",
  "pricePerNight": 5000,
  "roomsAvailable": 10,
  "roomTypes": ["Deluxe", "Family Suite"],
  "photoUrls": ["https://cdn.example.com/1.jpg"]
}
```

### `POST /api/inventory/update`

Request:

```json
{
  "hotelId": "hotel_1",
  "date": "2026-04-28",
  "availableRooms": 8,
  "blockedRooms": 1,
  "pricePerNight": 5200
}
```

### `GET /api/inventory/:hotelId`

Response:

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-28",
      "availableRooms": 8,
      "blockedRooms": 1,
      "soldRooms": 3,
      "pricePerNight": 5200
    }
  ]
}
```

### `POST /api/transport/add`

Request:

```json
{
  "vehicleModel": "Innova Crysta",
  "vehicleNumber": "UK07AB1234",
  "routeFrom": "Dehradun",
  "routeTo": "Mussoorie",
  "seatsAvailable": 4,
  "pricePerSeat": 850,
  "pickupLat": 30.3165,
  "pickupLng": 78.0322,
  "dropLat": 30.4598,
  "dropLng": 78.0664,
  "driverOnline": true
}
```

### `PATCH /api/transport/update/:id`

Should support all of:

- `vehicleModel`
- `vehicleNumber`
- `routeFrom`
- `routeTo`
- `seatsAvailable`
- `pricePerSeat`
- `pickupLat`
- `pickupLng`
- `dropLat`
- `dropLng`
- `driverOnline`

### `POST /api/user/bookings/update-status`

Request:

```json
{
  "bookingId": "booking_1",
  "status": "confirmed"
}
```

Supported statuses required by current app:

- `confirmed`
- `declined`
- `cancelled`

Optional extension:

```json
{
  "bookingId": "booking_1",
  "status": "cancelled",
  "reason": "Cancelled from partner app calendar"
}
```

## Recommended data models

### `PartnerVerification`

- `_id`
- `partnerId`
- `userId`
- `role`
- `businessName`
- `gstNumber`
- `docs`
- `bankDetails`
- `approvalStatus`
- `rejectionReason`
- `submittedAt`
- `reviewedAt`

### `PartnerWallet`

- `_id`
- `partnerId`
- `balance`
- `pendingPayout`
- `lastPayoutAmount`
- `currency`

### `PartnerPayout`

- `_id`
- `partnerId`
- `amount`
- `status`
- `scheduledAt`
- `paidAt`
- `reference`

### `PartnerReview`

- `_id`
- `partnerId`
- `listingId`
- `listingType`
- `authorName`
- `rating`
- `comment`
- `createdAt`

### `PartnerComplaint`

- `_id`
- `partnerId`
- `title`
- `detail`
- `status`
- `createdAt`

### `ChatThread`

- `_id`
- `partnerId`
- `participantUserId`
- `threadType`
- `title`
- `participantLabel`
- `lastMessageAt`

### `ChatMessage`

- `_id`
- `threadId`
- `senderId`
- `senderType`
- `senderName`
- `body`
- `createdAt`

### `TransportTracking`

- `_id`
- `rideId`
- `driverId`
- `lat`
- `lng`
- `pickupLat`
- `pickupLng`
- `dropLat`
- `dropLng`
- `status`
- `updatedAt`

### `PartnerAvailabilitySchedule`

- `_id`
- `partnerId`
- `days`
- `startTime`
- `endTime`

### `PropertyLead`

- `_id`
- `partnerId`
- `title`
- `customerName`
- `budget`
- `message`
- `status`
- `location`
- `createdAt`

## Push notification event triggers

The app is ready for push. Recommended events:

- new hotel booking request
- new ride request
- booking confirmed
- booking cancelled
- payout processed
- KYC approved
- KYC rejected
- admin support reply
- customer message received
- SOS raised

Each notification should optionally include deep-link targets:

- `mountainmatepartner://inbox`
- `mountainmatepartner://ops`
- `mountainmatepartner://live`

## Priority rollout order

### P0: must-have for current app to feel real

- role middleware
- `GET /api/partner/status`
- `POST /api/partner/verification`
- `POST /api/partner/verification/resubmit`
- `GET /api/partner/analytics/overview`
- support `cancelled` in booking status update
- support full ride update payload
- support hotel create/update payload fields used by app
- support inventory update payload fields used by app

### P1: makes operations complete

- `GET /api/partner/wallet`
- `GET /api/partner/payouts`
- `GET /api/partner/reviews`
- `GET /api/partner/complaints`
- `POST /api/partner/devices/register`
- `GET /api/partner/availability`
- `POST /api/partner/availability`

### P2: makes the driver side feel premium

- `GET /api/transport/tracking/:rideId`
- `POST /api/transport/live-location`
- `GET /api/transport/nearby-requests`
- `POST /api/transport/share-trip`
- `POST /api/transport/sos`
- `GET /api/partner/trips`
- `GET /api/partner/earnings`

### P3: completes communication and property ops

- `GET /api/partner/chat/customer`
- `POST /api/partner/chat/customer`
- `GET /api/support/threads`
- `POST /api/support/messages`
- `GET /api/partner/property/leads`

## Frontend file map to endpoint ownership

Use this when assigning backend work:

- `src/screens/hotelOwner/HotelManagementScreen.tsx`
  - hotel add/update
  - inventory update/read
  - booking confirm/decline/cancel
- `src/screens/driver/RideManagementScreen.tsx`
  - ride add/update
  - partner trips
  - partner earnings
- `src/screens/shared/LiveOperationsScreen.tsx`
  - tracking
  - live location
  - nearby requests
  - share trip
  - SOS
- `src/screens/shared/OperationsCenterScreen.tsx`
  - partner status
  - verification
  - analytics
  - wallet
  - payouts
  - reviews
  - complaints
  - availability
  - device registration
- `src/screens/shared/InboxScreen.tsx`
  - notifications read/fetch
  - customer chat
  - admin chat
- `src/screens/propertyOwner/PropertyManagementScreen.tsx`
  - property leads

## Final recommendation

If you want the app to truly feel production-grade, the backend should be implemented in this order:

1. Lock auth roles and approval metadata in Supabase `app_metadata`
2. Align existing hotel, inventory, ride, and booking endpoints with the frontend payloads above
3. Add verification and partner status endpoints
4. Add analytics, wallet, payouts, and reviews
5. Add driver live tracking and nearby request discovery
6. Add chat and property lead systems
7. Add push trigger pipeline and deep-linked notifications
