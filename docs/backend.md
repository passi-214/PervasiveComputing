# Backend Setup

## SSH and Update

```zsh
ssh <user>@<backend-ip>
sudo apt update
sudo apt -y upgrade
sudo timedatectl set-ntp true
hostname
hostname -I
```

## Git and build tools

```zsh
sudo apt install -y git build-essential cmake pkg-config
```

## MariaDB server

```zsh
sudo apt install -y mariadb-server mariadb-client
sudo systemctl enable --now mariadb
sudo systemctl status mariadb --no-pager
```

### Install

```zsh
sudo mariadb-secure-installation
```

## MariaDB development headers

```zsh
sudo apt install -y libmariadb-dev
```

## Create database and tables

Open MariaDB
```zsh
sudo mariadb
```

Create tables
```SQL
CREATE DATABASE max;
CREATE USER 'max'@'localhost' IDENTIFIED BY 'm00st3rm4nn';
GRANT ALL PRIVILEGES ON max.* TO 'max'@'localhost';
FLUSH PRIVILEGES;

USE max;

CREATE TABLE devices (
  device_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE measurements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(64) NOT NULL,
  ts TIMESTAMP NOT NULL,
  lat DOUBLE NULL,
  lon DOUBLE NULL,
  temp_c DOUBLE NULL,
  tds_ppm DOUBLE NULL,
  turb_ntu DOUBLE NULL,
  raw_json JSON NULL,
  FOREIGN KEY (device_id) REFERENCES devices(device_id)
);
```

Test
```SQL
INSERT INTO devices(device_id, name) VALUES ('dev1', 'Test Device');

INSERT INTO measurements(device_id, ts, temp_c)
VALUES ('dev1', NOW(), 21.5);

SELECT * FROM measurements;
```

## Clone backend code / SNode.C code

### Install dependencies
```zsh
sudo apt update
sudo apt install -y git cmake make ninja-build g++ clang pkg-config
sudo apt install -y iwyu clang-format cmake-format doxygen
sudo apt install -y libssl-dev nlohmann-json3-dev
sudo apt install -y libbluetooth-dev libmagic-dev libmariadb-dev
```

### Install SNode.C

Took around 50 min in our case.
```zsh
mkdir -p ~/src/snodec
cd ~/src/snodec
git clone https://github.com/SNodeC/snode.c.git
mkdir build
cd build
cmake ../snode.c
make -j"$(nproc)"
sudo make install
sudo ldconfig
sudo groupadd --system snodec || true
sudo usermod -a -G snodec $USER
```

### Build small backend to test

Project folder
```zsh
mkdir -p ~/src/backend-ping
cd ~/src/backend-ping
mkdir src build
```

Install nvim for editor
```zsh
sudo apt install -y neovim
```

`src/main.cpp`
```cpp
#include <express/legacy/in/WebApp.h>
#include <log/Logger.h>

int main(int argc, char* argv[]) {
    express::WebApp::init(argc, argv);

    using LegacyWebApp = express::legacy::in::WebApp;
    using SocketAddress = LegacyWebApp::SocketAddress;

    LegacyWebApp app;

    app.get("/", [] APPLICATION(req, res) {
        res->send("backend alive\n");
    });

    app.get("/api/ping", [] APPLICATION(req, res) {
        res->send("pong\n");
    });

    app.listen(8080, [](const SocketAddress& socketAddress, const core::socket::State& state) -> void {
        switch (state) {
            case core::socket::State::OK:
                VLOG(1) << "Listening on " << socketAddress.toString();
                break;
            case core::socket::State::DISABLED:
                LOG(WARNING) << "Server disabled";
                break;
            case core::socket::State::ERROR:
                LOG(ERROR) << "Non-critical listen error";
                break;
            case core::socket::State::FATAL:
                LOG(FATAL) << "Critical listen error";
                break;
        }
    });

    return express::WebApp::start();
}
```

CMakeLists.txt
```
cmake_minimum_required(VERSION 3.16)
project(backend_ping LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(snodec REQUIRED COMPONENTS
    http-server-express-legacy-in
)

add_executable(backend_ping
    src/main.cpp
)

target_link_libraries(backend_ping PRIVATE
    snodec::http-server-express-legacy-in
)
```

Build it
```zsh
cd ~/src/backend-ping/build
cmake ..
make -j"$(nproc)"
```

Run
```zsh
./backend_ping
```

Test
```zsh
curl -i http://127.0.0.1:8080/
curl -i http://127.0.0.1:8080/api/ping
```