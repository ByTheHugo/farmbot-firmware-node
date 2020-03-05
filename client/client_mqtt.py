# coding: utf-8
#!/usr/bin/env python
import paho.mqtt.client as mqtt
import json

# Configuration
BROKER_ADDRESS = '127.0.0.1'
MQTT_PORT   = 1883
KEEP_ALIVE  = 50
USER = 'username'
PASSWORD = 'yourpass'
topics_in = ""
responses = []
sent = []

# Define event callback
def on_connect(client, userdata, flags, rc):
        print("Connected with result code: "+str(rc))
#--------------------------------------------------------------
def on_publish(client, userdata, mid):
    print ("Data published")
#-------------------------------------------------------------
def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.qos))
#--------------------------------------------------------------
def on_subscribe(client, userdata, mid, qos):
    print("Subscribed: " + str(mid) + " " + str(qos))
#--------------------------------------------------------------
def on_disconnect(client, userdata, rc):
    print("Device disconnected with result code: " + str(rc))
#--------------------------------------------------------------
def get_input(argv):
    broker_in = ""
    port_in = 0
    topics_in = ""
    try:
      opts, args = getopt.getopt(argv, "h:p:t:c:d:su:P:")
    except getopt.GetoptError:
        print (sys.argv[0], " -h <broker> -p <port> -t <topic> -c <count> \
-d <delay> -u <username> -P <pasword>-s <silent True>")
        sys.exit(2)

#new instance
client = mqtt.Client()
client.username_pw_set(USER, PASSWORD)
#Assign event callback
client.on_connect = on_connect
client.on_publish = on_publish
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_disconnect = on_disconnect

#-----------------------Main Loop--------------------
client.loop_start()
# connect to broker
print ("Connecting to broker ", BROKER_ADDRESS)
client.connect(BROKER_ADDRESS, MQTT_PORT, KEEP_ALIVE)

#subscribe
client.subscribe("farmbot/in/plant",0)
client.subscribe("farmbot/in/water",0)
client.subscribe("farmbot/in/weed", 0)
client.subscribe("farmbot/in/measure", 0)
client.subscribe("farmbot/in/list", 0)
client.subscribe("farmbot/out/video", 0)
client.subscribe("farmbot/out/list", 0)


#publish messages
client.publish ("farmbot/in/plant", "seed")
client.publish("farmbot/in/water", "on")



client.loop_forever()
#--------------------------------------------------------
#Disconnect
client.disconnect()
