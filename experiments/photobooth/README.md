Photobooth
===

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


