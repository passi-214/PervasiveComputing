#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

DB_NAME="${DB_NAME:-max}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-m00st3rm4nn}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
BRIDGE_DEFINITION="${BRIDGE_DEFINITION:-$SCRIPT_DIR/ttn-bridge.json}"
BRIDGE_HTML_DIR="${BRIDGE_HTML_DIR:-$SCRIPT_DIR/mqttsuite/mqttbridge/html}"
MQTTCLI_BIN="${MQTTCLI_BIN:-$SCRIPT_DIR/build/mqttcli/mqttcli}"

export MQTTCLI_DASHBOARD_PORT="${MQTTCLI_DASHBOARD_PORT:-8090}"
export MQTTCLI_FRONTEND_ROOT="${MQTTCLI_FRONTEND_ROOT:-$PROJECT_ROOT/frontend}"
export MQTTCLI_WEB_DB_HOST="${MQTTCLI_WEB_DB_HOST:-$DB_HOST}"
export MQTTCLI_WEB_DB_USER="${MQTTCLI_WEB_DB_USER:-$DB_USER}"
export MQTTCLI_WEB_DB_PASSWORD="${MQTTCLI_WEB_DB_PASSWORD:-$DB_PASSWORD}"
export MQTTCLI_WEB_DB_NAME="${MQTTCLI_WEB_DB_NAME:-$DB_NAME}"
export MQTTCLI_WEB_DB_PORT="${MQTTCLI_WEB_DB_PORT:-$DB_PORT}"

pids=()

find_mqttcli() {
  if [[ -x "$MQTTCLI_BIN" ]]; then
    printf '%s\n' "$MQTTCLI_BIN"
    return
  fi

  if command -v mqttcli >/dev/null 2>&1; then
    command -v mqttcli
    return
  fi

  echo "Could not find mqttcli. Set MQTTCLI_BIN or build $MQTTCLI_BIN." >&2
  exit 1
}

process_running() {
  pgrep -f "$1" >/dev/null 2>&1
}

wait_for_processes_to_exit() {
  local deadline=$((SECONDS + 10))

  while process_running 'mqttbroker|mqttbridge|mqttcli'; do
    if (( SECONDS >= deadline )); then
      echo "Old MQTT processes are still running after timeout:" >&2
      pgrep -af 'mqttbroker|mqttbridge|mqttcli' >&2 || true
      return 1
    fi
    sleep 0.2
  done
}

port_listening() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$port" | grep -q LISTEN
  elif command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

wait_for_port_free() {
  local port="$1"
  local deadline=$((SECONDS + 10))

  while port_listening "$port"; do
    if (( SECONDS >= deadline )); then
      echo "Port $port is still in use after timeout." >&2
      return 1
    fi
    sleep 0.2
  done
}

wait_for_port_listening() {
  local port="$1"
  local name="$2"
  local deadline=$((SECONDS + 10))

  until port_listening "$port"; do
    if (( SECONDS >= deadline )); then
      echo "$name did not start listening on port $port." >&2
      return 1
    fi
    sleep 0.2
  done
}

dashboard_enabled() {
  case "${MQTTCLI_DASHBOARD_DISABLED:-false}" in
    1|true|TRUE|yes|YES|on|ON) return 1 ;;
    *) return 0 ;;
  esac
}

cleanup() {
  echo "Stopping processes..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  pkill -f mqttbroker 2>/dev/null || true
  pkill -f mqttbridge 2>/dev/null || true
  pkill -f mqttcli 2>/dev/null || true
  wait_for_processes_to_exit || true
}

trap cleanup EXIT INT TERM

echo "Cleaning up old processes..."
pkill -f mqttbroker 2>/dev/null || true
pkill -f mqttbridge 2>/dev/null || true
pkill -f mqttcli 2>/dev/null || true
wait_for_processes_to_exit
wait_for_port_free 1883
wait_for_port_free 8081
wait_for_port_free 8082
if dashboard_enabled; then
  wait_for_port_free "$MQTTCLI_DASHBOARD_PORT"
fi

MQTTCLI="$(find_mqttcli)"

echo "Starting local broker..."
mqttbroker \
  in-mqtt --disabled=false \
  in-mqtts --disabled \
  in6-mqtt --disabled \
  in6-mqtts --disabled \
  un-mqtt --disabled \
  un-mqtts --disabled \
  in-http --disabled \
  in-https --disabled \
  in6-http --disabled \
  in6-https --disabled \
  un-http --disabled \
  un-https --disabled &
pids+=("$!")
wait_for_port_listening 1883 "mqttbroker"

echo "Starting bridge..."
mqttbridge bridge --definition "$BRIDGE_DEFINITION" --html-dir "$BRIDGE_HTML_DIR" &
pids+=("$!")
wait_for_port_listening 8081 "mqttbridge admin"

echo "Starting MQTT CLI DB subscriber..."
"$MQTTCLI" in-mqtt --disabled=false \
  remote --host 127.0.0.1 --port 1883 \
  session --client-id "mqttcli-db" \
  db --database "$DB_NAME" \
     --username "$DB_USER" \
     --password "$DB_PASSWORD" \
     --host "$DB_HOST" \
     --port "$DB_PORT" \
  sub --topic "v3/maxmustermann@ttn/devices/+/up" &
pids+=("$!")
if dashboard_enabled; then
  wait_for_port_listening "$MQTTCLI_DASHBOARD_PORT" "mqttcli dashboard"
fi

echo "All processes started. Press Ctrl+C to stop."

wait
