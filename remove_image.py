import os
import msvcrt
import time
import shutil
from PIL import Image
import pickle
import numpy as np 
import requests

url = "http://<>/prediction"

filename = 'rock_paper_scissors.jpg'

# Get the path to the downloads directory
downloads_dir = os.path.expanduser('~/Downloads')

# Join the downloads directory path with the file name to create the file path
frompath = os.path.join(downloads_dir, filename)

topath = os.path.join(os.getcwd(), filename)
user_input = ""
out="0"
finalpath = os.path.join(os.getcwd(),"rps.jpg" )

print("Press 'q' to quit")
while user_input.lower() != 'q': #the file will running until q is pressed at an time
    
    if os.path.exists(frompath):
        if os.path.exists(topath):
            os.remove(topath)
    #remove the old file
        time.sleep(2) #wait for it to be finished processed
        shutil.move(frompath, topath)
        i = Image.open("rock_paper_scissors.jpg")
        img_resized = i.resize((150, 150))
        
        # Save the resized image
        img_resized.save("rps.jpg")
        print("file saved, run prediction now")

        model = pickle.load(open("img_model.p" , 'rb')) #load the model 

        CATEGORIES = ['paper' , 'rock' , 'scissors']
        flat_data=[]
        img=np.array(Image.open('rps.jpg')) #adjust the image to the required format for the machine learning model
        flat_data.append(img.flatten())
        flat_data = np.array(flat_data)
        y_out = model.predict(flat_data)  #do the predictions
        y_out = CATEGORIES[y_out[0]]
        print(y_out)
        print(type(y_out))
        if(y_out == "paper"): #simplify the output to 0,1,2 which is easier to sent to vm
            out=0
        elif(y_out == "rock"):
            out=1
        elif(y_out == "scissors"):
            out=2

        payload = {      #this is the payload that sent to VM
        "Predictions": out
        }
        
        
        response = requests.post(url, json=payload)

        if response.status_code == 200: #check if it is recieved correctly or not
            print('Message sent successfully')
        else:
            print(f'Error sending message: {response.status_code}')
    #update the userkey for loop to exit

    if msvcrt.kbhit(): 
        user_input = msvcrt.getch().decode('utf-8') #update the user_input if needed
    
    