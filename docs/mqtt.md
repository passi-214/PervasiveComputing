# MQTT

Install mosquitto clients
```zsh
sudo apt install mosquitto-clients
```

Test listening to MQTT messages from TTN
```zsh
mosquitto_sub -h eu1.cloud.thethings.network -p 8883 \
-u maxmustermann@ttn -P <api-key> \
-t "v3/maxmustermann@ttn/devices/+/up" \
--capath /etc/ssl/certs -v
```

Install necessary dependency
```zsh
sudo apt update
sudo apt install libfmt-dev
```

Follow documented install of github repo
```zsh
mkdir mqttsuite
cd mqttsuite
git clone --recurse-submodules https://github.com/SNodeC/mqttsuite.git
mkdir build
cd build
cmake ../mqttsuite        # optionally: -G Ninja -DCMAKE_BUILD_TYPE=Release
make -j"$(nproc)"         # or: ninja
sudo make install         # or: sudo ninja install
sudo ldconfig
```

Bridge config
```json
{
    "bridges": [
        {
            "brokers": [
                {
                    "disabled": false,
                    "mqtt": {
                        "clean_session": true,
                        "client_id": "bridge-ttn-test",
                        "keep_alive": 60,
                        "loop_prevention": false,
                        "password": "NNSXS.4NTL24EM5RGKU5J2YW54VONSRL2ODRSIW2CXL7A.V5UBH3PNSQ6YNJFSQZCJ6RSQHVLLCB3W5TX6XHJL5EEWLIRBAGNQ",
                        "username": "maxmustermann@ttn",
                        "will_message": "",
                        "will_qos": 0,
                        "will_retain": false,
                        "will_topic": ""
                    },
                    "network": {
                        "encryption": "tls",
                        "in": {
                            "host": "eu1.cloud.thethings.network",
                            "port": 8883
                        },
                        "instance_name": "ttn-mqtts",
                        "protocol": "in",
                        "transport": "stream"
                    },
                    "prefix": "",
                    "session_store": "",
                    "topics": [
                        {
                            "qos": 0,
                            "topic": "v3/maxmustermann@ttn/devices/+/up"
                        }
                    ]
                },
                {
                    "disabled": false,
                    "mqtt": {
                        "clean_session": true,
                        "client_id": "bridge-local",
                        "keep_alive": 60,
                        "loop_prevention": false,
                        "password": "",
                        "username": "",
                        "will_message": "",
                        "will_qos": 0,
                        "will_retain": false,
                        "will_topic": ""
                    },
                    "network": {
                        "encryption": "legacy",
                        "in": {
                            "host": "127.0.0.1",
                            "port": 1883
                        },
                        "instance_name": "local-mqtt",
                        "protocol": "in",
                        "transport": "stream"
                    },
                    "prefix": "",
                    "session_store": "",
                    "topics": [
                        {
                            "qos": 0,
                            "topic": "#"
                        }
                    ]
                }
            ],
            "disabled": false,
            "name": "ttn-to-local",
            "prefix": ""
        }
    ]
}
```

Start local broker
```zsh
mqttbroker in-mqtt --disabled=false
```

Start bridge with config in another terminal
```zsh
mqttbridge bridge --definition ~/src/PervasiveComputing/mqtt/ttn-bridge.json
```

Make start script with credentials
```sh
#!/usr/bin/env bash
mqttcli in-mqtt --disabled=false \
  remote --host 127.0.0.1 --port 1883 \
  session --client-id "mqttcli-db" \
  db --database "max" \
     --username "root" \
     --password "<password>" \
     --host "127.0.0.1" \
     --port 3306 \
  sub --topic "v3/maxmustermann@ttn/devices/+/up"
```

Permission
```zsh
chmod +x run-mqttcli-db.sh
```

Run MQTT CLI
```zsh
./run-mqttcli-db.sh
```
