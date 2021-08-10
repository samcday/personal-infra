#!/bin/sh
eval $(/redis_env.py)

sed -i \
    -e s/__REDISHOST__/$REDIS_HOST/ \
    -e s/__REDISPORT__/$REDIS_PORT/ \
    -e s/__REDISPASS__/$REDIS_AUTH/ \
    -e s/__HMAC__/$HMAC/ \
    /src/nitter.conf

cat /src/nitter.conf

/src/nitter
