#!/usr/bin/env python
# coding: utf-8
import paho.mqtt.client as mqtt
import sys
import argparse
import json
import time

# Configuration
KEEP_ALIVE = 50
SENDED = False

#-----------------------------Constants-----------------------------------------------
BROKER_PARSER = argparse.ArgumentParser()
BROKER_PARSER.add_argument("--H", type=str, help="Host", default="127.0.0.1")
BROKER_PARSER.add_argument("--P", type=int, help="Port", default=1883)
BROKER_PARSER.add_argument("-u", type=str, help="Username")
BROKER_PARSER.add_argument("--p", type=str, help="Password")
BROKER_PARSER.add_argument("-a", type=str, help="Action: what you want to do")
BROKER_PARSER.add_argument("--A", type=str, help="Area ID")
BROKER_PARSER.add_argument("--x", type=int, help="X")
BROKER_PARSER.add_argument("--y", type=int, help="Y")
BROKER_PARSER.add_argument("--s", type=int, help="Seed ID")

# Define event callback
def on_connect(client, userdata, flags, rc):
        print("Connected with result code: "+str(rc))
        if rc == 0:
            print("successful connection")
            args_action = BROKER_PARSER.parse_args()

            # Subscribe to our output channel
            print("Subscribed to farmbot/out/" + args_action.u)
            client.subscribe("farmbot/out/" + args_action.u)

            # Send message according action
            global SENDED
            if (SENDED == False):
                if (args_action.a == "plant"):
                    send_plant_msg(client, args_action.u, args_action.A, args_action.x, args_action.y, args_action.s)
                if (args_action.a == "water"):
                    send_water_msg(client, args_action.u, args_action.A, args_action.x, args_action.y)
                if (args_action.a == "weed"):
                    send_weed_msg(client, args_action.u, args_action.A, args_action.x, args_action.y)
                if (args_action.a == "measure"):
                    send_measure_msg(client, args_action.u, args_action.A, args_action.x, args_action.y)
                if (args_action.a == "list"):
                    send_list_msg(client, args_action.u, args_action.A)
                SENDED = True

        else:
            print("connection fail") #the subscriber will not receive the message
#--------------------------------------------------------------


def on_publish(client, userdata, mid):
    print("Data published")
#-------------------------------------------------------------


def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.qos) + ": " + str(msg.payload))
#--------------------------------------------------------------


def on_subscribe(client, userdata, mid, qos):
    print("Subscribed: " + str(mid) + " " + str(qos))
#--------------------------------------------------------------


def on_disconnect(client, userdata, rc):
    print("Device disconnected with result code: " + str(rc))
#--------------------------------------------------------------


def send_msg(client, username, action, args_dict):
    data = {
                              "method": action,
                              "auth": {
                                  "username": username
                              },
                              "args": args_dict
                          }

    client.publish("farmbot/in", json.dumps(data) , 1)

#-----------------------------Actions-----------------------------------------------


def send_plant_msg(client, username, zone, x, y, seed):
    if (zone == None or seed == None or x == None or y == None):
        print("ERROR - Arguments missing (--A , --x, --y)")
    else:
        send_msg(client, username, "plant", {
                 "seed": seed, "area": zone, "x": x, "y": y})
#------------------------ Arroser les plantes --------------------------------------


def send_water_msg(client, username, zone, x, y):
    if (zone == None or x == None or y == None):
        print("ERROR - Arguments missing (-A , -x, -y)")
    else:
        send_msg(client, username, "water", {
            "area": zone, "x": x, "y": y})
#------------------------- Enlever les herbes -------------------------------------


def send_weed_msg(client, username, zone, x, y):
    if (zone == None or x == None or y == None):
        print("ERROR - Arguments missing (-A , -x, -y)")
    else:
        send_msg(client, username, "weed", {
                 "area": zone, "x": x, "y": y})
#-------------------------- Mesurer des valeurs----------------------------------


def send_measure_msg(client, username, zone, x, y):
    if(zone == None or x == None or y == None):
        print("ERROR - Arguments missing (-A , -x, -y)")
    else:
        send_msg(client, username, "plant", {
            "area": zone, "x": x, "y": y})
#------------------------- Lister les implantations-----------------------------------


def send_list_msg(client, username, zone):
    if (zone == None):
        print("ERROR - Arguments missing ( -A )")
    else:
        send_msg(client, username, "list", {
                 "area": zone})

#new instance
client = mqtt.Client()
#Assign event callback
client.on_connect = on_connect
client.on_publish = on_publish
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_disconnect = on_disconnect

#-----------------------Main Loop--------------------
client.loop_start()
args_action = BROKER_PARSER.parse_args()

# Connect to broker
print ("Connecting to broker ", args_action.H)
client.username_pw_set(args_action.u, args_action.p)
client.connect(args_action.H, args_action.P, KEEP_ALIVE)

client.loop_forever()

#--------------------------------------------------------
#Disconnect
#client.disconnect()
