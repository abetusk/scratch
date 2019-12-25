Data Store Notes
---

* content address store
* variable block size dependent on data/rolling hash with min/max block size
* heirarchical manifests:
  - collection of blocks within file can be identified by a meta block
  - collection of associated block regions ("filenames") can be associated with a group identifier
* manifest and data separated
* server has facility to discover other servers from signed certificate passed to it by client
  - server with trusted information can mimic client to connect and broadcast to other servers
* communication over https


###### 2018-09-04
