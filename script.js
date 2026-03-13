/**
 * YOGESH KUMAR — SENIOR PORTFOLIO v2
 * script.js
 *
 * Features:
 * ─ Animated Loader with terminal lines
 * ─ Page transition (curtain wipe)
 * ─ Advanced particle canvas (connect + mouse repel)
 * ─ Custom cursor with text labels
 * ─ Hero typing effect
 * ─ Count-up numbers
 * ─ Sticky navbar + active section tracking
 * ─ Scroll-reveal with stagger
 * ─ Animated skill bars
 * ─ 3D tilt effect on cards
 * ─ Project filter with animation
 * ─ GitHub API integration (repos + profile)
 * ─ Contact form with validation
 * ─ Smooth scroll progress
 */

/* ══════════════════════════════════════════
   STATE
   ══════════════════════════════════════════ */
const state = {
  mouseX: 0,
  mouseY: 0,
  followerX: 0,
  followerY: 0,
  cursorExpanded: false,
};

/* ══════════════════════════════════════════
   1. PAGE TRANSITION
   ══════════════════════════════════════════ */
function initPageTransition() {
  const overlay = document.getElementById('pageTransition');

  // Entrance wipe (already shown via loader, just mark done)
  // Exit wipe on external links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', e => {
      // Let it open in new tab — no transition needed
    });
  });

  // Smooth inner-page transitions for anchor nav
  // (handled by CSS scroll-behavior + reveal animations)
  overlay.style.pointerEvents = 'none';
}

/* ══════════════════════════════════════════
   2. LOADER
   ══════════════════════════════════════════ */
function initLoader() {
  const loader   = document.getElementById('loader');
  const fill     = document.getElementById('loaderFill');
  const pct      = document.getElementById('loaderPct');
  const lines    = [
    document.getElementById('lt2'),
    document.getElementById('lt3'),
    document.getElementById('lt4'),
  ];

  document.body.classList.add('loading');

  let progress = 0;
  const milestones = [20, 45, 70, 100];
  let mIdx = 0;

  // Reveal terminal lines
  setTimeout(() => { if (lines[0]) lines[0].style.opacity = '1'; }, 400);
  setTimeout(() => { if (lines[1]) lines[1].style.opacity = '1'; }, 800);
  setTimeout(() => { if (lines[2]) lines[2].style.opacity = '1'; }, 1100);

  const iv = setInterval(() => {
    const step = Math.random() * 8 + 2;
    progress = Math.min(progress + step, milestones[mIdx] ?? 100);

    if (progress >= (milestones[mIdx] ?? 100)) mIdx++;

    fill.style.width  = progress + '%';
    pct.textContent   = Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(iv);
      setTimeout(finishLoad, 500);
    }
  }, 80);

  function finishLoad() {
    loader.classList.add('out');
    document.body.classList.remove('loading');
    bootAnimations();
  }
}

/* ══════════════════════════════════════════
   3. PARTICLE CANVAS
   ══════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.2 + 0.3;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.life  = 1;
      this.decay = 0;
    }
    update() {
      // Mouse repulsion
      const dx   = this.x - state.mouseX;
      const dy   = this.y - state.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }
      // Dampen
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x  += this.vx;
      this.y  += this.vy;
      // Wrap
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 217, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.min(Math.floor((W * H) / 7000), 130);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ══════════════════════════════════════════
   4. CUSTOM CURSOR
   ══════════════════════════════════════════ */
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  const ctext    = document.getElementById('cursorText');
  if (!cursor) return;

  document.addEventListener('mousemove', e => {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  (function animFollower() {
    state.followerX += (state.mouseX - state.followerX) * 0.14;
    state.followerY += (state.mouseY - state.followerY) * 0.14;
    follower.style.left = state.followerX + 'px';
    follower.style.top  = state.followerY + 'px';
    requestAnimationFrame(animFollower);
  })();

  // Hover states
  function addHover(selector, label = '') {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        follower.classList.add('link-hover');
        if (label) {
          cursor.classList.add('expanded');
          ctext.textContent = label;
        }
      });
      el.addEventListener('mouseleave', () => {
        follower.classList.remove('link-hover');
        cursor.classList.remove('expanded');
        ctext.textContent = '';
      });
    });
  }

  addHover('a, button, .tool-chip, .fb-btn, .ari-item', '');
  addHover('.pcard', 'View');
  addHover('.prof-card', 'Visit');
  addHover('.repo-card', 'Open');
}

/* ══════════════════════════════════════════
   5. NAVBAR
   ══════════════════════════════════════════ */
function initNavbar() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const links      = document.querySelectorAll('.nl');
  const sections   = document.querySelectorAll('section[id]');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nl').forEach(l => {
    l.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);

    // Active section
    let active = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) active = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + active);
    });
  }, { passive: true });
}

/* ══════════════════════════════════════════
   6. SCROLL PROGRESS
   ══════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollBar');
  window.addEventListener('scroll', () => {
    const st  = document.documentElement.scrollTop;
    const sh  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (st / sh * 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════
   7. SCROLL REVEAL
   ══════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        // Also trigger ach-bar
        if (entry.target.classList.contains('ach-item')) {
          entry.target.classList.add('in');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════
   8. TYPING EFFECT
   ══════════════════════════════════════════ */
function initTyped() {
  const el = document.getElementById('heroTyped');
  if (!el) return;

  const phrases = [
    'Full Stack Developer',
    'Java Engineer',
    'MERN Stack Builder',
    'DevOps Learner',
    'Problem Solver',
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase  = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);

    let delay = deleting ? 55 : 95;
    if (!deleting && ci === phrase.length + 1) { delay = 2000; deleting = true; }
    else if (deleting && ci < 0) {
      deleting = false; ci = 0;
      pi = (pi + 1) % phrases.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  }
  tick();
}

/* ══════════════════════════════════════════
   9. COUNT-UP NUMBERS
   ══════════════════════════════════════════ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count);
      let  cur  = 0;
      const dur = 1400;
      const step = end / (dur / 16);
      const iv  = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = Math.floor(cur);
        if (cur >= end) clearInterval(iv);
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.hm-val[data-count]').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════
   10. SKILL BARS
   ══════════════════════════════════════════ */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      setTimeout(() => { fill.style.width = fill.dataset.w + '%'; }, 200);
      obs.unobserve(fill);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.sr-fill').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════
   11. 3D TILT EFFECT
   ══════════════════════════════════════════ */
function initTilt() {
  const MAX_TILT = 12;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const rotX  = -dy * MAX_TILT;
      const rotY  =  dx * MAX_TILT;
      const shine = `radial-gradient(circle at ${
        ((e.clientX - rect.left) / rect.width  * 100).toFixed(1)
      }% ${
        ((e.clientY - rect.top)  / rect.height * 100).toFixed(1)
      }%, rgba(255,255,255,0.07), transparent 60%)`;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      card.style.boxShadow = `0 24px 48px rgba(0,0,0,0.5)`;

      // Update glow position if it exists
      const glow = card.querySelector('.pcard-glow');
      if (glow) glow.style.background = shine;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.boxShadow = '';
      const glow = card.querySelector('.pcard-glow');
      if (glow) glow.style.background = '';
    });
  });
}

/* ══════════════════════════════════════════
   12. PROJECT FILTER
   ══════════════════════════════════════════ */
function initProjectFilter() {
  const btns = document.querySelectorAll('.fb-btn');
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = grid.querySelectorAll('.pcard');

      cards.forEach((card, i) => {
        const tags   = card.dataset.tags || '';
        const match  = filter === 'all' || tags.includes(filter);

        if (match) {
          card.classList.remove('hidden');
          card.style.animationDelay = (i * 60) + 'ms';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ══════════════════════════════════════════
   13. GITHUB API
   ══════════════════════════════════════════ */
async function initGithubAPI() {
  const USERNAME   = 'YogeshKumar445';
  const repoGrid   = document.getElementById('repoGrid');
  const repoLoading = document.getElementById('repoLoading');

  // Language → hex color map
  const LANG_COLORS = {
    JavaScript: '#f0db4f', Java: '#f89820', Python: '#3572a5',
    HTML: '#e34c26', CSS: '#563d7c', TypeScript: '#3178c6',
    C: '#555555', 'C++': '#f34b7d', Shell: '#89e051',
    default: '#6b7a8d'
  };

  // Fetch profile
  try {
    const profRes  = await fetch(`https://api.github.com/users/${USERNAME}`);
    if (profRes.ok) {
      const prof = await profRes.json();
      const el   = id => document.getElementById(id);
      if (el('ghName'))      el('ghName').textContent      = prof.name || prof.login;
      if (el('ghBio'))       el('ghBio').textContent       = prof.bio  || 'Full Stack Developer';
      if (el('ghRepos'))     el('ghRepos').textContent     = prof.public_repos;
      if (el('ghFollowers')) el('ghFollowers').textContent = prof.followers;
      if (el('ghFollowing')) el('ghFollowing').textContent = prof.following;
      const avatar = document.getElementById('ghAvatar');
      if (avatar && prof.avatar_url) avatar.src = prof.avatar_url;
    }
  } catch (e) { /* silently fail */ }

  // Fetch repos
  try {
    const res  = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=9&type=public`
    );

    if (!res.ok) throw new Error('API rate limit or error');

    const repos = await res.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      showRepoFallback('No public repositories found.');
      return;
    }

    // Clear loader
    if (repoLoading) repoLoading.remove();

    // Sort by stars + updated
    repos.sort((a, b) => (b.stargazers_count - a.stargazers_count) || new Date(b.updated_at) - new Date(a.updated_at));

    repos.slice(0, 9).forEach((repo, i) => {
      const card = buildRepoCard(repo, LANG_COLORS, i);
      repoGrid.appendChild(card);
    });

    // Re-init tilt on new cards
    initTilt();

  } catch (err) {
    showRepoFallback('Could not load repositories — GitHub API rate limit may apply. <a href="https://github.com/YogeshKumar445" target="_blank" style="color:var(--accent)">View on GitHub ↗</a>');
  }

  function showRepoFallback(msg) {
    if (repoLoading) repoLoading.remove();
    const div = document.createElement('div');
    div.className = 'repo-error';
    div.innerHTML = msg;
    repoGrid.appendChild(div);
  }
}

function buildRepoCard(repo, colors, idx) {
  const langKey   = repo.language || 'default';
  const langColor = colors[langKey] || colors.default;
  const updated   = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const article   = document.createElement('article');
  article.className = 'repo-card';
  article.style.animationDelay = (idx * 70) + 'ms';
  // Don't add data-tilt here to avoid conflicts, handled via initTilt after

  article.innerHTML = `
    <div class="rc-top">
      <span class="rc-name">${escHTML(repo.name)}</span>
      <a href="${escHTML(repo.html_url)}" target="_blank" class="rc-link" title="Open on GitHub">↗</a>
    </div>
    <p class="rc-desc">${escHTML(repo.description || 'No description provided.')}</p>
    <div class="rc-meta">
      ${repo.language ? `
        <span class="rc-lang">
          <span class="rc-lang-dot" style="background:${langColor}"></span>
          ${escHTML(repo.language)}
        </span>` : ''}
      ${repo.stargazers_count > 0 ? `<span class="rc-star">★ ${repo.stargazers_count}</span>` : ''}
      ${repo.forks_count > 0 ? `<span class="rc-fork">⑂ ${repo.forks_count}</span>` : ''}
      <span class="rc-fork">${updated}</span>
    </div>
  `;
  return article;
}

function escHTML(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ══════════════════════════════════════════
   14. CONTACT FORM
   ══════════════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');
  const btn     = document.getElementById('cfSubmit');
  const btext   = btn?.querySelector('.cfs-text');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.classList.add('loading');
    if (btext) btext.textContent = 'Sending...';

    // Simulate send
    await new Promise(r => setTimeout(r, 1400));

    form.style.display = 'none';
    success.classList.add('show');
  });
}

/* ══════════════════════════════════════════
   15. HERO ENTRANCE
   ══════════════════════════════════════════ */
function heroEntrance() {
  const heroEls = [
    '.hero-eyebrow',
    '.hero-name',
    '.hero-role',
    '.hero-tagline',
    '.hero-actions',
    '.hero-metrics',
  ];
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = `opacity 0.7s ease ${i * 100}ms, transform 0.7s ease ${i * 100}ms`;
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + i * 100);
  });
}

/* ══════════════════════════════════════════
   16. SMOOTH SCROLL
   ══════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ══════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════ */
function bootAnimations() {
  heroEntrance();
  initParticles();
  initCursor();
  initTyped();
  initCounters();
  initNavbar();
  initScrollProgress();
  initReveal();
  initSkillBars();
  initTilt();
  initProjectFilter();
  initContactForm();
  initSmoothScroll();
  initGithubAPI();
}

/* ══════════════════════════════════════════
   INIT ON DOM READY
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initPageTransition();
  initLoader();
});