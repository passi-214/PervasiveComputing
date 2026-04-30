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
TTN_USERNAME="${TTN_USERNAME:-}"
TTN_TOPIC="${TTN_TOPIC:-}"

if [[ -z "$TTN_TOPIC" && -n "$TTN_USERNAME" ]]; then
  TTN_TOPIC="v3/$TTN_USERNAME/devices/+/up"
fi

if [[ -z "$TTN_TOPIC" ]]; then
  echo "Missing TTN_TOPIC. Set TTN_USERNAME or TTN_TOPIC in .env." >&2
  exit 1
fi

mqttcli in-mqtt --disabled=false \
  remote --host 127.0.0.1 --port 1883 \
  session --client-id "mqttcli-db" \
  db --database "$DB_NAME" \
     --username "$DB_USER" \
     --password "$DB_PASSWORD" \
     --host "$DB_HOST" \
     --port "$DB_PORT" \
  sub --topic "$TTN_TOPIC"
