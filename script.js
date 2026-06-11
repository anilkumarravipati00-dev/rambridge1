/* ==================================================================
   RamBridge Consulting — Scripts
   Mobile nav toggle, scroll-reveal animations, and count-up stats.
   ================================================================== */

(function () {
  // The script now lives outside .rb-site, so target the wrapper directly.
  var root = document.querySelector('.rb-site') || document;

  /* ---------- mobile nav ---------- */
  var burger = root.querySelector('#rbBurger'),
      menu   = root.querySelector('#rbMenu');

  if (burger) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('rb-open');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('rb-open');
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('rb-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .15 });

  root.querySelectorAll('.rb-reveal').forEach(function (el) {
    io.observe(el);
  });

  /* ---------- count up ---------- */
  var seen = false;
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !seen) {
        seen = true;
        root.querySelectorAll('.rb-count').forEach(function (el) {
          var target = +el.dataset.target,
              current = 0,
              step = Math.max(1, target / 60);
          var iv = setInterval(function () {
            current += step;
            if (current >= target) { current = target; clearInterval(iv); }
            el.textContent = Math.floor(current);
          }, 18);
        });
      }
    });
  }, { threshold: .4 });

  var band = root.querySelector('.rb-stats');
  if (band) cio.observe(band);

  /* ---------- contact form ---------- */
  var form   = root.querySelector('#rbForm'),
      status = root.querySelector('#rbFormStatus');

  if (form) {
    var btn = form.querySelector('button[type="submit"]');

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'rb-form-status' + (kind ? ' rb-form-status--' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // stop the default no-op submit to "#"

      // Native HTML5 validation (required name + email).
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var endpoint = form.getAttribute('action') || '';
      var keyField = form.querySelector('[name="access_key"]');
      var accessKey = keyField ? keyField.value : '';

      // Fallback: if the Web3Forms access key hasn't been set yet, open a
      // pre-filled email so the button still does something useful.
      if (!endpoint || endpoint === '#' || !accessKey || accessKey.indexOf('YOUR_ACCESS_KEY') !== -1) {
        var d = new FormData(form);
        var subject = 'New inquiry from ' + (d.get('name') || 'website');
        var body =
          'Name: '    + (d.get('name')    || '') + '\n' +
          'Company: ' + (d.get('company') || '') + '\n' +
          'Email: '   + (d.get('email')   || '') + '\n' +
          'Phone: '   + (d.get('phone')   || '') + '\n' +
          'Hiring Needs: ' + (d.get('needs') || '') + '\n\n' +
          (d.get('message') || '');
        window.location.href =
          'mailto:info@rambridgeconsulting.com'
          + '?subject=' + encodeURIComponent(subject)
          + '&body='    + encodeURIComponent(body);
        setStatus('Opening your email app… or configure a form endpoint to send directly.', '');
        return;
      }

      // Real submission via fetch — no page reload.
      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      setStatus('', '');

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (r) {
        if (r.ok && r.data && r.data.success) {
          form.reset();
          setStatus('Thanks — your inquiry has been sent. We\u2019ll reply within one business day.', 'ok');
        } else {
          var msg = (r.data && r.data.message) ? r.data.message : 'Please email info@rambridgeconsulting.com instead.';
          setStatus('Something went wrong: ' + msg, 'err');
        }
      })
      .catch(function () {
        setStatus('Network error. Please email info@rambridgeconsulting.com instead.', 'err');
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
    });
  }
})();
