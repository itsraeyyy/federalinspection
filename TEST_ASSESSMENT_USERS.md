# ICODS — Testing Assessment Credentials & Setup Guide

This document contains all pre-configured test accounts for the Assessment Portal (ምዘና ፖርታል) and Admin Dashboard.

> **Test Configuration Rule:**
> - All users except **1 person per role** have their evaluations pre-filled and completed.
> - Exactly **1 person per role** is left pending so you can manually log in and fill out the assessment yourself.

---

## 🔑 Login URLs & Passwords

- **Assessment Portal Login:** `/assessment/login`  
- **Default Password for Assessment Accounts:** `Password123!`
- **Admin Dashboard Login:** `/auth/login`

---

## 1. Tegemgami Test Accounts (ተመዛኞች / Regular Members)
*Evaluates Self-Assessment (10% ቅፅ-1)*

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0911000101` | `Password123!` | አበበ ከበደ | ✅ Pre-filled & Completed |
| `0911000102` | `Password123!` | ቻላ በቀለ | ✅ Pre-filled & Completed |
| `0911000103` | `Password123!` | ሰለሞን ተስፋዬ | ✅ Pre-filled & Completed |
| `0911000104` | `Password123!` | መሳይ ሀይሉ | ✅ Pre-filled & Completed |
| `0911000105` | `Password123!` | **ትግስት አለሙ** | 📝 **PENDING (Fill Manually for Testing)** |

---

## 2. Gemgami Test Accounts (ገምጋሚዎች / Team Evaluators)
*Evaluates Team Members (20% ቅፅ-2)*

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0922000201` | `Password123!` | ዳዊት ገብሬ | ✅ Pre-filled & Completed |
| `0922000202` | `Password123!` | ማርታ ታደሰ | ✅ Pre-filled & Completed |
| `0922000203` | `Password123!` | **ዮናስ ታሪኩ** | 📝 **PENDING (Fill Manually for Testing)** |

---

## 3. Atsedaki Test Accounts (አጽዳቂዎች / Approvers & Committee Leaders)
*Evaluates & Finalizes Scores (70% ቅፅ-3)*

| Phone Number | Password | Full Name | Status / Action |
|---|---|---|---|
| `0933000301` | `Password123!` | **ተክሌ ወልደጻድቅ** | 📝 **PENDING (Review & Finalize Manually)** |

---

## 4. Admin Dashboard Credentials (የአስተዳዳሪ መግቢያ)
*URL: `/auth/login`*

| Email | Password | System Role | Access Level |
|---|---|---|---|
| `superadmin@commission.gov` | `SuperAdmin#123` | Super Admin | Full System Operations |
| `admin@commission.gov` | `Admin@123` | Admin | Administrative Operations |

---

## 🧪 Manual Testing Instructions

1. **Test Tegemgami (Self Assessment 10%)**:
   - Log in with `0911000105` / `Password123!`.
   - Go to **Addis Mzena (አዲስ ምዘና)** tab to fill out all 33 self-assessment questions and submit.

2. **Test Gemgami (Peer Evaluation 20%)**:
   - Log in with `0922000203` / `Password123!`.
   - Go to **Evaluate Team (የስራ ባልደረቦች ምዘና)** tab to evaluate your team members and submit.

3. **Test Atsedaki (Approver Score 70% & Finalization)**:
   - Log in with `0933000301` / `Password123!`.
   - Go to **Approve Scores (ውጤት ማጽደቂያ)** tab to review, edit 70-point scores, approve, and finalize assessment periods.

4. **Test Download Reports & History**:
   - Log in with `0911000101` / `Password123!`.
   - Go to **Yalefu Mzenawoch (ያለፉ ምዘናዎች)** tab to view detailed report tables and download PDFs.
