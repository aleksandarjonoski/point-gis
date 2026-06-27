import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fetchComments, addComment, commentImageUrl } from "../services/api";
import type { PointType, Comment } from "../services/api";

export interface AddPointSubmitDetail {
  name: string;
  type: string;
  description: string;
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
  @property({ type: String }) initialType = "";
  @property({ type: String }) initialDescription = "";
  @property({ type: String }) pointUuid = "";
  @property({ type: Array }) pointTypes: PointType[] = [];

  @state() private name = "";
  @state() private type = "";
  @state() private description = "";
  @state() private saving = false;

  @state() private comments: Comment[] = [];
  @state() private commentsLoading = false;
  @state() private newComment = "";
  @state() private selectedFiles: File[] = [];
  @state() private postingComment = false;

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
    select,
    textarea {
      font-size: 15px;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      color: #1f2937;
      font-family: inherit;
    }
    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      padding-right: 36px;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%231f2937' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M1 1.5l5 5 5-5'/></svg>");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 12px 8px;
    }
    select option {
      background: #fff;
      color: #1f2937;
    }
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
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
    button.type-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      font-size: 15px;
      padding: 10px 12px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      color: #1f2937;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
    }
    button.type-button:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    button.type-button svg {
      width: 12px;
      height: 8px;
      flex: none;
    }
    .type-placeholder {
      color: #888;
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
    .comments {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .comments-title {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
    }
    .comment-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 260px;
      overflow-y: auto;
    }
    .muted {
      color: #888;
      font-size: 13px;
    }
    .comment {
      background: #f9fafb;
      border: 1px solid #eef0f2;
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .comment-date {
      font-size: 11px;
      color: #6b7280;
    }
    .comment-text {
      font-size: 14px;
      color: #1f2937;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .thumbs img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      display: block;
    }
    .comment-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .comment-form-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .comment-form input[type="file"] {
      font-size: 12px;
      flex: 1;
      min-width: 0;
      padding: 6px;
    }
    button.add-comment {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      flex: none;
    }
    button.add-comment:disabled {
      background: #93b4ef;
      cursor: not-allowed;
    }
  `;

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has("initialName")) this.name = this.initialName;
    if (changed.has("initialType")) this.type = this.initialType;
    if (changed.has("initialDescription"))
      this.description = this.initialDescription;
    if (changed.has("pointUuid")) {
      if (this.pointUuid && this.mode === "edit") {
        this.loadComments();
      } else {
        this.comments = [];
      }
    }
  }

  private async loadComments() {
    this.commentsLoading = true;
    try {
      this.comments = await fetchComments(this.pointUuid);
    } catch (err) {
      console.error("Failed to load comments:", err);
      this.comments = [];
    } finally {
      this.commentsLoading = false;
    }
  }

  // Keep these in sync with the server limits in images.go.
  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  private static readonly MAX_IMAGES = 10;

  private onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    const tooBig = files.filter(
      (f) => f.size > AddPointDialog.MAX_IMAGE_SIZE
    );
    if (tooBig.length > 0) {
      alert(
        `These images exceed the 10 MB limit: ${tooBig
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    let accepted = files.filter((f) => f.size <= AddPointDialog.MAX_IMAGE_SIZE);
    if (accepted.length > AddPointDialog.MAX_IMAGES) {
      alert(`You can attach at most ${AddPointDialog.MAX_IMAGES} images.`);
      accepted = accepted.slice(0, AddPointDialog.MAX_IMAGES);
    }

    this.selectedFiles = accepted;
  }

  private async submitComment() {
    if (this.postingComment) return;
    const text = this.newComment.trim();
    if (!text && this.selectedFiles.length === 0) return;
    this.postingComment = true;
    try {
      const created = await addComment(
        this.pointUuid,
        text,
        this.selectedFiles
      );
      this.comments = [created, ...this.comments];
      this.newComment = "";
      this.selectedFiles = [];
      const fileInput =
        this.shadowRoot?.querySelector<HTMLInputElement>("input[type=file]");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    } finally {
      this.postingComment = false;
    }
  }

  private formatDate(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleString();
  }

  private renderComments() {
    const canPost =
      !this.postingComment &&
      (this.newComment.trim().length > 0 || this.selectedFiles.length > 0);
    return html`
      <div class="comments">
        <div class="comments-title">Comments</div>
        <div class="comment-list">
          ${this.commentsLoading
            ? html`<div class="muted">Loading...</div>`
            : this.comments.length === 0
            ? html`<div class="muted">No comments yet</div>`
            : this.comments.map(
                (cm) => html`
                  <div class="comment">
                    <div class="comment-date">
                      ${this.formatDate(cm.created)}
                    </div>
                    ${cm.commentText
                      ? html`<div class="comment-text">${cm.commentText}</div>`
                      : ""}
                    ${cm.images.length
                      ? html`<div class="thumbs">
                          ${cm.images.map(
                            (img) => html`<a
                              href=${commentImageUrl(img.filename)}
                              target="_blank"
                              rel="noopener"
                            >
                              <img src=${commentImageUrl(img.filename)} alt="" />
                            </a>`
                          )}
                        </div>`
                      : ""}
                  </div>
                `
              )}
        </div>
        <div class="comment-form">
          <textarea
            rows="2"
            placeholder="Add a comment..."
            .value=${this.newComment}
            @input=${(e: InputEvent) =>
              (this.newComment = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
          <div class="comment-form-actions">
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              @change=${this.onFilesSelected}
            />
            <button
              class="add-comment"
              ?disabled=${!canPost}
              @click=${this.submitComment}
            >
              ${this.postingComment ? "Adding..." : "Add comment"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private currentDetail(): AddPointSubmitDetail {
    return {
      name: this.name.trim(),
      type: this.type,
      description: this.description.trim(),
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

  private openTypePicker() {
    this.dispatchEvent(
      new CustomEvent<AddPointSubmitDetail>("open-point-type-picker", {
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
            <button
              type="button"
              class="type-button"
              @click=${this.openTypePicker}
            >
              <span class=${this.type ? "type-value" : "type-placeholder"}>
                ${this.pointTypes.find((t) => t.uuid === this.type)?.name ??
                "-- Select type --"}
              </span>
              <svg
                viewBox="0 0 12 8"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 1.5l5 5 5-5"
                  fill="none"
                  stroke="#1f2937"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </label>
          <label>
            Description
            <textarea
              rows="3"
              .value=${this.description}
              @input=${(e: InputEvent) =>
                (this.description = (e.target as HTMLTextAreaElement).value)}
              placeholder="Optional notes"
            ></textarea>
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
          ${this.mode === "edit" && this.pointUuid
            ? this.renderComments()
            : ""}
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
