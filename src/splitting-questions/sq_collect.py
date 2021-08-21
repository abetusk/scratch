#!/usr/bin/python3
#
# LICENSE: CC0
#

import os, sys, string, json
import random
import hashlib

JSON_QUESTION = "/var/www/splitting_questions/data/questions.json"
#OUTPUT_JSON = "/tmp/splitting_questions_freq.json"
OUTPUT_JSON = "/var/www/splitting_questions/data/splitting_questions_freq.json"

PFX = "/home/meow/data/splitting_questions"
#PFX = "/tmp/splitting_questions"

question = {}
survey_db = { }

with open(JSON_QUESTION, "r") as ifp:
  dat = json.load(ifp)

  question["survey"] = []

  for ent in dat["survey"]:
    ent["sha256sum"] = hashlib.sha256(str.encode(ent["question"])).hexdigest()
    question["survey"].append(ent)


for root, dirs, files in os.walk(PFX):
  for fn in files:

    try:
      with open(os.path.join(root,fn), "r") as ifp:
        surv_dat = json.load(ifp)

        if not ("answer" in surv_dat): continue
        for ent in surv_dat["answer"]:
          if (("id" in ent) and ("a" in ent)):
            _id = ent["id"][0:64]
            _a = ent["a"][0:64]
            if not (_id in survey_db):
              survey_db[_id] = { "yes":0, "no":0, "skip":0 }
            if (_a in survey_db[_id]):
              survey_db[_id][_a]+=1
    except:
      print("bad json load for file:", os.path.join(root,fn))

ojson = { "survey" : question["survey"], "freq": survey_db }

with open(OUTPUT_JSON, "w") as ofp:
  ofp.write(json.dumps(ojson))

