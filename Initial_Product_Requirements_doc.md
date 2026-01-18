# Product Requirements Document (PRD)

## Product Name (Working)

Side Hustle Input Tracker

## Version

v1 (Foundational MVP)

## Objective

Create a simple, offline-first iPhone app that helps users **track daily inputs toward making money on the internet**. The app emphasizes **gentle pressure and accountability**, not judgment or outcome-based metrics.

The core belief of v1:

> *Consistency of inputs precedes financial outcomes.*

---

## Target User

* Individual builders / side-hustlers
* Motivated by self-accountability and streaks
* Wants clarity on how time and behaviors are allocated
* Prefers low-friction logging over complex automation

---

## Platform & Technical Constraints

* **Platform**: iOS (iPhone only)
* **Data Storage**: Local-only (on-device)
* **Authentication**: None (no accounts)
* **Offline**: Fully functional offline
* **Sync / Export**: Explicitly out of scope for v1

---

## Core Philosophy

* Track **inputs**, not revenue
* Minimize cognitive overhead
* Encourage honesty through neutrality + gentle pressure
* Avoid gamification excess; use restraint

---

## Tracked Metrics

### Positive Inputs

| Metric               | Type | Notes                              |
| -------------------- | ---- | ---------------------------------- |
| Hours of Building    | Time | Manual entry, 15-min increments    |
| Hours of Marketing   | Time | Manual entry, 15-min increments    |
| Hours of Leveling Up | Time | Learning, studying, skill-building |
| Minutes of Workout   | Time | Health-supporting behavior         |

### Negative Inputs

| Metric           | Type  | Notes                                        |
| ---------------- | ----- | -------------------------------------------- |
| Number of Drinks | Count | Supports 0, 0.5, 1, 1.5, etc.                |
| Hours of TV      | Time  | Same entry mechanic as positive time metrics |

**Behavioral Rule**:

* If a negative metric is not entered, it is implicitly treated as **0**

---

## Metric Definitions (In-App Tooltips)

Brief definitions are shown inline or via info icons.

* **Building**: Creating products, writing code, designing, shipping.
* **Marketing**: Distribution, writing, posting, outreach, audience growth.
* **Leveling Up**: Learning, reading, courses, tutorials, skill improvement.
* **Workout**: Any intentional physical exercise.
* **TV**: Passive screen consumption not related to learning or building.

---

## Daily Check-In

### Burnout → Motivation Scale

* Required daily
* Single-axis slider
* Labeled ends only:

  * Left: **Burned Out**
  * Right: **Motivated**

### Daily Reflection (Required)

* Free-text
* Short-form (1–3 sentences encouraged)
* Prompt example:

  > "How did today feel, and why?"

---

## Goals (v1)

* User can set **weekly goals** for:

  * Building hours
  * Marketing hours
  * Leveling up hours
  * Workouts
  * Optional caps for negatives (TV, drinks)

* Goals are:

  * Simple numeric targets
  * Weekly cadence
  * No complex logic or AI

---

## App Navigation

### Bottom Tab Bar

1. **Log**
2. **Progress**
3. **Profile**

---

## Log Tab (Primary Action Surface)

Purpose: Fast, low-friction daily entry

Features:

* Today’s date fixed at top
* Manual entry controls for all metrics
* 15-minute increment steppers for time-based metrics
* Numeric stepper for drinks (0.5 increments)
* Burnout/Motivation slider
* Daily reflection text input
* Visual separation of Positive vs Negative inputs

---

## Progress Tab

### Sub-Tabs (Top Navigation)

#### 1. Week

* Weekly totals per metric
* Comparison vs weekly goals
* Visual contrast:

  * Positive inputs emphasized
  * Negative inputs subdued but visible

#### 2. Calendar

* Vertically scrollable calendar
* Per-day visualization for each metric
* Designed for pattern recognition
* No editing here (view-only)

#### 3. Stats

* Annual totals (YTD)
* Weekly averages
* High-level trends

---

## Streaks & Accountability

* Daily logging streak (any entry counts)
* Separate streak indicator for:

  * Building activity
* Streaks reset only if **entire day is skipped**

Tone:

* Neutral
* No shame language
* No celebratory animations beyond subtle reinforcement

---

## Profile Tab

* Edit weekly goals
* View current streaks
* App philosophy (short)
* Data disclaimer (local-only storage)

---

## Non-Goals (Explicitly Out of Scope for v1)

* Revenue tracking
* AI insights
* Social / sharing features
* Cloud sync
* Notifications / reminders
* Export

---

## Success Criteria (v1)

* User logs data daily with minimal friction
* User can clearly answer:

  > "Am I putting in the work consistently?"
* App usage persists beyond novelty phase

---

## Future Considerations (Not Implemented)

* Export (CSV)
* iCloud sync
* Custom metrics
* Historical goal changes
* Lightweight insights

---

## Guiding Principle

> *This app exists to make effort visible.*
