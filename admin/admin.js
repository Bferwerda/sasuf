(() => {
  'use strict';
  const cfg = window.SASUF_ADMIN_CONFIG || {};
  const endpoint = cfg.apiEndpoint;
  const tokenKey = 'sasuf_admin_token';
  let currentSite = 'ALL';

  const $ = (id) => document.getElementById(id);
  const loginView = $('loginView');
  const dashboardView = $('dashboardView');
  const loginForm = $('loginForm');
  const loginError = $('loginError');

  if (cfg.title) $('pageTitle').textContent = cfg.title;

  const token = () => sessionStorage.getItem(tokenKey) || '';
  const setToken = (value) => value ? sessionStorage.setItem(tokenKey, value) : sessionStorage.removeItem(tokenKey);

  async function api(body, expectBlob = false) {
    const headers = {'Content-Type':'application/json'};
    if (token()) headers.Authorization = 'Bearer ' + token();
    const response = await fetch(endpoint, {method:'POST', headers, body:JSON.stringify(body), cache:'no-store'});
    if (response.status === 401) {
      setToken('');
      showLogin();
      throw new Error('Your admin session has expired. Please sign in again.');
    }
    if (!response.ok) {
      let message = 'Request failed.';
      try { const data = await response.json(); if (data.error) message = data.error; } catch (_) {}
      throw new Error(message);
    }
    return expectBlob ? response.blob() : response.json();
  }

  function showLogin() {
    dashboardView.hidden = true;
    loginView.hidden = false;
    $('password').value = '';
    setTimeout(() => $('password').focus(), 20);
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    try {
      const result = await api({action:'login', password:$('password').value});
      setToken(result.token);
      showDashboard();
      await loadStats();
    } catch (err) {
      loginError.textContent = err.message || 'Could not sign in.';
      loginError.hidden = false;
    }
  });

  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', async () => {
      currentSite = button.dataset.site;
      document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === button));
      await loadStats();
    });
  });

  $('refreshBtn').addEventListener('click', loadStats);
  $('logoutBtn').addEventListener('click', () => { setToken(''); showLogin(); });
  $('exportBtn').addEventListener('click', async () => {
    try {
      showStatus('Preparing CSV…');
      const blob = await api({action:'export', site:currentSite}, true);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sasuf_${currentSite.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      hideStatus();
    } catch (err) { showStatus(err.message, true); }
  });

  async function loadStats() {
    try {
      showStatus('Loading live statistics…');
      const data = await api({action:'stats', site:currentSite});
      render(data);
      hideStatus();
    } catch (err) { showStatus(err.message, true); }
  }

  function render(data) {
    const s = data.stats;
    $('kpiShown').textContent = s.n;
    $('kpiShownSub').textContent = currentSite === 'ALL' ? 'SE + SA' : currentSite;
    $('kpiSE').textContent = data.totals.SE;
    $('kpiSA').textContent = data.totals.SA;
    $('kpiTime').textContent = s.avg_completion_minutes == null ? '—' : s.avg_completion_minutes.toFixed(1) + 'm';
    $('kpiLatest').textContent = 'latest: ' + (s.latest || '—');

    renderBars('institutions', s.institutions);
    renderBars('studyLevels', s.study_levels);
    renderBars('disciplines', s.disciplines);
    renderBars('useFrequency', s.use_frequency);
    renderBars('guidance', s.guidance);
    renderBars('paidAccess', s.paid_access);
    renderBars('resourceAwareness', s.resource_awareness);
    renderBaseline(s.baseline_scales, data.baseline_labels);
    renderScenarioTable(s.scenario_means, data.scenario_labels, data.measure_labels);
    renderBars('reasons', translateCounts(s.reasons, data.reason_labels));
    renderRecent(data.recent || []);

    $('comparisonSection').hidden = currentSite !== 'ALL';
    if (currentSite === 'ALL') renderComparison(data.comparison, data.scenario_labels);
  }

  function renderBars(id, counts) {
    const root = $(id); root.innerHTML = '';
    const entries = Object.entries(counts || {}).sort((a,b) => b[1] - a[1]);
    if (!entries.length) { root.innerHTML = '<div class="empty">No data yet.</div>'; return; }
    const max = Math.max(...entries.map(e => e[1]), 1);
    entries.forEach(([label, count]) => {
      const row = document.createElement('div'); row.className = 'bar-row';
      row.innerHTML = `<div class="bar-label" title="${esc(label)}">${esc(label)}</div><div class="bar-track"><div class="bar-fill" style="width:${(count/max*100).toFixed(1)}%"></div></div><div class="bar-count">${count}</div>`;
      root.appendChild(row);
    });
  }

  function renderBaseline(values, labels) {
    const root = $('baselineRatings'); root.innerHTML = '';
    Object.entries(labels || {}).forEach(([key,label]) => {
      const v = values && values[key] != null ? Number(values[key]) : null;
      const row = document.createElement('div'); row.className = 'metric-row';
      row.innerHTML = `<div>${esc(label)}</div><div class="score-track"><div class="score-fill" style="width:${v == null ? 0 : (v/7*100).toFixed(1)}%"></div></div><div class="score">${fmt(v)}</div>`;
      root.appendChild(row);
    });
  }

  function renderScenarioTable(means, scenarioLabels, measureLabels) {
    const table = $('scenarioTable');
    let html = '<thead><tr><th>Scenario</th>' + Object.values(measureLabels).map(x => `<th>${esc(x)}</th>`).join('') + '</tr></thead><tbody>';
    Object.entries(scenarioLabels).forEach(([sid,label]) => {
      html += `<tr><td><strong>${esc(label)}</strong></td>`;
      Object.keys(measureLabels).forEach(mid => { html += `<td class="num">${fmt(means?.[sid]?.[mid])}</td>`; });
      html += '</tr>';
    });
    table.innerHTML = html + '</tbody>';
  }

  function renderComparison(rows, scenarioLabels) {
    const table = $('comparisonTable');
    let html = '<thead><tr><th>Scenario</th><th>SE likelihood</th><th>SA likelihood</th><th>SE appropriate</th><th>SA appropriate</th><th>Likelihood difference (SE−SA)</th></tr></thead><tbody>';
    Object.keys(scenarioLabels).forEach(sid => {
      const r = rows?.[sid] || {};
      html += `<tr><td><strong>${esc(scenarioLabels[sid])}</strong></td><td class="num">${fmt(r.se_likelihood)}</td><td class="num">${fmt(r.sa_likelihood)}</td><td class="num">${fmt(r.se_appropriate)}</td><td class="num">${fmt(r.sa_appropriate)}</td><td class="num">${signed(r.likelihood_difference)}</td></tr>`;
    });
    table.innerHTML = html + '</tbody>';
  }

  function renderRecent(rows) {
    const table = $('recentTable');
    let html = '<thead><tr><th>Site</th><th>Submitted</th><th>Institution</th><th>Study level</th><th>Discipline</th><th>Survey version</th></tr></thead><tbody>';
    if (!rows.length) html += '<tr><td colspan="6" class="empty">No responses yet.</td></tr>';
    rows.forEach(r => {
      html += `<tr><td><span class="site-badge site-${esc(r.site)}">${esc(r.site)}</span></td><td>${esc(r.submitted_at || '—')}</td><td>${esc(r.institution || '—')}</td><td>${esc(r.study_level || '—')}</td><td>${esc(r.discipline || '—')}</td><td>${esc(r.survey_version || '—')}</td></tr>`;
    });
    table.innerHTML = html + '</tbody>';
  }

  function translateCounts(counts, labels) {
    const out = {};
    Object.keys(labels || {}).forEach(k => out[labels[k]] = counts?.[k] || 0);
    return out;
  }
  function fmt(v) { return v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toFixed(2); }
  function signed(v) { if (v == null || Number.isNaN(Number(v))) return '—'; const n = Number(v); return (n >= 0 ? '+' : '') + n.toFixed(2); }
  function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function showStatus(message, isError=false) { const el=$('statusMessage'); el.textContent=message; el.className='status'+(isError?' error':''); el.hidden=false; }
  function hideStatus() { $('statusMessage').hidden=true; }

  if (token()) { showDashboard(); loadStats(); } else { showLogin(); }
})();
