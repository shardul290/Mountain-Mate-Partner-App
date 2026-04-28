# Mountain Mate Partner App

Independent React Native Expo codebase for the Uttarakhand partner-facing mobile app. This app is separate from the existing website frontend and is designed to reuse the current backend wherever possible.

## Product focus

- Hotel Owners
- Taxi Drivers
- Property Owners / Travel Partners

## Stack

- Expo + React Native + TypeScript
- React Navigation
- NativeWind
- Zustand
- Axios
- Supabase Auth session -> existing backend `supabaseAuth`
- Expo Notifications with Android FCM-ready configuration

## Folder structure

```text
src
|- auth
|- navigation
|- components
|- screens
|  |- hotelOwner
|  |- driver
|  |- propertyOwner
|  `- shared
|- services
|- hooks
|- store
|- utils
`- assets
```

## Setup

1. Create `.env` from `.env.example`.
2. Add `google-services.json` for Android push notifications.
3. Install dependencies.
4. Start with `npm run start`.

## Important implementation notes

- Mobile auth should use Supabase directly because the backend owner routes expect a Supabase bearer token.
- Approval state is modeled from `app_metadata.approval_status` or `user_metadata.approval_status`.
- `partner_role` currently lives in user metadata on signup and should be promoted to `app_metadata.role` by an admin workflow for stronger enforcement.
- Property owner flows are scaffolded in mobile UI, but the backend still needs dedicated property and lead APIs.
