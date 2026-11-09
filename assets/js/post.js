/* ═══════════════════════════════════════════════════════════
   retro::blog — tek yazı sayfası
   URL: post.html?slug=yazi-slug
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const root = document.getElementById('postRoot');
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const params = new URLSearchParams(location.search);
  const wanted = params.get('slug') || params.get('id') || '';

  fetch('data/posts.json', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((data) => {
      const settings = data.settings || {};
      if (settings.title) {
        document.querySelectorAll('[data-site-title]').forEach((el) => { el.textContent = settings.title; });
      }
      if (settings.footerText) {
        document.getElementById('footerText').textContent = settings.footerText;
      }

      const posts = (data.posts || [])
        .filter((p) => p.status === 'published' || !p.status)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

      const index = posts.findIndex((p) => p.slug === wanted || p.id === wanted);
      if (index === -1) return renderNotFound();

      const post = posts[index];
      renderPost(post, settings, posts[index - 1], posts[index + 1]);
    })
    .catch((err) => {
      root.innerHTML = '<p class="post-empty">// yazı yüklenemedi: ' + esc(err.message) + '<br><a href="index.html">◂ ana sayfaya dön</a></p>';
    });

  function renderPost(post, settings, prev, next) {
    document.title = post.title + ' // ' + (settings.title || 'retro::blog');

    const tags = (post.tags || []).length
      ? `<div class="post-tags">${post.tags.map((t) => `<span class="post-tag">#${esc(t)}</span>`).join('')}</div>`
      : '';

    const cover = post.cover
      ? `<img class="post-cover" src="${esc(post.cover)}" alt="${esc(post.title)}">`
      : '';

    const body = window.RetroMD ? RetroMD.render(post.content) : '<p>' + esc(post.content) + '</p>';

    const navLinks = [
      prev ? `<a href="post.html?slug=${encodeURIComponent(prev.slug || prev.id)}">◂ ${esc(prev.title)}</a>` : '',
      next ? `<a href="post.html?slug=${encodeURIComponent(next.slug || next.id)}" style="text-align:right;">${esc(next.title)} ▸</a>` : ''
    ].join('');

    root.innerHTML = `
      <a class="back-link" href="index.html#posts">◂ cd /posts</a>
      <h1>${esc(post.title)}</h1>
      <div class="post-meta">
        <span>${esc(post.date)}</span>
        <span>◈ ${esc(post.readTime || '1 min')}</span>
      </div>
      ${tags ? `<div style="margin-bottom:28px;">${tags}</div>` : ''}
      ${cover}
      <article class="article-body">${body}</article>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:64px;padding-top:24px;border-top:1px dashed var(--slate-grey);font-family:var(--font-terminal);font-size:20px;">
        ${navLinks}
      </div>
    `;
  }

  function renderNotFound() {
    document.title = '404 // retro::blog';
    root.innerHTML = `
      <p class="post-empty">
        // 404 — transmission not found<br><br>
        <a href="index.html">◂ ana sayfaya dön</a>
      </p>
    `;
  }
})();
