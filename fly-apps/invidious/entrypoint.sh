#!/bin/sh

sed -i \
    -e s/__HMAC__/$HMAC/ \
    -e s#__DB__#$DATABASE_URL# \
    /invidious/config/config.yaml

/invidious/invidious
