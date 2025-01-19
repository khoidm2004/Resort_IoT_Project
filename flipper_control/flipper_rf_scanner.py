from machine import UART
import subghz
import time

#config UART
uart = UART(1, baudrate=9600, tx=17, rx=16)

# Scan RF and send data to Raspberry Pi Pico W via UART
def scan_rf():
    while True:
        # Scan RF signal
        result = subghz.receive()
        if result:
            freq, rssi = result['freq'], result['rssi']
            # Send RF data to Raspberry Pi Pico W via UART
            data = f"{freq},{rssi}\n"
            uart.write(data)
            print(f"Send RF: {data}")
        time.sleep(1)  # Delay 1s for save energy

if __name__ == "__main__":
    scan_rf()