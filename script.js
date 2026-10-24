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
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) { }
    syncToggle();
  });

  systemDark.addEventListener('change', syncToggle);
  syncToggle();
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
