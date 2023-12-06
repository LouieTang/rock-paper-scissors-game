# P2_L2B_G13
Libraries require to install: 
pip install Pillow numpy requests scikit-learn


Wireless Pico

- The pico doesn't like starting different servers, so to start a server at a different connection, save the new settings and ipv4 addrs, then unplug and replug the pico.

- You can only connect to the website if you are on the same network, such as connected to the exact same wifi hotspot


Website
- Currently need to add http://cpen291-13.ece.ubc.ca/ to this list for the camera to work chrome://flags/#unsafely-treat-insecure-origin-as-secure
- Doesnt seem to be able to request for camera permissions on FireFox


In order to run
- Run the remove_image.py using python remove_image.py in your IDE terminal. Make sure that the model is in the same folder as it.
- Visit http://cpen291-13.ece.ubc.ca/ after allowing origins as above
- turn on the camera and take a picture. If the server is online, then you will receive a response after approximately 15 seconds 
