# EAS Android Prep

This app is now prepared for Expo EAS build configuration, but you still need a few real project values before generating an APK.

## Files already prepared

- `app.json`
- `eas.json`

## What you still need

### 1. Install Expo and EAS tools on your machine

Run:

```powershell
npm install
npm install -g eas-cli
```

### 2. Log in to Expo

```powershell
eas login
```

### 3. Create or link the Expo project

Inside the app folder:

```powershell
eas init
```

This will give you the real EAS project ID. Replace this value in:

- `app.json`

Current placeholder:

```json
"projectId": "replace-with-eas-project-id"
```

### 4. Add Firebase Android config

You need:

- `google-services.json`

Put it in the project root:

- `google-services.json`

This is required for reliable Android push notifications.

### 5. Update the backend URL

Your current app `.env` uses a local backend URL.

For production, change:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

to your real hosted API, for example:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 6. Build preview APK

This creates an installable APK file for testing:

```powershell
eas build --platform android --profile preview
```

### 7. Build production Android bundle

This creates the Play Store style production build:

```powershell
eas build --platform android --profile production
```

## Which profile to use

- `preview`
  - installable `.apk`
  - easiest for direct testing and sharing
- `production`
  - `.aab`
  - best for Play Store submission

## If you want APK specifically

Use:

```powershell
eas build --platform android --profile preview
```

## Minimum production checklist

- real `EXPO_PUBLIC_API_URL`
- working backend deployed publicly
- working Supabase project
- real EAS project ID
- `google-services.json`
- notification testing on physical Android device
- login/signup tested
- hotel CRUD tested
- ride CRUD tested
- inventory tested
- tracking tested
- payouts/KYC/chat endpoints working
