(function () {
  try {
    var host = location.hostname;
    var isPreview =
      host.indexOf("id-preview--") !== -1 ||
      host.indexOf("lovableproject.com") !== -1 ||
      host.indexOf("lovable.dev") !== -1;
    var inIframe = false;
    try { inIframe = window.self !== window.top; } catch (e) { inIframe = true; }

    if (!("serviceWorker" in navigator)) return;

    if (isPreview || inIframe) {
      // Never register SW inside Lovable preview/iframe — clean up any leftover.
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { r.unregister(); });
      });
      return;
    }

    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function (err) {
        console.warn("[HN-AI] SW registration failed", err);
      });
    });
  } catch (e) { /* noop */ }
})();
