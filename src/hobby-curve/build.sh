#!/bin/bash

mkdir -p dist

#esbuild ./bezier.js --bundle --platform=node --outfile=bez.cjs
browserify ./hob.js --standalone Hobby -o dist/Hobby.js
