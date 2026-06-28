import {
  mdiMapMarker,
  mdiPineTree,
  mdiWater,
  mdiImageFilterHdr,
  mdiHome,
  mdiFlag,
  mdiStar,
} from "@mdi/js";

export interface PointTypeIcon {
  key: string;
  label: string;
  path: string;
}

// The fixed set of icons a point type can use. The first entry is the default.
export const POINT_TYPE_ICONS: PointTypeIcon[] = [
  { key: "marker", label: "Pin", path: mdiMapMarker },
  { key: "tree", label: "Tree", path: mdiPineTree },
  { key: "water", label: "Water", path: mdiWater },
  { key: "mountain", label: "Mountain", path: mdiImageFilterHdr },
  { key: "home", label: "Home", path: mdiHome },
  { key: "flag", label: "Flag", path: mdiFlag },
  { key: "star", label: "Star", path: mdiStar },
];

export const DEFAULT_POINT_TYPE_ICON = POINT_TYPE_ICONS[0].key;

// SOLID_PIN_PATH is the map-marker teardrop without the inner hole, used as the
// solid colored body that holds an icon. viewBox 0 0 24 24, tip at (12, 22).
export const SOLID_PIN_PATH =
  "M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z";

// The preset colors offered for a point type's pin. The first is the default.
export const POINT_TYPE_COLORS: string[] = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#f59e0b", // amber
  "#7c3aed", // purple
  "#0891b2", // cyan
  "#db2777", // pink
  "#111827", // near-black
];

export const DEFAULT_PIN_COLOR = POINT_TYPE_COLORS[0];

// pointTypeColor returns a usable color, falling back to the default for empty.
export function pointTypeColor(color: string): string {
  return color || DEFAULT_PIN_COLOR;
}

// pinInnerSvg builds the inner SVG markup for a point's map marker (to be placed
// inside an <svg viewBox="0 0 24 24">). The plain pin renders as the solid
// marker with its hole; any other icon renders as a solid colored teardrop with
// the icon knocked out in white. Shared by the map and the dialog preview.
export function pinInnerSvg(iconKey: string, colorKey: string): string {
  const path = pointTypeIconPath(iconKey);
  const color = pointTypeColor(colorKey);
  const isPlainPin = !iconKey || iconKey === DEFAULT_POINT_TYPE_ICON;
  return isPlainPin
    ? `<path d="${path}" fill="${color}" />`
    : `<path d="${SOLID_PIN_PATH}" fill="${color}" />` +
        `<g transform="translate(6 3) scale(0.5)"><path d="${path}" fill="#fff" /></g>`;
}

// pointTypeIconPath resolves an icon key to its SVG path, falling back to the
// default icon for empty or unknown keys.
export function pointTypeIconPath(key: string): string {
  const found = POINT_TYPE_ICONS.find((i) => i.key === key);
  return (found ?? POINT_TYPE_ICONS[0]).path;
}
