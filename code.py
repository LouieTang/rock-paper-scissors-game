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
import ssl
import adafruit_requests
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
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RPS AI</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
    <div class="container" id="header">
        <div class="col">
            <div class="row">
                <h1>Rock Paper Scissors Robot</h1>
            </div>
            <div class="row">
                <p>Please allow permissions to begin</p>
            </div>
        </div>
    </div>
    <div class="container" id="body">
        <div class="row">
            <div class="col">
                <button id="start-camera">Start Camera</button>
                <video id="video" width="320" height="240" autoplay></video>
                <button id="click-photo">Click Photo</button>
                <canvas id="canvas" width="320" height="240"></canvas>
            </div>
            <div class="col">
                <div class="row"> <!--Manually testing rock paper scissors, will be used to test individual components of project. This is to test the algorithm we would like to implement for a high percentage robot win rate (basted off previous plays). End game resets the previous plays, so the robot can change it's strategy from player to player.-->
                    <button id="rock">Rock</button>
                    <button id="paper">Paper</button>
                    <button id="scissors">Scissors</button>
                    <button id="reset">reset</button>
                </div>
                <div class="row">
                    <h1 id="output"></h1> <!--Currently a placeholder, it's purpose is to be the output for what the robot plays. Links to client.js for the output-->
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <h1 id="stats"></h1>
    </div>
    <div class="container" id="footer">
        <div class="row"><!--Copyrights-->
            <p>Copyright ©2023 Group 13</p>
        </div>
    </div>
    <script type="text/javascript" src="client.js"></script>
    <script type="text/javascript" src="server.js"></script>
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
        for i in range (0,2): #windup before playing move
            elbow.angle = 180
            time.sleep(0.25)
            elbow.angle = 90
            time.sleep(0.25)
        elbow.angle = 180
        time.sleep(0.2)
        anglein = data['anglein'] #takes JSON data and sets it to local data
        angleth = data['angleth']
        index.angle = anglein # sets motor angle to local data for index and middle
        thumb.angle = angleth # same for thumb ring pinky
        response = {'success': True, 'message': 'Servos moved successfully'}
    except:
        response = {'success': False, 'message': 'Error moving servos'}
    with HTTPResponse(request) as response_sent:
        response_sent.send(json.dumps(response))


print("starting server..")
# startup the server

try:
    server.start(str(wifi.radio.ipv4_address),port = 80)
    print("Listening on http://%s:80" % wifi.radio.ipv4_address)
#  if the server fails to begin, restart the pico w
except OSError:
    time.sleep(5)
    print("restarting..")
    microcontroller.reset()
ping_address = ipaddress.ip_address("<>")

while True:
    server.poll()




#pool = socketpool.SocketPool(wifi.radio)
#requests = adafruit_requests.Session(pool, ssl.create_default_context())

#url = "http://<>/reset"
#response = requests.get(url)
#print(response.text)
