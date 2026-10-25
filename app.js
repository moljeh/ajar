/**
 * EDUPLAN AI | APP.JS LENGKAP — REVISI CONTOH RUJUKAN
 *
 * CARA MEMBACA:
 * - Cari nama fungsi atau penanda F01, F02, dan seterusnya.
 * - Edit getReferenceExample untuk menambah contoh pada menu tertentu.
 * - Kode katalog tambahan berasal dari backend melalui state.catalog.
 * - Contoh tidak menjadi data formulir: ditampilkan sebagai placeholder.
 * - CP resmi tetap harus ditempel dari sumber yang telah diperiksa.
 *
 * DAFTAR FUNGSI
 * F01 | $: Memilih elemen DOM
 * F02 | escapeHTML: Mengamankan teks untuk HTML
 * F03 | title: Menampilkan nama jenis dokumen
 * F04 | dateText: Memformat tanggal dan waktu
 * F05 | button: Membuat tombol aksi
 * F06 | badge: Membuat label status
 * F07 | field: Membuat input formulir
 * F08 | selectField: Membuat pilihan dropdown
 * F09 | textarea: Membuat kolom teks panjang
 * F10 | check: Membuat checkbox
 * F11 | showToast: Menampilkan notifikasi
 * F12 | setBusy: Mengatur indikator proses
 * F13 | run: Menjalankan tugas dengan penanganan kesalahan
 * F14 | formValues: Membaca isian formulir
 * F15 | api: Mengirim permintaan ke backend
 * F16 | clearSession: Menghapus sesi lokal
 * F17 | renderLogin: Menampilkan halaman login
 * F18 | login: Memproses login
 * F19 | applyBoot: Memuat data awal ke state
 * F20 | logout: Memproses keluar akun
 * F21 | navItem: Membuat tombol navigasi
 * F22 | renderRoleAvatar: Membuat ikon administrator atau guru
 * F23 | renderShell: Menampilkan sidebar dan header
 * F24 | setRoute: Mengatur status navigasi aktif
 * F25 | mayLeave: Memeriksa perubahan yang belum disimpan
 * F26 | navigate: Membuka menu aplikasi
 * F27 | pageHead: Membuat judul halaman
 * F28 | renderDashboard: Menampilkan dashboard
 * F29 | renderCategory: Menampilkan pilihan generator
 * F30 | getReferenceExample: CONTOH RUJUKAN BERDASARKAN JENIS MENU
 * F31 | renderGenerator: Menampilkan formulir generator dan contoh isian
 * F32 | generate: Membuat dan menyimpan draf AI
 * F33 | openDocument: Membuka dokumen tersimpan
 * F34 | renderEditor: Menampilkan editor dokumen
 * F35 | editorValues: Membaca data editor
 * F36 | syncDocument: Memperbarui dokumen pada state
 * F37 | persistEditor: Menyimpan isi editor ke backend
 * F38 | saveDocument: Menangani tombol simpan dokumen
 * F39 | downloadBlob: Mengunduh file di browser
 * F40 | exportDocument: Mengekspor PDF Word atau TXT
 * F41 | copyDocument: Menyalin isi dokumen
 * F42 | renderHistory: Menampilkan riwayat favorit atau sampah
 * F43 | renderDocumentResults: Menampilkan hasil filter dan halaman dokumen
 * F44 | mutateDocument: Mengubah favorit atau status sampah
 * F45 | renderProfile: Menampilkan profil guru dan sekolah
 * F46 | saveProfile: Menyimpan profil
 * F47 | renderUsers: Menampilkan manajemen akun
 * F48 | editUser: Mengisi formulir perubahan akun
 * F49 | saveUser: Menyimpan akun pengguna
 * F50 | renderSettings: Menampilkan pengaturan provider dan kuota
 * F51 | saveProvider: Menyimpan konfigurasi provider AI
 * F52 | testProvider: Menguji koneksi provider
 * F53 | saveSettings: Menyimpan batas penggunaan
 * F54 | renderLogs: Menampilkan log aktivitas
 * F55 | renderHelp: Menampilkan panduan penggunaan
 * F56 | onClick: Menangani klik tombol aplikasi
 * F57 | onSubmit: Menangani pengiriman formulir
 * F58 | onInput: Menangani pengetikan dan pencarian
 * F59 | onChange: Menangani perubahan filter
 * F60 | toggleTheme: Mengganti tema
 * F61 | init: Inisialisasi aplikasi
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

/* ==================== UTILITAS ==================== */

/* -----------------------------------------------------------------
 * F01 | $ — Memilih elemen DOM
 * ----------------------------------------------------------------- */
const $ = selector => document.querySelector(selector);
/* -----------------------------------------------------------------
 * F02 | escapeHTML — Mengamankan teks untuk HTML
 * ----------------------------------------------------------------- */
const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
/* -----------------------------------------------------------------
 * F03 | title — Menampilkan nama jenis dokumen
 * ----------------------------------------------------------------- */
const title = key => TITLES[key] || String(key || '').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
/* -----------------------------------------------------------------
 * F04 | dateText — Memformat tanggal dan waktu
 * ----------------------------------------------------------------- */
const dateText = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'});
};
/* -----------------------------------------------------------------
 * F05 | button — Membuat tombol aksi
 * ----------------------------------------------------------------- */
const button = (text, action, attrs = '', kind = '') => `<button type="button" class="btn ${kind}" data-action="${action}" ${attrs}>${text}</button>`;
/* -----------------------------------------------------------------
 * F06 | badge — Membuat label status
 * ----------------------------------------------------------------- */
const badge = (text, kind = '') => `<span class="badge ${kind}">${escapeHTML(text)}</span>`;
/* -----------------------------------------------------------------
 * F07 | field — Membuat input formulir
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
 * F08 | selectField — Membuat pilihan dropdown
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
 * F09 | textarea — Membuat kolom teks panjang
 * ----------------------------------------------------------------- */
const textarea = (name, label, placeholder = '') => `
  <label class="field"><span>${escapeHTML(label)}</span><textarea
    name="${escapeHTML(name)}"
    placeholder="${escapeHTML(placeholder)}"
    rows="${name === 'reference' ? 14 : 5}"
  ></textarea></label>`;
/* -----------------------------------------------------------------
 * F10 | check — Membuat checkbox
 * ----------------------------------------------------------------- */
const check = (name, text, checked = false) => `
  <label class="check"><input name="${name}" type="checkbox" ${checked ? 'checked' : ''}>${escapeHTML(text)}</label>`;

/* -----------------------------------------------------------------
 * F11 | showToast — Menampilkan notifikasi
 * ----------------------------------------------------------------- */
function showToast(message, error = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.toggle('error', error);
  toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { toast.hidden = true; }, 7000);
}

/* -----------------------------------------------------------------
 * F12 | setBusy — Mengatur indikator proses
 * ----------------------------------------------------------------- */
function setBusy(value, message = 'Memproses...') {
  state.busy = value;
  $('#loading').hidden = !value;
  $('#loading-message').textContent = message;
  $('#app').setAttribute('aria-busy', String(value));
}

/* -----------------------------------------------------------------
 * F13 | run — Menjalankan tugas dengan penanganan kesalahan
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
 * F14 | formValues — Membaca isian formulir
 * ----------------------------------------------------------------- */
function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }

/* ==================== KONEKSI GOOGLE APPS SCRIPT ==================== */

/* -----------------------------------------------------------------
 * F15 | api — Mengirim permintaan ke backend
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
 * F16 | clearSession — Menghapus sesi lokal
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
 * F17 | renderLogin — Menampilkan halaman login
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
 * F18 | login — Memproses login
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
 * F19 | applyBoot — Memuat data awal ke state
 * ----------------------------------------------------------------- */
function applyBoot(data) {
  Object.assign(state, {user: data.user, catalog: data.catalog, providers: data.providers, documents: data.documents, usage: data.usage});
}

/* -----------------------------------------------------------------
 * F20 | logout — Memproses keluar akun
 * ----------------------------------------------------------------- */
async function logout() {
  if (!mayLeave()) return;
  await run(async () => {
    try { await api('logout'); }
    finally { clearSession(); renderLogin(); }
  }, 'Keluar...');
}

/* ==================== SHELL & NAVIGASI ==================== */

/* -----------------------------------------------------------------
 * F21 | navItem — Membuat tombol navigasi
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
 * F22 | renderRoleAvatar — Membuat ikon administrator atau guru
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
 * F23 | renderShell — Menampilkan sidebar dan header
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
 * F24 | setRoute — Mengatur status navigasi aktif
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
 * F25 | mayLeave — Memeriksa perubahan yang belum disimpan
 * ----------------------------------------------------------------- */
function mayLeave() {
  if (!state.dirty) return true;
  if (!confirm('Anda belum menyimpan perubahan. Tinggalkan halaman ini?')) return false;
  state.dirty = false;
  return true;
}

/* -----------------------------------------------------------------
 * F26 | navigate — Membuka menu aplikasi
 * ----------------------------------------------------------------- */
async function navigate(route, category = '') {
  if (!mayLeave()) return;
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
 * F27 | pageHead — Membuat judul halaman
 * ----------------------------------------------------------------- */
function pageHead(heading, description) {
  return `<div class="page-head"><h1>${escapeHTML(heading)}</h1><p>${escapeHTML(description)}</p></div>`;
}

/* ==================== DASHBOARD & KATEGORI ==================== */

/* -----------------------------------------------------------------
 * F28 | renderDashboard — Menampilkan dashboard
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
 * F29 | renderCategory — Menampilkan pilihan generator
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
 * F30 | getReferenceExample — CONTOH RUJUKAN BERDASARKAN JENIS MENU
 * ----------------------------------------------------------------- */
function getReferenceExample(type) {
  // Kode menu yang diketahui dari TITLES; tambahkan entri untuk katalog lain.
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

  const parts = Object.prototype.hasOwnProperty.call(examples, type)
    ? examples[type]
    : fallback;

  return [
    `Contoh isian untuk ${title(type)}:`,
    ...parts,
    'Contoh ini hanya ilustrasi. Ganti dengan konteks Anda; jangan masukkan identitas pribadi peserta didik.'
  ].join('\n\n');
}

/* -----------------------------------------------------------------
 * F31 | renderGenerator — Menampilkan formulir generator dan contoh isian
 * ----------------------------------------------------------------- */
function renderGenerator(type) {
  if (!mayLeave()) return;
  state.generatorType = type;
  setRoute('generator', `Generator / ${title(type)}`);
  const providers = state.providers.map(p => ({value: p.id, text: `${title(p.id)} · ${p.model}`}));
  const noProvider = providers.length === 0;
  $('#content').innerHTML = `<div class="stack">
    ${pageHead(`Generator ${title(type)}`, 'Lengkapi konteks pembelajaran. Semakin jelas rujukan, semakin relevan drafnya.')}
    <div class="notice">Isian akan dikirim ke provider pilihan Anda. Gunakan data anonim. CP/kalender resmi tidak diambil otomatis; tempelkan sumber terverifikasi bila diperlukan.</div>
    <form class="card" data-form="generate">
      <div class="row between mb-20"><h2 class="mb-0">Konteks dokumen</h2>${badge('Draf AI')}</div>
      <div class="form-grid">
        ${field('subject', 'Mata pelajaran *', '', {required: true, max: 150})}
        ${field('level', 'Jenjang / kelas / fase *', '', {required: true, max: 100, placeholder: 'Contoh: SD / kelas 4 / fase B'})}
        ${field('topic', 'Materi / topik *', '', {required: true, max: 200})}
        ${field('year', 'Tahun ajaran', '', {max: 40, placeholder: 'Isi sesuai kebutuhan'})}
        ${selectField('semester', 'Semester', ['Ganjil', 'Genap'])}
        ${field('duration', 'Alokasi waktu / pertemuan', '', {max: 150})}
        ${field('curriculum', 'Kurikulum', '', {max: 150})}
        ${selectField('provider', 'Provider AI', providers)}
      </div>
      ${textarea(
        'reference',
       'CP / TP / rujukan resmi / data anonim — TES REVISI',
        getReferenceExample(type)
      )}
      <p class="muted">Contoh di dalam kolom hanya ilustrasi, bukan kutipan CP resmi. Gunakan sumber yang telah diperiksa dan jangan masukkan identitas pribadi peserta didik.</p>
      ${textarea('instructions', 'Format / kebutuhan khusus / jumlah soal / catatan', 'Contoh: tabel kisi-kisi, 10 soal pilihan ganda dan pembahasan, diferensiasi, rubrik 4 tingkat.')}
      <p class="muted">Guru: ${escapeHTML(state.user.name)} · Sekolah: ${escapeHTML(state.user.school || '[belum diisi]')}</p>
      <div class="row">
        <button class="btn btn-primary" type="submit" ${noProvider ? 'disabled' : ''}>✦ Generate & simpan draf</button>
        ${button('Profil guru & sekolah', 'navigate', 'data-route="profile"', 'btn-outline')}
      </div>
      ${noProvider ? '<p class="notice mt-20">Belum ada provider aktif. Admin perlu memasukkan API key dan ID model terlebih dahulu.</p>' : ''}
    </form>
  </div>`;
}

/* -----------------------------------------------------------------
 * F32 | generate — Membuat dan menyimpan draf AI
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
 * F33 | openDocument — Membuka dokumen tersimpan
 * ----------------------------------------------------------------- */
async function openDocument(id) {
  if (!mayLeave()) return;
  await run(async () => {
    state.editor = await api('readDocument', {id});
    state.dirty = false;
    renderEditor();
  }, 'Membuka dokumen...');
}

/* -----------------------------------------------------------------
 * F34 | renderEditor — Menampilkan editor dokumen
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
 * F35 | editorValues — Membaca data editor
 * ----------------------------------------------------------------- */
function editorValues() {
  const values = formValues($('[data-form="save-document"]'));
  return {id: state.editor.doc.id, revision: state.editor.doc.revision, title: values.title, text: values.text};
}

/* -----------------------------------------------------------------
 * F36 | syncDocument — Memperbarui dokumen pada state
 * ----------------------------------------------------------------- */
function syncDocument(doc) {
  const index = state.documents.findIndex(d => d.id === doc.id);
  if (index >= 0) state.documents[index] = doc;
}

/* -----------------------------------------------------------------
 * F37 | persistEditor — Menyimpan isi editor ke backend
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
 * F38 | saveDocument — Menangani tombol simpan dokumen
 * ----------------------------------------------------------------- */
async function saveDocument() {
  await run(async () => { await persistEditor(); showToast('Perubahan disimpan.'); }, 'Menyimpan dokumen...');
}

/* -----------------------------------------------------------------
 * F39 | downloadBlob — Mengunduh file di browser
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
 * F40 | exportDocument — Mengekspor PDF Word atau TXT
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
 * F41 | copyDocument — Menyalin isi dokumen
 * ----------------------------------------------------------------- */
async function copyDocument() {
  try { await navigator.clipboard.writeText($('#editor-text').value); showToast('Teks disalin.'); }
  catch (_) { $('#editor-text').select(); showToast('Tekan Ctrl+C atau gunakan menu salin pada perangkat.'); }
}

/* ==================== RIWAYAT, FAVORIT, SAMPAH ==================== */

/* -----------------------------------------------------------------
 * F42 | renderHistory — Menampilkan riwayat favorit atau sampah
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
 * F43 | renderDocumentResults — Menampilkan hasil filter dan halaman dokumen
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
 * F44 | mutateDocument — Mengubah favorit atau status sampah
 * ----------------------------------------------------------------- */
async function mutateDocument(action, id, value) {
  if (action === 'trashDocument' && value && !confirm('Pindahkan dokumen ke sampah? Dokumen dapat dipulihkan.')) return;
  await run(async () => {
    const doc = await api(action, {id, value});
    syncDocument(doc);
    renderDocumentResults();
  }, 'Memperbarui dokumen...');
}

/* ==================== PROFIL ==================== */

/* -----------------------------------------------------------------
 * F45 | renderProfile — Menampilkan profil guru dan sekolah
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
 * F46 | saveProfile — Menyimpan profil
 * ----------------------------------------------------------------- */
async function saveProfile(form) {
  await run(async () => {
    state.user = await api('saveProfile', formValues(form));
    renderShell(); renderProfile(); showToast('Profil disimpan.');
  }, 'Menyimpan profil...');
}

/* ==================== ADMIN: PENGGUNA ==================== */

/* -----------------------------------------------------------------
 * F47 | renderUsers — Menampilkan manajemen akun
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
 * F48 | editUser — Mengisi formulir perubahan akun
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
 * F49 | saveUser — Menyimpan akun pengguna
 * ----------------------------------------------------------------- */
async function saveUser(form) {
  const values = formValues(form);
  values.active = form.elements.active.checked;
  if (!confirm(`Simpan ${values.email} sebagai ${values.role} (${values.active ? 'aktif' : 'nonaktif'})?`)) return;
  await run(async () => {
    await api('saveUser', values);
    state.admin = await api('adminData');
    renderUsers(); showToast('Akun disimpan.');
  }, 'Menyimpan akun...');
}

/* ==================== ADMIN: PROVIDER & KUOTA ==================== */

/* -----------------------------------------------------------------
 * F50 | renderSettings — Menampilkan pengaturan provider dan kuota
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
 * F51 | saveProvider — Menyimpan konfigurasi provider AI
 * ----------------------------------------------------------------- */
async function saveProvider(form) {
  const values = formValues(form);
  values.enabled = form.elements.enabled.checked;
  values.clear = form.elements.clear.checked;
  if (!confirm(`Simpan pengaturan ${title(values.id)}${values.clear ? ' dan hapus key lama' : ''}?`)) return;
  await run(async () => {
    await api('saveProvider', values);
    form.elements.key.value = '';
    state.admin = await api('adminData');
    applyBoot(await api('boot'));
    renderSettings(); showToast('Pengaturan provider disimpan.');
  }, 'Menyimpan provider...');
}

/* -----------------------------------------------------------------
 * F52 | testProvider — Menguji koneksi provider
 * ----------------------------------------------------------------- */
async function testProvider(id) {
  await run(async () => {
    const result = await api('testProvider', {id});
    showToast(`${title(id)}: ${result.text}`);
  }, 'Menguji koneksi. Pengaturan yang diuji adalah yang sudah disimpan...');
}

/* -----------------------------------------------------------------
 * F53 | saveSettings — Menyimpan batas penggunaan
 * ----------------------------------------------------------------- */
async function saveSettings(form) {
  await run(async () => {
    await api('saveSettings', formValues(form));
    state.admin = await api('adminData');
    applyBoot(await api('boot'));
    renderSettings(); showToast('Batas penggunaan disimpan.');
  }, 'Menyimpan pengaturan...');
}

/* ==================== ADMIN: LOG ==================== */

/* -----------------------------------------------------------------
 * F54 | renderLogs — Menampilkan log aktivitas
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
 * F55 | renderHelp — Menampilkan panduan penggunaan
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
 * F56 | onClick — Menangani klik tombol aplikasi
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
 * F57 | onSubmit — Menangani pengiriman formulir
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
 * F58 | onInput — Menangani pengetikan dan pencarian
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
 * F59 | onChange — Menangani perubahan filter
 * ----------------------------------------------------------------- */
function onChange(event) {
  if (event.target.id === 'doc-type') state.filters.type = event.target.value;
  else if (event.target.id === 'doc-provider') state.filters.provider = event.target.value;
  else return;
  state.filters.page = 1;
  renderDocumentResults();
}

/* -----------------------------------------------------------------
 * F60 | toggleTheme — Mengganti tema
 * ----------------------------------------------------------------- */
function toggleTheme() {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem(CONFIG.THEME_KEY, dark ? 'dark' : 'light');
}

/* -----------------------------------------------------------------
 * F61 | init — Inisialisasi aplikasi
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
