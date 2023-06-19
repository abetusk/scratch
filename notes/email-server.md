Email Server Notes
===

### Changing Hostname

```
hostnamectl set-hostname example.com
```

### Software Stack

* `postfix` - MTA
* `dovecot` - IMAP server
* `spamassasin` - spam filtering
* `clamav` - virus scanning (?)
* `sieve` - mail filters and rules
* `roundcube` - webmail server
* `postgresql` - DB
* `nginx`, `php-fpm` - web server

Installation
---

### Web Server

```
apt install -y nginx
apt install -y certbot python3-certbot-nginx
```

### certbot

note: DNS needs to be updated to point to the appropriate place

```
# certbot --nginx
...: arborgorge.com,www.arborgorge.com,webmail.arborgorge.com

# systemctl restart nginx
```

### postfix

```
apt-get install -y postfix
apt-get install -y dovecot-core dovecot-dev dovecot-imapd dovecot-pop3d
```

```
sudo apt-get install -y libsasl2-2 sasl2-bin libsasl2-modules
```

### DKIM, SpamAssassin

```
apt-get install -y opendkim opendkim-tools
apt-get install -y spamass-milter pyzor razor libmail-dkim-perl

```

### misc

```
apt-get install -y git
apt-get install -y mailutils
```

User Setup
---

```
# echo 'export MAIL=~/Maildir' | sudo tee -a /etc/bash.bashrc | sudo tee -a /etc/profile.d/mail.sh
# apt install s-nail
```

Configuration
---

```
# addusser arborgorge
```

### postfix

To list default configuration options:

```
postconf -d
postconf -d mail_version
```

`/etc/postfix/virtual`

```
contact@arborgorge.com arborgorge.com
admin@arborgorge.com arborgorge.com
```

```
# postmap /etc/postfix/virtual
```

`/etc/postfix/main.cf`:

```
mtpd_tls_cert_file = /etc/letsencrypt/live/arborgorge.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/arborgorge.com/privkey.pem
smtpd_tls_security_level=may


```

---

And configuration parameters:

```
postconf smtpd_helo_required
```

`/etc/postfix/main.cf`:

```
smtpd_banner = $myhostname ESMTP

smtpd_helo_required = yes
smtpd_tls_ask_ccert = yes
smtp_tls_ciphers = high

smtpd_helo_restrictions = permit_mynetworks,
 reject_non_fqdn_helo_hostname, reject_invalid_helo_hostname,
 reject_unknown_helo_hostname, permit
smtpd_recipient_restrictions = reject_unknown_client_hostname,
 reject_unknown_sender_domain, reject_unknown_recipient_domain,
 reject_unauth_pipelining, permit_mynetworks,
 permit_sasl_authenticated, reject_unauth_destination,
 reject_invalid_hostname, reject_non_fqdn_sender
smtpd_sender_restrictions = reject_unknown_sender_domain,
 reject_sender_login_mismatch
smtpd_sender_login_maps = $virtual_mailbox_maps

## Dealing with rejection: use permanent 550 errors to stop retries
unknown_address_reject_code = 550
unknown_hostname_reject_code = 550
unknown_client_reject_code = 550

## Customized Dovecot and virtual user-specific settings
canonical_maps = hash:/etc/postfix/canonical
home_mailbox = Maildir/
message_size_limit = 104857600
virtual_alias_maps = hash:/etc/postfix/virtual
virtual_mailbox_domains = hash:/etc/postfix/virtual-mailbox-domains
virtual_mailbox_maps = hash:/etc/postfix/virtual-mailbox-users
virtual_transport = dovecot

```

`/etc/postfix/master.cf`:

```
...
submission inet n       -       y       -       -       smtpd
...
dovecot   unix  -       n       n       -       -       pipe
  flags=DRhu user=vmail:vmail argv=/usr/lib/dovecot/deliver -f ${sender} -d ${recipient}
```

`/etc/aliases`:

```
postmaster: admin@arborgorge.com
root: admin@arborgorge.com
www-data: admin@arborgorge.com
```

```
# newaliases
# ls -latr
-rw-r--r--   1 root     root        143 Jun 16 06:53 aliases
drwxr-xr-x 126 root     root      12288 Jun 16 06:53 .
-rw-r--r--   1 root     root      12288 Jun 16 06:53 aliases.db
#
```

`/etc/postfix/canonical`:

```
www-data@www.arborgorge.com admin@arborgorge.com
```

```
# postmap /etc/postfix/canonical
# ls -latr
...
-rw-r--r--   1 root root    49 Jun 16 06:58 canonical
drwxr-xr-x   5 root root  4096 Jun 16 07:01 .
-rw-r--r--   1 root root 12288 Jun 16 07:01 canonical.db
#
```

`/etc/postfix/virtual-mailbox-domains`:

```
arborgorge.com OK
```

```
# postmap /etc/postfix/virtual-mailbox-domains
```

`/etc/postfix/virtual-mailbox-users`:

```
admin@arborgorge.com admin@arborgorge.com
root@arborgorge.com root@arborgorge.com
abetusk@arborgorge.com abetusk@arborgorge.com
meow@arborgorge.com meow@arborgorge.com
```

```
# postmap /etc/postfix/virtual-mailbox-users 
```

---


### roundcube

* `/usr/share/doc/roundcube`
* `dbconfig-common`



```
# apt install roundcube
# apt install -y php php-fpm php-gd php-common php-json php-imagick php-imap php-xml php-mbstring php-curl php-zip php-bz2 php-intl php-ldap
```

During installation, depending on your setup, roundcube can set up a database and user.

`certbot` altered the `/etc/nginx/conf.d/roundcube.conf` configuration.
Regardless, the configuration should look something like:

```
server {

  server_name webmail.arborgorge.com;
  root /var/www/roundcube;

  index index.php index.html index.htm;

  error_log /var/log/nginx/roundcube.error;
  access_log /var/log/nginx/roundcube.access;

  ## TEMPORARY TO ONLY ALLOW ACCESS FROM ONE HOST WHEN INSTALLING
  #location / {
  #  allow 8.7.5.6; # filler ip
  #  deny all;
  #}


  location ~ ^/(README.md|INSTALL|LICENSE|CHANGELOG|UPGRADING)$ {
    deny all;
  }

  location ~ ^/(config|temp|logs)/ {
    deny all;
  }

  location ~ /\. {
    deny all;
  }

  location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/run/php/php8.1-fpm.sock;
  } 

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/arborgorge.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/arborgorge.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = webmail.arborgorge.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


  listen 80;

  server_name webmail.arborgorge.com;
    return 404; # managed by Certbot


}
```

`/etc/dovecot/conf.d`:

```
#mail_location = mbox:~/mail:INBOX=/var/mail/%u
mail_location = maildir:~/Maildir
```

`/etc/postfix/main.cf`:

```
home_mailbox = Maildir/
mydestination = $myhostname, webmail.$myhostname, localhost
```

`/var/www/roundcube/config/config.inc.php`:

```
$config['db_dsnw'] = 'mysql://roundcube:XXX@localhost/roundcube';

$config['product_name'] = 'Roundcube Webmail';

$config['des_key']  = 'XXXXXXXXXXXXXXXXXXXXXXXX';


$config['default_host'] = [
  'webmail.arborgorge.com' => 'Arbor Gorge Webmail'
];


// IMAP
$rcmail_config['default_host'] = 'arborgorge.com';
$rcmail_config['default_port'] = 143;
// SMTP
$rcmail_config['smtp_server'] = 'arborgorge.com';
$rcmail_config['smtp_port'] = 25;

```


### user addition

```
# groupadd -g 5000 vmail
# useradd -g vmail -u 5000 vmail -d /var/mail/vmail -m 
```


Glossary
---

| | | |
|---|---|---|
| `MTA` | Mail Transfer Agent | email transmission |
| `MDA` | Mail Delivery Agent | delivery of mail to (local) user |
| `MUA` | Mail User Agent | email client (thunderbird, outlook, etc) |
| `sasl` | Simple Authentication and Security Layer | framework for authentication and security |


References
---

* [tutorial](https://arstechnica.com/information-technology/2014/02/how-to-run-your-own-e-mail-server-with-your-own-domain-part-1/)
  - [part 2](https://arstechnica.com/information-technology/2014/03/taking-e-mail-back-part-2-arming-your-server-with-postfix-dovecot/)
  - [part 3](https://arstechnica.com/information-technology/2014/03/taking-e-mail-back-part-3-fortifying-your-box-against-spammers/)
  - [web server](https://arstechnica.com/series/web-served/)
* [postfix5 documentation](http://www.postfix.org/postconf.5.html)
* [postfix DO](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-on-ubuntu-20-04)
* [postfix upcloud](https://upcloud.com/resources/tutorials/secure-postfix-using-lets-encrypt)
* [rfc5321](http://www.faqs.org/rfcs/rfc5321.html)
* [roundcube on ubuntu with nginx](https://www.linuxtuto.com/how-to-install-roundcube-on-ubuntu-22-04/)
* [sasl](https://www.civo.com/learn/setting-up-a-postfix-mail-server-with-dovecot)
