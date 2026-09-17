/* Looping background clips ([data-autoplay] videos).

   The clip is silent and decorative, so it plays only when the visitor has not
   asked for reduced motion, pauses while scrolled out of view, and always has
   a visible Pause/Play control. Without JS the poster image is shown. */
(function () {
  var videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(videos, function (video) {
    var toggle = video.parentNode.querySelector('[data-video-toggle]');
    var pausedByVisitor = reduceMotion;

    function play() {
      var attempt = video.play();
      // Autoplay can be refused (e.g. data saver); the poster stays and the button says Play.
      if (attempt && attempt.catch) attempt.catch(syncToggle);
    }

    function syncToggle() {
      if (!toggle) return;
      var playing = !video.paused;
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }

    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        pausedByVisitor = !video.paused;
        if (pausedByVisitor) {
          video.pause();
        } else {
          play();
        }
      });
      video.addEventListener('play', syncToggle);
      video.addEventListener('pause', syncToggle);
      syncToggle();
    }

    if (!('IntersectionObserver' in window)) {
      if (!pausedByVisitor) play();
      return;
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          video.pause();
        } else if (!pausedByVisitor) {
          play();
        }
      });
    }, { threshold: 0.25 }).observe(video);
  });
})();
