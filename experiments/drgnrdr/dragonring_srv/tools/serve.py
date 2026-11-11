#!/usr/bin/env python3
# Serve the game folder over HTTP (like `python3 -m http.server`) and
# bridge a MIDI sensor to the page without the browser's Web MIDI:
# notes read with `aseqdump` (alsa-utils) are streamed to the page as
# Server-Sent Events at /midi.  Works in any browser, private windows
# included, with no permission prompt.
#
#   python3 tools/serve.py [--port 8989] [--midi 24:0]
#
# --midi: the ALSA sequencer port (see `aseqdump -l`); default: the
# first port that is not System, Midi Through or PipeWire, looked up
# again every few seconds until one appears (plug in any time).
#
# Each event line sent to the page: "on <channel 1-16> <note> <velocity>"
# (and "off ..."), or "status <text>".
#
import argparse, os, queue, re, subprocess, threading, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTE = re.compile(r"Note (on|off)\s+(\d+),\s*note\s+(\d+)(?:,\s*velocity\s+(\d+))?")
SKIP = ("System", "Midi Through", "PipeWire")

clients = []
lock = threading.Lock()
state = {"status": "starting"}


def broadcast(line):
  with lock:
    for q in clients:
      q.put(line)


def set_status(text):
  state["status"] = text
  broadcast("status " + text)
  print("midi:", text, flush=True)


def find_port():
  try:
    out = subprocess.run(["aseqdump", "-l"], capture_output=True, text=True, timeout=5).stdout
  except Exception as e:
    return None, "aseqdump not available (" + str(e) + ")"
  for line in out.splitlines()[1:]:
    parts = line.split(None, 1)
    if (len(parts) == 2) and (":" in parts[0]) and not any(s in parts[1] for s in SKIP):
      return parts[0], " ".join(parts[1].split())
  return None, "no MIDI device found (plug in the sensor)"


# Read notes from aseqdump forever, restarting it (and looking the port
# up again) whenever it exits, e.g. when the sensor is unplugged.
#
def reader(fixed_port):
  while True:
    port, name = ( (fixed_port, fixed_port) if fixed_port else find_port() )
    if not port:
      set_status(name)
      time.sleep(3)
      continue
    set_status("reading " + port + " (" + name + ")")
    try:
      p = subprocess.Popen(["aseqdump", "-p", port], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
      for line in p.stdout:
        m = NOTE.search(line)
        if m:
          kind, ch, note, vel = m.group(1), int(m.group(2)) + 1, m.group(3), m.group(4) or "0"
          broadcast("%s %d %s %s" % (kind, ch, note, vel))
        elif "Cannot" in line or "Invalid" in line:
          set_status(line.strip())
      p.wait()
    except Exception as e:
      set_status("aseqdump failed: " + str(e))
    set_status("MIDI device gone; looking again")
    time.sleep(2)


class Handler(SimpleHTTPRequestHandler):
  def __init__(self, *a, **k):
    super().__init__(*a, directory=ROOT, **k)

  def end_headers(self):
    self.send_header("Cache-Control", "no-store")
    super().end_headers()

  def log_message(self, fmt, *args):
    pass

  def do_GET(self):
    if self.path.split("?")[0] != "/midi":
      return super().do_GET()
    q = queue.Queue()
    with lock:
      clients.append(q)
    try:
      self.send_response(200)
      self.send_header("Content-Type", "text/event-stream")
      self.end_headers()
      self.wfile.write(("data: status " + state["status"] + "\n\n").encode())
      self.wfile.flush()
      while True:
        try:
          line = q.get(timeout=15)
        except queue.Empty:
          line = None
        self.wfile.write(( ("data: " + line + "\n\n") if line else ": keep-alive\n\n" ).encode())
        self.wfile.flush()
    except (BrokenPipeError, ConnectionResetError):
      pass
    finally:
      with lock:
        clients.remove(q)


def main():
  ap = argparse.ArgumentParser(description="Serve the game and bridge a MIDI sensor to it.")
  ap.add_argument("--port", type=int, default=8989)
  ap.add_argument("--host", default="127.0.0.1")
  ap.add_argument("--midi", default=None, help="ALSA sequencer port, e.g. 24:0 (default: find one)")
  a = ap.parse_args()
  threading.Thread(target=reader, args=(a.midi,), daemon=True).start()
  srv = ThreadingHTTPServer((a.host, a.port), Handler)
  srv.daemon_threads = True
  print("serving %s at http://localhost:%d/  (MIDI events at /midi)" % (ROOT, a.port), flush=True)
  srv.serve_forever()


if __name__ == "__main__":
  main()
