# 🔒 Enterprise QA, Security & Penetration Testing Audit Report

**Target**: Fzee Travels & Tours — B2B Travel Agency Website & Portal  
**Audit Date**: 2026-08-09  
**Auditor Role**: Principal QA + AppSec + PenTest Engineer  
**Severity Scale**: 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW | ℹ️ INFO

---

## Executive Summary

After a full source-code-level audit of **27 API route files**, the **Prisma schema**, **auth module**, **middleware**, **seed scripts**, and **environment configuration**, I identified **38 distinct findings** across security, authorization, business logic, data integrity, input validation, and UI/UX domains.

> [!CAUTION]
> **6 CRITICAL** and **9 HIGH** severity findings were discovered that could allow unauthorized data manipulation, financial fraud, and complete system takeover in a production environment.

---

## 🔴 CRITICAL FINDINGS (6)

### CRIT-01: Hardcoded JWT Secrets — Full Token Forgery
**File**: [auth.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/lib/auth.ts#L5-L6)  
**Category**: Authentication / Secret Management

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
```

**AND** in [.env](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/.env#L4-L5):
```
JWT_SECRET="your-super-secret-jwt-key-fzee-travels"
JWT_REFRESH_SECRET="your-refresh-secret-fzee-travels"
```

**Impact**: The JWT secrets are predictable/guessable strings. An attacker who knows or guesses these values can forge valid JWT tokens for ANY user role, including `SUPER_ADMIN`, gaining full control over the system.

**Attack Vector**: Craft a JWT payload `{ userId: "any-id", email: "any@email", role: "SUPER_ADMIN" }`, sign it with `'your-super-secret-jwt-key-fzee-travels'`, and set it as the `accessToken` cookie → instant SUPER_ADMIN access.

**Fix**: Generate cryptographically random secrets (256+ bits) and store them securely:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### CRIT-02: Flights API — Zero Authentication on CRUD Operations
**File**: [flights/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/flights/route.ts)  
**Category**: Authorization / Broken Access Control

The **GET**, **POST**, **PUT**, and **DELETE** handlers for `/api/flights` have **NO authentication or authorization middleware**.

```typescript
export async function POST(req: NextRequest) { // NO withAuth, NO withRole
  const body = await req.json();
  const data = createFlightSchema.parse(body);
  const flight = await prisma.flight.create({ ... });
}

export async function DELETE(req: NextRequest) { // NO withAuth, NO withRole
  const id = searchParams.get('id');
  await prisma.flight.delete({ where: { id } });
}
```

**Impact**: ANY anonymous user can:
- Create fake flights with manipulated prices
- Delete all flights from the system
- Modify existing flight data (seats, pricing, PNR)

**Affected Endpoints**: `GET /api/flights`, `POST /api/flights`, `PUT /api/flights`, `DELETE /api/flights`

---

### CRIT-03: Hotels API — Zero Authentication on CRUD Operations
**File**: [hotels/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/hotels/route.ts)  
**Category**: Authorization / Broken Access Control

Same pattern as CRIT-02 — the **POST** and **DELETE** handlers have no auth.

```typescript
export async function POST(req: NextRequest) { // NO withAuth
  const body = await req.json();
  const validatedData = createHotelSchema.parse(body);
  const hotel = await prisma.hotel.create({ ... });
}
```

**Impact**: Anonymous users can create/delete hotels, manipulate prices, and pollute the booking inventory.

---

### CRIT-04: Visa API — Zero Authentication on CRUD Operations
**File**: [visa/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/visa/route.ts)  
**Category**: Authorization / Broken Access Control

Same issue — POST and DELETE have no auth.

**Impact**: Anonymous users can create visa services with fraudulent prices or delete legitimate ones.

---

### CRIT-05: Groups API — Zero Authentication on CRUD Operations
**File**: [groups/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/groups/route.ts)  
**Category**: Authorization / Broken Access Control

POST and DELETE have no auth. Additionally, the POST handler assigns the group to `prisma.agency.findFirst()` — the **first agency** in the database — rather than the authenticated user's agency.

```typescript
const defaultAgency = await prisma.agency.findFirst(); // RANDOM agency selection
```

**Impact**: Anonymous users can create and delete tour groups. Groups are linked to an arbitrary agency.

---

### CRIT-06: Flight Categories API — Zero Authentication on CRUD Operations
**File**: [flights/categories/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/flights/categories/route.ts)  
**Category**: Authorization / Broken Access Control

GET, POST, and DELETE have no auth.

---

## 🟠 HIGH FINDINGS (9)

### HIGH-01: Admin Top-up List API — No Authentication
**File**: [admin/topup/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/topup/route.ts)  
**Category**: Authorization / Information Disclosure

The `GET /api/admin/topup` endpoint lists all wallet top-up requests (including agent names, emails, amounts, proof documents) with **NO authentication or role check**.

```typescript
export async function GET(req: NextRequest) { // NO withRole, NO withAuth
  const topups = await prisma.walletTopUp.findMany({
    include: { agent: { include: { user: true } }, agency: true },
  });
}
```

**Impact**: Any anonymous user can view all financial top-up data, agent PII, and agency information.

---

### HIGH-02: Chat API — No Authentication + API Key Exposure Risk
**File**: [chat/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/chat/route.ts)  
**Category**: Authentication / Resource Abuse

The chat endpoint has no authentication. Anyone can spam the Gemini API endpoint, causing:
- API quota exhaustion and billing charges
- Denial of service to legitimate users

Additionally, the Gemini API key is sent directly in the URL query parameter (line 52), which can be logged in server access logs.

---

### HIGH-03: Booking Race Condition — Double-Booking / Overselling
**File**: [bookings/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/route.ts#L88-L110)  
**Category**: Business Logic / Race Condition

The booking flow reads available slots **outside** the transaction, then decrements **inside** the transaction. Under concurrent requests, two agents can simultaneously see `availableSeats = 1`, both pass the check, and both create bookings — resulting in **negative available seats**.

```typescript
// OUTSIDE transaction: read available seats
const flight = await prisma.flight.findUnique({ where: { id: flightId } });
if (flight.availableSeats < numberOfPax) return error;

// INSIDE transaction: decrement using STALE value
await tx.flight.update({
  data: { availableSeats: availableSlots - numberOfPax }, // Uses pre-read value!
});
```

**Fix**: Move the inventory check inside the transaction and use `{ increment: -numberOfPax }` with a post-check:
```typescript
const updated = await tx.flight.update({
  where: { id: flightId },
  data: { availableSeats: { decrement: numberOfPax } },
});
if (updated.availableSeats < 0) throw new Error('Oversold');
```

---

### HIGH-04: Payment API — No Booking Ownership Verification (IDOR)
**File**: [payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts#L41-L113)  
**Category**: Authorization / IDOR

When creating a payment, the API verifies that the user is an agent, but **never checks** that the `bookingId` belongs to that agent's agency. An agent from Agency A can submit a payment against a booking belonging to Agency B.

```typescript
// Only checks: is user an agent? ✅
// Never checks: does bookingId belong to THIS agent's agency? ❌
const { bookingId, amount, method } = submitPaymentSchema.parse(body);
```

**Impact**: Cross-agency payment manipulation, financial fraud, and booking status corruption.

---

### HIGH-05: Payment Amount Bypass — Agent Can Set Arbitrary Payment Amount
**File**: [payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts#L43)  
**Category**: Business Logic / Financial Fraud

The payment API accepts `amount` from the client and never validates it against the booking's `totalAmount`. An agent could:
1. Create a booking for PKR 500,000
2. Submit a wallet payment of PKR 1 (amount: 1)
3. The booking gets auto-confirmed (`status: 'confirmed'`)
4. An invoice marked as `'paid'` is created

```typescript
const { amount } = submitPaymentSchema.parse(body); // Client-supplied amount
// NEVER checked against booking.totalAmount
await tx.booking.update({ data: { status: 'confirmed' } }); // Auto-confirms!
```

---

### HIGH-06: Wallet Payment — Balance Check Uses Stale Read (Race Condition)
**File**: [payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts#L55-L77)  
**Category**: Business Logic / Race Condition

The wallet balance check happens **before** the transaction, but the deduction happens **inside** it. Two concurrent wallet payments can both pass the balance check, leading to a **negative wallet balance**.

```typescript
if (agent.walletBalance < amount) { return error; } // STALE READ
const paymentResult = await prisma.$transaction(async (tx) => {
  await tx.agent.update({
    data: { walletBalance: agent.walletBalance - amount }, // Uses pre-read value!
  });
});
```

---

### HIGH-07: Booking Detail API — No Ownership Check (IDOR)
**File**: [bookings/[id]/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/%5Bid%5D/route.ts#L7-L37)  
**Category**: Authorization / IDOR

The `GET /api/bookings/:id` endpoint checks authentication but never verifies that the booking belongs to the requesting agent. Any authenticated user can view and delete ANY booking.

```typescript
export const GET = withAuth(async (req, { params }) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  // NEVER checks: booking.agentId === user's agent ID ❌
  return NextResponse.json({ booking });
});
```

The **DELETE** handler has the same issue.

---

### HIGH-08: Booking Export — No Ownership Check (IDOR)  
**File**: [bookings/[id]/export/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/%5Bid%5D/export/route.ts#L6-L29)  
**Category**: Authorization / IDOR

Any authenticated user can export the Excel voucher for ANY booking ID, exposing passenger PII (passports, DOBs), financial data, and agent information.

---

### HIGH-09: CRM Delete — No Ownership Check
**File**: [crm/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/crm/route.ts#L77-L96)  
**Category**: Authorization / IDOR

The CRM DELETE handler uses `withAuth` but never verifies the activity belongs to the requesting agent's agency:

```typescript
export const DELETE = withAuth(async (req: NextRequest) => {
  const id = searchParams.get('id');
  await prisma.cRMActivity.delete({ where: { id } }); // Any ID accepted!
});
```

---

## 🟡 MEDIUM FINDINGS (12)

### MED-01: Registration — No Rate Limiting
**File**: [auth/register/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/auth/register/route.ts)

No rate limiting on registration. An attacker can create thousands of agencies, each with a wallet and credit limit, flooding the system.

---

### MED-02: Login — No Rate Limiting / Brute Force Protection
**File**: [auth/login/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/auth/login/route.ts)

No account lockout, no CAPTCHA, no rate limiting. The seed file uses `admin123` as the password for all admin accounts. Brute force is trivially easy.

---

### MED-03: Password Policy Too Weak
**File**: [auth/register/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/auth/register/route.ts#L11)

Password minimum length is only 6 characters with no complexity requirements:
```typescript
password: z.string().min(6),
```

---

### MED-04: Registration Bypasses Agency Approval
**File**: [auth/register/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/auth/register/route.ts#L43)

When `autoApproveAgencies` is true (default), a newly registered agency is immediately approved and can begin making bookings. This bypasses any business verification.

---

### MED-05: Booking Number Uses `Date.now()` — Predictable & Collision-Prone
**File**: [bookings/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/route.ts#L130)

```typescript
bookingNumber: `BK-${Date.now()}`,
```

Under concurrent requests (same millisecond), two bookings get the **same booking number** → unique constraint violation and booking failure. Also, booking numbers are sequential and predictable, enabling enumeration attacks.

---

### MED-06: Invoice Number Uses `Date.now()` — Same Issue
**Files**: Multiple routes ([payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts#L93), [bookings/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/route.ts#L160))

Invoice numbers also use `Date.now()` and can collide under concurrent load.

---

### MED-07: Duplicate Invoice Creation
**Files**: [bookings/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/bookings/route.ts#L159-L176), [payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts#L91-L103), [admin/bookings/[id]/approve/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/bookings/%5Bid%5D/approve/route.ts#L34-L46), [invoices/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/invoices/route.ts#L24-L51)

Invoices are auto-created in **four different places**: booking creation, wallet payment, admin booking approval, and the invoices GET handler. A single booking can end up with 3-4 duplicate invoices.

---

### MED-08: Admin Booking Approval — No Idempotency Guard
**File**: [admin/bookings/[id]/approve/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/bookings/%5Bid%5D/approve/route.ts)

Unlike the top-up approval route, the booking approval route doesn't check if the booking is already confirmed. Re-approving creates **duplicate invoices** each time.

---

### MED-09: Agency Approval — No Agent Status Sync
**File**: [admin/agencies/[id]/approve/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/agencies/%5Bid%5D/approve/route.ts)

When an agency is approved or rejected, the **agent records** linked to it are not updated. An agent whose agency is rejected/suspended can still log in and make bookings.

---

### MED-10: Cookie `secure` Flag Inconsistency
**Files**: [auth.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/lib/auth.ts#L49), [middleware.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/lib/middleware.ts#L42)

`auth.ts` uses `process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'`, while `middleware.ts` uses `process.env.NODE_ENV === 'production'`. If deployed to a non-Vercel production host, auth cookies won't have the `secure` flag.

---

### MED-11: No CSRF Protection
**Category**: Security / CSRF

The application uses cookie-based JWT auth with `sameSite: 'lax'`. While `lax` provides some CSRF protection for state-changing requests, the API routes don't implement any CSRF token validation. POST requests from malicious third-party forms can potentially exploit cookie-based auth.

---

### MED-12: Token Refresh Doesn't Re-Verify User Existence
**File**: [auth.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/lib/auth.ts#L78-L84)

When a refresh token is used to generate new access tokens, the system **never checks** if the user still exists or is still active in the database. A deleted or suspended user retains valid tokens until expiry.

---

## 🟢 LOW FINDINGS (7)

### LOW-01: Seed File Hardcoded Passwords — Credential Exposure
**File**: [prisma/seed.js](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/prisma/seed.js#L24-L25)

Seed file uses `admin123` and `agent123` as passwords for all demo accounts. If seed accounts exist in production, they are trivially compromised.

---

### LOW-02: Error Messages Leak Internal Details
**Files**: Multiple API routes

Several routes expose raw error messages to clients:
```typescript
return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 });
```
Stack traces and Prisma error details can leak internal database schema information.

---

### LOW-03: No Input Sanitization for XSS in Stored Fields
**Files**: Multiple models/routes

Fields like `specialRequests`, `description`, `notes`, `contactName`, and `subject` are stored directly without HTML sanitization. If rendered without escaping (e.g., in emails or PDF exports), this could lead to stored XSS.

---

### LOW-04: User Password Returned in Admin Agencies Response
**File**: [admin/agencies/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/agencies/route.ts#L15-L18)

```typescript
include: { user: true, agents: true },
```

The `user: true` include returns the **full user object including password hash** in the API response. Password hashes should never be exposed.

---

### LOW-05: Gemini API Key in URL Query Parameter
**File**: [chat/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/chat/route.ts#L52)

```typescript
const geminiUrl = `...?key=${apiKey}`;
```

API keys in URL query parameters get logged in server access logs, CDN logs, and browser history. Should be sent as a header instead.

---

### LOW-06: No `path` Set on Auth Cookies in `setAuthCookies`
**File**: [auth.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/lib/auth.ts#L47-L59)

The `setAuthCookies` function doesn't set `path: '/'`, while the middleware token refresh **does**. This inconsistency can cause cookie scope issues.

---

### LOW-07: No Pagination on Multiple List Endpoints
**Files**: [payments/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/payments/route.ts), [invoices/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/invoices/route.ts), [admin/agencies/route.ts](file:///c:/Users/Abdullah/Downloads/fzee-travels-and-tours/app/api/admin/agencies/route.ts)

Several list endpoints fetch ALL records without pagination limits, which can cause performance degradation and memory exhaustion under load.

---

## ℹ️ INFORMATIONAL FINDINGS (4)

### INFO-01: No Next.js Edge Middleware for Route Protection
There is no `middleware.ts` at the project root. All auth is handled at the API route level, meaning the dashboard and agent UI pages are server-rendered without auth checks at the middleware layer. Users can navigate to dashboard pages even when not logged in (they'll see empty data or errors from failed API calls, but the pages themselves render).

---

### INFO-02: SQLite Database in Production
The database is SQLite (`file:./prisma/dev.db`) with Turso cloud as a cloud option. SQLite does not support `mode: 'insensitive'` for string comparisons (used in groups and hotels routes), which will fail or be ignored.

---

### INFO-03: No Audit Log Usage
Despite having an `AuditLog` model in the schema, no API route creates audit log entries. Admin actions (approvals, rejections, agent modifications) are not tracked.

---

### INFO-04: Turso Auth Token in .env
While `.env` is gitignored, the Turso auth token is a long-lived read-write token. If it's ever committed accidentally, the entire database is compromised. Consider using short-lived tokens with scoped permissions.

---

## Summary Table

| Severity | Count | Category Distribution |
|----------|-------|-----------------------|
| 🔴 CRITICAL | 6 | Auth bypass (5), Secret mgmt (1) |
| 🟠 HIGH | 9 | IDOR (4), Race conditions (2), Business logic (2), Info disclosure (1) |
| 🟡 MEDIUM | 12 | Missing rate limits (2), Weak validation (3), Logic gaps (5), Security config (2) |
| 🟢 LOW | 7 | Info leak (3), Config issues (3), XSS risk (1) |
| ℹ️ INFO | 4 | Architecture gaps |
| **TOTAL** | **38** | |

---

## Priority Remediation Roadmap

### Phase 1 — Immediate (Before Production) 🚨
1. **CRIT-01**: Replace hardcoded JWT secrets with cryptographically random values
2. **CRIT-02 to CRIT-06**: Add `withRole('SUPER_ADMIN', 'ADMIN')` to all unprotected CRUD endpoints (flights, hotels, visa, groups, flight categories)
3. **HIGH-01**: Add `withRole` to admin topup list endpoint
4. **HIGH-04/05**: Add booking ownership verification and amount validation to payments
5. **HIGH-07/08/09**: Add ownership checks to booking detail, export, and CRM delete

### Phase 2 — High Priority (First Sprint)
6. **HIGH-03/06**: Fix race conditions with atomic increment/decrement inside transactions
7. **MED-01/02**: Add rate limiting to auth endpoints
8. **MED-07/08**: Consolidate invoice creation logic into a single service
9. **MED-12**: Re-verify user existence on token refresh
10. **LOW-04**: Exclude password from user includes in API responses

### Phase 3 — Hardening (Ongoing)
11. **MED-03**: Strengthen password policy
12. **MED-09**: Sync agent status on agency approval changes
13. **MED-10/11**: Fix cookie config inconsistencies, consider CSRF tokens
14. **LOW-01**: Remove/change seed account credentials in production
15. **INFO-03**: Implement audit logging for admin actions
