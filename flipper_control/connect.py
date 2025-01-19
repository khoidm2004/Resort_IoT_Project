import serial
import time

# Connect to port UART of Flipper Zero
ser = serial.Serial('/dev/ttyS3', 9600)  # 9600 baudrate
time.sleep(2)  # Delay for stablizing the connection

# Send data or command to Flipper Zero
ser.write(b'Hello Flipper!')

# receive data from Flipper Zero
while ser.in_waiting > 0:
    data = ser.readline()
    print(f"Received: {data.decode('utf-8')}")
    
ser.close()
