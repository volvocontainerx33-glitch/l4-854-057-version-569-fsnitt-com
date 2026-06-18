(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('.menu-toggle');
    var menu = $('#navMenu');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initCarousel() {
    var stage = $('[data-carousel]');
    if (!stage) return;
    var slides = $all('.hero-slide', stage);
    var dots = $all('.hero-dot', stage);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initFilters() {
    $all('.filter-panel').forEach(function (panel) {
      var targetId = panel.getAttribute('data-target');
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      var search = $('.movie-search', panel);
      var region = $('.filter-region', panel);
      var type = $('.filter-type', panel);
      var year = $('.filter-year', panel);
      var cards = $all('.movie-card, .ranking-card', target);

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function apply() {
        var query = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' '));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) matched = false;
          if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) matched = false;
          if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) matched = false;
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) matched = false;
          card.classList.toggle('is-hidden', !matched);
        });
      }

      [search, region, type, year].forEach(function (control) {
        if (!control) return;
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
    });
  }

  function initPlayers() {
    $all('.movie-player').forEach(function (player) {
      var video = $('video', player);
      var button = $('.player-cover', player);
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var ready = false;
      var waiting = [];
      var hlsInstance = null;
      if (!video || !button || !stream) return;

      function runReadyCallbacks() {
        ready = true;
        while (waiting.length) waiting.shift()();
      }

      function onReady(callback) {
        if (ready) {
          callback();
          return;
        }
        waiting.push(callback);
      }

      function attach() {
        if (loaded) return;
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          runReadyCallbacks();
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hlsInstance.loadSource(stream);
          });
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            runReadyCallbacks();
          });
        } else {
          video.src = stream;
          runReadyCallbacks();
        }
      }

      function start() {
        player.classList.add('is-playing');
        attach();
        onReady(function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              player.classList.remove('is-playing');
            });
          }
        });
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCarousel();
    initFilters();
    initPlayers();
  });
})();
