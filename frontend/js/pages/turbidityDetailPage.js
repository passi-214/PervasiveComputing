import {
  getMeasurementsByDevice,
  subscribeToMeasurements,
} from "../api/measurementsApi.js";
import { createLineChart } from "../components/lineChart.js";
import { createSensorCard } from "../components/sensorCard.js";
import { createStatCard } from "../components/statCard.js";
import { getTrend } from "../utils/formatters.js";

function getTurbidityStats(measurements) {
  const values = measurements
    .map((measurement) => Number(measurement.turb_ntu))
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

export async function renderTurbidityDetailPage(app, deviceId) {
  const page = document.createElement("section");
  page.className = "turbidity-detail-page sensor-detail-page sensor-detail-page--turbidity";
  app.replaceChildren(page);

  async function renderDetail() {
    const measurements = await getMeasurementsByDevice(deviceId);
    const latest = measurements.at(-1);
    const previous = measurements.at(-2);
    const recentMeasurements = measurements;

    if (!latest) {
      page.innerHTML = `<p class="muted">Waiting for turbidity measurements for ${deviceId}.</p>`;
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
    title.innerHTML = `<h1>Turbidity</h1>`;

    const content = document.createElement("section");
    content.className = "sensor-detail-page__content";

    const summary = createSensorCard({
      sensorKey: "turbidity",
      title: "Turbidity",
      unit: "NTU",
      value: latest.turb_ntu,
      lastMeasurement: latest.ts,
      trend: getTrend(latest.turb_ntu, previous?.turb_ntu)
    });
    summary.classList.add("sensor-detail-page__summary");

    const chartPanel = document.createElement("article");
    chartPanel.className = "sensor-detail-page__chart panel";
    chartPanel.innerHTML = `
      <div class="sensor-detail-page__chart-header"></div>
    `;
    chartPanel.append(createLineChart({
      points: recentMeasurements,
      valueKey: "turb_ntu",
      unit: "NTU",
      stroke: "#1ce4e9"
    }));

    content.append(summary, chartPanel);

    const stats = getTurbidityStats(recentMeasurements);
    const statsPanel = document.createElement("section");
    statsPanel.className = "sensor-detail-page__stats panel";
    statsPanel.innerHTML = `
      <div class="sensor-detail-page__stats-header">
        <h2 class="section-title">Statistics</h2>
      </div>
    `;

    const statGrid = document.createElement("div");
    statGrid.className = "sensor-detail-page__stat-grid";
    statGrid.append(
      createStatCard({ label: "Average", value: stats.average, unit: "NTU" }),
      createStatCard({ label: "Minimum", value: stats.minimum, unit: "NTU" }),
      createStatCard({ label: "Maximum", value: stats.maximum, unit: "NTU" })
    );

    statsPanel.append(statGrid);
    page.replaceChildren(topbar, title, content, statsPanel);
  }

  await renderDetail();

  subscribeToMeasurements(() => {
    if (window.location.hash === `#/devices/${deviceId}/turbidity`) {
      renderDetail();
    }
  });
}
