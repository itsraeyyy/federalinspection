# CIDMS Design System & UI Direction Guide

## Project

Commission Information & Document Management System (CIDMS)

Type:
Government Internal Administration Platform

Audience:

* Commissioners
* Branch Office Leaders
* Administrative Staff
* Content Managers
* Document Controllers

The system must feel:

* Professional
* Trustworthy
* Modern
* Premium
* Calm
* Efficient

Avoid:

* Startup aesthetics
* Excessive animations
* Neon colors
* Gaming style interfaces
* Corporate blue overload
* High saturation dashboards

The visual direction should be closer to:

* Linear
* Notion
* Modern government systems
* Internal enterprise software

---

# DESIGN PHILOSOPHY

The interface should disappear behind the work.

Users will spend hours inside the dashboard.

Every design decision should optimize:

* Readability
* Focus
* Long-term comfort
* Information clarity

The UI should feel:

"Quiet but premium"

---

# COLOR SYSTEM

## Core Philosophy

The interface should use neutral surfaces.

Brand colors should only appear as accents.

Brand colors must never dominate the screen.

---

## Primary Brand Colors

Prosperity Party Yellow

```css
#FFB800
```

Prosperity Party Blue

```css
#014BAA
```

---

# LIGHT THEME

Background

```css
#F5F3F0
```

Primary Surface

```css
#FBFAF8
```

Secondary Surface

```css
#F0ECE8
```

Borders

```css
#DED9D3
```

Primary Text

```css
#3D352E
```

Secondary Text

```css
#726A63
```

Muted Text

```css
#9A938B
```

Success

```css
#3F8C5A
```

Warning

```css
#C68A00
```

Danger

```css
#C75050
```

---

# DARK THEME

Background

```css
#1F2426
```

Primary Surface

```css
#252D2F
```

Secondary Surface

```css
#2C3538
```

Borders

```css
#394346
```

Primary Text

```css
#ECE9E5
```

Secondary Text

```css
#B6B0AA
```

Muted Text

```css
#8C8782
```

Success

```css
#5BAA76
```

Warning

```css
#E0AA2C
```

Danger

```css
#DD6A6A
```

---

# BRAND COLOR USAGE

Yellow should be used for:

* Important metrics
* Active highlights
* Selected states
* Success moments
* Dashboard emphasis

Blue should be used for:

* Navigation
* Links
* Icons
* Interactive controls

Do not use full yellow backgrounds.

Use yellow subtly.

Example:

Good:

* Small icon accent
* Active indicator
* Chart highlight

Bad:

* Entire yellow card
* Yellow sidebar
* Yellow page background

---

# TYPOGRAPHY

Font Family

```css
Plus Jakarta Sans
```

Fallback

```css
Inter
```

---

# FONT SCALE

Display

56px

Page Titles

32px

Section Titles

20px

Card Titles

16px

Body Text

14px

Small Text

12px

---

# ICON SYSTEM

Library

Tabler Icons

Rules

* 1.75px stroke
* Consistent size
* No filled icons
* Outline icons only

Sizes

16px

20px

24px

32px

---

# LAYOUT SYSTEM

Maximum Content Width

```css
1600px
```

Spacing Scale

```css
4
8
12
16
24
32
48
64
```

Grid

12 Columns

---

# SIDEBAR

Width

280px

Collapsed

72px

Style

* Minimal
* Vertical
* Icon + Label

Background

Same as surface

Not black

Not blue

---

# NAVIGATION

Active State

Blue left indicator

Example

```css
border-left: 3px solid #014BAA
```

Active background

```css
rgba(1,75,170,0.08)
```

---

# CARD DESIGN

Radius

```css
16px
```

Border

```css
1px solid
```

Shadow

Very subtle

Example

```css
0 2px 12px rgba(0,0,0,0.05)
```

Cards should feel elevated but soft.

---

# DASHBOARD DESIGN

Top Section

Large greeting

Example

Good Morning, Administrator

Current Date

Current Time

Quick Summary

---

# STAT CARDS

Display:

* News Published
* Pending Requests
* Documents
* Members
* Complaints

Layout:

5 Cards Per Row

Each card:

Icon

Value

Label

Trend

---

# TABLE DESIGN

Tables are the most important component.

Requirements:

Sticky Header

Search

Sorting

Filtering

Pagination

Bulk Actions

Export

---

# TABLE COLORS

Do not use striped rows.

Use subtle hover states.

Hover

```css
rgba(1,75,170,0.04)
```

Selected

```css
rgba(1,75,170,0.08)
```

---

# CHARTS

Library

Recharts

Style

Minimal

Clean

No excessive colors

No gradients

No shadows

No 3D

---

# CHART COLORS

Primary

```css
#014BAA
```

Secondary

```css
#FFB800
```

Supporting

```css
#5BAA76
```

Muted

```css
#8C8782
```

---

# NEWS MANAGEMENT UI

Editor Layout

Title

Language Selector

Featured Image

Gallery Images

YouTube Embed

Rich Text Editor

Preview

Publish

Save Draft

---

# FILE MANAGEMENT UI

Visual inspiration:

Google Drive

But simpler.

Layout

Folders Left

Files Right

Search Top

Actions Top Right

Primary Goal

Fast document retrieval.

---

# QR ACCESS MANAGEMENT

Pending requests must be highly visible.

Show:

Requester

Timestamp

Requested Document

Status

Actions

Approve

Deny

---

# PERSONNEL MANAGEMENT

Card View

Photo

Name

Position

Office Type

Edit

Delete

---

# ANIMATION

Keep minimal.

Duration

150ms - 200ms

Allowed

Hover

Dropdown

Modal

Page Transition

Avoid

Complex motion

Bounce effects

Large transitions

---

# ACCESSIBILITY

Minimum contrast ratio

WCAG AA

Keyboard navigation

Required

Visible focus states

Required

Responsive

Desktop First

Tablet Support Required

---

# FINAL DESIGN PRINCIPLE

The system should feel like:

"A modern national institution that values clarity, order, and professionalism."

Not a startup dashboard.
Not a banking app.
Not a marketing website.

A premium government operations platform.
One thing I'd add that will elevate it significantly: use the Prosperity yellow (#FFB800) as a very subtle ambient accent in a few places—small status dots, chart highlights, active filters, notification badges, and occasional soft glow backgrounds (2–4% opacity). Combined with the blue and the neutral palette, it creates a distinctive identity without making the interface feel politically branded or visually noisy.