'use strict';

/* ============================================================
   retro::blog — yerel admin sunucusu
   Çalıştır:  npm start     →  http://localhost:3000
   Panel:     http://localhost:3000/admin.html
   ============================================================ */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');

/* ───────────── küçük .env okuyucu (ek paket gerekmez) ───────────── */
(function loadEnv() {
  const p = path.join(__dirname, '.env');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
})();

/* ───────────── sabitler ───────────── */
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');
const BACKUP_FILE = path.join(DATA_DIR, 'posts.backup.json');
const UPLOAD_DIR = path.join(ROOT, 'uploads');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'retro123';
const SESSION_TTL = 1000 * 60 * 60 * 12; // 12 saat

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16mb' }));

/* ───────────── yardımcılar ───────────── */
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

function estimateReadTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + ' min';
}

function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function safeEqual(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

/* ───────────── veri okuma / yazma ───────────── */
let writeChain = Promise.resolve();

async function readData() {
  const raw = await fsp.readFile(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.posts)) data.posts = [];
  if (!data.settings) data.settings = {};
  return data;
}

function writeData(data) {
  // aynı anda iki yazma olursa sıraya sok (önceki hata olsa bile zincir devam etsin)
  writeChain = writeChain.catch(() => {}).then(async () => {
    data.updatedAt = new Date().toISOString();
    const json = JSON.stringify(data, null, 2);

    // eski dosyanın yedeğini sakla
    try {
      await fsp.copyFile(DATA_FILE, BACKUP_FILE);
    } catch (_) { /* ilk çalıştırma */ }

    const tmp = DATA_FILE + '.tmp';
    await fsp.writeFile(tmp, json, 'utf8');
    await fsp.rename(tmp, DATA_FILE);
  });
  return writeChain;
}

/* ───────────── oturumlar ───────────── */
const sessions = new Map(); // token -> expiresAt
const loginAttempts = new Map(); // ip -> { count, until }

function requireAuth(req, res, next) {
  const token = parseCookies(req).admin_session;
  const exp = token ? sessions.get(token) : null;
  if (exp && exp > Date.now()) return next();
  if (token) sessions.delete(token);
  res.status(401).json({ error: 'Oturum yok veya süresi doldu.' });
}

/* ───────────── yükleme (multer) ───────────── */
const imageExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const base = slugify(path.basename(file.originalname || 'img', path.extname(file.originalname || ''))).slice(0, 40) || 'img';
      cb(null, `${Date.now().toString(36)}-${base}${imageExt.has(ext) ? ext : '.png'}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const okType = /^image\/(png|jpeg|gif|webp|avif)$/.test(file.mimetype || '');
    if (okType && imageExt.has(ext)) return cb(null, true);
    cb(new Error('Sadece PNG / JPG / GIF / WEBP / AVIF yükleyebilirsin.'));
  }
});

/* ───────────── git yardımcıları ───────────── */
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd: ROOT, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stdout: stdout || '', stderr: stderr || '' }));
      resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
  });
}

async function gitStatus() {
  try {
    await run('git', ['rev-parse', '--is-inside-work-tree']);
  } catch (_) {
    return { repo: false, changes: [], branch: '', remote: '' };
  }
  let changes = [];
  let branch = '';
  let remote = '';
  try {
    const { stdout } = await run('git', ['status', '--porcelain']);
    changes = stdout.split(/\r?\n/).filter(Boolean);
  } catch (_) { /* yoksay */ }
  try {
    branch = (await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.trim();
  } catch (_) { /* yoksay */ }
  try {
    remote = (await run('git', ['remote', 'get-url', 'origin'])).stdout.trim();
  } catch (_) { /* yoksay */ }
  return { repo: true, changes, branch, remote };
}

/* ============================================================
   API
   ============================================================ */

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'retro-blog-admin' }));

/* --- giriş --- */
app.post('/api/login', (req, res) => {
  const ip = req.ip || 'unknown';
  const rec = loginAttempts.get(ip);
  if (rec && rec.until > Date.now()) {
    return res.status(429).json({ error: `Çok fazla deneme. ${Math.ceil((rec.until - Date.now()) / 1000)} sn bekle.` });
  }

  const password = String(req.body.password || '');
  if (!safeEqual(password, ADMIN_PASSWORD)) {
    const count = (rec && rec.count ? rec.count : 0) + 1;
    loginAttempts.set(ip, { count, until: count >= 5 ? Date.now() + 60_000 : 0 });
    return res.status(401).json({ error: 'Şifre yanlış.' });
  }

  loginAttempts.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: SESSION_TTL
  });
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const token = parseCookies(req).admin_session;
  if (token) sessions.delete(token);
  res.clearCookie('admin_session');
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const token = parseCookies(req).admin_session;
  const exp = token ? sessions.get(token) : null;
  res.json({ loggedIn: Boolean(exp && exp > Date.now()) });
});

/* --- yazılar --- */
app.get('/api/posts', requireAuth, async (_req, res, next) => {
  try {
    const data = await readData();
    res.json({ posts: data.posts, settings: data.settings, updatedAt: data.updatedAt || null });
  } catch (e) { next(e); }
});

app.post('/api/posts', requireAuth, async (req, res, next) => {
  try {
    const data = await readData();
    const post = normalizePost(req.body, null);
    post.slug = uniqueSlug(post.slug, data.posts, null);
    data.posts.unshift(post);
    await writeData(data);
    res.json({ ok: true, post });
  } catch (e) { next(e); }
});

app.put('/api/posts/:id', requireAuth, async (req, res, next) => {
  try {
    const data = await readData();
    const idx = data.posts.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Yazı bulunamadı.' });

    const post = normalizePost({ ...req.body, id: data.posts[idx].id }, data.posts[idx]);
    post.slug = uniqueSlug(post.slug, data.posts, post.id);
    data.posts[idx] = post;
    await writeData(data);
    res.json({ ok: true, post });
  } catch (e) { next(e); }
});

app.delete('/api/posts/:id', requireAuth, async (req, res, next) => {
  try {
    const data = await readData();
    const before = data.posts.length;
    data.posts = data.posts.filter((p) => p.id !== req.params.id);
    if (data.posts.length === before) return res.status(404).json({ error: 'Yazı bulunamadı.' });
    await writeData(data);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* --- site ayarları --- */
app.put('/api/settings', requireAuth, async (req, res, next) => {
  try {
    const data = await readData();
    const body = req.body || {};
    data.settings = {
      ...data.settings,
      title: String(body.title ?? data.settings.title ?? 'retro::blog'),
      slogan: String(body.slogan ?? data.settings.slogan ?? ''),
      aboutText: String(body.aboutText ?? data.settings.aboutText ?? ''),
      aboutSecondary: String(body.aboutSecondary ?? data.settings.aboutSecondary ?? ''),
      aboutImage: String(body.aboutImage ?? data.settings.aboutImage ?? ''),
      footerText: String(body.footerText ?? data.settings.footerText ?? ''),
      footerMeta: String(body.footerMeta ?? data.settings.footerMeta ?? ''),
      accent: String(body.accent ?? data.settings.accent ?? '')
    };
    await writeData(data);
    res.json({ ok: true, settings: data.settings });
  } catch (e) { next(e); }
});

/* --- fotoğraflar --- */
app.post('/api/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Yükleme başarısız.' });
    if (!req.file) return res.status(400).json({ error: 'Dosya gelmedi.' });
    res.json({
      ok: true,
      url: `/uploads/${req.file.filename}`,
      name: req.file.filename,
      size: req.file.size
    });
  });
});

app.get('/api/media', requireAuth, async (_req, res, next) => {
  try {
    const names = await fsp.readdir(UPLOAD_DIR);
    const files = [];
    for (const name of names) {
      if (name.startsWith('.')) continue;
      if (!imageExt.has(path.extname(name).toLowerCase())) continue;
      const st = await fsp.stat(path.join(UPLOAD_DIR, name));
      files.push({
        name,
        url: `/uploads/${name}`,
        size: st.size,
        modified: st.mtime.toISOString()
      });
    }
    files.sort((a, b) => b.modified.localeCompare(a.modified));
    res.json({ files });
  } catch (e) { next(e); }
});

app.delete('/api/media/:name', requireAuth, async (req, res, next) => {
  try {
    const name = path.basename(req.params.name);
    if (!imageExt.has(path.extname(name).toLowerCase())) {
      return res.status(400).json({ error: 'Geçersiz dosya.' });
    }
    await fsp.unlink(path.join(UPLOAD_DIR, name));
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'ENOENT') return res.status(404).json({ error: 'Dosya bulunamadı.' });
    next(e);
  }
});

/* --- yedekleme --- */
app.get('/api/backup', requireAuth, (_req, res) => {
  const stamp = new Date().toISOString().slice(0, 10);
  res.download(DATA_FILE, `retro-blog-yedek-${stamp}.json`);
});

app.post('/api/restore', requireAuth, async (req, res, next) => {
  try {
    const incoming = req.body;
    if (!incoming || !Array.isArray(incoming.posts)) {
      return res.status(400).json({ error: 'Geçersiz yedek dosyası.' });
    }
    const data = await readData();
    data.posts = incoming.posts.map((p) => normalizePost(p, p));
    if (incoming.settings) data.settings = { ...data.settings, ...incoming.settings };
    await writeData(data);
    res.json({ ok: true, posts: data.posts });
  } catch (e) { next(e); }
});

/* --- yayınlama (git) --- */
app.get('/api/git', requireAuth, async (_req, res, next) => {
  try { res.json(await gitStatus()); } catch (e) { next(e); }
});

app.post('/api/publish', requireAuth, async (req, res, next) => {
  try {
    const status = await gitStatus();
    if (!status.repo) {
      return res.status(400).json({
        error: 'Bu klasör bir git deposu değil. Projeyi GitHub deposunun içine kopyalayıp tekrar dene.'
      });
    }
    if (!status.changes.length) {
      return res.json({ ok: true, message: 'Gönderilecek değişiklik yok.' });
    }

    const rawMsg = String(req.body.message || '').trim();
    const message = rawMsg || `blog: içerik güncellendi (${new Date().toLocaleString('tr-TR')})`;

    await run('git', ['add', '-A']);

    let commitOutput = '';
    try {
      const r = await run('git', ['commit', '-m', message]);
      commitOutput = r.stdout + r.stderr;
    } catch (e) {
      const text = (e.stdout || '') + (e.stderr || '');
      if (!/nothing to commit/i.test(text)) {
        return res.status(500).json({ error: 'Commit başarısız. git user.name / user.email ayarlı mı?\n' + text.trim() });
      }
    }

    let pushOutput = '';
    try {
      const r = await run('git', ['push']);
      pushOutput = r.stdout + r.stderr;
    } catch (e) {
      return res.status(500).json({
        error: 'Push başarısız. GitHub bağlantısını kontrol et.\n' + ((e.stdout || '') + (e.stderr || '')).trim()
      });
    }

    res.json({ ok: true, message: 'GitHub\'a gönderildi. Cloudflare Pages ~1 dakika içinde yayınlar.', commitOutput, pushOutput });
  } catch (e) { next(e); }
});

/* ============================================================
   statik dosyalar
   ============================================================ */

// NOT: kök klasörü komple açmıyoruz — server.js / .env gibi dosyalar dışarıda kalır.
app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// blogun okuduğu veri: sadece YAYINDAKİ yazılar
app.get('/data/posts.json', async (_req, res, next) => {
  try {
    const data = await readData();
    const published = data.posts
      .filter((p) => p.status === 'published')
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    res.json({ settings: data.settings, posts: published });
  } catch (e) { next(e); }
});

// admin'in kullandığı tam veri (taslaklar dahil) — panel API üzerinden alır
const pages = ['/', '/index.html', '/post.html', '/admin.html'];
for (const page of pages) {
  app.get(page, (req, res) => {
    const file = page === '/' ? 'index.html' : page.slice(1);
    res.sendFile(path.join(ROOT, file), (err) => {
      if (err) res.status(404).send('Sayfa bulunamadı');
    });
  });
}

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı: ' + req.path }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Sunucu hatası' });
});

/* ───────────── yardımcı: post normalize ───────────── */
function normalizePost(input, existing) {
  const now = new Date().toISOString();
  const title = String(input.title || '').trim() || 'Başlıksız';
  const content = String(input.content || '');

  const tags = Array.isArray(input.tags)
    ? input.tags
    : String(input.tags || '').split(',');

  return {
    id: (existing && existing.id) || input.id || crypto.randomUUID(),
    slug: slugify(input.slug || title) || 'yazi',
    title,
    date: String(input.date || '').slice(0, 10) || now.slice(0, 10),
    readTime: String(input.readTime || '').trim() || estimateReadTime(content),
    excerpt: String(input.excerpt || '').trim(),
    cover: String(input.cover || '').trim(),
    glyph: String(input.glyph || '').trim() || '▓▒░\n░▓▒\n▒░▓',
    tags: tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 20),
    content,
    status: input.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(input.featured),
    createdAt: (existing && existing.createdAt) || input.createdAt || now,
    updatedAt: now
  };
}

function uniqueSlug(base, posts, ignoreId) {
  let slug = base || 'yazi';
  let n = 2;
  const taken = new Set(posts.filter((p) => p.id !== ignoreId).map((p) => p.slug));
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

/* ───────────── başlat ───────────── */
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │  retro::blog admin sunucusu çalışıyor       │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
  console.log(`  Blog   :  http://localhost:${PORT}/`);
  console.log(`  Panel  :  http://localhost:${PORT}/admin.html`);
  console.log('');
  console.log(`  Şifre  :  .env dosyasındaki ADMIN_PASSWORD`);
  console.log('');
});
