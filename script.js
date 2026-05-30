/* ============================================================
   Imperial Pavilion 帝苑 — script.js
   Nav scroll · Mobile nav · Fade-in · Carousel · Form
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav: solid background on scroll ────────────────────── */
  const nav = document.getElementById('main-nav');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── Mobile nav toggle ───────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });

  /* ── Fade-in on scroll (Intersection Observer) ───────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback for older browsers
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Testimonial Carousel ────────────────────────────────── */
  var carousel = (function () {
    var track      = document.getElementById('carousel-track');
    var dots       = document.querySelectorAll('.dot');
    var prevBtn    = document.getElementById('carousel-prev');
    var nextBtn    = document.getElementById('carousel-next');
    var wrapper    = document.querySelector('.carousel-wrapper');
    var total      = dots.length; // 3
    var current    = 0;
    var timer      = null;
    var INTERVAL   = 4500;

    function goTo(index) {
      current = (index + total) % total;
      // Use pixel offset so translateX is relative to card width, not track width
      track.style.transform = 'translateX(-' + (current * wrapper.offsetWidth) + 'px)';
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    // Recalculate on resize so pixel offset stays accurate
    window.addEventListener('resize', function () {
      track.style.transition = 'none';
      track.style.transform = 'translateX(-' + (current * wrapper.offsetWidth) + 'px)';
      // Re-enable transition after the reflow
      requestAnimationFrame(function () {
        track.style.transition = '';
      });
    }, { passive: true });

    function advance() { goTo(current + 1); }

    function startTimer()  { timer = setInterval(advance, INTERVAL); }
    function stopTimer()   { clearInterval(timer); timer = null; }
    function resetTimer()  { stopTimer(); startTimer(); }

    // Dot clicks
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10));
        resetTimer();
      });
    });

    // Arrow buttons
    prevBtn.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); resetTimer(); });

    // Pause on hover / focus
    wrapper.addEventListener('mouseenter', stopTimer);
    wrapper.addEventListener('mouseleave', startTimer);
    wrapper.addEventListener('focusin',    stopTimer);
    wrapper.addEventListener('focusout',   startTimer);

    // Swipe / touch support
    var touchStartX = null;
    wrapper.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    wrapper.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        resetTimer();
      }
      touchStartX = null;
    }, { passive: true });

    startTimer();

    return { goTo: goTo };
  }());

  /* ── Form Validation & Submission ───────────────────────── */
  (function () {
    var form        = document.getElementById('reservation-form');
    var confirmation= document.getElementById('confirmation-msg');

    // Field references
    var fields = {
      name:     document.getElementById('full-name'),
      email:    document.getElementById('email'),
      phone:    document.getElementById('phone'),
      guests:   document.getElementById('guests'),
      date:     document.getElementById('date'),
      time:     document.getElementById('time')
    };

    // Error span references (keyed same as fields)
    var errors = {
      name:   document.getElementById('name-error'),
      email:  document.getElementById('email-error'),
      phone:  document.getElementById('phone-error'),
      guests: document.getElementById('guests-error'),
      date:   document.getElementById('date-error'),
      time:   document.getElementById('time-error')
    };

    // Set minimum date to today
    var today = new Date();
    var yyyy  = today.getFullYear();
    var mm    = String(today.getMonth() + 1).padStart(2, '0');
    var dd    = String(today.getDate()).padStart(2, '0');
    fields.date.min = yyyy + '-' + mm + '-' + dd;

    /* Helpers */
    function isValidEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
    }

    function showError(key, msg) {
      errors[key].textContent = msg;
      fields[key].classList.add('is-invalid');
      fields[key].setAttribute('aria-invalid', 'true');
    }

    function clearError(key) {
      errors[key].textContent = '';
      fields[key].classList.remove('is-invalid');
      fields[key].removeAttribute('aria-invalid');
    }

    function clearAllErrors() {
      Object.keys(errors).forEach(clearError);
    }

    function formatDateDisplay(isoDate) {
      var parts  = isoDate.split('-');
      var year   = parts[0];
      var month  = parseInt(parts[1], 10) - 1;
      var day    = parseInt(parts[2], 10);
      var months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ];
      return day + ' ' + months[month] + ' ' + year;
    }

    /* Real-time validation (clear error as user corrects) */
    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('input', function () { clearError(key); });
      fields[key].addEventListener('change', function () { clearError(key); });
    });

    /* Submit */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var valid   = true;
      var firstBad = null;

      // Name
      if (!fields.name.value.trim()) {
        showError('name', 'Please enter your full name.');
        if (!firstBad) firstBad = fields.name;
        valid = false;
      }

      // Email
      if (!fields.email.value.trim()) {
        showError('email', 'Please enter your email address.');
        if (!firstBad) firstBad = fields.email;
        valid = false;
      } else if (!isValidEmail(fields.email.value)) {
        showError('email', 'Please enter a valid email address.');
        if (!firstBad) firstBad = fields.email;
        valid = false;
      }

      // Phone
      if (!fields.phone.value.trim()) {
        showError('phone', 'Please enter your phone number.');
        if (!firstBad) firstBad = fields.phone;
        valid = false;
      }

      // Guests
      var guestsVal = parseInt(fields.guests.value, 10);
      if (!fields.guests.value.trim() || isNaN(guestsVal)) {
        showError('guests', 'Please enter the number of guests.');
        if (!firstBad) firstBad = fields.guests;
        valid = false;
      } else if (guestsVal < 1 || guestsVal > 20) {
        showError('guests', 'Please enter a number between 1 and 20.');
        if (!firstBad) firstBad = fields.guests;
        valid = false;
      }

      // Date
      if (!fields.date.value) {
        showError('date', 'Please select your preferred date.');
        if (!firstBad) firstBad = fields.date;
        valid = false;
      } else if (fields.date.value < (yyyy + '-' + mm + '-' + dd)) {
        showError('date', 'Please select a date from today onwards.');
        if (!firstBad) firstBad = fields.date;
        valid = false;
      }

      // Time
      if (!fields.time.value) {
        showError('time', 'Please select your preferred time.');
        if (!firstBad) firstBad = fields.time;
        valid = false;
      }

      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }

      /* Success */
      var guestWord  = guestsVal === 1 ? 'guest' : 'guests';
      var timeText   = fields.time.options[fields.time.selectedIndex].text;
      var dateText   = formatDateDisplay(fields.date.value);
      var name       = fields.name.value.trim().split(' ')[0]; // first name

      showConfirmation(name, guestsVal, guestWord, dateText, timeText);
      form.reset();
      fields.date.min = yyyy + '-' + mm + '-' + dd; // re-apply min after reset
    });

    function showConfirmation(name, guests, guestWord, dateText, timeText) {
      confirmation.classList.remove('hidden');
      confirmation.innerHTML =
        '<div class="confirmation-icon">&#10003;</div>' +
        '<h3>Reservation Received</h3>' +
        '<p>Thank you, <strong>' + escapeHtml(name) + '</strong>! ' +
        'Your reservation request for <strong>' + guests + ' ' + guestWord + '</strong> ' +
        'on <strong>' + dateText + '</strong> at <strong>' + timeText + '</strong> ' +
        'has been received. Our team will confirm within 24&nbsp;hours.</p>';

      // Smooth scroll to confirmation
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      confirmation.focus();
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

  }());

}());
