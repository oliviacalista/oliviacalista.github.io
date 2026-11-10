(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: mobile toggle + scrolled state + active link ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");

  function closeMenu() {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navAnchors = Array.prototype.slice.call(links.querySelectorAll("a"));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + entry.target.id);
          if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "true");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Works filter ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var works = Array.prototype.slice.call(document.querySelectorAll(".work"));

  filters.forEach(function (btn) {
    var key = btn.getAttribute("data-filter");
    var n = key === "all" ? works.length : works.filter(function (w) { return w.dataset.cat === key; }).length;
    var c = document.createElement("span");
    c.className = "count";
    c.textContent = "(" + n + ")";
    btn.appendChild(c);

    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      works.forEach(function (w) {
        w.hidden = !(key === "all" || w.dataset.cat === key);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-caption");
  var lbCount = document.getElementById("lb-count");
  var btnPrev = lb.querySelector(".lb-prev");
  var btnNext = lb.querySelector(".lb-next");
  var btnClose = lb.querySelector(".lb-close");
  var current = [];
  var index = 0;
  var lastFocus = null;

  function visibleWorks() {
    return works.filter(function (w) { return !w.hidden; });
  }

  function render() {
    var w = current[index];
    var btn = w.querySelector(".work__btn");
    var thumb = btn.querySelector("img");
    lbImg.src = btn.getAttribute("data-full");
    lbImg.alt = thumb.alt;
    var title = w.querySelector(".work__title").textContent;
    var org = w.querySelector(".work__org").textContent;
    lbCap.innerHTML = "";
    var strong = document.createElement("strong");
    strong.textContent = title;
    lbCap.appendChild(strong);
    lbCap.appendChild(document.createTextNode(org));
    lbCount.textContent = (index + 1) + " / " + current.length;
  }

  function open(work) {
    current = visibleWorks();
    index = Math.max(0, current.indexOf(work));
    lastFocus = document.activeElement;
    render();
    lb.hidden = false;
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    btnClose.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    lb.hidden = true;
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }

  function step(d) {
    index = (index + d + current.length) % current.length;
    render();
  }

  works.forEach(function (w) {
    w.querySelector(".work__btn").addEventListener("click", function () { open(w); });
  });
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });
  btnClose.addEventListener("click", close);
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lightbox__stage")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") {
      var f = [btnClose, btnPrev, btnNext];
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // swipe
  var startX = null, startY = null;
  lb.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    startX = startY = null;
  });
})();

/* ---------- Lanyard ID card (spring pendulum) ---------- */
(function () {
  "use strict";
  var root = document.querySelector("[data-lanyard]");
  if (!root) return;
  var card = root.querySelector(".badge");
  var band = root.querySelector(".lanyard__band");
  var seam = root.querySelector(".lanyard__seam");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var K = 140, G = 900, DAMP = 0.978, STEP = 1 / 120, MAXA = 50 * Math.PI / 180;
  var anchor = { x: 0, y: -40 }, L = 180;
  var p = { x: 0, y: 0 }, v = { x: 0, y: 0 };
  var dragging = false, grab = { x: 0, y: 0 }, last = { x: 0, y: 0, t: 0 };
  var running = false, prevT = 0, acc = 0;

  function layout() {
    var w = root.clientWidth;
    L = w < 420 ? 120 : 180;
    anchor.x = w / 2;
    anchor.y = -40;
  }
  function rest() { return { x: anchor.x, y: anchor.y + L + G / K }; }

  function draw() {
    var dx = p.x - anchor.x, dy = p.y - anchor.y;
    var ang = Math.atan2(dx, dy) * 180 / Math.PI;
    var w = card.offsetWidth;
    card.style.transform = "translate(" + (p.x - w / 2) + "px," + p.y + "px) rotate(" + (-ang) + "deg)";
    var midX = (anchor.x + p.x) / 2, midY = (anchor.y + p.y) / 2 + 10;
    var d = "M" + (anchor.x - 16) + " " + anchor.y + " Q " + midX + " " + midY + " " + p.x + " " + (p.y - 18) +
            " M" + (anchor.x + 16) + " " + anchor.y + " Q " + midX + " " + midY + " " + p.x + " " + (p.y - 18);
    band.setAttribute("d", d);
    seam.setAttribute("d", d);
  }

  function step(dt) {
    var dx = p.x - anchor.x, dy = p.y - anchor.y;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var f = -K * (dist - L);
    v.x += (f * dx / dist) * dt;
    v.y += (f * dy / dist + G) * dt;
    var damp = Math.pow(DAMP, dt * 60);
    v.x *= damp; v.y *= damp;
    p.x += v.x * dt; p.y += v.y * dt;
    clampAngle(true);
  }

  // keep the card within about 50 degrees of hanging straight down
  function clampAngle(soft) {
    var dx = p.x - anchor.x, dy = p.y - anchor.y;
    var a = Math.atan2(dx, dy);
    if (Math.abs(a) <= MAXA) return;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var lim = MAXA * (a < 0 ? -1 : 1);
    p.x = anchor.x + Math.sin(lim) * dist;
    p.y = anchor.y + Math.cos(lim) * dist;
    if (soft) { v.x *= -0.35; v.y *= 0.6; }
  }

  function loop(t) {
    if (!prevT) prevT = t;
    acc += Math.min(0.05, (t - prevT) / 1000);
    prevT = t;
    if (!dragging) {
      while (acc >= STEP) { step(STEP); acc -= STEP; }
    } else { acc = 0; }
    draw();
    var r = rest();
    var calm = Math.abs(v.x) + Math.abs(v.y) < 3 && Math.abs(p.x - r.x) + Math.abs(p.y - r.y) < 0.6;
    if (!dragging && calm) { running = false; prevT = 0; p = r; v = { x: 0, y: 0 }; draw(); return; }
    requestAnimationFrame(loop);
  }
  function kick() {
    if (reduce && !dragging) { p = rest(); draw(); return; }
    if (!running) { running = true; prevT = 0; acc = 0; requestAnimationFrame(loop); }
  }

  function local(e) {
    var r = root.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  card.addEventListener("pointerdown", function (e) {
    dragging = true;
    card.setPointerCapture(e.pointerId);
    var q = local(e);
    grab = { x: q.x - p.x, y: q.y - p.y };
    last = { x: q.x, y: q.y, t: performance.now() };
    v = { x: 0, y: 0 };
    kick();
  });
  card.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var q = local(e), now = performance.now();
    var nx = q.x - grab.x, ny = q.y - grab.y;
    var dx = nx - anchor.x, dy = ny - anchor.y, dist = Math.sqrt(dx * dx + dy * dy) || 1, max = L * 1.5;
    if (dist > max) { nx = anchor.x + dx / dist * max; ny = anchor.y + dy / dist * max; }
    if (ny < anchor.y + 40) ny = anchor.y + 40;
    var dt = Math.max(0.008, (now - last.t) / 1000);
    v = { x: (nx - p.x) / dt, y: (ny - p.y) / dt };
    p = { x: nx, y: ny };
    clampAngle(false);
    last = { x: q.x, y: q.y, t: now };
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    v.x = Math.max(-900, Math.min(900, v.x));
    v.y = Math.max(-900, Math.min(900, v.y));
    kick();
  }
  card.addEventListener("pointerup", release);
  card.addEventListener("pointercancel", release);
  card.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      v.x += e.key === "ArrowLeft" ? -520 : 520;
      kick();
    }
  });

  // size the stage so the hint always sits below the hanging card
  function fit() {
    root.style.height = Math.ceil(rest().y + card.offsetHeight + 56) + "px";
  }

  layout();
  fit();
  p = rest();
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener("resize", function () { layout(); fit(); if (!running) { p = rest(); draw(); } else kick(); });

  if (!reduce && "IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        seen.disconnect();
        v.x = 420;
        kick();
      }
    }, { threshold: 0.4 });
    seen.observe(root);
  }
})();

/* footer year updates itself */
(function () {
  var el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
})();
