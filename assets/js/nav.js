/* Mobile navigation toggle.
   Progressive enhancement: the markup ships as a plain list that works with
   JS off. This script only adds the collapse behaviour once it runs. */
(function () {
  var nav = document.querySelector('[data-nav]');
  if (!nav) return;

  var toggle = nav.querySelector('.nav__toggle');
  var list = nav.querySelector('.nav__list');
  if (!toggle || !list) return;

  toggle.hidden = false;
  nav.setAttribute('data-collapsed', 'true');
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', function () {
    var open = nav.getAttribute('data-collapsed') === 'false';
    nav.setAttribute('data-collapsed', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
})();
