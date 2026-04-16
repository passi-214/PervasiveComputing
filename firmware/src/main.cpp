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