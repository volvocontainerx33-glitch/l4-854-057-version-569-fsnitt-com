(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalizeText(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = nextIndex % slides.length;
            if (index < 0) {
                index = slides.length - 1;
            }
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        var hero = document.querySelector(".hero-section");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function initFilters() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        if (boxes.length === 0) {
            return;
        }
        boxes.forEach(function (box) {
            var scope = box.closest(".filter-scope") || document;
            var input = box.querySelector("[data-filter-search]");
            var year = box.querySelector("[data-filter-year]");
            var type = box.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".empty-result");

            function apply() {
                var keyword = normalizeText(input ? input.value : "");
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var title = normalizeText(card.getAttribute("data-title"));
                    var region = normalizeText(card.getAttribute("data-region"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matchKeyword = !keyword || title.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchType = !typeValue || cardType === typeValue;
                    var showCard = matchKeyword && matchYear && matchType;
                    card.classList.toggle("is-hidden", !showCard);
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initM3u8Player = function (streamUrl) {
        var video = document.querySelector("#moviePlayer");
        var mask = document.querySelector(".player-mask");
        if (!video || !mask || !streamUrl) {
            return;
        }
        var loaded = false;

        function attachStream() {
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

        function playVideo() {
            attachStream();
            mask.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        mask.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
