import './style.css'

// --- Auth State ---
const currentUser = {
  id: 1,
  name: 'Elena Rodriguez',
  img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
};

// --- Filter State ---
let filters = {
  status: 'All',
  host: 'All',
  type: 'All',
  range: 'All'
};

// --- Mock Data ---
const MOCK_MEETINGS = [
  {
    id: 1,
    title: 'Product Strategy Sync',
    hostId: 1, // Elena Rodriguez
    time: '10:00 AM – 11:30 AM',
    startTime: '10:00',
    endTime: '11:30',
    day: 1, // Tuesday (relative to current week reference)
    date: 'Oct 24, 2023',
    status: 'LIVE',
    type: 'Internal',
    organizer: 'Elena Rodriguez',
    project: 'Orbit v2.0',
    participants: [
      { name: 'Elena Rodriguez', role: 'Organizer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
      { name: 'Marcus Thorne', role: 'Engineering', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { name: 'David Chen', role: 'Product Design', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    ],
    notes: [
      'Review feedback from Beta users on the new dashboard.',
      'Resource allocation for the security patch rollout.',
      'Marketing sync for the November launch event.',
    ],
    insights: {
      summary: 'The team reached a consensus on prioritizing the "Enterprise SSO" feature over the "Dark Mode" enhancements for Q4. Sarah raised concerns regarding the API documentation timeline, which was noted for the follow-up sync.',
      actionItems: [
        { text: 'Finalize SSO specs', completed: true },
        { text: 'Update API documentation', completed: true },
        { text: 'Client feedback deck', completed: false },
      ]
    },
    meetLink: 'https://meet.google.com/prj-strat-align'
  },
  {
    id: 2,
    title: 'Marketing Weekly Review',
    hostId: 2, // Marcus Thorne
    time: '02:00 PM – 03:00 PM',
    startTime: '14:00',
    endTime: '15:00',
    day: 1, // Tuesday
    date: 'Oct 24, 2023',
    status: 'Scheduled',
    type: 'Internal',
    organizer: 'Marcus Thorne',
    participants: [
      { name: 'Marcus Thorne', role: 'Engineering', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
      { name: 'Elena Rodriguez', role: 'Organizer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    ],
    notes: ['Analyze last week performance', 'Plan next launch campaign'],
    insights: { summary: 'Standard review.', actionItems: [] },
    meetLink: 'https://meet.google.com/mkt-weekly'
  },
  {
    id: 3,
    title: 'New Hire Onboarding',
    hostId: 3, // David Chen
    time: '09:00 AM – 10:00 AM',
    startTime: '09:00',
    endTime: '10:00',
    day: 2, // Wednesday
    date: 'Oct 25, 2023',
    status: 'Scheduled',
    type: 'Client',
    organizer: 'David Chen',
    participants: [
      { name: 'David Chen', role: 'Product', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    ],
    notes: ['Welcome kit walk through'],
    insights: { summary: 'Onboarding process.', actionItems: [] },
    meetLink: 'https://meet.google.com/hire-onboard'
  },
  {
    id: 4,
    title: 'Sales Pipeline',
    hostId: 1, // Elena Rodriguez
    time: '11:00 AM – 12:00 PM',
    startTime: '11:00',
    endTime: '12:00',
    day: 3, // Thursday
    date: 'Oct 26, 2023',
    status: 'Scheduled',
    type: 'Client',
    organizer: 'Elena Rodriguez',
    participants: [
      { name: 'Elena Rodriguez', role: 'Organizer', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    ],
    notes: ['Review quarterly pipeline'],
    insights: { summary: 'Sales sync.', actionItems: [] },
    meetLink: 'https://meet.google.com/sales-pipe-sync'
  }
];

// --- Application State ---
let state = {
  currentView: 'dashboard', // 'dashboard' or 'details'
  currentMeetingId: null,
  calendarView: 'week',
  isModalOpen: false,
  isFilterOpen: false,
  dragSelection: null, // { day, startSlot, endSlot }
}

const generateMeetLink = () => {
  return "https://meet.google.com/" + Math.random().toString(36).substring(2, 5) + "-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 5);
};

const calculateDuration = (start, end) => {
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  return (eH * 60 + eM) - (sH * 60 + sM);
};

const getFilteredMeetings = () => {
  return MOCK_MEETINGS.filter(m => {
    const statusMatch = filters.status === 'All' || m.status.toLowerCase() === filters.status.toLowerCase();
    const typeMatch = filters.type === 'All' || m.type.toLowerCase() === filters.type.toLowerCase();
    const hostMatch = filters.host === 'All' ||
      (filters.host === 'Host' ? m.hostId === currentUser.id : m.hostId !== currentUser.id);
    // Range logic simplified for prototype
    const rangeMatch = filters.range === 'All' || true;

    return statusMatch && typeMatch && hostMatch && rangeMatch;
  });
};

// --- DOM Elements ---
const contentArea = document.getElementById('content-area');
const modalOverlay = document.getElementById('modal-overlay');
const hoverPreview = document.getElementById('hover-preview');

// --- Templates ---

const renderDashboard = () => {
  const filteredMeetings = getFilteredMeetings();
  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'LIVE' || m.status === 'Scheduled');

  contentArea.innerHTML = `
    <div class="dashboard-layout">
      <!-- Left Section: Upcoming Meetings -->
      <section class="left-section">
        <header>
          <h2 class="section-title">Meetings</h2>
          <p class="section-subtitle">Manage your professional schedule and recordings</p>
        </header>

        <div class="view-toggle" style="margin-bottom: 24px; width: fit-content;">
           <button class="toggle-btn active">Upcoming</button>
           <button class="toggle-btn">Completed</button>
        </div>

        <div class="upcoming-list">
          <div style="font-size: 10px; font-weight: 700; color: #5A5A5A; margin-bottom: 12px; letter-spacing: 0.5px; text-transform: uppercase;">Today, Nov 12</div>
          ${upcomingMeetings.map(meeting => `
            <div class="meeting-card" data-id="${meeting.id}">
              <span class="status-badge status-${meeting.status.toLowerCase()}">${meeting.status}</span>
              <h3 class="meeting-title">${meeting.title}</h3>
              <div class="meeting-time-row">
                <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                <span>${meeting.time} • ${calculateDuration(meeting.startTime, meeting.endTime)} min</span>
              </div>
              <div class="meeting-card-footer">
                <div class="participants-avatars">
                  <div class="avatar-stack">
                    ${meeting.participants.slice(0, 3).map(p => `<img src="${p.img}" class="mini-avatar" alt="${p.name}" title="${p.name}">`).join('')}
                    ${meeting.participants.length > 3 ? `<span class="more-count" title="${meeting.participants.slice(3).map(p => p.name).join(', ')}">+${meeting.participants.length - 3}</span>` : ''}
                  </div>
                </div>
                ${meeting.status === 'LIVE' ? `<button class="join-now-btn" onclick="event.stopPropagation(); window.open('${meeting.meetLink}', '_blank')">Join Google Meet</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Right Section: Weekly Calendar -->
      <section class="right-section">
        <header class="calendar-header">
          <div class="cal-nav">
            <h3 class="cal-month-title">November 2024</h3>
            <div class="nav-controls">
              <button class="nav-arrow"><i data-lucide="chevron-left"></i></button>
              <button class="today-btn">Today</button>
              <button class="nav-arrow"><i data-lucide="chevron-right"></i></button>
            </div>
          </div>
            <div class="cal-actions" style="display: flex; gap: 16px; position: relative;">
               <button id="filter-toggle-btn" class="btn btn-secondary" style="padding: 6px 16px; display: flex; align-items: center; gap: 8px;">
                 <i data-lucide="sliders-horizontal" style="width: 14px;"></i> Filter
               </button>
               
               <!-- Filter Dropdown -->
               <div id="filter-dropdown" class="filter-dropdown ${state.isFilterOpen ? '' : 'hidden'}">
                 <div class="filter-section">
                   <div class="filter-label">Meeting Status</div>
                   <select class="filter-select" data-filter="status">
                     <option value="All">All Statuses</option>
                     <option value="Live" ${filters.status === 'Live' ? 'selected' : ''}>Live</option>
                     <option value="Scheduled" ${filters.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                     <option value="Completed" ${filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
                   </select>
                 </div>
                 <div class="filter-section">
                   <div class="filter-label">Participants</div>
                   <select class="filter-select" data-filter="host">
                     <option value="All">All Meetings</option>
                     <option value="Host" ${filters.host === 'Host' ? 'selected' : ''}>Meetings I host</option>
                     <option value="Joined" ${filters.host === 'Joined' ? 'selected' : ''}>Meetings I joined</option>
                   </select>
                 </div>
                 <div class="filter-section">
                   <div class="filter-label">Meeting Type</div>
                   <select class="filter-select" data-filter="type">
                     <option value="All">All Types</option>
                     <option value="Internal" ${filters.type === 'Internal' ? 'selected' : ''}>Internal</option>
                     <option value="Client" ${filters.type === 'Client' ? 'selected' : ''}>Client</option>
                   </select>
                 </div>
                 <div class="filter-section">
                   <div class="filter-label">Date Range</div>
                   <select class="filter-select" data-filter="range">
                     <option value="All">All Time</option>
                     <option value="Today">Today</option>
                     <option value="Week">This Week</option>
                   </select>
                 </div>
                 <button id="reset-filters" style="width: 100%; padding: 8px; font-size: 12px; font-weight: 600; color: var(--primary); background: none; border: 1px dashed var(--primary); border-radius: 6px; cursor: pointer; margin-top: 8px;">Reset Filters</button>
               </div>
             <button id="schedule-meeting-btn" class="btn btn-primary" style="padding: 6px 16px; display: flex; align-items: center; gap: 8px;">
               <i data-lucide="plus" style="width: 14px;"></i> Schedule Meeting
             </button>
             <div class="view-toggle">
                <button class="toggle-btn">Day</button>
                <button class="toggle-btn active">Week</button>
                <button class="toggle-btn">Month</button>
             </div>
          </div>
        </header>

        <div class="calendar-grid-container">
           ${state.calendarView === 'month' ? `
             <!-- Month Header -->
             <div class="grid-header">
                ${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => `
                  <div class="day-column-header" style="padding: 8px;">
                    <span class="day-label">${day}</span>
                  </div>
                `).join('')}
             </div>
             <!-- Month Grid -->
             <div class="month-grid">
                ${Array.from({ length: 35 }).map((_, i) => {
    const dayNum = (i + 1) % 31 || 31;
    const dayIdx = i % 7;
    const dayMeetings = MOCK_MEETINGS.filter(m => m.day === dayIdx && i < 7);
    return `
                    <div class="month-day">
                       <span class="month-date-num">${dayNum}</span>
                       ${dayMeetings.map(m => `
                         <div class="month-meeting-entry" data-id="${m.id}">${m.title}</div>
                       `).join('')}
                    </div>
                  `;
  }).join('')}
             </div>
           ` : `
             <!-- Grid Header -->
             <div class="grid-header">
                <div class="time-gutter"></div>
                ${(state.calendarView === 'day' ? ['TUE 12'] : ['MON 11', 'TUE 12', 'WED 13', 'THU 14', 'FRI 15', 'SAT 16', 'SUN 17']).map(day => `
                  <div class="day-column-header">
                    <span class="day-label">${day.split(' ')[0]}</span>
                    <div class="date-label">${day.split(' ')[1]}</div>
                  </div>
                `).join('')}
             </div>

             <!-- Grid Body -->
             <div class="grid-body">
                <div class="time-slots">
                  ${Array.from({ length: 9 }).map((_, i) => `<div class="time-slot">${String(8 + i).padStart(2, '0')}:00</div>`).join('')}
                </div>
                <div class="day-columns">
                  ${state.calendarView === 'day' ? '' : `
                  <!-- Current Time Indicator (Simulated 10:30 AM) -->
                  <div class="current-time-line" style="top: 150px;">
                     <div class="current-time-circle"></div>
                     <span style="position: absolute; left: -50px; top: -10px; font-size: 11px; font-weight: 700; color: var(--primary); background: white; padding: 2px 4px; border-radius: 4px; border: 1px solid var(--primary);">10:30</span>
                  </div>
                  `}
                  
                  ${(state.calendarView === 'day' ? [1] : [0, 1, 2, 3, 4, 5, 6]).map((dayIdx) => `
                    <div class="day-column" data-day="${dayIdx}">
                      ${filteredMeetings.filter(m => m.day === dayIdx).map(m => {
    const start = m.startTime.split(':').map(Number);
    const end = m.endTime.split(':').map(Number);
    const startMinutes = (start[0] - 8) * 60 + start[1];
    const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    return `
                          <div class="calendar-block" 
                               style="top: ${startMinutes}px; height: ${duration}px;" 
                               data-id="${m.id}">
                            <div class="block-title">${m.title}</div>
                            <div class="block-avatars" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                              <div style="display: flex;">
                                ${m.participants.slice(0, 2).map(p => `<img src="${p.img}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid white; margin-right: -4px;">`).join('')}
                              </div>
                              <i data-lucide="video" style="width: 12px; height: 12px; opacity: 0.8;"></i>
                            </div>
                          </div>
                        `;
  }).join('')}
                    </div>
                  `).join('')}

                  <div id="drag-selection" class="drag-selection hidden"></div>
                </div>
             </div>
           `}
        </div>
      </section>
    </div>
  `;

  // --- Attach Event Listeners ---

  // View Toggles
  const toggleBtns = document.querySelectorAll('.cal-actions .view-toggle .toggle-btn');
  toggleBtns.forEach(btn => {
    if (btn.innerText.toLowerCase() === state.calendarView) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      state.calendarView = btn.innerText.toLowerCase();
      state.isFilterOpen = false;
      renderDashboard();
    });
  });

  const filterToggle = document.getElementById('filter-toggle-btn');
  filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    state.isFilterOpen = !state.isFilterOpen;
    renderDashboard();
  });

  const filterSelects = document.querySelectorAll('.filter-select');
  filterSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      filters[select.dataset.filter] = e.target.value;
      renderDashboard();
    });
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    filters = { status: 'All', host: 'All', type: 'All', range: 'All' };
    renderDashboard();
  });

  const cards = document.querySelectorAll('.meeting-card');
  cards.forEach(card => card.addEventListener('click', () => navigateToDetails(card.dataset.id)));

  const blocks = document.querySelectorAll('.calendar-block, .month-meeting-entry');
  blocks.forEach(block => {
    block.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToDetails(block.dataset.id);
    });
    block.addEventListener('mouseenter', (e) => showPreview(e, block.dataset.id));
    block.addEventListener('mouseleave', hidePreview);
  });

  document.getElementById('schedule-meeting-btn').addEventListener('click', openModal);

  // Calendar Drag logic (Only in timeline views)
  if (state.calendarView !== 'month') {
    const dayColumns = document.querySelectorAll('.day-column');
    const dragBox = document.getElementById('drag-selection');
    let isDragging = false;
    let startY = 0;

    dayColumns.forEach(col => {
      col.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.offsetY;
        dragBox.style.left = `${col.offsetLeft}px`;
        dragBox.style.width = `${col.offsetWidth}px`;
        dragBox.style.top = `${startY}px`;
        dragBox.style.height = `0px`;
        dragBox.classList.remove('hidden');
      });
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const scrollContainer = document.querySelector('.calendar-grid-container');
      if (!scrollContainer) return;
      const rect = scrollContainer.getBoundingClientRect();
      const relativeY = e.clientY - rect.top + scrollContainer.scrollTop - 44;

      const height = relativeY - startY;
      dragBox.style.height = `${Math.abs(height)}px`;
      if (height < 0) {
        dragBox.style.top = `${relativeY}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dragBox.classList.add('hidden');
        openModal();
      }
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const scrollContainer = document.querySelector('.calendar-grid-container');
    const rect = scrollContainer.getBoundingClientRect();
    const relativeY = e.clientY - rect.top + scrollContainer.scrollTop - 44; // Adjust for header

    const height = relativeY - startY;
    dragBox.style.height = `${Math.abs(height)}px`;
    if (height < 0) {
      dragBox.style.top = `${relativeY}px`;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragBox.classList.add('hidden');
      openModal();
    }
  });

  lucide.createIcons();
};

const renderDetails = (id) => {
  const meeting = MOCK_MEETINGS.find(m => m.id == id);
  if (!meeting) return;

  contentArea.innerHTML = `
    <div class="details-view">
      <!-- Breadcrumb / Back -->
      <nav style="color: var(--text-secondary); font-size: 13px; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        <span id="breadcrumb-meetings" style="cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-secondary)'">Meetings</span>
        <span style="color: var(--border);">/</span>
        <span style="font-weight: 600; color: var(--text-primary);">${meeting.title}</span>
      </nav>

      <!-- Main Header -->
      <header class="details-header">
        <div class="details-top-row">
          <div class="details-title">
             ${meeting.status === 'LIVE' ? '<span class="status-badge status-live"><i data-lucide="video" style="width: 10px; margin-right: 4px;"></i> Live Now</span>' : ''}
             ${meeting.status === 'Scheduled' ? `<span class="status-badge status-scheduled">Starts at ${meeting.startTime}</span>` : ''}
             ${meeting.status === 'Completed' ? '<span class="status-badge" style="background: #fee2e2; color: #ef4444;">Ended</span>' : ''}
             <h1>${meeting.title}</h1>
          </div>
          <div class="actions-row">
            ${currentUser.id === meeting.hostId ? `
              <button class="icon-btn" style="border: 1px solid var(--border); border-radius: 8px;"><i data-lucide="edit-2"></i></button>
              <button class="icon-btn" style="border: 1px solid var(--border); border-radius: 8px;"><i data-lucide="trash-2"></i></button>
            ` : ''}
            
            ${meeting.status === 'LIVE' ? `
              <button class="btn btn-primary" id="join-meeting-details-btn" style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="video" style="width: 18px;"></i> Join Google Meet
              </button>
            ` : ''}

            ${meeting.status === 'Scheduled' ? `
              <button class="btn btn-secondary" style="background-color: #f1f5f9; cursor: default; border: none; color: var(--text-secondary);">
                Starts at ${meeting.startTime}
              </button>
            ` : ''}

            ${meeting.status === 'Completed' ? `
              <button class="btn btn-secondary" disabled style="opacity: 0.5; cursor: not-allowed;">
                Meeting Ended
              </button>
            ` : ''}
          </div>
        </div>
        <div class="details-meta">
          <div style="display: flex; align-items: center; gap: 6px;"><i data-lucide="calendar" style="width: 16px;"></i> ${meeting.date}</div>
          <div style="display: flex; align-items: center; gap: 6px;"><i data-lucide="clock" style="width: 16px;"></i> ${meeting.time} (90 min)</div>
        </div>
      </header>

      <div class="details-grid">
        <!-- Center Column -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Meeting Notes -->
          <div class="details-card">
            <div class="card-header">
              <h3><i data-lucide="file-text" style="width: 18px; margin-right: 8px; vertical-align: middle;"></i> Meeting Notes</h3>
              <button class="btn btn-secondary" style="font-size: 12px; padding: 4px 12px; border: none; color: var(--primary);">Edit Notes</button>
            </div>
            <p style="font-size: 14px; margin-bottom: 20px;">Objective: Align stakeholders on the engineering priorities for the upcoming quarter and finalize the release schedule for Orbit v2.0.</p>
            <ul class="notes-list">
              ${meeting.notes.map(note => `<li>${note}</li>`).join('')}
            </ul>
          </div>

          <!-- AI Meeting Insights -->
          <div class="details-card">
            <div class="card-header">
              <h3><i data-lucide="sparkles" style="width: 18px; margin-right: 8px; vertical-align: middle; color: var(--primary);"></i> AI Meeting Insights</h3>
            </div>
            <div class="insights-content">
              <div>
                <h4 style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Executive Summary</h4>
                <p style="font-size: 14px; line-height: 1.6; color: var(--text-secondary);">${meeting.insights.summary}</p>
              </div>
              <div>
                <h4 style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Action Items</h4>
                <div class="action-items-list">
                  ${meeting.insights.actionItems.map(item => `
                    <div class="checkbox-item">
                      <input type="checkbox" ${item.completed ? 'checked' : ''}>
                      <span style="font-size: 14px; color: var(--text-primary);">${item.text}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Column -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
           <!-- Participants -->
           <div class="details-card">
              <div class="card-header">
                <h3>Participants (6)</h3>
                <button class="icon-btn"><i data-lucide="user-plus"></i></button>
              </div>
              <div class="participant-list">
                ${meeting.participants.map(p => `
                  <div class="participant-item">
                    <img src="${p.img}" class="participant-avatar" alt="${p.name}">
                    <div class="participant-info">
                      <span class="name">${p.name}</span>
                      <span class="role">${p.role}</span>
                    </div>
                    <i data-lucide="check-circle" style="width: 16px; color: #10b981; margin-left: auto;"></i>
                  </div>
                `).join('')}
                <div class="participant-item">
                   <div style="width: 40px; height: 40px; background: #EEE; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">+3</div>
                   <div class="participant-info">
                      <span class="name">Others invited</span>
                      <span class="role">Waitlisted</span>
                    </div>
                    <i data-lucide="help-circle" style="width: 16px; color: #94a3b8; margin-left: auto;"></i>
                </div>
              </div>
           </div>

            <!-- Meeting Access -->
            <div class="details-card">
               <div class="card-header">
                 <h3>Meeting Access</h3>
               </div>
               <div class="access-details">
                 <div class="access-row" style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Google Meet Link</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                      <span style="color: var(--primary); font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${meeting.meetLink}</span>
                      <button class="copy-btn" style="background: none; border: none; cursor: pointer; color: var(--text-secondary);"><i data-lucide="copy" style="width: 14px;"></i></button>
                    </div>
                 </div>
                 <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.open('${meeting.meetLink}', '_blank')">
                    <i data-lucide="external-link" style="width: 14px;"></i> Open in Google Meet
                 </button>
               </div>
            </div>

           <!-- Smart Recording Card (Premium feel) -->
           <div class="details-card" style="background: linear-gradient(135deg, #005FFF, #4A90E2); color: white; border: none;">
              <h3 style="font-size: 16px; display: flex; align-items: center; gap: 8px;">
                 <i data-lucide="video" style="width: 18px;"></i> Smart Recording
              </h3>
              <p style="font-size: 12px; opacity: 0.9; margin: 8px 0 16px;">Real-time transcription and summary generation is active for this meeting.</p>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; display: flex; align-items: center; gap: 6px;">
                 <span style="width: 8px; height: 8px; background: #ff4d4d; border-radius: 50%; display: inline-block;"></span> RECORDING... 00:42:15
              </div>
           </div>
        </div>
      </div>
    </div>
  `;

  const joinBtn = document.getElementById('join-meeting-details-btn');
  if (joinBtn) joinBtn.addEventListener('click', () => window.open(meeting.meetLink, '_blank'));

  document.getElementById('breadcrumb-meetings').addEventListener('click', navigateToDashboard);
  lucide.createIcons();
};

const renderModal = () => {
  modalOverlay.innerHTML = `
    <div class="modal-content">
      <header class="modal-header">
        <div>
          <h2>Schedule Meeting</h2>
          <p style="font-size: 13px; color: var(--text-secondary);">ORBIT Meetings • Create a new synchronization event</p>
        </div>
        <button class="close-modal" id="close-modal-btn"><i data-lucide="x"></i></button>
      </header>
      <div class="modal-body">
        <div class="col-left">
          <div class="form-group">
            <label class="form-label">Meeting Title</label>
            <input type="text" class="form-input" placeholder="e.g. Q4 Strategy Review">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" placeholder="Add meeting agenda or notes..."></textarea>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Organizer</label>
              <select class="form-select">
                <option>Alex Rivera</option>
                <option>Elena Rodriguez</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Project Association</label>
              <select class="form-select">
                <option>Internal Ops</option>
                <option>Orbit v2.0</option>
              </select>
            </div>
          </div>
          <div class="toggle-row">
            <span style="font-size: 14px; font-weight: 500;">Send email invite</span>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-row">
            <span style="font-size: 14px; font-weight: 500;">Generate meeting link</span>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="col-right">
          <div class="form-group">
            <label class="form-label">Select Date</label>
            <!-- Mock Calendar Widget UI -->
            <div style="border: 1px solid var(--border); border-radius: 8px; padding: 12px; background: #fff;">
               <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; margin-bottom: 12px;">
                 <i data-lucide="chevron-left" style="width: 14px;"></i> October 2023 <i data-lucide="chevron-right" style="width: 14px;"></i>
               </div>
               <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 11px;">
                  <span style="color: #94a3b8;">S</span><span style="color: #94a3b8;">M</span><span style="color: #94a3b8;">T</span><span style="color: #94a3b8;">W</span><span style="color: #94a3b8;">T</span><span style="color: #94a3b8;">F</span><span style="color: #94a3b8;">S</span>
                  ${Array.from({ length: 14 }).map((_, i) => `<span style="${i + 24 === 29 ? 'background: var(--primary); color: white; border-radius: 50%;' : ''} padding: 4px;">${(i + 24) % 31 || 31}</span>`).join('')}
               </div>
            </div>
          </div>
          <div style="display: flex; gap: 16px;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Start Time</label>
              <div style="position: relative;">
                <input type="text" class="form-input" value="02:00 PM">
                <i data-lucide="clock" style="position: absolute; right: 8px; top: 10px; width: 14px; color: #94a3b8;"></i>
              </div>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">End Time</label>
              <div style="position: relative;">
                 <input type="text" class="form-input" value="03:00 PM">
                 <i data-lucide="clock" style="position: absolute; right: 8px; top: 10px; width: 14px; color: #94a3b8;"></i>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Attendees</label>
            <div style="position: relative;">
               <i data-lucide="search" style="position: absolute; left: 8px; top: 10px; width: 14px; color: #94a3b8;"></i>
               <input type="text" class="form-input" style="padding-left: 32px;" placeholder="Add required/optional attendees">
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
               <span style="background: #e0f2fe; color: var(--primary); padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Sarah J. (Required) <i data-lucide="x" style="width: 10px; cursor:pointer;"></i></span>
               <span style="background: #f1f5f9; color: var(--text-secondary); padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Mike R. (Optional) <i data-lucide="x" style="width: 10px; cursor:pointer;"></i></span>
               <span style="background: #e0f2fe; color: var(--primary); padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">Dev Team (Required) <i data-lucide="x" style="width: 10px; cursor:pointer;"></i></span>
            </div>
          </div>
        </div>
      </div>
      <footer class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal-btn">Cancel</button>
        <button class="btn btn-primary">Schedule Meeting</button>
      </footer>
    </div>
  `;

  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);

  modalOverlay.querySelector('.btn-primary').addEventListener('click', () => {
    const title = modalOverlay.querySelector('.form-input').value || 'New Sync Event';
    const newMeeting = {
      id: MOCK_MEETINGS.length + 1,
      title: title,
      hostId: currentUser.id,
      time: '02:00 PM – 03:00 PM',
      startTime: '14:00',
      endTime: '15:00',
      day: 1,
      date: 'Oct 24, 2023',
      status: 'Scheduled',
      type: 'Internal',
      organizer: currentUser.name,
      participants: [
        { name: currentUser.name, role: 'Organizer', img: currentUser.img }
      ],
      notes: [],
      insights: { summary: '', actionItems: [] },
      meetLink: generateMeetLink()
    };
    MOCK_MEETINGS.push(newMeeting);
    closeModal();
    renderDashboard();
  });

  lucide.createIcons();
}

// --- Navigation & State Functions ---

const navigateToDashboard = () => {
  state.currentView = 'dashboard';
  state.currentMeetingId = null;
  document.getElementById('page-title').innerText = 'Meetings';
  renderDashboard();
};

const navigateToDetails = (id) => {
  state.currentView = 'details';
  state.currentMeetingId = id;
  const meeting = MOCK_MEETINGS.find(m => m.id == id);
  document.getElementById('page-title').innerText = meeting ? meeting.title : 'Meeting Details';
  renderDetails(id);
};

const openModal = () => {
  state.isModalOpen = true;
  modalOverlay.classList.remove('hidden');
  renderModal();
};

const closeModal = () => {
  state.isModalOpen = false;
  modalOverlay.classList.add('hidden');
};

const showPreview = (e, id) => {
  const meeting = MOCK_MEETINGS.find(m => m.id == id);
  if (!meeting) return;

  const rect = e.target.getBoundingClientRect();
  hoverPreview.style.left = `${rect.left}px`;
  hoverPreview.style.top = `${rect.top - 120}px`;

  hoverPreview.innerHTML = `
    <div class="preview-title">${meeting.title}</div>
    <div class="preview-row"><i data-lucide="clock" style="width: 12px;"></i> ${meeting.time}</div>
    <div class="preview-row"><i data-lucide="user" style="width: 12px;"></i> Organized by ${meeting.organizer}</div>
    <div class="preview-row"><i data-lucide="users" style="width: 12px;"></i> ${meeting.participants.length} Participants</div>
  `;

  hoverPreview.classList.remove('hidden');
  lucide.createIcons();
};

const hidePreview = () => {
  hoverPreview.classList.add('hidden');
};

// --- Initialization ---

navigateToDashboard();

// Click outside modal to close
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// --- Initialization ---

navigateToDashboard();

// Click outside modal to close
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
