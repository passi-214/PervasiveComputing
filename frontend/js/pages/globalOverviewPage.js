import { createDeviceCard } from "../components/deviceCard.js";
import { getLatestMeasurements } from "../api/measurementsApi.js";

// Temporary placeholder nodes until multiple real devices are available from the backend.
const INACTIVE_DEVICE_IDS = ["WQ-02", "WQ-03"];

export async function renderGlobalOverviewPage(app) {
  const latestMeasurements = await getLatestMeasurements();
  // The active device comes from the latest measurement data.
  const activeMeasurement = latestMeasurements[0];
  const page = document.createElement("section");
  page.className = "global-overview-page";

  const header = document.createElement("header");
  header.className = "global-overview-page__header";
  header.innerHTML = `
    <p class="muted">AquaSense</p>
    <h1>Device Overview</h1>
  `;

  const grid = document.createElement("div");
  grid.className = "global-overview-page__grid";

  if (activeMeasurement) {
    grid.append(createDeviceCard({
      deviceId: activeMeasurement.device_id,
      status: "live",
      lastMeasurement: activeMeasurement.ts,
      isDisabled: false,
      onSelect: (deviceId) => {
        // Route target for the future per-device overview page.
        window.location.hash = `#/devices/${deviceId}`;
      }
    }));
  }

  INACTIVE_DEVICE_IDS.forEach((deviceId) => {
    grid.append(createDeviceCard({
      deviceId,
      status: "inactive",
      isDisabled: true
    }));
  });

  page.append(header, grid);
  app.replaceChildren(page);
}
