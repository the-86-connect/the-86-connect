# Car Shipping Tracking Feature — Implementation Plan

## Overview
Add a custom car/truck sea shipment tracking feature that:
- Admin can add shipments (car model, customer name, email, etc.)
- Auto-generated reference ID (e.g., `CAR-123456`)
- Users track shipments via reference ID + email
- Uses same tracking UI pattern as Study/Sourcing
- **Does NOT break existing systems** (Study in China, Product Sourcing)

---

## Architecture Decision: Reuse Existing Submission Model

**Approach: Extend the existing `Submission` model with a new `submissionType: "car_shipping"`**

Why not create a separate model?
- ✅ Reuses all existing tracking infrastructure (reference code generation, status history, admin CRUD, notifications)
- ✅ No new database tables or migrations for core tracking
- ✅ Admin panel already supports filtering by submission type
- ✅ Tracking API already handles different submission types
- ✅ Email notification system already works
- ❌ Need to add car-specific fields (model, VIN, etc.) — solved via structured JSON in `message` field + dedicated columns

**Hybrid approach:**
- Use existing `Submission` table for core tracking (id, referenceCode, status, statusHistory, name, email, userId, read)
- Add new `CarShipment` model with car-specific fields linked via `submissionId`
- This keeps existing systems untouched while adding car-specific data cleanly

---

## 1. Database Schema Changes

### New Model: `CarShipment`
```prisma
model CarShipment {
  id             String     @id @default(uuid())
  submissionId   String     @unique @map("submission_id")
  submission     Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  carModel       String     @map("car_model")
  carYear        String?    @map("car_year")
  vinNumber      String?    @map("vin_number")
  originPort     String?    @map("origin_port")
  destinationPort String?   @map("destination_port")
  containerNumber String?   @map("container_number")
  vesselName     String?    @map("vessel_name")
  estimatedDeparture DateTime? @map("estimated_departure")
  estimatedArrival DateTime?  @map("estimated_arrival")
  actualDeparture DateTime?   @map("actual_departure")
  actualArrival DateTime?     @map("actual_arrival")
  trackingUrl    String?    @map("tracking_url")
  notes          String?
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")

  @@index([submissionId])
  @@map("car_shipments")
}
```

### Update Reference Code Prefix
Add `"CAR"` prefix for car shipping in `reference-code.ts`:
```
"Car Shipping": "CAR",
```

### Existing Models — NO CHANGES
- `Submission` — no schema changes needed (already supports any `submissionType`)
- `SubmissionNote` — works as-is
- `Attachment` — works as-is
- `Notification` — works as-is

---

## 2. Backend Changes

### New File: `backend/src/routes/car-shipping.ts`
New admin API endpoints:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/car-shipments` | List all car shipments with pagination, filters, search | Admin |
| `GET` | `/api/admin/car-shipments/:id` | Get single car shipment details | Admin |
| `POST` | `/api/admin/car-shipments` | Create new car shipment | Admin |
| `PATCH` | `/api/admin/car-shipments/:id` | Update car shipment details | Admin |
| `DELETE` | `/api/admin/car-shipments/:id` | Delete car shipment | Admin |
| `PATCH` | `/api/admin/car-shipments/:id/status` | Update shipment status (same pattern as submissions) | Admin |

### Modified File: `backend/src/routes/tracking.ts`
Add `CAR_SHIPPING_STAGES` constant and detect `car_shipping` submission type:

```
CAR_SHIPPING_STAGES = [
  { key: "pending",    label: "Shipment Pending",   description: "Awaiting shipment arrangement" },
  { key: "booked",     label: "Booking Confirmed",  description: "Shipping space reserved" },
  { key: "loading",    label: "Loading",            description: "Vehicle being loaded onto vessel" },
  { key: "in_transit", label: "In Transit",         description: "Shipment is on the way" },
  { key: "at_port",    label: "At Destination Port",description: "Arrived at destination port" },
  { key: "customs",    label: "Customs Clearance",  description: "Going through customs" },
  { key: "delivered",  label: "Delivered",          description: "Vehicle delivered to customer" },
]
```

Update tracking endpoint to detect `CAR-` prefix or `submissionType: "car_shipping"`.

### Modified File: `backend/src/lib/reference-code.ts`
Add `"Car Shipping": "CAR"` to `SERVICE_PREFIXES`.

### Modified File: `backend/src/index.ts`
Mount new car shipping router:
```ts
app.use("/api/admin/car-shipments", adminAuthMiddleware, carShippingRouter);
```

### Existing Files — NO CHANGES
- `study-application.ts` — untouched
- `sourcing-inquiry.ts` — untouched
- `contact.ts` — untouched
- `admin.ts` — untouched (submissions endpoints keep working)

---

## 3. Frontend Changes

### New Admin Tab: "Car Shipments"
**New file:** `frontend/src/components/admin/car-shipments-tab.tsx`

Features:
- Stats grid (total, in transit, at port, delivered)
- Filter panel (status, search by name/reference/car model)
- Table with shipment list
- Create new shipment button → modal/form
- View shipment details → modal
- Update status dropdown
- Bulk actions (delete, update status)
- CSV export

### Modified File: `frontend/src/app/admin/page.tsx`
Add new tab to `TABS` array:
```ts
{ key: "car-shipments", label: "Car Shipments", icon: Truck },
```

Import and render `CarShipmentsTab` component.

### New Public Tracking Page
**New file:** `frontend/src/app/car-shipping/track/page.tsx`

Uses the same `TrackingForm` component with a new config:
```ts
{
  referencePlaceholder: "CAR-XXXXXX",
  stages: CAR_SHIPPING_STAGES,
  supportEmail: "shipping@the86connects.com",
  noun: "shipment",
  submissionType: "car_shipping" as const,
}
```

### Modified File: `frontend/src/components/tracking/tracking-form.tsx`
Extend `submissionType` to accept `"car_shipping"`:
```ts
submissionType: "study" | "sourcing" | "car_shipping";
```

Minimal change — just add the new type.

### Modified File: `frontend/src/lib/submission-status.ts`
Add `CAR_SHIPPING_STAGES` constant (mirror of backend).

### Existing Files — NO CHANGES
- `study-in-china/track-application/page.tsx` — untouched
- `product-sourcing/track-quote/page.tsx` — untouched
- `submissions-tab.tsx` — untouched
- All existing admin tabs — untouched

---

## 4. Email Notifications

### Existing — Works As-Is
- `notifyAdminNewSubmission()` — already works for any submission type
- `notifyUserStatusChange()` — already works for any submission type

Emails will reference the `CAR-XXXXXX` code automatically.

---

## 5. Data Flow Summary

```
Admin creates shipment
    ↓
Submission created (submissionType: "car_shipping")
    ↓
CarShipment record created (linked via submissionId)
    ↓
Reference code generated (CAR-XXXXXX)
    ↓
Admin email notification sent
    ↓
User tracks via /car-shipping/track?ref=CAR-123456
    ↓
Tracking API returns 7-stage timeline
    ↓
Admin updates status → statusHistory updated → user email sent
```

---

## 6. Zero-Risk Guarantee

**What will NOT change:**
- Study in China application flow — completely untouched
- Product sourcing inquiry flow — completely untouched
- Contact form — completely untouched
- Consultation booking — completely untouched
- User authentication — completely untouched
- Admin login/auth — completely untouched
- Existing submissions tab — completely untouched
- Database migrations for existing tables — no schema changes to `Submission`

**What is isolated:**
- New `CarShipment` table — separate from existing data
- New admin tab — doesn't affect other tabs
- New tracking page — separate route, doesn't interfere with existing tracking
- New API routes — mounted at `/api/admin/car-shipments`, separate from `/api/admin/submissions`

**Rollback plan:**
- If something goes wrong, delete the 3 new files (car-shipments-tab.tsx, car-shipping route, tracking page)
- Revert the 3 small modifications (TABS array, tracking-form type, reference-code prefix)
- Database: drop `car_shipments` table (no data dependency on existing tables)

---

## 7. Implementation Order

1. **Step 1:** Prisma schema — add `CarShipment` model, run migration
2. **Step 2:** Backend — add `CAR` prefix, add car shipping stages to tracking API
3. **Step 3:** Backend — create car shipping admin API routes
4. **Step 4:** Frontend — add `CAR_SHIPPING_STAGES` to `submission-status.ts`
5. **Step 5:** Frontend — extend `TrackingForm` to support `car_shipping` type
6. **Step 6:** Frontend — create public tracking page `/car-shipping/track`
7. **Step 7:** Frontend — create admin `CarShipmentsTab` component
8. **Step 8:** Frontend — add tab to admin page
9. **Step 9:** Build & test

---

## 8. Files Summary

### New Files (8)
| File | Purpose |
|------|---------|
| `backend/prisma/migrations/.../migration.sql` | DB migration for CarShipment table |
| `backend/src/routes/car-shipping.ts` | Admin API for car shipments |
| `frontend/src/components/admin/car-shipments-tab.tsx` | Admin UI tab |
| `frontend/src/app/car-shipping/track/page.tsx` | Public tracking page |
| `frontend/src/components/admin/car-shipment-form.tsx` | Create/edit form modal |
| `frontend/src/components/admin/car-shipment-detail.tsx` | Detail view modal |
| `frontend/src/components/admin/car-shipments-table.tsx` | Data table |
| `frontend/src/components/admin/car-shipment-filters.tsx` | Filter panel |

### Modified Files (5)
| File | Change | Risk |
|------|--------|------|
| `backend/prisma/schema.prisma` | Add CarShipment model | None (new table only) |
| `backend/src/lib/reference-code.ts` | Add "Car Shipping": "CAR" | None (additive only) |
| `backend/src/routes/tracking.ts` | Add CAR_SHIPPING_STAGES + detect car_shipping type | None (additive logic only) |
| `backend/src/index.ts` | Mount car shipping router | None (new route mount) |
| `frontend/src/lib/submission-status.ts` | Add CAR_SHIPPING_STAGES | None (additive only) |
| `frontend/src/components/tracking/tracking-form.tsx` | Add "car_shipping" to type union | None (type extension only) |
| `frontend/src/app/admin/page.tsx` | Add "car-shipments" tab | None (new tab only) |

**Total modified files: 7** — all changes are additive, no existing logic altered.

---

## 9. Time Estimate
~2-3 hours of implementation time.

---

## Questions Before Implementation

1. Are the 7 stages correct? (Pending → Booked → Loading → In Transit → At Port → Customs → Delivered)
2. Should users see car model/VIN in the tracking page, or just status timeline?
3. Should there be an option for admin to send a tracking link email when creating a shipment?
4. Do you want the public tracking page linked from the main navigation? Or just via direct URL?
5. Any additional car fields needed besides: car model, car year, VIN, container number, vessel name, ports?
