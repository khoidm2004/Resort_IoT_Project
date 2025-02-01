import network
import urequests
import machine
import time

LED_PIN = 17 
led = machine.Pin(LED_PIN, machine.Pin.OUT)

SSID = "connection" # name of a Wi-Fi network
PASSWORD = "@@@@1234" # wifi password

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    pass  

print("Connected to WiFi")

def control_led():
    url = "?"
    
    try:
        response = urequests.get(url)
        data = response.json()
        response.close()
        
        if "status" in data:
            if data["status"] == "on":
                led.value(1)  
                print("LED ON")
            else:
                led.value(0)  
                print("LED OFF")
        else:
            print("not found")

    except Exception:
        print("error")

while True:
    control_led()
    time.sleep(0.1)  
