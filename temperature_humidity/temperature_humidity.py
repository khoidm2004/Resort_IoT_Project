import time
import urequests as requests
from machine import Pin
import dht
import network

# Wi-Fi Details
SSID = "connection" # name of a Wi-Fi network
PASSWORD = "@@@@1234" # password of Wifi-network

# REST API Details
BASE_URL = "?"
DATA_ENDPOINT_TEM = "?"
DATA_ENDPOINT_HUM = "?"
DEBUG = True

SENSOR = dht.DHT11(Pin(0)) 
LED = Pin("LED", Pin.OUT)  

def connect_wifi(ssid: str, password: str) -> network.WLAN:
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while not wlan.isconnected():
        print(".", end="")
        time.sleep(0.5)
    return wlan

def send_tem(endpoint: str, data_type: str, value: float) -> None:
    url = f"{BASE_URL}{endpoint}?{data_type}={value}"
    try:
        response = requests.get(url)
        response.close()
        print(f"Sent {data_type}: {value}")
    except Exception :
        print(f"Error sending data")
        
def send_hum(endpoint: str, data_type: str, value: float) -> None:
    url = f"{BASE_URL}{endpoint}?{data_type}={value}"
    try:
        response = requests.get(url)
        response.close()
        print(f"Sent {data_type}: {value}")
    except Exception :
        print(f"Error sending data")

def main() -> None:
    print("Program starting.")

    while True:
        try:
            SENSOR.measure()
            temp = SENSOR.temperature()
            humidity = SENSOR.humidity()

            print(f"Temperature: {temp} °C")
            print(f"Humidity: {humidity} %")

            LED.on()
            send_tem(DATA_ENDPOINT_TEM, "temperature", temp)
            send_hum(DATA_ENDPOINT_HUM, "humidity", humidity)
            LED.off()

            time.sleep(10)  
        except Exception :
            print("Error")
            time.sleep(5)  

if __name__ == "__main__":
    main()
