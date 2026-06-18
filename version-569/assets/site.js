(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    if (slides.length > 1) {
      autoplay();
    }
  }

  function uniqueSorted(cards, attribute) {
    var values = new Set();
    cards.forEach(function (card) {
      var value = card.getAttribute(attribute);
      if (value) {
        values.add(value);
      }
    });
    return Array.prototype.slice.call(values).sort(function (a, b) {
      return b.localeCompare(a, 'zh-Hans-CN', { numeric: true });
    });
  }

  function populateSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupSearchPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('.content-section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var input = panel.querySelector('[data-search-input]');
      var count = panel.querySelector('[data-search-count]');
      var reset = panel.querySelector('[data-reset-filter]');
      var yearSelect = panel.querySelector('[data-filter-field="year"]');
      var regionSelect = panel.querySelector('[data-filter-field="region"]');
      var categorySelect = panel.querySelector('[data-filter-field="category"]');

      populateSelect(yearSelect, uniqueSorted(cards, 'data-year'));
      populateSelect(regionSelect, uniqueSorted(cards, 'data-region'));
      populateSelect(categorySelect, uniqueSorted(cards, 'data-category'));

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var matchesRegion = !region || card.getAttribute('data-region') === region;
          var matchesCategory = !category || card.getAttribute('data-category') === category;
          var isVisible = matchesKeyword && matchesYear && matchesRegion && matchesCategory;
          card.classList.toggle('hidden-by-filter', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
      }

      [input, yearSelect, regionSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          [yearSelect, regionSelect, categorySelect].forEach(function (select) {
            if (select) {
              select.value = '';
            }
          });
          applyFilter();
        });
      }

      applyFilter();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var source = shell.getAttribute('data-video-source');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function startPlayback() {
        if (shell.classList.contains('is-ready')) {
          video.play().catch(function () {});
          return;
        }

        shell.classList.add('is-ready');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', startPlayback, { once: true });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchPanels();
    setupPlayers();
  });
})();
