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
})();
