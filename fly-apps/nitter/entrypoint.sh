#!/bin/sh

sed -i \
    -e s/__HMAC__/$HMAC/ \
    /src/nitter.conf

/src/start.sh
