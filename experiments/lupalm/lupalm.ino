/*
  Analog Input

  Demonstrates analog input by reading an analog sensor on analog pin 0 and
  turning on and off a light emitting diode(LED) connected to digital pin 13.
  The amount of time the LED will be on and off depends on the value obtained
  by analogRead().

  The circuit:
  - potentiometer
    center pin of the potentiometer to the analog input 0
    one side pin (either one) to ground
    the other side pin to +5V
  - LED
    anode (long leg) attached to digital output 13
    cathode (short leg) attached to ground

  - Note: because most Arduinos have a built-in LED attached to pin 13 on the
    board, the LED is optional.

  created by David Cuartielles
  modified 30 Aug 2011
  By Tom Igoe

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/AnalogInput
*/

int sensorPin = A0;    // select the input pin for the potentiometer
int ledPin = 9;      // select the pin for the LED
int sensorValue = 0;  // variable to store the value coming from the sensor

void setup() {
  // declare the ledPin as an OUTPUT:
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

// 58 139
//#define POT_MIN 58.0
//#define POT_MAX 139.0

#define POT_MIN 70.0
#define POT_MAX 120.0


//#define POT_MIN 70.0
//#define POT_MAX 843.0

int g_count = 0;

void loop() {
  float fval ;
  byte bval;
  // read the value from the sensor:
  sensorValue = analogRead(sensorPin);
  fval = (float)sensorValue / 1024.0;
  //fval *= fval;
  
  fval *= 255.0;

  g_count++;
  if (g_count > 50) {
    g_count=0;
    Serial.println(fval);
  }


  if (fval < POT_MIN) { fval = POT_MIN; }
  else if (fval > POT_MAX) { fval = POT_MAX; }
  //fval = 255.0*(fval - POT_MIN)/(POT_MAX - POT_MIN);
  fval = (fval - POT_MIN)/(POT_MAX - POT_MIN);
  fval = pow(fval, 0.65);
  fval *= 255.0;

  //Serial.println(fval);
  
  bval = (byte)fval;
  
  // turn the ledPin on
  //digitalWrite(ledPin, HIGH);
  analogWrite(ledPin, 255.0 - bval);
  
  // stop the program for <sensorValue> milliseconds:
  //delay(sensorValue);
  // turn the ledPin off:
//  digitalWrite(ledPin, LOW);
  // stop the program for for <sensorValue> milliseconds:
  //delay(sensorValue);

  delay(1);


  //Serial.println(fval);
}
