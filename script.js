const overlay = document.getElementById('envelope-overlay');
const passwordInput = document.getElementById('envelope-password');
const passwordSubmit = document.getElementById('envelope-submit');
const passwordError = document.getElementById('password-error');
const passwordGate = document.querySelector('.password-gate');
const USER_CODES = {
  '010709': 'Saran',
  '010726': 'Praveen'
};

// ---------- Visitor logging (User, Browser, OS, Device, IST time) ----------
// ---------- Visitor logging (User, Browser, OS, Device, IST time) ----------
// const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzeyoBiH0_ZMKlKA-mCuuURvc3V1GwuuaEPnnR87ASvtnQY2w2PvXO7RmzIbqxcc2Bo6w/exec';
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyvyW-xW3aVyVqGQZn4EzxW1yQIkbli6AvHQL3nsDlHILnMJHPIrsnB1r71svG7U-CZ/exec';

function detectBrowser(ua) {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  return 'Unknown';
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var istTime = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([istTime, data.user || '', data.browser || '', data.os || '', data.deviceType || '']);
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function detectOS(ua) {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown';
}

function logVisit(userLabel) {
  const ua = navigator.userAgent;
  const payload = {
    user: userLabel,
    browser: detectBrowser(ua),
    os: detectOS(ua),
    deviceType: /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop'
  };
  fetch(WEBAPP_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(payload)
  }).catch(() => { }); // fail silently if offline
}

function tryOpenEnvelope() {
  const enteredCode = passwordInput.value.trim();
  if (USER_CODES[enteredCode]) {
    logVisit(USER_CODES[enteredCode]);
    overlay.classList.add('open');
    setTimeout(() => overlay.classList.add('hidden'), 700);
  } else {
    passwordError.classList.add('show');
    passwordGate.classList.remove('shake');
    void passwordGate.offsetWidth; // restart animation
    passwordGate.classList.add('shake');
    passwordInput.value = '';
    passwordInput.focus();
  }
}
passwordSubmit.addEventListener('click', tryOpenEnvelope);
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryOpenEnvelope();
});

function resetEnvelope() {
  overlay.style.transition = 'none';
  overlay.classList.remove('hidden');
  overlay.classList.remove('open');
  void overlay.offsetWidth; // force reflow so the instant state applies
  window.scrollTo({ top: 0, behavior: 'auto' });
  passwordInput.value = '';
  passwordError.classList.remove('show');
  requestAnimationFrame(() => {
    overlay.style.transition = '';
  });
}

let songPlaying = false;
const songToggle = document.getElementById('song-toggle');
const songIcon = document.getElementById('song-icon');
const songAudio = document.getElementById('song-audio');

songToggle.addEventListener('click', () => {
  if (songAudio.paused) {
    songAudio.play();
    songIcon.textContent = '❚❚';
    songToggle.classList.add('playing');
  } else {
    songAudio.pause();
    songIcon.textContent = '▶';
    songToggle.classList.remove('playing');
  }
});

songAudio.addEventListener('ended', () => {
  songIcon.textContent = '▶';
  songToggle.classList.remove('playing');
});

// ---------- Live counter since her birth (Aug 29, 2005, 9:00 PM) ----------
const birthDate = new Date(2005, 7, 29, 21, 0, 0); // month is 0-indexed: 7 = August
const cDays = document.getElementById('c-days');
const cHours = document.getElementById('c-hours');
const cMins = document.getElementById('c-mins');
const cSecs = document.getElementById('c-secs');
function updateCounter() {
  const now = new Date();
  let diffSec = Math.floor((now - birthDate) / 1000);
  if (diffSec < 0) diffSec = 0;
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  cDays.textContent = days.toLocaleString();
  cHours.textContent = String(hours).padStart(2, '0');
  cMins.textContent = String(mins).padStart(2, '0');
  cSecs.textContent = String(secs).padStart(2, '0');
}
updateCounter();
setInterval(updateCounter, 1000);

// ---------- Scroll progress bar ----------
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// ---------- Scroll-reveal animations ----------
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

function spawnParticles(containerId, count, symbols) {
  const layer = document.getElementById(containerId);
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (Math.random() * 14 + 12) + 'px';
    p.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
    const duration = Math.random() * 8 + 9;
    p.style.animationDuration = duration + 's';
    p.style.animationDelay = (Math.random() * duration) + 's';
    layer.appendChild(p);
  }
}
spawnParticles('particles-intro', 30, ['❀', '✿', '❁']);
spawnParticles('particles-promise', 14, ['❀', '✿']);

function burstConfetti() {
  const layer = document.getElementById('particles-finale');
  layer.innerHTML = '';
  const colors = ['#ffd3e2', '#f7a8c4', '#d6789e', '#fff2f6', '#e2b872'];
  for (let i = 0; i < 50; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = (Math.random() * 1.5) + 's';
    c.style.animationDuration = (2.4 + Math.random() * 1.6) + 's';
    layer.appendChild(c);
  }
}
const finale = document.getElementById('finale');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { burstConfetti(); } });
}, { threshold: 0.4 });
obs.observe(finale);

document.getElementById('replay-btn').addEventListener('click', burstConfetti);

// ---------- Image carousels (auto-rotate + dots) ----------
document.querySelectorAll('.carousel').forEach(carousel => {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.dot');
  let idx = 0;
  if (slides.length <= 1) return;
  setInterval(() => {
    slides[idx].classList.remove('active');
    dots[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
  }, 3200);
});

// ---------- Farewell overlay (creative logout) ----------
const farewellOverlay = document.getElementById('farewell-overlay');
const farewellPetals = document.getElementById('farewell-petals');
const logoutBtn = document.getElementById('logout-btn');
const farewellReturn = document.getElementById('farewell-return');

function spawnFarewellPetals() {
  farewellPetals.innerHTML = '';
  const symbols = ['❀', '✿', '❁'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (Math.random() * 14 + 12) + 'px';
    p.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
    const duration = Math.random() * 8 + 9;
    p.style.animationDuration = duration + 's';
    p.style.animationDelay = (Math.random() * duration) + 's';
    farewellPetals.appendChild(p);
  }
}

logoutBtn.addEventListener('click', () => {
  spawnFarewellPetals();
  farewellOverlay.classList.add('show');
  if (!songAudio.paused) {
    songAudio.pause();
    songIcon.textContent = '▶';
    songToggle.classList.remove('playing');
  }
});

farewellReturn.addEventListener('click', () => {
  farewellOverlay.classList.remove('show');
  resetEnvelope();
});
