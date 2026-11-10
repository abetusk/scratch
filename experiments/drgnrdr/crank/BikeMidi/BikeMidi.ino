#include <MIDIUSB.h>

/*
 *
Wiring (Pro Micro or Leonardo)

  Reed switch:

    One leg to pin 7
    Other leg to GND
    The internal pull-up handles the rest.

  Hall sensor (e.g. A3144): this needs the 5V Pro Micro.

    VCC to VCC (5V)
    GND to GND
    OUT to pin 7
    The A3144 output is open-collector and active-low, so the internal pull-up works.

  Long leads from the bike: add a 10k resistor from pin 7 to VCC and a 100nF
  capacitor from pin 7 to GND to reject noise. This adds about 1 ms of filtering,
  which doesn’t matter here.

*/

const uint8_t  SENSOR_PIN  = 7;
const uint32_t DEBOUNCE_US = 3000;   // input must be stable this long
const uint8_t  MIDI_CH     = 0;      // channel 1
const uint8_t  NOTE        = 60;

bool stableState = HIGH;
bool lastRaw     = HIGH;
uint32_t lastChangeUs = 0;

bool debug_led_state = HIGH;

void sendPulse() {
  digitalWrite(LED_BUILTIN_RX, debug_led_state);
  debug_led_state = !debug_led_state;

  midiEventPacket_t on  = {0x09, uint8_t(0x90 | MIDI_CH), NOTE, 127};
  midiEventPacket_t off = {0x08, uint8_t(0x80 | MIDI_CH), NOTE, 0};
  MidiUSB.sendMIDI(on);
  MidiUSB.sendMIDI(off);
  MidiUSB.flush();
}

void setup() {
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  pinMode(LED_BUILTIN_RX, OUTPUT);
}

void loop() {
  bool raw = digitalRead(SENSOR_PIN);
  uint32_t now = micros();

  if (raw != lastRaw) {
    lastRaw = raw;
    lastChangeUs = now;
  } else if (raw != stableState && (now - lastChangeUs) >= DEBOUNCE_US) {
    stableState = raw;
    if (stableState == LOW) sendPulse();   // magnet arrived
  }
}
