# MQTT

Install mosquitto clients
```zsh
sudo apt install mosquitto-clients
```

Test listening to MQTT messages from TTN
```zsh
mosquitto_sub -h eu1.cloud.thethings.network -p 8883 \
-u <application>@ttn -P <api-key> \
-t "v3/<application>@ttn/devices/+/up" \
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

Configure credentials
```zsh
cp .env.example .env
nano .env
```

The `.env` file is ignored by git. At minimum, fill in:
```sh
DB_PASSWORD=<mariadb-password>
TTN_USERNAME=<application>@ttn
TTN_PASSWORD=<ttn-api-key>
```

Quote values that contain spaces, `#`, `$`, or other shell-special characters.

`./mqtt/run-all.sh` generates the runtime bridge config at `mqtt/.runtime/ttn-bridge.json`.
That generated file contains the TTN API key and must not be committed.

Permission, once after cloning
```zsh
chmod +x mqtt/run-all.sh mqtt/run-mqttcli-db.sh
```

Start broker, bridge, DB subscriber, and dashboard
```zsh
./mqtt/run-all.sh
```
