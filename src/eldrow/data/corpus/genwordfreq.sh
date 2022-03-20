#!/bin/bash


cat *.txt | \
  grep -P -o '[^a-zA-Z][a-zA-Z]{5}[^a-zA-Z]' | \
  grep -P -o '[a-zA-Z]{5}' | \
  tr '[:upper:]' '[:lower:]' | \
  sort | \
  uniq -c | \
  sort -n -r | \
  sed 's/^ *//' | \
  sed 's/^\(.*\) \(.*\)$/\2,\1/' > freq.list


