# Firmware

## ESP32 Setup

Created PlatformIO project in /firmware with following command:

```zsh
platformio project init -d firmware -b nodemcu-32s
```

### Test Setup

Let ChatGPT write a short test script to let the LED from the ESP32 blink.

```cpp
#include <Arduino.h>

// Most ESP32 dev boards (including NodeMCU-32S) have the LED on GPIO 2
#define LED_PIN 2

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // LED on
  delay(100);

  digitalWrite(LED_PIN, LOW);  // LED off
  delay(100);
}
```

## Raspberry Pi 4 Model B Setup

1. Download & Install Raspberry Pi Imager
2. Raspberry Pi OS (64bit)
3. Select Boot Device
4. Hostname, Password
5. WiFi Connection
6. Enable SSH with password
7. Write on Micro SD-Card
8. Insert into Raspberry Pi