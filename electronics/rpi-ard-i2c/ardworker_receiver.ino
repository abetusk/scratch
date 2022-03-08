// This example code is in the public domain.
//


#include <Wire.h>

#define MSG_BUF_MAX 128

int count=0;
int msg_buf_n = 0;
char msg_buf[MSG_BUF_MAX];

int send_msg_ready = 0, send_msg_buf_n=0;
char send_msg_buf[MSG_BUF_MAX];

int serial_buf_s=0, serial_buf_n=0;
char serial_buf[MSG_BUF_MAX];


unsigned long _t[3];

void setup() {
  count=0;
  msg_buf[0] = '\0';
  msg_buf_n = 0;
  send_msg_ready = 0;

  _t[0] = 0;
  _t[1] = 0;
  _t[2] = 0;

  serial_buf_s=0;
  serial_buf_n=0;
  serial_buf[0] = '\0';
  
  Wire.begin(8);                // join i2c bus with address #8
  Wire.onReceive(receiveEvent); // register event
  Wire.onRequest(sendData);
  Serial.begin(115200);           // start serial for output
}



void loop() {
  int i, _b, _cur;
  char _msg[] = "meowmeowmeowmeow\n";

  if (Serial.available()) {
    _b = Serial.read();
    _cur = (serial_buf_s + serial_buf_n) % MSG_BUF_MAX;
    serial_buf[_cur] = _b;
    serial_buf_n++;
  }

  return;
  


  _t[0]++;
  if (_t[0]==0) {
    _t[1]++;
    if (_t[1]==0) {
      _t[2]++;
    }
  }


  if ((_t[0] > 100000)) { // && (_t[1]==0)) {
    //Serial.println("bang");
    _t[0] = 0;
    

    if (send_msg_ready == 0) {
      Serial.println("??");
      //count++;
      //if (count > 11) {
        count=0;

        for (i=0; _msg[i]; i++) {
          _cur = (serial_buf_s + serial_buf_n)  % MSG_BUF_MAX;
          serial_buf[_cur] = _msg[i];
          serial_buf_n++;
        }
        
        //send_msg_ready = 1;
        //for (i=0; _msg[i]; i++) { send_msg_buf[i] = _msg[i]; }
        //send_msg_buf[i] = '\0';
        //send_msg_buf_n=0;
      //}
    }
  }

  //whoops! causes dropped bits in i2c send from arduino->rpi
  //delay(100);
}


void sendData() {
  int i=0, res;

  if (serial_buf_n > 0) {
    res = Wire.write(serial_buf[serial_buf_s]);
    serial_buf_s++;
    serial_buf_n--;
    serial_buf_s %= MSG_BUF_MAX;
  }
  return;

//  Wire.write("meow\n");
//  return;

  if (send_msg_ready) {
    res = Wire.write(send_msg_buf[send_msg_buf_n]);
    //Serial.print(res); Serial.print(" ");
    if (send_msg_buf[send_msg_buf_n] == '\n') { send_msg_ready=0; }
    send_msg_buf_n++;
    //send_msg_ready=0;
  }
  else {
    Wire.write(0);
  }
  
  
  return;

  while (1) { //Wire.available()) {
    if (send_msg_buf[send_msg_buf_n] == 0) {
      send_msg_ready = 0;
    }
    if (send_msg_ready==0) { Wire.write(0); return; }
  
    Wire.write(send_msg_buf[send_msg_buf_n]);

    send_msg_buf_n++;

    return;
  }  

}

// function that executes whenever data is received from master
// this function is registered as an event, see setup()
void receiveEvent(int howMany) {
  
  while ( Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character

    msg_buf[msg_buf_n++] = c;

    if ((c == '\n') || (c == '\r')) {
      Serial.print("> ");
      Serial.print(msg_buf);
      
      msg_buf[0] = '\0';
      msg_buf_n=0;
    
    }
    //Serial.print(c);         // print the character
    //Serial.print(" ");
  }
  //int x = Wire.read();    // receive byte as an integer
  //Serial.println(x);         // print the integer
}
