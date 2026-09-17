Photobooth
===

Debug Log (temporary)
---

###### 2026-09-17

* There should be two main items, wiki entries, representing
  ideas, tags, dates, events, etc. and images
  - wiki entries can have different images
  - images have different tags associated with them
* family trunk default wiki where all pictures go

###### 2026-09-07

Latency is pretty bad but it does look to be working.

as a review:

* copy all html and js files to system directory for web server
* run the communication server: `node comm_server.js`
* make sure `/tmp/manifest` and `/tmp/img` are created and accessible
* point all browsers to `https://192.168.1.7:8080` and allow the self signed certificate
  - this is *both* the mobile browser and the desktop manager
* mobile to `https://192.168.1.7`
* desktop to `https://192.168.1.7/desktop_manager.html`

If there's any doubt, run `node comm_cli_test.js` to make sure the websocket communication server is running.
Regenerate the snake oil certs as necessary (`gen-self-signed.sh`).

---

One of the reasons the latency is so high is because the preview image is massive.


TODO:

* Allow for tags and text that will be stored in manifest
* give feedback when picture is taken
* figure out how to grab the files in `/tmp` somewhere more permanent



###### 2026-09-04

wss connection from mobile isn't working. I suspect it's because wss (secure connection) is needed
when doing https.
The websocket server needs to be able to serve a connection, so will need to point to pub/priv keys.

```
var wss = new ws.WebSocketServer({
  port: 8080,
  cert: fs.readFileSync('./path/to/cert.pem'),
  key: fs.readFileSync('./path/to/key.pem')
});
```

For self signed certs you have to go to the address from the browser (`https://<localhost>:8080`) and allow
the self signed cert yourself.



Introduction
---

app for fast scanning of photos.

**Note: when installing anywhere but local, make sure appropriate permissions are setup and auth files are secured**

| File | Description |
|---|---|
| `index.html` | Client web application (device that has camera, e.g. smartphone) |
| `photobooth.js` | Client js app |
| `ul.cgi` | Server side cgi (python) script that uploads files to `img/` and `manifest/` directories |
| `desktop_manager.html` | Desktop manager |
| `comm_server.js` | Websocket server to pass messages from desktop manager to photobooth client |

Quick Start
---

```
mkdir -p /tmp/manifest /tmp/img
./photobooth_srv.sh >> log/pb.log &
node comm_server.js >> log/cs.log &
```

Mobile browsers have restrictive policies about who can access the camera, so the `navigator.mediaDevices`
is only defined when accessing the site securly.

I'm not sure there's an easy way to get `http.server` to go through securly, so I've opted for a simpler
path of just installing apache on my local system and using that.

CRUFT
===

Quick Start
---

```
python3 -m http.server --cgi
```

Note that running locally requires a `cgi-bin` directory with the cgi script in it.

There are symlinks to `manifest` and `img` directories in the `cgi-bin/` directory.


Setup
---

Apache needs to be configured to:

* run ssl
* run cgi
* use system `/tmp` instead of global

### enable ssl

```
a2enmod ssl
```

Either modify the default ssl conf in `/etc/apache2/sites-available` or
copy it into a new one for custom.

Regardless, provide a symlink to it from `/etc/apache2/sites-enabled`

### run cgi

```
a2enmod cgi
```

In `/etc/apache2/sites-enabled/000-custom-ssl.conf`:

```
  <Directory /var/www/html/>
    Options -Indexes +FollowSymLinks +MultiViews
    # Options -Indexes -FollowSymLinks -MultiViews
    AllowOverride None
    Order allow,deny
    allow from all
    Options +ExecCGI
    AddHandler cgi-script .cgi .pl .py .php
    DirectoryIndex index.html index.py
  </Directory>

  <Directory /var/www/html/cgi-bin/>
    AllowOverride None
    Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
    Order allow,deny
    Allow from all
  </Directory>
```

make sure all appropriate directories have `www-data:www-data` ownership.


### use system tmp

In `/lib/systemd/system/apache2.service`, edit to:

```
...
PrivateTmp=false
...
```

```
systemctl daemon-reload
systemctl restart apache2
```


