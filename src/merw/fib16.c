#include <stdio.h>
#include <stdlib.h>

#include <stdint.h>

void printbin16(uint64_t u) {
  uint64_t i;

  for (i=0; i<16; i++) {
    printf("%c", ( u & (((uint64_t)1)<<i) ) ? '1' : '0' );
  }
  printf("\n");

}

int main(int argc, char **argv) {
  uint64_t i;

  for (i=0; i<65536; i++) {
    printbin16(i);
  }
}
