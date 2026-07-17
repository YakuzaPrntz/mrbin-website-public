#!/bin/sh
# Cloudflare Pages build step.
# Replaces the __GOOGLE_MAPS_API_KEY__ token in main.js with the real key
# from the GOOGLE_MAPS_API_KEY environment variable set in Pages settings.
set -e
sed -i "s|__GOOGLE_MAPS_API_KEY__|${GOOGLE_MAPS_API_KEY:-}|" main.js
