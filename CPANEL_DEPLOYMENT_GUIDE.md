# cPanel Deployment Guide

This guide covers three separate things:

1. Website frontend deployment on cPanel
2. Backend API deployment on cPanel
3. Android APK generation for the partner app

These are different jobs.

## Very important first

Your mobile app does not get deployed to cPanel directly like a normal website.

What goes where:

- Website frontend
  - deploy to cPanel
- Backend API
  - deploy to cPanel
- Android app
  - build APK or AAB with EAS or Android Studio

## Part 1: Deploy your website frontend on cPanel

This is for the normal website users open in the browser.

### If your website frontend is React/Vite/Next static export

1. Build the frontend

Usually something like:

```powershell
npm install
npm run build
```

2. Find the built output folder

Usually one of:

- `dist`
- `build`
- `out`

3. Log in to cPanel

4. Open `File Manager`

5. Go to:

- `public_html`

or for a subdomain:

- `public_html/subdomain-folder`

6. Upload the contents of the built frontend folder there

Important:

- upload the contents inside `dist`, not the `dist` folder itself, unless you specifically want that folder in the URL

7. If React Router is used, add `.htaccess`

Use this in `public_html/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

This prevents route refresh errors on SPA apps.

## Part 2: Deploy your backend API on cPanel

This depends on what backend you have.

You need to tell me which one it is:

- Laravel / PHP
- Node.js / Express
- something else

I can guide both, but the steps differ.

### Option A: If backend is Laravel / PHP

1. Zip your backend project
2. Upload it to cPanel
3. Extract it outside `public_html` if possible
4. Point the web root to the `public` folder of Laravel
5. Set `.env` in the backend
6. Run:

```bash
composer install
php artisan key:generate
php artisan migrate
php artisan config:cache
php artisan route:cache
```

7. Make sure these are correct in backend `.env`

- `APP_URL`
- database host/user/password/name
- Supabase keys if used by backend
- mail settings
- any socket or queue settings

8. Confirm the API works publicly

Example:

- `https://api.yourdomain.com/api/health`

### Option B: If backend is Node.js / Express

1. Confirm your cPanel supports `Setup Node.js App`
2. Upload the backend project
3. Create a Node app in cPanel
4. Choose:

- Node version
- app root
- startup file like `server.js`, `app.js`, or `index.js`

5. Add backend environment variables in cPanel

Examples:

- `PORT`
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

6. Run dependency install

Usually:

```bash
npm install
```

7. Restart the Node app from cPanel

8. Confirm the API works publicly

Example:

- `https://api.yourdomain.com/api/health`

## Part 3: Connect the mobile app to your real backend

Right now your mobile `.env` points to localhost.

Change:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

to:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Keep Supabase values as the real project values.

## Part 4: Generate APK for the Android app

Use the partner app folder:

- `C:\Users\hp\Desktop\Mountain Mate Partner app\Mountain-Mate-Partner-App`

### Recommended way: EAS

1. Install EAS CLI

```powershell
npm install -g eas-cli
```

2. Log in

```powershell
eas login
```

3. Initialize project

```powershell
eas init
```

4. Put the real project ID into:

- `app.json`

5. Add:

- `google-services.json`

6. Build APK

```powershell
eas build --platform android --profile preview
```

7. Download the APK from the Expo build link

8. If you want users to download it from your site, upload that `.apk` file to cPanel

Example:

- `public_html/downloads/mountainmate-partner.apk`

Then share a link like:

- `https://yourdomain.com/downloads/mountainmate-partner.apk`

## Part 5: What you must test before real release

- partner signup
- partner login
- hotel add
- hotel edit
- inventory update
- ride add
- ride edit
- booking status updates
- notifications
- KYC submit
- payouts
- review fetch
- chat
- live tracking
- nearby requests
- SOS

## Part 6: What I need from you to finish backend wiring directly

Best option:

- place the backend project folder next to this app folder on your machine

Example:

- `C:\Users\hp\Desktop\Mountain Mate Partner app\backend`

or:

- `C:\Users\hp\Desktop\mountainmate-backend`

Then tell me the exact path.

Once I have the backend folder, I can inspect routes, controllers, models, and env config directly and wire the missing APIs instead of guessing.

## Part 7: Important correction about `.env`

You do not paste API route code into `.env`.

`.env` is only for values like:

- backend base URL
- Supabase URL
- Supabase anon key
- secret keys
- database credentials

API routes are backend code files, not env variables.

So if you want me to finish the missing API work, I need one of these:

### Best

- the actual backend project folder

### Acceptable fallback

- backend route files
- controllers
- models
- backend `.env.example`
- package.json or composer.json

## Part 8: If you cannot share the whole backend folder

Then send me:

1. Backend framework name
   - Laravel or Node/Express
2. Backend project path
3. Main route files
4. Existing partner-related controller files
5. Existing hotel and transport model files
6. Backend `.env.example`

That is enough for me to tell you exactly what to add next.
