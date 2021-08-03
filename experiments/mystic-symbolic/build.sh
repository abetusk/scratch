#!/bin/bash

cat <( echo 'var vocabulary =' ) \
  _svg-vocabulary-pretty-printed.json \
  <( echo -e ';\nmodule.exports = { "vocabulary":vocabulary };' ) > mystic_symbolic_vocabulary.js

cat <( echo 'var vocabulary = ' ) \
  <( node gen-tarot-json.js ) \
  <( echo -e ';\nmodule.exports = { "vocabulary":vocabulary };' ) > tarot_vocabulary.js

browserify --standalone sibyl sibyl.js > browser-sibyl.js

