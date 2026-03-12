import "../src/components/map-app";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../sw.js");
}
