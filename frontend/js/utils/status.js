// TODO: Replace placeholder status logic with real project rules:
// - define when a device becomes stale based on the last measurement timestamp
// - include sensor_ok, processing_status, and backend flags in error handling

export function getDeviceStatus(measurement) {
  if (!measurement || measurement.sensor_ok === false) {
    return "error";
  }

  return "live";
}
