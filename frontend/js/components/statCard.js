import { formatNumber } from "../utils/formatters.js";

export function createStatCard({ label, value, unit = "", decimals = 1 }) {
  const card = document.createElement("article");
  card.className = "stat-card";

  card.innerHTML = `
    <span>${label}</span>
    <strong>${formatNumber(value, decimals)}</strong>
    ${unit ? `<small>${unit}</small>` : ""}
  `;

  return card;
}
