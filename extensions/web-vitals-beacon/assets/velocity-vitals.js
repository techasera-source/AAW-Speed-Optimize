(function () {
  var root = document.getElementById("velocity-vitals-beacon");
  if (!root) return;

  var shop = root.getAttribute("data-shop");
  var path = root.getAttribute("data-path") || window.location.pathname;
  var configuredIngestUrl = root.getAttribute("data-ingest-url");

  // Falls back to the app's known ingest route if the embed block setting
  // is left blank, so the beacon works the moment the extension is enabled.
  var ingestUrl = configuredIngestUrl || "__VELOCITY_INGEST_URL__/api/vitals";

  function deviceType() {
    return window.innerWidth < 768 ? "mobile" : "desktop";
  }

  function send(metric, value) {
    var body = JSON.stringify({
      shop: shop,
      metric: metric,
      value: value,
      path: path,
      deviceType: deviceType(),
    });

    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ingestUrl, blob);
    } else {
      fetch(ingestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    }
  }

  function onReport(metricName) {
    return function (metric) {
      // CLS arrives unitless (e.g. 0.08); LCP/INP arrive in milliseconds.
      send(metricName, metric.value);
    };
  }

  var script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/web-vitals@4/dist/web-vitals.iife.js";
  script.onload = function () {
    if (!window.webVitals) return;
    window.webVitals.onLCP(onReport("LCP"));
    window.webVitals.onINP(onReport("INP"));
    window.webVitals.onCLS(onReport("CLS"));
  };
  document.head.appendChild(script);
})();
