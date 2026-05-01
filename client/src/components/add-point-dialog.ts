import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { POINT_TYPES, PointType } from "../services/api";

export interface AddPointSubmitDetail {
  name: string;
  type: PointType;
  latitude: number;
  longitude: number;
}

export type DialogMode = "create" | "edit";

@customElement("add-point-dialog")
export class AddPointDialog extends LitElement {
  @property({ type: String }) mode: DialogMode = "create";
  @property({ type: Number }) latitude = 0;
  @property({ type: Number }) longitude = 0;
  @property({ type: String }) initialName = "";
  @property({ type: String }) initialType: PointType = POINT_TYPES[0];

  @state() private name = "";
  @state() private type: PointType = POINT_TYPES[0];
  @state() private saving = false;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      background: #fff;
      display: flex;
      z-index: 1000;
    }
    .panel {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e5e5;
      font-weight: 600;
      font-size: 16px;
    }
    button.close {
      border: none;
      background: transparent;
      font-size: 22px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    .body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      color: #444;
    }
    input,
    select {
      font-size: 15px;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
    }
    input:focus,
    select:focus {
      outline: none;
      border-color: #2563eb;
    }
    .coords {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .coord-box {
      padding: 10px 12px;
      background: #f3f4f6;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      color: #333;
    }
    button.edit-pos {
      align-self: flex-start;
      background: #fff;
      border: 1px solid #2563eb;
      color: #2563eb;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    button.edit-pos:hover {
      background: #eff5ff;
    }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e5e5e5;
      background: #fafafa;
    }
    button.cancel,
    button.save {
      font-size: 15px;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    button.cancel {
      background: #fff;
      border-color: #ccc;
      color: #333;
    }
    button.save {
      background: #2563eb;
      color: #fff;
    }
    button.save:disabled {
      background: #93b4ef;
      cursor: not-allowed;
    }
  `;

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has("initialName")) this.name = this.initialName;
    if (changed.has("initialType")) this.type = this.initialType;
  }

  private currentDetail(): AddPointSubmitDetail {
    return {
      name: this.name.trim(),
      type: this.type,
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  private cancel() {
    this.dispatchEvent(
      new CustomEvent("dialog-cancelled", { bubbles: true, composed: true })
    );
  }

  private save() {
    if (!this.name.trim() || this.saving) return;
    this.saving = true;
    this.dispatchEvent(
      new CustomEvent<AddPointSubmitDetail>("dialog-submit", {
        detail: this.currentDetail(),
        bubbles: true,
        composed: true,
      })
    );
  }

  private editPosition() {
    this.dispatchEvent(
      new CustomEvent<AddPointSubmitDetail>("edit-position", {
        detail: this.currentDetail(),
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const title = this.mode === "edit" ? "Edit point" : "Add point";
    return html`
      <div class="panel">
        <header>
          <span>${title}</span>
          <button class="close" @click=${this.cancel}>×</button>
        </header>
        <div class="body">
          <label>
            Name
            <input
              type="text"
              .value=${this.name}
              @input=${(e: InputEvent) =>
                (this.name = (e.target as HTMLInputElement).value)}
              placeholder="e.g. Old oak"
            />
          </label>
          <label>
            Type
            <select
              .value=${this.type}
              @change=${(e: Event) =>
                (this.type = (e.target as HTMLSelectElement)
                  .value as PointType)}
            >
              ${POINT_TYPES.map(
                (t) => html`<option value=${t}>${t}</option>`
              )}
            </select>
          </label>
          <label>
            Coordinates
            <div class="coords">
              <div class="coord-box">${this.latitude.toFixed(6)}</div>
              <div class="coord-box">${this.longitude.toFixed(6)}</div>
            </div>
          </label>
          <button class="edit-pos" @click=${this.editPosition}>
            Edit position
          </button>
        </div>
        <footer>
          <button class="cancel" @click=${this.cancel}>Cancel</button>
          <button
            class="save"
            ?disabled=${!this.name.trim() || this.saving}
            @click=${this.save}
          >
            ${this.saving ? "Saving..." : "Save"}
          </button>
        </footer>
      </div>
    `;
  }
}
