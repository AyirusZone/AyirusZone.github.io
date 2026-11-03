(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  }

  function syncToggle() {
    toggle.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    function apply() {
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) { }
      syncToggle();
    }
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });

  systemDark.addEventListener('change', syncToggle);
  syncToggle();

  var header = document.querySelector('.site-header');
  function compactHeader() {
    if (header) header.classList.toggle('is-compact', window.scrollY > 16);
  }
  compactHeader();
  window.addEventListener('scroll', compactHeader, { passive: true });
})();

(function () {
  var root = document.documentElement;
  var enBtn = document.getElementById('lang-en');
  var frBtn = document.getElementById('lang-fr');
  var hero = document.querySelector('.hero');

  function setLocale(locale) {
    root.lang = locale;
    root.dataset.locale = locale;
    if (enBtn) enBtn.setAttribute('aria-pressed', String(locale === 'en'));
    if (frBtn) frBtn.setAttribute('aria-pressed', String(locale === 'fr'));
    if (hero) hero.setAttribute('aria-labelledby', locale === 'fr' ? 'top-fr' : 'top');
    try { localStorage.setItem('locale', locale); } catch (e) { }
  }

  if (enBtn) enBtn.addEventListener('click', function () { setLocale('en'); });
  if (frBtn) frBtn.addEventListener('click', function () { setLocale('fr'); });

  try {
    var saved = localStorage.getItem('locale');
    if (saved === 'fr' || saved === 'en') setLocale(saved);
  } catch (e) { }
})();

// Experience meter: counts from my first day at TCS (8 August 2017, UTC).
(function () {
  var START = Date.UTC(2017, 7, 8);
  var daysEl = document.getElementById('meter-days');
  var unitEl = document.getElementById('meter-unit');
  var row = document.getElementById('meter-seconds-row');
  var secondsEl = document.getElementById('meter-seconds');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var format = new Intl.NumberFormat();

  function paint() {
    var seconds = Math.floor((Date.now() - START) / 1000);
    daysEl.textContent = format.format(Math.floor(seconds / 86400));
    unitEl.textContent = 'days in data engineering';
    secondsEl.textContent = format.format(seconds);
  }

  paint();

  if (reduceMotion) {
    return;
  }

  row.hidden = false;
  setInterval(paint, 250);
})();
