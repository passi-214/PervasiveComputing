import { getMeasurementsByDevice } from "../api/measurementsApi.js";
import { createLineChart } from "../components/lineChart.js";
import { createSensorCard } from "../components/sensorCard.js";
import { createStatCard } from "../components/statCard.js";
import { getTrend } from "../utils/formatters.js";

function getTemperatureStats(measurements) {
  const values = measurements
    .map((measurement) => Number(measurement.temp_c))
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

export async function renderTemperatureDetailPage(app, deviceId) {
  const measurements = await getMeasurementsByDevice(deviceId);
  const latest = measurements.at(-1);
  const previous = measurements.at(-2);
  const recentMeasurements = measurements;

  const page = document.createElement("section");
  page.className = "temperature-detail-page";

  if (!latest) {
    page.innerHTML = `<p class="muted">No temperature measurements found for ${deviceId}.</p>`;
    app.replaceChildren(page);
    return;
  }

  const topbar = document.createElement("div");
  topbar.className = "temperature-detail-page__topbar";

  const backButton = document.createElement("button");
  backButton.className = "button button--ghost";
  backButton.type = "button";
  backButton.textContent = "Back to Overview";
  backButton.addEventListener("click", () => {
    window.location.hash = `#/devices/${deviceId}`;
  });
  topbar.append(backButton);

  const content = document.createElement("section");
  content.className = "temperature-detail-page__content";

  const title = document.createElement("div");
  title.className = "temperature-detail-page__title";
  title.innerHTML = `
    <h1>Temperature</h1>
  `;

  const summary = createSensorCard({
    sensorKey: "temperature",
    title: "Temperature",
    unit: "°C",
    value: latest.temp_c,
    lastMeasurement: latest.ts,
    trend: getTrend(latest.temp_c, previous?.temp_c)
  });
  summary.classList.add("temperature-detail-page__summary");

  const chartPanel = document.createElement("article");
  chartPanel.className = "temperature-detail-page__chart panel";
  chartPanel.innerHTML = `
    <div class="temperature-detail-page__chart-header"></div>
  `;
  chartPanel.append(createLineChart({
    points: recentMeasurements,
    valueKey: "temp_c",
    unit: "°C",
    stroke: "#ff515d"
  }));

  content.append(summary, chartPanel);

  const stats = getTemperatureStats(recentMeasurements);
  const statsPanel = document.createElement("section");
  statsPanel.className = "temperature-detail-page__stats panel";
  statsPanel.innerHTML = `
    <div class="temperature-detail-page__stats-header">
      <h2 class="section-title">Statistics</h2>
    </div>
  `;

  const statGrid = document.createElement("div");
  statGrid.className = "temperature-detail-page__stat-grid";
  statGrid.append(
    createStatCard({ label: "Average", value: stats.average, unit: "°C" }),
    createStatCard({ label: "Minimum", value: stats.minimum, unit: "°C" }),
    createStatCard({ label: "Maximum", value: stats.maximum, unit: "°C" })
  );

  statsPanel.append(statGrid);
  page.append(topbar, title, content, statsPanel);
  app.replaceChildren(page);
}
