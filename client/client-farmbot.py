#!/usr/bin/env python
# coding: utf-8
import paho.mqtt.client as mqtt
import sys, argparse
import json
import time

#-----------------------------Constants-----------------------------------------------
KEEP_ALIVE = 50
TIMEOUT_DELAY = 10
BROKER_PARSER = argparse.ArgumentParser()
BROKER_PARSER.add_argument("h", type=str, required=False, help="Host")
BROKER_PARSER.add_argument("p", type=int, required=False, help="Port")
BROKER_PARSER.add_argument("u", type=str, required=True, help="Username")
BROKER_PARSER.add_argument("P", type=str, required=True, help="Password")
ACTION_PARSER = argparse.ArgumentParser()
ACTION_PARSER.add_argument("u", type=str, required=True, help="Username")
ACTION_PARSER.add_argument("P", type=str, required=True, help="Password")
ACTION_PARSER.add_argument("a", type=str, required=True, help="Action: what you want to do")
ACTION_PARSER.add_argument("A", type=int, required=False, help="Area ID")
ACTION_PARSER.add_argument("x", type=int, required=False, help="X")
ACTION_PARSER.add_argument("y", type=int, required=False, help="Y")
ACTION_PARSER.add_argument("s", type=str, required=False, help="Seed ID")


#-----------------------------Actions-----------------------------------------------
def send_plant_msg(client, username, zone, x, y, z, seed):
    if (zone == None or seed == None or x == None or y == None or z == None):
        print("ERROR - Arguments missing (-A , -x, -y , -z )")
        sys.exit(2)
    else:
        client.subscribe("farmbot/out/" + username + "/plant", 0)
        client.publish("farmbot/in/" + username + "/plant", {"username": username, "seed": seed, "area": zone, "x": x, "y": y, "z": z})
#------------------------ Arroser les plantes --------------------------------------
def send_water_msg (client, username, zone, x, y, z):
    if (zone == None or  x == None or y == None or z == None):
        print("ERROR - Arguments missing (-A , -x, -y , -z )")
        sys.exit(2)
    else:
        client.subscribe("farmbot/out" + username + "/water", 0)
        client.publish("farmbot/in" + username + "/water",{"username": username, "area": zone, "x": x, "y": y, "z":z})
#------------------------- Enlever les herbes -------------------------------------
def send_weed_msg (client, username, zone, x, y, z):
    if (zone == None or x == None or y == None or z == None):
        print("ERROR - Arguments missing (-A , -x, -y , -z )")
        sys.exit(2)
    else:
        client.subscribe("farmbot/out" + username + "/weed", 0)
        client.publish("farmbot/in" + username + "/weed",{"username": username, "area": zone, "x": x, "y": y, "z": z})
#------------------------------- Mesurer des valeurs-------------------------------
def send_measure_msg(client, username, zone, x, y, z):
    if(zone == None or x == None or y == None or z == None):
        print("ERROR - Arguments missing (-A , -x, -y , -z )")
        sys.exit(2)
    else:
        client.subscribe("farmbot/out" + username + "/measure", 0)
        client.publish("farmbot/in" + username + "/measure", {"username": username, "area": zone, "x": x, "y": y, "z": z})
#------------------------------Lister les implantations--------------------------------
def send_list_msg (client, username, zone):
    if (zone == None):
        print("ERROR - Arguments missing ( -A )")
        sys.exit(2)
    else:
        client.subscribe("farmbot/out" + username + "/list", 0)
        client.publish("farmbot/in" + username + "/list", {"username": username, "area": zone})
#--------------------------------------------------------------
def on_connect(client, userdata, flags, rc):
    print("Connected with result code: "+str(rc))
    args_action = ACTION_PARSER.parse_args()

    # Liste des actions
    if (args_action.a == "plant"):
        send_plant_msg(client, args_action.u, args_action.A, args_action.x, args_action.y, args_action.z, args_action.s)
    if (args_action.a == "water"):
        send_water_msg(client, args_action.u, args_action.A, args_action.x, args_action.y, args_action.z)
    if (args_action.a == "weed"):
        send_weed_msg(client, args_action.u, args_action.A, args_action.x, args_action.y, args_action.z)
    if (args_action.a == "measure"):
        send_measure_msg(client, args_action.u, args_action.A, args_action.x, args_action.y, args_action.z)
    if (args_action.a == "list"):
        send_list_msg(client, args_action.u, args_action.A)
#--------------------------------------------------------------
def on_publish(client, userdata, mid):
    print("DEBUG - Data published")
#-------------------------------------------------------------
def on_message(client, userdata, msg):
    print("DEBUG - " + msg.topic + " " + str(msg.qos))
    print(msg)
    client.disconnect()
    sys.exit(0)
#--------------------------------------------------------------
def on_subscribe(client, userdata, mid, qos):
    print("DEBUG - Subscribed: " + str(mid) + " " + str(qos))
#--------------------------------------------------------------
def on_disconnect(client, userdata, rc):
    print("DEBUG - Device disconnected with result code: " + str(rc))
#--------------------------------------------------------------
def main():
    args_broker = BROKER_PARSER.parse_args()

    # Create MQTT client
    client = mqtt.Client()
    client.username_pw_set(args_broker.u, args_broker.P)
    client.connect(args_broker.h, args_broker.p, KEEP_ALIVE)

    # Assign event callback
    client.on_connect = on_connect
    client.on_publish = on_publish
    client.on_subscribe = on_subscribe
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    # Timeout implementation
    time.sleep(TIMEOUT_DELAY)
    client.disconnect()
    print("ERROR - Timeout...")
    sys.exit(1)

if __name__ == "__main__":
    main()
