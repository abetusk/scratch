EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:special
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
EELAYER 27 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title ""
Date "30 nov 2013"
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
Text Label 150 -1300 0 40 ~ 0
v3.3
$Comp
L ATTINY13-P IC1
U 1 1 5213C820
P -2200 -1650
F 0 "IC1" H -2100 -1600 60 
F 1 "ATTINY13-P" H -900 -2400 60 
        1    -2200 -1650
        1    0    0    -1  
$EndComp
$Comp
L VCC #PWR1
U 1 1 5213C820
P -300 -1800
F 0 "#PWR1" H -300 -1700 30 
F 1 "VCC" H -300 -1700 30 
        1    -300 -1800
        1    0    0    -1  
$EndComp
Wire Wire Line
      -400 -1550 -300 -1550
Wire Wire Line
      -300 -1550 -300 -1800
$Comp
L ~GND #PWR2
U 1 1 5213C820
P -300 -900
F 0 "#PWR2" H -300 -900 30 
F 1 "~GND" H -300 -970 30 
        1    -300 -900
        1    0    0    -1  
$EndComp
Wire Wire Line
      -400 -1050 -300 -1050
Wire Wire Line
      -300 -1050 -300 -900
$Comp
L C C1
U 1 1 5213C820
P 50 -2200
F 0 "C1" H 50 -2100 40 
F 1 "C" H 56 -2285 40 
        1    50   -2200
        1    0    0    -1  
$EndComp
Wire Wire Line
      2400 -1300 2400 -1350
Wire Wire Line
      1900 -1300 2400 -1300
Connection ~ 1900 -1300
$Comp
L VCC #PWR4
U 1 1 5213C820
P 50 -2550
F 0 "#PWR4" H 50 -2450 30 
F 1 "VCC" H 50 -2450 30 
        1    50   -2550
        1    0    0    -1  
$EndComp
Wire Wire Line
      50 -2550 50 -2400
$Comp
L ~GND #PWR5
U 1 1 5213C820
P 50 -1850
F 0 "#PWR5" H 50 -1850 30 
F 1 "~GND" H 50 -1920 30 
        1    50   -1850
        1    0    0    -1  
$EndComp
Wire Wire Line
      50 -2000 50 -1850
$Comp
L VCC #PWR15
U 1 1 5213C820
P 2400 -1350
F 0 "#PWR15" H 2400 -1250 30 
F 1 "VCC" H 2400 -1250 30 
        1    2400 -1350
        1    0    0    -1  
$EndComp
Text Label 1550 -750 0 40 ~ 0
fb
Wire Wire Line
      1550 -750 1900 -750
Connection ~ 1900 -750
Wire Wire Line
      1900 -800 1900 -700
Wire Wire Line
      1650 -1300 1900 -1300
Wire Wire Line
      -2400 -1150 -2650 -1150
Text Label -2650 -1150 2 40 ~ 0
sense
Wire Wire Line
      -2400 -1550 -2650 -1550
Text Label -2650 -1550 2 40 ~ 0
light_pwm
$Comp
L NPN Q1
U 1 1 5213C820
P -3400 -1650
F 0 "Q1" H -3400 -1800 50 
F 1 "NPN" H -3400 -1500 50 
        1    -3400 -1650
        1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 5213C820
P -3300 -1100
F 0 "R1" V -3220 -1100 40 
F 1 "R" V -3293 -1099 40 
        1    -3300 -1100
        1    0    0    -1  
$EndComp
$Comp
L CONN_2 P2
U 1 1 5213C820
P -2950 -2100
F 0 "P2" V -3000 -2100 40 
F 1 "palm_led" V -2900 -2100 40 
        1    -2950 -2100
        1    0    0    -1  
$EndComp
$Comp
L VCC #PWR7
U 1 1 5213C820
P -3300 -2350
F 0 "#PWR7" H -3300 -2250 30 
F 1 "VCC" H -3300 -2250 30 
        1    -3300 -2350
        1    0    0    -1  
$EndComp
Wire Wire Line
      -3300 -2000 -3300 -1850
Wire Wire Line
      -3300 -1450 -3300 -1350
Wire Wire Line
      -3300 -2350 -3300 -2200
$Comp
L ~GND #PWR8
U 1 1 5213C820
P -3300 -750
F 0 "#PWR8" H -3300 -750 30 
F 1 "~GND" H -3300 -820 30 
        1    -3300 -750
        1    0    0    -1  
$EndComp
Wire Wire Line
      -3300 -850 -3300 -750
Wire Wire Line
      -3600 -1650 -3750 -1650
Text Label -3750 -1650 2 40 ~ 0
light_pwm
NoConn ~ -2400 -1050
$Comp
L VCC #PWR9
U 1 1 5213C820
P -2200 -2600
F 0 "#PWR9" H -2200 -2500 30 
F 1 "VCC" H -2200 -2500 30 
        1    -2200 -2600
        1    0    0    -1  
$EndComp
Wire Wire Line
      -2200 -2600 -2200 -2500
$Comp
L ~GND #PWR10
U 1 1 5213C820
P -2200 -2200
F 0 "#PWR10" H -2200 -2200 30 
F 1 "~GND" H -2200 -2270 30 
        1    -2200 -2200
        1    0    0    -1  
$EndComp
Wire Wire Line
      -2200 -2300 -2200 -2200
Wire Wire Line
      -2200 -2400 -2300 -2400
Text Label -2300 -2400 2 40 ~ 0
sense
Wire Wire Line
      1100 -1050 1100 -1300
Wire Wire Line
      600 -2150 500 -2150
Wire Wire Line
      500 -2150 500 -2300
$Comp
L ~GND #PWR11
U 1 1 5213C820
P 500 -1800
F 0 "#PWR11" H 500 -1800 30 
F 1 "~GND" H 500 -1870 30 
        1    500  -1800
        1    0    0    -1  
$EndComp
Wire Wire Line
      500 -1800 500 -1950
Wire Wire Line
      500 -1950 600 -1950
Text Label 500 -2300 0 40 ~ 0
v3.3
NoConn ~ -2400 -1450
NoConn ~ -2400 -1350
NoConn ~ -2400 -1250
$Comp
L CONN_3 K2
U 1 1 5213C820
P -1850 -2400
F 0 "K2" V -1900 -2400 50 
F 1 "sense_pot" V -1800 -2400 40 
        1    -1850 -2400
        1    0    0    -1  
$EndComp
$Comp
L ~CONN_1 P3
U 1 1 5213C820
P -850 -3050
F 0 "P3" H -770 -3050 40 
F 1 "~CONN_1" H -850 -2995 30 
        1    -850 -3050
        1    0    0    -1  
$EndComp
$Comp
L ~CONN_1 P4
U 1 1 5213C820
P -850 -2900
F 0 "P4" H -770 -2900 40 
F 1 "~CONN_1" H -850 -2845 30 
        1    -850 -2900
        1    0    0    -1  
$EndComp
$Comp
L ~CONN_1 P5
U 1 1 5213C820
P -850 -2750
F 0 "P5" H -770 -2750 40 
F 1 "~CONN_1" H -850 -2695 30 
        1    -850 -2750
        1    0    0    -1  
$EndComp
$Comp
L ~CONN_1 P6
U 1 1 5213C820
P -850 -2600
F 0 "P6" H -770 -2600 40 
F 1 "~CONN_1" H -850 -2545 30 
        1    -850 -2600
        1    0    0    -1  
$EndComp
NoConn ~ -1000 -2600
NoConn ~ -1000 -2750
NoConn ~ -1000 -2900
NoConn ~ -1000 -3050
$Comp
L DIODE D2
U 1 1 5213C820
P 1450 -1300
F 0 "D1" H 1450 -1200 40 
F 1 "DIODE" H 1450 -1400 40 
        1    1450 -1300
        1    0    0    -1  
$EndComp
$Comp
L R R3
U 1 1 5213C820
P 1900 -450
F 0 "R3" V 1980 -450 40 
F 1 "R" V 1907 -449 40 
        1    1900 -450
        1    0    0    -1  
$EndComp
$Comp
L INDUCTOR L1
U 1 1 5213C820
P 650 -1300
F 0 "L1" V 600 -1300 40 
F 1 "INDUCTOR" V 750 -1300 40 
        1    650  -1300
        0    -1   -1   0   
$EndComp
$Comp
L C C2
U 1 1 5213C820
P 2400 -950
F 0 "C2" H 2400 -850 40 
F 1 "1uF" H 2450 -1050 40 
        1    2400 -950
        1    0    0    -1  
$EndComp
$Comp
L R R2
U 1 1 5213C820
P 1900 -1050
F 0 "R2" V 1980 -1050 40 
F 1 "R" V 1907 -1049 40 
        1    1900 -1050
        1    0    0    -1  
$EndComp
$Comp
L IC_FAN5331-SOT-23-5_SOT-23-5 U3
U 1 1 5213C820
P 1100 -50
F 0 "U3" H 1100 -50 0 
F 1 "IC_FAN5331-SOT-23-5_SOT-23-5" H 1100 -50 0 
        1    1100 -50 
        1    0    0    -1  
$EndComp
$Comp
L C C3
U 1 1 5213C820
P 250 -850
F 0 "C3" H 250 -750 40 
F 1 "1uF" H 256 -935 40 
        1    250  -850
        1    0    0    -1  
$EndComp
Wire Wire Line
      1250 -1300 950 -1300
Wire Wire Line
      1900 -200 1900 -100
Wire Wire Line
      150 -1300 350 -1300
$Comp
L ~GND #PWR14
U 1 1 5213C820
P 1900 -100
F 0 "#PWR14" H 1900 -100 30 
F 1 "~GND" H 1900 -170 30 
        1    1900 -100
        1    0    0    -1  
$EndComp
$Comp
L ~GND #PWR16
U 1 1 5213C820
P 250 -500
F 0 "#PWR16" H 250 -500 30 
F 1 "~GND" H 250 -570 30 
        1    250  -500
        1    0    0    -1  
$EndComp
Wire Wire Line
      250 -650 250 -500
Connection ~ 250 -1300
Wire Wire Line
      250 -1050 250 -1300
Connection ~ 2400 -1300
Wire Wire Line
      2400 -1150 2400 -1300
$Comp
L ~GND #PWR17
U 1 1 5213C820
P 2400 -650
F 0 "#PWR17" H 2400 -650 30 
F 1 "~GND" H 2400 -720 30 
        1    2400 -650
        1    0    0    -1  
$EndComp
Wire Wire Line
      2400 -750 2400 -650
Text Label 1500 -150 0 40 ~ 0
v3.3
$Comp
L ~GND #PWR18
U 1 1 5213C820
P 1600 150
F 0 "#PWR18" H 1600 150 30 
F 1 "~GND" H 1600 80 30 
        1    1600 150 
        1    0    0    -1  
$EndComp
Wire Wire Line
      1500 50 1600 50
Wire Wire Line
      1600 50 1600 150
$Comp
L ~GND #PWR19
U 1 1 5213C820
P 450 50
F 0 "#PWR19" H 450 50 30 
F 1 "~GND" H 450 -20 30 
        1    450  50  
        1    0    0    -1  
$EndComp
Wire Wire Line
      450 50 450 -50
Wire Wire Line
      450 -50 700 -50
Text Label 700 50 2 40 ~ 0
fb
Text Label 700 -150 2 40 ~ 0
sw
Text Label 1100 -1050 0 40 ~ 0
sw
Connection ~ 1100 -1300
$Comp
L CONN_2 P1
U 1 1 5213C820
P 950 -2050
F 0 "P1" V 900 -2050 40 
F 1 "pwr" V 1000 -2050 40 
        1    950  -2050
        1    0    0    -1  
$EndComp
$EndSCHEMATC
