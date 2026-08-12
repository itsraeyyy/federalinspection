# ICODS — Complaints Portal Testing & Credentials Guide (የጥቆማ እና አቤቱታ መግቢያ)

This document details the test accounts and passwords specifically for the **Complaints & Suggestions Management System (የጥቆማ እና አቤቱታ ፖርታል)**.

---

## 🔑 Login URL & Passwords

- **Complaints Committee Login URL:** `/complaint/login` (or `/auth/login`)
- **Committee Leader Dashboard:** `/complaint/dashboard`
- **Public Complaint Submission:** `/complaint` or `/abetuta` or `/tikoma`

---

## 1. Committee Leader Accounts (የኮሚቴ ሰብሳቢዎች)

These accounts give access to the Complaints Committee Dashboard to review incoming complaints, process tickets, update statuses, assign handlers, and publish resolution decisions.

| Email | Phone Number | Password | Role | Access Level | Status |
|---|---|---|---|---|---|
| `leader@commission.gov` | `0911223344` | `Password123!` | Committee Leader (ኮሚቴ ሰብሳቢ) | Complaints, Abetuta, Tikoma | ✅ Active & Verified |
| `leader2@commission.gov` | `0911223345` | `Password123!` | Committee Leader (ኮሚቴ ሰብሳቢ 2) | Complaints, Abetuta, Tikoma | ✅ Active & Verified |

---

## 2. Admin Oversight Accounts (አስተዳዳሪዎች)

Super Admins also have full access to Complaints Management and can view/manage complaints directly from `/dashboard` or `/complaint/dashboard`.

| Email | Phone Number | Password | System Role | Access Level |
|---|---|---|---|---|
| `superadmin@commission.gov` | `0911000001` | `SuperAdmin#123` | Super Admin | Full System Access |
| `mainadmin@commission.gov` | `0911223355` | `Password123!` | Super Admin | Full System Access |
| `admin@commission.gov` | `000000000` | `Admin@123` | Admin | Administrative Access |

---

## 🧪 Step-by-Step Complaint Testing Flow

### 1. Submit a Public Complaint or Tip-off
- Open `/complaint` or `/tikoma` or `/abetuta` on the public website.
- Fill out the form (Select Region, Urgency, Category, Subject, Description, Attachment optional).
- Submit the complaint and copy the generated **Tracking Code** (e.g. `CMP-2026-XXXX`).

### 2. Log in as Committee Leader
- Go to `/complaint/login`.
- Login with:
  - **Email:** `leader@commission.gov`
  - **Password:** `Password123!`
- You will be redirected to `/complaint/dashboard`.

### 3. Process & Resolve Complaint
- Find the newly submitted complaint in the list.
- Click on the complaint to view details.
- Change status (e.g., `Processing` -> `Resolved` or `Pending Approval`).
- Attach decision/resolution details or documents.
- Save changes.

### 4. Track Complaint as Citizen
- Return to public page `/track` or `/complaint`.
- Enter the Tracking Code to verify the updated status and response!
