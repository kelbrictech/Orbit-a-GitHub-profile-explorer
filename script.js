// Orbit — a GitHub profile explorer.
// Data: GitHub REST API (https://docs.github.com/en/rest), public endpoints, no auth required.
const API_BASE = 'https://api.github.com';

const searchForm = document.getElementById('searchForm');
const usernameInput = document.getElementById('usernameInput');
const exampleChips = document.getElementById('exampleChips');
const statusLine = document.getElementById('statusLine');
const results = document.getElementById('results');

const avatarImg = document.getElementById('avatarImg');
const profileName = document.getElementById('profileName');
const profileLogin = document.getElementById('profileLogin');
const profileBio = document.getElementById('profileBio');
const profileLink = document.getElementById('profileLink');
const statRow = document.getElementById('statRow');

const orbitCenter = document.getElementById('orbitCenter');
const orbitWrap = document.getElementById('orbitWrap');
const orbitDetail = document.getElementById('orbitDetail');

const langBar = document.getElementById('langBar');
const langLegend = document.getElementById('langLegend');

const sortSelect = document.getElementById('sortSelect');
const repoList = document.getElementById('repoList');

// Approximate GitHub language colors, with a fallback for anything not listed.
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', Vue: '#41b883', Dart: '#00B4AB', Elixir: '#6e4a7e',
  Scala: '#c22d40', Lua: '#000080', Haskell: '#5e5086', R: '#198CE7', Jupyter: '#DA5B0B',
  Objective_C: '#438eff'
};
const FALLBACK_COLOR = '#8b8fb0';

let currentRepos = [];
let selectedNodeBtn = null;

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) loadProfile(username);
});

exampleChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const username = chip.dataset.username;
  usernameInput.value = username;
  loadProfile(username);
});

sortSelect.addEventListener('change', () => renderRepoList(currentRepos));

async function loadProfile(username) {
  results.hidden = true;
  setStatus(`Looking up @${username}…`);
  orbitDetail.innerHTML = '<p class="orbit-detail__hint">Hover or select a repo above to see its details here.</p>';

  try {
    const userRes = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`);

    if (userRes.status === 404) {
      setStatus(`No GitHub user found with the username "${username}".`, true);
      return;
    }
    if (userRes.status === 403) {
      setStatus("GitHub's public API rate limit was hit (60 requests/hour without auth) — try again in a bit.", true);
      return;
    }
    if (!userRes.ok) throw new Error('Unexpected response');

    const user = await userRes.json();

    const reposRes = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
    if (!reposRes.ok) throw new Error('Could not load repositories');
    const repos = await reposRes.json();

    currentRepos = repos;
    renderProfile(user);
    renderStats(user, repos);
    renderOrbit(user, repos);
    renderLanguages(repos);
    renderRepoList(repos);

    results.hidden = false;
    setStatus('');
  } catch (err) {
    setStatus("Couldn't reach the GitHub API — check your connection and try again.", true);
  }
}

function setStatus(msg, isError = false) {
  statusLine.textContent = msg;
  statusLine.classList.toggle('error', isError);
}

function renderProfile(user) {
  avatarImg.src = user.avatar_url;
  avatarImg.alt = `${user.login}'s avatar`;
  profileName.textContent = user.name || user.login;
  profileLogin.textContent = `@${user.login}`;
  profileBio.textContent = user.bio || '';
  profileLink.href = user.html_url;
}

function renderStats(user, repos) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const stats = [
    { value: user.public_repos, label: 'Repos' },
    { value: formatCount(totalStars), label: 'Total stars' },
    { value: formatCount(user.followers), label: 'Followers' },
    { value: formatCount(user.following), label: 'Following' }
  ];

  statRow.innerHTML = stats.map(s => `
    <div class="stat">
      <span class="stat__value">${s.value}</span>
      <span class="stat__label">${s.label}</span>
    </div>
  `).join('');
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function renderOrbit(user, repos) {
  orbitCenter.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}" />`;

  // clear old nodes
  orbitWrap.querySelectorAll('.orbit-node').forEach(n => n.remove());
  selectedNodeBtn = null;

  const top = [...repos]
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8);

  if (top.length === 0) {
    orbitDetail.innerHTML = '<p class="orbit-detail__hint">This user has no public, non-fork repositories to show.</p>';
    return;
  }

  const maxStars = Math.max(...top.map(r => r.stargazers_count), 1);
  const ringRadii = [110, 200]; // px, matches .orbit-ring--1 / --2

  top.forEach((repo, i) => {
    const ring = i < 4 ? 0 : 1;
    const itemsInRing = ring === 0 ? Math.min(top.length, 4) : top.length - 4;
    const indexInRing = ring === 0 ? i : i - 4;
    const angle = (indexInRing / itemsInRing) * 2 * Math.PI + (ring * 0.4);

    const radius = ringRadii[ring];
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const size = 16 + Math.sqrt(repo.stargazers_count / maxStars) * 40;
    const color = LANGUAGE_COLORS[repo.language] || FALLBACK_COLOR;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'orbit-node';
    btn.style.width = `${size}px`;
    btn.style.height = `${size}px`;
    btn.style.background = color;
    btn.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    btn.style.animationDelay = `${i * 0.05}s`;
    btn.setAttribute('aria-label', `${repo.name}, ${repo.stargazers_count} stars`);

    btn.addEventListener('mouseenter', () => showRepoDetail(repo, btn));
    btn.addEventListener('focus', () => showRepoDetail(repo, btn));
    btn.addEventListener('click', () => showRepoDetail(repo, btn));

    orbitWrap.appendChild(btn);
  });

  showRepoDetail(top[0], null);
}

function showRepoDetail(repo, btn) {
  if (selectedNodeBtn) selectedNodeBtn.classList.remove('is-selected');
  if (btn) {
    btn.classList.add('is-selected');
    selectedNodeBtn = btn;
  }

  orbitDetail.innerHTML = `
    <p class="orbit-detail__name">${repo.name}</p>
    <p class="orbit-detail__desc">${repo.description ? escapeHtml(repo.description) : 'No description provided.'}</p>
    <p class="orbit-detail__meta">★ ${repo.stargazers_count} · ${repo.language || 'Unknown language'} · updated ${formatDate(repo.pushed_at)}</p>
  `;
}

function renderLanguages(repos) {
  const counts = {};
  repos
    .filter(r => !r.fork && r.language)
    .forEach(r => {
      counts[r.language] = (counts[r.language] || 0) + 1;
    });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    langBar.innerHTML = '';
    langLegend.innerHTML = '<p class="section-hint" style="margin:0;">No language data available.</p>';
    return;
  }

  langBar.innerHTML = entries.map(([lang, count]) => {
    const pct = (count / total) * 100;
    const color = LANGUAGE_COLORS[lang] || FALLBACK_COLOR;
    return `<div class="lang-bar__seg" style="width:${pct}%; background:${color};" title="${lang}: ${pct.toFixed(1)}%"></div>`;
  }).join('');

  langLegend.innerHTML = entries.slice(0, 8).map(([lang, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    const color = LANGUAGE_COLORS[lang] || FALLBACK_COLOR;
    return `
      <span class="lang-legend__item">
        <span class="lang-legend__dot" style="background:${color};"></span>
        ${lang} · ${pct}%
      </span>
    `;
  }).join('');
}

function renderRepoList(repos) {
  const sortBy = sortSelect.value;
  const sorted = [...repos].sort((a, b) => {
    if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
    if (sortBy === 'updated') return new Date(b.pushed_at) - new Date(a.pushed_at);
    return a.name.localeCompare(b.name);
  });

  repoList.innerHTML = sorted.map(repo => {
    const color = LANGUAGE_COLORS[repo.language] || FALLBACK_COLOR;
    return `
      <li class="repo-list__item">
        <span class="repo-list__lang-dot" style="background:${repo.language ? color : 'transparent'};"></span>
        <span class="repo-list__name">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
          <span class="repo-list__desc">${repo.description ? escapeHtml(repo.description) : ''}</span>
        </span>
        <span class="repo-list__stars">★ ${repo.stargazers_count}</span>
      </li>
    `;
  }).join('');
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
