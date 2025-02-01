import time
import network
import urequests as requests
import machine
import dht

class wifimanager:
    def __init__(self, ssid, password):
        self.ssid = ssid
        self.password = password
        self.wlan = network.WLAN(network.STA_IF)

    def connect(self):
        self.wlan.active(True)
        self.wlan.connect(self.ssid, self.password)
        print("\nConnected to WiFi")

class Temp_vs_Hum_sensor:
    def __init__(self, sensor_pin, led_pin: str, base_url, tem_endpoint, hum_endpoint):
        self.sensor = dht.DHT11(machine.Pin(sensor_pin))
        self.led = machine.Pin(led_pin, machine.Pin.OUT)
        self.base_url = base_url
        self.tem_endpoint = tem_endpoint
        self.hum_endpoint = hum_endpoint

    def send_data(self, endpoint, data_type, value: float):
        url = f"{self.base_url}{endpoint}?{data_type}={value}"
        try:
            response = requests.get(url)
            response.close()
            print(f"Sent {data_type}: {value}")
        except Exception:
            print(f"Error sending {data_type}")

    def read_and_send(self):
        try:
            self.sensor.measure()
            temp = self.sensor.temperature()
            humidity = self.sensor.humidity()

            print(f"Temperature: {temp} °C")
            print(f"Humidity: {humidity} %")

            self.led.on()
            self.send_data(self.tem_endpoint, "temperature", temp)
            self.send_data(self.hum_endpoint, "humidity", humidity)
            self.led.off()
        except Exception:
            print("Error sending sensor data")

class LEDController:
    def __init__(self, led_pin: int, control_url: str):
        self.led = machine.Pin(led_pin, machine.Pin.OUT)
        self.control_url = control_url

    def control_led(self):
        try:
            response = requests.get(self.control_url)
            data = response.json()
            response.close()

            if "status" in data:
                if data["status"] == "on":
                    self.led.value(1)
                    print("LED ON")
                else:
                    self.led.value(0)
                    print("LED OFF")
            else:
                print("Not found")

        except Exception:
            print("Error fetching LED status")

def main():
    SSID = "connection"       # SSID of your WiFi
    PASSWORD = "@@@@1234"     # Password of your WiFi
    BASE_URL = "?"            # Base URL of your API
    DATA_ENDPOINT_TEM = "?"   # Endpoint for temperature data
    DATA_ENDPOINT_HUM = "?"   # Endpoint for humidity data
    CONTROL_URL = "?"         # URL to control the LED
    
    wifi = wifimanager(SSID, PASSWORD)
    wifi.connect()
    
    sensor = Temp_vs_Hum_sensor(sensor_pin=0, led_pin="LED", base_url=BASE_URL, tem_endpoint=DATA_ENDPOINT_TEM, hum_endpoint=DATA_ENDPOINT_HUM)
    
    led_controller = LEDController(led_pin=17, control_url=CONTROL_URL)

    while True:
        sensor.read_and_send()
        led_controller.control_led()
        time.sleep(0.1)  

if __name__ == "__main__":
    main()
