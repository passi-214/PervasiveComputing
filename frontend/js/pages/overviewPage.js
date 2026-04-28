import { getMeasurementsByDevice } from "../api/measurementsApi.js";
import { createDashboardHeader } from "../components/dashboardHeader.js";
import { createGpsCard } from "../components/gpsCard.js";
import { createSensorCard } from "../components/sensorCard.js";
import { INACTIVE_DEVICE_IDS } from "../config/devices.js";
import { getTrend } from "../utils/formatters.js";
import { getDeviceStatus } from "../utils/status.js";

function makeCardNavigable(card, targetHash) {
  card.classList.add("sensor-card--clickable");
  card.tabIndex = 0;
  card.role = "link";
  card.addEventListener("click", () => {
    window.location.hash = targetHash;
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.hash = targetHash;
    }
  });
}

export async function renderDeviceOverviewPage(app, deviceId) {
  const measurements = await getMeasurementsByDevice(deviceId);
  const allDeviceIds = [deviceId, ...INACTIVE_DEVICE_IDS.filter((id) => id !== deviceId)];
  const latest = measurements.at(-1);
  const previous = measurements.at(-2);

  const page = document.createElement("section");
  page.className = "device-overview-page";

  if (!latest) {
    page.innerHTML = `
      <p class="muted">No measurements found for ${deviceId}.</p>
    `;
    app.replaceChildren(page);
    return;
  }

  const header = createDashboardHeader({
    deviceId,
    deviceIds: allDeviceIds,
    disabledDeviceIds: INACTIVE_DEVICE_IDS,
    status: getDeviceStatus(latest),
    showBackButton: true,
    onDeviceChange: (nextDeviceId) => {
      window.location.hash = `#/devices/${nextDeviceId}`;
    },
    onBack: () => {
      window.location.hash = "#/";
    }
  });

  const grid = document.createElement("section");
  grid.className = "device-overview-page__grid";
  // TODO: Use sensor-specific timestamps once the backend provides them.
  const temperatureCard = createSensorCard({
      sensorKey: "temperature",
      title: "Temperature",
      unit: "°C",
      value: latest.temp_c,
      lastMeasurement: latest.ts,
      trend: getTrend(latest.temp_c, previous?.temp_c)
    });
  makeCardNavigable(temperatureCard, `#/devices/${deviceId}/temperature`);

  const conductivityCard = createSensorCard({
    sensorKey: "conductivity",
    title: "Conductivity",
    unit: "ppm",
    value: latest.tds_ppm,
    decimals: 0,
    lastMeasurement: latest.ts,
    trend: getTrend(latest.tds_ppm, previous?.tds_ppm)
  });
  makeCardNavigable(conductivityCard, `#/devices/${deviceId}/conductivity`);

  const turbidityCard = createSensorCard({
    sensorKey: "turbidity",
    title: "Turbidity",
    unit: "NTU",
    value: latest.turb_ntu,
    lastMeasurement: latest.ts,
    trend: getTrend(latest.turb_ntu, previous?.turb_ntu)
  });
  makeCardNavigable(turbidityCard, `#/devices/${deviceId}/turbidity`);

  grid.append(
    temperatureCard,
    conductivityCard,
    turbidityCard,
    createGpsCard({
      latitude: latest.lat,
      longitude: latest.lon,
      locationName: latest.location_name,
      lastMeasurement: latest.ts
    })
  );

  page.append(header, grid);
  app.replaceChildren(page);
}
