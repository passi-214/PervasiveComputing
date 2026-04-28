const MOCK_MEASUREMENTS_URL = "./data/mockMeasurements.json";

// TODO: Replace mock-data loading with the real backend endpoints:

async function fetchMockMeasurements() {
  const response = await fetch(MOCK_MEASUREMENTS_URL);

  if (!response.ok) {
    throw new Error(`Failed to load mock measurements: ${response.status}`);
  }

  return response.json();
}

function sortByTimestampAsc(measurements) {
  return [...measurements].sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

function sortByTimestampDesc(measurements) {
  return [...measurements].sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

export async function getLatestMeasurements() {
  const measurements = await fetchMockMeasurements();
  const latestByDevice = new Map();

  sortByTimestampDesc(measurements).forEach((measurement) => {
    if (!latestByDevice.has(measurement.device_id)) {
      latestByDevice.set(measurement.device_id, measurement);
    }
  });

  return [...latestByDevice.values()];
}

export async function getMeasurementsByDevice(deviceId) {
  const measurements = await fetchMockMeasurements();

  return sortByTimestampAsc(
    measurements.filter((measurement) => measurement.device_id === deviceId)
  );
}

export async function getDeviceIds() {
  const measurements = await fetchMockMeasurements();
  const deviceIds = new Set(measurements.map((measurement) => measurement.device_id));

  return [...deviceIds].sort();
}
