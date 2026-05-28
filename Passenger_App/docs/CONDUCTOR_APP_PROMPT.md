# Master Prompt: Replicate the BusConnect Conductor Verification Suite

**Objective:**
Build a high-fidelity Conductor Dashboard for a public bus ticketing system. The app must handle ticket verification, inter-category fare adjustments, and bus pass validation using a non-QR, alphanumeric code system optimized for high-density boarding.

---

### 1. Core Tech Stack
- **Framework**: Next.js 15 (App Router).
- **Database**: MongoDB (Mongoose) for real-time ticket/pass syncing.
- **Styling**: Tailwind CSS + ShadCN UI.
- **Icons**: Lucide-React.
- **Charts**: Recharts (for operational analytics).

---

### 2. Operational Modules

#### Module A: Unified Terminal Dashboard
- **Layout**: Top section features two summary cards: "Verified Today" (Count) and "Cash Collected" (Sum of fare differences).
- **Navigation**: A segmented tab interface with three primary modes: **Verify**, **Fare Adj.**, and **Bus Pass**.
- **State Management**: Use `localStorage` to persist session-based verification stats and sync with the database on action.

#### Module B: Standard Ticket Verification
- **Input**: Ticket Code (Format: `TKT-XX-YYYYY`).
- **Logic**: 
  - Fetch from MongoDB `/api/verify-ticket/[code]`.
  - Handle 4 states: 
    1. **VALID (Green)**: Show route, passenger summary, and a hidden "Security PIN".
    2. **USED (Pink/Slate)**: Show "TICKET USED" with validation timestamp.
    3. **EXPIRED (Yellow)**: Auto-detect if `now > createdAt + 10 mins`.
    4. **CANCELLED (Red)**: Show if status is 'cancelled'.
- **Action**: "Validate Boarding" button. This calls `/api/use-ticket/[code]` to set status to 'used' and generate a **Thermal Receipt**.

#### Module C: Inter-Category Fare Check
- **Inputs**: Ticket Code + Selection of "Actual Boarding Bus Type" (Ordinary, Express, Deluxe).
- **Logic**: Compare `booked fare` vs. `current bus fare` using the distance-based formula: `10 + (stops * 1.5)`.
- **Output**: 
  - If difference > 0: "Collect Rs. X cash" (Upgrade).
  - If difference < 0: "Wallet Credit Applied" (Downgrade).
- **Visual**: Upon validation, show the **Thermal Receipt** with updated fare metadata.

#### Module D: Live Bus Pass Verifier
- **Input**: Alphanumeric Pass Code.
- **Logic**: Fetch from MongoDB `test.bus_passes` collection.
- **UI**: The "Wide Pink ID". Display:
  - Large Bold Holder Name.
  - Category Badges (Student/Citizen).
  - Expiry Date (Red if past current date).
  - Valid Route (From -> To) and Allowed Bus Types.
  - Ghost "Photo Box" placeholder.

---

### 3. UI/UX & High-Fidelity Components

#### The "Pink Thermal Receipt" Component
- **Style**: Xerox-style dashed borders, mono-spaced font.
- **Details**: TSRTC watermark, Depot name, Trip No, Waybill No, and detailed fare breakdown (e.g., `MEN: 1 x 15.00`).
- **Color**: Uses `#E11D48` (Pink) accents to indicate a successful "Used" transaction.

#### Visual Language
- **Glassmorphism**: Use cards with `bg-white/80 backdrop-blur-md`.
- **Typography**: PT Sans for body; Monospace for ticket codes.
- **Branding**: The TGSRTC logo should always act as a "Back to Home" trigger.

---

### 4. Backend & API Requirements
- **Endpoint 1**: `GET /api/verify-ticket/[code]` -> Returns full ticket object.
- **Endpoint 2**: `POST /api/use-ticket/[code]` -> Updates status to 'used', sets `validatedAt`, and updates fare/busType if changed.
- **Database Schema**: Ensure the `Ticket` schema includes: `from`, `to`, `quantities`, `fare`, `totalFare`, `status`, `busType`, and `securityCode`.

---

### 5. Final Instructions for Gemini
- "Generate the `ValidatedTicket` component as a separate functional UI."
- "Ensure all mutation calls (`POST`) update both the database and the local conductor session stats."
- "Implement a global `suppressHydrationWarning` on the layout."
