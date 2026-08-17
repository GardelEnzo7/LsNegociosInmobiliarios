import L from "leaflet";

/** Shared pin icon for every Leaflet map in the site (listing + property
 * detail) — a plain divIcon, so it never depends on Leaflet's default
 * marker-icon.png (the classic missing-icon issue with bundlers). */
export const markerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:30px;height:30px;border-radius:999px 999px 999px 4px;
    background:#2b333d;transform:rotate(45deg);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 3px 8px rgba(28,33,41,0.4);border:2px solid white;
  "><div style="transform:rotate(-45deg);width:8px;height:8px;border-radius:999px;background:#6fa8ac;"></div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});
