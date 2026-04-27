import { createStatusBadge } from "./statusBadge.js";
import { formatTimestamp } from "../utils/formatters.js";

export function createDashboardHeader({
  deviceId,
  deviceIds = [],
  status = "live",
  lastMeasurement,
  showBackButton = false,
  onDeviceChange,
  onBack
}) {
  const header = document.createElement("header");
  header.className = "dashboard-header panel";

  const brand = document.createElement("div");
  brand.className = "dashboard-header__brand";
  brand.innerHTML = `
    <div class="dashboard-header__logo" aria-hidden="true">AS</div>
    <div>
      <p class="dashboard-header__title">AquaSense</p>
      <p class="dashboard-header__subtitle">Water Quality Monitoring</p>
    </div>
  `;

  const meta = document.createElement("div");
  meta.className = "dashboard-header__meta";

  const nodeField = document.createElement("label");
  nodeField.className = "dashboard-header__field";
  nodeField.innerHTML = `<span>Node</span>`;

  const select = document.createElement("select");
  select.className = "dashboard-header__select";
  select.value = deviceId || "";

  deviceIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    option.selected = id === deviceId;
    select.append(option);
  });

  if (onDeviceChange) {
    select.addEventListener("change", (event) => onDeviceChange(event.target.value));
  }

  nodeField.append(select);

  const statusField = document.createElement("div");
  statusField.className = "dashboard-header__field";
  statusField.innerHTML = `<span>Status</span>`;
  statusField.append(createStatusBadge(status, { label: status === "live" ? "LIVE" : undefined }));

  const measurementField = document.createElement("div");
  measurementField.className = "dashboard-header__field";
  measurementField.innerHTML = `
    <span>Last Measurement</span>
    <strong>${formatTimestamp(lastMeasurement)}</strong>
  `;

  meta.append(nodeField, statusField, measurementField);

  header.append(brand, meta);

  if (showBackButton) {
    const backButton = document.createElement("button");
    backButton.className = "button button--ghost";
    backButton.type = "button";
    backButton.textContent = "Back to Overview";
    backButton.addEventListener("click", () => {
      if (onBack) {
        onBack();
      }
    });
    header.append(backButton);
  }

  return header;
}
