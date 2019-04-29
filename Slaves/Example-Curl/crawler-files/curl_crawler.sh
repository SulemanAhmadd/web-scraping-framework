#!/bin/sh

output="${2}.html"
trace="${2}.trace"

curl \
  --user-agent 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36' \
  --location \
  --silent \
  --trace $trace \
  --output $output \
  --create-dirs \
  $1
