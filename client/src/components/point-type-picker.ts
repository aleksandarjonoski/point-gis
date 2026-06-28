import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { mdiPencilOutline } from "@mdi/js";
import { pinInnerSvg } from "../services/point-type-icons";
import type { PointType } from "../services/api";

@customElement("point-type-picker")
export class PointTypePicker extends LitElement {
  @property({ type: Array }) pointTypes: PointType[] = [];
  @property({ type: String }) selectedUuid = "";

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      background: #fff;
      display: flex;
      z-index: 1000;
    }
    .panel {
      background: #fff;
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
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      flex: 1;
    }
    .empty {
      flex: 1;
      padding: 24px;
      text-align: center;
      color: #888;
    }
    li {
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    li:hover {
      background: #f6f6f6;
    }
    li.selected {
      background: #eef5ff;
    }
    .name-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .type-preview {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .type-preview svg {
      width: 22px;
      height: 22px;
      display: block;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
    }
    .name {
      font-weight: 600;
      flex: 1;
    }
    button.edit {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      margin: -4px;
      border-radius: 6px;
      color: #9ca3af;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    button.edit:hover {
      background: #e7f0ff;
      color: #2563eb;
    }
    button.edit svg {
      width: 20px;
      height: 20px;
    }
    .desc {
      font-size: 12px;
      color: #666;
      margin-left: 34px;
    }
    footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px solid #e5e5e5;
      background: #fafafa;
    }
    button.add-type {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 15px;
      cursor: pointer;
    }
    button.add-type:hover {
      background: #1d4ed8;
    }
  `;

  private select(t: PointType) {
    this.dispatchEvent(
      new CustomEvent<PointType>("point-type-selected", {
        detail: t,
        bubbles: true,
        composed: true,
      })
    );
  }

  private requestEdit(e: Event, t: PointType) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<PointType>("point-type-edit-requested", {
        detail: t,
        bubbles: true,
        composed: true,
      })
    );
  }

  private close() {
    this.dispatchEvent(
      new CustomEvent("picker-closed", { bubbles: true, composed: true })
    );
  }

  private addType() {
    this.dispatchEvent(
      new CustomEvent("add-point-type-requested", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="panel">
        <header>
          <span>Choose point type</span>
          <button class="close" @click=${this.close}>×</button>
        </header>
        ${this.pointTypes.length === 0
          ? html`<div class="empty">
              No point types yet — tap "Add point type"
            </div>`
          : html`
              <ul>
                ${this.pointTypes.map(
                  (t) => html`
                    <li
                      class=${t.uuid === this.selectedUuid ? "selected" : ""}
                      @click=${() => this.select(t)}
                    >
                      <div class="name-row">
                        <span class="type-preview">
                          <svg viewBox="0 0 24 24">
                            ${unsafeSVG(pinInnerSvg(t.icon, t.color))}
                          </svg>
                        </span>
                        <span class="name">${t.name}</span>
                        <button
                          class="edit"
                          aria-label="Edit point type"
                          title="Edit point type"
                          @click=${(e: Event) => this.requestEdit(e, t)}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d=${mdiPencilOutline} />
                          </svg>
                        </button>
                      </div>
                      ${t.description
                        ? html`<span class="desc">${t.description}</span>`
                        : ""}
                    </li>
                  `
                )}
              </ul>
            `}
        <footer>
          <button class="add-type" @click=${this.addType}>
            Add point type
          </button>
        </footer>
      </div>
    `;
  }
}
