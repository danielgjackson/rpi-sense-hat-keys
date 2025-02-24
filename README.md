# rpi-sense-hat-keys

Node module for reading the Raspberry Pi Sense HAT Keys (5-way joystick).

<!--

Buster (32-bit times):

```
         1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32
<Buffer 50 ee b9 67 53 ee 02 00 01 00 6c 00 01 00 00 00 50 ee b9 67 53 ee 02 00 00 00 00 00 00 00 00 00>
        ^timeS^^^^^ ^timeUS^^^^ ^type ^code ^value
```

Bookworm (64-bit times):

```
         1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48
<Buffer b1 b6 b9 67 00 00 00 00 e3 c5 04 00 00 00 00 00 01 00 6c 00 01 00 00 00 b1 b6 b9 67 00 00 00 00 e3 c5 04 00 00 00 00 00 00 00 00 00 00 00 00 00>
        ^timeS^^^^^^^^^^^^^^^^^ ^timeUS^^^^^^^^^^^^^^^^ ^type ^code ^value
```

-->
