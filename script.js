'use strict';

/* ── 1. PARTICLE CANVAS ─────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x       = Math.random() * W;
      this.y       = Math.random() * H;
      this.r       = Math.random() * 1.8 + 0.4;
      this.vx      = (Math.random() - 0.5) * 0.3;
      this.vy      = -(Math.random() * 0.4 + 0.1);
      this.life    = 0;
      this.maxLife = Math.random() * 200 + 100;
      this.color   = Math.random() > 0.5
        ? 'rgba(198, 90, 99, '
        : 'rgba(107, 30, 35, ';
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + alpha + ')';
      ctx.fill();
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life++;
      if (this.life >= this.maxLife) this.reset();
    }
  }

  for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.maxLife);
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── 2. MOUSE GLOW ──────────────────────────────────────────── */
(function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function track() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(track);
  }
  track();
})();

/* ── 3. NAV SCROLL ──────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    })
  );
})();

/* ── 4. SCROLL REVEAL ───────────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0) * 0.12;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── 5. SKILL BARS ──────────────────────────────────────────── */
(function initSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-card').forEach(c => observer.observe(c));
})();

/* ── 6. COUNTER ANIMATION ───────────────────────────────────── */
(function initCounters() {
  const statsEl = document.querySelector('.hero-stats');
  if (!statsEl) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hstat-val').forEach(el => {
          const raw    = el.textContent;
          const num    = parseInt(raw);
          const suffix = raw.replace(/[0-9]/g, '');
          let cur = 0;
          const step = num / 40;
          const t = setInterval(() => {
            cur = Math.min(cur + step, num);
            el.textContent = Math.round(cur) + suffix;
            if (cur >= num) clearInterval(t);
          }, 35);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  observer.observe(statsEl);
})();

/* ── 7. SKILL → PROJECT FILTER ──────────────────────────────── */
let activeSkillEl = null;

function filterBySkill(cardEl, skillName, projectIds) {
  const hint        = document.getElementById('skill-hint');
  const filterName  = document.getElementById('skill-filter-name');
  const subtitle    = document.getElementById('projects-subtitle');
  const allProjects = document.querySelectorAll('.project-card');
  const allSkills   = document.querySelectorAll('.skill-card');
  const ids         = projectIds.trim().split(/\s+/);

  // If clicking the same skill again — clear filter
  if (activeSkillEl === cardEl) {
    clearSkillFilter();
    return;
  }

  // Mark active skill card
  allSkills.forEach(s => s.classList.remove('active-skill'));
  cardEl.classList.add('active-skill');
  activeSkillEl = cardEl;

  // Show filter hint bar
  hint.style.display = 'flex';
  filterName.textContent = skillName;

  // Update projects subtitle
  if (subtitle) subtitle.textContent = `Showing projects related to: ${skillName}`;

  // Highlight/dim project cards
  allProjects.forEach(proj => {
    proj.classList.remove('project-highlight', 'project-dim');
    if (ids.includes(proj.id)) {
      proj.classList.add('project-highlight');
    } else {
      proj.classList.add('project-dim');
    }
  });

  // Smooth scroll to projects section
  const projSection = document.getElementById('projects');
  if (projSection) {
    setTimeout(() => {
      projSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }
}

function clearSkillFilter() {
  const hint       = document.getElementById('skill-hint');
  const subtitle   = document.getElementById('projects-subtitle');
  const allProjects = document.querySelectorAll('.project-card');
  const allSkills  = document.querySelectorAll('.skill-card');

  hint.style.display = 'none';
  activeSkillEl = null;

  allSkills.forEach(s => s.classList.remove('active-skill'));
  allProjects.forEach(p => {
    p.classList.remove('project-highlight', 'project-dim');
  });

  if (subtitle) subtitle.textContent = 'Real-world solutions I\'ve designed and implemented';
}

// Keyboard support for skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

/* ── 8. PROJECT CARD GLOW FOLLOW ────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r    = card.getBoundingClientRect();
    const glow = card.querySelector('.proj-glow');
    if (glow) {
      glow.style.left = (e.clientX - r.left - 150) + 'px';
      glow.style.top  = (e.clientY - r.top  - 150) + 'px';
    }
  });
});

/* ── 9. ACTIVE NAV ──────────────────────────────────────────── */
(function initActiveNav() {
  const sections = ['hero','about','skills','projects','experience','contact'];
  const map = {
    hero: null,
    about: 'nl-about',
    skills: 'nl-skills',
    projects: 'nl-projects',
    experience: 'nl-exp',
    contact: 'nl-contact',
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active-link'));
        const id = map[entry.target.id];
        if (id) document.getElementById(id)?.classList.add('active-link');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });

  const s = document.createElement('style');
  s.textContent = `.nav-links a.active-link { color: var(--text); background: rgba(198,90,99,0.1); }`;
  document.head.appendChild(s);
})();

/* ── 10. TYPING EFFECT FOR TAGLINE ─────────────────────────── */
(function initTyping() {
  const el = document.querySelector('.hero-tagline');
  if (!el) return;
  const parts = ['Business Analytics Student', ' · Data Analyst', ' · Problem Solver'];
  let built = '', pi = 0, ci = 0;
  el.style.opacity = '1';

  function type() {
    if (pi >= parts.length) return;
    if (ci < parts[pi].length) {
      built += parts[pi][ci];
      el.innerHTML = built.replace(/ · /g, ' <span class="tagline-sep">·</span> ');
      ci++;
      setTimeout(type, ci === 1 && pi > 0 ? 300 : 42);
    } else {
      pi++; ci = 0;
      setTimeout(type, 120);
    }
  }
  setTimeout(type, 1000);
})();

/* ── 11. STAGGER DELAYS ─────────────────────────────────────── */
document.querySelectorAll('.skill-card').forEach((card, i) => { card.dataset.delay = i % 4; });
document.querySelectorAll('.cert-card').forEach((card, i) => { card.dataset.delay = i % 3; });

/* ── 12. CONTACT FORM ───────────────────────────────────────── */
function submitForm(e) {
  e.preventDefault();
  const btn   = document.getElementById('form-submit-btn');
  const label = document.getElementById('submit-label');
  const succ  = document.getElementById('form-success');

  btn.disabled = true;
  label.textContent = 'Sending...';

  setTimeout(() => {
    label.textContent = '✓ Sent!';
    succ.style.display = 'block';
    document.getElementById('contact-form').reset();
    setTimeout(() => {
      btn.disabled = false;
      label.textContent = 'Send Message';
      succ.style.display = 'none';
    }, 4500);
  }, 1400);
}

/* ── 13. RESUME DOWNLOAD CHECK ──────────────────────────────── */
document.querySelectorAll('[download]').forEach(link => {
  link.addEventListener('click', function(e) {
    // Test if resume.pdf exists; if not, show a friendly toast
    fetch('resume.pdf', { method: 'HEAD' })
      .then(r => {
        if (!r.ok) {
          e.preventDefault();
          showToast('📄 Resume coming soon! Contact me directly.');
        }
      })
      .catch(() => {
        e.preventDefault();
        showToast('📄 Resume coming soon! Contact me directly.');
      });
  });
});

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:rgba(44,15,18,0.95); color:#F5E9EA;
    border:1px solid rgba(198,90,99,0.4); border-radius:100px;
    padding:12px 24px; font-size:14px; font-weight:500;
    z-index:9999; box-shadow:0 4px 24px rgba(198,90,99,0.25);
    animation:fadeUp 0.4s ease both;
    font-family:'Inter',system-ui,sans-serif;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

/* ── 14. PARALLAX HERO GLOW ON SCROLL ───────────────────────── */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const g1 = document.querySelector('.hero-glow-1');
  const g2 = document.querySelector('.hero-glow-2');
  if (g1) g1.style.transform = `translateY(${sy * 0.15}px)`;
  if (g2) g2.style.transform = `translateY(${sy * -0.1}px)`;
}, { passive: true });

/* ── 15. SMOOTH SCROLL ──────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── 16. GLASS CARD TILT ────────────────────────────────────── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r    = card.getBoundingClientRect();
    const xPct = (e.clientX - r.left) / r.width  - 0.5;
    const yPct = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-yPct * 4}deg) rotateY(${xPct * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

console.log('%cdhvani.studio ✦ v2.1 loaded', 'color:#C65A63;font-size:14px;font-weight:bold;');
