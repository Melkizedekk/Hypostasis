/* ═══════════════════════════════════════════════════════════
   RetroMD — minik markdown çevirici (bağımlılıksız)
   Kullanım:  RetroMD.render("# başlık\n\nmetin")
   Destekler: başlık, paragraf, kalın, italik, üstü çizili,
              satır içi kod, kod bloğu, liste, alıntı, link,
              resim, yatay çizgi
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(raw) {
    const url = String(raw || '').trim();
    if (/^(https?:\/\/|mailto:|tel:|\/|#|\.{1,2}\/)/i.test(url)) return url;
    return '#';
  }

  function inline(escaped) {
    let out = escaped;
    out = out.replace(/`([^`]+)`/g, (_m, c) => '<code>' + c + '</code>');
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) =>
      '<img src="' + safeUrl(src) + '" alt="' + alt + '" loading="lazy">');
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, href) =>
      '<a href="' + safeUrl(href) + '">' + txt + '</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return out;
  }

  function render(markdown) {
    const lines = String(markdown == null ? '' : markdown).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    const para = [];
    let i = 0;

    function flushPara() {
      if (para.length) {
        out.push('<p>' + inline(para.join(' ')) + '</p>');
        para.length = 0;
      }
    }

    while (i < lines.length) {
      const raw = lines[i];
      const t = raw.trim();

      if (!t) { flushPara(); i++; continue; }

      /* kod bloğu */
      if (t.startsWith('```')) {
        flushPara();
        const lang = t.slice(3).trim();
        const buf = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          buf.push(lines[i]);
          i++;
        }
        i++; // kapanışı atla
        out.push('<pre><code' + (lang ? ' data-lang="' + escapeHtml(lang) + '"' : '') + '>' +
          escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      /* başlık */
      const h = t.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushPara();
        const level = Math.min(6, h[1].length);
        out.push('<h' + level + '>' + inline(escapeHtml(h[2])) + '</h' + level + '>');
        i++;
        continue;
      }

      /* yatay çizgi */
      if (/^([-*_])\1{2,}$/.test(t)) {
        flushPara();
        out.push('<hr>');
        i++;
        continue;
      }

      /* alıntı */
      if (/^>\s?/.test(t)) {
        flushPara();
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          buf.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + render(buf.join('\n')) + '</blockquote>');
        continue;
      }

      /* sırasız liste */
      if (/^[-*+]\s+/.test(t)) {
        flushPara();
        const items = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
          i++;
        }
        out.push('<ul>' + items.map((it) => '<li>' + inline(escapeHtml(it)) + '</li>').join('') + '</ul>');
        continue;
      }

      /* sıralı liste */
      if (/^\d+[.)]\s+/.test(t)) {
        flushPara();
        const items = [];
        while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
          i++;
        }
        out.push('<ol>' + items.map((it) => '<li>' + inline(escapeHtml(it)) + '</li>').join('') + '</ol>');
        continue;
      }

      /* paragraf */
      para.push(escapeHtml(t));
      i++;
    }

    flushPara();
    return out.join('\n');
  }

  global.RetroMD = { render, escapeHtml };
})(window);
