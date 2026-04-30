const GROWTH_RISK = {
  low: {
    level: "low",
    label: "Low Risk",
    state: "OK"
  },
  medium: {
    level: "medium",
    label: "Medium Risk",
    state: "Watch"
  },
  high: {
    level: "high",
    label: "High Risk",
    state: "Bad"
  }
};

function withReason(risk, reason) {
  return {
    ...risk,
    reason
  };
}

export function getGrowthRisk(sensorKey, value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (sensorKey === "temperature") {
    if (numericValue < 15) {
      return withReason(GROWTH_RISK.low, "Too cold for fast growth");
    }

    if (numericValue < 20) {
      return withReason(GROWTH_RISK.medium, "Suboptimal temperature");
    }

    if (numericValue <= 35) {
      return withReason(GROWTH_RISK.high, "Optimal growth range");
    }

    return withReason(GROWTH_RISK.medium, "Heat stress possible");
  }

  if (sensorKey === "conductivity") {
    if (numericValue < 100) {
      return withReason(GROWTH_RISK.low, "Low nutrient level");
    }

    if (numericValue <= 300) {
      return withReason(GROWTH_RISK.medium, "Healthy growth nutrients");
    }

    if (numericValue <= 800) {
      return withReason(GROWTH_RISK.high, "High nutrient level");
    }

    return withReason(GROWTH_RISK.medium, "Potential nutrient stress");
  }

  if (sensorKey === "turbidity") {
    if (numericValue <= 10) {
      return withReason(GROWTH_RISK.high, "Clear water supports growth");
    }

    if (numericValue <= 50) {
      return withReason(GROWTH_RISK.medium, "Acceptable light conditions");
    }

    return withReason(GROWTH_RISK.low, "Dirty water may block light");
  }

  return null;
}
