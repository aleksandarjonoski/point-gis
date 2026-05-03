import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./leaflet-map";
import "./project-picker";
import "./add-point-dialog";
import "./add-project-dialog";
import "./add-point-type-dialog";
import "./point-type-picker";
import { LeafletMap } from "./leaflet-map";
import {
  fetchProjects,
  fetchPoints,
  createPoint,
  updatePoint,
  createProject,
  fetchPointTypes,
  createPointType,
  Project,
  Point,
  PointType,
} from "../services/api";
import type { AddPointSubmitDetail, DialogMode } from "./add-point-dialog";
import type { AddProjectSubmitDetail } from "./add-project-dialog";
import type { AddPointTypeSubmitDetail } from "./add-point-type-dialog";

interface DialogValues {
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
}

@customElement("map-app")
export class MapApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header.app-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 10px 12px;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom: 1px solid #d1d5db;
    }
    .left {
      justify-self: start;
    }
    .center {
      justify-self: center;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      padding: 6px 14px;
      border-radius: 999px;
      background: #e5e7eb;
      user-select: none;
    }
    .center:hover {
      background: #d1d5db;
    }
    .right {
      justify-self: end;
    }
    button.add {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    button.add:disabled {
      background: #93b4ef;
      cursor: not-allowed;
    }
    .map-wrap {
      flex: 1;
      position: relative;
    }
    leaflet-map {
      display: block;
      height: 100%;
    }
    .position-bar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      border-top: 1px solid #e5e5e5;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
    }
    .position-bar .hint {
      font-size: 13px;
      color: #555;
    }
    .position-bar .actions {
      display: flex;
      gap: 8px;
    }
    .position-bar button {
      font-size: 15px;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .position-bar button.cancel {
      background: #fff;
      border-color: #ccc;
      color: #333;
    }
    .position-bar button.save {
      background: #2563eb;
      color: #fff;
    }
  `;

  @state() private projects: Project[] = [];
  @state() private currentProject: Project | null = null;
  @state() private pickerOpen = false;
  @state() private addProjectOpen = false;
  @state() private acquiringGps = false;

  @state() private pointTypes: PointType[] = [];
  @state() private addPointTypeOpen = false;
  @state() private pointTypePickerOpen = false;

  @state() private dialogMode: DialogMode | null = null;
  @state() private dialogValues: DialogValues | null = null;
  @state() private editingPoint: Point | null = null;
  @state() private positionEditOpen = false;

  async connectedCallback() {
    super.connectedCallback();
    try {
      const projects = await fetchProjects();
      this.projects = projects;
      const general =
        projects.find((p) => p.name === "General" && p.isPublic) ??
        projects.find((p) => p.isPublic) ??
        projects[0] ??
        null;
      if (general) {
        await this.selectProject(general);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }

  private async selectProject(project: Project) {
    this.currentProject = project;
    this.pickerOpen = false;
    await this.refreshPointTypes();
    await this.refreshPoints({ fitBounds: true });
  }

  private async refreshPointTypes() {
    if (!this.currentProject) return;
    try {
      this.pointTypes = await fetchPointTypes(this.currentProject.uuid);
    } catch (err) {
      console.error("Failed to load point types:", err);
      this.pointTypes = [];
    }
  }

  private async refreshPoints(options: { fitBounds?: boolean } = {}) {
    if (!this.currentProject) return;
    try {
      const points = await fetchPoints(this.currentProject.uuid);
      await this.updateComplete;
      const mapEl = this.shadowRoot?.querySelector(
        "leaflet-map"
      ) as LeafletMap | null;
      mapEl?.renderPoints(points, {
        ...options,
        pointTypes: this.pointTypes,
      });
    } catch (err) {
      console.error("Failed to load points:", err);
    }
  }

  private getMap(): LeafletMap | null {
    return this.shadowRoot?.querySelector("leaflet-map") as LeafletMap | null;
  }

  private openPicker() {
    this.pickerOpen = true;
  }

  private onProjectSelected(e: CustomEvent<Project>) {
    this.selectProject(e.detail);
  }

  private onPickerClosed() {
    this.pickerOpen = false;
  }

  private onAddProjectRequested() {
    this.pickerOpen = false;
    this.addProjectOpen = true;
  }

  private onAddProjectCancelled() {
    this.addProjectOpen = false;
    this.pickerOpen = true;
  }

  private onOpenPointTypePicker(e: CustomEvent<AddPointSubmitDetail>) {
    if (!this.dialogValues) return;
    this.dialogValues = {
      ...this.dialogValues,
      name: e.detail.name,
      type: e.detail.type,
      description: e.detail.description,
    };
    this.pointTypePickerOpen = true;
  }

  private onPointTypeSelected(e: CustomEvent<PointType>) {
    if (!this.dialogValues) return;
    this.dialogValues = { ...this.dialogValues, type: e.detail.uuid };
    this.pointTypePickerOpen = false;
  }

  private onPointTypePickerClosed() {
    this.pointTypePickerOpen = false;
  }

  private onAddPointTypeRequested() {
    this.addPointTypeOpen = true;
  }

  private onAddPointTypeCancelled() {
    this.addPointTypeOpen = false;
  }

  private async onAddPointTypeSubmit(e: CustomEvent<AddPointTypeSubmitDetail>) {
    if (!this.currentProject) return;
    try {
      await createPointType({
        name: e.detail.name,
        description: e.detail.description,
        projectUuid: this.currentProject.uuid,
      });
      await this.refreshPointTypes();
      this.addPointTypeOpen = false;
    } catch (err) {
      console.error("Failed to create point type:", err);
      alert("Failed to create point type");
    }
  }

  private async onAddProjectSubmit(e: CustomEvent<AddProjectSubmitDetail>) {
    try {
      await createProject(e.detail);
      const projects = await fetchProjects();
      this.projects = projects;
      this.addProjectOpen = false;
      this.pickerOpen = true;
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create project");
    }
  }

  private async onAddPointClicked() {
    if (!this.currentProject || this.acquiringGps) return;
    this.acquiringGps = true;
    try {
      const pos = await this.getCurrentPosition();
      this.dialogMode = "create";
      this.editingPoint = null;
      this.dialogValues = {
        name: "",
        type: this.pointTypes[0]?.uuid ?? "",
        description: "",
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch (err) {
      console.error("GPS error:", err);
      alert("Could not get GPS position");
    } finally {
      this.acquiringGps = false;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          navigator.geolocation.clearWatch(id);
          resolve(pos);
        },
        (err) => {
          navigator.geolocation.clearWatch(id);
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  }

  private onPointEditRequested(e: CustomEvent<Point>) {
    const p = e.detail;
    const type =
      this.pointTypes.find((t) => t.uuid === p.type)?.uuid ??
      this.pointTypes[0]?.uuid ??
      "";
    this.dialogMode = "edit";
    this.editingPoint = p;
    this.dialogValues = {
      name: p.name,
      type,
      description: p.description ?? "",
      latitude: p.latitude,
      longitude: p.longitude,
    };
  }

  private onEditPositionRequested(e: CustomEvent<AddPointSubmitDetail>) {
    if (!this.dialogValues) return;
    this.dialogValues = {
      ...this.dialogValues,
      name: e.detail.name,
      type: e.detail.type,
      description: e.detail.description,
    };
    this.positionEditOpen = true;
    this.updateComplete.then(() => {
      this.getMap()?.startPositionEdit(
        this.dialogValues!.latitude,
        this.dialogValues!.longitude,
        this.editingPoint?.uuid
      );
    });
  }

  private savePosition() {
    const result = this.getMap()?.stopPositionEdit();
    if (result && this.dialogValues) {
      this.dialogValues = {
        ...this.dialogValues,
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }
    this.positionEditOpen = false;
  }

  private cancelPosition() {
    this.getMap()?.cancelPositionEdit();
    this.positionEditOpen = false;
  }

  private async onDialogSubmit(e: CustomEvent<AddPointSubmitDetail>) {
    if (!this.currentProject || !this.dialogValues) return;
    const detail = e.detail;
    try {
      if (this.dialogMode === "edit" && this.editingPoint) {
        await updatePoint(this.editingPoint.uuid, {
          name: detail.name,
          type: detail.type,
          description: detail.description,
          latitude: detail.latitude,
          longitude: detail.longitude,
        });
      } else {
        await createPoint({
          name: detail.name,
          type: detail.type,
          description: detail.description,
          latitude: detail.latitude,
          longitude: detail.longitude,
          projectUuid: this.currentProject.uuid,
        });
      }
      const wasCreate = this.dialogMode === "create";
      this.closeDialog();
      await this.refreshPoints();
      if (wasCreate) {
        this.getMap()?.flyTo(detail.latitude, detail.longitude);
      }
    } catch (err) {
      console.error("Failed to save point:", err);
      alert("Failed to save point");
    }
  }

  private onDialogCancelled() {
    this.closeDialog();
  }

  private closeDialog() {
    this.dialogMode = null;
    this.dialogValues = null;
    this.editingPoint = null;
  }

  render() {
    const showDialog =
      this.dialogMode !== null &&
      !this.positionEditOpen &&
      !this.addPointTypeOpen &&
      !this.pointTypePickerOpen;
    const showTypePicker =
      this.pointTypePickerOpen && !this.addPointTypeOpen;
    return html`
      <header class="app-header">
        <span class="left"></span>
        <span class="center" @click=${this.openPicker}>
          ${this.currentProject?.name ?? "Loading..."}
        </span>
        <span class="right">
          <button
            class="add"
            ?disabled=${!this.currentProject || this.acquiringGps}
            @click=${this.onAddPointClicked}
          >
            ${this.acquiringGps ? "Locating..." : "Add point"}
          </button>
        </span>
      </header>
      <div class="map-wrap">
        <leaflet-map
          @point-edit-requested=${this.onPointEditRequested}
        ></leaflet-map>
      </div>
      ${this.pickerOpen
        ? html`
            <project-picker
              .projects=${this.projects}
              .selectedUuid=${this.currentProject?.uuid ?? ""}
              @project-selected=${this.onProjectSelected}
              @picker-closed=${this.onPickerClosed}
              @add-project-requested=${this.onAddProjectRequested}
            ></project-picker>
          `
        : ""}
      ${this.addProjectOpen
        ? html`
            <add-project-dialog
              @dialog-submit=${this.onAddProjectSubmit}
              @dialog-cancelled=${this.onAddProjectCancelled}
            ></add-project-dialog>
          `
        : ""}
      ${showDialog && this.dialogValues
        ? html`
            <add-point-dialog
              .mode=${this.dialogMode!}
              .latitude=${this.dialogValues.latitude}
              .longitude=${this.dialogValues.longitude}
              .initialName=${this.dialogValues.name}
              .initialType=${this.dialogValues.type}
              .initialDescription=${this.dialogValues.description}
              .pointTypes=${this.pointTypes}
              @dialog-submit=${this.onDialogSubmit}
              @dialog-cancelled=${this.onDialogCancelled}
              @edit-position=${this.onEditPositionRequested}
              @open-point-type-picker=${this.onOpenPointTypePicker}
            ></add-point-dialog>
          `
        : ""}
      ${showTypePicker
        ? html`
            <point-type-picker
              .pointTypes=${this.pointTypes}
              .selectedUuid=${this.dialogValues?.type ?? ""}
              @point-type-selected=${this.onPointTypeSelected}
              @picker-closed=${this.onPointTypePickerClosed}
              @add-point-type-requested=${this.onAddPointTypeRequested}
            ></point-type-picker>
          `
        : ""}
      ${this.addPointTypeOpen
        ? html`
            <add-point-type-dialog
              @dialog-submit=${this.onAddPointTypeSubmit}
              @dialog-cancelled=${this.onAddPointTypeCancelled}
            ></add-point-type-dialog>
          `
        : ""}
      ${this.positionEditOpen
        ? html`
            <div class="position-bar">
              <span class="hint">Drag the marker to a new position</span>
              <span class="actions">
                <button class="cancel" @click=${this.cancelPosition}>
                  Cancel
                </button>
                <button class="save" @click=${this.savePosition}>Ok</button>
              </span>
            </div>
          `
        : ""}
    `;
  }
}
