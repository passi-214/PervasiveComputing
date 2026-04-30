#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

load_env_file() {
  local env_file="$1"

  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck source=/dev/null
    . "$env_file"
    set +a
  fi
}

load_env_file "$PROJECT_ROOT/.env"
load_env_file "$SCRIPT_DIR/.env"

DB_NAME="${DB_NAME:-max}"
DB_USER="${DB_USER:-max}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
RUNTIME_DIR="${RUNTIME_DIR:-$SCRIPT_DIR/.runtime}"
BRIDGE_DEFINITION="${BRIDGE_DEFINITION:-$RUNTIME_DIR/ttn-bridge.json}"
BRIDGE_HTML_DIR="${BRIDGE_HTML_DIR:-$SCRIPT_DIR/mqttsuite/mqttbridge/html}"
MQTTCLI_BIN="${MQTTCLI_BIN:-$SCRIPT_DIR/build/mqttcli/mqttcli}"
MQTTCLI_CLIENT_ID="${MQTTCLI_CLIENT_ID:-mqttcli-db}"

TTN_USERNAME="${TTN_USERNAME:-}"
TTN_PASSWORD="${TTN_PASSWORD:-}"
TTN_CLIENT_ID="${TTN_CLIENT_ID:-bridge-ttn-test}"
TTN_HOST="${TTN_HOST:-eu1.cloud.thethings.network}"
TTN_PORT="${TTN_PORT:-8883}"
TTN_TOPIC="${TTN_TOPIC:-}"

LOCAL_BRIDGE_CLIENT_ID="${LOCAL_BRIDGE_CLIENT_ID:-bridge-local}"
LOCAL_MQTT_HOST="${LOCAL_MQTT_HOST:-127.0.0.1}"
LOCAL_MQTT_PORT="${LOCAL_MQTT_PORT:-1883}"

if [[ -z "$TTN_TOPIC" && -n "$TTN_USERNAME" ]]; then
  TTN_TOPIC="v3/$TTN_USERNAME/devices/+/up"
fi

MQTTCLI_SUB_TOPIC="${MQTTCLI_SUB_TOPIC:-$TTN_TOPIC}"

require_env() {
  local var_name

  for var_name in "$@"; do
    if [[ -z "${!var_name:-}" ]]; then
      echo "Missing required environment variable: $var_name" >&2
      echo "Create .env from .env.example and fill in your local values." >&2
      exit 1
    fi
  done
}

require_env TTN_USERNAME TTN_PASSWORD TTN_TOPIC MQTTCLI_SUB_TOPIC

export MQTTCLI_DASHBOARD_PORT="${MQTTCLI_DASHBOARD_PORT:-8090}"
export MQTTCLI_FRONTEND_ROOT="${MQTTCLI_FRONTEND_ROOT:-$PROJECT_ROOT/frontend}"
export MQTTCLI_WEB_DB_HOST="${MQTTCLI_WEB_DB_HOST:-$DB_HOST}"
export MQTTCLI_WEB_DB_USER="${MQTTCLI_WEB_DB_USER:-$DB_USER}"
export MQTTCLI_WEB_DB_PASSWORD="${MQTTCLI_WEB_DB_PASSWORD:-$DB_PASSWORD}"
export MQTTCLI_WEB_DB_NAME="${MQTTCLI_WEB_DB_NAME:-$DB_NAME}"
export MQTTCLI_WEB_DB_PORT="${MQTTCLI_WEB_DB_PORT:-$DB_PORT}"

pids=()

write_bridge_definition() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to generate $BRIDGE_DEFINITION from .env." >&2
    exit 1
  fi

  mkdir -p "$(dirname -- "$BRIDGE_DEFINITION")"

  export BRIDGE_DEFINITION
  export TTN_USERNAME TTN_PASSWORD TTN_CLIENT_ID TTN_HOST TTN_PORT TTN_TOPIC
  export LOCAL_BRIDGE_CLIENT_ID LOCAL_MQTT_HOST LOCAL_MQTT_PORT

  python3 - <<'PY'
import json
import os
from pathlib import Path


def env(name, default=""):
    return os.environ.get(name, default)


def env_int(name, default):
    value = os.environ.get(name)
    return int(value) if value else default


bridge_definition = {
    "bridges": [
        {
            "brokers": [
                {
                    "disabled": False,
                    "mqtt": {
                        "clean_session": True,
                        "client_id": env("TTN_CLIENT_ID"),
                        "keep_alive": 60,
                        "loop_prevention": False,
                        "password": env("TTN_PASSWORD"),
                        "username": env("TTN_USERNAME"),
                        "will_message": "",
                        "will_qos": 0,
                        "will_retain": False,
                        "will_topic": "",
                    },
                    "network": {
                        "encryption": "tls",
                        "in": {
                            "host": env("TTN_HOST"),
                            "port": env_int("TTN_PORT", 8883),
                        },
                        "instance_name": "ttn-mqtts",
                        "protocol": "in",
                        "transport": "stream",
                    },
                    "prefix": "",
                    "session_store": "",
                    "topics": [
                        {
                            "qos": 0,
                            "topic": env("TTN_TOPIC"),
                        }
                    ],
                },
                {
                    "disabled": False,
                    "mqtt": {
                        "clean_session": True,
                        "client_id": env("LOCAL_BRIDGE_CLIENT_ID"),
                        "keep_alive": 60,
                        "loop_prevention": False,
                        "password": "",
                        "username": "",
                        "will_message": "",
                        "will_qos": 0,
                        "will_retain": False,
                        "will_topic": "",
                    },
                    "network": {
                        "encryption": "legacy",
                        "in": {
                            "host": env("LOCAL_MQTT_HOST"),
                            "port": env_int("LOCAL_MQTT_PORT", 1883),
                        },
                        "instance_name": "local-mqtt",
                        "protocol": "in",
                        "transport": "stream",
                    },
                    "prefix": "",
                    "session_store": "",
                    "topics": [
                        {
                            "qos": 0,
                            "topic": "#",
                        }
                    ],
                },
            ],
            "disabled": False,
            "name": "ttn-to-local",
            "prefix": "",
        }
    ]
}

Path(env("BRIDGE_DEFINITION")).write_text(json.dumps(bridge_definition, indent=4) + "\n")
PY
}

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
write_bridge_definition

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
  session --client-id "$MQTTCLI_CLIENT_ID" \
  db --database "$DB_NAME" \
     --username "$DB_USER" \
     --password "$DB_PASSWORD" \
     --host "$DB_HOST" \
     --port "$DB_PORT" \
  sub --topic "$MQTTCLI_SUB_TOPIC" &
pids+=("$!")
if dashboard_enabled; then
  wait_for_port_listening "$MQTTCLI_DASHBOARD_PORT" "mqttcli dashboard"
fi

echo "All processes started. Press Ctrl+C to stop."

wait
