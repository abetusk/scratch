#!/usr/bin/python
#
# License: CC0
#

import re
import cgi
import cgitb
import sys
import json
import uuid
import subprocess as sp
import os

from datetime import datetime, timezone

### CAUTION!!!!
### CAUTION!!!!
MANIFEST_DIR = "manifest"
IMG_DIR = "img"
AUTH_DB = "auth.json"

do_auth = False

cgitb.enable();


u_id = -1

print("Content-Type: application/json")
print("")
print("")

auth = False
if do_auth:

  auth_data = {}
  with open(auth_db) as fp:
    auth_data = json.loads(fp.read())


  #_debug = ""

  username = ""
  passhash = ""

  if os.environ.has_key("HTTP_COOKIE"):
    for kv in os.environ['HTTP_COOKIE'].split(";"):
      k,v = kv.split("=")
      #_debug += ";" + str(k) + ":" + str(v) + ";"
      k = k.strip()
      v = v.strip()
      if k == "username":
        username = str(v)
      elif k == "passhash":
        passhash = str(v)

  #_debug += ":::" + username + ":" + passhash + ":::"


  if 'user' in auth_data:
    for u in auth_data['user']:
      #_debug += u['username'] + "..." + u['passhash']
      if ('username' in u) and  ('passhash' in u):
        if (username == '') or (passhash == ''): continue
        if (username == u['username']) and (passhash == u['passhash']):
          auth = True

## DEBUGGING!!
## DEBUGGING!!
auth = True
## DEBUGGING!!
## DEBUGGING!!

form = cgi.FieldStorage()
if auth:
  if "fileData" in form:
    u_id = uuid.uuid4()

    now = datetime.now(timezone.utc)
    date_pfx = now.strftime("%Y-%m-%d_%H-%M-%S-Z")

    fn = IMG_DIR + "/" + str(date_pfx) + "_" + str(u_id)

    f = open( fn, "wb" )
    f.write( form.getvalue('fileData') )
    f.close()

    print("{ \"id\":\"" + str(u_id) + "\" } ")

    mfn = MANIFEST_DIR + "/" + str(u_id)
    dat = {}
    dat["file"] = str(fn)
    dat["id"] = str(u_id)
    dat["datetime"] = now.strftime("%Y-%m-%d %H:%M:%S Z")
    dat["name"] = ""
    dat["tag"] = []
    dat["note"] = []

    if "fileName" in form:
      dat["name"] = str(form.getvalue("fileName"))
    if "fileInfo" in form:
      dat["info"] = str(form.getvalue("fileInfo"))
    if "fileTime" in form:
      dat["timestamp"] = str(form.getvalue("fileTime"))

    f = open( mfn, "wb" )
    f.write( json.dumps(dat) )
    f.close()

  else:
    print("{ \"info\":\"error\" }")
else:
  #print("{ \"info\":\"auth error\" , \"debug\":\"" + str(_debug) + "\"}")
  print("{ \"info\":\"auth error\" }");

