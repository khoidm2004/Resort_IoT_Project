import machine
import time
import network
import ubinascii
import socket
from machine import UART, I2C, Pin


# Connect UART between Flipper Zero and Raspberry Pi Pico W
uart = UART(1, baudrate=115200, tx=Pin(4), rx=Pin(5)) 

# Connect I2C 
i2c = I2C(0, scl=Pin(22), sda=Pin(21))

# Connect Wi-Fi
SSID = "hehe"
PASSWORD = "hehe"
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)
print("Wi-Fi Connected:", wlan.ifconfig())

# Server Backend
SERVER_IP = "B-E IP ADDRESS"
SERVER_PORT = 8080

def decode():
    pass

# Send warning to server
def send_alert(frequency, signal_strength):
    data = f"{{'frequency': {frequency}, 'signal_strength': {signal_strength}}}"
    addr = (SERVER_IP, SERVER_PORT)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.sendto(data.encode(), addr)
    s.close()

# Read data from Flipper Zero
def read_flipper_data():
    if uart.any():
        data = uart.readline().decode().strip()
        print("Received from Flipper Zero:", data)
        # Data example: "RF:433.92, Strength:-50"
        if data.startswith("RF:"):
            parts = data.split(", ")
            frequency = float(parts[0].split(":")[1])
            signal_strength = int(parts[1].split(":")[1])
            if signal_strength > -60:  # Signal warning range
                send_alert(frequency, signal_strength)

# Loop chính
while True:
    read_flipper_data()
    time.sleep(1)
