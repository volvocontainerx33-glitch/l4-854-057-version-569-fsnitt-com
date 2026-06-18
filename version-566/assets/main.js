(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;

    function show(next) {
      slides[index].classList.remove("active");
      dots[index].classList.remove("active");
      index = next;
      slides[index].classList.add("active");
      dots[index].classList.add("active");
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function applyFilters(shell) {
    var search = shell.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(shell.querySelectorAll("[data-card]"));
    var empty = shell.querySelector("[data-empty-state]");
    var activeButtons = Array.prototype.slice.call(shell.querySelectorAll("[data-filter].active"));
    var query = search ? search.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      var matchedText = !query || (card.getAttribute("data-search") || "").toLowerCase().indexOf(query) !== -1;
      var matchedFilters = activeButtons.every(function (button) {
        var key = button.getAttribute("data-filter");
        var value = button.getAttribute("data-filter-value");
        if (!value || value === "all") {
          return true;
        }
        return (card.getAttribute("data-" + key) || "") === value;
      });
      card.classList.toggle("hidden", !(matchedText && matchedFilters));
    });

    if (empty) {
      var visible = cards.some(function (card) {
        return !card.classList.contains("hidden");
      });
      empty.classList.toggle("show", !visible);
    }
  }

  function setupBrowse() {
    Array.prototype.slice.call(document.querySelectorAll("[data-browse-shell]")).forEach(function (shell) {
      var search = shell.querySelector("[data-search-input]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (search && q) {
        search.value = q;
      }
      if (search) {
        search.addEventListener("input", function () {
          applyFilters(shell);
        });
      }
      Array.prototype.slice.call(shell.querySelectorAll("[data-filter]")).forEach(function (button) {
        button.addEventListener("click", function () {
          var key = button.getAttribute("data-filter");
          Array.prototype.slice.call(shell.querySelectorAll('[data-filter="' + key + '"]')).forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          applyFilters(shell);
        });
      });
      applyFilters(shell);
    });
  }

  function setupHeroSearch() {
    Array.prototype.slice.call(document.querySelectorAll("[data-hero-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var value = input ? input.value.trim() : "";
        window.location.href = value ? "videos.html?q=" + encodeURIComponent(value) : "videos.html";
      });
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }

    var loaded = false;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      load();
      button.classList.add("hidden");
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("hidden");
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHero();
    setupBrowse();
    setupHeroSearch();
  });
})();
