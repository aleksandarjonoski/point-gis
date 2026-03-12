import { LitElement, html, css, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { map as createMap, tileLayer, control, marker } from "leaflet";
import type { Map } from "leaflet";

import "leaflet/dist/leaflet.css";

@customElement("leaflet-map")
export class LeafletMap extends LitElement {
  static get styles() {
    return [css``];
  }

  static map: Map;

  constructor() {
    super();
  }
  firstUpdated() {
    super.connectedCallback();
    this.shadowRoot?.querySelector;
    const mapEl = this.shadowRoot?.querySelector("#mapid") as HTMLElement;
    if (mapEl) {
      LeafletMap.map = createMap(mapEl).setView([41.0296773, 21.3292164], 15);
      let urlTemplate = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
      var tl = tileLayer(urlTemplate, { minZoom: 4, maxZoom: 18 });
      LeafletMap.map.addLayer(tl);

      var openTopoMap = tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          maxNativeZoom: 17,
          maxZoom: 25,
          attribution:
            "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
        }
      );

      LeafletMap.map.addLayer(openTopoMap);

      var esriAerialUrl =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      var esriAerialAttrib =
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
      var esriAerial = tileLayer(esriAerialUrl, {
        maxNativeZoom: 18,
        maxZoom: 25, // Adjust maxZoom as needed
        attribution: esriAerialAttrib,
      });

      var baseLayers = {
        OpenStreetMap: tl,
        openTopoMap: openTopoMap,
        "ESRI Aerial": esriAerial,
      };

      // Add the control to the map (empty object for overlays as none are defined here)
      control.layers(baseLayers, {}).addTo(LeafletMap.map);
    }
  }

  render() {
    return html`
      <link rel="stylesheet" href="./node_modules/leaflet/dist/leaflet.css" />
      <div id="mapid" style="height: 100%;"></div>
    `;
  }

  public CenterToCurrentPosition() {
    console.log("Here is leaflet map");
    this.centerToCurrentLocation();
  }

  private async centerToCurrentLocation() {
    const mapEl = this.shadowRoot?.querySelector("#mapid") as HTMLElement;

    try {
      const pos = await this.getAccuratePosition();

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      LeafletMap.map.setView([lat, lng], 16); // zoom 16

      // optional: show marker
      marker([lat, lng]).addTo(LeafletMap.map);
    } catch (err) {
      console.error("GPS error:", err);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  getAccuratePosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      // const id = navigator.geolocation.watchPosition(
      //   (position) => {
      //     navigator.geolocation.clearWatch(id); // stop watching
      //     console.log("stop watching");
      //     resolve(position);
      //   },
      //   reject,
      //   {
      //     enableHighAccuracy: true,
      //     maximumAge: 0,
      //     timeout: 20000,
      //   }
      // );

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          // if (pos.coords.accuracy < 20) {
          // meters
          navigator.geolocation.clearWatch(id);
          resolve(pos);
          // }
        },
        reject,
        { enableHighAccuracy: true }
      );
    });
  }
}
