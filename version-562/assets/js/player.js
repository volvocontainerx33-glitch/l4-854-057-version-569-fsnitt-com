(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector(".js-video");
    var button = shell.querySelector(".js-play");
    var stream = shell.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button && video) {
      button.addEventListener("click", play);
      button.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          play(event);
        }
      });
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          play();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(setupPlayer);
})();
