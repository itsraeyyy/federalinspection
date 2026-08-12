# ICODS — System Credentials & Test Accounts Guide

This document contains all pre-configured credentials and test accounts across all portals (Complaint Management, Admin Dashboard, Institution Representative, and Assessment Portal).

---

## 📩 1. Complaints & Suggestions Management (የጥቆማ እና አቤቱታ ስርዓት)

- **Login URL:** `/complaint/login` (or `/auth/login`)
- **Portal Purpose:** Allows Committee Leaders and Complaints Officers to review submitted complaints & suggestions, assign handlers, change ticket statuses, attach decision files, and track SLAs.

| Email | Password | Phone | Role | Module Access | Status |
|---|---|---|---|---|---|
| `leader@commission.gov` | `Password123!` | `0911223344` | Committee Leader (ኮሚቴ ሰብሳቢ) | Complaints, Abetuta, Tikoma | ✅ Active |
| `leader2@commission.gov` | `Password123!` | `0911223345` | Committee Leader (ኮሚቴ ሰብሳቢ 2) | Complaints, Abetuta, Tikoma | ✅ Active |

### 🧪 How to Test Complaints Management:
1. Go to `/complaint/login` (or click "ለኮሚቴ አባላት / Committee Login").
2. Enter email: `leader@commission.gov` and password: `Password123!`.
3. You will be redirected to `/complaint/dashboard`.
4. From here you can view all incoming complaints/suggestions, filter by region/status, update progress, upload resolution details, and respond to submitters.

---

## ⚙️ 2. Admin Dashboard Credentials (የአስተዳዳሪ መግቢያ)

- **Login URL:** `/auth/login`
- **Portal Purpose:** Full administrative oversight, user management, system audit logs, and module configurations.

| Email | Password | Phone | System Role | Access Level |
|---|---|---|---|---|
| `superadmin@commission.gov` | `SuperAdmin#123` | `0911000001` | Super Admin | Full System Operations |
| `mainadmin@commission.gov` | `Password123!` | `0911223355` | Super Admin | Full System Operations |
| `admin@commission.gov` | `Admin@123` | `000000000` | Admin | Administrative Operations |

---

## 🏛️ 3. Institution Representative Accounts (የተቋም ተወካዮች)

- **Login URL:** `/representative/login`
- **Portal Purpose:** Regional & institutional representatives reporting data and managing local submissions.

| Phone / Username | Password | Full Name | Region | System Role |
|---|---|---|---|---|
| `0911000001` (or `+251911000001`) | `Password123!` | Sample Representative | አዲስ አበባ (Addis Ababa) | Representative |

---

## 📊 4. Assessment Portal Credentials (ምዘና ፖርታል)

- **Login URL:** `/assessment/login`
- **Default Password:** `Password123!`

### A. Tegemgami Accounts (ተመዛኞች / Regular Members — 10% Self Assessment)

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0911000101` | `Password123!` | አበበ ከበደ | ✅ Pre-filled & Completed |
| `0911000102` | `Password123!` | ቻላ በቀለ | ✅ Pre-filled & Completed |
| `0911000103` | `Password123!` | ሰለሞን ተስፋዬ | ✅ Pre-filled & Completed |
| `0911000104` | `Password123!` | መሳይ ሀይሉ | ✅ Pre-filled & Completed |
| `0911000105` | `Password123!` | **ትግስት አለሙ** | 📝 **PENDING (Fill Manually for Testing)** |

### B. Gemgami Accounts (ገምጋሚዎች / Team Evaluators — 20% Peer Evaluation)

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0922000201` | `Password123!` | ዳዊት ገብሬ | ✅ Pre-filled & Completed |
| `0922000202` | `Password123!` | ማርታ ታደሰ | ✅ Pre-filled & Completed |
| `0922000203` | `Password123!` | **ዮናስ ታሪኩ** | 📝 **PENDING (Fill Manually for Testing)** |

### C. Atsedaki Accounts (አጽዳቂዎች / Committee Leaders — 70% Approver Score & Finalization)

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0933000301` | `Password123!` | **ተክሌ ወልደጻድቅ** | 📝 **PENDING (Review & Finalize Manually)** |

---

## 📌 Summary Quick Reference Table

| Portal | Login Route | Primary Test Email / Phone | Password |
|---|---|---|---|
| **Complaints Portal** | `/complaint/login` | `leader@commission.gov` | `Password123!` |
| **Admin Dashboard** | `/auth/login` | `superadmin@commission.gov` | `SuperAdmin#123` |
| **Representative Portal** | `/representative/login` | `0911000001` | `Password123!` |
| **Assessment Portal** | `/assessment/login` | `0911000105` | `Password123!` |
