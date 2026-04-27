import { sensorIcons } from "../utils/icons.js";

// TODO: Replace the placeholder map with a real map embed or map API using latitude/longitude.

export function createGpsCard({ latitude, longitude, hasFix = true }) {
  const card = document.createElement("article");
  card.className = "gps-card card";

  const lat = latitude ?? "--";
  const lon = longitude ?? "--";

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
    <div class="gps-card__map" aria-hidden="true">
      <div class="gps-card__pin"></div>
    </div>
    <div class="gps-card__coords">
      <strong>${lat}</strong>
      <strong>${lon}</strong>
    </div>
    <div class="gps-card__fix ${hasFix ? "gps-card__fix--ok" : "gps-card__fix--lost"}">
      <span></span>
      ${hasFix ? "GPS Fix" : "No GPS Fix"}
    </div>
  `;

  return card;
}
