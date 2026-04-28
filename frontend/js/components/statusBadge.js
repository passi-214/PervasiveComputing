const STATUS_LABELS = {
  live: "Live",
  stale: "Stale",
  inactive: "Inactive",
  error: "Error",
  good: "Good",
  okay: "OK",
  bad: "Bad"
};

export function createStatusBadge(status, options = {}) {
  const badge = document.createElement("span");
  const normalizedStatus = status || "stale";
  const label = options.label || STATUS_LABELS[normalizedStatus] || normalizedStatus;

  badge.className = `status-badge status-badge--${normalizedStatus}`;
  badge.innerHTML = `<span class="status-badge__dot" aria-hidden="true"></span><span>${label}</span>`;

  return badge;
}
