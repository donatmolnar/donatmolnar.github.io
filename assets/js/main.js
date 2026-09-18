/* ============================================================
   donatmolnar — portfolio behaviour
   No dependencies. Everything degrades gracefully without JS.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── theme ─────────────────────────────────────────────── */

  var toggle = document.getElementById('theme-toggle');
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var THEME_COLORS = { dark: '#080a12', light: '#f6f6fb' };

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeColor) themeColor.setAttribute('content', THEME_COLORS[theme]);
    if (toggle) {
      var next = theme === 'dark' ? 'light' : 'dark';
      toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    }
  }

  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    });
  }

  // follow the OS only while the visitor has not made an explicit choice
  var osScheme = window.matchMedia('(prefers-color-scheme: light)');
  var onSchemeChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (err) { /* private mode */ }
    if (!stored) applyTheme(e.matches ? 'light' : 'dark');
  };
  if (osScheme.addEventListener) osScheme.addEventListener('change', onSchemeChange);

  /* ── scroll dots ───────────────────────────────────────── */

  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var sections = dots
    .map(function (d) { return document.querySelector(d.getAttribute('href')); })
    .filter(Boolean);

  function setActive(index) {
    dots.forEach(function (dot, i) {
      var on = i === index;
      dot.classList.toggle('is-active', on);
      if (on) { dot.setAttribute('aria-current', 'true'); }
      else    { dot.removeAttribute('aria-current'); }
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  setActive(0);

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { setActive(i); });
  });

  /* ── back to top ───────────────────────────────────────── */

  var toTop = document.getElementById('to-top');

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
      // move focus back to the start of the document for keyboard users
      var home = document.getElementById('home');
      if (home) {
        home.setAttribute('tabindex', '-1');
        home.focus({ preventScroll: true });
      }
    });
  }

  /* ── timeline rail progress + to-top visibility ────────── */

  var timeline = document.getElementById('timeline');
  var ticking = false;

  function onScroll() {
    if (toTop) {
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.65);
    }

    if (timeline) {
      var rect = timeline.getBoundingClientRect();
      var progress = (window.innerHeight * 0.68 - rect.top) / (rect.height || 1);
      timeline.style.setProperty('--rail-progress', Math.max(0, Math.min(1, progress)).toFixed(3));
    }

    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  onScroll();

  /* ── cursor glow on cards ──────────────────────────────── */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pending = null;

    document.addEventListener('pointermove', function (event) {
      var target = event.target instanceof Element
        ? event.target.closest('[data-glow]')
        : null;
      if (!target) return;

      if (!pending) {
        window.requestAnimationFrame(function () {
          var el = pending.el;
          var rect = el.getBoundingClientRect();
          el.style.setProperty('--mx', (pending.x - rect.left) + 'px');
          el.style.setProperty('--my', (pending.y - rect.top) + 'px');
          pending = null;
        });
      }
      pending = { el: target, x: event.clientX, y: event.clientY };
    }, { passive: true });
  }

  /* ── reveal on scroll ──────────────────────────────────── */

  var revealables = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ── additional Credly badges ──────────────────────────── */

  var badgesToggle = document.getElementById('badges-toggle');
  var badgesExtra = document.getElementById('badges-extra');

  if (badgesToggle && badgesExtra) {
    var label = badgesToggle.querySelector('.badges-toggle-label');
    var count = badgesExtra.querySelectorAll('.badge-mini').length;
    if (label) label.textContent = 'Show ' + count + ' more badges';

    badgesToggle.addEventListener('click', function () {
      var open = badgesToggle.getAttribute('aria-expanded') === 'true';
      badgesToggle.setAttribute('aria-expanded', String(!open));
      badgesExtra.hidden = open;
      if (label) label.textContent = open ? 'Show ' + count + ' more badges' : 'Hide additional badges';
    });
  }

  /* ── anything date-derived ─────────────────────────────── */
  // Values in the markup are only the no-JS fallback; these recompute every visit.

  var thisYear = new Date().getFullYear();

  document.querySelectorAll('[data-years-since]').forEach(function (el) {
    var since = parseInt(el.dataset.yearsSince, 10);
    // replace the leading text node only, leaving the trailing "+" span intact
    if (since && el.firstChild) el.firstChild.nodeValue = String(Math.max(0, thisYear - since));
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(thisYear);
})();
