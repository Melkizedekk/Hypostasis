/* ═══════════════════════════════════════════════════════════
   retro::blog — ana sayfa scripti
   Veriyi data/posts.json dosyasından okur.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const grid = document.getElementById('postGrid');
  const archiveRoot = document.getElementById('archiveRoot');

  /* ─── 1. VERİYİ ÇEK ─── */
  fetch('data/posts.json', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data) => {
      const settings = data.settings || {};
      const posts = (data.posts || [])
        .filter((p) => p.status === 'published' || !p.status)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

      applySettings(settings);
      renderPosts(posts);
      renderArchive(posts);
      buildSprite();
    })
    .catch((err) => {
      console.error(err);
      grid.innerHTML = '<p class="post-empty">// veri yüklenemedi: ' + esc(err.message) + '<br>// dosyayı bir sunucu üzerinden açmalısın (file:// çalışmaz)</p>';
    });

  /* ─── 2. SİTE AYARLARINI UYGULA ─── */
  function applySettings(s) {
    if (s.title) {
      document.querySelectorAll('[data-site-title]').forEach((el) => {
        el.textContent = el.classList.contains('hero-title')
          ? s.title.toUpperCase()
          : s.title;
      });
      document.title = s.title + ' // ARCH_SYNTH';
    }
    if (s.slogan) {
      document.querySelectorAll('[data-site-slogan]').forEach((el) => { el.textContent = s.slogan; });
    }
    const aboutText = document.getElementById('aboutText');
    const aboutSecondary = document.getElementById('aboutSecondary');
    const footerText = document.getElementById('footerText');
    const footerMeta = document.getElementById('footerMeta');

    if (s.aboutText) aboutText.textContent = s.aboutText;
    if (s.aboutSecondary) aboutSecondary.textContent = s.aboutSecondary;
    if (s.footerText) footerText.textContent = s.footerText;
    if (s.footerMeta) footerMeta.textContent = s.footerMeta;

    const media = document.getElementById('aboutMedia');
    if (s.aboutImage) {
      media.innerHTML = `<img class="about-photo" src="${esc(s.aboutImage)}" alt="Portrait of the author">`;
      media.removeAttribute('role');
      media.removeAttribute('aria-label');
    }
  }

  /* ─── 3. POST KARTLARI ─── */
  function renderPosts(posts) {
    if (!posts.length) {
      grid.innerHTML = '<p class="post-empty">// no transmissions yet<span class="blink">▮</span></p>';
      return;
    }

    grid.innerHTML = posts.map((p) => {
      const thumb = p.cover
        ? `<img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">`
        : `<pre class="pixel-glyph">${esc(p.glyph || '▓▒░\n░▓▒\n▒░▓')}</pre>`;

      const tags = (p.tags || []).length
        ? `<div class="post-tags">${p.tags.map((t) => `<span class="post-tag">#${esc(t)}</span>`).join('')}</div>`
        : '';

      const url = 'post.html?slug=' + encodeURIComponent(p.slug || p.id);

      return `
        <article class="post-card" aria-label="Blog post: ${esc(p.title)}">
          <a class="post-thumb" href="${url}" aria-hidden="true" tabindex="-1">${thumb}</a>
          <h3><a href="${url}">${esc(p.title)}</a></h3>
          <div class="post-meta">
            <span>${esc(p.date)}</span>
            <span>◈ ${esc(p.readTime || '1 min')}</span>
          </div>
          ${tags}
          <p class="post-excerpt">${esc(p.excerpt)}</p>
          <a href="${url}" class="post-read-link">READ ▸</a>
        </article>
      `;
    }).join('');
  }

  /* ─── 4. ARŞİV (yıla göre) ─── */
  function renderArchive(posts) {
    if (!posts.length) {
      archiveRoot.innerHTML = '<p class="post-empty">// empty</p>';
      return;
    }

    const byYear = new Map();
    posts.forEach((p) => {
      const year = String(p.date || '').slice(0, 4) || '----';
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(p);
    });

    const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

    archiveRoot.innerHTML = years.map((year) => `
      <div class="archive-year">
        <h3>${esc(year)} ▸</h3>
        <ul class="archive-list">
          ${byYear.get(year).map((p) => {
            const url = 'post.html?slug=' + encodeURIComponent(p.slug || p.id);
            return `<li><a href="${url}">${esc(p.title)}</a></li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');
  }

  /* ─── 5. ABOUT SPRITE (fotoğraf yoksa) ─── */
  function buildSprite() {
    const el = document.getElementById('aboutMedia');
    if (!el || el.querySelector('img')) return;

    el.className = 'about-sprite';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Pixel art portrait of the author');

    const palette = ['var(--ink-black)', 'var(--lavender-grey)', 'var(--slate-grey)', 'var(--space-indigo)', 'var(--shadow-grey)'];
    let html = '';
    for (let row = 0; row < 32; row++) {
      for (let col = 0; col < 32; col++) {
        let colorIndex;
        const dx = col - 16;
        const dy = row - 14;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 9) {
          if (dist < 3) colorIndex = 1;
          else if (dist < 7) colorIndex = 2;
          else colorIndex = 4;
        } else {
          colorIndex = (row + col) % 7 === 0 ? 3 : 0;
        }
        html += `<span style="background:${palette[colorIndex]}"></span>`;
      }
    }
    el.innerHTML = html;
  }

  /* ─── 6. SCROLL REVEAL & STICKY BAR ─── */
  const topBar = document.getElementById('topBar');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  window.addEventListener('scroll', () => {
    topBar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();
