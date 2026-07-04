# Smart Office Monitoring Dashboard

A real-time office monitoring dashboard that tracks 15 devices (2 fans + 3 lights × 3 rooms) with a live WebSocket simulation, an interactive floor plan, manual controls, preset demo scenarios, and Discord notifications.



## Features

-  Real-time monitoring of 15 devices across 3 rooms (2 fans + 3 lights each)
-  Live updates via WebSocket
-  Interactive floor plan view
-  Manual device controls
-  Preset demo scenarios
-  Discord notifications


## Architecture

<img width="4055" height="1220" alt="archi" src="https://github.com/user-attachments/assets/7eb7e692-73f1-47f6-9ae3-3f064dfeba11" />



## Hardware Requirements

- Raspberry Pi Pico W
- 6-Channel Relay Module
- PZEM-004T Energy Monitoring Module
- Jumper wires
- Appropriate AC wiring for lights/fans (mains voltage)

---

## Setup

### 1. Schematics

![](https://github.com/user-attachments/assets/199cdf00-77a5-492c-86e1-7d38cadf5e87)


#### Relay Module Wiring

| Pico W        | 6-Channel Relay |
| ------------- | ---------------- |
| VBUS (Pin 40) | VCC               |
| GND           | GND               |
| GP27          | IN1 (Light 1)     |
| GP26          | IN2 (Light 2)     |
| GP25          | IN3 (Light 3)     |
| GP24          | IN4 (Fan 1)       |
| GP22          | IN5 (Fan 2)       |

#### PZEM-004T Wiring

| Pico W        | PZEM-004T |
| ------------- | --------- |
| VBUS (Pin 40) | VCC       |
| GND           | GND       |
| GP0           | RX        |
| GP1           | TX        |

> ** Safety Warning:** The relays and PZEM-004T interact with high-voltage AC mains. Ensure all connections are completely disconnected from the wall before wiring, and keep the exposed bottom of the relay board isolated.

### 2. Flash MicroPython

This project is written in MicroPython. You must flash your Raspberry Pi Pico W with the latest MicroPython firmware first.

Find the UF2 file and flashing instructions [here](https://micropython.org/download/RPI_PICO_W/).

After flashing, disconnect and reconnect the board via USB.

### 3. Clone the Repository

```bash
git clone https://github.com/itzMRZ/IUT_Hackathon.git
cd IUT_Hackathon
```

### 4. Install Firmware on the Board

Ensure your board is connected via USB, edit `main.py` to add your Wi-Fi credentials and WebSocket endpoint, then run:

```bash
python flasher.py
```

<!--
TODO: paste the actual flasher.py content/behavior here once shared —
the bullet list below is a placeholder based on the earlier draft and
needs to be verified against the real script.
-->

The flasher will automatically:
* Check for and install `mpremote` on your computer
* Use `mip` to install the required `uwebsockets` package onto the Pico W
* Copy `main.py` to the board

---

## Dashboard Deployment

For instructions on deploying the dashboard itself, see [`Deployment.md`](./Deployment.md).

