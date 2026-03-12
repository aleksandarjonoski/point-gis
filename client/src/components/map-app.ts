import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "./leaflet-map";
import { LeafletMap } from "./leaflet-map";

@customElement("map-app")
export class MapApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
    }
  `;

  render() {
    return html`
      <h3>PWA Map App</h3>
      <button
        @click=${() => {
          console.log("Something on click");
          var leafletMapElement = this.shadowRoot?.querySelector(
            "leaflet-map"
          ) as LeafletMap;
          leafletMapElement.CenterToCurrentPosition();
        }}
      >
        Add point
      </button>
      <leaflet-map></leaflet-map>
    `;
  }
}
