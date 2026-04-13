const API = 'http://localhost:3000/api';

let allTables = [];       // [{name, primaryKey, columns}]
let currentTable = null;
let currentRows  = [];
let rowCounts    = {};

// Currency columns (heuristic)
const CURRENCY_COLS = ['GiaBan','GiaMua','TongTienThanhToan'];
const DATE_COLS     = ['ThoiGian'];

// ── INIT ─────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(`${API}/tables`);
    allTables = await res.json();
    await loadCounts();
    renderSidebar();
  } catch(e) {
    showToast('Cannot connect to server. Is Node.js running?', 'error');
  }
}

async function loadCounts() {
  await Promise.all(allTables.map(async t => {
    try {
      const r = await fetch(`${API}/${t.name}`);
      const d = await r.json();
      rowCounts[t.name] = Array.isArray(d) ? d.length : 0;
    } catch { rowCounts[t.name] = '?'; }
  }));
}

// ── SIDEBAR ──────────────────────────────────────────────
function renderSidebar() {
  const nav = document.getElementById('table-nav');
  nav.innerHTML = '';
  allTables.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'table-btn';
    btn.dataset.table = t.name;
    btn.innerHTML = `
      <span class="dot"></span>
      <span>${t.name}</span>
      <span class="row-count">${rowCounts[t.name] ?? '…'}</span>
    `;
    btn.addEventListener('click', () => selectTable(t.name));
    nav.appendChild(btn);
  });
}

// ── SELECT TABLE ─────────────────────────────────────────
async function selectTable(name) {
  currentTable = allTables.find(t => t.name === name);
  if (!currentTable) return;

  document.querySelectorAll('.table-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.table === name);
  });

  document.getElementById('table-title').innerHTML =
    `${name} <span>${currentTable.columns.length} cols · ${rowCounts[name] ?? '…'} rows</span>`;
  document.getElementById('search-box').style.display = '';
  document.getElementById('btn-add').style.display = '';
  document.getElementById('search-box').value = '';

  await loadTable();
}

async function loadTable(query = '') {
  const content = document.getElementById('content');
  content.innerHTML = `<table class="data-table"><tbody><tr class="loading-row"><td colspan="99">Loading…</td></tr></tbody></table>`;

  const url = query
    ? `${API}/${currentTable.name}/search?q=${encodeURIComponent(query)}`
    : `${API}/${currentTable.name}`;

  try {
    const res = await fetch(url);
    currentRows = await res.json();
    renderTable(currentRows);
  } catch(e) {
    content.innerHTML = `<p style="color:var(--error);padding:28px;font-family:var(--font-mono)">Error: ${e.message}</p>`;
  }
}

// ── RENDER TABLE ─────────────────────────────────────────
function renderTable(rows) {
  const content = document.getElementById('content');
  if (!rows.length) {
    content.innerHTML = `<div id="empty-state"><div class="big-icon">📭</div><h2>No rows found</h2><p>Try adding one with + Add Row</p></div>`;
    return;
  }
  const cols = currentTable.columns;
  const pks  = currentTable.primaryKey;

  const thead = `<thead><tr>
    ${cols.map(c => `<th class="${pks.includes(c)?'pk':''}">${c}</th>`).join('')}
    <th>Actions</th>
  </tr></thead>`;

  const tbody = rows.map(row => {
    const cells = cols.map(c => {
      const isPk  = pks.includes(c);
      const isCur = CURRENCY_COLS.includes(c);
      const val   = row[c] ?? '';
      return `<td class="${isPk?'pk-val':''}${isCur?' currency':''}">${formatCell(c, val)}</td>`;
    }).join('');
    const pkQuery = pks.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(row[k])}`).join('&');
    return `<tr>
      ${cells}
      <td><div class="action-cell">
        <button class="btn-edit" onclick="openEdit('${escJs(pkQuery)}')">Edit</button>
        <button class="btn-del"  onclick="confirmDelete('${escJs(pkQuery)}')">Delete</button>
      </div></td>
    </tr>`;
  }).join('');

  content.innerHTML = `<div class="table-wrap"><table class="data-table">${thead}<tbody>${tbody}</tbody></table></div>`;
}

function formatCell(col, val) {
  if (DATE_COLS.includes(col) && val) return val.toString().slice(0,10);
  if (CURRENCY_COLS.includes(col) && val !== '') return Number(val).toLocaleString('vi-VN');
  return escHtml(String(val));
}

// ── MODAL ─────────────────────────────────────────────────
function openAdd() {
  const cols = currentTable.columns;
  const pks  = currentTable.primaryKey;
  document.getElementById('modal-title').innerHTML =
    `Add Row <span>· ${currentTable.name}</span>`;
  document.getElementById('modal-body').innerHTML = cols.map(c => `
    <div class="form-group">
      <label class="${pks.includes(c)?'pk-label':''}">${c}${pks.includes(c)?' 🔑':''}</label>
      <input name="${c}" type="${DATE_COLS.includes(c)?'date':'text'}" placeholder="${c}" />
    </div>`).join('');
  document.getElementById('btn-save').onclick = saveAdd;
  document.getElementById('modal-overlay').classList.add('open');
}

async function openEdit(pkQuery) {
  const params = new URLSearchParams(pkQuery);
  const res  = await fetch(`${API}/${currentTable.name}/row?${pkQuery}`);
  const row  = await res.json();
  if (!row) return showToast('Row not found', 'error');

  const cols = currentTable.columns;
  const pks  = currentTable.primaryKey;
  document.getElementById('modal-title').innerHTML =
    `Edit Row <span>· ${currentTable.name}</span>`;
  document.getElementById('modal-body').innerHTML = cols.map(c => `
    <div class="form-group">
      <label class="${pks.includes(c)?'pk-label':''}">${c}${pks.includes(c)?' 🔑':''}</label>
      <input name="${c}" type="${DATE_COLS.includes(c)?'date':'text'}"
        value="${escHtml(row[c]??'')}"
        ${pks.includes(c)?'disabled':''} />
    </div>`).join('');

  document.getElementById('btn-save').onclick = () => saveEdit(pkQuery);
  document.getElementById('modal-overlay').classList.add('open');
}

async function saveAdd() {
  const inputs = document.querySelectorAll('#modal-body input');
  const data = {};
  inputs.forEach(i => { if(i.value !== '') data[i.name] = i.value; });
  try {
    const res = await fetch(`${API}/${currentTable.name}`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
    });
    const r = await res.json();
    if (!res.ok) throw new Error(r.error);
    closeModal();
    showToast('Row added ✓', 'success');
    rowCounts[currentTable.name] = (rowCounts[currentTable.name]||0) + 1;
    renderSidebar();
    await loadTable();
  } catch(e) { showToast(e.message, 'error'); }
}

async function saveEdit(pkQuery) {
  const inputs = document.querySelectorAll('#modal-body input:not([disabled])');
  const data = {};
  // also include PK values for reference
  const pks = currentTable.primaryKey;
  const params = new URLSearchParams(pkQuery);
  pks.forEach(k => data[k] = params.get(k));
  inputs.forEach(i => { data[i.name] = i.value; });

  try {
    const res = await fetch(`${API}/${currentTable.name}/row?${pkQuery}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
    });
    const r = await res.json();
    if (!res.ok) throw new Error(r.error);
    closeModal();
    showToast('Row updated ✓', 'success');
    await loadTable();
  } catch(e) { showToast(e.message, 'error'); }
}

// ── DELETE ────────────────────────────────────────────────
let pendingDeleteQuery = null;

function confirmDelete(pkQuery) {
  pendingDeleteQuery = pkQuery;
  const readable = decodeURIComponent(pkQuery).replace(/&/g, ' · ');
  document.getElementById('confirm-msg').textContent = readable;
  document.getElementById('confirm-overlay').classList.add('open');
}

async function doDelete() {
  if (!pendingDeleteQuery) return;
  try {
    const res = await fetch(`${API}/${currentTable.name}/row?${pendingDeleteQuery}`, { method: 'DELETE' });
    const r = await res.json();
    if (!res.ok) throw new Error(r.error);
    closeConfirm();
    showToast('Row deleted ✓', 'success');
    rowCounts[currentTable.name] = Math.max(0, (rowCounts[currentTable.name]||1) - 1);
    renderSidebar();
    await loadTable();
  } catch(e) { showToast(e.message, 'error'); closeConfirm(); }
}

// ── CLOSE / EVENTS ────────────────────────────────────────
function closeModal()   { document.getElementById('modal-overlay').classList.remove('open'); }
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); pendingDeleteQuery = null; }

document.getElementById('modal-close').onclick   = closeModal;
document.getElementById('btn-cancel').onclick    = closeModal;
document.getElementById('btn-confirm-cancel').onclick = closeConfirm;
document.getElementById('btn-confirm-del').onclick    = doDelete;
document.getElementById('btn-add').onclick = openAdd;

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// Search with debounce
let searchTimer;
document.getElementById('search-box').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadTable(e.target.value.trim()), 300);
});

// ── TOAST ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = (type === 'success' ? '✓ ' : '✗ ') + msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

// ── HELPERS ───────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escJs(s) {
  return String(s).replace(/'/g, "\\'");
}

init();
