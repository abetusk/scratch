#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <unistd.h>
#include <time.h>
#include <sys/time.h>

#include <linux/i2c-dev.h>
#include <i2c/smbus.h>

#include <errno.h>

long long int get_usec_time() {
  struct timeval tv;

  // Get the number of seconds (and remainder microseconds) since epoch.
  //
  gettimeofday(&tv,NULL);

  // Return those in a single sane 64 bit integer containing the total number 
  // of microseconds since epoch by multiplying tv_sec by a million and summing 
  // the two values
  //
  return (long long int)tv.tv_usec + (1000000 * (long long int)tv.tv_sec);
}



int main(int argc, char **argv) {
  int fd, adapter_nr, ch;
  char fn[32];
  int worker_addr = 0x08;

  FILE *msg_fp;
  char msg_fn[] = "msg/msg.txt";
  char *msg_buf=NULL;
  int msg_buf_n=0;

  struct timespec _sleepy, _sleepy_rem;
  //struct timeval tv_s, tv_e, tv_c;
  long long int _t_start, _t_del, _t_cur;

  int i;
  __u8 to_msg[] = "hello, friend\n";
  __u8 from_block[128];

  __u8 reg = 0x10;
  __s32 res;
  char buf[10];

  msg_buf = malloc(sizeof(char)*1024);

  // 1000000000 ns in 1 sec
  _sleepy.tv_sec = 0;
  _sleepy.tv_nsec = 1000000;

  _t_del = 1000000;

  adapter_nr = 1;
  snprintf(fn, 31, "/dev/i2c-%i", adapter_nr);
  fd = open(fn, O_RDWR);
  if (fd<0) {
    perror(fn);
    exit(-1);
  }

  if (ioctl(fd, I2C_SLAVE, worker_addr) < 0) {
    perror(fn);
    exit(-2);
  }

  /*
  if (ioctl(fd, I2C_PEC, 1) < 0) {
    perror("failed PEC");
    exit(-2);
  }
  */

  _t_start = get_usec_time();

  while (1) {

    // for debugging, process message file
    //
    msg_fp = fopen(msg_fn, "r");
    if (msg_fp) {
      msg_buf_n = 0;
      while (!feof(msg_fp)) {
        ch = fgetc(msg_fp);
        if (ch == EOF) { continue; }
        msg_buf[msg_buf_n++] = ch;
      }
      msg_buf[msg_buf_n] = '\0';
      msg_buf_n++;
      fclose(msg_fp);
      unlink(msg_fn);

      printf("processing[%i]: '%s'\n", msg_buf_n, msg_buf);
    }

    /*
    _t_cur = get_usec_time();
    if ( (_t_cur - _t_start) > _t_del) {
      _t_start = _t_cur;

      for (i=0; to_msg[i]; i++) {
        res = i2c_smbus_write_byte(fd, to_msg[i]);
        //printf("sent %c, got %i\n", to_msg[i], res);
      }
      printf("> '%s'\n", to_msg);
    }
    */

    if (msg_buf_n > 0) {

      for (i=0; msg_buf[i]; i++) {
        res = i2c_smbus_write_byte(fd, msg_buf[i]);
      }
      printf("> '%s'\n", msg_buf);
      msg_buf_n=0;
    }

    from_block[0] = '\0';
    for (i=0; i<127; i++) {
      res = i2c_smbus_read_byte(fd);
      //printf("  %c (%i)\n", res, res);
      if (res<0) { perror(".."); break; }
      if (res > 255) { printf("!! %i\n", res); }
      from_block[i] = res;
      if (res==0) { break; }
    }
    from_block[i] = '\0';
    if (i>0) {
      printf("< '%s'\n", from_block);
    }
    //res = i2c_smbus_read_block_data(fd, 32, from_block);

    //res = i2c_smbus_read_word_data(fd, reg);
    if (res<0) {
      perror("read failed");
    }
    else {
      //printf("got: %i\n", res);
      //for (i=0; i<from_block[i]; i++) { printf(" %c(%i)", from_block[i], from_block[i]); }
      //if (i>0) { printf("\n"); }
    }

    //sleep(1);
    nanosleep(&_sleepy, &_sleepy_rem);

  }

  close(fd);
}
