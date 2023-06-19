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
...: example.com,www.example.com

# systemctl restart nginx
```

### postfix

```
apt-get install -y postfix
apt-get install -y dovecot-core dovecot-dev dovecot-imapd dovecot-pop3d
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
