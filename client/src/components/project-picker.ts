import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mdiTrashCanOutline, mdiPencilOutline } from "@mdi/js";
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
    }
    footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px solid #e5e5e5;
      background: #fafafa;
    }
    button.add-project {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 15px;
      cursor: pointer;
    }
    button.add-project:hover {
      background: #1d4ed8;
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
      justify-content: space-between;
      gap: 8px;
    }
    .name {
      font-weight: 600;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    button.icon-action {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      color: #9ca3af;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    button.edit:hover {
      background: #e7f0ff;
      color: #2563eb;
    }
    button.delete:hover {
      background: #fde8e8;
      color: #dc2626;
    }
    button.icon-action svg {
      width: 20px;
      height: 20px;
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

  private requestEdit(e: Event, p: Project) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<Project>("project-edit-requested", {
        detail: p,
        bubbles: true,
        composed: true,
      })
    );
  }

  private requestDelete(e: Event, p: Project) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<Project>("project-delete-requested", {
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

  private addProject() {
    this.dispatchEvent(
      new CustomEvent("add-project-requested", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
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
                      <div class="name-row">
                        <span class="name">${p.name}</span>
                        <span class="actions">
                          <button
                            class="icon-action edit"
                            aria-label="Edit project"
                            title="Edit project"
                            @click=${(e: Event) => this.requestEdit(e, p)}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d=${mdiPencilOutline} />
                            </svg>
                          </button>
                          <button
                            class="icon-action delete"
                            aria-label="Delete project"
                            title="Delete project"
                            @click=${(e: Event) => this.requestDelete(e, p)}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d=${mdiTrashCanOutline} />
                            </svg>
                          </button>
                        </span>
                      </div>
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
        <footer>
          <button class="add-project" @click=${this.addProject}>
            Add Project
          </button>
        </footer>
      </div>
    `;
  }
}
