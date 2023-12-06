# SPDX-FileCopyrightText: 2018 Kattni Rembor for Adafruit Industries
#
# SPDX-License-Identifier: MIT
# Group number: 13
# Student Names: Evan Lai, Gurjas Singh Oberoi, Louie Tang, Zachary Tseng

"""CircuitPython Essentials Servo standard servo example"""
import time
import board
import pwmio
from adafruit_motor import servo
import digitalio
#import adafruit_matrixkeypad
import busio
import terminalio
import displayio
#from adafruit_display_text import label
#from adafruit_st7789 import ST7789


# create a PWMOut object on Pin A2.
pwm = pwmio.PWMOut(board.GP22, duty_cycle=2 ** 15, frequency=50) #Elbow, 180 is forward

pwm2 = pwmio.PWMOut(board.GP2, duty_cycle=2 ** 15, frequency=50) # Index Middle, 180 is slack

pwm3 = pwmio.PWMOut(board.GP3, duty_cycle=2 ** 15, frequency=50) #Thumb Ring Pinky, 180 is slack


# Create a servo object, my_servo.

elbow = servo.Servo(pwm)

index_middle = servo.Servo(pwm2)

thumb_ring_pinky = servo.Servo(pwm3)


def windup(): #this is the 2 up and down motions people make before they throw their move
    for i in range (0,2):
        elbow.angle = 180
        time.sleep(0.25)
        elbow.angle = 90
        time.sleep(0.25)
    elbow.angle = 180
    time.sleep(0.2)

def def_pose(x):
    elbow.angle = 180
    thumb_ring_pinky.angle = 180
    index_middle.angle = 180
    time.sleep(x)

def rock():
    thumb_ring_pinky.angle = 0
    index_middle.angle = 0
    time.sleep(2.2)

def paper(): # should be same as default position
    thumb_ring_pinky.angle = 180
    index_middle.angle = 180
    time.sleep(2.2)

def scissors():
    thumb_ring_pinky.angle = 0
    index_middle.angle = 180
    time.sleep(2.2)

#while True:
def_pose(1)
windup()
rock()
def_pose(2)

windup()
paper()
def_pose(2)

windup()
scissors()
def_pose(1)





