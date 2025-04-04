#!/bin/sh

# Replace the port in nginx config
sed -i "s/listen 8080/listen ${PORT:-8080}/g" /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;' 