/* script.js — Retro terminal blog functionality */

// === DATA ===
const posts = [
  {
    id: 1,
    perms: "drwxr-xr-x",
    user: "user",
    date: "2025-04-01",
    title: "Building a Tiling Window Manager Blog",
    content: `<h2>Building a Tiling Window Manager Blog</h2>
<p>I've always been fascinated by the <strong>retro terminal aesthetic</strong>. There's something deeply satisfying about a monospaced font, a dark background, and that blinking cursor.</p>
<h3>Why tiling?</h3>
<p>Tiling window managers like <code>bspwm</code> and <code>i3wm</code> force you to be organized. Every pixel is used. No overlapping windows, no wasted space.</p>
<p>This blog replicates that feeling in the browser using CSS Grid and a lot of love for the <code>#1a1b26</code> color palette.</p>
<blockquote>"The terminal is the most honest interface."</blockquote>
<p>I'll be posting more about my dotfiles, CSS tricks, and vanilla JS experiments here. Stay tuned.</p>`
  },
  {
    id: 2,
    perms: "-rw-r--r--",
    user: "user",
    date: "2025-03-28",
    title: "CSS Grid is the New Tiling WM",
    content: `<h2>CSS Grid is the New Tiling WM</h2>
<p>Who needs a window manager when you have <code>display: grid</code>?</p>
<h3>The grid template</h3>
<p>I used a simple two-column layout with a fixed sidebar and a flexible main area. The bottom bar is a separate flex container.</p>
<pre><code>.tiling-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  grid-template-rows: 1fr 0.9fr;
  gap: 6px;
}</code></pre>
<p>Combined with <code>backdrop-filter: blur()</code>, the panels feel like real floating windows in a compositor.</p>`
  },
  {
    id: 3,
    perms: "-rw-r--r--",
    user: "user",
    date: "2025-03-20",
    title: "Vanilla JS Terminal Command Line",
    content: `<h2>Vanilla JS Terminal Command Line</h2>
<p>Adding a fake terminal input at the bottom was the most fun part. It's just an <code>&lt;input&gt;</code> with a keydown listener.</p>
<h3>Supported commands</h3>
<p>Type <code>help</code> to see the list. Currently:</p>
<pre><code>help   — show this message
ls     — list blog posts
clear  — clear the terminal
about  — show about info
date   — show current date</code></pre>
<p>The best part? It doesn't actually do much. It just prints text. But it <em>feels</em> like a real terminal.</p>`
  },
  {
    id: 4,
    perms: "-rw-r--r--",
    user: "user",
    date: "2025-03-15",
    title: "Tokyo Night Color Palette",
    content: `<h2>Tokyo Night Color Palette</h2>
<p>The palette is everything. I'm using a slightly modified <strong>Tokyo Night</strong> theme:</p>
<ul>
<li>Background: <code>#1a1b26</code></li>
<li>Foreground: <code>#c0caf5</code></li>
<li>Cyan: <code>#7dcfff</code></li>
<li>Purple: <code>#bb9af7</code></li>
<li>Green: <code>#9ece6a</code></li>
</ul>
<p>These colors are easy on the eyes and have that perfect "terminal from 2010" vibe.</p>`
  },
  {
    id: 5,
    perms: "-rw-r--r--",
    user: "user",
    date: "2025-03-10",
    title: "Custom Scrollbars for Days",
    content: `<h2>Custom Scrollbars for Days</h2>
<p>One of the small details that makes this theme feel cohesive is the scrollbar styling.</p>
<pre><code>::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #1a1b26;
  border-left: 1px solid #3b4261;
}
::-webkit-scrollbar-thumb {
  background: #7dcfff;
}</code></pre>
<p>Thin, dark, cyan thumb. Perfect.</p>`
  }
];

// === DOM ELEMENTS ===
const postList = document.getElementById('post-list');
const postCount = document.getElementById('post-count');
const currentDate = document.getElementById('current-date');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const terminalInput = document.getElementById('terminal-input');
const datetimeEl = document.getElementById('datetime');
const cpuFill = document.getElementById('cpu-fill');
const cpuValue = document.getElementById('cpu-value');
const ramFill = document.getElementById('ram-fill');
const ramValue = document.getElementById('ram-value');

// === RENDER POSTS ===
function renderPosts() {
  postList.innerHTML = '';
  posts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.innerHTML = `
      <span class="post-perms">${post.perms}</span>
      <span class="post-user">${post.user}</span>
      <span class="post-date">${post.date}</span>
      <span class="post-title">${post.title}</span>
    `;
    item.addEventListener('click', () => openPost(post));
    postList.appendChild(item);
  });
  postCount.textContent = posts.length;
}

// === OPEN POST MODAL ===
function openPost(post) {
  modalTitle.textContent = post.title + '.md';
  modalBody.innerHTML = post.content;
  modalOverlay.classList.add('active');
}

// === CLOSE MODAL ===
function closeModal() {
  modalOverlay.classList.remove('active');
}

// === EVENT LISTENERS ===
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// === FAKE SYSTEM STATS ===
function updateStats() {
  // CPU (random 10–60%)
  const cpu = Math.floor(Math.random() * 50) + 10;
  cpuFill.style.width = cpu + '%';
  cpuValue.textContent = cpu + '%';
  // RAM (random 40–85%)
  const ram = Math.floor(Math.random() * 45) + 40;
  ramFill.style.width = ram + '%';
  ramValue.textContent = ram + '%';
}

// === CLOCK ===
function updateClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  datetimeEl.textContent = `${dateStr} ${timeStr}`;
  if (currentDate) {
    currentDate.textContent = `${dateStr} ${timeStr}`;
  }
}

// === TERMINAL COMMANDS ===
terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = terminalInput.value.trim().toLowerCase();
    terminalInput.value = '';

    if (!cmd) return;

    // Append output to the post list area (as a fake terminal line)
    const output = document.createElement('div');
    output.style.padding = '2px 12px';
    output.style.fontSize = '12px';
    output.style.color = '#c0caf5';
    output.style.borderLeft = '2px solid #bb9af7';
    output.style.marginTop = '2px';

    switch (cmd) {
      case 'help':
        output.innerHTML = `<span style="color:#7dcfff">Available commands:</span><br>
          help   — show this message<br>
          ls     — list blog posts<br>
          clear  — clear the terminal<br>
          about  — show about info<br>
          date   — show current date`;
        break;
      case 'ls':
        output.innerHTML = posts.map(p => 
          `<span style="color:#9ece6a">${p.perms}</span>  <span style="color:#7dcfff">${p.user}</span>  ${p.date}  <span style="color:#c0caf5">${p.title}</span>`
        ).join('<br>');
        break;
      case 'clear':
        // Clear all terminal output
        document.querySelectorAll('.terminal-output-line').forEach(el => el.remove());
        output.innerHTML = '';
        break;
      case 'about':
        output.innerHTML = `<span style="color:#bb9af7">About me:</span> Linux enthusiast, frontend developer, and retro terminal lover.`;
        break;
      case 'date':
        output.innerHTML = new Date().toString();
        break;
      default:
        output.innerHTML = `<span style="color:#f7768e">command not found: ${cmd}</span>`;
    }

    if (cmd === 'clear') {
      // Remove all previous output lines
      document.querySelectorAll('.terminal-output-line').forEach(el => el.remove());
    } else {
      output.classList.add('terminal-output-line');
      // Append to the posts panel content (before footer)
      const postsContent = document.querySelector('.posts-content');
      const footer = postsContent.querySelector('.terminal-footer');
      postsContent.insertBefore(output, footer);
      // Scroll to bottom
      const postListEl = document.getElementById('post-list');
      if (postListEl) postListEl.scrollTop = postListEl.scrollHeight;
    }
  }
});

// === INITIALIZATION ===
renderPosts();
updateStats();
updateClock();
setInterval(updateStats, 3000);
setInterval(updateClock, 1000);

// Focus terminal input on page load
window.addEventListener('load', () => {
  terminalInput.focus();
});

// Click anywhere on the page (except inputs) to focus terminal
document.addEventListener('click', (e) => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && 
      !e.target.closest('.modal-window') && !e.target.closest('.terminal-input-bar')) {
    terminalInput.focus();
  }
});
