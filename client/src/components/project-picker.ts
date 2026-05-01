import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Project } from "../services/api";

@customElement("project-picker")
export class ProjectPicker extends LitElement {
  @property({ type: Array }) projects: Project[] = [];
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
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
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
    .name {
      font-weight: 600;
    }
    .desc {
      font-size: 12px;
      color: #666;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 8px;
      background: #d6efd8;
      color: #1e6b2a;
      align-self: flex-start;
    }
    .empty {
      padding: 24px;
      text-align: center;
      color: #888;
    }
  `;

  private select(p: Project) {
    this.dispatchEvent(
      new CustomEvent<Project>("project-selected", {
        detail: p,
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

  render() {
    return html`
      <div
        class="panel"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <header>
          <span>Select project</span>
          <button class="close" @click=${this.close}>×</button>
        </header>
        ${this.projects.length === 0
          ? html`<div class="empty">No projects available</div>`
          : html`
              <ul>
                ${this.projects.map(
                  (p) => html`
                    <li
                      class=${p.uuid === this.selectedUuid ? "selected" : ""}
                      @click=${() => this.select(p)}
                    >
                      <span class="name">${p.name}</span>
                      ${p.description
                        ? html`<span class="desc">${p.description}</span>`
                        : ""}
                      ${p.isPublic
                        ? html`<span class="badge">Public</span>`
                        : ""}
                    </li>
                  `
                )}
              </ul>
            `}
      </div>
    `;
  }

}
