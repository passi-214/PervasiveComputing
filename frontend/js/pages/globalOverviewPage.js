import { createDeviceCard } from "../components/deviceCard.js";
import {
  getLatestMeasurements,
  subscribeToMeasurements,
} from "../api/measurementsApi.js";
import { INACTIVE_DEVICE_IDS } from "../config/devices.js";

export async function renderGlobalOverviewPage(app) {
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

  page.append(header, grid);
  app.replaceChildren(page);

  async function renderCards() {
    const latestMeasurements = await getLatestMeasurements();

    grid.replaceChildren();

    latestMeasurements.forEach((measurement) => {
      grid.append(createDeviceCard({
        deviceId: measurement.device_id,
        status: "live",
        lastMeasurement: measurement.ts,
        href: `#/devices/${measurement.device_id}`,
        isDisabled: false,
      }));
    });

    INACTIVE_DEVICE_IDS.forEach((deviceId) => {
      grid.append(createDeviceCard({
        deviceId,
        status: "inactive",
        isDisabled: true,
      }));
    });
  }

  await renderCards();

  subscribeToMeasurements(() => {
    renderCards();
  });
}
