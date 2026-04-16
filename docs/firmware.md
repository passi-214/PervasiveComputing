# Firmware

## Project Setup

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