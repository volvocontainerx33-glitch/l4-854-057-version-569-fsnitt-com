(function () {
  var navButton = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector("#mobile-nav");

  if (navButton && mobileNav) {
    navButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("is-missing");
    }
  }, true);

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var buttons = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-target]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      buttons.forEach(function (button, buttonIndex) {
        button.classList.toggle("is-active", buttonIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var index = parseInt(button.getAttribute("data-hero-target"), 10);
        showSlide(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupSearch(scope) {
    var input = scope.querySelector(".js-search");
    var region = scope.querySelector(".js-region");
    var type = scope.querySelector(".js-type");
    var sort = scope.querySelector(".js-sort");
    var list = scope.querySelector(".js-card-list");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
    }

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);

      cards.forEach(function (card) {
        var text = cardText(card);
        var regionText = normalize(card.getAttribute("data-region"));
        var typeText = normalize(card.getAttribute("data-type"));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !regionValue || regionText.indexOf(regionValue) !== -1 || text.indexOf(regionValue) !== -1;
        var matchType = !typeValue || typeText.indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
        card.hidden = !(matchQuery && matchRegion && matchType);
      });

      if (sort && list) {
        var mode = sort.value;
        var visibleCards = cards.slice().sort(function (a, b) {
          if (mode === "year-desc" || mode === "year-asc") {
            var ay = parseInt(a.getAttribute("data-year"), 10) || 0;
            var by = parseInt(b.getAttribute("data-year"), 10) || 0;
            return mode === "year-desc" ? by - ay : ay - by;
          }
          if (mode === "title") {
            return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return 0;
        });
        visibleCards.forEach(function (card) {
          list.appendChild(card);
        });
      }
    }

    [input, region, type, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(setupSearch);
})();
