# Orbit Meetings Module: Developer Specification (Google Meet Integration)

## 1. Module Overview
The Meetings Module is a central hub within the ORBIT application designed to streamline professional scheduling and calendar management. It provides a unified interface for scheduling, attending, and reviewing meetings.

**Strategic Architecture:**
Orbit **does NOT host its own meeting room**. Instead, it serves as the scheduling and data layer that integrates with **Google Meet**. When a meeting is live, users are redirected to an external Google Meet tab.

**Key Capabilities:**
*   **Scheduling:** Create and manage sessions with automated Google Meet link generation.
*   **Calendar Views:** Interactive Day, Week, and Month grids.
*   **Meeting Repository:** Detailed views for specific meeting instances, participants, and notes.
*   **Redirection Logic:** Deep-linking to Google Meet for live sessions.
*   **AI Intelligence:** Display of post-meeting summaries and action items.

---

## 2. Key Features
Developers must implement the following core components:
*   **Meetings Dashboard:** Side-by-side view of upcoming lists and calendar grids.
*   **Day / Week / Month Views:** Responsive calendar layouts with view-switching.
*   **Schedule Meeting:** Modal form to create meetings and generate Meet links.
*   **Meeting Details Page:** Centralized hub for meeting-specific metadata.
*   **Google Meet Redirection:** "Join" buttons that trigger `window.open` to external Meet URLs.
*   **Participant Management:** Role-based attendee lists with avatar support.
*   **Role-Based Permissions:** Administrative restrictions for Host vs. Participant.
*   **Meeting Filters:** Real-time filtering by status, participation, and type.
*   **AI Meeting Insights:** Interface for viewing summaries and checklists.

---

## 3. User Roles & Permissions

### Host Permissions
The Host (Meeting Organizer) has full administrative control:
*   Schedule, Edit, and Delete meetings.
*   Generate or manually attach Google Meet links.
*   Invite/Remove participants.
*   Access and edit AI insights.
*   Initiate the "Join" link for the session.

### Participant Permissions
Participants have read-only access to meeting metadata:
*   View meeting details and notes.
*   View the participant list.
*   Join live meetings (via external redirect).

> [!IMPORTANT]
> Administrative controls (Edit/Delete) must be strictly hidden from Participants in the UI.

---

## 4. User Stories
*   **As a user**, I want to view my upcoming meetings in a calendar so I can manage my professional schedule.
*   **As a host**, I want to edit meeting details so I can update the time or participants when plans change.
*   **As a participant**, I want to join a live meeting with one click so I can attend discussions via Google Meet.
*   **As a user**, I want to filter meetings so I can quickly identify upcoming client sessions.
*   **As a host**, I want AI-generated meeting insights so I can review outcomes without watching recordings.

---

## 5. Primary User Flows

### A. Meetings Dashboard Flow
1.  User opens **Meetings** tab.
2.  System renders list of upcoming meetings and the default Week calendar.
3.  User selects a meeting → System navigates to **Meeting Details**.

### B. Meeting Join Flow
1.  User identifies a meeting with `status = "Live"`.
2.  User clicks **Join Google Meet**.
3.  System opens the `meetLink` in a **new browser tab**. 
    *Note: No internal video interface is loaded within Orbit.*

### C. Meeting Scheduling Flow
1.  User clicks **Schedule Meeting**.
2.  User completes the form (Title, Date, Time, Participants).
3.  System **generates a unique Google Meet link** (if not provided).
4.  Meeting appears in calendar and upcoming list.

---

## 6. Calendar View Specifications
*   **Day View**: Hourly timeline highlighting time-block availability for a single day.
*   **Week View (Default)**: 7-day grid showing time slots from Monday to Sunday.
*   **Month View**: High-level grid showing meeting entries as compact calendar events.
*   **Toggle Logic**: Users can switch between these views seamlessly via the header controls.

---

## 7. Meeting Filters
Filters must update both the **Upcoming List (Sidebar)** and the **Calendar Grid** dynamically.
*   **Status**: Live, Scheduled, Completed.
*   **Participation**: Meetings I host, Meetings I joined.
*   **Date Range**: Today, This Week, This Month.

---

## 8. Meeting Details Page
This page acts as the source of truth for a session. It must include:
*   **Header**: Title, dynamic breadcrumb, and Status Badge.
*   **Join Button**: Primary action button that redirects to Google Meet.
*   **Meeting Access Card**: Displays the raw Google Meet Link with a "Copy Link" utility.
*   **Content**: Participant list, Meeting Notes, and AI Insights (Summary/Action Items).

---

## 9. Meeting Access Implementation
Orbit handles the redirection logic via external links.
*   **Internal Link Storage**: `meeting.meetLink` (e.g., `https://meet.google.com/xxx-xxxx-xxx`).
*   **Join Action**: Triggers `window.open(meeting.meetLink, '_blank')`.
*   **Status Context**:
    *   `Live` → Blue **Join Google Meet** button.
    *   `Scheduled` → Grayed out status label (e.g., "Starts at 10:00 AM").
    *   `Completed` → Disabled **Meeting Ended** button.

---

## 10. Acceptance Criteria
*   [ ] Dashboard renders meetings in both list and grid formats.
*   [ ] Calendar toggle successfully switches between Day, Week, and Month views.
*   [ ] Clicking "Join Google Meet" successfully opens the correct URL in a new tab.
*   [ ] Scheduling a meeting automatically simulates Meet link generation.
*   [ ] Only Host ID matching `currentUser.id` can see Edit/Delete buttons.
*   [ ] Filters correctly reduce the visible set of meetings on both UI sections.
*   [ ] Meeting Details page correctly shows the Meet URL in the "Access" card.

---

## 11. Non-Functional Requirements
*   **Responsive UI**: Optimized for desktop views with fluid grid systems.
*   **Real-time Logic**: Filtering and view switching must be instantaneous.
*   **Security**: Role-based UI masking for administrative actions.
*   **Aesthetics**: Adhere to Orbit's `#005FFF` primary branding and Inter typography.

---

## 12. Future Enhancements
*   **Calendar API Sync**: Two-way sync with Google Calendar or Outlook.
*   **Recording Search**: Integration with meeting recording storage for searchability.
*   **Automatic Tasks**: Creating ORBIT tasks from AI-generated action items.
