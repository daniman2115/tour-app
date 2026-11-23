# Virtual Tour App

A full-stack mobile app (Expo/React Native) that lets travelers browse destinations, discover local guides, book virtual tours, and join live video calls. Data is served by an Express + MongoDB backend.

## Project structure

```
virtual-new/
├── client/          # Expo (React Native) mobile app
├── server/          # Express + MongoDB REST API
└── README.md
```

## Tech stack

- **Client**: Expo, React Native, Expo Router, Redux Toolkit, Axios
- **Server**: Node.js, Express, MongoDB (Mongoose), JWT auth, Cloudinary, Mailgun
- **Real-time / calls**: Stream (GetStream) video SDK

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Expo CLI (`npm install -g expo-cli`) and a device/emulator

## Backend setup

```bash
cd server
npm install
```

Create `server/.env` (already provided) with at least:

```
MONGO_URL=<your mongodb connection string>
JWT_SECRET=<secret>
EXPO_PUBLIC_API_URL is set on the client side
```

Seed initial data:

```bash
node seedPlaces.js
node seedGuides.js
```

Run the server:

```bash
npm run server   # nodemon
# or
node server.js
```

The API listens on `http://0.0.0.0:5000`.

## Frontend setup

```bash
cd client
npm install
```

Configure `client/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-machine-ip>:5000/api/users
EXPO_PUBLIC_GET_STREAM_API_KEY=<stream key>
```

Run the app:

```bash
npx expo start
```

## API overview

| Route | Description |
|-------|-------------|
| `/api/users` | Auth (register, login, verify, password reset, profile) |
| `/api/places` | Places CRUD, search/filter, top guides, guides for a place |
| `/api/guides` | Guides list, detail, create/update profile |
| `/api/bookings` | Create/list/update bookings |
| `/api/reviews` | Guide reviews |
| `/api/notifications` | User notifications |
| `/api/calls` | Call logs |

## Notes

- All screens fetch real data from the backend; mock seed data is only used for initial DB seeding.
- Favorites are stored locally on the device for now.
- Email verification requires a configured Mailgun/Gmail account; in development you can create users directly in MongoDB.