// TODO: Replace placeholder status logic with real project rules:
// - define good / okay / bad thresholds for each sensor
// - define when a device becomes stale based on the last measurement timestamp
// - include sensor_ok, processing_status, and backend flags in error handling

export function getDeviceStatus(measurement) {
  if (!measurement || measurement.sensor_ok === false) {
    return "error";
  }

  return "live";
}

export function getSensorQuality(sensorKey, value, measurement) {
  if (!measurement || measurement.sensor_ok === false || value === null || value === undefined) {
    return "bad";
  }

  return "good";
}
