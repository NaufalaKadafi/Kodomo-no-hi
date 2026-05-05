/* ============================================================
   SCRAPBOOK KODOMO NO HI — SHARED JS
   ============================================================ */

// ── CURSOR ──────────────────────────────────────────────
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mouseX=0, mouseY=0, trailX=0, trailY=0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});
(function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
})();

// ── READING PROGRESS ────────────────────────────────────
const progressBar = document.getElementById('readingProgress');
window.addEventListener('scroll', () => {
  const scrollable = document.body.scrollHeight - window.innerHeight;
  const p = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) progressBar.style.width = p + '%';
}, { passive: true });

// ── REVEAL ON SCROLL ────────────────────────────────────
function isInView(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.93 && r.bottom > 0;
}
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item');

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const delay = e.target.classList.contains('timeline-item') ? i * 140 : 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => {
  if (isInView(el)) el.classList.add('visible');
  else revealObs.observe(el);
});

// ── FALLING PETALS ──────────────────────────────────────
const petalsContainer = document.getElementById('petalsContainer');
const PETALS = ['🌸','🌺','🍃','🌼','✿'];
function spawnPetal() {
  if (!petalsContainer) return;
  const p = document.createElement('div');
  p.className = 'petal';
  p.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
  const dur = 6 + Math.random() * 8;
  p.style.cssText = 'left:'+Math.random()*100+'%;top:-30px;font-size:'+(0.65+Math.random()*0.75)+'rem;animation:fallPetal '+dur+'s '+(Math.random()*4)+'s linear forwards;';
  petalsContainer.appendChild(p);
  setTimeout(() => p.remove(), (dur + 5) * 1000);
}
setInterval(spawnPetal, 2200);

// ── IMAGE PLACEHOLDER UPLOAD ─────────────────────────────
document.querySelectorAll('.img-placeholder').forEach(ph => {
  const input = ph.querySelector('input[type=file]');
  if (!input) return;
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      let img = ph.querySelector('img.preview');
      if (!img) { img = document.createElement('img'); img.className = 'preview'; ph.appendChild(img); }
      img.src = ev.target.result;
      const icon = ph.querySelector('.ph-icon');
      const label = ph.querySelector('.ph-label');
      if (icon)  icon.style.display  = 'none';
      if (label) label.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
});

// ── QUIZ ─────────────────────────────────────────────────
window.checkAnswer = function(btn, correct, correctIdx, resultId) {
  document.querySelectorAll('.quiz-option').forEach(o => o.disabled = true);
  const res = document.getElementById(resultId || 'quizResult');
  if (correct) {
    btn.classList.add('correct');
    if (res) { res.style.color = 'var(--koi-teal)'; res.textContent = 'Tepat! Korea Selatan meresmikannya pada 1975, 52 tahun setelah gerakan Bang Jeong-hwan dimulai.'; }
  } else {
    btn.classList.add('wrong');
    if (correctIdx != null) document.querySelectorAll('.quiz-option')[correctIdx].classList.add('correct');
    if (res) { res.style.color = 'var(--koi-red)'; res.textContent = 'Belum tepat. Jawabannya 1975 — gerakannya dimulai 1923, tapi pengakuan resmi butuh waktu puluhan tahun.'; }
  }
};

// ══════════════════════════════════════════════════════════
// ── PAGE NAVIGATION — dots + tombol kiri-kanan + keyboard
// ══════════════════════════════════════════════════════════
(function initNav() {
  const nav = document.querySelector('.page-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a')];
  const activeIdx = links.findIndex(a => a.classList.contains('active'));

  function goTo(idx) {
    if (idx < 0 || idx >= links.length) return;
    window.location.href = links[idx].href;
  }

  // Tombol PREV ‹
  const prev = document.createElement('button');
  prev.className = 'nav-arrow nav-prev';
  prev.innerHTML = '&#8249;';
  prev.title = 'Sebelumnya  (←)';
  prev.setAttribute('aria-label', 'Halaman sebelumnya');
  if (activeIdx <= 0) prev.classList.add('nav-arrow-disabled');
  prev.addEventListener('click', () => goTo(activeIdx - 1));

  // Tombol NEXT ›
  const next = document.createElement('button');
  next.className = 'nav-arrow nav-next';
  next.innerHTML = '&#8250;';
  next.title = 'Berikutnya  (→)';
  next.setAttribute('aria-label', 'Halaman berikutnya');
  if (activeIdx < 0 || activeIdx >= links.length - 1) next.classList.add('nav-arrow-disabled');
  next.addEventListener('click', () => goTo(activeIdx + 1));

  // Sisipkan: [‹] dots dots dots [›]
  nav.insertBefore(prev, nav.firstChild);
  nav.appendChild(next);
})();

// Keyboard: arrow kiri/kanan untuk ganti halaman
document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;

  const nav = document.querySelector('.page-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const activeIdx = links.findIndex(a => a.classList.contains('active'));

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (activeIdx >= 0 && activeIdx < links.length - 1)
      window.location.href = links[activeIdx + 1].href;
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeIdx > 0)
      window.location.href = links[activeIdx - 1].href;
  }
});