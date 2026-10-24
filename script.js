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

// Pipeline pace meter: 500M events a day is about 5,787 events a second.
(function () {
  var EVENTS_PER_SECOND = 500000000 / 86400;
  var total = document.getElementById('meter-total');
  var row = document.getElementById('meter-total-row');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    row.hidden = true;
    return;
  }

  var format = new Intl.NumberFormat();
  var start = performance.now();
  var lastPaint = 0;

  function frame(now) {
    if (now - lastPaint >= 100) {
      lastPaint = now;
      total.textContent = format.format(Math.floor((now - start) / 1000 * EVENTS_PER_SECOND));
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
