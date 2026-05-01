export interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string;
  userUuid: string;
  isPublic: boolean;
}

export const POINT_TYPES = [
  "deciduous tree",
  "evergreen tree",
  "fruit tree",
] as const;
export type PointType = (typeof POINT_TYPES)[number];

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
  type: PointType;
  description: string;
  latitude: number;
  longitude: number;
  projectUuid: string;
}

const API_BASE = "/api";

export async function fetchProjects(userUuid?: string): Promise<Project[]> {
  const url = userUuid
    ? `${API_BASE}/projects?userUuid=${encodeURIComponent(userUuid)}`
    : `${API_BASE}/projects`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchProjects failed: ${res.status}`);
  return res.json();
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
