// Gedeelde code voor alle pagina's: taal (NL/EN), wachtwoord, donker/licht thema en muziekknop
(function () {
  // ---- Taal: Nederlands / Engels (wordt onthouden, gedeeld tussen alle pagina's)
  // De Engelse tekst staat in de HTML naast de Nederlandse, in data-en (en data-en-title, data-en-alt, ...).
  let lang = 'nl';
  try { if (localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) {}
  window.t = (nl, en) => (lang === 'en' ? en : nl);
  // Voor tekst die de pagina zelf later verandert (bijv. de score na game over)
  window.setText = function (el, nl, en) { el.dataset.nl = nl; el.dataset.en = en; el.innerHTML = t(nl, en); };
  const ATTRS = ['title', 'alt', 'placeholder', 'aria-label'];
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach((el) => {
      if (el.dataset.nl === undefined) el.dataset.nl = el.innerHTML;
      el.innerHTML = t(el.dataset.nl, el.dataset.en);
    });
    ATTRS.forEach((a) => {
      document.querySelectorAll('[data-en-' + a + ']').forEach((el) => {
        const key = 'data-nl-' + a;
        if (!el.hasAttribute(key)) el.setAttribute(key, el.getAttribute(a) || '');
        el.setAttribute(a, t(el.getAttribute(key), el.getAttribute('data-en-' + a)));
      });
    });
    langBtn.textContent = t('EN', 'NL');
    langBtn.title = t('Switch to English', 'Naar het Nederlands');
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  const langBtn = document.createElement('button');
  langBtn.id = 'langBtn';
  document.body.appendChild(langBtn);
  langBtn.addEventListener('click', () => {
    lang = lang === 'en' ? 'nl' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
  });

  // ---- Wachtwoordbeveiliging (eenvoudig, alleen om bezoekers even tegen te houden)
  const PASSWORD = 'RP2026';
  if (sessionStorage.getItem('unlocked') === 'yes') {
    document.body.classList.remove('locked');
  } else {
    const lock = document.createElement('div');
    lock.id = 'lock';
    lock.innerHTML =
      '<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>' +
      '<div class="lock-card" id="lockCard">' +
      '<div class="lock-icon">&#128274;</div>' +
      '<h2 data-en="Enter the password">Voer het wachtwoord in</h2>' +
      '<input type="password" id="pw" placeholder="Wachtwoord" data-en-placeholder="Password" autocomplete="off">' +
      '<button id="pwBtn" data-en="Open">Openen</button>' +
      '<div class="err" id="pwErr"></div>' +
      '</div>';
    document.body.insertBefore(lock, document.body.firstChild);
    const card = lock.querySelector('#lockCard'), pw = lock.querySelector('#pw');
    pw.focus();
    function check() {
      if (pw.value === PASSWORD) {
        sessionStorage.setItem('unlocked', 'yes');
        document.body.classList.remove('locked');
        lock.classList.add('done');
        setTimeout(() => lock.remove(), 800);
      } else {
        setText(lock.querySelector('#pwErr'), 'Onjuist wachtwoord, probeer het opnieuw.', 'Wrong password, please try again.');
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      }
    }
    lock.querySelector('#pwBtn').addEventListener('click', check);
    pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
  }

  applyLang();

  // ---- Donker / licht thema (wordt onthouden, gedeeld tussen alle pagina's)
  const root = document.documentElement, themeBtn = document.getElementById('themeBtn');
  function applyTheme(n) { root.classList.toggle('night', n); if (themeBtn) themeBtn.textContent = n ? '☀' : '☾'; }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved === 'night');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const n = !root.classList.contains('night'); applyTheme(n);
    try { localStorage.setItem('theme', n ? 'night' : 'light'); } catch (e) {}
  });

  // ---- Muziekknop (onthoudt de afspeelpositie, zodat de muziek na een paginawissel doorgaat)
  const musicBtn = document.getElementById('music'), bgm = document.getElementById('bgm');
  if (musicBtn && bgm) {
    const t = parseFloat(sessionStorage.getItem('bgmTime') || '0');
    if (t > 0) {
      if (bgm.readyState >= 1) bgm.currentTime = t;
      else bgm.addEventListener('loadedmetadata', () => { bgm.currentTime = t; }, { once: true });
    }
    setInterval(() => { if (!bgm.paused) sessionStorage.setItem('bgmTime', bgm.currentTime); }, 500);
    musicBtn.addEventListener('click', () => {
      if (bgm.paused) { bgm.play(); musicBtn.textContent = '❚❚'; }
      else { bgm.pause(); musicBtn.textContent = '♪'; }
    });
  }
})();
