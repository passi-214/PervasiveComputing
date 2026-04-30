const SSE_URL = "/api/measurements/stream";

let measurements = [];
let eventSource = null;
let initialized = false;
let notifyTimer = null;

const listeners = new Set();

function notifyListeners() {
  notifyTimer = null;

  for (const listener of listeners) {
    listener([...measurements]);
  }
}

function scheduleNotifyListeners() {
  if (notifyTimer) {
    return;
  }

  notifyTimer = window.setTimeout(notifyListeners, 100);
}

function sortByTimestampAsc(measurements) {
  return [...measurements].sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

function sortByTimestampDesc(measurements) {
  return [...measurements].sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

function normalizeMeasurement(measurement) {
  return {
    device_id: measurement.device_id ?? "",
    ts: measurement.ts ?? "",
    lat: measurement.lat ?? undefined,
    lon: measurement.lon ?? undefined,
    temp_c: measurement.temp_c ?? undefined,
    tds_ppm: measurement.tds_ppm ?? undefined,
    turb_ntu: measurement.turb_ntu ?? undefined,
    ph_level: measurement.ph_level ?? undefined,
  };
}

function mergeMeasurement(previous, next) {
  const normalizedNext = normalizeMeasurement(next);

  if (!previous) {
    return normalizedNext;
  }

  return {
    device_id: normalizedNext.device_id || previous.device_id,
    ts: normalizedNext.ts || previous.ts,

    lat: normalizedNext.lat ?? previous.lat,
    lon: normalizedNext.lon ?? previous.lon,

    temp_c: normalizedNext.temp_c ?? previous.temp_c,
    tds_ppm: normalizedNext.tds_ppm ?? previous.tds_ppm,
    turb_ntu: normalizedNext.turb_ntu ?? previous.turb_ntu,
    ph_level: normalizedNext.ph_level ?? previous.ph_level,
  };
}

function addMeasurement(measurement) {
  const normalizedMeasurement = normalizeMeasurement(measurement);
  let previousForDevice = null;

  for (let index = measurements.length - 1; index >= 0; index -= 1) {
    if (measurements[index].device_id === normalizedMeasurement.device_id) {
      previousForDevice = measurements[index];
      break;
    }
  }

  const mergedMeasurement = mergeMeasurement(previousForDevice, normalizedMeasurement);

  measurements.push(mergedMeasurement);
  scheduleNotifyListeners();
}

export function startMeasurementStream() {
  if (initialized) {
    return;
  }

  initialized = true;
  eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    console.log("SSE connected");
  };

  eventSource.onmessage = (event) => {
    try {
      const measurement = JSON.parse(event.data);
      addMeasurement(measurement);
    } catch (error) {
      console.error("Invalid SSE measurement:", event.data, error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);
  };
}

export function stopMeasurementStream() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    initialized = false;
  }
}

export function subscribeToMeasurements(listener) {
  listeners.add(listener);
  startMeasurementStream();

  listener([...measurements]);

  return () => {
    listeners.delete(listener);
  };
}

export async function getLatestMeasurements() {
  startMeasurementStream();

  const latestByDevice = new Map();

  sortByTimestampDesc(measurements).forEach((measurement) => {
    if (!latestByDevice.has(measurement.device_id)) {
      latestByDevice.set(measurement.device_id, measurement);
    }
  });

  return [...latestByDevice.values()];
}

export async function getMeasurementsByDevice(deviceId) {
  startMeasurementStream();

  return sortByTimestampAsc(
    measurements.filter((measurement) => measurement.device_id === deviceId)
  );
}

export async function getDeviceIds() {
  startMeasurementStream();

  const deviceIds = new Set(
    measurements.map((measurement) => measurement.device_id)
  );

  return [...deviceIds].sort();
}
