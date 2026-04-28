import { createDeviceCard } from "../components/deviceCard.js";
import { getLatestMeasurements } from "../api/measurementsApi.js";
import { INACTIVE_DEVICE_IDS } from "../config/devices.js";

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
      href: `#/devices/${activeMeasurement.device_id}`,
      isDisabled: false
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
