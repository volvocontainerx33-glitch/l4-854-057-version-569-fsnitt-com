(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('[data-menu-button]');
    var menu = one('[data-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = all('.hero-slide');
    var dots = all('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    var hero = one('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function setupSearchRedirect() {
    var form = one('[data-search-form]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = one('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var url = './movies.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  function setupFilters() {
    var input = one('[data-filter-input]');
    var cards = all('[data-card]');
    if (!cards.length) {
      return;
    }
    var chips = all('[data-filter-value]');
    var empty = one('[data-empty]');
    var count = one('[data-result-count]');
    var active = 'all';
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function apply() {
      var text = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var group = card.getAttribute('data-group') || '';
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesGroup = active === 'all' || group.indexOf(active) !== -1;
        var ok = matchesText && matchesGroup;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
      if (count) {
        count.textContent = String(visible);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        active = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener('input', apply);
    }
    apply();
  }

  function setupPlayers() {
    var blocks = all('[data-player-block]');
    blocks.forEach(function (block) {
      var video = one('video[data-stream]', block);
      var button = one('[data-play-button]', block);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var ready = false;
      var pendingPlay = false;

      function attemptPlay() {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }

      function attachStream(shouldPlay) {
        pendingPlay = shouldPlay;
        if (ready) {
          if (shouldPlay) {
            attemptPlay();
          }
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (pendingPlay) {
              attemptPlay();
            }
          });
          block.hlsPlayer = hls;
        } else {
          video.src = stream;
          if (shouldPlay) {
            attemptPlay();
          }
        }
      }

      function startPlayback() {
        block.classList.add('is-playing');
        attachStream(true);
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }

      block.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        startPlayback();
      });

      video.addEventListener('play', function () {
        block.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchRedirect();
    setupFilters();
    setupPlayers();
  });
})();
