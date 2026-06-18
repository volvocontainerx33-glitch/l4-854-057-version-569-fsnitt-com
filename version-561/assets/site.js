(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var track = hero.querySelector(".hero-track");
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = "translateX(-" + index * 100 + "%)";
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        play();
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      show(0);
      play();
    }

    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var scope = panel.closest("[data-filter-scope]") || document;
      var input = panel.querySelector(".filter-input");
      var year = panel.querySelector(".filter-year");
      var region = panel.querySelector(".filter-region");
      var type = panel.querySelector(".filter-type");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      var empty = scope.querySelector(".no-results");

      function value(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = value(input);
        var y = value(year);
        var r = value(region);
        var t = value(type);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
            ok = false;
          }
          if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
            ok = false;
          }
          if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  });
})();
