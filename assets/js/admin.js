/* ═══════════════════════════════════════════════════════════
   retro::blog — ADMIN panel scripti
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    posts: [],
    settings: {},
    media: [],
    git: null,
    dirty: false,
    editingId: null
  };

  /* ───────────── yardımcılar ───────────── */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const TR_MAP = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    'â': 'a', 'î': 'i', 'û': 'u'
  };

  function slugify(input) {
    return String(input || '')
      .replace(/[çğıöşüÇĞİÖŞÜâîû]/g, (c) => TR_MAP[c] || c)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90);
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function fmtSize(n) {
    const num = Number(n) || 0;
    if (num < 1024) return num + ' B';
    if (num < 1024 * 1024) return (num / 1024).toFixed(1) + ' KB';
    return (num / 1024 / 1024).toFixed(2) + ' MB';
  }

  function blankPost() {
    return {
      id: '', slug: '', title: '',
      date: new Date().toISOString().slice(0, 10),
      readTime: '', excerpt: '', cover: '',
      glyph: '▓▒░\n░▓▒\n▒░▓', tags: [], content: '',
      status: 'draft', featured: false
    };
  }

  let toastTimer = null;
  function toast(message, type) {
    const el = $('#toast');
    el.textContent = message;
    el.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 5000);
  }

  /* ───────────── API ───────────── */
  async function api(url, opts) {
    const options = Object.assign({ credentials: 'same-origin' }, opts || {});

    if (options.body && !(options.body instanceof FormData)) {
      options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, options);

    let data = {};
    const ct = res.headers.get('content-type') || '';
    if (ct.indexOf('application/json') !== -1) {
      try { data = await res.json(); } catch (_) { /* boş gövde */ }
    }

    if (!res.ok) {
      if (res.status === 401 && url !== '/api/login') showLogin();
      throw new Error(data.error || ('HTTP ' + res.status));
    }
    return data;
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    return api('/api/upload', { method: 'POST', body: fd });
  }

  /* ───────────── giriş / çıkış ───────────── */
  function showLogin() {
    $('#app').hidden = true;
    $('#loginScreen').hidden = false;
    const pw = $('#password');
    if (pw) pw.focus();
  }

  function showApp() {
    $('#loginScreen').hidden = true;
    $('#app').hidden = false;
  }

  async function loadAll() {
    const results = await Promise.all([
      api('/api/posts'),
      api('/api/media').catch(() => ({ files: [] })),
      api('/api/git').catch(() => ({ repo: false, changes: [], branch: '', remote: '' }))
    ]);
    state.posts = results[0].posts || [];
    state.settings = results[0].settings || {};
    state.media = results[1].files || [];
    state.git = results[2];
  }

  async function refreshMedia() {
    try {
      const m = await api('/api/media');
      state.media = m.files || [];
    } catch (_) { /* yoksay */ }
  }

  /* ───────────── yönlendirme ───────────── */
  function currentHash() {
    return location.hash.replace(/^#/, '') || 'dashboard';
  }

  function setHead(title, actionsHtml) {
    $('#viewTitle').textContent = title;
    $('#headActions').innerHTML = actionsHtml || '';
  }

  function route() {
    if ($('#app').hidden) return;
    const hash = currentHash();
    const parts = hash.split('/');
    const view = parts[0];
    const param = parts[1];

    $$('.side-nav button').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === hash);
    });

    if (view === 'posts') renderPosts();
    else if (view === 'editor') renderEditor(param);
    else if (view === 'media') renderMedia();
    else if (view === 'settings') renderSettings();
    else if (view === 'publish') renderPublish();
    else renderDashboard();
  }

  /* ═══════════════════════════════════════════════
     PANEL (dashboard)
     ═══════════════════════════════════════════════ */
  function renderDashboard() {
    setHead('Panel', '<a class="btn btn-sm" href="#editor/new">+ YENİ YAZI</a>');

    const published = state.posts.filter((p) => p.status === 'published').length;
    const drafts = state.posts.length - published;
    const changes = (state.git && state.git.changes) ? state.git.changes.length : 0;
    const last = state.posts
      .slice()
      .sort((a, b) => String(b.updatedAt || b.date).localeCompare(String(a.updatedAt || a.date)))
      .slice(0, 5);

    const stat = (num, lbl) => `
      <div class="stat">
        <div class="num">${num}</div>
        <div class="lbl">${lbl}</div>
      </div>`;

    const rows = last.map((p) => `
      <tr>
        <td class="cell-title"><a href="#editor/${esc(p.id)}">${esc(p.title)}</a></td>
        <td>${esc(p.date)}</td>
        <td><span class="badge ${p.status === 'published' ? 'published' : 'draft'}">${p.status === 'published' ? 'yayında' : 'taslak'}</span></td>
        <td>${fmtDate(p.updatedAt)}</td>
      </tr>`).join('');

    $('#view').innerHTML = `
      <div class="stat-grid">
        ${stat(published, 'yayında')}
        ${stat(drafts, 'taslak')}
        ${stat(state.media.length, 'fotoğraf')}
        ${stat(changes, 'gönderilmemiş')}
      </div>

      <div class="panel">
        <h2>// son değişenler</h2>
        ${last.length ? `
          <table class="list">
            <thead><tr><th>Başlık</th><th>Tarih</th><th>Durum</th><th>Son değişiklik</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>` : '<p class="muted">Henüz yazı yok. Sağ üstten ilk yazını oluştur.</p>'}
      </div>

      <div class="panel">
        <h2>// hızlı işlemler</h2>
        <div class="head-actions">
          <a class="btn btn-sm" href="#editor/new">+ YENİ YAZI</a>
          <a class="btn btn-sm btn-ghost" href="#media">FOTOĞRAF YÜKLE</a>
          <a class="btn btn-sm btn-ghost" href="#settings">SİTE AYARLARI</a>
          <a class="btn btn-sm btn-ghost" href="#publish">GITHUB'A GÖNDER</a>
        </div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════
     YAZI LİSTESİ
     ═══════════════════════════════════════════════ */
  function renderPosts() {
    setHead('Yazılar', '<a class="btn btn-sm" href="#editor/new">+ YENİ YAZI</a>');

    $('#view').innerHTML = `
      <div class="toolbar">
        <input type="search" id="pSearch" placeholder="ara: başlık, etiket, özet...">
        <select id="pStatus">
          <option value="">tüm durumlar</option>
          <option value="published">yayında</option>
          <option value="draft">taslak</option>
        </select>
        <select id="pSort">
          <option value="new">yeni → eski</option>
          <option value="old">eski → yeni</option>
          <option value="title">başlık (A-Z)</option>
        </select>
      </div>
      <div id="postsTable"></div>
    `;

    const draw = () => {
      const q = $('#pSearch').value.trim().toLowerCase();
      const status = $('#pStatus').value;
      const sort = $('#pSort').value;

      let list = state.posts.slice();

      if (status) list = list.filter((p) => p.status === status);

      if (q) {
        list = list.filter((p) => (
          String(p.title || '').toLowerCase().indexOf(q) !== -1 ||
          String(p.excerpt || '').toLowerCase().indexOf(q) !== -1 ||
          (p.tags || []).join(' ').toLowerCase().indexOf(q) !== -1
        ));
      }

      if (sort === 'old') list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      else if (sort === 'title') list.sort((a, b) => String(a.title).localeCompare(String(b.title), 'tr'));
      else list.sort((a, b) => String(b.date).localeCompare(String(a.date)));

      const box = $('#postsTable');

      if (!list.length) {
        box.innerHTML = '<div class="panel empty-state">// yazı bulunamadı</div>';
        return;
      }

      box.innerHTML = `
        <table class="list">
          <thead>
            <tr>
              <th></th>
              <th>Başlık</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${list.map((p) => `
              <tr>
                <td>
                  ${p.cover
                    ? `<img class="cell-thumb" src="${esc(p.cover)}" alt="">`
                    : `<div class="cell-thumb" style="display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--slate-grey);">${esc((p.glyph || '').split('\n')[0] || '—')}</div>`}
                </td>
                <td class="cell-title">
                  <a href="#editor/${esc(p.id)}">${esc(p.title)}</a>
                  <div class="muted" style="font-size:15px;">/${esc(p.slug)}</div>
                </td>
                <td>${esc(p.date)}</td>
                <td>
                  <span class="badge ${p.status === 'published' ? 'published' : 'draft'}">${p.status === 'published' ? 'yayında' : 'taslak'}</span>
                  ${p.featured ? ' <span class="badge featured">öne çıkan</span>' : ''}
                </td>
                <td>
                  <div class="cell-actions">
                    <a class="btn btn-sm btn-ghost" href="#editor/${esc(p.id)}">DÜZENLE</a>
                    <button type="button" class="btn btn-sm btn-danger" data-del="${esc(p.id)}" data-title="${esc(p.title)}">SİL</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    };

    $('#pSearch').addEventListener('input', draw);
    $('#pStatus').addEventListener('change', draw);
    $('#pSort').addEventListener('change', draw);

    $('#postsTable').addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-del]');
      if (!btn) return;
      const title = btn.dataset.title || 'bu yazı';
      if (!confirm('"' + title + '" silinsin mi? Bu işlem geri alınamaz.')) return;

      btn.disabled = true;
      try {
        await api('/api/posts/' + encodeURIComponent(btn.dataset.del), { method: 'DELETE' });
        state.posts = state.posts.filter((p) => p.id !== btn.dataset.del);
        toast('Yazı silindi.', 'ok');
        draw();
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false;
      }
    });

    draw();
  }

  /* ═══════════════════════════════════════════════
     EDİTÖR
     ═══════════════════════════════════════════════ */
  function renderEditor(id) {
    const isNew = !id || id === 'new';
    const source = isNew ? blankPost() : state.posts.find((p) => p.id === id);

    if (!source) {
      setHead('Bulunamadı', '');
      $('#view').innerHTML = '<div class="panel"><p>Yazı bulunamadı. <a href="#posts">◂ yazılara dön</a></p></div>';
      return;
    }

    const post = JSON.parse(JSON.stringify(source));
    state.editingId = isNew ? null : post.id;
    state.dirty = false;

    setHead(isNew ? 'Yeni Yazı' : 'Yazı Düzenle', [
      '<button type="button" class="btn btn-sm btn-ok" id="savePost">KAYDET</button>',
      isNew ? '' : '<button type="button" class="btn btn-sm btn-danger" id="deletePost">SİL</button>',
      '<a class="btn btn-sm btn-ghost" href="#posts">VAZGEÇ</a>'
    ].join(''));

    $('#view').innerHTML = `
      <div class="editor-grid">
        <div class="editor-main">
          <div class="panel">
            <div class="field">
              <label for="fTitle">Başlık</label>
              <input type="text" id="fTitle" value="${esc(post.title)}" placeholder="Yazı başlığı...">
            </div>

            <div class="row row-2">
              <div class="field">
                <label for="fSlug">URL (slug)</label>
                <input type="text" id="fSlug" value="${esc(post.slug)}" placeholder="otomatik-olussun">
                <span class="help">Adres: post.html?slug=<b id="slugPreview">${esc(post.slug || '...')}</b></span>
              </div>
              <div class="field">
                <label for="fDate">Tarih</label>
                <input type="date" id="fDate" value="${esc(post.date)}">
              </div>
            </div>

            <div class="field">
              <label for="fExcerpt">Özet</label>
              <textarea id="fExcerpt" rows="3" placeholder="Kart üzerinde görünecek kısa açıklama...">${esc(post.excerpt)}</textarea>
            </div>
          </div>

          <div class="panel">
            <div class="tabs">
              <button type="button" class="active" data-tab="write">YAZ</button>
              <button type="button" data-tab="preview">ÖNİZLEME</button>
            </div>

            <div class="editor-pane" id="paneWrite">
              <textarea id="fContent" placeholder="# Başlık&#10;&#10;Buraya yazının metni...">${esc(post.content)}</textarea>
              <div class="char-count">
                <span id="wordCount">0</span> kelime · <span id="charCount">0</span> karakter
              </div>
            </div>

            <div class="preview-pane" id="panePreview" hidden></div>

            <p class="help" style="margin-top:10px;">
              Markdown destekler: <code>## başlık</code> · <code>**kalın**</code> ·
              <code>*italik*</code> · <code>- liste</code> · <code>[link](url)</code> ·
              <code>![foto](url)</code> · üç ters tırnak ile kod bloğu
            </p>
          </div>
        </div>

        <div class="editor-side">
          <div class="panel">
            <h2>// durum</h2>
            <div class="field">
              <label for="fStatus">Yayın durumu</label>
              <select id="fStatus">
                <option value="draft">Taslak — sitede görünmez</option>
                <option value="published">Yayında — sitede görünür</option>
              </select>
            </div>
            <label class="check">
              <input type="checkbox" id="fFeatured"> Öne çıkan yazı
            </label>
            <div class="field" style="margin-top:10px; margin-bottom:0;">
              <label for="fReadTime">Okuma süresi</label>
              <input type="text" id="fReadTime" value="${esc(post.readTime)}" placeholder="boş = otomatik">
            </div>
          </div>

          <div class="panel">
            <h2>// kapak fotoğrafı</h2>
            <div class="cover-box" id="coverBox"></div>
            <div class="cover-actions">
              <button type="button" class="btn btn-sm" id="coverUploadBtn">YÜKLE</button>
              <button type="button" class="btn btn-sm btn-ghost" id="coverPickBtn">KÜTÜPHANE</button>
              <button type="button" class="btn btn-sm btn-danger" id="coverClearBtn">KALDIR</button>
            </div>
            <input type="file" id="coverFile" accept="image/*" hidden>
          </div>

          <div class="panel">
            <h2>// etiketler</h2>
            <div class="field" style="margin-bottom:0;">
              <input type="text" id="fTags" value="${esc((post.tags || []).join(', '))}" placeholder="css, retro, demoscene">
              <span class="help">Virgülle ayır.</span>
            </div>
          </div>

          <div class="panel">
            <h2>// pixel glyph</h2>
            <div class="field" style="margin-bottom:0;">
              <textarea id="fGlyph" rows="4">${esc(post.glyph)}</textarea>
              <span class="help">Kapak fotoğrafı yoksa kartta görünen ASCII desen.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    wireEditor(post, isNew);
  }

  function wireEditor(post, isNew) {
    const f = (id) => document.getElementById(id);
    let cover = post.cover || '';

    f('fStatus').value = post.status === 'published' ? 'published' : 'draft';
    f('fFeatured').checked = Boolean(post.featured);

    const markDirty = () => { state.dirty = true; };

    const updateCounts = () => {
      const text = f('fContent').value.trim();
      const words = text ? text.split(/\s+/).length : 0;
      f('wordCount').textContent = words;
      f('charCount').textContent = f('fContent').value.length;
    };

    const updateCover = () => {
      const box = f('coverBox');
      box.innerHTML = cover
        ? '<img src="' + esc(cover) + '" alt="kapak fotoğrafı">'
        : '<span>kapak fotoğrafı yok<br>// sürükle-bırak veya YÜKLE</span>';
    };

    updateCover();
    updateCounts();

    /* başlık → slug */
    f('fTitle').addEventListener('input', () => {
      if (!f('fSlug').dataset.touched) {
        f('fSlug').value = slugify(f('fTitle').value);
        f('slugPreview').textContent = f('fSlug').value || '...';
      }
      markDirty();
    });

    f('fSlug').addEventListener('input', () => {
      f('fSlug').dataset.touched = '1';
      f('slugPreview').textContent = f('fSlug').value || '...';
      markDirty();
    });

    ['fDate', 'fExcerpt', 'fTags', 'fGlyph', 'fReadTime'].forEach((id) => {
      f(id).addEventListener('input', markDirty);
    });

    /* içerik */
    f('fContent').addEventListener('input', () => {
      updateCounts();
      markDirty();
      if (!f('panePreview').hidden) {
        f('panePreview').innerHTML = '<div class="article-body">' + RetroMD.render(f('fContent').value) + '</div>';
      }
    });

    /* sekmeler */
    $$('.tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.tabs button').forEach((b) => b.classList.toggle('active', b === btn));
        const isPreview = btn.dataset.tab === 'preview';
        f('paneWrite').hidden = isPreview;
        f('panePreview').hidden = !isPreview;
        if (isPreview) {
          f('panePreview').innerHTML = '<div class="article-body">' + RetroMD.render(f('fContent').value) + '</div>';
        }
      });
    });

    /* kapak fotoğrafı */
    f('coverUploadBtn').addEventListener('click', () => f('coverFile').click());

    f('coverFile').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        toast('Yükleniyor...');
        const res = await uploadFile(file);
        cover = res.url;
        updateCover();
        markDirty();
        await refreshMedia();
        toast('Fotoğraf yüklendi: ' + res.name, 'ok');
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    f('coverPickBtn').addEventListener('click', () => {
      openMediaPicker((url) => {
        cover = url;
        updateCover();
        markDirty();
      });
    });

    f('coverClearBtn').addEventListener('click', () => {
      cover = '';
      updateCover();
      markDirty();
    });

    const box = f('coverBox');
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.classList.add('dragover');
    });
    box.addEventListener('dragleave', () => box.classList.remove('dragover'));
    box.addEventListener('drop', async (e) => {
      e.preventDefault();
      box.classList.remove('dragover');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      try {
        toast('Yükleniyor...');
        const res = await uploadFile(file);
        cover = res.url;
        updateCover();
        markDirty();
        await refreshMedia();
        toast('Fotoğraf yüklendi: ' + res.name, 'ok');
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    /* kaydet */
    const save = async () => {
      const payload = {
        title: f('fTitle').value,
        slug: f('fSlug').value,
        date: f('fDate').value,
        readTime: f('fReadTime').value,
        excerpt: f('fExcerpt').value,
        content: f('fContent').value,
        tags: f('fTags').value.split(',').map((s) => s.trim()).filter(Boolean),
        glyph: f('fGlyph').value,
        cover,
        status: f('fStatus').value,
        featured: f('fFeatured').checked
      };

      if (!payload.title.trim()) {
        toast('Başlık boş olamaz.', 'error');
        f('fTitle').focus();
        return;
      }

      const btn = $('#savePost');
      btn.disabled = true;

      try {
        const res = isNew
          ? await api('/api/posts', { method: 'POST', body: payload })
          : await api('/api/posts/' + encodeURIComponent(post.id), { method: 'PUT', body: payload });

        const saved = res.post;
        const idx = state.posts.findIndex((p) => p.id === saved.id);
        if (idx >= 0) state.posts[idx] = saved;
        else state.posts.unshift(saved);

        state.dirty = false;
        toast('Kaydedildi. Yayına almak için "Yayınla" sekmesinden GitHub\'a gönder.', 'ok');
        location.hash = '#posts';
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    };

    $('#savePost').addEventListener('click', save);

    /* sil */
    const del = $('#deletePost');
    if (del) {
      del.addEventListener('click', async () => {
        if (!confirm('"' + post.title + '" silinsin mi? Bu işlem geri alınamaz.')) return;
        del.disabled = true;
        try {
          await api('/api/posts/' + encodeURIComponent(post.id), { method: 'DELETE' });
          state.posts = state.posts.filter((p) => p.id !== post.id);
          state.dirty = false;
          toast('Yazı silindi.', 'ok');
          location.hash = '#posts';
        } catch (err) {
          toast(err.message, 'error');
          del.disabled = false;
        }
      });
    }

    /* Ctrl+S */
    document.onkeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') {
        e.preventDefault();
        if (document.getElementById('savePost')) save();
      }
    };
  }

  /* ═══════════════════════════════════════════════
     MEDYA
     ═══════════════════════════════════════════════ */
  function renderMedia() {
    setHead('Medya', '<button type="button" class="btn btn-sm" id="mediaUploadBtn">+ FOTOĞRAF YÜKLE</button>');

    $('#view').innerHTML = `
      <div class="dropzone" id="dropzone">
        <div class="big">FOTOĞRAFLARI BURAYA SÜRÜKLE</div>
        <p class="muted">veya tıklayıp seç · PNG / JPG / GIF / WEBP / AVIF · en fazla 8 MB</p>
      </div>
      <input type="file" id="mediaFile" accept="image/*" multiple hidden>
      <div class="media-grid" id="mediaGrid"></div>
    `;

    const grid = $('#mediaGrid');

    const draw = () => {
      if (!state.media.length) {
        grid.innerHTML = '<div class="panel empty-state" style="grid-column:1/-1;">// kütüphane boş</div>';
        return;
      }

      grid.innerHTML = state.media.map((m) => `
        <div class="media-item">
          <img src="${esc(m.url)}" alt="${esc(m.name)}" loading="lazy" data-preview="${esc(m.url)}">
          <div class="m-name">${esc(m.name)}</div>
          <div class="m-name" style="opacity:0.6;">${fmtSize(m.size)}</div>
          <div class="m-actions">
            <button type="button" data-copy="${esc(m.url)}">KOPYALA</button>
            <button type="button" data-remove="${esc(m.name)}">SİL</button>
          </div>
        </div>
      `).join('');
    };

    const handleFiles = async (files) => {
      const list = Array.from(files || []);
      if (!list.length) return;
      for (const file of list) {
        try {
          toast('Yükleniyor: ' + file.name);
          await uploadFile(file);
        } catch (err) {
          toast(file.name + ': ' + err.message, 'error');
        }
      }
      await refreshMedia();
      draw();
      toast('Yükleme tamamlandı.', 'ok');
    };

    $('#mediaUploadBtn').addEventListener('click', () => $('#mediaFile').click());
    $('#mediaFile').addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    const dz = $('#dropzone');
    dz.addEventListener('click', () => $('#mediaFile').click());
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('dragover');
    });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    grid.addEventListener('click', async (e) => {
      const copyBtn = e.target.closest('button[data-copy]');
      if (copyBtn) {
        const url = location.origin + copyBtn.dataset.copy;
        try {
          await navigator.clipboard.writeText(url);
          toast('Kopyalandı: ' + url, 'ok');
        } catch (_) {
          toast(url);
        }
        return;
      }

      const removeBtn = e.target.closest('button[data-remove]');
      if (removeBtn) {
        if (!confirm(removeBtn.dataset.remove + ' silinsin mi?')) return;
        try {
          await api('/api/media/' + encodeURIComponent(removeBtn.dataset.remove), { method: 'DELETE' });
          await refreshMedia();
          draw();
          toast('Fotoğraf silindi.', 'ok');
        } catch (err) {
          toast(err.message, 'error');
        }
        return;
      }

      const img = e.target.closest('img[data-preview]');
      if (img) window.open(img.dataset.preview, '_blank', 'noopener');
    });

    draw();
  }

  /* ═══════════════════════════════════════════════
     AYARLAR
     ═══════════════════════════════════════════════ */
  function renderSettings() {
    setHead('Site Ayarları', '<button type="button" class="btn btn-sm btn-ok" id="saveSettings">KAYDET</button>');

    const s = state.settings || {};
    let aboutImage = s.aboutImage || '';

    $('#view').innerHTML = `
      <div class="panel">
        <h2>// kimlik</h2>
        <div class="row row-2">
          <div class="field">
            <label for="sTitle">Site başlığı</label>
            <input type="text" id="sTitle" value="${esc(s.title || 'retro::blog')}">
          </div>
          <div class="field">
            <label for="sSlogan">Slogan</label>
            <input type="text" id="sSlogan" value="${esc(s.slogan || '')}">
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>// hakkında</h2>
        <div class="field">
          <label for="sAbout">Hakkında metni</label>
          <textarea id="sAbout" rows="5">${esc(s.aboutText || '')}</textarea>
        </div>
        <div class="field">
          <label for="sAbout2">Alt satır</label>
          <input type="text" id="sAbout2" value="${esc(s.aboutSecondary || '')}">
        </div>
        <div class="field" style="margin-bottom:0;">
          <label>Profil fotoğrafı</label>
          <div class="cover-actions" style="margin-bottom:10px;">
            <button type="button" class="btn btn-sm" id="aboutUpload">YÜKLE</button>
            <button type="button" class="btn btn-sm btn-ghost" id="aboutPick">KÜTÜPHANE</button>
            <button type="button" class="btn btn-sm btn-danger" id="aboutClear">KALDIR</button>
          </div>
          <div class="cover-box" id="aboutPreview" style="max-width:240px;"></div>
          <span class="help">Boş bırakırsan otomatik pixel-art portre kullanılır.</span>
          <input type="file" id="aboutFile" accept="image/*" hidden>
        </div>
      </div>

      <div class="panel">
        <h2>// alt bilgi</h2>
        <div class="row row-2">
          <div class="field" style="margin-bottom:0;">
            <label for="sFooter">Footer yazısı</label>
            <input type="text" id="sFooter" value="${esc(s.footerText || '')}">
          </div>
          <div class="field" style="margin-bottom:0;">
            <label for="sFooterMeta">Footer alt satır</label>
            <input type="text" id="sFooterMeta" value="${esc(s.footerMeta || '')}">
          </div>
        </div>
      </div>

      <p class="muted">Değişikliklerin gerçek siteye yansıması için <b>Yayınla</b> sekmesinden GitHub'a göndermelisin.</p>
    `;

    const f = (id) => document.getElementById(id);

    const updateAboutPreview = () => {
      f('aboutPreview').innerHTML = aboutImage
        ? '<img src="' + esc(aboutImage) + '" alt="profil">'
        : '<span class="muted" style="font-size:16px;">pixel-art (otomatik)</span>';
    };
    updateAboutPreview();

    f('aboutUpload').addEventListener('click', () => f('aboutFile').click());
    f('aboutFile').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const res = await uploadFile(file);
        aboutImage = res.url;
        updateAboutPreview();
        await refreshMedia();
        toast('Profil fotoğrafı yüklendi.', 'ok');
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    f('aboutPick').addEventListener('click', () => {
      openMediaPicker((url) => {
        aboutImage = url;
        updateAboutPreview();
      });
    });

    f('aboutClear').addEventListener('click', () => {
      aboutImage = '';
      updateAboutPreview();
    });

    $('#saveSettings').addEventListener('click', async () => {
      const btn = $('#saveSettings');
      btn.disabled = true;
      try {
        const res = await api('/api/settings', {
          method: 'PUT',
          body: {
            title: f('sTitle').value,
            slogan: f('sSlogan').value,
            aboutText: f('sAbout').value,
            aboutSecondary: f('sAbout2').value,
            aboutImage,
            footerText: f('sFooter').value,
            footerMeta: f('sFooterMeta').value
          }
        });
        state.settings = res.settings;
        toast('Ayarlar kaydedildi. Yayınla sekmesinden GitHub\'a gönderebilirsin.', 'ok');
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ═══════════════════════════════════════════════
     YAYINLA
     ═══════════════════════════════════════════════ */
  function renderPublish() {
    setHead('Yayınla', '<button type="button" class="btn btn-sm btn-ghost" id="refreshGit">YENİLE</button>');

    const g = state.git || { repo: false, changes: [], branch: '', remote: '' };
    const hasChanges = g.changes && g.changes.length > 0;

    const changesHtml = hasChanges
      ? '<ul class="change-list">' + g.changes.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul>'
      : '<p class="muted">Gönderilmemiş değişiklik yok.</p>';

    $('#view').innerHTML = `
      <div class="panel">
        <h2>// git durumu</h2>
        <p>
          ${g.repo ? '<span class="git-badge">git deposu bağlı</span>' : '<span class="git-badge off">git deposu yok</span>'}
        </p>
        ${g.repo ? `
          <p class="muted">dal: <b>${esc(g.branch || '—')}</b></p>
          <p class="muted" style="word-break:break-all;">remote: ${esc(g.remote || '—')}</p>
        ` : `
          <div class="notice" style="margin-top:14px;">
            <strong>Bu klasör bir git deposu değil.</strong><br>
            Projeyi GitHub deposunun içine kopyalayıp tekrar dene:<br><br>
            <code>git clone https://github.com/KULLANICI/REPO.git</code><br>
            <code>cd REPO</code><br>
            <code>npm install</code><br>
            <code>npm start</code>
          </div>
        `}
      </div>

      <div class="panel">
        <h2>// gönderilecek değişiklikler</h2>
        ${changesHtml}
      </div>

      <div class="panel">
        <h2>// github'a gönder</h2>
        <div class="field">
          <label for="commitMsg">Commit mesajı</label>
          <input type="text" id="commitMsg" placeholder="blog: yeni yazı eklendi" ${g.repo ? '' : 'disabled'}>
          <span class="help">Boş bırakırsan otomatik bir mesaj yazılır.</span>
        </div>
        <button type="button" class="btn btn-ok" id="publishBtn" ${g.repo && hasChanges ? '' : 'disabled'}>
          GITHUB'A GÖNDER ⇧
        </button>
        <p class="muted" style="margin-top:14px;">
          Gönderdikten sonra Cloudflare Pages repoyu yeniden derler ve siten ~1 dakika içinde güncellenir.
        </p>
      </div>

      <div class="panel">
        <h2>// yedek</h2>
        <div class="head-actions">
          <button type="button" class="btn btn-sm btn-ghost" id="backupBtn">YEDEK İNDİR (.json)</button>
          <button type="button" class="btn btn-sm btn-ghost" id="restoreBtn">YEDEKTEN GERİ YÜKLE</button>
        </div>
        <input type="file" id="restoreFile" accept="application/json,.json" hidden>
        <p class="muted" style="margin-top:14px;">
          Yedek, tüm yazıları ve site ayarlarını tek bir JSON dosyasında saklar.
        </p>
      </div>
    `;

    $('#refreshGit').addEventListener('click', async () => {
      try {
        state.git = await api('/api/git');
        renderPublish();
        toast('Git durumu yenilendi.', 'ok');
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    const publishBtn = $('#publishBtn');
    if (publishBtn) {
      publishBtn.addEventListener('click', async () => {
        publishBtn.disabled = true;
        publishBtn.textContent = 'GÖNDERİLİYOR...';
        try {
          const res = await api('/api/publish', {
            method: 'POST',
            body: { message: $('#commitMsg').value }
          });
          toast(res.message || 'GitHub\'a gönderildi.', 'ok');
          await loadAll();
          renderPublish();
        } catch (err) {
          toast(err.message, 'error');
          publishBtn.disabled = false;
          publishBtn.textContent = 'GITHUB\'A GÖNDER ⇧';
        }
      });
    }

    $('#backupBtn').addEventListener('click', () => {
      window.location.href = '/api/backup';
    });

    $('#restoreBtn').addEventListener('click', () => $('#restoreFile').click());
    $('#restoreFile').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (!confirm('Yedekten geri yüklensin mi? Mevcut yazılar bununla değiştirilecek.')) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        await api('/api/restore', { method: 'POST', body: parsed });
        await loadAll();
        toast('Yedek geri yüklendi.', 'ok');
        renderPublish();
      } catch (err) {
        toast('Geri yükleme başarısız: ' + err.message, 'error');
      }
    });
  }

  /* ═══════════════════════════════════════════════
     MEDYA SEÇİCİ
     ═══════════════════════════════════════════════ */
  function openMediaPicker(onPick) {
    const dlg = $('#mediaPicker');
    const grid = $('#pickerGrid');

    const draw = () => {
      grid.innerHTML = state.media.length
        ? state.media.map((m) => `
            <button type="button" data-url="${esc(m.url)}">
              <img src="${esc(m.url)}" alt="${esc(m.name)}" loading="lazy">
            </button>`).join('')
        : '<p class="muted">Kütüphane boş. Önce Medya sekmesinden fotoğraf yükle.</p>';
    };

    draw();
    refreshMedia().then(draw);

    grid.onclick = (e) => {
      const btn = e.target.closest('button[data-url]');
      if (!btn) return;
      dlg.close();
      onPick(btn.dataset.url);
    };

    $('#pickerClose').onclick = () => dlg.close();

    if (!dlg.open) dlg.showModal();
  }

  /* ═══════════════════════════════════════════════
     BAŞLAT
     ═══════════════════════════════════════════════ */
  async function boot() {
    const alive = await fetch('/api/health')
      .then((r) => r.ok)
      .catch(() => false);

    if (!alive) {
      $('#serverNotice').hidden = false;
      showLogin();
      return;
    }

    let session = { loggedIn: false };
    try {
      session = await fetch('/api/session').then((r) => r.json());
    } catch (_) { /* yoksay */ }

    if (session.loggedIn) {
      showApp();
      try {
        await loadAll();
      } catch (err) {
        toast(err.message, 'error');
      }
      route();
    } else {
      showLogin();
    }
  }

  /* ───────────── olaylar ───────────── */
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#loginBtn');
    const err = $('#loginError');
    err.hidden = true;
    btn.disabled = true;

    try {
      await api('/api/login', {
        method: 'POST',
        body: { password: $('#password').value }
      });
      $('#password').value = '';
      showApp();
      await loadAll();
      route();
    } catch (e2) {
      err.textContent = e2.message;
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try { await api('/api/logout', { method: 'POST' }); } catch (_) { /* yoksay */ }
    showLogin();
  });

  $$('.side-nav button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.dirty && !confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğine emin misin?')) return;
      state.dirty = false;
      const target = '#' + btn.dataset.view;
      if (location.hash === target) route();
      else location.hash = target;
    });
  });

  window.addEventListener('hashchange', route);

  window.addEventListener('beforeunload', (e) => {
    if (!state.dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  boot();
})();
