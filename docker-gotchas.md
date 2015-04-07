Error response from daemon: Cannot start container 913...: port has already been allocated
---

Looks to be a current Docker bug where the Docker daemone doesn't refresh it's available
port list if it finds it occupied sometime in the past.  Just restart the Docker daemon.

From https://github.com/docker/docker/issues/6476

    sudo service docker.io restart



"No space left on device" errors
---

The host file system is running out of space.  Either remove some images (via `docker rm`)
or point docker to a new file partition.

From https://groups.google.com/forum/#!topic/docker-user/AKqf_qIhFL4:

> In `/etc/default/docker`, add:

    DOCKER_OPTS="-g /path/to/docker/data"


Copying files into a docker container
---

Use of `sshd` is discouraged on the docker image.  Though a file can be put at a third party network
location and downloaded onto the docker image, sometimes it's desirable to copy the
file over wholesale.

Though discouraged, the 'quick and easy' way is to copy the file directly into the running
docker container via:

    cp local.file /var/lib/docker/aufs/mnt/<CONTAINER_ID>/destination/path

Where <CONTAINER_ID> is the ID of the running container.

A better way looks to be http://stackoverflow.com/questions/22907231/copying-files-from-host-to-docker-container:

  - mount a volume used by the container
  - copy to the volume

```
docker run -v /path/to/hostdir:/mnt <CONTIANER_ID>
cp /mnt/sourcefile /path/to/destfile
```


The 'mount volume' and 'persistent volumes' pattern for persistent data
---

A 'surprising' aspect of running Docker containers is that running images will
not carry over state from a previous run.  If there is storage that needs to
be persisted across runs, the preferred pattern is to mount a volume when running
a container, either mapping a local file or directory from the host operating
system or using a specialized docker containter that is data only.

From https://docs.docker.com/userguide/dockervolumes/

### Volume on host

```bash
sudo docker run -d -v /src/volume:/dst/volume <CONTAINER_ID>
```

### Volume in data only container

From http://container42.com/2013/12/16/persistent-volumes-with-docker-container-as-volume-pattern/

Here's an example that first creates the container then uses it:

```bash
# echo -e 'FROM busybox\nVOLUME /var/lib/mysql\nCMD /bin/sh' > Dockerfile
# docker build .
...
Successfully built 3fa299c39d83
# docker run -t -i 3fa299c39d83
```

The above doesn't need to be running to attach to it.

Run a container that uses the newly created data only container:

```bash
# docker ps
...  071c02b57505 ...
# docker run -i -t --volumes-from 071c02b57505 <APP_CONTAINER_ID>
...
```

Expose ports
---

Expose all ports:

```bash
# docker run -d -P <CONTAINER_ID>
```

Expose single port (e.g. 80) mapped to random host port:

```bash
# docker run -d -p 80 <CONTAINER_ID>
```

Expose ports (e.g. 80, 443) mapped to specific host ports (e.g. 80, 443 resp.):

```bash
# docker run -d -p 80:80 -p 443:443 <CONTAINER_ID>
```


