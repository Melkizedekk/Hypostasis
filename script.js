// ===== BLOG DATA =====
const blogPosts = [
    {
        id: 1,
        title: "building-a-tiling-wm-blog",
        date: "2026-11-09",
        size: "4.2K",
        tags: ["css", "web", "design"],
        content: `
# Building a Tiling WM Blog

Ever wondered what it would look like if your blog was a Linux desktop? I did. So I built it.

## The Concept

The idea is simple: take the aesthetic of a tiling window manager (like bspwm or i3) and apply it to a blog layout. Every panel is a "window", every post is a "file", and the whole thing feels like you're working in a terminal.

## Key Design Decisions

- **Monospace everything**: No sans-serif fonts allowed. We use JetBrains Mono throughout.
- **Dark palette**: Inspired by Tokyo Night — deep blues, cyans, and purples.
- **CSS Grid for tiling**: The layout uses CSS Grid to create that perfect tiling effect.
- **Terminal listings**: Blog posts are displayed like \`ls -la\` output.

## The Code

The layout is built with pure CSS Grid:

\`\`\`css
.tiling-container {
    display: grid;
    grid-template-columns: 1fr 1.2fr 0.8fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
}
\`\`\`

Each panel gets a 1px border and a dark background, creating that classic WM look.

## What's Next?

I plan to add more interactive features — maybe a fake package manager for navigating tags, or a \`grep\` command for searching posts. Stay tuned.
        `
    },
    {
        id: 2,
        title: "why-i-switched-to-arch",
        date: "2026-11-05",
        size: "3.1K",
        tags: ["linux", "arch", "rant"],
        content: `
# Why I Switched to Arch Linux

It wasn't about the memes. Well, maybe a little.

## The Journey

I started on Ubuntu, moved to Fedora, tried Debian, and finally settled on Arch. Here's why.

## The Good

- **Rolling releases**: Always up to date. No more waiting 6 months for a new version.
- **AUR**: The Arch User Repository is incredible. Almost every piece of software is available.
- **Documentation**: The Arch Wiki is the best Linux documentation on the internet.
- **Minimalism**: You install only what you need. No bloat.

## The Bad

- **Updates can break things**: Occasionally, a package update will break your system.
- **Installation**: The manual install process is intimidating for beginners.
- **Time commitment**: Maintaining an Arch system takes more attention than Ubuntu.

## The Verdict

For developers and power users, Arch is hard to beat. For everyone else, maybe stick with something simpler.
        `
    },
    {
        id: 3,
        title: "css-grid-vs-flexbox-2026",
        date: "2026-10-28",
        size: "5.7K",
        tags: ["css", "web", "tutorial"],
        content: `
# CSS Grid vs Flexbox in 2026

It's been years since CSS Grid became widely supported. So when should you use which?

## Flexbox: One-Dimensional Layouts

Flexbox is perfect for:
- Navigation bars
- Button groups
- Card rows
- Centering content

\`\`\`css
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
\`\`\`

## Grid: Two-Dimensional Layouts

Grid shines when you need to control both rows and columns:
- Page layouts
- Dashboard panels
- Image galleries
- The tiling layout of this very blog!

\`\`\`css
.dashboard {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto 1fr auto;
    gap: 8px;
}
\`\`\`

## The Rule of Thumb

- **Flexbox** = content-first (let content determine layout)
- **Grid** = layout-first (define the layout, then place content)

In practice, I use both together. Flexbox for components, Grid for pages.
        `
    },
    {
        id: 4,
        title: "terminal-productivity-tips",
        date: "2026-10-20",
        size: "2.8K",
        tags: ["linux", "productivity", "terminal"],
        content: `
# Terminal Productivity Tips

Your terminal is more powerful than you think. Here are some tips to level up.

## 1. Learn Your Shell Shortcuts

- \`Ctrl+R\`: Reverse search through history
- \`Ctrl+A/E\`: Jump to start/end of line
- \`Alt+B/F\`: Jump back/forward by word
- \`Ctrl+U/K\`: Delete to start/end of line

## 2. Use \`fzf\` for Fuzzy Finding

\`\`\`bash
# Fuzzy find files
find . -type f | fzf

# Fuzzy search history
Ctrl+R (with fzf installed)
\`\`\`

## 3. Master \`tmux\`

Tmux lets you:
- Split terminal windows
- Keep sessions running after disconnect
- Switch between multiple terminal sessions

## 4. Alias Everything

\`\`\`bash
alias ll='ls -la --color=auto'
alias gs='git status'
alias gp='git pull'
alias ..='cd ..'
\`\`\`

## 5. Use \`ripgrep\` Instead of \`grep\`

\`\`\`bash
# rg is faster and has better defaults
rg "search term" .
\`\`\`

The terminal is your most powerful tool. Invest time in learning it.
        `
    },
    {
        id: 5,
        title: "minimalist-web-design",
        date: "2026-10-12",
        size: "3.4K",
        tags: ["design", "web", "minimalism"],
        content: `
# Minimalist Web Design

Less is more. But how much less is too little?

## Principles

1. **Remove the unnecessary**: Every element should serve a purpose.
2. **Whitespace is your friend**: Don't fear empty space.
3. **Limit your color palette**: 2-3 colors max, plus neutrals.
4. **Typography matters**: One good font beats three mediocre ones.

## What to Remove

- Hero images with stock photos
- Animated backgrounds
- Too many CTAs
- Social proof widgets
- Cookie banners (well, you need those legally...)

## What to Keep

- Clear navigation
- Readable typography
- Fast load times
- Accessibility features
- Content

## The Test

If you can remove an element and the page still works, remove it.
        `
    },
    {
        id: 6,
        title: "git-workflow-for-solo-devs",
        date: "2026-10-01",
        size: "2.2K",
        tags: ["git", "productivity", "tutorial"],
        content: `
# Git Workflow for Solo Developers

You don't need a complex branching strategy when you're working alone.

## My Simple Workflow

\`\`\`bash
# Main branch is always deployable
git checkout main

# Create feature branches
git checkout -b feature/new-thing

# Commit often with clear messages
git commit -m "feat: add new thing"

# Squash and merge when done
git checkout main
git merge --squash feature/new-thing
git commit -m "feat: add new thing"
\`\`\`

## Commit Message Convention

- \`feat:\` New feature
- \`fix:\` Bug fix
- \`docs:\` Documentation
- \`style:\` Formatting
- \`refactor:\` Code restructuring
- \`test:\` Adding tests

## Why This Works

- Clean history on main
- Easy to revert features
- No merge conflicts with yourself
- Simple to understand

Keep it simple. You're not Google.
        `
    },
    {
        id: 7,
        title: "neovim-setup-2026",
        date: "2026-09-22",
        size: "6.1K",
        tags: ["neovim", "linux", "productivity"],
        content: `
# My Neovim Setup in 2026

After years of tweaking, here's my current Neovim configuration.

## Core Plugins

- **lazy.nvim**: Plugin manager
- **treesitter**: Syntax highlighting
- **telescope**: Fuzzy finder
- **lspconfig**: Language server support
- **cmp**: Autocompletion

## Key Bindings

\`\`\`lua
-- Leader key is Space
vim.g.mapleader = " "

-- Telescope
vim.keymap.set('n', '<leader>ff', require('telescope.builtin').find_files)
vim.keymap.set('n', '<leader>fg', require('telescope.builtin').live_grep)

-- LSP
vim.keymap.set('n', 'gd', vim.lsp.buf.definition)
vim.keymap.set('n', 'K', vim.lsp.buf.hover)
\`\`\`

## Why Neovim?

- Modal editing is faster once you learn it
- Highly customizable
- Works over SSH
- No mouse needed
- It's in your terminal

## The Learning Curve

Yes, it's steep. Yes, it's worth it. Give it 2 weeks before judging.
        `
    },
    {
        id: 8,
        title: "cloudflare-pages-deployment",
        date: "2026-09-15",
        size: "1.9K",
        tags: ["web", "devops", "tutorial"],
        content: `
# Deploying to Cloudflare Pages

Free, fast, and simple. Here's how to deploy a static site.

## Steps

1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect your GitHub repository
4. Set build command: \`npm run build\` (or leave empty for static)
5. Set output directory: \`.\` (or \`dist\`, \`public\`, etc.)
6. Deploy!

## Why Cloudflare Pages?

- **Free tier**: 100GB bandwidth/month
- **Global CDN**: Fast everywhere
- **Custom domains**: Free SSL
- **Preview deployments**: Every PR gets a preview URL
- **Analytics**: Built-in

## Custom Domain

\`\`\`
# In Cloudflare DNS, add:
Type: CNAME
Name: blog
Content: <your-project>.pages.dev
\`\`\`

That's it. Your site is live.
        `
    }
];

const allTags = [...new Set(blogPosts.flatMap(p => p.tags))].sort();

// ===== ASCII ART =====
const asciiArt = `
    ██████╗ ██████╗ ██████╗ ███████╗
   ██╔════╝██╔═══██╗██╔══██╗██╔════╝
   ██║     ██║   ██║██║  ██║█████╗
   ██║     ██║   ██║██║  ██║██╔══╝
   ╚██████╗╚██████╔╝██████╔╝███████╗
    ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝

   ▄▄▄       ██▓███   ▄▄▄       ▄████▄   ██ ▄█▀
  ▒████▄    ▓██░  ██▒▒████▄    ▒██▀ ▀█   ██▄█▒
  ▒██  ▀█▄  ▓██░ ██▓▒▒██  ▀█▄  ▒▓█    ▄ ▓███▄░
  ░██▄▄▄▄██ ▒██▄█▓▒ ▒░██▄▄▄▄██ ▒▓▓▄ ▄██▒▓██ █▄
   ▓█   ▓██▒▒██▒ ░  ░ ▓█   ▓██▒▒ ▓███▀ ░▒██▒ █▄
   ▒▒   ▓▒█░▒▓▒░ ░  ░ ▒▒   ▓▒█░░ ░▒ ▒  ░▒ ▒▒ ▓▒
    ▒   ▒▒ ░░▒ ░       ▒   ▒▒ ░  ░  ▒   ░ ░▒ ▒░
    ░   ▒   ░░         ░   ▒   ░        ░ ░░ ░
        ░  ░               ░  ░░ ░      ░  ░
                          ░
`;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initCPUAnimation();
    renderBlogPosts();
    renderTags();
    renderAsciiArt();
    initCommandBar();
    initModal();
    initUptime();
});

// ===== CLOCK =====
function initClock() {
    const clockEl = document.getElementById('topbar-clock');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function update() {
        const now = new Date();
        const day = days[now.getDay()];
        const date = now.getDate().toString().padStart(2, '0');
        const month = months[now.getMonth()];
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clockEl.textContent = `${day} ${date} ${month} ${hours}:${minutes}`;
    }

    update();
    setInterval(update, 1000);
}

// ===== CPU ANIMATION =====
function initCPUAnimation() {
    const cpuGraph = document.getElementById('cpu-graph');
    const bars = [];
    const numBars = 20;

    for (let i = 0; i < numBars; i++) {
        bars.push(Math.random() * 100);
    }

    function updateCPU() {
        // Shift bars
        bars.shift();
        bars.push(Math.random() * 80 + 10);

        let graphHTML = '';
        bars.forEach((val, i) => {
            const height = Math.floor(val / 100 * 12);
            const char = height === 0 ? ' ' : '▁▂▃▄▅▆▇█'[height - 1] || '█';
            graphHTML += char;
        });

        cpuGraph.textContent = graphHTML;

        // Update CPU percentage
        const cpuPct = Math.floor(bars[bars.length - 1]);
        document.getElementById('topbar-cpu').textContent = `CPU: ${cpuPct}%`;
        document.getElementById('stat-cpu-bar').style.width = `${cpuPct}%`;
        document.getElementById('stat-cpu-pct').textContent = `${cpuPct}%`;
    }

    updateCPU();
    setInterval(updateCPU, 2000);
}

// ===== RENDER BLOG POSTS =====
function renderBlogPosts(filterTag = null) {
    const blogList = document.getElementById('blog-list');
    blogList.innerHTML = '';

    let posts = blogPosts;
    if (filterTag) {
        posts = posts.filter(p => p.tags.includes(filterTag));
    }

    // Add directory header
    const header = document.createElement('div');
    header.className = 'blog-post-item';
    header.style.cursor = 'default';
    header.innerHTML = `
        <span class="post-perms" style="color: var(--text-muted)">total ${posts.length}</span>
        <span class="post-user"></span>
        <span class="post-date"></span>
        <span class="post-size"></span>
        <span class="post-title" style="color: var(--text-muted)">— filtered posts —</span>
    `;
    blogList.appendChild(header);

    posts.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'blog-post-item';
        item.style.animationDelay = `${index * 0.05}s`;
        item.innerHTML = `
            <span class="post-perms">drwxr-xr-x</span>
            <span class="post-user">user</span>
            <span class="post-date">${post.date}</span>
            <span class="post-size">${post.size}</span>
            <span class="post-title">${post.title}</span>
        `;

        item.addEventListener('click', () => openPost(post));
        item.addEventListener('mouseenter', () => {
            item.classList.add('selected');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('selected');
        });

        blogList.appendChild(item);
    });
}

// ===== RENDER TAGS =====
function renderTags() {
    const tagsList = document.getElementById('tags-list');
    tagsList.innerHTML = '';

    allTags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.textContent = `#${tag}`;
        tagEl.addEventListener('click', () => {
            // Toggle active
            document.querySelectorAll('.tag-item').forEach(t => t.classList.remove('active'));
            if (tagEl.classList.contains('active')) {
                tagEl.classList.remove('active');
                renderBlogPosts(null);
            } else {
                tagEl.classList.add('active');
                renderBlogPosts(tag);
            }
        });
        tagsList.appendChild(tagEl);
    });
}

// ===== ASCII ART =====
function renderAsciiArt() {
    document.getElementById('ascii-art').textContent = asciiArt;
}

// ===== COMMAND BAR =====
function initCommandBar() {
    const cmdInput = document.getElementById('cmd-input');
    const cmdBar = document.getElementById('command-bar');

    // Focus input when clicking command bar
    cmdBar.addEventListener('click', () => {
        cmdInput.focus();
    });

    // Global focus
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' && !e.ctrlKey && !e.metaKey) {
            cmdInput.focus();
        }
        if (e.key === 'Escape') {
            cmdInput.blur();
            closeModal();
        }
    });

    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = cmdInput.value.trim().toLowerCase();
            processCommand(cmd);
            cmdInput.value = '';
        }
    });
}

function processCommand(cmd) {
    const parts = cmd.split(' ');
    const command = parts[0];
    const arg = parts[1];

    switch (command) {
        case 'help':
            showCommandOutput(`Available commands:
  help          Show this help message
  ls            List blog posts
  cat <title>   Open a blog post
  about         Show about info
  tags          List all tags
  clear         Clear terminal output
  date          Show current date/time
  uptime        Show system uptime
  whoami        Who are you?
  neofetch      Show system info
  exit          Close modal`);
            break;

        case 'ls':
            if (arg === '-la' || arg === '-l') {
                renderBlogPosts();
            } else {
                const postList = blogPosts.map(p => p.title).join('  ');
                showCommandOutput(postList);
            }
            break;

        case 'cat':
            if (arg) {
                const post = blogPosts.find(p => p.title.includes(arg));
                if (post) {
                    openPost(post);
                } else {
                    showCommandOutput(`cat: ${arg}: No such file or directory`);
                }
            } else {
                showCommandOutput('Usage: cat <post-title>');
            }
            break;

        case 'about':
            showCommandOutput(`Hi! I'm a developer who loves Linux, minimalism, and the terminal.
This blog is my digital garden — a place where I share thoughts on code, design, and open source.

Links: [GitHub] [Twitter] [RSS]`);
            break;

        case 'tags':
            showCommandOutput(allTags.map(t => `#${t}`).join('  '));
            break;

        case 'clear':
            document.getElementById('blog-list').innerHTML = '';
            break;

        case 'date':
            showCommandOutput(new Date().toString());
            break;

        case 'uptime':
            showCommandOutput(`up ${document.getElementById('stats-uptime').textContent.replace('up ', '')}`);
            break;

        case 'whoami':
            showCommandOutput('user');
            break;

        case 'neofetch':
            showCommandOutput(`     _____
    /  ___|
    \\ \`--.  ___  _ __ ___
     \`--. \\/ _ \\| '_ \\\` _ \\
    /\\__/ / (_) | | | | | |
    \\____/ \\___/|_| |_| |_|

    OS: Arch Linux x86_64
    Host: Retro Terminal Blog
    Kernel: 6.1.0-arch
    Shell: zsh 5.9
    WM: bspwm
    Terminal: kitty
    CPU: i5-6440HQ @ 2.7GHz
    GPU: Intel HD 530
    Memory: 2470MiB / 11520MiB`);
            break;

        case 'exit':
            closeModal();
            break;

        case '':
            break;

        default:
            showCommandOutput(`Command not found: ${command}. Type 'help' for available commands.`);
    }
}

function showCommandOutput(text) {
    const blogList = document.getElementById('blog-list');
    const output = document.createElement('div');
    output.style.cssText = 'padding: 8px 6px; color: var(--text-secondary); font-size: 12px; white-space: pre-wrap; border-top: 1px solid var(--border-color); margin-top: 4px;';
    output.textContent = text;
    blogList.insertBefore(output, blogList.firstChild);
}

// ===== MODAL =====
function initModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });
}

function openPost(post) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');

    title.textContent = post.title;

    // Parse simple markdown-like content
    let bodyHTML = post.content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 style="color: var(--accent-purple); font-size: 15px; margin-top: 16px; margin-bottom: 8px;">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 style="color: var(--accent-green); font-size: 13px; margin-top: 12px; margin-bottom: 6px;">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/^- (.+)$/gm, '<div style="margin-left: 16px;">• $1</div>')
        .replace(/^\d+\. (.+)$/gm, '<div style="margin-left: 16px;">$1</div>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    bodyHTML = `<p>${bodyHTML}</p>`;

    content.innerHTML = `
        <h1>${post.title.replace(/-/g, ' ')}</h1>
        <div class="post-meta">
            <span>📅 ${post.date}</span>
            <span>📦 ${post.size}</span>
            <span>🏷️ ${post.tags.map(t => `#${t}`).join(' ')}</span>
        </div>
        <div class="post-body">${bodyHTML}</div>
    `;

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// ===== UPTIME =====
function initUptime() {
    let seconds = 635; // Start at ~10:35
    const uptimeEl = document.getElementById('stats-uptime');
    const nfUptime = document.getElementById('nf-uptime');

    setInterval(() => {
        seconds++;
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        uptimeEl.textContent = `up ${h}:${m}:${s}`;

        if (seconds < 3600) {
            nfUptime.textContent = `${m} mins`;
        } else {
            nfUptime.textContent = `${h}h ${m}m`;
        }
    }, 1000);
}
