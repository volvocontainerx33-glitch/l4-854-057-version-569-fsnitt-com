(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('hero-slide-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupSearch() {
    var input = document.getElementById('movieSearch');
    var grid = document.getElementById('movieGrid');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .ranking-item'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }
    function apply() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    }
    input.addEventListener('input', apply);
    apply();
  }

  function bindPlayer(videoId, sourceUrl, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !sourceUrl) {
      return;
    }
    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = sourceUrl;
      }
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
  }

  window.SitePlayer = {
    bind: bindPlayer
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
