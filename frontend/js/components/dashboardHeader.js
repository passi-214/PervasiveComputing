import { createStatusBadge } from "./statusBadge.js";

export function createDashboardHeader({
  deviceId,
  deviceIds = [],
  disabledDeviceIds = [],
  status = "live",
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
    option.disabled = disabledDeviceIds.includes(id);
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

  meta.append(nodeField, statusField);

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
