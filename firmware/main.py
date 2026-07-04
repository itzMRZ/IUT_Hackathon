import network
import time
import json
import machine
from machine import Pin, UART
import uwebsockets.client

WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASS = "YOUR_WIFI_PASSWORD"
WEBSOCKET_ENDPOINT = "ws://192.168.1.100:8080/ws" # Change to your backend IP/port

POWER_CHANGE_THRESHOLD = 5.0 # Send update if power changes by more than 5 Watts

light_1 = Pin(27, Pin.OUT, value=1)
light_2 = Pin(26, Pin.OUT, value=1)
light_3 = Pin(25, Pin.OUT, value=1)
fan_1   = Pin(24, Pin.OUT, value=1)
fan_2   = Pin(22, Pin.OUT, value=1)

pzem_uart = UART(0, baudrate=9600, tx=Pin(0), rx=Pin(1), timeout=100)

DEVICE_MAP = {
    "light1": light_1,
    "light2": light_2,
    "light3": light_3,
    "fan1": fan_1,
    "fan2": fan_2
}

current_state = {
    "power": 0.0,
    "light1": False,
    "light2": False,
    "light3": False,
    "fan1": False,
    "fan2": False
}

last_sent_state = current_state.copy()

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def connect_wifi():
    """Connects to the specified Wi-Fi network."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print(f"Connecting to {WIFI_SSID}...")
        wlan.connect(WIFI_SSID, WIFI_PASS)
        while not wlan.isconnected():
            time.sleep(1)
            print(".", end="")
    print("\nWi-Fi Connected!")
    print("IP Address:", wlan.ifconfig()[0])

def read_pzem_power():
    """
    Sends a Modbus RTU request to PZEM-004T to read Active Power.
    Registers 0x0003 and 0x0004 hold the power data.
    """
    req = bytes([0x01, 0x04, 0x00, 0x03, 0x00, 0x02, 0x81, 0xCB])
    pzem_uart.write(req)
    
    time.sleep(0.1) # Wait for response
    
    if pzem_uart.any():
        response = pzem_uart.read()
        if response and len(response) == 9 and response[0] == 0x01:
            raw_power = (response[3] << 24) | (response[4] << 16) | (response[5] << 8) | response[6]
            power_watts = raw_power * 0.1
            return power_watts
    
    return current_state["power"]

def read_device_states():
    """Reads current physical pin states and converts active-low (0) to boolean True (ON)."""
    current_state["light1"] = not bool(light_1.value())
    current_state["light2"] = not bool(light_2.value())
    current_state["light3"] = not bool(light_3.value())
    current_state["fan1"]   = not bool(fan_1.value())
    current_state["fan2"]   = not bool(fan_2.value())

def check_for_events():
    """Evaluates if a significant event occurred."""
    event_triggered = False
    
    # 1. Check device states
    for key in ["light1", "light2", "light3", "fan1", "fan2"]:
        if current_state[key] != last_sent_state[key]:
            event_triggered = True
            break
            
    # 2. Check power threshold
    if abs(current_state["power"] - last_sent_state["power"]) >= POWER_CHANGE_THRESHOLD:
        event_triggered = True
        
    return event_triggered

# ==========================================
# MAIN LOOP
# ==========================================
def main():
    connect_wifi()
    
    websocket = None
    
    # Connection Loop
    while websocket is None:
        try:
            print(f"Connecting to WebSocket: {WEBSOCKET_ENDPOINT}")
            websocket = uwebsockets.client.connect(WEBSOCKET_ENDPOINT)
            # Make the underlying socket non-blocking so recv() doesn't freeze the loop
            websocket.sock.setblocking(False) 
            print("WebSocket connected successfully!")
        except Exception as e:
            print(f"Failed to connect to WebSocket: {e}")
            print("Retrying in 5 seconds...")
            time.sleep(5)

    # Operational Loop
    while True:
        try:
            # ==========================================
            # 1. RECEIVE & PROCESS INCOMING COMMANDS
            # ==========================================
            try:
                incoming_data = websocket.recv()
                if incoming_data:
                    # Expecting JSON like: {"light1": true}
                    command = json.loads(incoming_data)
                    print("Received command:", command)
                    
                    for device_key, turn_on in command.items():
                        if device_key in DEVICE_MAP:
                            # Relay is Active Low: True (Turn ON) = 0, False (Turn OFF) = 1
                            pin_value = 0 if turn_on else 1
                            DEVICE_MAP[device_key].value(pin_value)
                            print(f"-> Set {device_key} to {'ON' if turn_on else 'OFF'}")
                            
            except OSError:
                # This is normal. A non-blocking socket throws an OSError (EAGAIN) when empty.
                pass
            except ValueError as e:
                print(f"Received invalid JSON: {e}")
            
            # ==========================================
            # 2. SENSE & SEND OUTGOING DATA
            # ==========================================
            current_state["power"] = read_pzem_power()
            read_device_states()
            
            if check_for_events():
                payload = json.dumps(current_state)
                websocket.send(payload)
                print("Event Triggered! Sent:", payload)
                
                global last_sent_state
                last_sent_state = current_state.copy()
            
            # Reduced sleep time makes the Pico more responsive to incoming commands
            time.sleep(0.1) 
            
        except Exception as e:
            print(f"Critical error in main loop: {e}")
            # If the websocket drops, a reboot or reconnection logic should be triggered here
            time.sleep(2)

if __name__ == "__main__":
    main()
