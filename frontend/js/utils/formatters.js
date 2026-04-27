// TODO: Add per-sensor trend thresholds so tiny changes can be treated as unchanged.

export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }

  return Number(value).toFixed(decimals);
}

export function formatMeasurement(value, unit, decimals = 1) {
  const formattedValue = formatNumber(value, decimals);

  if (formattedValue === "--") {
    return formattedValue;
  }

  return `${formattedValue} ${unit}`;
}

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "--";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function getTrend(currentValue, previousValue) {
  if (
    currentValue === null ||
    currentValue === undefined ||
    previousValue === null ||
    previousValue === undefined
  ) {
    return {
      direction: "none",
      delta: null
    };
  }

  const current = Number(currentValue);
  const previous = Number(previousValue);

  if (Number.isNaN(current) || Number.isNaN(previous)) {
    return {
      direction: "none",
      delta: null
    };
  }

  if (current > previous) {
    return {
      direction: "up",
      delta: current - previous
    };
  }

  if (current < previous) {
    return {
      direction: "down",
      delta: current - previous
    };
  }

  return {
    direction: "same",
    delta: 0
  };
}
