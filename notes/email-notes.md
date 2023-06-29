Email Notes
===

| Service | Default Port | Alt Ports |
|---|---|---|
| POP3 | 110 | 995 unencrypted |
| IMAP | 143 | 993 unencrypted |
| SMTP |  25 | |
| SMTPS | 587 | 25, 465, 2525 |

| | |
|---|---|
| SMTP | Simple Mail Transfer Protocol |
| POP | Post Office Protocol |
| IMAP | Internet Message Access Protocol |

* `SMPTS` only encrypts mail when transferring data over the wire. Locally, it can still be stored unencrypted
* `POP3` was designed for only one computer and only supports one way email synchronization, allowing email
   download from server to client.
* `IMAP` allows for multiple computers to access mail, with the ability to mark messages as read, synchronize
  sent and received mail across multiple devices and archive mail on the server


