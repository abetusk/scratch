#!/usr/bin/python3
#
# LICENSE: CC0
#

import os, sys, string, json
import random
import hashlib

PFX = "/home/meow/data/splitting_questions"
PFX = "/tmp/splitting_questions"

res = {'type':'success', 'message':''}

try:
  json_data = json.load(sys.stdin)
  if (("prowo" in json_data) and
      ("found" in json_data["prowo"]) and
      ("input" in json_data["prowo"]) and
      ("output" in json_data["prowo"]) and
      (len(str(json_data["prowo"]["output"])) == 64) and
      (str(json_data["prowo"]["output"][0:4]) == "0000") and
      (hashlib.sha256(str.encode(json_data["prowo"]["input"])).hexdigest() == str(json_data["prowo"]["output"]))):
    fn = hashlib.sha256(str.encode(json_data["prowo"]["input"])).hexdigest()
    subdir = fn[-2:]
    os.makedirs(PFX + "/" + subdir, exist_ok = True)
    ofn = PFX + "/" + subdir + "/" + hashlib.sha256(str.encode(json_data["prowo"]["input"])).hexdigest()
    with open(ofn, "w") as ofp:
      ofp.write(json.dumps(json_data))
  else:
    res["type"] = "fail"
    res["message"] = "no proof of work"
except:
  res["type"] = "fail"
  res["message"] = "server error"

print('Content-Type: applicaiton/json\n\n')
print(json.dumps(res))
