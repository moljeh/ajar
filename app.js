/**
 * EDUPLAN AI — PENGGABUNGAN TANPA DESAIN ULANG
 * Fungsi dan aturan tampilan dipertahankan dari kode pengguna.
 * Notifikasi modern asli digabung; tidak memerlukan notification-ui.js.
 * Satu deklarasi untuk setiap fungsi aplikasi.
 * Contoh rujukan: getReferenceExample().
 *
 * DAFTAR FUNGSI
 * F01 | EduNotify
 * F02 | $
 * F03 | escapeHTML
 * F04 | title
 * F05 | dateText
 * F06 | button
 * F07 | badge
 * F08 | field
 * F09 | selectField
 * F10 | textarea
 * F11 | check
 * F12 | showToast
 * F13 | setBusy
 * F14 | run
 * F15 | formValues
 * F16 | api
 * F17 | clearSession
 * F18 | renderLogin
 * F19 | login
 * F20 | applyBoot
 * F21 | logout
 * F22 | navItem
 * F23 | renderRoleAvatar
 * F24 | renderShell
 * F25 | setRoute
 * F26 | mayLeave
 * F27 | navigate
 * F28 | pageHead
 * F29 | renderDashboard
 * F30 | renderCategory
 * F31 | getReferenceExample
 * F32 | renderGenerator
 * F33 | generate
 * F34 | openDocument
 * F35 | renderEditor
 * F36 | editorValues
 * F37 | syncDocument
 * F38 | persistEditor
 * F39 | saveDocument
 * F40 | downloadBlob
 * F41 | exportDocument
 * F42 | copyDocument
 * F43 | renderHistory
 * F44 | renderDocumentResults
 * F45 | mutateDocument
 * F46 | renderProfile
 * F47 | saveProfile
 * F48 | renderUsers
 * F49 | editUser
 * F50 | saveUser
 * F51 | renderSettings
 * F52 | saveProvider
 * F53 | testProvider
 * F54 | saveSettings
 * F55 | renderLogs
 * F56 | renderHelp
 * F57 | onClick
 * F58 | onSubmit
 * F59 | onInput
 * F60 | onChange
 * F61 | toggleTheme
 * F62 | init
 */

/**
 * EDUPLAN AI | Frontend GitHub Pages
 * 1. Ganti API_URL dengan deployment URL /exec milik Anda.
 * 2. Tidak ada API key AI di frontend ini.
 * 3. Backend menyimpan dan memeriksa peran akun setiap permintaan.
 */
'use strict';

const CONFIG = Object.freeze({
  API_URL: 'https://script.google.com/macros/s/AKfycbwNp8t0AWKOQGSN1CztP82eeHEa9jrxJiQz4i4t1qtWaPUze3ErAxaHzS3jjn0IXxcjog/exec',
  SESSION_KEY: 'eduplan-session',
  THEME_KEY: 'eduplan-theme',
  PAGE_SIZE: 12
});

const TITLES = {
  rpp: 'RPP', modul_ajar: 'Modul Ajar', atp: 'ATP', cp_rujukan: 'CP Rujukan',
  tp: 'TP', kktp: 'KKTP', lkpd: 'LKPD', prota: 'Prota', promes: 'Promes',
  distribusi_tp: 'Distribusi TP'
};

const state = {
  token: sessionStorage.getItem(CONFIG.SESSION_KEY) || '',
  user: null,
  catalog: {},
  providers: [],
  documents: [],
  usage: {used: 0, limit: 0},
  route: 'dashboard',
  category: '',
  generatorType: '',
  editor: null,
  dirty: false,
  busy: false,
  admin: null,
  filters: {query: '', type: '', provider: '', page: 1},
  toastTimer: null
};

/**
 * EduPlan AI — Notifikasi modern, digabung tanpa perubahan desain.
 * Pesan menggunakan textContent; tidak menggunakan alert/confirm/prompt.
 */
/* -----------------------------------------------------------------
 * F01 | EduNotify
 * ----------------------------------------------------------------- */
const EduNotify = (() => {
  let stack = null;
  let dialog = null;
  let activeResolve = null;
  let previousFocus = null;
  let previousOverflow = '';
  let queue = Promise.resolve();

  const types = {
    success: {title: 'Berhasil', icon: '✓'},
    error: {title: 'Terjadi kendala', icon: '!'},
    info: {title: 'Informasi', icon: 'i'},
    warning: {title: 'Perhatian', icon: '!'}
  };

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function toast(message, options = {}) {
    if (!stack) {
      stack = make('div', 'edu-toast-stack');
      stack.setAttribute('aria-label', 'Notifikasi aplikasi');
      document.body.appendChild(stack);
    }
    const type = types[options.type] ? options.type : 'success';
    const settings = types[type];
    const duration = Math.max(3000, Number(options.duration) || (type === 'error' ? 10000 : 6000));
    const card = make('section', 'edu-toast');
    card.dataset.type = type;
    card.setAttribute('role', type === 'error' ? 'alert' : 'status');
    card.setAttribute('aria-atomic', 'true');
    card.style.setProperty('--duration', `${duration}ms`);
    const icon = make('div', 'edu-toast-icon', settings.icon);
    icon.setAttribute('aria-hidden', 'true');
    const content = make('div');
    content.append(make('h3', 'edu-toast-title', options.title || settings.title));
    content.append(make('p', 'edu-toast-message', String(message)));
    const close = make('button', 'edu-icon-button', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Tutup notifikasi');
    const progress = make('div', 'edu-toast-progress');
    progress.setAttribute('aria-hidden', 'true');
    card.append(icon, content, close, progress);
    stack.prepend(card);
    let remaining = duration;
    let started = Date.now();
    let timer;
    const remove = () => { clearTimeout(timer); card.remove(); };
    const resume = () => { started = Date.now(); timer = setTimeout(remove, remaining); };
    const pause = () => { clearTimeout(timer); remaining = Math.max(0, remaining - (Date.now() - started)); };
    close.addEventListener('click', remove);
    card.addEventListener('mouseenter', pause);
    card.addEventListener('mouseleave', resume);
    card.addEventListener('focusin', () => { pause(); progress.style.animationPlayState = 'paused'; });
    card.addEventListener('focusout', event => {
      if (!card.contains(event.relatedTarget)) { resume(); progress.style.animationPlayState = ''; }
    });
    resume();
    while (stack.children.length > 4) stack.lastElementChild.remove();
    return remove;
  }

  function finish(value) {
    if (!activeResolve) return;
    const resolve = activeResolve;
    activeResolve = null;
    dialog.close();
    document.body.style.overflow = previousOverflow;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    resolve(value);
  }

  function createDialog() {
    if (dialog) return;
    dialog = make('dialog', 'edu-dialog');
    dialog.setAttribute('aria-labelledby', 'edu-dialog-title');
    dialog.setAttribute('aria-describedby', 'edu-dialog-message');
    const body = make('div', 'edu-dialog-body');
    const top = make('div', 'edu-dialog-top');
    const icon = make('div', 'edu-dialog-icon', '?');
    icon.setAttribute('aria-hidden', 'true');
    const close = make('button', 'edu-icon-button', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Batalkan dan tutup');
    close.addEventListener('click', () => finish(false));
    top.append(icon, close);
    const title = make('h2'); title.id = 'edu-dialog-title';
    const message = make('p'); message.id = 'edu-dialog-message';
    body.append(top, title, message);
    const footer = make('div', 'edu-dialog-footer');
    const cancel = make('button', 'edu-dialog-button');
    cancel.type = 'button'; cancel.id = 'edu-dialog-cancel';
    const accept = make('button', 'edu-dialog-button edu-dialog-button-primary');
    accept.type = 'button'; accept.id = 'edu-dialog-accept';
    cancel.addEventListener('click', () => finish(false));
    accept.addEventListener('click', () => finish(true));
    footer.append(cancel, accept);
    dialog.append(body, footer);
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
    document.body.appendChild(dialog);
  }

  function ask(options = {}) {
    const job = () => new Promise(resolve => {
      createDialog();
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.dataset.danger = String(Boolean(options.danger));
      dialog.querySelector('.edu-dialog-icon').textContent = options.danger ? '!' : (options.icon || '?');
      dialog.querySelector('#edu-dialog-title').textContent = options.title || 'Konfirmasi tindakan';
      dialog.querySelector('#edu-dialog-message').textContent = options.message || 'Lanjutkan tindakan ini?';
      const cancel = dialog.querySelector('#edu-dialog-cancel');
      const accept = dialog.querySelector('#edu-dialog-accept');
      cancel.textContent = options.cancelText || 'Batal';
      accept.textContent = options.confirmText || 'Lanjutkan';
      activeResolve = resolve;
      dialog.showModal();
      cancel.focus();
    });
    const result = queue.then(job);
    queue = result.catch(() => false);
    return result;
  }

  return Object.freeze({toast, ask});
})();

/* ==================== UTILITAS ==================== */

/* -----------------------------------------------------------------
 * F02 | $
 * ----------------------------------------------------------------- */
const $ = selector => document.querySelector(selector);
/* -----------------------------------------------------------------
 * F03 | escapeHTML
 * ----------------------------------------------------------------- */
const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
/* -----------------------------------------------------------------
 * F04 | title
 * ----------------------------------------------------------------- */
const title = key => TITLES[key] || String(key || '').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
/* -----------------------------------------------------------------
 * F05 | dateText
 * ----------------------------------------------------------------- */
const dateText = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'});
};
/* -----------------------------------------------------------------
 * F06 | button
 * ----------------------------------------------------------------- */
const button = (text, action, attrs = '', kind = '') => `<button type="button" class="btn ${kind}" data-action="${action}" ${attrs}>${text}</button>`;
/* -----------------------------------------------------------------
 * F07 | badge
 * ----------------------------------------------------------------- */
const badge = (text, kind = '') => `<span class="badge ${kind}">${escapeHTML(text)}</span>`;
/* -----------------------------------------------------------------
 * F08 | field
 * ----------------------------------------------------------------- */
const field = (name, label, value = '', options = {}) => `
  <label class="field ${options.full ? 'span-2' : ''}">
    <span>${escapeHTML(label)}</span>
    <input name="${name}" type="${options.type || 'text'}" value="${escapeHTML(value)}"
      ${options.required ? 'required' : ''} ${options.disabled ? 'disabled' : ''}
      ${options.max ? `maxlength="${options.max}"` : ''}
      ${options.placeholder ? `placeholder="${escapeHTML(options.placeholder)}"` : ''}
      ${options.autocomplete ? `autocomplete="${options.autocomplete}"` : ''}>
  </label>`;
/* -----------------------------------------------------------------
 * F09 | selectField
 * ----------------------------------------------------------------- */
const selectField = (name, label, items, selected = '') => `
  <label class="field"><span>${escapeHTML(label)}</span><select name="${name}">
    ${items.map(item => {
      const value = typeof item === 'string' ? item : item.value;
      const text = typeof item === 'string' ? title(item) : item.text;
      return `<option value="${escapeHTML(value)}" ${value === selected ? 'selected' : ''}>${escapeHTML(text)}</option>`;
    }).join('')}
  </select></label>`;
/* -----------------------------------------------------------------
 * F10 | textarea
 * ----------------------------------------------------------------- */
const textarea = (name, label, placeholder = '') => `
  <label class="field"><span>${escapeHTML(label)}</span><textarea
    name="${escapeHTML(name)}"
    placeholder="${escapeHTML(placeholder)}"
    rows="${name === 'reference' ? 14 : 5}"
  ></textarea></label>`;
/* -----------------------------------------------------------------
 * F11 | check
 * ----------------------------------------------------------------- */
const check = (name, text, checked = false) => `
  <label class="check"><input name="${name}" type="checkbox" ${checked ? 'checked' : ''}>${escapeHTML(text)}</label>`;

/* -----------------------------------------------------------------
 * F12 | showToast
 * ----------------------------------------------------------------- */
function showToast(message, error = false) {
  const legacy = document.querySelector('#toast');
  if (legacy) legacy.hidden = true;
  EduNotify.toast(message, {type: error ? 'error' : 'success'});
}

/* -----------------------------------------------------------------
 * F13 | setBusy
 * ----------------------------------------------------------------- */
function setBusy(value, message = 'Memproses...') {
  state.busy = value;
  $('#loading').hidden = !value;
  $('#loading-message').textContent = message;
  $('#app').setAttribute('aria-busy', String(value));
}

/* -----------------------------------------------------------------
 * F14 | run
 * ----------------------------------------------------------------- */
async function run(task, message) {
  if (state.busy) return null;
  setBusy(true, message);
  try { return await task(); }
  catch (error) {
    showToast(error.message, true);
    if (error.code === 'AUTH') { clearSession(); renderLogin(); }
    return null;
  } finally { setBusy(false); }
}

/* -----------------------------------------------------------------
 * F15 | formValues
 * ----------------------------------------------------------------- */
function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }

/* ==================== KONEKSI GOOGLE APPS SCRIPT ==================== */

/* -----------------------------------------------------------------
 * F16 | api
 * ----------------------------------------------------------------- */
async function api(action, params = {}) {
  if (CONFIG.API_URL.includes('GANTI_ID_DEPLOYMENT')) {
    throw new Error('Isi CONFIG.API_URL di app.js dengan URL deployment Google Apps Script yang berakhiran /exec.');
  }
  let response;
  try {
    response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      redirect: 'follow',
      credentials: 'omit',
      body: JSON.stringify({action, params, token: state.token})
    });
  } catch (_) {
    throw new Error('Koneksi backend gagal. Periksa internet, URL /exec, izin deployment Anyone, dan konsol browser. Jangan kirim ulang generate sebelum memastikan proses sebelumnya selesai.');
  }
  if (!response.ok) throw new Error(`Backend gagal diakses (HTTP ${response.status}).`);
  let result;
  try { result = await response.json(); }
  catch (_) { throw new Error('Respons bukan JSON. Periksa URL /exec dan akses deployment, bukan URL editor atau /dev.'); }
  if (!result || result.success !== true) {
    const error = new Error((result && result.message) || 'Permintaan gagal.');
    error.code = result && result.code;
    throw error;
  }
  return result.data;
}

/* ==================== LOGIN & SESI ==================== */

/* -----------------------------------------------------------------
 * F17 | clearSession
 * ----------------------------------------------------------------- */
function clearSession() {
  sessionStorage.removeItem(CONFIG.SESSION_KEY);
  state.token = '';
  state.user = null;
  state.editor = null;
  state.dirty = false;
  document.body.classList.remove('menu-open');
}

/* -----------------------------------------------------------------
 * F18 | renderLogin
 * ----------------------------------------------------------------- */
function renderLogin() {
  $('#app').innerHTML = `
    <main class="login" id="content">
      <section class="login-hero">
    
        <!-- Identitas aplikasi dan kredit pengembang pada halaman login -->
<div class="login-brand">
  <span class="brand-mark" aria-hidden="true">✦</span>

  <div class="login-brand-text">
    <span class="login-brand-name">EduPlan AI</span>

    <a
      class="login-developer-credit"
      href="https://www.tiktok.com/@putramadasa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buka TikTok Arom Kobama, @putramadasa"
    >
      Developed by <span>Arom Kobama</span>
    </a>
  </div>
</div>
    
        <span class="eyebrow">RUANG KERJA PENDIDIK</span>
        <h1>Lebih sedikit administrasi.<br>Lebih banyak inspirasi.</h1>
        <p>Susun perangkat ajar, rencanakan pembelajaran, dan kelola dokumen dalam satu ruang kerja.</p>
        <div class="login-points"><span>40 generator</span><span>3 provider AI</span><span>Google Drive</span></div>
      </section>
      <section class="login-panel">
        <div class="login-box">
          <h1>Selamat datang 👋</h1>
          <p class="muted">Masuk menggunakan email yang sudah didaftarkan admin.</p>
          <form data-form="login">
            ${field('email', 'Alamat email', '', {type: 'email', required: true, max: 254, autocomplete: 'email', placeholder: 'nama@sekolah.sch.id'})}
            <button type="submit" class="btn btn-primary full">Masuk ke ruang kerja →</button>
          </form>
          <div class="notice">Masuk menggunakan email terdaftar tanpa OTP atau kata sandi. Demi keamanan, gunakan aplikasi hanya di lingkungan tepercaya. Akses melalui email terdaftar tidak memverifikasi identitas pengguna.</div>
          <div class="login-footer">EduPlan AI · Draf cerdas, tetap ditinjau guru</div>
        </div>
      </section>
    </main>`;
}

/* -----------------------------------------------------------------
 * F19 | login
 * ----------------------------------------------------------------- */
async function login(form) {
  const values = formValues(form);
  await run(async () => {
    const session = await api('login', {email: values.email.trim().toLowerCase()});
    state.token = session.token;
    sessionStorage.setItem(CONFIG.SESSION_KEY, state.token);
    applyBoot(await api('boot'));
    renderShell();
    renderDashboard();
  }, 'Memeriksa email...');
}

/* -----------------------------------------------------------------
 * F20 | applyBoot
 * ----------------------------------------------------------------- */
function applyBoot(data) {
  Object.assign(state, {user: data.user, catalog: data.catalog, providers: data.providers, documents: data.documents, usage: data.usage});
}

/* -----------------------------------------------------------------
 * F21 | logout
 * ----------------------------------------------------------------- */
async function logout() {
  if (!(await mayLeave())) return;
  const accepted = await EduNotify.ask({
    title: 'Keluar dari ruang kerja?',
    message: 'Dokumen yang sudah disimpan tetap tersedia saat Anda masuk kembali.',
    confirmText: 'Ya, keluar', cancelText: 'Tetap di sini', icon: '↪'
  });
  if (!accepted) return;
  await run(async () => {
    try { await api('logout'); }
    finally { clearSession(); renderLogin(); }
  }, 'Keluar...');
}

/* ==================== SHELL & NAVIGASI ==================== */

/* -----------------------------------------------------------------
 * F22 | navItem
 * ----------------------------------------------------------------- */
function navItem(route, text, icon, extra = '') {
  return `<button type="button" class="nav-item" data-action="navigate" data-route="${route}" ${extra}>
    <span class="nav-icon" aria-hidden="true">${icon}</span>${escapeHTML(text)}</button>`;
}


/* =========================================================
   AVATAR PERAN PENGGUNA
   Admin: perisai. Guru: pengguna dengan buku.
   ========================================================= */

/* -----------------------------------------------------------------
 * F23 | renderRoleAvatar
 * ----------------------------------------------------------------- */
function renderRoleAvatar(role) {
  const isAdmin = role === 'admin';
  const roleLabel = isAdmin ? 'Administrator' : 'Guru';

  const adminIcon = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3 4.5 6v5.2c0 4.3 3 7.8 7.5 9.8
           4.5-2 7.5-5.5 7.5-9.8V6L12 3Z"
      />
      <path d="m8.5 11.8 2.3 2.3 4.7-4.8" />
    </svg>
  `;

  const teacherIcon = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M7.5 11a5.5 5.5 0 0 1 9 0" />
      <path
        d="M3.5 12.5c3-.7 5.8-.1 8.5 1.7
           2.7-1.8 5.5-2.4 8.5-1.7v7
           c-3-.7-5.8-.1-8.5 1.5
           -2.7-1.6-5.5-2.2-8.5-1.5v-7Z"
      />
      <path d="M12 14.2V21" />
    </svg>
  `;

  return `
    <span
      class="role-avatar ${
        isAdmin ? 'role-avatar-admin' : 'role-avatar-teacher'
      }"
      role="img"
      aria-label="${roleLabel}"
      title="${roleLabel}"
    >
      ${isAdmin ? adminIcon : teacherIcon}
    </span>
  `;
}


/* -----------------------------------------------------------------
 * F24 | renderShell
 * ----------------------------------------------------------------- */
function renderShell() {
  const user = state.user;
  const categories = Object.entries(state.catalog).map(([key, value]) => navItem('category', value.title, value.icon, `data-category="${key}"`)).join('');
  const admin = user.role === 'admin' ? `
    <div class="nav-title">ADMINISTRATOR</div>
    ${navItem('users', 'Manajemen pengguna', '♙')}
    ${navItem('settings', 'Pengaturan AI & kuota', '⚙')}
    ${navItem('logs', 'Log aktivitas', '≡')}` : '';
  $('#app').innerHTML = `
    <button class="backdrop" type="button" data-action="close-menu" aria-label="Tutup menu"></button>
    <aside class="sidebar" aria-label="Menu utama">
  
  
     <!-- Identitas aplikasi: logo di kiri, dua baris teks di kanan -->
<div class="brand-block">
  <span class="brand-mark" aria-hidden="true">✦</span>

  <div class="brand-text">
    <span class="brand-name">
      EduPlan <span class="brand-ai">AI</span>
    </span>

    <a
      class="developer-credit"
      href="https://www.tiktok.com/@putramadasa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buka TikTok Arom Kobama, @putramadasa"
    >
      Developed by <span>Arom Kobama</span>
    </a>
  </div>
</div>
     

   <nav>
        <div class="nav-title">RUANG KERJA</div>
        ${navItem('dashboard', 'Dashboard', '◈')}${categories}
        <div class="nav-title">DOKUMEN</div>
        ${navItem('history', 'Riwayat dokumen', '◷')}
        ${navItem('favorites', 'Favorit', '☆')}
        ${navItem('trash', 'Sampah', '♧')}
        ${navItem('profile', 'Profil guru & sekolah', '◎')}
        ${admin}
        <div class="nav-title">LAINNYA</div>
        ${navItem('help', 'Panduan penggunaan', '?')}
        <button type="button" class="nav-item" data-action="theme"><span class="nav-icon">◐</span>Ganti tema</button>
        <button type="button" class="nav-item" data-action="logout"><span class="nav-icon">↪</span>Keluar</button>
      </nav>
      <div class="sidebar-footer">Hasil AI adalah draf. Tinjau kembali isi dan rujukan sebelum digunakan.</div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="row">
          ${button('☰', 'toggle-menu', 'aria-label="Buka menu"', 'btn-outline btn-icon mobile-only')}
          <div class="breadcrumb">Workspace / <span id="breadcrumb">Dashboard</span></div>
        </div>
        <div class="user-chip">
  ${renderRoleAvatar(user.role)}

  <div class="user-label">
    <span>${escapeHTML(user.name)}</span>

    <small>
      ${user.role === 'admin' ? 'Administrator' : 'Guru'}
    </small>
  </div>
</div>
      </header>
      <div class="content" id="content" tabindex="-1"></div>
    </main>`;
}

/* -----------------------------------------------------------------
 * F25 | setRoute
 * ----------------------------------------------------------------- */
function setRoute(route, text, category = '') {
  state.route = route;
  state.category = category;
  $('#breadcrumb').textContent = text;
  document.body.classList.remove('menu-open');
  document.querySelectorAll('.nav-item[data-route]').forEach(item => {
    const active = item.dataset.route === route && (route !== 'category' || item.dataset.category === category);
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
}

/* -----------------------------------------------------------------
 * F26 | mayLeave
 * ----------------------------------------------------------------- */
async function mayLeave() {
  if (!state.dirty) return true;
  const accepted = await EduNotify.ask({
    title: 'Perubahan belum disimpan',
    message: 'Dokumen ini memiliki perubahan yang belum disimpan. Jika Anda meninggalkan editor, perubahan tersebut akan hilang.',
    confirmText: 'Tinggalkan editor',
    cancelText: 'Kembali mengedit',
    danger: true
  });
  if (accepted) state.dirty = false;
  return accepted;
}

/* -----------------------------------------------------------------
 * F27 | navigate
 * ----------------------------------------------------------------- */
async function navigate(route, category = '') {
  if (!(await mayLeave())) return;
  if (route === 'dashboard') return renderDashboard();
  if (route === 'category') return renderCategory(category);
  if (route === 'profile') return renderProfile();
  if (route === 'help') return renderHelp();
  if (['history', 'favorites', 'trash'].includes(route)) {
    await run(async () => {
      state.documents = await api('listDocuments');
      state.filters = {query: '', type: '', provider: '', page: 1};
      renderHistory(route);
    }, 'Memuat dokumen...');
    return;
  }
  if (['users', 'settings', 'logs'].includes(route)) {
    await run(async () => {
      state.admin = await api('adminData');
      if (route === 'users') renderUsers();
      if (route === 'settings') renderSettings();
      if (route === 'logs') renderLogs();
    }, 'Memuat data admin...');
  }
}

/* -----------------------------------------------------------------
 * F28 | pageHead
 * ----------------------------------------------------------------- */
function pageHead(heading, description) {
  return `<div class="page-head"><h1>${escapeHTML(heading)}</h1><p>${escapeHTML(description)}</p></div>`;
}

/* ==================== DASHBOARD & KATEGORI ==================== */

/* -----------------------------------------------------------------
 * F29 | renderDashboard
 * ----------------------------------------------------------------- */
function renderDashboard() {
  setRoute('dashboard', 'Dashboard');
  const documents = state.documents.filter(doc => !doc.deleted);
  const stats = [
    ['Dokumen tersimpan', documents.length],
    ['Provider AI aktif', state.providers.length],
    ['Percobaan generate hari ini', `${state.usage.used} / ${state.usage.limit}`]
  ];
  const cards = Object.entries(state.catalog).map(([key, category]) => `
    <button type="button" class="card tile" data-action="navigate" data-route="category" data-category="${key}">
      <span class="tile-icon">${category.icon}</span>
      <h2>${escapeHTML(category.title)}</h2>
      <p>${category.items.length} jenis dokumen untuk mendukung kegiatan pembelajaran.</p>
      <span class="tile-link">Buka generator →</span>
    </button>`).join('');
  $('#content').innerHTML = `<div class="stack">
    <section class="hero">
      <span class="eyebrow">ASISTEN PERANGKAT AJAR</span>
      <h1>Selamat berkarya, ${escapeHTML(state.user.name)}.</h1>
      <p>Mulai dari perencanaan hingga refleksi. Buat draf perangkat ajar, sesuaikan isinya, lalu simpan dalam satu ruang kerja.</p>
      ${button('✦ Buat dokumen baru', 'navigate', 'data-route="category" data-category="perencanaan"')}
    </section>
    <div class="grid">${stats.map(([name, value]) => `<div class="card"><div class="stat-label">${name}</div><div class="stat-number">${escapeHTML(value)}</div></div>`).join('')}</div>
    <section><h2 class="section-title">Apa yang ingin Anda buat?</h2><div class="grid">${cards}</div></section>
    <div class="notice">Verifikasi CP, regulasi, perhitungan, dan kalender pendidikan sebelum dipakai. Hindari memasukkan data pribadi siswa ke layanan AI.</div>
  </div>`;
}

/* -----------------------------------------------------------------
 * F30 | renderCategory
 * ----------------------------------------------------------------- */
function renderCategory(key) {
  const category = state.catalog[key];
  if (!category) return;
  setRoute('category', category.title, key);
  $('#content').innerHTML = `
    ${pageHead(category.title, 'Pilih jenis dokumen yang ingin disusun.')}
    <div class="toolbar mb-20"><input id="type-search" aria-label="Cari jenis dokumen" placeholder="Cari jenis dokumen..."></div>
    <div class="grid" id="type-grid">
      ${category.items.map(type => `
        <button type="button" class="card tile" data-action="generator" data-type="${type}" data-search="${escapeHTML(title(type).toLowerCase())}">
          <span class="tile-icon">✦</span><h2>${escapeHTML(title(type))}</h2>
          <p>Susun draf ${escapeHTML(title(type).toLowerCase())} berdasarkan materi dan konteks sekolah Anda.</p>
          <span class="tile-link">Buat sekarang →</span>
        </button>`).join('')}
    </div>`;
}

/* ==================== FORM GENERATOR ==================== */

/* -----------------------------------------------------------------
 * F31 | getReferenceExample
 * ----------------------------------------------------------------- */
function getReferenceExample(type) {
  // Tambahkan kode menu katalog lain di sini tanpa mengubah renderGenerator.
  const examples = {
  "rpp": [
    "TP: Peserta didik mampu membandingkan dua pecahan dengan penyebut berbeda menggunakan gambar dan menjelaskan alasannya.",
    "Kondisi awal: Peserta didik mengenal pembilang dan penyebut, tetapi sebagian masih kesulitan membandingkan nilai pecahan.",
    "CP / sumber: [Tempelkan kutipan CP resmi yang sesuai, judul dokumen, instansi penerbit, dan tahun.]"
  ],
  "modul_ajar": [
    "TP: Peserta didik mampu menjelaskan perubahan wujud benda berdasarkan hasil pengamatan.",
    "Data anonim: Dari 30 peserta didik, 20 sudah mengenali benda padat, cair, dan gas; 10 masih memerlukan contoh konkret.",
    "Konteks: Pengamatan es yang mencair.",
    "CP / sumber: [Tempelkan kutipan CP resmi yang sesuai beserta sumbernya.]"
  ],
  "atp": [
    "CP resmi: [Tempelkan kutipan CP sesuai mata pelajaran dan fase beserta sumbernya.]",
    "Urutan TP awal:\n1. Mengenali pembilang dan penyebut.\n2. Merepresentasikan pecahan menggunakan gambar.\n3. Membandingkan pecahan berpenyebut sama.\n4. Membandingkan pecahan berpenyebut berbeda.",
    "Kemampuan awal: Peserta didik memahami pembagian benda menjadi bagian yang sama besar."
  ],
  "cp_rujukan": [
    "Mata pelajaran: Matematika\nFase: B\nElemen: [Isi sesuai dokumen resmi.]",
    "Kutipan CP: [Tempelkan teks CP dari dokumen resmi yang Anda gunakan.]",
    "Sumber: [Judul dokumen, instansi penerbit, tahun, dan halaman atau bagian.]\nTautan: [Tambahkan jika tersedia.]",
    "Ganti bagian dalam tanda kurung siku dengan sumber yang sebenarnya."
  ],
  "tp": [
    "CP resmi: [Tempelkan kutipan CP yang menjadi dasar penyusunan TP beserta sumbernya.]",
    "Fokus materi: Pecahan sederhana.",
    "Kemampuan awal: Peserta didik sudah mengenal pembilang dan penyebut.",
    "Kemampuan yang dituju: Membandingkan dua pecahan dan menjelaskan strategi yang digunakan."
  ],
  "kktp": [
    "TP: Peserta didik mampu menulis satu paragraf deskripsi tentang benda di sekitarnya.",
    "Bukti belajar: Paragraf deskripsi hasil tulisan peserta didik.",
    "Aspek penilaian:\n1. Kejelasan objek.\n2. Kerincian ciri objek.\n3. Keruntutan kalimat.\n4. Ketepatan ejaan dan tanda baca.",
    "Kondisi kelas: Sebagian peserta didik memerlukan bantuan mengembangkan kalimat."
  ],
  "lkpd": [
    "TP: Peserta didik mampu mengelompokkan benda berdasarkan sifat bahan penyusunnya.",
    "Kegiatan: Mengamati benda di kelas secara berkelompok.",
    "Bahan: Kertas, kain, sendok logam, dan penggaris plastik.",
    "Kemampuan awal: Peserta didik mengenal nama benda, tetapi belum terbiasa menjelaskan sifat bahannya.",
    "CP / sumber: [Tempelkan kutipan sumber yang relevan jika diperlukan.]"
  ],
  "prota": [
    "Mata pelajaran: Matematika\nKelas / fase: IV / B",
    "Contoh data waktu: Semester ganjil 18 minggu efektif; semester genap 17 minggu efektif; alokasi 5 JP per minggu. Sesuaikan dengan kalender sekolah.",
    "Lingkup materi: Bilangan, pecahan, pengukuran, dan geometri.",
    "CP / daftar TP: [Tempelkan acuan yang digunakan.]",
    "Kalender pendidikan: [Tempelkan data minggu efektif, libur, dan kegiatan sekolah yang telah diperiksa.]"
  ],
  "promes": [
    "Semester: Ganjil",
    "Contoh data waktu: 18 minggu efektif dan 5 JP per minggu. Sesuaikan dengan kalender sekolah.",
    "Materi / TP:\n1. Bilangan: [TP dan alokasi waktu.]\n2. Pecahan: [TP dan alokasi waktu.]",
    "Kegiatan sekolah / libur: [Cantumkan jadwal yang memengaruhi pembelajaran.]",
    "Rujukan: [Tempelkan bagian Prota, ATP, dan kalender yang digunakan.]"
  ],
  "distribusi_tp": [
    "Semester: Ganjil",
    "Contoh waktu tersedia: 18 minggu efektif dan 5 JP per minggu. Sesuaikan dengan kondisi sekolah.",
    "Daftar TP:\nTP 1: Mengenali pembilang dan penyebut.\nTP 2: Merepresentasikan pecahan menggunakan gambar.\nTP 3: Membandingkan pecahan berpenyebut sama.\nTP 4: Membandingkan pecahan berpenyebut berbeda.",
    "Prioritas: Berikan waktu lebih banyak untuk TP 4.",
    "Rujukan: [Tempelkan ATP dan data kalender sekolah yang digunakan.]"
  ]
};
  const fallback = [
    'TP: Peserta didik mampu membandingkan dua pecahan dan menjelaskan alasannya.',
    'Data anonim: Dari 30 peserta didik, 18 sudah memahami materi, 8 memerlukan latihan tambahan, dan 4 memerlukan pendampingan.',
    'CP / rujukan resmi: [Tempelkan kutipan sumber yang relevan, judul dokumen, instansi penerbit, dan tahun.]',
    'Pilih hanya bagian yang sesuai dengan jenis dokumen ini.'
  ];
  const parts = Object.prototype.hasOwnProperty.call(examples, type) ? examples[type] : fallback;
  return [
    `Contoh isian untuk ${title(type)}:`,
    ...parts,
    'Contoh ini hanya ilustrasi. Ganti dengan konteks Anda; jangan masukkan identitas pribadi peserta didik.'
  ].join('\n\n');
}

/* -----------------------------------------------------------------
 * F32 | renderGenerator
 * ----------------------------------------------------------------- */
async function renderGenerator(type) {
  if (!(await mayLeave())) return;
  state.generatorType = type;
  setRoute('generator', `Generator / ${title(type)}`);
  const providers = state.providers.map(p => ({value: p.id, text: `${title(p.id)} · ${p.model}`}));
  const noProvider = providers.length === 0;
  document.querySelector('#content').innerHTML = `<div class="stack">
    ${pageHead(`Generator ${title(type)}`, 'Lengkapi konteks pembelajaran agar draf lebih relevan.')}
    <div class="notice">Isian dikirim ke provider pilihan Anda. Gunakan data anonim dan rujukan terverifikasi.</div>
    <form class="card" data-form="generate">
      <h2>Konteks dokumen</h2>
      <div class="form-grid">
        ${field('subject', 'Mata pelajaran *', '', {required: true, max: 150})}
        ${field('level', 'Jenjang / kelas / fase *', '', {required: true, max: 100})}
        ${field('topic', 'Materi / topik *', '', {required: true, max: 200})}
        ${field('year', 'Tahun ajaran', '', {max: 40})}
        ${selectField('semester', 'Semester', ['Ganjil', 'Genap'])}
        ${field('duration', 'Alokasi waktu / pertemuan', '', {max: 150})}
        ${field('curriculum', 'Kurikulum', '', {max: 150})}
        ${selectField('provider', 'Provider AI', providers)}
      </div>
      ${textarea('reference', 'CP / TP / rujukan resmi / data anonim', getReferenceExample(type))}
      <p class="muted">Contoh di dalam kolom hanya ilustrasi, bukan kutipan CP resmi. Sesuaikan dengan konteks Anda dan jangan masukkan identitas pribadi peserta didik.</p>
      ${textarea('instructions', 'Format / kebutuhan khusus / jumlah soal / catatan', 'Contoh: 10 soal pilihan ganda beserta pembahasan.')}
      <p class="muted">Guru: ${escapeHTML(state.user.name)} · Sekolah: ${escapeHTML(state.user.school || '[belum diisi]')}</p>
      <div class="row"><button class="btn btn-primary" type="submit" ${noProvider ? 'disabled' : ''}>✦ Generate & simpan draf</button>
        ${button('Profil guru & sekolah', 'navigate', 'data-route="profile"', 'btn-outline')}</div>
      ${noProvider ? '<p class="notice mt-20">Belum ada provider aktif. Hubungi admin.</p>' : ''}
    </form>
  </div>`;
}

/* -----------------------------------------------------------------
 * F33 | generate
 * ----------------------------------------------------------------- */
async function generate(form) {
  const params = {...formValues(form), type: state.generatorType};
  await run(async () => {
    const result = await api('generate', params);
    state.editor = {doc: result.doc, text: result.text};
    state.usage = result.usage;
    state.documents.unshift(result.doc);
    state.dirty = false;
    renderEditor();
    showToast('Draf berhasil dibuat dan disimpan. Tinjau kembali sebelum digunakan.');
  }, 'AI sedang menyusun dokumen. Proses ini dapat memerlukan waktu...');
}

/* ==================== EDITOR & DOWNLOAD ==================== */

/* -----------------------------------------------------------------
 * F34 | openDocument
 * ----------------------------------------------------------------- */
async function openDocument(id) {
  if (!(await mayLeave())) return;
  await run(async () => {
    state.editor = await api('readDocument', {id});
    state.dirty = false;
    renderEditor();
  }, 'Membuka dokumen...');
}

/* -----------------------------------------------------------------
 * F35 | renderEditor
 * ----------------------------------------------------------------- */
function renderEditor() {
  setRoute('editor', 'Editor dokumen');
  const doc = state.editor.doc;
  $('#content').innerHTML = `<div class="stack">
    <div class="row between">
      <div><h1>Editor dokumen</h1><p class="muted mb-0">${escapeHTML(title(doc.type))} · ${escapeHTML(doc.provider)} · ${escapeHTML(doc.owner)}</p></div>
      ${button('← Riwayat', 'navigate', 'data-route="history"', 'btn-outline')}
    </div>
    <div class="notice">Ekspor menggunakan teks sederhana. Tabel kompleks, kop surat, dan slide tidak diformat otomatis. Simpan perubahan sebelum menutup halaman.</div>
    <form class="card" data-form="save-document">
      ${field('title', 'Judul dokumen', doc.title, {required: true, max: 180})}
      <div class="row mb-20">
        <button class="btn btn-primary" type="submit">Simpan perubahan</button>
        ${button('Unduh PDF', 'export', 'data-format="pdf"')}
        ${button('Unduh Word', 'export', 'data-format="docx"')}
        ${button('Unduh TXT', 'export', 'data-format="txt"', 'btn-outline')}
        ${button('Salin teks', 'copy', '', 'btn-outline')}
      </div>
      <label class="field"><span>Isi dokumen</span><textarea class="editor" name="text" id="editor-text" maxlength="150000"></textarea></label>
      <div class="row between"><small id="editor-status" class="muted">Tersimpan · revisi ${doc.revision}</small><small class="muted">Maksimum 150.000 karakter</small></div>
    </form>
  </div>`;
  $('#editor-text').value = state.editor.text;
}

/* -----------------------------------------------------------------
 * F36 | editorValues
 * ----------------------------------------------------------------- */
function editorValues() {
  const values = formValues($('[data-form="save-document"]'));
  return {id: state.editor.doc.id, revision: state.editor.doc.revision, title: values.title, text: values.text};
}

/* -----------------------------------------------------------------
 * F37 | syncDocument
 * ----------------------------------------------------------------- */
function syncDocument(doc) {
  const index = state.documents.findIndex(d => d.id === doc.id);
  if (index >= 0) state.documents[index] = doc;
}

/* -----------------------------------------------------------------
 * F38 | persistEditor
 * ----------------------------------------------------------------- */
async function persistEditor() {
  const values = editorValues();
  const doc = await api('saveDocument', values);
  state.editor = {doc, text: values.text};
  state.dirty = false;
  syncDocument(doc);
  $('#editor-status').textContent = `Tersimpan · revisi ${doc.revision}`;
}

/* -----------------------------------------------------------------
 * F39 | saveDocument
 * ----------------------------------------------------------------- */
async function saveDocument() {
  await run(async () => { await persistEditor(); showToast('Perubahan disimpan.'); }, 'Menyimpan dokumen...');
}

/* -----------------------------------------------------------------
 * F40 | downloadBlob
 * ----------------------------------------------------------------- */
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name.replace(/[\\/:*?"<>|]/g, '-');
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* -----------------------------------------------------------------
 * F41 | exportDocument
 * ----------------------------------------------------------------- */
async function exportDocument(format) {
  await run(async () => {
    if (state.dirty) await persistEditor();
    if (format === 'txt') {
      downloadBlob(new Blob([state.editor.text], {type: 'text/plain;charset=utf-8'}), `${state.editor.doc.title}.txt`);
      return;
    }
    const result = await api('exportDocument', {id: state.editor.doc.id, format});
    const bytes = Uint8Array.from(atob(result.base64), character => character.charCodeAt(0));
    downloadBlob(new Blob([bytes], {type: result.mime}), result.name);
    showToast('File siap diunduh.');
  }, 'Menyiapkan file unduhan...');
}

/* -----------------------------------------------------------------
 * F42 | copyDocument
 * ----------------------------------------------------------------- */
async function copyDocument() {
  try {
    await navigator.clipboard.writeText(document.querySelector('#editor-text').value);
    showToast('Teks dokumen berhasil disalin.');
  } catch (_) {
    document.querySelector('#editor-text').select();
    EduNotify.toast('Tekan Ctrl+C atau gunakan menu salin pada perangkat Anda.', {type: 'info'});
  }
}

/* ==================== RIWAYAT, FAVORIT, SAMPAH ==================== */

/* -----------------------------------------------------------------
 * F43 | renderHistory
 * ----------------------------------------------------------------- */
function renderHistory(mode) {
  const names = {history: 'Riwayat dokumen', favorites: 'Favorit', trash: 'Sampah'};
  setRoute(mode, names[mode]);
  const types = Object.values(state.catalog).flatMap(category => category.items);
  $('#content').innerHTML = `<div class="stack">
    ${pageHead(names[mode], state.user.role === 'admin' ? 'Admin dapat mengelola dokumen seluruh pengguna.' : 'Kelola dokumen milik akun Anda.')}
    <div class="toolbar">
      <input id="doc-search" aria-label="Cari dokumen" placeholder="Cari judul, pemilik, atau jenis...">
      <select id="doc-type" aria-label="Filter jenis"><option value="">Semua jenis</option>${types.map(type => `<option value="${type}">${escapeHTML(title(type))}</option>`).join('')}</select>
      <select id="doc-provider" aria-label="Filter provider"><option value="">Semua provider</option><option value="gemini">Gemini</option><option value="openai">OpenAI</option><option value="claude">Claude</option></select>
      ${button('↻ Muat ulang', 'refresh-documents', '', 'btn-outline')}
    </div>
    <div id="document-results"></div>
  </div>`;
  $('#doc-search').value = state.filters.query;
  $('#doc-type').value = state.filters.type;
  $('#doc-provider').value = state.filters.provider;
  renderDocumentResults();
}

/* -----------------------------------------------------------------
 * F44 | renderDocumentResults
 * ----------------------------------------------------------------- */
function renderDocumentResults() {
  const f = state.filters;
  const mode = state.route;
  const docs = state.documents.filter(doc => {
    const visible = mode === 'trash' ? doc.deleted : !doc.deleted;
    return visible && (mode !== 'favorites' || doc.favorite) && (!f.type || doc.type === f.type) &&
      (!f.provider || doc.provider === f.provider) &&
      [doc.title, doc.owner, title(doc.type)].join(' ').toLowerCase().includes(f.query.toLowerCase());
  });
  const pages = Math.max(1, Math.ceil(docs.length / CONFIG.PAGE_SIZE));
  f.page = Math.min(Math.max(1, f.page), pages);
  const shown = docs.slice((f.page - 1) * CONFIG.PAGE_SIZE, f.page * CONFIG.PAGE_SIZE);
  if (!shown.length) {
    $('#document-results').innerHTML = '<div class="card empty"><div class="empty-icon">▤</div><h2>Belum ada dokumen</h2><p>Dokumen yang sesuai akan muncul di sini.</p></div>';
    return;
  }
  const rows = shown.map(doc => `
    <tr>
      <td class="doc-title"><strong>${escapeHTML(doc.title)}</strong><br><small class="muted">${escapeHTML(doc.owner)}</small></td>
      <td>${badge(title(doc.type))}<br><small class="muted">${escapeHTML(title(doc.provider))}</small></td>
      <td class="nowrap"><small>${escapeHTML(dateText(doc.updated))}</small></td>
      <td><div class="actions">
        ${mode === 'trash'
          ? button('Pulihkan', 'trash-document', `data-id="${doc.id}" data-value="false"`, 'btn-small')
          : `${button('Buka', 'open-document', `data-id="${doc.id}"`, 'btn-small')}
             ${button(doc.favorite ? '★' : '☆', 'favorite-document', `data-id="${doc.id}" data-value="${!doc.favorite}" aria-label="Ubah favorit"`, 'btn-small')}
             ${button('Sampah', 'trash-document', `data-id="${doc.id}" data-value="true"`, 'btn-small btn-danger')}`}
      </div></td>
    </tr>`).join('');
  $('#document-results').innerHTML = `
    <div class="card table-wrap"><table>
      <thead><tr><th>DOKUMEN</th><th>JENIS / PROVIDER</th><th>DIPERBARUI</th><th>AKSI</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="row between pager"><small class="muted">${docs.length} dokumen · Halaman ${f.page} dari ${pages}</small>
      <div class="row">${button('←', 'page', `data-page="${f.page - 1}" ${f.page <= 1 ? 'disabled' : ''}`, 'btn-small')}
      ${button('→', 'page', `data-page="${f.page + 1}" ${f.page >= pages ? 'disabled' : ''}`, 'btn-small')}</div>
    </div></div>`;
}

/* -----------------------------------------------------------------
 * F45 | mutateDocument
 * ----------------------------------------------------------------- */
async function mutateDocument(action, id, value) {
  if (action === 'trashDocument') {
    const accepted = await EduNotify.ask({
      title: value ? 'Pindahkan ke sampah?' : 'Pulihkan dokumen?',
      message: value
        ? 'Dokumen akan dipindahkan ke sampah, bukan dihapus permanen. Anda dapat memulihkannya nanti.'
        : 'Dokumen akan dikembalikan ke riwayat dan dapat dibuka kembali.',
      confirmText: value ? 'Pindahkan ke sampah' : 'Pulihkan dokumen',
      cancelText: 'Batal', danger: value
    });
    if (!accepted) return;
  }
  await run(async () => {
    const doc = await api(action, {id, value});
    syncDocument(doc);
    renderDocumentResults();
    showToast(action === 'trashDocument'
      ? (value ? 'Dokumen dipindahkan ke sampah.' : 'Dokumen berhasil dipulihkan.')
      : (value ? 'Dokumen ditambahkan ke favorit.' : 'Dokumen dihapus dari favorit.'));
  }, 'Memperbarui dokumen...');
}

/* ==================== PROFIL ==================== */

/* -----------------------------------------------------------------
 * F46 | renderProfile
 * ----------------------------------------------------------------- */
function renderProfile() {
  setRoute('profile', 'Profil guru & sekolah');
  $('#content').innerHTML = `<div class="stack">
    ${pageHead('Profil guru & sekolah', 'Identitas ini digunakan sebagai konteks saat membuat dokumen.')}
    <form class="card" data-form="profile">
      <div class="form-grid">
        ${field('name', 'Nama guru', state.user.name, {required: true, max: 100})}
        ${field('school', 'Nama sekolah', state.user.school, {max: 200})}
        ${field('email', 'Email akun', state.user.email, {disabled: true})}
        ${field('role', 'Peran', state.user.role, {disabled: true})}
      </div>
      <p class="muted">Email akun tidak dapat diganti. Peran dan status akun dikelola admin.</p>
      <button class="btn btn-primary" type="submit">Simpan profil</button>
    </form>
  </div>`;
}

/* -----------------------------------------------------------------
 * F47 | saveProfile
 * ----------------------------------------------------------------- */
async function saveProfile(form) {
  await run(async () => {
    state.user = await api('saveProfile', formValues(form));
    renderShell(); renderProfile(); showToast('Profil disimpan.');
  }, 'Menyimpan profil...');
}

/* ==================== ADMIN: PENGGUNA ==================== */

/* -----------------------------------------------------------------
 * F48 | renderUsers
 * ----------------------------------------------------------------- */
function renderUsers() {
  setRoute('users', 'Manajemen pengguna');
  const users = state.admin.users;
  const rows = users.map(user => `
    <tr>
      <td><strong>${escapeHTML(user.name)}</strong><br><small class="muted">${escapeHTML(user.school)}</small></td>
      <td>${escapeHTML(user.email)}</td><td>${badge(user.role)}</td>
      <td>${badge(user.active ? 'Aktif' : 'Nonaktif', user.active ? 'badge-success' : 'badge-danger')}</td>
      <td>${button('Ubah', 'edit-user', `data-id="${user.id}"`, 'btn-small')}</td>
    </tr>`).join('');
  $('#content').innerHTML = `<div class="stack">
    ${pageHead('Manajemen pengguna', 'Daftarkan email guru/admin. Hanya akun aktif yang dapat masuk.')}
    <div class="notice">Login tidak memverifikasi kepemilikan email. Orang yang mengetahui email admin dapat masuk sebagai admin. Gunakan hanya untuk lingkungan tepercaya.</div>
    <form class="card" data-form="user" id="user-form">
      <h2 id="user-form-heading">Tambah akun</h2>
      <input type="hidden" name="id" value="">
      <div class="form-grid">
        ${field('email', 'Email', '', {type: 'email', required: true, max: 254})}
        ${field('name', 'Nama', '', {required: true, max: 100})}
        ${selectField('role', 'Peran', ['guru', 'admin'])}
        ${field('school', 'Sekolah', '', {max: 200})}
      </div>
      ${check('active', 'Akun aktif', true)}
      <div class="row"><button class="btn btn-primary" type="submit">Simpan akun</button>${button('Form baru', 'new-user', '', 'btn-outline')}</div>
    </form>
    <div class="card table-wrap"><table><thead><tr><th>NAMA / SEKOLAH</th><th>EMAIL</th><th>PERAN</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

/* -----------------------------------------------------------------
 * F49 | editUser
 * ----------------------------------------------------------------- */
function editUser(id) {
  const user = state.admin.users.find(item => item.id === id);
  if (!user) return;
  const form = $('#user-form');
  ['id', 'email', 'name', 'school', 'role'].forEach(key => { form.elements[key].value = user[key] || ''; });
  form.elements.email.readOnly = true;
  form.elements.active.checked = user.active;
  $('#user-form-heading').textContent = 'Ubah akun';
  form.scrollIntoView({behavior: 'smooth', block: 'start'});
}

/* -----------------------------------------------------------------
 * F50 | saveUser
 * ----------------------------------------------------------------- */
async function saveUser(form) {
  const values = formValues(form);
  values.active = form.elements.active.checked;
  const accepted = await EduNotify.ask({
    title: values.id ? 'Simpan perubahan akun?' : 'Tambahkan pengguna baru?',
    message: `Nama: ${values.name}\nEmail: ${values.email}\nPeran: ${values.role === 'admin' ? 'Administrator' : 'Guru'}\nStatus: ${values.active ? 'Aktif' : 'Nonaktif'}`,
    confirmText: values.id ? 'Simpan perubahan' : 'Tambahkan pengguna',
    cancelText: 'Periksa kembali', icon: '♙'
  });
  if (!accepted) return;
  await run(async () => {
    await api('saveUser', values);
    state.admin = await api('adminData');
    renderUsers();
    showToast(values.id ? 'Perubahan akun berhasil disimpan.' : 'Pengguna baru berhasil ditambahkan.');
  }, 'Menyimpan akun...');
}

/* ==================== ADMIN: PROVIDER & KUOTA ==================== */

/* -----------------------------------------------------------------
 * F51 | renderSettings
 * ----------------------------------------------------------------- */
function renderSettings() {
  setRoute('settings', 'Pengaturan AI & kuota');
  const providers = state.admin.providers.map(provider => `
    <form class="card" data-form="provider">
      <input type="hidden" name="id" value="${provider.id}">
      <div class="row between mb-20"><h2 class="mb-0">${escapeHTML(title(provider.id))}</h2>${badge(provider.configured ? 'Key tersimpan' : 'Belum diisi', provider.configured ? 'badge-success' : '')}</div>
      ${field('model', 'ID model', provider.model, {max: 160, placeholder: 'Isi ID model dari akun provider'})}
      ${field('key', 'API key baru', '', {type: 'password', max: 2000, autocomplete: 'new-password', placeholder: 'Kosong = pertahankan key lama'})}
      ${check('enabled', 'Aktifkan provider', provider.enabled)}
      ${check('clear', 'Hapus key tersimpan')}
      <div class="row mt-20"><button class="btn btn-primary" type="submit">Simpan</button>${button('Tes koneksi', 'test-provider', `data-id="${provider.id}"`, 'btn-outline')}</div>
    </form>`).join('');
  $('#content').innerHTML = `<div class="stack">
    ${pageHead('Pengaturan AI & kuota', 'Kunci API hanya disimpan di backend. Pilih ID model yang tersedia pada akun provider Anda.')}
    <div class="notice">API key disimpan sebagai teks biasa di Spreadsheet. Editor database/proyek dapat membacanya. Jangan membagikan akses sumber. Tes koneksi dapat dikenai biaya provider.</div>
    <div class="provider-grid">${providers}</div>
    <form class="card" data-form="settings">
      <h2>Kuota percobaan generate</h2>
      ${field('dailyLimit', 'Maksimum percobaan per akun per hari WIB (1–500)', state.admin.settings.dailyLimit, {type: 'number', required: true})}
      <p class="muted">Percobaan yang gagal tetap dihitung. Kuota ini bukan batas tagihan uang/token. Tes koneksi hanya tersedia bagi admin dan tidak masuk hitungan generate guru.</p>
      <button class="btn btn-primary" type="submit">Simpan pengaturan</button>
    </form>
  </div>`;
}

/* -----------------------------------------------------------------
 * F52 | saveProvider
 * ----------------------------------------------------------------- */
async function saveProvider(form) {
  const values = formValues(form);
  values.enabled = form.elements.enabled.checked;
  values.clear = form.elements.clear.checked;
  const accepted = await EduNotify.ask({
    title: values.clear ? 'Hapus API key tersimpan?' : 'Simpan konfigurasi AI?',
    message: `Provider: ${title(values.id)}\nModel: ${values.model || '[belum diisi]'}\nStatus: ${values.enabled ? 'Aktif' : 'Nonaktif'}\n\n` +
      (values.clear ? 'API key lama akan dihapus. Jangan aktifkan provider tanpa key yang valid.' : 'Konfigurasi ini akan digunakan untuk permintaan AI berikutnya.'),
    confirmText: values.clear ? 'Hapus key & simpan' : 'Simpan konfigurasi',
    cancelText: 'Batal', danger: values.clear, icon: '⚙'
  });
  if (!accepted) return;
  await run(async () => {
    await api('saveProvider', values);
    form.elements.key.value = '';
    state.admin = await api('adminData');
    applyBoot(await api('boot'));
    renderSettings();
    showToast('Konfigurasi provider berhasil disimpan.');
  }, 'Menyimpan provider...');
}

/* -----------------------------------------------------------------
 * F53 | testProvider
 * ----------------------------------------------------------------- */
async function testProvider(id) {
  await run(async () => {
    const result = await api('testProvider', {id});
    showToast(`${title(id)}: ${result.text}`);
  }, 'Menguji koneksi. Pengaturan yang diuji adalah yang sudah disimpan...');
}

/* -----------------------------------------------------------------
 * F54 | saveSettings
 * ----------------------------------------------------------------- */
async function saveSettings(form) {
  const values = formValues(form);
  const accepted = await EduNotify.ask({
    title: 'Ubah batas generate harian?',
    message: `Batas baru: ${values.dailyLimit} percobaan per akun per hari WIB.\nBatas ini bukan pembatas tagihan uang atau token provider.`,
    confirmText: 'Simpan kuota', cancelText: 'Batal', icon: '⚙'
  });
  if (!accepted) return;
  await run(async () => {
    await api('saveSettings', values);
    state.admin = await api('adminData');
    applyBoot(await api('boot'));
    renderSettings();
    showToast('Batas penggunaan berhasil diperbarui.');
  }, 'Menyimpan pengaturan...');
}

/* ==================== ADMIN: LOG ==================== */

/* -----------------------------------------------------------------
 * F55 | renderLogs
 * ----------------------------------------------------------------- */
function renderLogs() {
  setRoute('logs', 'Log aktivitas');
  const rows = state.admin.logs.map(log => `<tr>
    <td class="nowrap">${escapeHTML(dateText(log.created))}</td><td>${escapeHTML(log.email)}</td>
    <td>${badge(log.action)}</td><td><small>${escapeHTML(log.target)}</small></td>
  </tr>`).join('');
  $('#content').innerHTML = `<div class="stack">
    ${pageHead('Log aktivitas', '200 aktivitas terbaru. Catatan aktivitas bukan bukti identitas karena login cukup email.')}
    <div>${button('↻ Muat ulang', 'navigate', 'data-route="logs"', 'btn-outline')}</div>
    <div class="card table-wrap"><table><thead><tr><th>WAKTU</th><th>EMAIL</th><th>AKTIVITAS</th><th>TARGET</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Belum ada aktivitas.</td></tr>'}</tbody></table></div>
  </div>`;
}

/* ==================== BANTUAN ==================== */

/* -----------------------------------------------------------------
 * F56 | renderHelp
 * ----------------------------------------------------------------- */
function renderHelp() {
  setRoute('help', 'Panduan penggunaan');
  $('#content').innerHTML = `<div class="stack">
    ${pageHead('Panduan penggunaan', 'Alur singkat untuk menyusun perangkat ajar dengan EduPlan AI.')}
    <section class="card"><h2>Mulai membuat dokumen</h2><ol class="help-list">
      <li>Isi nama dan sekolah di menu Profil.</li><li>Pilih kategori dan jenis generator.</li>
      <li>Isi materi, kelas/fase, waktu, serta rujukan terverifikasi.</li><li>Pilih provider AI yang telah diaktifkan admin.</li>
      <li>Generate, tinjau, dan perbaiki draf pada editor.</li><li>Simpan, lalu unduh PDF, Word, atau TXT.</li>
    </ol></section>
    <section class="card"><h2>Batasan hasil</h2><ul class="help-list">
      <li>CP resmi dan kalender daerah tidak diambil otomatis.</li><li>Daftar hadir/nilai tanpa data menghasilkan template, bukan data nyata.</li>
      <li>Analisis hasil perlu data anonim; verifikasi semua hitungan secara terpisah.</li>
      <li>Presentasi berupa outline slide, bukan PPTX. Media berupa naskah/rancangan, bukan gambar/video.</li>
      <li>PDF/Word berbasis teks sederhana; belum pemformatan tabel kompleks atau kop surat.</li>
      <li>Riwayat mendukung favorit dan sampah yang dapat dipulihkan. Belum tersedia hapus permanen atau versi historis dokumen.</li>
    </ul></section>
    <div class="notice">Tanpa verifikasi login, alamat email bukan bukti identitas. Jangan gunakan aplikasi ini untuk data rahasia atau data pribadi siswa. Segera hubungi pemilik aplikasi jika ada aktivitas tidak wajar.</div>
  </div>`;
}

/* ==================== EVENTS ==================== */

/* -----------------------------------------------------------------
 * F57 | onClick
 * ----------------------------------------------------------------- */
async function onClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target || state.busy) return;
  const data = target.dataset;
  switch (data.action) {
    case 'navigate': return navigate(data.route, data.category);
    case 'generator': return renderGenerator(data.type);
    case 'logout': return logout();
    case 'theme': return toggleTheme();
    case 'toggle-menu': document.body.classList.toggle('menu-open'); return;
    case 'close-menu': document.body.classList.remove('menu-open'); return;
    case 'open-document': return openDocument(data.id);
    case 'export': return exportDocument(data.format);
    case 'copy': return copyDocument();
    case 'favorite-document': return mutateDocument('favoriteDocument', data.id, data.value === 'true');
    case 'trash-document': return mutateDocument('trashDocument', data.id, data.value === 'true');
    case 'refresh-documents': return navigate(state.route);
    case 'page': state.filters.page = Number(data.page); renderDocumentResults(); return;
    case 'edit-user': return editUser(data.id);
    case 'new-user': return renderUsers();
    case 'test-provider': return testProvider(data.id);
    default: return;
  }
}

/* -----------------------------------------------------------------
 * F58 | onSubmit
 * ----------------------------------------------------------------- */
function onSubmit(event) {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  if (state.busy) return;
  const handlers = {login, generate, 'save-document': saveDocument, profile: saveProfile, user: saveUser, provider: saveProvider, settings: saveSettings};
  const handler = handlers[form.dataset.form];
  if (handler) handler(form);
}

/* -----------------------------------------------------------------
 * F59 | onInput
 * ----------------------------------------------------------------- */
function onInput(event) {
  const target = event.target;
  if (target.closest('[data-form="save-document"]')) {
    state.dirty = true;
    $('#editor-status').textContent = 'Perubahan belum disimpan';
  }
  if (target.id === 'type-search') {
    const query = target.value.toLowerCase();
    document.querySelectorAll('#type-grid [data-search]').forEach(card => { card.hidden = !card.dataset.search.includes(query); });
  }
  if (target.id === 'doc-search') {
    state.filters.query = target.value;
    state.filters.page = 1;
    renderDocumentResults();
  }
}

/* -----------------------------------------------------------------
 * F60 | onChange
 * ----------------------------------------------------------------- */
function onChange(event) {
  if (event.target.id === 'doc-type') state.filters.type = event.target.value;
  else if (event.target.id === 'doc-provider') state.filters.provider = event.target.value;
  else return;
  state.filters.page = 1;
  renderDocumentResults();
}

/* -----------------------------------------------------------------
 * F61 | toggleTheme
 * ----------------------------------------------------------------- */
function toggleTheme() {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem(CONFIG.THEME_KEY, dark ? 'dark' : 'light');
}

/* -----------------------------------------------------------------
 * F62 | init
 * ----------------------------------------------------------------- */
async function init() {
  document.documentElement.dataset.theme = localStorage.getItem(CONFIG.THEME_KEY) || 'light';
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.body.classList.remove('menu-open'); });
  window.addEventListener('beforeunload', event => {
    if (!state.dirty) return;
    event.preventDefault(); event.returnValue = '';
  });
  renderLogin();
  if (!state.token) return;
  await run(async () => {
    applyBoot(await api('boot'));
    renderShell(); renderDashboard();
  }, 'Memulihkan sesi...');
}

init();
