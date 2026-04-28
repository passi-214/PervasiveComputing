import { createStatusBadge } from "./statusBadge.js";
import { formatTimestamp } from "../utils/formatters.js";

export function createDeviceCard({
  deviceId,
  status = "live",
  lastMeasurement,
  description,
  href,
  isDisabled = false,
  onSelect
}) {
  const isLink = Boolean(href && !isDisabled);
  const card = document.createElement(isLink ? "a" : "article");
  card.className = `device-card card ${isDisabled ? "device-card--disabled" : ""}`;
  card.setAttribute("aria-disabled", String(isDisabled));

  if (isLink) {
    card.href = href;
  } else {
    card.tabIndex = isDisabled ? -1 : 0;
    card.role = "button";
  }

  card.innerHTML = `
    <div>
      <span class="device-card__eyebrow">Node</span>
      <h2>${deviceId}</h2>
    </div>
    ${description ? `<p class="device-card__description">${description}</p>` : ""}
    <p class="device-card__timestamp">${formatTimestamp(lastMeasurement)}</p>
  `;

  card.append(createStatusBadge(status));

  const selectDevice = () => {
    if (isDisabled) {
      return;
    }

    if (onSelect) {
      onSelect(deviceId);
    }
  };

  if (onSelect) {
    card.addEventListener("click", selectDevice);
  }

  if (!isLink) {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectDevice();
      }
    });
  }

  return card;
}
