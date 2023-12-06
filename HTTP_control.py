import os
import ipaddress
import wifi
import socketpool
import json
import microcontroller
import time
import board
import pwmio
import digitalio
import busio
import terminalio
from adafruit_motor import servo
from adafruit_httpserver.server import HTTPServer
from adafruit_httpserver.request import HTTPRequest
from adafruit_httpserver.response import HTTPResponse
from adafruit_httpserver.methods import HTTPMethod
from adafruit_httpserver.mime_type import MIMEType

print("Connecting to WiFi")

# Static IP and Connect to WiFi

ipv4 =  ipaddress.IPv4Address("<>") # <> for laptop and <> for iphone
netmask =  ipaddress.IPv4Address("<>") 
gateway =  ipaddress.IPv4Address("<>") # <> for laptop and <> for iphone
wifi.radio.set_ipv4_address(ipv4=ipv4,netmask=netmask,gateway=gateway)
#  connect to your SSID
print(os.getenv('CIRCUITPY_WIFI_SSID'))
wifi.radio.connect(os.getenv('CIRCUITPY_WIFI_SSID'), os.getenv('CIRCUITPY_WIFI_PASSWORD'))

print("Connected to WiFi")
pool = socketpool.SocketPool(wifi.radio)
server = HTTPServer(pool)

# Initialize Servo Motors
index = servo.Servo(pwmio.PWMOut(board.GP2, duty_cycle=2 ** 15, frequency=50))
thumb = servo.Servo(pwmio.PWMOut(board.GP3, duty_cycle=2 ** 15, frequency=50))
elbow = servo.Servo(pwmio.PWMOut(board.GP22, duty_cycle=2 ** 15, frequency=50))

def webpage():
    html = f"""
<!DOCTYPE html>
<html lang="en">                
    <head>
        <meta charset="UTF-8">
        <title>CPEN291 Group 13</title>
    </head>
    <body>
        <button onclick="Rock()">Rock</button>
        <script>
            function Rock() {{ <!-- Only need to describe the JS function once -->
                fetch('/move-servos', {{ <!-- name of the server route to use -->
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json'
                    }},
                    body: JSON.stringify({{'anglein': 0, 'angleth': 0}}) <!-- array of values, can be empty -->
                }})
            }}
        </script>
        
        <button onclick="Paper()">Paper</button>
        <script>
            function Paper() {{
                fetch('/move-servos', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json'
                    }},
                    body: JSON.stringify({{'anglein': 180, 'angleth': 180}})
                }})
            }}
        </script>
        
        <button onclick="Scissors()">Scissors</button>
        <script>
            function Scissors() {{
                fetch('/move-servos', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json'
                    }},
                    body: JSON.stringify({{'anglein': 180, 'angleth': 0}})
                }})
            }}
        </script>
        
        <button onclick="Rock(),Paper(),Scissors()">Rock Paper Scissors</button> <!-- possible to have buttons perform multiple moves -->
    </body>
</html>
    """
    return html

#  server routing and POST Requests
@server.route("/")
def base(request: HTTPRequest):  # pylint: disable=unused-argument
    #  serve the HTML f string
    #  with content type text/html
    with HTTPResponse(request, content_type=MIMEType.TYPE_HTML) as response:
        response.send(f"{webpage()}")

@server.route("/move-servos", HTTPMethod.POST)
def move_servos(request: HTTPRequest):
    try:
        data = json.loads(request.body)
        for i in range (0,2):
            elbow.angle = 180
            time.sleep(0.25)
            elbow.angle = 90
            time.sleep(0.25)
        elbow.angle = 180
        time.sleep(0.2)
        anglein = data['anglein']
        angleth = data['angleth']
        index.angle = anglein #index middle
        thumb.angle = angleth # thumb ring pinky
        response = {'success': True, 'message': 'Servos moved successfully'}
    except:
        response = {'success': False, 'message': 'Error moving servos'}
    with HTTPResponse(request) as response_sent:
        response_sent.send(json.dumps(response))

print("starting server..")
# startup the server

try:
    server.start(str(wifi.radio.ipv4_address))
    print("Listening on http://%s:80" % wifi.radio.ipv4_address)
#  if the server fails to begin, restart the pico w
except OSError:
    time.sleep(5)
    print("restarting..")
    microcontroller.reset()
ping_address = ipaddress.ip_address("<>")

while True:
    server.poll()
