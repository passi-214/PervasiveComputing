import { sensorIcons } from "../utils/icons.js";

// TODO: Clarify how the frontend receives a human-readable location name.
// Possible sources: backend-provided location_name, device metadata, or reverse geocoding.

export function createGpsCard({ latitude, longitude, locationName, hasFix = true }) {
  const card = document.createElement("article");
  card.className = "gps-card card";

  const lat = latitude ?? "--";
  const lon = longitude ?? "--";
  const displayName = locationName || "Unknown location";

  card.innerHTML = `
    <div class="gps-card__top">
      <div class="gps-card__icon" aria-hidden="true">
        ${sensorIcons.gps}
      </div>
      <div>
        <h2>Location</h2>
        <p>GPS</p>
      </div>
    </div>
    <div class="gps-card__location">
      <span>Current Position</span>
      <strong>${displayName}</strong>
    </div>
    <div class="gps-card__coords">
      <div>
        <span>Latitude</span>
        <strong>${lat}</strong>
      </div>
      <div>
        <span>Longitude</span>
        <strong>${lon}</strong>
      </div>
    </div>
    <div class="gps-card__fix ${hasFix ? "gps-card__fix--ok" : "gps-card__fix--lost"}">
      <span></span>
      ${hasFix ? "GPS Fix" : "No GPS Fix"}
    </div>
  `;

  return card;
}
