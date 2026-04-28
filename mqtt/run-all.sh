#!/usr/bin/env bash
set -euo pipefail

PASSWORD="m00st3rm4nn"

pids=()

cleanup() {
  echo "Stopping processes..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  pkill -f mqttbroker 2>/dev/null || true
  pkill -f mqttbridge 2>/dev/null || true
  pkill -f mqttcli 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Cleaning up old processes..."
pkill -f mqttbroker 2>/dev/null || true
pkill -f mqttbridge 2>/dev/null || true
pkill -f mqttcli 2>/dev/null || true
sleep 1

echo "Starting local broker..."
mqttbroker in-mqtt --disabled=false &
pids+=("$!")

sleep 2

echo "Starting bridge..."
mqttbridge bridge --definition "$HOME/src/PervasiveComputing/mqtt/ttn-bridge.json" &
pids+=("$!")

sleep 2

echo "Starting MQTT CLI DB subscriber..."
"$HOME/src/PervasiveComputing/mqtt/build/mqttcli/mqttcli" in-mqtt --disabled=false \
  remote --host 127.0.0.1 --port 1883 \
  session --client-id "mqttcli-db" \
  db --database "max" \
     --username "root" \
     --password "$PASSWORD" \
     --host "127.0.0.1" \
     --port 3306 \
  sub --topic "v3/maxmustermann@ttn/devices/+/up" &
pids+=("$!")

echo "All processes started. Press Ctrl+C to stop."

wait
