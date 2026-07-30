# ICODS — Test Assessment Users & Admin Credentials

This document provides a complete list of pre-configured test accounts for the Assessment Portal (ምዘና ፖርታል) and Admin Dashboard.

---

## 1. Assessment Portal Test Users (የምዘና ፖርታል ተጠቃሚዎች)

**Login URL:** `/assessment/login`  
**Default Password for Mzena Test Suite:** `Password123!`

### 👥 Regular Members (ተመዛኞች / Tegemgami)
| Phone Number | Password | Full Name | Role | Status / Notes |
|---|---|---|---|---|
| `0911000101` | `Password123!` | አበበ ከበደ | Regular | Self-Assessment Submitted (Score 4) |
| `0911000102` | `Password123!` | ቻላ በቀለ | Regular | Self-Assessment Submitted (Score 5) |
| `0911000103` | `Password123!` | ሰለሞን ተስፋዬ | Regular | Self-Assessment Submitted (Score 4) |
| `0911000104` | `Password123!` | መሳይ ሀይሉ | Regular | Self-Assessment Submitted (Score 5) |
| `0911000105` | `Password123!` | ትግስት አለሙ | Regular | **Unsubmitted** (Ready for manual testing) |

---

### 🔍 Evaluators (ገምጋሚዎች / Team Evaluators)
| Phone Number | Password | Full Name | Role | Status / Notes |
|---|---|---|---|---|
| `0922000201` | `Password123!` | ዳዊት ገብሬ | Evaluator | Self & Team Evals Submitted |
| `0922000202` | `Password123!` | ማርታ ታደሰ | Evaluator | Self & Team Evals Submitted |
| `0922000203` | `Password123!` | ዮናስ ታሪኩ | Evaluator | **Team Evals Unsubmitted** (Ready for testing) |

---

### 👑 Approvers & Committee Leaders (አጽዳቂዎች)
| Phone Number | Password | Full Name | Role | Status / Notes |
|---|---|---|---|---|
| `0933000301` | `Password123!` | ተክሌ ወልደጻድቅ | Approver | Pre-filled 70% scores (Ready for final approval testing) |

---

### 🧪 Basic E2E Test Accounts
| Phone Number | Password | Role |
|---|---|---|
| `0911000001` | `Password123` | Regular Member |
| `0911000002` | `Password123` | Evaluator |
| `0911000003` | `Password123` | Approver |

---

## 2. Admin Dashboard Credentials (የአስተዳዳሪ መግቢያ)

**Login URL:** `/auth/login`

| Email (Username) | Password | Role | Permissions |
|---|---|---|---|
| `superadmin@commission.gov` | `SuperAdmin#123` | Super Admin | Full System Access |
| `admin@commission.gov` | `Admin@123` | Admin | System Operations Access |

---

## 💡 Quick Tips for Testing
1. **To test Self-Assessment submission**: Log in with `0911000105` (`Password123!`).
2. **To test Team Evaluation submission**: Log in with `0922000203` (`Password123!`).
3. **To test Approver Approval & Finalizing Scores**: Log in with `0933000301` (`Password123!`).
4. **To view & download PDF reports**: Log in with any finalized/completed user (e.g., `0911000101`).
