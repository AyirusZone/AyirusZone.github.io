(function () {
  'use strict';

  window.__visuals = true;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal on scroll, and count-up numbers ****************************** */

  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var start = performance.now();
    var duration = 1000;

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Active section in the header nav ****************************** */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a, .dock a'));

  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      (byId[id] = byId[id] || []).push(a);
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var links = byId[entry.target.id];
        if (!links || !entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        });
        links.forEach(function (link) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'location');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  var roleLinks = Array.prototype.slice.call(document.querySelectorAll('.role-jump a'));
  if ('IntersectionObserver' in window && roleLinks.length) {
    var roleById = {};
    roleLinks.forEach(function (a) { roleById[a.getAttribute('href').slice(1)] = a; });
    var roleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = roleById[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        roleLinks.forEach(function (a) { a.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    Object.keys(roleById).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) roleObserver.observe(node);
    });
  }

  document.querySelectorAll('details.story').forEach(function (story) {
    story.addEventListener('toggle', function () {
      if (!story.open) return;
      var group = story.closest('.stories');
      if (!group) return;
      group.querySelectorAll('details.story').forEach(function (sib) {
        if (sib !== story) sib.open = false;
      });
    });
  });

  /* Platform map: tabs with arrow-key support ****************************** */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tabs] [role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }

  if (tabs.length) {
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        else return;
        e.preventDefault();
        selectTab(next, true);
      });
    });
    selectTab(document.getElementById('tab-process'), false);
  }

  /* Career timeline ****************************** */

  var timeline = document.getElementById('timeline');

  function monthIndex(year, month) {
    // Months since July 2017 (month is 0-based).
    return (year - 2017) * 12 + (month - 6);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildTimeline() {
    var now = new Date();
    var nowIdx = monthIndex(now.getFullYear(), now.getMonth()) + now.getDate() / 31;
    var span = Math.ceil(nowIdx) + 2;
    var pct = function (idx) { return (idx / span * 100).toFixed(2); };

    var rows = [
      { who: 'Warner Bros. Discovery', bars: [{ label: '', title: 'Senior Data Engineer', dates: 'Apr 2026 – Present', s: monthIndex(2026, 3), e: nowIdx, now: true }] },
      { who: 'Nielsen', bars: [{ label: 'Data Engineer (MTS II)', dates: 'Jun 2023 – Feb 2026', s: monthIndex(2023, 5), e: monthIndex(2026, 1) }] },
      { who: 'PDI Technologies', bars: [{ label: 'Data Engineer II', dates: 'Dec 2021 – Jun 2023', s: monthIndex(2021, 11), e: monthIndex(2023, 5) }] },
      {
        who: 'Tata Consultancy Services',
        bars: [
          { label: 'Assistant System Engineer', dates: 'Aug 2017 – Aug 2019', s: monthIndex(2017, 7), e: monthIndex(2019, 7) },
          { label: 'System Engineer', dates: 'Aug 2019 – Dec 2021', s: monthIndex(2019, 7), e: monthIndex(2021, 11), alt: true }
        ]
      }
    ];

    var marks = [
      { label: 'Airflow DAG authoring', at: monthIndex(2021, 9), side: 'above' },
      { label: 'AWS SAA', at: monthIndex(2024, 11), side: 'above' },
      { label: 'Airflow 3', at: monthIndex(2025, 6), side: 'below' },
      { label: 'AWS AI Practitioner', at: monthIndex(2026, 0), side: 'above' },
      { label: 'SathyaMool.ai', at: monthIndex(2026, 5), side: 'below' }
    ];

    var years = [];
    for (var y = 2018; monthIndex(y, 0) <= nowIdx; y++) years.push(y);

    function addGrid(track) {
      years.forEach(function (year) {
        var line = el('i', 'tl__line');
        line.style.setProperty('--p', pct(monthIndex(year, 0)));
        track.appendChild(line);
      });
      var nowLine = el('i', 'tl__now');
      nowLine.style.setProperty('--p', pct(nowIdx));
      track.appendChild(nowLine);
    }

    function row(label, extraClass) {
      var r = el('div', 'tl__row' + (extraClass ? ' ' + extraClass : ''));
      r.appendChild(el('span', 'tl__who', label));
      var track = el('div', 'tl__track');
      r.appendChild(track);
      return { row: r, track: track };
    }

    var frag = document.createDocumentFragment();

    var axis = row('', 'tl__row--axis');
    years.forEach(function (year) {
      var tick = el('span', 'tl__tick', String(year));
      tick.style.setProperty('--p', pct(monthIndex(year, 0)));
      axis.track.appendChild(tick);
    });
    var nowTick = el('span', 'tl__tick', 'Now');
    nowTick.style.setProperty('--p', pct(nowIdx));
    axis.track.appendChild(nowTick);
    frag.appendChild(axis.row);

    rows.forEach(function (r) {
      var built = row(r.who);
      addGrid(built.track);
      r.bars.forEach(function (b) {
        var bar = el('i', 'tl__bar' + (b.now ? ' tl__bar--now' : '') + (b.alt ? ' tl__bar--alt' : ''), b.label);
        bar.style.setProperty('--l', pct(b.s));
        bar.style.setProperty('--w', (pct(b.e) - pct(b.s) - 0.25).toFixed(2));
        bar.title = (b.title || b.label) + ' · ' + b.dates;
        built.track.appendChild(bar);
      });
      frag.appendChild(built.row);
    });

    var certs = row('Certifications and project', 'tl__row--certs');
    addGrid(certs.track);
    marks.forEach(function (m) {
      var mark = el('span', 'tl__mark tl__mark--' + m.side);
      mark.style.setProperty('--l', pct(m.at));
      mark.appendChild(el('i'));
      mark.appendChild(el('span', '', m.label));
      certs.track.appendChild(mark);
    });
    frag.appendChild(certs.row);

    timeline.appendChild(frag);
  }

  if (timeline) buildTimeline();

  /* Motion max: pointer, kinetic title, magnetic buttons, card tilt ****************************** */

  var hero = document.querySelector('.hero');
  var pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, cx: -80, cy: -80, tcx: -80, tcy: -80 };
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  function splitTitle(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var i = 0;
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var wrap = document.createElement('span');
          wrap.className = 'w';
          wrap.style.setProperty('--i', String(i++));
          var inner = document.createElement('span');
          inner.textContent = part;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        var wrap = document.createElement('span');
        wrap.className = 'w';
        wrap.style.setProperty('--i', String(i++));
        var inner = document.createElement('span');
        inner.className = node.className;
        while (node.firstChild) inner.appendChild(node.firstChild);
        wrap.appendChild(inner);
        el.replaceChild(wrap, node);
      }
    });
  }

  if (!reduceMotion) {
    document.documentElement.classList.add('motion-ok');
    document.querySelectorAll('.hero__title').forEach(splitTitle);
    if (hero) requestAnimationFrame(function () { hero.classList.add('is-ready'); });

    document.addEventListener('pointermove', function (e) {
      pointer.tx = (e.clientX / window.innerWidth) * 100;
      pointer.ty = (e.clientY / window.innerHeight) * 100;
      pointer.tcx = e.clientX;
      pointer.tcy = e.clientY;
    }, { passive: true });

    document.addEventListener('pointerdown', function () {
      document.documentElement.style.setProperty('--ch', '1.7');
    });
    document.addEventListener('pointerup', function () {
      document.documentElement.style.setProperty('--ch', '1');
    });

    if (finePointer) {
      document.documentElement.classList.add('cursor-on');
      document.querySelectorAll('a, button, summary').forEach(function (el) {
        el.addEventListener('pointerenter', function () {
          document.documentElement.style.setProperty('--ch', '2.2');
        });
        el.addEventListener('pointerleave', function () {
          document.documentElement.style.setProperty('--ch', '1');
        });
      });

      document.querySelectorAll('.magnetic').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          var x = (e.clientX - (r.left + r.width / 2)) * 0.28;
          var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
          el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        });
        el.addEventListener('pointerleave', function () {
          el.style.transform = '';
        });
      });

      document.querySelectorAll('.rcard, .meter').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          el.style.setProperty('--rx', ((0.5 - py) * 10).toFixed(2) + 'deg');
          el.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(2) + 'deg');
          el.style.setProperty('--lx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--ly', (py * 100).toFixed(1) + '%');
        });
        el.addEventListener('pointerleave', function () {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
        });
      });
    }

    var ticking = false;
    function paintMotion() {
      ticking = false;
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.cx += (pointer.tcx - pointer.cx) * 0.18;
      pointer.cy += (pointer.tcy - pointer.cy) * 0.18;
      var rootStyle = document.documentElement.style;
      rootStyle.setProperty('--mx', pointer.x.toFixed(2));
      rootStyle.setProperty('--my', pointer.y.toFixed(2));
      rootStyle.setProperty('--cx', pointer.cx.toFixed(1));
      rootStyle.setProperty('--cy', pointer.cy.toFixed(1));
      rootStyle.setProperty('--sc', Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1).toFixed(3));
    }

    function requestPaint() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paintMotion);
    }

    window.addEventListener('scroll', requestPaint, { passive: true });
    var motionId = 0;
    function loopMotion() {
      if (document.hidden) {
        motionId = 0;
        return;
      }
      requestPaint();
      motionId = requestAnimationFrame(loopMotion);
    }
    loopMotion();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !motionId) loopMotion();
    });
  } else if (hero) {
    hero.classList.add('is-ready');
  }

  /* Hero data streams: raw events enter on the left, leave processed on the right ****************************** */

  var canvas = document.getElementById('flow');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  hero = hero || canvas.closest('.hero');
  var LANES = 12;
  var CORE = 0.64;
  var W = 0;
  var H = 0;
  var particles = [];
  var palette = { accent: [131, 148, 255], accent2: [61, 219, 200], raw: [159, 176, 198], dark: true };
  var frameId = 0;
  var last = 0;
  var clock = 0;
  var inView = true;
  var flowPtr = { x: 0, y: 0 };

  function probe(cssVar) {
    var node = document.createElement('span');
    node.setAttribute('aria-hidden', 'true');
    node.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;color:var(' + cssVar + ')';
    document.body.appendChild(node);
    var parts = (getComputedStyle(node).color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    document.body.removeChild(node);
    return parts.length === 3 ? parts : null;
  }

  function readPalette() {
    palette.accent = probe('--accent') || palette.accent;
    palette.accent2 = probe('--accent-2') || palette.accent2;
    palette.raw = probe('--muted') || palette.raw;
    var paper = probe('--paper') || [6, 10, 19];
    palette.dark = (paper[0] * 0.299 + paper[1] * 0.587 + paper[2] * 0.114) < 128;
  }

  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function smooth(a, b, x) {
    var t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  }

  function laneY(i, x) {
    var top = H * 0.08;
    var bottom = H * 0.92;
    var baseY = top + (bottom - top) * (i / (LANES - 1));
    var centre = H * 0.46;
    var d = (x - W * CORE) / (W * 0.15);
    var pinch = Math.exp(-d * d);
    var wave = Math.sin(x * 0.007 + i * 1.15 + clock * 0.85) * 10 * (1 - pinch * 0.75);
    var pull = Math.exp(-Math.pow((x - flowPtr.x) / (W * 0.22), 2));
    return centre + (baseY - centre) * (1 - 0.82 * pinch) + wave + (flowPtr.y - centre) * pull * 0.22;
  }

  function seed() {
    particles = [];
    var perLane = Math.max(5, Math.round(W / 140));
    for (var i = 0; i < LANES; i++) {
      for (var k = 0; k < perLane; k++) {
        particles.push({
          lane: i,
          x: Math.random() * (W + 80) - 40,
          speed: 70 + Math.random() * 110,
          size: 1.3 + Math.random() * 2
        });
      }
    }
  }

  function resize() {
    var box = hero.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flowPtr.x = W * CORE;
    flowPtr.y = H * 0.46;
    seed();
    draw(0);
  }

  function draw(dt) {
    clock += dt;
    flowPtr.x += ((pointer.tx / 100) * W - flowPtr.x) * 0.08;
    flowPtr.y += ((pointer.ty / 100) * H - flowPtr.y) * 0.08;
    ctx.clearRect(0, 0, W, H);

    // Lane guides
    var guide = ctx.createLinearGradient(0, 0, W, 0);
    guide.addColorStop(0, rgba(palette.raw, 0.1));
    guide.addColorStop(CORE, rgba(palette.accent, 0.22));
    guide.addColorStop(1, rgba(palette.accent2, 0.26));
    ctx.strokeStyle = guide;
    ctx.lineWidth = 1;
    for (var i = 0; i < LANES; i++) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 24) {
        var y = laneY(i, x);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Processing core
    var coreX = W * CORE;
    var glow = ctx.createLinearGradient(coreX - 70, 0, coreX + 70, 0);
    glow.addColorStop(0, rgba(palette.accent, 0));
    glow.addColorStop(0.5, rgba(palette.accent, palette.dark ? 0.16 : 0.1));
    glow.addColorStop(1, rgba(palette.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(coreX - 70, 0, 140, H);

    // Particles
    ctx.globalCompositeOperation = palette.dark ? 'lighter' : 'source-over';
    for (var p = 0; p < particles.length; p++) {
      var pt = particles[p];
      pt.x += pt.speed * dt;
      if (pt.x > W + 40) pt.x = -40;
      var py = laneY(pt.lane, pt.x);
      var done = smooth(coreX - 50, coreX + 50, pt.x);

      if (done < 0.5) {
        ctx.fillStyle = rgba(palette.raw, 0.55);
        ctx.fillRect(pt.x - pt.size, py - pt.size, pt.size * 2, pt.size * 2);
      } else {
        var tint = pt.lane % 2 ? palette.accent2 : palette.accent;
        var tail = 10 + 28 * done;
        ctx.strokeStyle = rgba(tint, palette.dark ? 0.5 : 0.7);
        ctx.lineWidth = pt.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pt.x - tail, laneY(pt.lane, pt.x - tail));
        ctx.lineTo(pt.x, py);
        ctx.stroke();
        ctx.fillStyle = rgba(tint, 0.95);
        ctx.beginPath();
        ctx.arc(pt.x, py, pt.size * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(ts) {
    frameId = requestAnimationFrame(loop);
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    draw(dt);
  }

  function start() {
    if (frameId || reduceMotion || !inView || document.hidden) return;
    last = performance.now();
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  readPalette();
  resize();

  if (!reduceMotion) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { resize(); }).observe(hero);
  } else {
    window.addEventListener('resize', resize);
  }

  // Re-read colours when the theme changes.
  function themeChanged() {
    readPalette();
    draw(0);
  }

  new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChanged);
})();
