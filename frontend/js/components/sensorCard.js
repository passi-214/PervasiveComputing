import { createStatusBadge } from "./statusBadge.js";
import { formatNumber, formatTimestamp } from "../utils/formatters.js";
import { getGrowthRisk } from "../utils/growthRisk.js";
import { sensorIcons, trendIcons } from "../utils/icons.js";

const SENSOR_THEME_CLASS = {
  temperature: "sensor-card--temperature",
  conductivity: "sensor-card--conductivity",
  turbidity: "sensor-card--turbidity"
};

export function createSensorCard({
  sensorKey,
  title,
  unit,
  value,
  decimals = 1,
  quality = "good",
  lastMeasurement,
  trend
}) {
  const card = document.createElement("article");
  card.className = `sensor-card card ${SENSOR_THEME_CLASS[sensorKey] || ""}`;

  const trendMarkup = trend && trend.direction !== "none"
    ? `
      <div class="sensor-card__trend sensor-card__trend--${trend.direction}">
        <span class="sensor-card__trend-icon" aria-hidden="true">${trendIcons[trend.direction]}</span>
        <strong>${formatNumber(Math.abs(trend.delta), decimals)} ${unit}</strong>
      </div>
    `
    : `<div class="sensor-card__trend sensor-card__trend--empty"></div>`;
  const growthRisk = getGrowthRisk(sensorKey, value);
  const growthRiskMarkup = growthRisk
    ? `
      <div class="sensor-card__growth-risk sensor-card__growth-risk--${growthRisk.level}">
        <span class="sensor-card__growth-risk-dot" aria-hidden="true"></span>
        <strong>${growthRisk.label}</strong>
      </div>
    `
    : "";

  card.innerHTML = `
    <div class="sensor-card__top">
      <div class="sensor-card__icon" aria-hidden="true">
        ${sensorIcons[sensorKey] || title.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <h2>${title}</h2>
        <p>${unit}</p>
      </div>
    </div>
    <div class="sensor-card__value">
      <strong>${formatNumber(value, decimals)}</strong>
      <span>${unit}</span>
    </div>
    ${trendMarkup}
    ${growthRiskMarkup}
    <div class="sensor-card__timestamp">
      <span>Last Measurement:</span>
      <strong>${formatTimestamp(lastMeasurement)}</strong>
    </div>
  `;

  card.append(createStatusBadge(quality));

  return card;
}
