# E-Store

🔗 **[Live Preview](https://web-store-nextjs-alpha.vercel.app/)**

A full-stack e-commerce platform built with **Next.js 16**, covering the core shopping journey end to end: authentication, product discovery, cart persistence, order creation, and admin-side management.

---

## Overview

The app includes:

* Email-based **sign up** with OTP verification
* **Sign in** and **forgot password** flows with OTP reset
* **Access token + refresh token** auth using HTTP-only cookies
* **Axios interceptor** refresh flow for automatic session recovery
* Product browsing with **search, filtering, sorting, and cursor-based pagination**
* A **Redux cart** with local persistence and database sync for logged-in users
* Inventory management
* Checkout flow with **PayFast sandbox**

---

## Tech Stack

### Core platform

* **Next.js 16**
* **React 19**
* **Node.js**
* **PostgreSQL / Neon**

### State, data, and validation

* **Redux Toolkit**
* **Redux Persist**
* **TanStack React Query**
* **Zod**
* **Axios**

### Content, media, and messaging

* **Cloudinary / Next Cloudinary**
* **Nodemailer**
* **Resend**

### Security and utilities

* **bcryptjs**
* **jsonwebtoken**
* **dayjs**
* **slugify**
* **fuse.js**
* **use-debounce**
* **clsx**
* **tailwind-merge**
* **export-to-csv**

---

## Key Features

### Authentication

* Sign up with username, email, and password
* OTP verification for account activation
* Forgot password flow with OTP reset
* Login flow with protected cookie-based sessions
* Access token refresh handled automatically on the client
* Role-aware access control for admin and user routes

### Product discovery

* Search by **name** or **slug**
* Filter by **category**, **size**, **color**, and **price range**
* Sort by **newest**, **price low**, and **price high**
* Cursor-based pagination instead of offset pagination
* Debounced search and price updates to reduce unnecessary requests

### Cart system

* Redux-based local cart updates for immediate UI feedback
* `redux-persist` support for durable client-side state
* Database sync when the user is logged in
* Add, remove, increment, decrement, and clear actions
* Live subtotal and quantity tracking in the cart sidebar

### Admin panel

* Monthly revenue chart
* Order status pie chart
* Product and inventory management
* Read / update / delete rules based on entity type
* User management with role updates only
* Review management with restricted write behavior

### Checkout

* Order creation flow
* Payment integration with **PayFast sandbox**

---

## Authentication Flow

### Sign up and OTP verification

1. The user submits username, email, and password.
2. The backend checks whether the username or email already exists.
3. The password is hashed with **bcryptjs**.
4. A 4-digit OTP is generated and stored with an expiry time.
5. A temporary `pending_user` token is saved in an HTTP-only cookie.
6. The OTP is emailed to the user.
7. After successful OTP verification, the user is inserted into the database, marked verified, and issued access and refresh tokens.

> This flow keeps account creation controlled and avoids creating active users before email ownership is confirmed.

### Forgot password

1. The user enters an email address.
2. The backend checks whether an account exists.
3. A new OTP is generated and emailed.
4. After OTP verification, the password is replaced with a newly hashed password.
5. New auth cookies are issued.

### Token refresh flow

The client uses an Axios interceptor so expired access tokens do not break the UX.

* When a request returns `401`, the app checks whether a refresh is already in progress.
* If yes, the failing request joins a queue.
* If not, the app sends a refresh request to `/api/auth/refresh`.
* On success, the user session is updated and queued requests retry automatically.
* On failure, the app clears auth state and redirects to `/login`.

> This gives the app a smoother session experience without forcing the user to log in again unnecessarily.

---

## Shop Flow

The product listing is handled by a dedicated hook and a route optimized for filtering.

### Client-side logic

* Search and price input are debounced
* Filter changes reset pagination state
* The hook returns `products`, `total`, `loading`, `hasNextPage`, and `loadMore`

### Server-side logic

The shop API builds the query dynamically based on the request.

* Filters product variants by stock, deleted state, category, size, and color
* Searches by both name and slug
* Applies a price range
* Uses a stable cursor for pagination
* Fetches `limit + 1` rows to determine whether another page exists

---

## Cart Flow

The cart slice is designed with an optimistic update strategy.

* The UI updates immediately when the user adds or changes items
* Logged-in users sync cart state with the server
* Failed sync operations revert to the previous state
* Cart items are normalized so different payload shapes still behave consistently
* Totals are recalculated after each change

---

## Project Notes

A lot of the implementation was shaped using documentation, internet references, and AI assistance, especially where syntax details were easy to forget. The goal of the project, however, is not just syntax memorization — it is building a working product with real flow, state, validation, database integration, and session handling.

The project is intentionally built as a practical, portfolio-style e-commerce system that demonstrates understanding of application structure, data flow, and user experience.

---

## Environment Variables

Create a `.env.local` file and configure the values used by your app.

```env
# neon
NEON_URL=

# cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_PRESET=

# tokens
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=
TEMP_DATA_TOKEN_SECRET=
TEMP_DATA_TOKEN_EXPIRY=
JWT_SECRET=
RESEND_API_KEY=

# Oauth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# payfast
MERCHANT_ID=
MERCHANT_KEY=
SANDBOX_URL=

NEXT_PUBLIC_BASE_URL=
```

---

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

---

## Folder Structure

```bash
app/
api/
components/
hooks/
lib/
store/
utils/
```