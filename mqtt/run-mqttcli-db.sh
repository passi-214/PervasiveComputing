#!/usr/bin/env bash
mqttcli in-mqtt --disabled=false \
  remote --host 127.0.0.1 --port 1883 \
  session --client-id "mqttcli-db" \
  db --database "max" \
     --username "root" \
     --password "m00st3rm4nn" \
     --host "127.0.0.1" \
     --port 3306 \
  sub --topic "v3/maxmustermann@ttn/devices/+/up"
