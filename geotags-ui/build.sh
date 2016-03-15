#!/bin/bash

./node_modules/.bin/babel --presets react app/react --out-dir build
./node_modules/.bin/browserify build/main.js -o app/js/geotags.js
