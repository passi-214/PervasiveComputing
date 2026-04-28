import { getMeasurementsByDevice } from "../api/measurementsApi.js";
import { createLineChart } from "../components/lineChart.js";
import { createSensorCard } from "../components/sensorCard.js";
import { createStatCard } from "../components/statCard.js";
import { getTrend } from "../utils/formatters.js";

function getConductivityStats(measurements) {
  const values = measurements
    .map((measurement) => Number(measurement.tds_ppm))
    .filter((value) => !Number.isNaN(value));

  if (values.length === 0) {
    return {
      average: null,
      minimum: null,
      maximum: null
    };
  }

  return {
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values)
  };
}

export async function renderConductivityDetailPage(app, deviceId) {
  const measurements = await getMeasurementsByDevice(deviceId);
  const latest = measurements.at(-1);
  const previous = measurements.at(-2);
  // TODO: Filter history to the last 30 minutes once backend timestamps are final.
  const recentMeasurements = measurements;

  const page = document.createElement("section");
  page.className = "conductivity-detail-page sensor-detail-page sensor-detail-page--conductivity";

  if (!latest) {
    page.innerHTML = `<p class="muted">No conductivity measurements found for ${deviceId}.</p>`;
    app.replaceChildren(page);
    return;
  }

  const topbar = document.createElement("div");
  topbar.className = "sensor-detail-page__topbar";

  const backButton = document.createElement("button");
  backButton.className = "button button--ghost";
  backButton.type = "button";
  backButton.textContent = "Back to Overview";
  backButton.addEventListener("click", () => {
    window.location.hash = `#/devices/${deviceId}`;
  });
  topbar.append(backButton);

  const title = document.createElement("div");
  title.className = "sensor-detail-page__title";
  title.innerHTML = `<h1>Conductivity</h1>`;

  const content = document.createElement("section");
  content.className = "sensor-detail-page__content";

  const summary = createSensorCard({
    sensorKey: "conductivity",
    title: "Conductivity",
    unit: "ppm",
    value: latest.tds_ppm,
    decimals: 0,
    lastMeasurement: latest.ts,
    trend: getTrend(latest.tds_ppm, previous?.tds_ppm)
  });
  summary.classList.add("sensor-detail-page__summary");

  const chartPanel = document.createElement("article");
  chartPanel.className = "sensor-detail-page__chart panel";
  chartPanel.innerHTML = `
    <div class="sensor-detail-page__chart-header">
      <span class="sensor-detail-page__range">Last 30 minutes</span>
    </div>
  `;
  chartPanel.append(createLineChart({
    points: recentMeasurements,
    valueKey: "tds_ppm",
    unit: "ppm",
    stroke: "#2584ff"
  }));

  content.append(summary, chartPanel);

  const stats = getConductivityStats(recentMeasurements);
  const statsPanel = document.createElement("section");
  statsPanel.className = "sensor-detail-page__stats panel";
  statsPanel.innerHTML = `
    <div class="sensor-detail-page__stats-header">
      <h2 class="section-title">Statistics</h2>
      <span class="sensor-detail-page__range">Last 30 minutes</span>
    </div>
  `;

  const statGrid = document.createElement("div");
  statGrid.className = "sensor-detail-page__stat-grid";
  statGrid.append(
    createStatCard({ label: "Average", value: stats.average, unit: "ppm", decimals: 0 }),
    createStatCard({ label: "Minimum", value: stats.minimum, unit: "ppm", decimals: 0 }),
    createStatCard({ label: "Maximum", value: stats.maximum, unit: "ppm", decimals: 0 })
  );

  statsPanel.append(statGrid);
  page.append(topbar, title, content, statsPanel);
  app.replaceChildren(page);
}
