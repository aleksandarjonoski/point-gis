import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

export interface AddPointTypeSubmitDetail {
  name: string;
  description: string;
}

@customElement("add-point-type-dialog")
export class AddPointTypeDialog extends LitElement {
  @state() private name = "";
  @state() private description = "";
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
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="panel">
        <header>
          <span>Add point type</span>
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
