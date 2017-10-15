#!/bin/bash

# flow transform
npm run babel -- js/ -d bin

# clientside require
npm run browserify -- bin/client/index.js -o bin/client/compiledBundle.js

