import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  POINT_TYPE_ICONS,
  DEFAULT_POINT_TYPE_ICON,
  POINT_TYPE_COLORS,
  DEFAULT_PIN_COLOR,
  pinInnerSvg,
} from "../services/point-type-icons";

export interface AddPointTypeSubmitDetail {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type PointTypeDialogMode = "create" | "edit";

@customElement("add-point-type-dialog")
export class AddPointTypeDialog extends LitElement {
  @property({ type: String }) mode: PointTypeDialogMode = "create";
  @property({ type: String }) initialName = "";
  @property({ type: String }) initialDescription = "";
  @property({ type: String }) initialIcon = DEFAULT_POINT_TYPE_ICON;
  @property({ type: String }) initialColor = DEFAULT_PIN_COLOR;

  @state() private name = "";
  @state() private description = "";
  @state() private icon = DEFAULT_POINT_TYPE_ICON;
  @state() private color = DEFAULT_PIN_COLOR;
  @state() private saving = false;

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has("initialName")) this.name = this.initialName;
    if (changed.has("initialDescription"))
      this.description = this.initialDescription;
    if (changed.has("initialIcon"))
      this.icon = this.initialIcon || DEFAULT_POINT_TYPE_ICON;
    if (changed.has("initialColor"))
      this.color = this.initialColor || DEFAULT_PIN_COLOR;
  }

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
      background: #fafafa;
      border-bottom: 1px solid #d1d5db;
      color: #1f2937;
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
    textarea {
      font-size: 15px;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      font-family: inherit;
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    input:focus,
    textarea:focus {
      outline: none;
      border-color: #2563eb;
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
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 10px;
    }
    button.icon-choice {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 4px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      color: #1f2937;
      font-size: 11px;
    }
    button.icon-choice:hover {
      border-color: #93b4ef;
    }
    button.icon-choice.selected {
      border-color: #2563eb;
      background: #eff5ff;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    button.icon-choice svg {
      width: 28px;
      height: 28px;
    }
    .color-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    button.color-choice {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px #ccc;
      cursor: pointer;
      padding: 0;
    }
    button.color-choice.selected {
      box-shadow: 0 0 0 2px #1f2937;
    }
    input[type="color"].custom-color {
      width: 38px;
      height: 32px;
      padding: 2px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
    }
    .pin-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }
    .pin-preview svg {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
    }
  `;

  private cancel() {
    this.dispatchEvent(
      new CustomEvent("dialog-cancelled", { bubbles: true, composed: true })
    );
  }

  private save() {
    if (!this.name.trim() || this.saving) return;
    this.saving = true;
    this.dispatchEvent(
      new CustomEvent<AddPointTypeSubmitDetail>("dialog-submit", {
        detail: {
          name: this.name.trim(),
          description: this.description.trim(),
          icon: this.icon,
          color: this.color,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const title = this.mode === "edit" ? "Edit point type" : "Add point type";
    return html`
      <div class="panel">
        <header>
          <span>${title}</span>
          <button class="close" @click=${this.cancel}>×</button>
        </header>
        <div class="body">
          <div class="pin-preview">
            <svg viewBox="0 0 24 24" width="52" height="52">
              ${unsafeSVG(pinInnerSvg(this.icon, this.color))}
            </svg>
          </div>
          <label>
            Name
            <input
              type="text"
              .value=${this.name}
              @input=${(e: InputEvent) =>
                (this.name = (e.target as HTMLInputElement).value)}
              placeholder="e.g. Oak"
            />
          </label>
          <label>
            Description
            <textarea
              rows="3"
              .value=${this.description}
              @input=${(e: InputEvent) =>
                (this.description = (e.target as HTMLTextAreaElement).value)}
              placeholder="Optional description"
            ></textarea>
          </label>
          <label>
            Map icon
            <div class="icon-grid">
              ${POINT_TYPE_ICONS.map(
                (ic) => html`
                  <button
                    type="button"
                    class="icon-choice ${this.icon === ic.key
                      ? "selected"
                      : ""}"
                    title=${ic.label}
                    @click=${() => (this.icon = ic.key)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style="color: darkgrey"
                    >
                      <path d=${ic.path} />
                    </svg>
                    ${ic.label}
                  </button>
                `
              )}
            </div>
          </label>
          <label>
            Pin color
            <div class="color-row">
              ${POINT_TYPE_COLORS.map(
                (c) => html`
                  <button
                    type="button"
                    class="color-choice ${this.color === c ? "selected" : ""}"
                    style="background:${c}"
                    title=${c}
                    @click=${() => (this.color = c)}
                  ></button>
                `
              )}
              <input
                type="color"
                class="custom-color"
                title="Custom color"
                .value=${this.color}
                @input=${(e: InputEvent) =>
                  (this.color = (e.target as HTMLInputElement).value)}
              />
            </div>
          </label>
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
