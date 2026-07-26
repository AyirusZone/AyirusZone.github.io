(function () {
  var root = document.documentElement;
  var chk = document.getElementById('chk');
  var sunMoonContainer = document.querySelector('.sun-moon-container');

  function applyTheme(isDark, persist) {
    root.classList.toggle('dark', isDark);
    chk.checked = isDark;
    sunMoonContainer.style.setProperty('--rotation', isDark ? 180 : 0);
    if (persist) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  applyTheme(root.classList.contains('dark'), false);

  chk.addEventListener('change', function () {
    applyTheme(chk.checked, true);
  });
})();

var TxtRotate = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 1000;
  this.txt = '';
  this.isDeleting = false;
  this.tick();
};

TxtRotate.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  this.txt = this.isDeleting
    ? fullTxt.substring(0, this.txt.length - 1)
    : fullTxt.substring(0, this.txt.length + 1);

  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

  var delta = 300 - Math.random() * 100;
  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  var that = this;
  setTimeout(function () {
    that.tick();
  }, delta);
};

window.addEventListener('load', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var elements = document.getElementsByClassName('txt-rotate');

  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-rotate');
    var period = elements[i].getAttribute('data-period');
    if (!toRotate) continue;

    var words = JSON.parse(toRotate);
    if (reduceMotion) {
      elements[i].innerHTML = '<span class="wrap">' + words[0] + '</span>';
      continue;
    }
    new TxtRotate(elements[i], words, period);
  }
});
