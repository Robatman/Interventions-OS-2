// ═══════════════════════════════════════════
//  admin.js — Leadership OS
//  Admin panel: users, sessions, trends
//  Only accessible when role_code === 'A'
// ═══════════════════════════════════════════

// ─── ENTRY POINT ──────────────────────────

async function goAdmin() {
  if (!isAdmin()) {
    alert('Access denied.');
    return;
  }
  show('s-admin');
  renderAdminNav('users');
  loadAdminUsers();
}

// ─── NAV ──────────────────────────────────

function renderAdminNav(active) {
  const tabs = ['users', 'sessions', 'trends'];
  const labels = { users: '👥 Users', sessions: '📋 Sessions', trends: '📊 Trends' };
  const el = document.getElementById('admin-nav');
  if (!el) return;
  el.innerHTML = tabs.map(t => `
    <button class="admin-tab ${t === active ? 'active' : ''}" onclick="adminTab('${t}')">
      ${labels[t]}
    </button>`).join('');
}

function adminTab(tab) {
  renderAdminNav(tab);
  if (tab === 'users')    loadAdminUsers();
  if (tab === 'sessions') loadAdminSessions();
  if (tab === 'trends')   loadAdminTrends();
}

// ─── USERS ────────────────────────────────

async function loadAdminUsers() {
  const el = document.getElementById('admin-content');
  if (!el) return;
  el.innerHTML = `<div class="admin-loading">Loading users...</div>`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?select=*&order=created_at.desc`,
      { headers: { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${getSessionToken()}` } }
    );
    const users = await res.json();

    el.innerHTML = `
      <div class="admin-section-title">Registered users <span class="admin-count">${users.length}</span></div>
      <div class="admin-table">
        <div class="admin-row admin-header">
          <span>Game ID</span>
          <span>Role</span>
          <span>Status</span>
          <span>Registered</span>
          <span>Actions</span>
        </div>
        ${users.map(u => `
          <div class="admin-row ${!u.is_active ? 'inactive' : ''}">
            <span class="admin-gameid">${u.game_id}</span>
            <span class="admin-role">${ROLE_MAP[u.role_code] || u.role_code}</span>
            <span class="admin-status ${u.is_active ? 'active' : 'disabled'}">
              ${u.is_active ? '● Active' : '○ Disabled'}
            </span>
            <span class="admin-date">${u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—'}</span>
            <span class="admin-actions">
              <button class="admin-btn" onclick="adminToggleUser('${u.id}', ${u.is_active})">
                ${u.is_active ? 'Disable' : 'Enable'}
              </button>
              <button class="admin-btn admin-btn-reset" onclick="adminResetPassword('${u.id}', '${u.game_id}')">
                Reset pwd
              </button>
            </span>
          </div>`).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="admin-error">Error loading users: ${e.message}</div>`;
  }
}

async function adminToggleUser(userId, currentlyActive) {
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
      {
        method:  'PATCH',
        headers: { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${getSessionToken()}`, 'Prefer': 'return=minimal' },
        body:    JSON.stringify({ is_active: !currentlyActive })
      }
    );
    loadAdminUsers();
  } catch (e) {
    alert('Error updating user.');
  }
}

async function adminResetPassword(userId, gameId) {
  const newPwd = prompt(`New password for ${gameId}:`);
  if (!newPwd || newPwd.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }
  try {
    // Supabase Admin API to update password
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${getSessionToken()}`
      },
      body: JSON.stringify({ password: newPwd })
    });
    if (res.ok) {
      alert(`Password reset for ${gameId}.`);
    } else {
      const err = await res.json();
      alert('Error: ' + (err.message || 'Could not reset password'));
    }
  } catch (e) {
    alert('Error resetting password.');
  }
}

// ─── SESSIONS ─────────────────────────────

async function loadAdminSessions() {
  const el = document.getElementById('admin-content');
  if (!el) return;
  el.innerHTML = `<div class="admin-loading">Loading sessions...</div>`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_sessions?select=*&order=completed_at.desc&limit=100`,
      { headers: { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${getSessionToken()}` } }
    );
    const sessions = await res.json();

    // Group by technique
    const byTechnique = {};
    const byIntervention = {};
    sessions.forEach(s => {
      if (s.technique) {
        byTechnique[s.technique] = (byTechnique[s.technique] || 0) + 1;
      }
      if (s.intervention) {
        byIntervention[s.intervention] = (byIntervention[s.intervention] || 0) + 1;
      }
    });

    const techSorted = Object.entries(byTechnique).sort((a,b) => b[1]-a[1]);
    const intSorted  = Object.entries(byIntervention).sort((a,b) => b[1]-a[1]);
    const maxTech    = techSorted[0]?.[1] || 1;
    const maxInt     = intSorted[0]?.[1] || 1;

    el.innerHTML = `
      <div class="admin-section-title">Sessions <span class="admin-count">${sessions.length}</span></div>

      <div class="admin-split">
        <div>
          <div class="admin-subsection">By Technique</div>
          ${techSorted.map(([id, count]) => `
            <div class="admin-bar-row">
              <span class="admin-bar-label">${TECHNIQUES[id]?.label || id}</span>
              <div class="admin-bar-track">
                <div class="admin-bar-fill" style="width:${Math.round(count/maxTech*100)}%"></div>
              </div>
              <span class="admin-bar-count">${count}</span>
            </div>`).join('') || '<div class="admin-empty">No technique sessions yet</div>'}
        </div>
        <div>
          <div class="admin-subsection">By Intervention</div>
          ${intSorted.map(([id, count]) => `
            <div class="admin-bar-row">
              <span class="admin-bar-label">${INTERVENTIONS[id]?.label || id}</span>
              <div class="admin-bar-track">
                <div class="admin-bar-fill admin-bar-purple" style="width:${Math.round(count/maxInt*100)}%"></div>
              </div>
              <span class="admin-bar-count">${count}</span>
            </div>`).join('') || '<div class="admin-empty">No intervention sessions yet</div>'}
        </div>
      </div>

      <div class="admin-subsection" style="margin-top:20px;">Recent sessions</div>
      <div class="admin-table">
        <div class="admin-row admin-header">
          <span>Game ID</span>
          <span>Topic</span>
          <span>Level</span>
          <span>Mood</span>
          <span>Date</span>
        </div>
        ${sessions.slice(0, 30).map(s => {
          const topic = s.intervention
            ? (INTERVENTIONS[s.intervention]?.label || s.intervention)
            : (TECHNIQUES[s.technique]?.label       || s.technique || '—');
          const moodColor = (s.mood_final||0) < 35 ? 'var(--coral)' : (s.mood_final||0) < 60 ? 'var(--amber)' : 'var(--teal)';
          const date = s.completed_at ? new Date(s.completed_at).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—';
          return `
            <div class="admin-row">
              <span class="admin-gameid">${s.game_id || '—'}</span>
              <span>${topic}</span>
              <span>${s.level || '—'}</span>
              <span style="color:${moodColor};font-weight:600;">${s.mood_final || 0}%</span>
              <span class="admin-date">${date}</span>
            </div>`;
        }).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="admin-error">Error loading sessions: ${e.message}</div>`;
  }
}

// ─── TRENDS ───────────────────────────────

async function loadAdminTrends() {
  const el = document.getElementById('admin-content');
  if (!el) return;
  el.innerHTML = `<div class="admin-loading">Loading trends...</div>`;

  try {
    const [sessionsRes, workRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/admin_sessions?select=*&order=completed_at.desc&limit=500`,
        { headers: { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${getSessionToken()}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/work_sessions?select=*&order=created_at.desc&limit=200`,
        { headers: { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${getSessionToken()}` } })
    ]);

    const sessions  = await sessionsRes.json();
    const workSess  = await workRes.json();

    // Weekly sessions last 8 weeks
    const now = Date.now();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = now - (i + 1) * 7 * 24 * 3600 * 1000;
      const end   = now - i * 7 * 24 * 3600 * 1000;
      const count = sessions.filter(s => {
        const t = new Date(s.completed_at).getTime();
        return t >= start && t < end;
      }).length;
      const label = new Date(end).toLocaleDateString('en-US', { month:'short', day:'numeric' });
      return { label, count };
    }).reverse();

    const maxWeek = Math.max(...weeks.map(w => w.count), 1);

    // Avg mood per technique
    const techMoods = {};
    sessions.forEach(s => {
      if (!s.technique || !s.mood_final) return;
      if (!techMoods[s.technique]) techMoods[s.technique] = [];
      techMoods[s.technique].push(s.mood_final);
    });
    const techAvg = Object.entries(techMoods).map(([id, moods]) => ({
      id,
      label: TECHNIQUES[id]?.label || id,
      avg:   Math.round(moods.reduce((a,b) => a+b, 0) / moods.length)
    })).sort((a,b) => b.avg - a.avg);

    // Work Together topic classifications
    const topicCounts = {};
    workSess.forEach(w => {
      if (w.topic_classification) {
        topicCounts[w.topic_classification] = (topicCounts[w.topic_classification] || 0) + 1;
      }
    });
    const topicSorted = Object.entries(topicCounts).sort((a,b) => b[1]-a[1]);

    el.innerHTML = `
      <div class="admin-section-title">Trends</div>

      <div class="admin-subsection">Sessions per week</div>
      <div class="admin-week-chart">
        ${weeks.map(w => `
          <div class="admin-week-col">
            <div class="admin-week-bar" style="height:${Math.round(w.count/maxWeek*80)}px;"></div>
            <div class="admin-week-count">${w.count}</div>
            <div class="admin-week-label">${w.label}</div>
          </div>`).join('')}
      </div>

      <div class="admin-subsection" style="margin-top:20px;">Avg openness by technique</div>
      ${techAvg.map(t => {
        const color = t.avg < 35 ? 'var(--coral)' : t.avg < 60 ? 'var(--amber)' : 'var(--teal)';
        return `
          <div class="admin-bar-row">
            <span class="admin-bar-label">${t.label}</span>
            <div class="admin-bar-track">
              <div class="admin-bar-fill" style="width:${t.avg}%;background:${color};"></div>
            </div>
            <span class="admin-bar-count" style="color:${color};">${t.avg}%</span>
          </div>`;
      }).join('') || '<div class="admin-empty">No data yet</div>'}

      <div class="admin-subsection" style="margin-top:20px;">Work Together — what people bring</div>
      ${topicSorted.length ? `
        <div class="admin-tags">
          ${topicSorted.map(([topic, count]) => `
            <div class="admin-tag">
              <span>${topic}</span>
              <span class="admin-tag-count">${count}</span>
            </div>`).join('')}
        </div>` : '<div class="admin-empty">No Work Together sessions classified yet</div>'}

      <div class="admin-stats-grid" style="margin-top:20px;">
        <div class="admin-stat">
          <div class="admin-stat-num">${sessions.length}</div>
          <div class="admin-stat-lbl">Total sessions</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-num">${sessions.filter(s=>s.box_final==='out').length}</div>
          <div class="admin-stat-lbl">Out of box</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-num">${workSess.length}</div>
          <div class="admin-stat-lbl">Work Together</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-num">${sessions.filter(s=>s.level==='adv').length}</div>
          <div class="admin-stat-lbl">Fieldwork sessions</div>
        </div>
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="admin-error">Error loading trends: ${e.message}</div>`;
  }
}
