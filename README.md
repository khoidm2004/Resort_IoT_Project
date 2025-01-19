# IoT Security System using Flipper Zero and Raspberry Pi Pico W

## Project Description

This project uses **Flipper Zero** as a sensor to scan RF frequency to detect abnormal signals. At the same time, Flipper Zero is also used to replace the door key through **RFID** and **NFC**.

**Raspberry Pi Pico W** will act as a gateway, receiving data from Flipper Zero via **UART/I2C**, analyzing data and sending it to the backend via Wi-Fi. If any suspicious RF signal is detected, Pico W will send an alert to the backend for further processing.

The backend will receive data from Pico W, store it in the database and display it on the dashboard. If any abnormal RF signal is detected, the backend will send an alert to the user.

## Main Features

1. **Scan RF frequency to detect abnormal signals**

   - Use Flipper Zero to scan RF frequency (300MHz - 900MHz).
   - Send data (frequency, signal strength, time) to Raspberry Pi Pico W via UART/I2C.
   - Raspberry Pi Pico W analyzes the signal and detects abnormalities.

2. **Send data to the server via Wi-Fi**

   - Use **MQTT or HTTP** protocol to send data to the server.
   - If a suspicious RF signal is detected, send an alert immediately.

3. **Replace door key with Flipper Zero**

   - Use Flipper Zero to read/send RFID and NFC signals.
   - Verify the signal before unlocking the door.

## Technologies Used

- **Flipper Zero**: Use **MicroPython** to program RF, NFC, RFID communication.
- **Raspberry Pi Pico W**: Use **MicroPython**, support UART/I2C to receive data from Flipper Zero and Wi-Fi to send data to the server.
- **Backend**: Node.js (not described in this document).
- **Database**: InfluxDB (not described in this document).

## System Architecture

```
Flipper Zero  --->  Raspberry Pi Pico W  --->  Backend (Server)
     RF Scan         UART/I2C              Wi-Fi (MQTT/HTTP)
     NFC/RFID       Signal Processing      Data Storage & Alerts
```

```
Pico W: GP16 (TX)  <-->  Flipper Zero: RX
        GP17 (RX)  <-->  Flipper Zero: TX
        GND        <-->  Flipper Zero: GND
```

## Deployment Steps

1. **Program Flipper Zero** to:

   - Scan RF, RFID, NFC.
   - Send data via UART/I2C to Pico W.

2. **Program Raspberry Pi Pico W** to:

   - Receive data from Flipper Zero.
   - Analyze data, detect abnormalities.
   - Send data to the server via Wi-Fi.

3. **Integrate Backend** to:

   - Receive data from Pico W.
   - Display information and alerts when abnormal RF signals are detected.

## Usage Instructions

1. **Connect Flipper Zero to Raspberry Pi Pico W** via UART/I2C.
2. **Run the MicroPython script on Flipper Zero** to scan RF/NFC/RFID.
3. **Run the script on Raspberry Pi Pico W** to analyze data and send it to the server.
4. **Check the Backend** to view collected data and security alerts.

---

## Next Steps

- **Program MicroPython** for Flipper Zero and Pico W to perform the above functions.