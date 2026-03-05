# Orbit Meetings Module: Developer Specification

## 1. Module Overview
The Meetings module is a central hub within the ORBIT application designed to streamline professional scheduling, real-time collaboration, and AI-driven post-meeting analysis. It solves the fragmentation between calendar management and actual meeting execution by providing a unified interface for scheduling, attending, and reviewing meetings.

**Key Capabilities:**
*   **Unified Dashboard:** Dual-pane view with upcoming meeting lists and interactive calendars.
*   **Flexible Scheduling:** High-detail modal for creating meetings with project associations.
*   **Interactive Calendars:** Day, Week, and Month views with drag-to-schedule support.
*   **Meeting Room:** Integrated video conferencing with live transcription.
*   **AI Intelligence:** Automated generation of summaries, action items, and insights.

---

## 2. Key Features
Developers must implement the following core components:
*   **Meetings Dashboard:** Main landing page with upcoming list and calendar grid.
*   **Calendar Views:** Support for Day, Week (default), and Month layouts.
*   **Schedule Meeting Modal:** Input form for meeting metadata and attendee invitation.
*   **Meeting Details Page:** Informational hub for specific meeting instances.
*   **Join Meeting Logic:** State-aware buttons (Live/Scheduled/Ended).
*   **Participant Management:** Avatar stacks and role-based metadata.
*   **Role-Based Permissions:** Host-only administrative actions.
*   **Advanced Filtering:** Multi-criteria filtering for status, ownership, and type.
*   **Meeting Room Interface:** Video grid, media controls, and live sidebar.
*   **AI Insights Engine:** Post-meeting summary and action item rendering.

---

## 3. User Roles & Permissions
| Feature | Host | Participant |
| :--- | :---: | :---: |
| Schedule Meeting | ✅ | ❌ |
| Edit Meeting Details | ✅ | ❌ |
| Delete Meeting | ✅ | ❌ |
| Join Live Meeting | ✅ | ✅ |
| Access AI Insights | ✅ | ✅ |
| View Meeting Notes | ✅ | ✅ |
| Invite New Attendees | ✅ | ❌ |

> [!IMPORTANT]
> Administrative buttons (Edit/Delete) MUST be hidden from the UI for participants to prevent unauthorized modifications.

---

## 4. User Stories
*   **As a user**, I want to view my upcoming meetings in a calendar so I can manage my professional schedule effectively.
*   **As a host**, I want to edit meeting details so I can update the time or participants when requirements change.
*   **As a participant**, I want to join a live meeting with a single click so I can attend discussions without searching for links.
*   **As a user**, I want to filter meetings by "Client" or "Internal" types so I can quickly find relevant sessions.
*   **As a host**, I want AI-generated meeting insights so I can quickly review outcomes without re-watching recordings.

---

## 5. Primary User Flows

### A. Dashboard Navigation
1.  User opens **Meetings** tab.
2.  System renders **Upcoming Meetings** (left) and **Weekly Calendar** (right).
3.  User clicks a meeting card or calendar block.
4.  System navigates to **Meeting Details** view.

### B. Joining a Meeting
1.  User identifies a meeting with `status == "LIVE"`.
2.  User clicks **Join Now** / **Join Meeting**.
3.  System initializes **Meeting Room** overlay.
4.  User interacts via video/audio/chat.
5.  User clicks **Leave Meeting** → System redirects to **Meeting Summary**.

### C. Scheduling Flow
1.  User clicks **Schedule Meeting** (or drags on calendar).
2.  User completes modal fields (Title, Date, Time, Attendees).
3.  User clicks **Schedule**.
4.  System persists data and updates the Dashboard/Calendar views.

---

## 6. Calendar View Specifications

### Day View
*   **Layout:** Hourly horizontal timeline (8:00 AM - 4:00 PM simulation).
*   **Behavior:** Focuses on a single selected date.
*   **Rendering:** Meetings appear as vertical blocks spanning the allocated time slots.

### Week View (Default)
*   **Layout:** 7-day grid (Monday to Sunday).
*   **Indicators:** Includes a "Current Time Line" with a timestamp (e.g., 10:30 AM).
*   **Interactions:** Supports drag-selection to trigger the schedule modal.

### Month View
*   **Layout:** 5-week monthly grid.
*   **Rendering:** Meetings shown as compact text entries within date cells.

---

## 7. Meeting Filters
Filters must update **both** the sidebar list and the calendar grid in real-time.

**Filter Categories:**
*   **Status:** Live, Scheduled, Completed.
*   **Participation:** Meetings I host, Meetings I joined.
*   **Meeting Type:** Internal, Client.
*   **Date Range:** Today, This Week.

---

## 8. Meeting Details Page
*   **Header:** Dynamic breadcrumb, dynamic status badge, and title.
*   **Permissions:** Edit/Delete icons visible **only** to the host.
*   **Smart Action Button:**
    *   `Live` → Blue **Join Meeting** button.
    *   `Scheduled` → Grayed **Starts in 10 minutes** label.
    *   `Completed` → Disabled **Meeting Ended** button.
*   **Content Sections:** AI Insights (Summary/Action Items), Participants list, and Meeting Notes.

---

## 9. Meeting Room Interface
*   **Top Bar:** Meeting name, active timer (MM:SS), and "Leave Meeting" button.
*   **Video Grid:** Responsive layout supporting multiple video placeholders with name labels.
*   **Control Center:**
    *   Mic Toggle (with Mic-Off state).
    *   Camera Toggle (with Video-Off state).
    *   Screen Share, Chat, and Participant list toggles.
*   **Productivity Sidebar:** Live Transcript feed and AI Meeting Notes tabs.

---

## 10. Acceptance Criteria
*   [ ] Dashboard accurately renders `MOCK_MEETINGS` in both list and calendar formats.
*   [ ] Calendar toggle successfully switches between Day, Week, and Month layouts.
*   [ ] "Join Meeting" button is only interactive when `status === 'LIVE'`.
*   [ ] Host-specific buttons are hidden from users where `currentUser.id !== meeting.hostId`.
*   [ ] All filters correctly reduce the visible set of meetings in both list and grid views.
*   [ ] Meeting Room initializes a timer that increments every second.
*   [ ] Summary screen accurately displays AI-generated bullet points and action items.

---

## 11. Non-Functional Requirements
*   **Aesthetics:** Adhere to Orbit Primary (`#005FFF`), Background (`#F8F9FA`), and Card Radius (`12px`).
*   **Performance:** UI updates must feel instantaneous (reactive state management).
*   **Accessibility:** Use Inter font and high-contrast text for critical status badges.
*   **Modularity:** Video room and Summary views should be isolated components.

---

## 12. Future Enhancements
*   **Cloud Recording:** Integrated playback directly in the summary screen.
*   **Global Search:** Search specifically within meeting transcripts.
*   **External Sync:** Two-way integration with Google Calendar and Outlook.
*   **AI Action Automation:** Automatically creating ORBIT tasks from meeting action items.
