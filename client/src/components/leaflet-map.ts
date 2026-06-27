import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as L from "leaflet";
const { map: createMap, tileLayer, control, marker } = L;
import type { Map as LMap, MarkerClusterGroup, Marker } from "leaflet";
import type { Point, PointType } from "../services/api";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

@customElement("leaflet-map")
export class LeafletMap extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          position: relative;
        }
        .center-pin-overlay {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 38px;
          height: 52px;
          pointer-events: none;
          z-index: 1000;
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4));
          transform-origin: 50% 100%;
          animation: centerPinPulse 1.4s ease-in-out infinite;
        }
        @keyframes centerPinPulse {
          0%,
          100% {
            transform: translate(-50%, -100%) scale(1);
          }
          50% {
            transform: translate(-50%, -100%) scale(1.1);
          }
        }
        .center-pin-overlay svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .center-pin-overlay svg path {
          fill: #f59e0b;
          stroke: #fff;
          stroke-width: 2;
        }
        .center-pin-overlay svg circle {
          fill: #fff;
        }
        .cluster-bubble-icon {
          background: transparent !important;
          border: none !important;
        }
        .cluster-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.92);
          border: 4px solid rgba(37, 99, 235, 0.35);
          background-clip: padding-box;
          color: #fff;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }
        .cluster-bubble.small {
          font-size: 14px;
        }
        .cluster-bubble.medium {
          font-size: 16px;
        }
        .cluster-bubble.large {
          font-size: 18px;
        }

        .edit-pin-icon {
          background: transparent !important;
          border: none !important;
        }
        .edit-pin {
          width: 38px;
          height: 52px;
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4));
          transform-origin: 50% 100%;
          animation: editPinPulse 1.4s ease-in-out infinite;
        }
        .edit-pin svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .edit-pin svg path {
          fill: #f59e0b;
          stroke: #fff;
          stroke-width: 2;
        }
        .edit-pin svg circle {
          fill: #fff;
        }
        @keyframes editPinPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .point-label {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #1f2937;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
          pointer-events: none;
        }
        .point-label::before {
          display: none !important;
        }
        .labels-hidden .point-label {
          display: none !important;
        }
      `,
    ];
  }

  static map: LMap;
  // Point labels are only shown when zoomed in to this level or beyond.
  private static readonly LABEL_MIN_ZOOM = 15;
  private pointsLayer: MarkerClusterGroup | null = null;
  private markersByUuid: Map<string, Marker> = new Map();
  private editMarker: Marker | null = null;
  private hiddenMarker: { uuid: string; marker: Marker } | null = null;
  @state() private editMode: "drag" | "center" | null = null;

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

      LeafletMap.map.on("zoomend", () => this.updateLabelVisibility());
      this.updateLabelVisibility();
    }
  }

  private updateLabelVisibility() {
    const mapEl = this.shadowRoot?.querySelector("#mapid") as HTMLElement;
    if (!mapEl || !LeafletMap.map) return;
    const show = LeafletMap.map.getZoom() >= LeafletMap.LABEL_MIN_ZOOM;
    mapEl.classList.toggle("labels-hidden", !show);
  }

  render() {
    return html`
      <link rel="stylesheet" href="./node_modules/leaflet/dist/leaflet.css" />
      <div id="mapid" style="height: 100%;"></div>
      ${this.editMode === "center"
        ? html`
            <div class="center-pin-overlay">
              <svg viewBox="0 0 38 52" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 0 C8.5 0 0 8.5 0 19 C0 33 19 52 19 52 C19 52 38 33 38 19 C38 8.5 29.5 0 19 0 Z"
                />
                <circle cx="19" cy="19" r="6" />
              </svg>
            </div>
          `
        : ""}
    `;
  }

  public CenterToCurrentPosition() {
    console.log("Here is leaflet map");
    this.centerToCurrentLocation();
  }

  public flyTo(lat: number, lng: number, zoom = 18) {
    if (!LeafletMap.map) return;
    LeafletMap.map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }

  public getCenter(): { latitude: number; longitude: number } | null {
    if (!LeafletMap.map) return null;
    const c = LeafletMap.map.getCenter();
    return { latitude: c.lat, longitude: c.lng };
  }

  public renderPoints(
    points: Point[],
    options: { fitBounds?: boolean; pointTypes?: PointType[] } = {}
  ) {
    if (!LeafletMap.map) return;
    const { fitBounds = false, pointTypes = [] } = options;
    const typeNameByUuid = new Map(pointTypes.map((t) => [t.uuid, t.name]));

    if (this.pointsLayer) {
      LeafletMap.map.removeLayer(this.pointsLayer);
    }
    this.markersByUuid.clear();
    this.hiddenMarker = null;

    const markers: Marker[] = points.map((p) => {
      const m = marker([p.latitude, p.longitude]);
      m.bindPopup(this.buildPointPopup(p, m, typeNameByUuid));
      const typeLabel = typeNameByUuid.get(p.type) ?? "";
      const labelText = typeLabel
        ? `${p.name || "(unnamed)"} (${typeLabel})`
        : p.name || "(unnamed)";
      m.bindTooltip(labelText, {
        permanent: true,
        direction: "right",
        offset: [10, -20],
        className: "point-label",
      });
      this.markersByUuid.set(p.uuid, m);
      return m;
    });

    this.pointsLayer = (L as any).markerClusterGroup({
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        const sizeClass =
          count < 10 ? "small" : count < 100 ? "medium" : "large";
        const total = count < 10 ? 48 : count < 100 ? 56 : 64;
        return L.divIcon({
          html: `<div class="cluster-bubble ${sizeClass}">${count}</div>`,
          className: "cluster-bubble-icon",
          iconSize: [total, total],
          iconAnchor: [total / 2, total / 2],
        });
      },
    }) as MarkerClusterGroup;
    this.pointsLayer.addLayers(markers);
    this.pointsLayer.addTo(LeafletMap.map);
    this.updateLabelVisibility();

    if (fitBounds && markers.length > 0) {
      const bounds: [number, number][] = markers.map((m) => {
        const ll = m.getLatLng();
        return [ll.lat, ll.lng];
      });
      LeafletMap.map.fitBounds(bounds, { maxZoom: 16, padding: [40, 40] });
    }
  }

  private buildPointPopup(
    p: Point,
    m: Marker,
    typeNameByUuid: Map<string, string>
  ): HTMLElement {
    const container = document.createElement("div");
    container.style.minWidth = "180px";
    container.style.fontFamily = "system-ui, sans-serif";

    const name = document.createElement("div");
    name.textContent = p.name || "(unnamed)";
    name.style.fontWeight = "600";
    name.style.marginBottom = "4px";
    container.appendChild(name);

    const typeLabel = typeNameByUuid.get(p.type) ?? "";
    if (typeLabel) {
      const type = document.createElement("div");
      type.textContent = typeLabel;
      type.style.fontSize = "12px";
      type.style.color = "#555";
      type.style.marginBottom = "4px";
      container.appendChild(type);
    }

    if (p.description) {
      const desc = document.createElement("div");
      desc.textContent = p.description;
      desc.style.fontSize = "13px";
      desc.style.marginBottom = "8px";
      container.appendChild(desc);
    }

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;margin-top:6px;";

    const btn = document.createElement("button");
    btn.textContent = "Edit";
    btn.style.cssText =
      "background:#2563eb;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;";
    btn.addEventListener("click", () => {
      m.closePopup();
      this.dispatchEvent(
        new CustomEvent<Point>("point-edit-requested", {
          detail: p,
          bubbles: true,
          composed: true,
        })
      );
    });
    actions.appendChild(btn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.cssText =
      "background:#dc2626;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;";
    deleteBtn.addEventListener("click", () => {
      m.closePopup();
      this.dispatchEvent(
        new CustomEvent<Point>("point-delete-requested", {
          detail: p,
          bubbles: true,
          composed: true,
        })
      );
    });
    actions.appendChild(deleteBtn);

    container.appendChild(actions);

    return container;
  }

  public startPositionEdit(lat: number, lng: number, hidePointUuid?: string) {
    if (!LeafletMap.map) return;

    this.editMode = window.matchMedia("(pointer: coarse)").matches
      ? "center"
      : "drag";

    if (this.editMarker) {
      LeafletMap.map.removeLayer(this.editMarker);
      this.editMarker = null;
    }

    if (hidePointUuid && this.pointsLayer) {
      const existing = this.markersByUuid.get(hidePointUuid);
      if (existing) {
        this.pointsLayer.removeLayer(existing);
        this.hiddenMarker = { uuid: hidePointUuid, marker: existing };
      }
    }

    LeafletMap.map.setView([lat, lng], Math.max(LeafletMap.map.getZoom(), 17));

    if (this.editMode === "drag") {
      const editIcon = L.divIcon({
        html: `
          <div class="edit-pin">
            <svg viewBox="0 0 38 52" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0 C8.5 0 0 8.5 0 19 C0 33 19 52 19 52 C19 52 38 33 38 19 C38 8.5 29.5 0 19 0 Z" />
              <circle cx="19" cy="19" r="6" />
            </svg>
          </div>
        `,
        className: "edit-pin-icon",
        iconSize: [38, 52],
        iconAnchor: [19, 52],
      });
      this.editMarker = marker([lat, lng], { draggable: true, icon: editIcon });
      this.editMarker.addTo(LeafletMap.map);
    }
  }

  public stopPositionEdit(): { latitude: number; longitude: number } | null {
    let result: { latitude: number; longitude: number } | null = null;
    if (this.editMode === "drag" && this.editMarker) {
      const ll = this.editMarker.getLatLng();
      LeafletMap.map.removeLayer(this.editMarker);
      this.editMarker = null;
      result = { latitude: ll.lat, longitude: ll.lng };
    } else if (this.editMode === "center" && LeafletMap.map) {
      const c = LeafletMap.map.getCenter();
      result = { latitude: c.lat, longitude: c.lng };
    }
    this.hiddenMarker = null;
    this.editMode = null;
    return result;
  }

  public cancelPositionEdit() {
    if (this.editMarker) {
      LeafletMap.map.removeLayer(this.editMarker);
      this.editMarker = null;
    }
    if (this.hiddenMarker && this.pointsLayer) {
      this.pointsLayer.addLayer(this.hiddenMarker.marker);
      this.hiddenMarker = null;
    }
    this.editMode = null;
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
