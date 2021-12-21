/*------------------------------------------------------------------------
  Example sketch for Adafruit Thermal Printer library for Arduino.
  Demonstrates a few text styles & layouts, bitmap printing, etc.

  IMPORTANT: DECLARATIONS DIFFER FROM PRIOR VERSIONS OF THIS LIBRARY.
  This is to support newer & more board types, especially ones that don't
  support SoftwareSerial (e.g. Arduino Due).  You can pass any Stream
  (e.g. Serial1) to the printer constructor.  See notes below.
  ------------------------------------------------------------------------*/

#include "Adafruit_Thermal.h"
#include "adalogo.h"
#include "adaqrcode.h"
#include "doggo.h"

// Here's the new syntax when using SoftwareSerial (e.g. Arduino Uno) ----
// If using hardware serial instead, comment out or remove these lines:

#include "SoftwareSerial.h"
#define TX_PIN 6 // Arduino transmit  YELLOW WIRE  labeled RX on printer
#define RX_PIN 5 // Arduino receive   GREEN WIRE   labeled TX on printer

SoftwareSerial mySerial(RX_PIN, TX_PIN); // Declare SoftwareSerial obj first
Adafruit_Thermal printer(&mySerial);     // Pass addr to printer constructor
// Then see setup() function regarding serial & printer begin() calls.

// Here's the syntax for hardware serial (e.g. Arduino Due) --------------
// Un-comment the following line if using hardware serial:

//Adafruit_Thermal printer(&Serial1);      // Or Serial2, Serial3, etc.

// -----------------------------------------------------------------------


uint8_t imgbuf[512];

uint8_t buf[108];

int buf_s, buf_n, buf_max;


void setup() {

  // This line is for compatibility with the Adafruit IotP project pack,
  // which uses pin 7 as a spare grounding point.  You only need this if
  // wired up the same way (w/3-pin header into pins 5/6/7):
  pinMode(7, OUTPUT); digitalWrite(7, LOW);

  // NOTE: SOME PRINTERS NEED 9600 BAUD instead of 19200, check test page.
  //mySerial.begin(19200);  // Initialize SoftwareSerial
  mySerial.begin(9600);  // Initialize SoftwareSerial
  printer.begin();        // Init printer (same regardless of serial type)

  Serial.begin(115200);
  Serial.print("$ ");

  buf_s = 0;
  buf_n = 0;
  buf_max = 104;
}

void test_print() {

  // This line is for compatibility with the Adafruit IotP project pack,
  // which uses pin 7 as a spare grounding point.  You only need this if
  // wired up the same way (w/3-pin header into pins 5/6/7):
  pinMode(7, OUTPUT); digitalWrite(7, LOW);

  // NOTE: SOME PRINTERS NEED 9600 BAUD instead of 19200, check test page.
  //mySerial.begin(19200);  // Initialize SoftwareSerial
  mySerial.begin(9600);  // Initialize SoftwareSerial
  //Serial1.begin(19200); // Use this instead if using hardware serial
  printer.begin();        // Init printer (same regardless of serial type)


  // The following calls are in setup(), but don't *need* to be.  Use them
  // anywhere!  They're just here so they run one time and are not printed
  // over and over (which would happen if they were in loop() instead).
  // Some functions will feed a line when called, this is normal.

  // Font options
  printer.setFont('B');
  printer.println("FontB");
  printer.println("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  printer.setFont('A');
  printer.println("FontA (default)");
  printer.println("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  // Test inverse on & off
  printer.inverseOn();
  printer.println(F("Inverse ON"));
  printer.inverseOff();

  // Test character double-height on & off
  printer.doubleHeightOn();
  printer.println(F("Double Height ON"));
  printer.doubleHeightOff();

  // Set text justification (right, center, left) -- accepts 'L', 'C', 'R'
  printer.justify('R');
  printer.println(F("Right justified"));
  printer.justify('C');
  printer.println(F("Center justified"));
  printer.justify('L');
  printer.println(F("Left justified"));

  // Test more styles
  printer.boldOn();
  printer.println(F("Bold text"));
  printer.boldOff();

  printer.underlineOn();
  printer.println(F("Underlined text"));
  printer.underlineOff();

  printer.setSize('L');        // Set type size, accepts 'S', 'M', 'L'
  printer.println(F("Large"));
  printer.setSize('M');
  printer.println(F("Medium"));
  printer.setSize('S');
  printer.println(F("Small"));

  printer.justify('C');
  printer.println(F("normal\nline\nspacing"));
  printer.setLineHeight(50);
  printer.println(F("Taller\nline\nspacing"));
  printer.setLineHeight(); // Reset to default
  printer.justify('L');

  // Barcode examples:
  // CODE39 is the most common alphanumeric barcode:
  printer.printBarcode("ADAFRUT", CODE39);
  printer.setBarcodeHeight(100);
  // Print UPC line on product barcodes:
  printer.printBarcode("123456789123", UPC_A);

  // Print the 75x75 pixel logo in adalogo.h:
//  printer.printBitmap(adalogo_width, adalogo_height, adalogo_data);

  // Print the 135x135 pixel QR code in adaqrcode.h:
//  printer.printBitmap(adaqrcode_width, adaqrcode_height, adaqrcode_data);
  printer.println(F("Adafruit!"));
  printer.feed(2);

  printer.sleep();      // Tell printer to sleep
  delay(3000L);         // Sleep for 3 seconds
  printer.wake();       // MUST wake() before printing again, even if reset
  printer.setDefault(); // Restore printer to defaults
}

void _pend() {
  printer.feed(2);

  printer.sleep();      // Tell printer to sleep
  delay(1000L);         // Sleep for 1 seconds
  printer.wake();       // MUST wake() before printing again, even if reset
  printer.setDefault(); // Restore printer to defaults
}

void print_adafruit_logo() {
  // Print the 75x75 pixel logo in adalogo.h:
  printer.printBitmap(adalogo_width, adalogo_height, adalogo_data);
  _pend();
}

void print_adafruit_logo2() {
  int h2 = adalogo_height/2;
  int w = (adalogo_width+7)/8;
  int s = w*h2;

  int _hp = adalogo_height%2;
  
  // Print the 75x75 pixel logo in adalogo.h:
  printer.printBitmap(adalogo_width, h2, adalogo_data);
  printer.printBitmap(adalogo_width, h2 + _hp, adalogo_data + s);
  _pend();
}


void print_adafruit_qr() {
  // Print the 135x135 pixel QR code in adaqrcode.h:
  printer.printBitmap(adaqrcode_width, adaqrcode_height, adaqrcode_data);
  _pend();
}

void print_doggo() {
  printer.printBitmap(doggo_img_width, doggo_img_height, doggo_img);
  _pend();
}

void print_doggo2() {
  
  // assume widht exact mutliple of 8?
  //
  int h = doggo_img_width/8;

  // need floor to function properly
  //
  h *= doggo_img_height/2;

  int _h_parity = doggo_img_height%2;

  Serial.println("w,h,offset");
  Serial.println(doggo_img_width);
  Serial.println(doggo_img_height);
  Serial.println(h);
  
  printer.printBitmap(doggo_img_width, doggo_img_height/2, doggo_img);
  //printer.printBitmap(doggo_img_width, doggo_img_height/2, doggo_img + (doggo_img_width*doggo_img_height/16));
  printer.printBitmap(doggo_img_width, doggo_img_height/2 + _h_parity, doggo_img + h);
  _pend();
}

void img_line(unsigned char *buf, int n) {
  int s=0, i=0, len=0, eo=0, idx=0;
  unsigned char ch, u;
  unsigned int v;

  /*
  for (i=0; (i<n); i++) {
    if (buf[i] == ':') {
      buf[i] = '\0';
      break;
    }
  }
  if (i==n) { return; }
  */

  /*
  for (i=0; i<512; i++) {
    imgbuf[i] = (uint8_t)0xff;
  }
  printer.printBitmap(64,32, (const uint8_t *)imgbuf, false);
  */

  //for (i=0; i<10; i++) { printer.printBitmap(100, 1, (const uint8_t *)imgbuf);  }
  //return;

  Serial.println(":::");
  Serial.print(n);
  Serial.print(" :: ");
//  Serial.write(buf, n);
  Serial.println(":::");

  for (i=0; i<(384/8); i++) { imgbuf[i] = 0xff; }
  printer.printBitmap(384, 1, (const uint8_t *)imgbuf, false);
  return;

  for (i=0; i<n; i++) {
    ch = buf[i];
    if (ch==' ') { continue; }
    u=0;
    if ((ch>='0') &&
        (ch <='9')) {
      u = ch - '0';
    }
    else if ((ch>='a') &&
             (ch <='f')) {
      u = ch - 'a';
    }
    else if ((ch>='A') &&
             (ch <= 'F')) {
      u = ch - 'A';
    }

    v |= (u<<(4*eo));
    if (eo==1) {
      imgbuf[idx] = v;
      idx++;
      v=0;
      if (idx >= (384/8)) { break; }
    }
    eo = 1-eo;
    
  }

  Serial.println(idx);

  printer.printBitmap(idx, 1, (const uint8_t *)imgbuf, false);

}

void show_help() {
  Serial.println(" !      - adafruit logo");
  Serial.println(" @      - adafruit qr");
  Serial.println(" #      - test image");
  Serial.println(" >...   - image data (ascii hex)");
  Serial.println(" h      - help (this screen)");
}

void loop() {
  int ch_count = 0, ch_max = buf_max;
  char ch;
  char buf[108];
  while ((ch_count < ch_max) && (Serial.available() > 0)) {
    ch = Serial.read();
    buf[buf_n] = ch;
    buf_n++;
    if (buf_n>=buf_max) { break; }
  }
  if ((buf_n >= buf_max) ||
      ((buf_n > 0) && (buf[buf_n-1] == '\n')) ||
      ((buf_n > 0) && (buf[buf_n-1] == '\r')) ||
      ((buf_n > 0) && (buf[buf_n-1] == '\f')) ||
      ((buf_n > 0) && (buf[buf_n-1] == '.'))) {

    //for (int i=0; i<buf_n; i++) { Serial.println(int(buf[i])); }

    while (buf_n > 0) {
      if ((buf[buf_n-1] == '\n') ||
          (buf[buf_n-1] == '\f') ||
          (buf[buf_n-1] == '\r')) {
        buf_n--;
        continue;
      }
      break;
    }


    if (buf[0] == '!') {
      print_adafruit_logo();
    }
    else if (buf[0] == '@') {
      print_adafruit_qr();
    }
    else if (buf[0] == '#') {
      print_adafruit_logo2();
    }
    else if (buf[0] == '&') {
      print_doggo();
    }
    else if (buf[0] == '_') {
      print_doggo2();
    }
    else if (buf[0] == 'h') {
      show_help();
    }
    else if (buf[0] == '>') {
      img_line((unsigned char *)(buf+1), buf_n-1);
    }
    else if (buf[0] == 'e') {
      _pend();
    }
    
    buf_n = 0;
    buf_s = 0;
    Serial.print("\r\nok\r\n$ ");
    
  }
}
