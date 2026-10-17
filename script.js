(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- Theme: system (default) → light → dark ----------------
     "system" removes data-theme so CSS follows prefers-color-scheme live. */
  const toggle = document.getElementById("themeToggle");
  const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove()); // JS takes over the static ones
  const themeMeta = document.createElement("meta");
  themeMeta.name = "theme-color";
  document.head.appendChild(themeMeta);
  const labels = { system: "system", light: "light", dark: "dark" };
  const order = ["system", "light", "dark"];

  function savedMode() {
    try { const t = localStorage.getItem("theme"); return t === "light" || t === "dark" ? t : "system"; }
    catch (e) { return "system"; }
  }
  function applyMode(mode) {
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    const dark = mode === "dark" || (mode === "system" && darkMQ.matches);
    themeMeta.content = dark ? "#000000" : "#f5f5f7";
    toggle.dataset.mode = mode;
    toggle.setAttribute("aria-label", `Theme: ${labels[mode]}. Click to change.`);
    toggle.title = `Theme: ${labels[mode]}`;
  }
  function setMode(mode) {
    try { mode === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", mode); } catch (e) {}
    if (!reduceMotion) {
      root.classList.add("theme-anim");
      setTimeout(() => root.classList.remove("theme-anim"), 300);
    }
    applyMode(mode);
  }
  applyMode(savedMode());
  toggle.addEventListener("click", () => {
    setMode(order[(order.indexOf(toggle.dataset.mode) + 1) % order.length]);
  });
  darkMQ.addEventListener && darkMQ.addEventListener("change", () => applyMode(savedMode()));

  /* ---------------------------------------------------------------
     Spring, parameterised the Apple way: damping ratio + response.
     damping 1.0 = critically damped (no overshoot); response = seconds.
     It integrates from the current value and velocity, so it can be
     re-targeted at any moment without a visible jump.
     --------------------------------------------------------------- */
  function spring({ from = 0, to = 1, velocity = 0, damping = 1, response = 0.5, onUpdate, onDone }) {
    const omega = (2 * Math.PI) / response;
    const k = omega * omega;
    const c = 2 * damping * omega;
    let x = from, v = velocity, last = performance.now(), raf;

    function frame(now) {
      let dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      // sub-step for stability
      const steps = Math.ceil(dt / (1 / 240));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const a = -k * (x - to) - c * v;
        v += a * h;
        x += v * h;
      }
      onUpdate(x);
      if (Math.abs(x - to) < 0.0005 && Math.abs(v) < 0.001) {
        onUpdate(to);
        onDone && onDone();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  /* ---------------- Reveal on scroll ----------------
     Critically damped, no bounce: nothing here carries momentum.
     Reduced motion: a plain opacity fade, no travel. */
  root.classList.add("js");
  const revealEls = [...document.querySelectorAll(".reveal")];

  function reveal(el, delay = 0) {
    if (el.classList.contains("is-in")) return;
    const show = () => {
      el.classList.add("is-in");
      if (reduceMotion) {
        el.style.transition = "opacity 200ms ease";
        return;
      }
      const travel = 24;
      el.style.transform = `translateY(${travel}px)`;
      el.style.opacity = "0";
      spring({
        from: 0, to: 1, damping: 1, response: 0.6,
        onUpdate: (p) => {
          el.style.transform = `translateY(${(1 - p) * travel}px)`;
          el.style.opacity = String(Math.max(0, Math.min(1, p)));
        },
        onDone: () => { el.style.transform = ""; el.style.opacity = ""; }
      });
    };
    delay ? setTimeout(show, delay) : show();
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      // stagger siblings entering together
      let i = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target, reduceMotion ? 0 : i++ * 60);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------- Metric count-up (spring-eased) ---------------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || !("IntersectionObserver" in window)) return; // keep the static text
    el.textContent = "0" + suffix;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      spring({
        from: 0, to: target, damping: 1, response: 0.9,
        onUpdate: (n) => { el.textContent = Math.round(n) + suffix; },
        onDone: () => { el.textContent = target + suffix; }
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------------- Nav: edge line only once content scrolls under it ---------------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Active section link */
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = map.get(e.target.id);
        if (link && e.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------------- Press feedback on pointer-DOWN, not on release ----------------
     CSS :active covers most cases; this class makes it instant on touch and
     lets the user cancel by dragging away. */
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", () => btn.classList.add("is-pressed"));
    ["pointerup", "pointercancel", "pointerleave"].forEach((t) =>
      btn.addEventListener(t, () => btn.classList.remove("is-pressed")));
  });
})();
