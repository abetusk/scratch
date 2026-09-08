#!/usr/bin/bash

mkdir -p ssl

openssl req -x509 \
  -newkey rsa:2048 \
  -keyout ssl/ssl-cert-snakeoil.key \
  -out ssl/ssl-cert-snakeoil.pem \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Department/CN=localhost"
