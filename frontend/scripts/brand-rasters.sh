#!/usr/bin/env bash
# Draws the PNG brand assets from their SVG sources with the headless browser.
set -euo pipefail
cd "$(dirname "$0")/../public/brand"
raster() { # svg width height out
  local html; html="$(mktemp /tmp/brand-XXXXXX.html)"
  printf '<html><body style="margin:0;background:transparent"><img src="file://%s/%s" style="display:block;width:%spx;height:%spx"></body></html>' "$PWD" "$1" "$2" "$3" > "$html"
  agent-browser set viewport "$2" "$3" 1 >/dev/null
  agent-browser open "file://$html" >/dev/null
  agent-browser wait --load load >/dev/null
  agent-browser screenshot "$PWD/$4" >/dev/null
  rm -f "$html"
  echo "wrote $4"
}
raster favicon.svg 512 512 icon-512.png
raster favicon.svg 180 180 apple-touch-icon.png
raster og-image.svg 1200 630 og-image.png
