/* ============================================
   JWK Services — v2 Interactions
   Smooth reveals, stats, nav, form
   ============================================ */
(function () {
  'use strict';

  // ── Sticky Nav ──
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile Menu ──
  var toggle = document.getElementById('navToggle');
  var overlay = document.getElementById('mobileMenu');
  var mobileLinks = overlay.querySelectorAll('a');

  function closeMenu() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  toggle.addEventListener('click', function () {
    overlay.classList.contains('open') ? closeMenu() : openMenu();
  });
  mobileLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // ── Scroll Reveal ──
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealIndex = 0;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger within siblings
          var siblings = entry.target.parentElement.querySelectorAll('.reveal');
          var idx = Array.prototype.indexOf.call(siblings, entry.target);
          entry.target.style.transitionDelay = (idx * 0.1) + 's';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ── Stat Counter ──
  var statNumbers = document.querySelectorAll('.stats__number[data-target]');
  var statsRan = false;

  function runStats() {
    if (statsRan) return;
    statsRan = true;
    statNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var dur = 2000;
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  var statsSection = document.querySelector('.stats');
  if (statsSection && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runStats(); so.disconnect(); }
    }, { threshold: 0.3 });
    so.observe(statsSection);
  }

  // ── Contact Form ──
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      form.querySelectorAll('.form-error').forEach(function (x) { x.remove(); });
      form.querySelectorAll('.error').forEach(function (x) { x.classList.remove('error'); });

      var valid = true;
      var nameEl = form.querySelector('#name');
      var phone = form.querySelector('#phone');
      var email = form.querySelector('#email');
      var service = form.querySelector('#service');

      if (!nameEl.value.trim()) { showErr(nameEl, 'Required'); valid = false; }
      if (!phone.value.trim() && !email.value.trim()) {
        showErr(phone, 'Phone or email required');
        showErr(email, 'Phone or email required');
        valid = false;
      }
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showErr(email, 'Invalid email'); valid = false;
      }
      if (!service.value) { showErr(service, 'Please select'); valid = false; }

      if (!valid) return;

      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;

      var data = new FormData(form);
      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) { showSuccess(); }
        else { btn.textContent = 'Request Estimate'; btn.disabled = false; showErr(btn, 'Something went wrong. Please try again.'); }
      }).catch(function () {
        btn.textContent = 'Request Estimate'; btn.disabled = false;
        showErr(btn, 'Network error. Please try again.');
      });
    });
  }

  function showSuccess() {
    if (!form) return;
    form.style.display = 'none';
    var wrap = form.parentElement;
    var msg = document.createElement('div');
    msg.className = 'form-success';
    var h = document.createElement('h3');
    h.textContent = 'Thank you.';
    var p = document.createElement('p');
    p.textContent = "We'll be in touch within one business day.";
    msg.appendChild(h);
    msg.appendChild(p);
    wrap.appendChild(msg);
  }

  function showErr(input, text) {
    input.classList.add('error');
    var p = document.createElement('p');
    p.className = 'form-error';
    p.textContent = text;
    input.parentElement.appendChild(p);
  }

  // ── Dynamic Copyright Year ──
  var yearEl = document.getElementById('copyrightYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href.length <= 1) return;
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();


// ── Areas Interactive Map — Individual Town Polygons ──
// townData & regionInfo loaded from js/regions.js (Census TIGER/Line)
(function () {
  var mapEl = document.getElementById('areas-map');
  if (!mapEl || typeof L === 'undefined' || typeof townData === 'undefined') return;

  var map = L.map(mapEl, {
    center: [40.78, -73.28],
    zoom: 10,
    zoomControl: false,
    scrollWheelZoom: false,
    minZoom: 7,
    maxZoom: 15
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
    opacity: 0.45,
    pane: 'overlayPane'
  }).addTo(map);

  // ── Styles ──
  var baseStyle   = { weight: 1, opacity: 0.6, fillOpacity: 0.12, smoothFactor: 1.2 };
  var hoverStyle  = { weight: 1.5, opacity: 0.8, fillOpacity: 0.22 };
  var activeStyle = { weight: 2, opacity: 1, fillOpacity: 0.32 };

  var liRegions = ['north-shore', 'central', 'south-shore', 'east-end'];
  var activeRegion = null;
  var defaultCenter = [40.78, -73.28];
  var defaultZoom = 10;

  // ── Build per-town polygons, grouped by region ──
  var townsByRegion = {};  // regionKey -> [{polygon, data}]
  var allPolygons = [];

  townData.forEach(function (t) {
    var color = regionInfo[t.r] ? regionInfo[t.r].color : '#888';
    var leafletCoords = t.p.map(function (ring) { return [ring]; });

    var polygon = L.polygon(leafletCoords, {
      color: color,
      weight: baseStyle.weight,
      opacity: baseStyle.opacity,
      fillColor: color,
      fillOpacity: baseStyle.fillOpacity,
      smoothFactor: baseStyle.smoothFactor
    }).addTo(map);

    polygon.bindTooltip(t.n, {
      sticky: true,
      direction: 'top',
      offset: [0, -10],
      className: 'town-tooltip'
    });

    var entry = { polygon: polygon, data: t, color: color };

    if (!townsByRegion[t.r]) townsByRegion[t.r] = [];
    townsByRegion[t.r].push(entry);
    allPolygons.push(entry);

    // Town-level hover
    polygon.on('mouseover', function () {
      if (activeRegion !== t.r) {
        polygon.setStyle({
          fillOpacity: hoverStyle.fillOpacity,
          weight: hoverStyle.weight,
          opacity: hoverStyle.opacity
        });
      }
    });
    polygon.on('mouseout', function () {
      if (activeRegion !== t.r) {
        polygon.setStyle({
          fillOpacity: baseStyle.fillOpacity,
          weight: baseStyle.weight,
          opacity: baseStyle.opacity
        });
      }
    });
    polygon.on('click', function () { activateRegion(t.r); });
  });

  // ── HQ marker ──
  var hqIcon = L.divIcon({
    className: 'hq-marker',
    html: '<span style="display:block;width:12px;height:12px;background:#8b7355;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px rgba(139,115,85,0.3), 0 2px 6px rgba(0,0,0,0.18);"></span>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
  L.marker([40.8682, -73.4257], { icon: hqIcon })
    .addTo(map)
    .bindTooltip('HQ — Huntington', {
      direction: 'top',
      offset: [0, -8],
      className: 'hq-tooltip'
    });

  // ── Region interactions ──
  function setRegionStyle(regionKey, style) {
    var towns = townsByRegion[regionKey];
    if (!towns) return;
    towns.forEach(function (t) {
      t.polygon.setStyle({
        fillOpacity: style.fillOpacity,
        weight: style.weight,
        opacity: style.opacity
      });
      if (style === activeStyle) {
        t.polygon.bringToFront();
      }
    });
  }

  function highlightRegion(key) {
    setRegionStyle(key, hoverStyle);
    var el = document.querySelector('[data-region="' + key + '"]');
    if (el) el.classList.add('active');
  }

  function unhighlightRegion(key) {
    setRegionStyle(key, baseStyle);
    var el = document.querySelector('[data-region="' + key + '"]');
    if (el) el.classList.remove('active');
  }

  function deactivateAll() {
    if (activeRegion) {
      var keysToDeactivate = activeRegion === 'nassau-suffolk' ? liRegions : [activeRegion];
      keysToDeactivate.forEach(function (k) {
        setRegionStyle(k, baseStyle);
        var el = document.querySelector('[data-region="' + k + '"]');
        if (el) el.classList.remove('active');
      });
      if (activeRegion === 'nassau-suffolk') {
        var nsel = document.querySelector('[data-region="nassau-suffolk"]');
        if (nsel) nsel.classList.remove('active');
      }
    }
    activeRegion = null;
    map.flyTo(defaultCenter, defaultZoom, { duration: 0.8 });
  }

  function activateRegion(key) {
    // Toggle off if clicking active region
    if (activeRegion === key) {
      deactivateAll();
      return;
    }

    // Deactivate previous
    if (activeRegion) {
      var prevKeys = activeRegion === 'nassau-suffolk' ? liRegions : [activeRegion];
      prevKeys.forEach(function (k) {
        setRegionStyle(k, baseStyle);
        var el = document.querySelector('[data-region="' + k + '"]');
        if (el) el.classList.remove('active');
      });
      if (activeRegion === 'nassau-suffolk') {
        var nsel = document.querySelector('[data-region="nassau-suffolk"]');
        if (nsel) nsel.classList.remove('active');
      }
    }

    activeRegion = key;

    // Activate new
    var keysToActivate = key === 'nassau-suffolk' ? liRegions : [key];
    var allBounds = [];

    keysToActivate.forEach(function (k) {
      setRegionStyle(k, activeStyle);
      var el = document.querySelector('[data-region="' + k + '"]');
      if (el) el.classList.add('active');
      var towns = townsByRegion[k];
      if (towns) {
        towns.forEach(function (t) { allBounds.push(t.polygon.getBounds()); });
      }
    });

    // Also activate sidebar for nassau-suffolk itself
    if (key === 'nassau-suffolk') {
      var nsel = document.querySelector('[data-region="nassau-suffolk"]');
      if (nsel) nsel.classList.add('active');
    }

    // Zoom to fit
    if (allBounds.length > 0) {
      var group = allBounds[0];
      for (var i = 1; i < allBounds.length; i++) {
        group = group.extend(allBounds[i].getSouthWest()).extend(allBounds[i].getNorthEast());
      }
      map.flyToBounds(group, { padding: [30, 30], duration: 0.8, maxZoom: 13 });
    }
  }

  // ── Wire up sidebar list items ──
  document.querySelectorAll('.areas__region[data-region]').forEach(function (el) {
    var key = el.getAttribute('data-region');

    el.addEventListener('mouseenter', function () {
      if (activeRegion === key) return;
      if (key === 'nassau-suffolk') {
        liRegions.forEach(function (k) {
          if (activeRegion !== k) highlightRegion(k);
        });
      } else {
        highlightRegion(key);
      }
    });

    el.addEventListener('mouseleave', function () {
      if (key === 'nassau-suffolk') {
        liRegions.forEach(function (k) {
          if (activeRegion !== k && activeRegion !== 'nassau-suffolk') unhighlightRegion(k);
        });
      } else {
        if (activeRegion !== key) unhighlightRegion(key);
      }
    });

    el.addEventListener('click', function () { activateRegion(key); });

    // Keyboard accessibility
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateRegion(key);
      }
    });
  });

  // ── Click map background to deselect ──
  map.on('click', function (e) {
    // Only deselect if click wasn't on a polygon (polygons stop propagation)
    if (activeRegion) {
      deactivateAll();
    }
  });

  // ── Scroll-zoom behavior ──
  var scrollHint = document.getElementById('mapScrollHint');
  var scrollTimer = null;
  var mapFocused = false;

  mapEl.addEventListener('click', function () {
    if (!mapFocused) {
      mapFocused = true;
      map.scrollWheelZoom.enable();
      if (scrollHint) scrollHint.style.display = 'none';
    }
  });

  mapEl.addEventListener('mouseleave', function () {
    mapFocused = false;
    map.scrollWheelZoom.disable();
  });

  // Show hint on scroll attempt when not focused
  mapEl.addEventListener('wheel', function (e) {
    if (!mapFocused && scrollHint) {
      scrollHint.classList.add('visible');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        scrollHint.classList.remove('visible');
      }, 1200);
    }
  }, { passive: true });

  // ── Emergency Phone Toggle ──
  var emergencyBtn = document.getElementById('emergencyToggle');
  var emergencyMenu = document.getElementById('emergencyMenu');
  if (emergencyBtn && emergencyMenu) {
    emergencyBtn.addEventListener('click', function () {
      emergencyMenu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.emergency-container')) {
        emergencyMenu.classList.remove('open');
      }
    });
  }
})();
