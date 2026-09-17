/* Scroll-driven growth for large visuals.

   [data-expand]  a panel widens from the content column to the full window
                  width, and its corners square off, as it scrolls into view.
   [data-grow]    a figure scales up slightly on the way in.

   Both are driven from one requestAnimationFrame per scroll burst, limited to
   elements near the viewport (IntersectionObserver). Scroll-driven CSS
   animations would do this without JS but are not supported everywhere yet.
   Without JS, or with reduced motion, everything is shown at full size. */
(function () {
  var nodes = [].slice.call(document.querySelectorAll('[data-expand], [data-grow]'));
  if (!nodes.length) return;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var GROW_FROM = 0.9;   // starting scale for [data-grow]
  var END = 0.3;         // finished once the top passes this share of the viewport
  var active = [];
  var ticking = false;

  function progress(el) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var top = el.getBoundingClientRect().top;
    var p = (vh - top) / (vh - vh * END);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function apply(el, p) {
    if (el.hasAttribute('data-expand')) {
      el.style.setProperty('--expand', p.toFixed(4));
    } else {
      el.style.transform = 'scale(' + (GROW_FROM + (1 - GROW_FROM) * p).toFixed(4) + ')';
    }
  }

  function paint() {
    ticking = false;
    for (var i = 0; i < active.length; i++) apply(active[i], progress(active[i]));
  }

  function request() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      var i = active.indexOf(el);
      if (entry.isIntersecting) {
        if (i === -1) active.push(el);
        el.style.willChange = el.hasAttribute('data-expand') ? 'margin, border-radius' : 'transform';
      } else {
        if (i > -1) active.splice(i, 1);
        el.style.willChange = '';
        apply(el, entry.boundingClientRect.top < 0 ? 1 : 0);   // settle, never freeze mid-way
      }
    });
    request();
  }, { rootMargin: '15% 0px 15% 0px' });

  document.documentElement.setAttribute('data-grow-ready', '');
  nodes.forEach(function (el) {
    apply(el, progress(el));
    observer.observe(el);
  });

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
})();
