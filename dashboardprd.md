# Product Requirements Document (PRD)

# Project Name

Commission Information & Document Management System (CIDMS)

## Purpose

A centralized web platform that enables administrators of the Commission to:

* Publish and manage multilingual news content.
* Manage and distribute official documents.
* Control access to restricted files through QR-based approval workflows.
* Manage staff and leadership directory information.
* Receive and manage citizen submissions (ጥቆማ እና አቤቱታ).
* Monitor system activity from a centralized dashboard.

The system consists of:

1. Public Website (Citizen Facing)
2. Internal Administration Dashboard (Staff Facing)

---

# USER ROLES

## Super Administrator

Full system access.

Permissions:

* Manage users
* Manage roles
* Manage news
* Manage files
* Manage QR access requests
* Manage personnel directory
* View submissions
* View audit logs

---

## Administrator

Can manage content and documents.

Permissions:

* Create/edit news
* Upload documents
* Approve file requests
* Manage personnel records
* Review submissions

---

## Content Editor

Permissions:

* Create news
* Edit news
* Upload media

Cannot:

* Manage users
* Manage permissions

---

# DASHBOARD OVERVIEW

## Landing Dashboard

Greeting Header

Example:

Good Morning, Admin Name

Current Time
Current Date

---

## Quick Statistics Cards

News Articles

* Total Articles
* Draft Articles
* Published Articles

Documents

* Total Files
* Total Storage Used

Personnel

* Total Members
* Main Office Members
* Branch Office Members

Submissions

* New Today
* Pending
* Resolved

QR Access Requests

* Pending Requests
* Approved Today
* Denied Today

---

## Recent Activity Feed

Examples:

* New News Article Published
* File Uploaded
* QR Request Approved
* New Complaint Submitted
* Member Updated

---

# MODULE 1: NEWS MANAGEMENT

Purpose:

Manage multilingual news content shown on the public website.

---

## News List Page

Table Columns

* Title
* Language
* Status
* Author
* Created Date
* Published Date

Actions

* View
* Edit
* Delete
* Publish
* Unpublish

---

## Create News

Fields

Title

Description / Body

Rich Text Editor

Featured Image

Multiple Gallery Images

Embedded YouTube Video

News Category

Language

Options:

* Amharic
* English
* Afaan Oromo
* Somali
* Tigrinya
* Afar

Status

* Draft
* Published

---

## Media Support

Images

Videos

YouTube Embed

PDF Attachments

---

# MODULE 2: FILE MANAGEMENT SYSTEM

Purpose:

Internal document repository similar to Google Drive.

---

## Main Categories

### ኮሚሽን ዋና ጽ/ቤት

Folder Code:
ADMIN_DEFINED

---

### የኮሚሽን ቅርንጫፍ ጽ/ቤቶች

Folder Code:
14

---

## Folder Structure

Category

→ Folder Code

→ Documents

Example

Main Office

→ HR

→ Policies.pdf

→ Reports.pdf

Branch Office

→ Code 14

→ Budget.xlsx

→ Annual Report.pdf

---

## File Metadata

Document Title

Description

Folder Code

File Type

Upload Date

Uploaded By

Version Number

Visibility Status

---

## Features

Upload File

Download File

Preview File

Rename File

Move File

Delete File

Version History

Search Files

Filter Files

---

## Search Filters

Folder

Date

Uploader

File Type

Keyword

---

# MODULE 3: QR ACCESS MANAGEMENT

Purpose

Provide secure external access to protected files.

---

## QR Generation

Admin selects:

File

Folder

Expiration Date

Access Duration

System generates:

* QR Code
* Secure Link

---

## Request Workflow

User scans QR

System records:

* Timestamp
* Device Information
* Request ID

Status becomes:

Pending Approval

---

## Admin Notification

Notification appears instantly.

Example:

File Access Request

Requester:
Unknown User

Requested:
Policy Document.pdf

Date:
2026-06-13

Time:
10:30 AM

---

## Admin Actions

Approve

Deny

Approve for:

* 1 Hour
* 1 Day
* 7 Days
* Custom Duration

---

## Audit Log

Store:

Request Time

Approval Time

Approver

IP Address

Device Information

Status

---

# MODULE 4: COMPLAINTS & SUGGESTIONS

(ጥቆማ እና አቤቱታ)

Purpose

Receive citizen submissions from public website.

---

## Submission Fields

Full Name

Phone Number

Email (Optional)

Submission Type

* Suggestion
* Complaint

Subject

Message

Attachments

---

## Admin View

Table

Columns:

Name

Type

Subject

Date

Status

---

## Status

New

Under Review

Resolved

Rejected

---

## Actions

View

Assign

Reply

Archive

Export

---

# MODULE 5: PERSONNEL MANAGEMENT

Purpose

Manage leadership and staff directory shown on public website.

---

## Categories

### ኮሚሽን ጽ/ቤት

### ኮሚሽን ቅርንጫፍ ጽ/ቤት

---

# Personnel Record

Photo

Full Name

Position

Description

Office Category

Department

Email

Phone

Display Order

Status

---

## Office Hierarchy

### ኮሚሽን ጽ/ቤት

* ዋና ኮሚሽነር
* ምክትል ኮሚሽነር
* ጸሃፊና ጽህፈት ቤት ሃላፊ
* ኮሚሽን ኮሚቴ አባላት
* ስራ አመራር ኮሚቴ አባላት
* ኮሚሽን ማኔጅመንት አባላት

---

### ኮሚሽን ቅርንጫፍ ጽ/ቤት

* ዋና ኮሚሽነር
* ምክትል ኮሚሽነር
* ጸሃፊና ጽህፈት ቤት ሃላፊ
* ኮሚሽን ኮሚቴ አባላት
* ስራ አመራር ኮሚቴ አባላት
* ኮሚሽን ማኔጅመንት አባላት

---

## Actions

Create Member

Edit Member

Delete Member

Upload Photo

Change Position

Change Order

Deactivate Member

---

# NOTIFICATION CENTER

Types

* New Complaint
* New Suggestion
* QR Access Request
* File Uploaded
* News Published

Notification States

Unread

Read

Archived

---

# AUDIT LOGS

Track every action.

Store:

User

Action

Resource

Date

Time

IP Address

Old Value

New Value

Examples:

* News Deleted
* File Uploaded
* Member Updated
* QR Access Approved

---

# NON-FUNCTIONAL REQUIREMENTS

Framework:
Next.js

Backend:
Supabase

Authentication:
Role Based Access Control (RBAC)

Storage:
Supabase Storage

Database:
PostgreSQL

Languages:
Amharic
English
Afaan Oromo
Somali
Tigrinya
Afar

Responsive:
Desktop First
Tablet Support

Security:
JWT Authentication
Row Level Security
Audit Logging
Permission Controls

Performance:
Page Load < 2 Seconds
Search < 500ms
File Upload Progress Tracking
A recommendation before development: add a User & Role Management module from day one. Government systems inevitably expand, and within a few months you'll likely need roles such as Commissioner, Branch Manager, Document Officer, Content Editor, and Auditor. Building RBAC (Role-Based Access Control) now will prevent a painful redesign later.

For the sidebar navigation, I'd structure it as:

Dashboard

Content
├── News
├── Media Library

Documents
├── File Management
├── QR Access Requests

Personnel
├── Members
├── Organization Structure

Public Submissions
├── Complaints & Suggestions

Administration
├── Users
├── Roles & Permissions
├── Notifications
├── Audit Logs

Settings

This structure will remain clean even when the system grows to 20–30 modules.