export interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string;
  userUuid: string;
  isPublic: boolean;
}

export interface PointType {
  id: number;
  uuid: string;
  name: string;
  description: string;
  projectUuid: string;
}

export interface Point {
  id: number;
  uuid: string;
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  projectUuid: string;
  created: string | null;
  updated: string | null;
}

export interface NewPoint {
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  projectUuid: string;
}

export interface CommentImage {
  id: number;
  uuid: string;
  commentUuid: string;
  filename: string;
  contentType: string;
  created: string | null;
}

export interface Comment {
  id: number;
  uuid: string;
  pointUuid: string;
  commentText: string;
  created: string | null;
  images: CommentImage[];
}

const API_BASE = "/api";

// commentImageUrl builds the URL for a stored comment image filename.
export function commentImageUrl(filename: string): string {
  return `${API_BASE}/comment-images/${encodeURIComponent(filename)}`;
}

export async function fetchProjects(userUuid?: string): Promise<Project[]> {
  const url = userUuid
    ? `${API_BASE}/projects?userUuid=${encodeURIComponent(userUuid)}`
    : `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchProjects failed: ${res.status}`);
  return res.json();
}

export interface NewProject {
  name: string;
  description: string;
  isPublic: boolean;
}

export async function createProject(body: NewProject): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createProject failed: ${res.status}`);
  return res.json();
}

export async function updateProject(
  uuid: string,
  body: NewProject
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(uuid)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`updateProject failed: ${res.status}`);
}

export async function deleteProject(uuid: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(uuid)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deleteProject failed: ${res.status}`);
}

export async function fetchPoints(projectUuid: string): Promise<Point[]> {
  const res = await fetch(
    `${API_BASE}/points?projectUuid=${encodeURIComponent(projectUuid)}`
  );
  if (!res.ok) throw new Error(`fetchPoints failed: ${res.status}`);
  return res.json();
}

export async function createPoint(point: NewPoint): Promise<void> {
  const res = await fetch(`${API_BASE}/add-points`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([point]),
  });
  if (!res.ok) throw new Error(`createPoint failed: ${res.status}`);
}

export interface UpdatePointBody {
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
}

export async function updatePoint(
  uuid: string,
  body: UpdatePointBody
): Promise<void> {
  const res = await fetch(`${API_BASE}/points/${encodeURIComponent(uuid)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`updatePoint failed: ${res.status}`);
}

export async function deletePoint(uuid: string): Promise<void> {
  const res = await fetch(`${API_BASE}/points/${encodeURIComponent(uuid)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deletePoint failed: ${res.status}`);
}

export async function fetchComments(pointUuid: string): Promise<Comment[]> {
  const res = await fetch(
    `${API_BASE}/points/${encodeURIComponent(pointUuid)}/comments`
  );
  if (!res.ok) throw new Error(`fetchComments failed: ${res.status}`);
  return res.json();
}

export async function addComment(
  pointUuid: string,
  commentText: string,
  images: File[]
): Promise<Comment> {
  const form = new FormData();
  form.append("commentText", commentText);
  for (const file of images) {
    form.append("images", file);
  }
  const res = await fetch(
    `${API_BASE}/points/${encodeURIComponent(pointUuid)}/comments`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error(`addComment failed: ${res.status}`);
  return res.json();
}

export async function fetchPointTypes(
  projectUuid: string
): Promise<PointType[]> {
  const res = await fetch(
    `${API_BASE}/point-types?projectUuid=${encodeURIComponent(projectUuid)}`
  );
  if (!res.ok) throw new Error(`fetchPointTypes failed: ${res.status}`);
  return res.json();
}

export interface NewPointType {
  name: string;
  description: string;
  projectUuid: string;
}

export async function createPointType(body: NewPointType): Promise<PointType> {
  const res = await fetch(`${API_BASE}/point-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createPointType failed: ${res.status}`);
  return res.json();
}
