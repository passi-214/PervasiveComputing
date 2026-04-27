import { createStatusBadge } from "./statusBadge.js";
import { formatTimestamp } from "../utils/formatters.js";

export function createDeviceCard({ deviceId, status = "live", lastMeasurement, onSelect }) {
  const card = document.createElement("article");
  card.className = "device-card card";
  card.tabIndex = 0;
  card.role = "button";

  card.innerHTML = `
    <div>
      <span class="device-card__eyebrow">Node</span>
      <h2>${deviceId}</h2>
    </div>
    <p class="device-card__timestamp">${formatTimestamp(lastMeasurement)}</p>
  `;

  card.append(createStatusBadge(status));

  const selectDevice = () => {
    if (onSelect) {
      onSelect(deviceId);
    }
  };

  card.addEventListener("click", selectDevice);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDevice();
    }
  });

  return card;
}
